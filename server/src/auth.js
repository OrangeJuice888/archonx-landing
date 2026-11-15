// Passwords (scrypt), sessions (signed random ids, hashed at rest) and the login limiter.
import { scryptSync, randomBytes, timingSafeEqual, createHmac, createHash } from 'node:crypto'
import { nowIso } from './db.js'

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64, maxmem: 64 * 1024 * 1024 }
export const PASSWORD_MIN = 12
export const PASSWORD_MAX = 128
export const COOKIE_NAME = 'ax_admin'

const b64url = (buf) => Buffer.from(buf).toString('base64url')

export function normaliseEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

export function passwordProblem(password, email) {
  if (typeof password !== 'string') return 'Password must be text.'
  if (password.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters.`
  if (password.length > PASSWORD_MAX) return `Password must be ${PASSWORD_MAX} characters or fewer.`
  if (email && password.toLowerCase() === normaliseEmail(email)) return 'Password must not be the email address.'
  return null
}

export function hashPassword(password) {
  const salt = randomBytes(16)
  const key = scryptSync(String(password), salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p, maxmem: SCRYPT.maxmem })
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, b64url(salt), b64url(key)].join('$')
}

export function verifyPassword(password, stored) {
  try {
    const [alg, N, r, p, salt, hash] = String(stored).split('$')
    if (alg !== 'scrypt') return false
    const expected = Buffer.from(hash, 'base64url')
    const n = Number(N), rr = Number(r), pp = Number(p)
    const maxmem = Math.max(SCRYPT.maxmem, 128 * n * rr * 2)
    const key = scryptSync(String(password), Buffer.from(salt, 'base64url'), expected.length, { N: n, r: rr, p: pp, maxmem })
    return key.length === expected.length && timingSafeEqual(key, expected)
  } catch {
    return false
  }
}

/** Verified against when the email is unknown, so both paths take the same time. */
export const DUMMY_HASH = hashPassword('dummy-password-for-timing-only')

/* ---------- sessions ---------- */

export function newSessionId() {
  return b64url(randomBytes(32))
}

export function signSessionId(id, secret) {
  return id + '.' + b64url(createHmac('sha256', secret).update(id).digest())
}

/** Returns the raw session id when the cookie value carries a valid signature, else null. */
export function verifySessionCookie(value, secret) {
  if (typeof value !== 'string') return null
  const dot = value.indexOf('.')
  if (dot <= 0) return null
  const id = value.slice(0, dot)
  const mac = value.slice(dot + 1)
  if (!/^[A-Za-z0-9_-]{43}$/.test(id)) return null
  const expected = createHmac('sha256', secret).update(id).digest()
  let given
  try { given = Buffer.from(mac, 'base64url') } catch { return null }
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null
  return id
}

export function sessionKey(id) {
  return createHash('sha256').update(id).digest('hex')
}

export function parseCookies(header) {
  const out = Object.create(null)
  if (!header) return out
  for (const part of String(header).split(';')) {
    const i = part.indexOf('=')
    if (i < 0) continue
    const name = part.slice(0, i).trim()
    if (!name) continue
    out[name] = part.slice(i + 1).trim()
  }
  return out
}

export function sessionCookie(value, { maxAgeSec, secure }) {
  return `${COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}` + (secure ? '; Secure' : '')
}

export function clearedSessionCookie({ secure }) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0` + (secure ? '; Secure' : '')
}

export function createSession(db, adminId, { secret, ttlMs, ipHash, userAgent }) {
  const id = newSessionId()
  const expires = new Date(Date.now() + ttlMs).toISOString()
  db.prepare('INSERT INTO sessions (id, admin_id, expires_at, created_at, ip_hash, user_agent) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sessionKey(id), adminId, expires, nowIso(), ipHash ?? null, (userAgent ?? '').slice(0, 300))
  return signSessionId(id, secret)
}

/** Looks the cookie up; returns { admin, sessionId } or null. Expired sessions are removed. */
export function readSession(db, cookieValue, secret) {
  const id = verifySessionCookie(cookieValue, secret)
  if (!id) return null
  const key = sessionKey(id)
  const row = db.prepare(`SELECT s.id AS sid, s.expires_at AS expiresAt, a.id, a.email, a.must_change_password AS mustChangePassword, a.last_login_at AS lastLoginAt
    FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id = ?`).get(key)
  if (!row) return null
  if (row.expiresAt <= nowIso()) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(key)
    return null
  }
  return { sessionId: key, admin: { id: row.id, email: row.email, mustChangePassword: Boolean(row.mustChangePassword), lastLoginAt: row.lastLoginAt } }
}

export function deleteSession(db, sessionId) {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
}

export function deleteAdminSessions(db, adminId, exceptSessionId = null) {
  if (exceptSessionId) db.prepare('DELETE FROM sessions WHERE admin_id = ? AND id <> ?').run(adminId, exceptSessionId)
  else db.prepare('DELETE FROM sessions WHERE admin_id = ?').run(adminId)
}

export function deleteExpiredSessions(db) {
  return db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso()).changes
}

/* ---------- login limiter ---------- */

/** Delay before verifying the n-th attempt for one email after 5 failures: 1, 2, 4 … capped at 30 seconds. */
export function delayForFailures(n) {
  return n >= 5 ? Math.min(2 ** (n - 5), 30) * 1000 : 0
}

export class LoginLimiter {
  constructor({ ipMax = 5, windowMs = 15 * 60 * 1000, now = Date.now } = {}) {
    this.ipMax = ipMax
    this.windowMs = windowMs
    this.now = now
    this.ip = new Map()
    this.email = new Map()
    this.queues = new Map()
  }
  _bucket(map, key) {
    const t = this.now()
    let b = map.get(key)
    if (!b || t - b.start >= this.windowMs) { b = { start: t, count: 0 }; map.set(key, b) }
    if (map.size > 10000) for (const [k, v] of map) if (t - v.start >= this.windowMs) map.delete(k)
    return b
  }
  /** Seconds the IP must wait, or 0. */
  ipBlockedFor(ip) {
    const b = this._bucket(this.ip, ip)
    if (b.count < this.ipMax) return 0
    return Math.max(1, Math.ceil((b.start + this.windowMs - this.now()) / 1000))
  }
  emailDelayMs(email) {
    return delayForFailures(this._bucket(this.email, email).count)
  }
  recordFailure(ip, email) {
    this._bucket(this.ip, ip).count++
    this._bucket(this.email, email).count++
  }
  recordSuccess(ip, email) {
    this.email.delete(email)
  }
  /** Runs fn after any earlier attempt for the same email has finished. */
  serialise(email, fn) {
    const prev = this.queues.get(email) || Promise.resolve()
    const run = prev.catch(() => {}).then(fn)
    this.queues.set(email, run)
    run.finally(() => { if (this.queues.get(email) === run) this.queues.delete(email) })
    return run
  }
}
