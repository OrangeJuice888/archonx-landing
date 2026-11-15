// Admin API: same-origin only, cookie session, JSON. Mounted at /api/admin.
import { Router } from 'express'
import { mkdtempSync, rmSync, createReadStream } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as auth from '../auth.js'
import { audit, listAudit, likeEscape, nowIso, backupTo } from '../db.js'
import { noStore, rejectPreflight, sameOriginGuard } from '../security.js'
import { validateContent, contentWarnings, diffPaths } from '../content-schema.js'

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'not-yet']
const LEAD_KINDS = ['booking', 'audit', 'other']
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const str = (v, max = 500) => (typeof v === 'string' ? v.slice(0, max) : '')

function parseId(raw) {
  const n = Number(raw)
  return Number.isInteger(n) && n > 0 && n < 1e12 ? n : null
}

function csvCell(value) {
  let s = value === null || value === undefined ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value)
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}

function flatten(obj, prefix, out) {
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    const v = obj[key]
    if (isPlain(v)) flatten(v, path, out)
    else out[path] = Array.isArray(v) ? v.map((x) => (isPlain(x) ? JSON.stringify(x) : String(x))).join('; ') : v
  }
  return out
}

export function createAdminRouter({ db, config, content, hashIp, loginLimiter, log = console.error }) {
  const router = Router()
  const cookieOpts = { maxAgeSec: Math.floor(config.sessionTtlMs / 1000), secure: config.production }
  router.use(noStore, rejectPreflight, sameOriginGuard(config))

  const sessionOf = (req) => auth.readSession(db, auth.parseCookies(req.get('cookie'))[auth.COOKIE_NAME], config.sessionSecret)
  const requireSession = (req, res, next) => {
    const s = sessionOf(req)
    if (!s) return res.status(401).json({ error: 'Not signed in' })
    req.admin = s.admin
    req.sessionId = s.sessionId
    next()
  }
  const requirePasswordChanged = (req, res, next) => {
    if (req.admin.mustChangePassword) return res.status(403).json({ error: 'password_change_required' })
    next()
  }

  /* ---------- sign in / out ---------- */

  router.post('/login', async (req, res, next) => {
    try {
      const body = isPlain(req.body) ? req.body : {}
      const email = auth.normaliseEmail(body.email)
      const password = typeof body.password === 'string' ? body.password : ''
      const ip = hashIp(req.ip)
      const blocked = loginLimiter.ipBlockedFor(ip)
      if (blocked) { res.setHeader('Retry-After', String(blocked)); return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' }) }
      if (!email || email.length > 254 || !password || password.length > auth.PASSWORD_MAX) {
        loginLimiter.recordFailure(ip, email || '-')
        audit(db, email || null, 'login_failed', { ip })
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      const result = await loginLimiter.serialise(email, async () => {
        const delay = loginLimiter.emailDelayMs(email)
        if (delay) await sleep(delay)
        const admin = db.prepare('SELECT id, email, password_hash AS hash, must_change_password AS mcp FROM admins WHERE email = ?').get(email)
        const ok = auth.verifyPassword(password, admin ? admin.hash : auth.DUMMY_HASH) && Boolean(admin)
        return { ok, admin }
      })
      if (!result.ok) {
        loginLimiter.recordFailure(ip, email)
        audit(db, email, 'login_failed', { ip })
        return res.status(401).json({ error: 'Invalid email or password' })
      }
      loginLimiter.recordSuccess(ip, email)
      auth.deleteExpiredSessions(db)
      db.prepare('UPDATE admins SET last_login_at = ? WHERE id = ?').run(nowIso(), result.admin.id)
      const cookie = auth.createSession(db, result.admin.id, { secret: config.sessionSecret, ttlMs: config.sessionTtlMs, ipHash: ip, userAgent: req.get('user-agent') })
      res.setHeader('Set-Cookie', auth.sessionCookie(cookie, cookieOpts))
      audit(db, result.admin.email, 'login_ok', { ip })
      res.json({ ok: true, email: result.admin.email, mustChangePassword: Boolean(result.admin.mcp) })
    } catch (err) { next(err) }
  })

  router.post('/logout', requireSession, (req, res) => {
    auth.deleteSession(db, req.sessionId)
    res.setHeader('Set-Cookie', auth.clearedSessionCookie(cookieOpts))
    audit(db, req.admin.email, 'logout')
    res.json({ ok: true })
  })

  router.get('/me', requireSession, (req, res) => {
    res.json({ email: req.admin.email, lastLoginAt: req.admin.lastLoginAt, mustChangePassword: req.admin.mustChangePassword })
  })

  router.post('/password', requireSession, (req, res) => {
    const body = isPlain(req.body) ? req.body : {}
    const current = typeof body.currentPassword === 'string' ? body.currentPassword : ''
    const next = typeof body.newPassword === 'string' ? body.newPassword : ''
    const row = db.prepare('SELECT password_hash AS hash FROM admins WHERE id = ?').get(req.admin.id)
    if (!row || !auth.verifyPassword(current, row.hash)) return res.status(400).json({ errors: [{ path: 'currentPassword', message: 'Current password is wrong' }] })
    const problem = auth.passwordProblem(next, req.admin.email)
    if (problem) return res.status(400).json({ errors: [{ path: 'newPassword', message: problem }] })
    if (next === current) return res.status(400).json({ errors: [{ path: 'newPassword', message: 'Choose a different password' }] })
    db.prepare('UPDATE admins SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(auth.hashPassword(next), req.admin.id)
    auth.deleteAdminSessions(db, req.admin.id, req.sessionId)
    audit(db, req.admin.email, 'password_changed')
    res.json({ ok: true })
  })

  // Everything below needs a session whose password has been set by the admin.
  router.use(requireSession, requirePasswordChanged)

  /* ---------- content ---------- */

  router.get('/content', (req, res) => {
    const c = content.current()
    res.json({ content: c.content, version: c.version, updatedAt: c.updatedAt, updatedBy: c.updatedBy })
  })

  router.put('/content', (req, res) => {
    const body = isPlain(req.body) ? req.body : {}
    const cur = content.current()
    if (body.expectedVersion !== cur.version) return res.status(409).json({ error: 'Content changed since you loaded it', version: cur.version })
    const { ok, errors, value } = validateContent(body.content, content.defaults)
    if (!ok) return res.status(400).json({ errors })
    const changed = diffPaths(cur.content, value)
    const warnings = contentWarnings(value)
    if (changed.length === 0) return res.json({ version: cur.version, updatedAt: cur.updatedAt, warnings, changed, unchanged: true })
    const summary = str(body.summary, 200).trim() || `Changed ${changed.length} field${changed.length === 1 ? '' : 's'}: ${changed.slice(0, 6).join(', ')}${changed.length > 6 ? ', …' : ''}`
    const saved = content.save(value, req.admin.email, summary)
    audit(db, req.admin.email, 'content_saved', { version: saved.version, paths: changed })
    res.json({ version: saved.version, updatedAt: saved.updatedAt, warnings, changed })
  })

  router.get('/content/versions', (req, res) => {
    res.json(content.listVersions(50))
  })

  router.get('/content/export', (req, res) => {
    const c = content.current()
    res.setHeader('Content-Disposition', 'attachment; filename="site-content.json"')
    res.type('application/json').send(JSON.stringify(c.content, null, 2) + '\n')
  })

  router.get('/content/drift', (req, res) => {
    const c = content.current()
    res.json({ behind: diffPaths(content.defaults, c.content), version: c.version })
  })

  router.get('/content/versions/:v', (req, res) => {
    const v = parseId(req.params.v)
    const row = v && content.getVersion(v)
    if (!row) return res.status(404).json({ error: 'No such version' })
    res.json(row)
  })

  router.post('/content/versions/:v/restore', (req, res) => {
    const v = parseId(req.params.v)
    const row = v && content.getVersion(v)
    if (!row) return res.status(404).json({ error: 'No such version' })
    const { ok, errors, value } = validateContent(row.content, content.defaults)
    if (!ok) return res.status(400).json({ errors })
    const cur = content.current()
    const changed = diffPaths(cur.content, value)
    const saved = content.save(value, req.admin.email, `Restored version ${v}`)
    audit(db, req.admin.email, 'content_restored', { from: v, version: saved.version, paths: changed })
    res.json({ version: saved.version, updatedAt: saved.updatedAt, warnings: contentWarnings(value), changed })
  })

  /* ---------- leads ---------- */

  function leadFilters(query) {
    const where = []
    const params = []
    if (LEAD_STATUSES.includes(query.status)) { where.push('status = ?'); params.push(query.status) }
    if (LEAD_KINDS.includes(query.kind)) { where.push('kind = ?'); params.push(query.kind) }
    const q = typeof query.q === 'string' ? query.q.trim().slice(0, 100) : ''
    if (q) { where.push("(summary_json LIKE ? ESCAPE '\\' OR payload_json LIKE ? ESCAPE '\\' OR notes LIKE ? ESCAPE '\\')"); const like = '%' + likeEscape(q) + '%'; params.push(like, like, like) }
    return { sql: where.length ? ' WHERE ' + where.join(' AND ') : '', params }
  }

  const rowToItem = (r) => ({ id: r.id, kind: r.kind, status: r.status, createdAt: r.createdAt, updatedAt: r.updatedAt, page: r.page, summary: JSON.parse(r.summary) })

  router.get('/leads', (req, res) => {
    const { sql, params } = leadFilters(req.query)
    const limitRaw = Number.parseInt(req.query.limit, 10)
    const offsetRaw = Number.parseInt(req.query.offset, 10)
    const limit = Number.isInteger(limitRaw) ? Math.min(200, Math.max(1, limitRaw)) : 50
    const offset = Number.isInteger(offsetRaw) && offsetRaw >= 0 ? offsetRaw : 0
    const items = db.prepare(`SELECT id, kind, status, created_at AS createdAt, updated_at AS updatedAt, page, summary_json AS summary FROM leads${sql} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset).map(rowToItem)
    const total = db.prepare(`SELECT COUNT(*) AS n FROM leads${sql}`).get(...params).n
    const newCount = db.prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'").get().n
    res.json({ items, total, newCount, limit, offset })
  })

  router.get('/leads/export.csv', (req, res) => {
    const { sql, params } = leadFilters(req.query)
    const rows = db.prepare(`SELECT id, kind, status, created_at AS createdAt, updated_at AS updatedAt, page, notes, payload_json AS payload FROM leads${sql} ORDER BY id DESC LIMIT 5000`).all(...params)
    const flat = rows.map((r) => ({ base: r, fields: flatten(JSON.parse(r.payload), '', {}) }))
    const keys = [...new Set(flat.flatMap((f) => Object.keys(f.fields)))].sort()
    const header = ['id', 'kind', 'status', 'received', 'updated', 'page', 'notes', ...keys]
    const lines = [header.map(csvCell).join(',')]
    for (const f of flat) {
      const b = f.base
      lines.push([b.id, b.kind, b.status, b.createdAt, b.updatedAt, b.page, b.notes, ...keys.map((k) => f.fields[k])].map(csvCell).join(','))
    }
    res.setHeader('Content-Disposition', `attachment; filename="archonx-leads-${nowIso().slice(0, 10)}.csv"`)
    res.type('text/csv').send('﻿' + lines.join('\r\n') + '\r\n')
  })

  router.get('/leads/:id', (req, res) => {
    const id = parseId(req.params.id)
    const r = id && db.prepare('SELECT id, kind, status, notes, page, created_at AS createdAt, updated_at AS updatedAt, payload_json AS payload, summary_json AS summary FROM leads WHERE id = ?').get(id)
    if (!r) return res.status(404).json({ error: 'No such lead' })
    res.json({ id: r.id, kind: r.kind, status: r.status, notes: r.notes, page: r.page, createdAt: r.createdAt, updatedAt: r.updatedAt, payload: JSON.parse(r.payload), summary: JSON.parse(r.summary) })
  })

  router.patch('/leads/:id', (req, res) => {
    const id = parseId(req.params.id)
    const body = isPlain(req.body) ? req.body : {}
    const r = id && db.prepare('SELECT id, status FROM leads WHERE id = ?').get(id)
    if (!r) return res.status(404).json({ error: 'No such lead' })
    const errors = []
    if (body.status !== undefined && !LEAD_STATUSES.includes(body.status)) errors.push({ path: 'status', message: 'Unknown status' })
    if (body.notes !== undefined && (typeof body.notes !== 'string' || body.notes.length > 5000)) errors.push({ path: 'notes', message: 'Notes must be text of 5,000 characters or fewer' })
    if (errors.length) return res.status(400).json({ errors })
    const status = body.status ?? r.status
    const at = nowIso()
    if (body.notes !== undefined) db.prepare('UPDATE leads SET status = ?, notes = ?, updated_at = ? WHERE id = ?').run(status, body.notes, at, id)
    else db.prepare('UPDATE leads SET status = ?, updated_at = ? WHERE id = ?').run(status, at, id)
    if (status !== r.status) audit(db, req.admin.email, 'lead_status', { id, from: r.status, to: status })
    res.json({ ok: true, id, status, updatedAt: at })
  })

  router.delete('/leads/:id', (req, res) => {
    const id = parseId(req.params.id)
    const r = id && db.prepare('DELETE FROM leads WHERE id = ?').run(id)
    if (!r || r.changes === 0) return res.status(404).json({ error: 'No such lead' })
    audit(db, req.admin.email, 'lead_deleted', { id })
    res.json({ ok: true })
  })

  /* ---------- backup, activity, logins ---------- */

  router.get('/backup', (req, res, next) => {
    const dir = mkdtempSync(join(tmpdir(), 'ax-backup-'))
    const file = join(dir, 'backup.sqlite')
    const cleanup = () => { try { rmSync(dir, { recursive: true, force: true }) } catch {} }
    try {
      backupTo(db, file)
      audit(db, req.admin.email, 'backup_downloaded')
      res.setHeader('Content-Disposition', `attachment; filename="archonx-backup-${nowIso().slice(0, 10)}.sqlite"`)
      res.type('application/vnd.sqlite3')
      const stream = createReadStream(file)
      stream.on('close', cleanup)
      stream.on('error', (err) => { cleanup(); next(err) })
      stream.pipe(res)
    } catch (err) { cleanup(); next(err) }
  })

  router.get('/audit-log', (req, res) => {
    const n = Number.parseInt(req.query.limit, 10)
    const limit = Number.isInteger(n) ? Math.min(500, Math.max(1, n)) : 100
    res.json(listAudit(db, limit))
  })

  router.get('/admins', (req, res) => {
    res.json(db.prepare('SELECT email, created_at AS createdAt, last_login_at AS lastLoginAt, must_change_password AS mustChangePassword FROM admins ORDER BY id').all().map((a) => ({ ...a, mustChangePassword: Boolean(a.mustChangePassword) })))
  })

  router.post('/admins', (req, res) => {
    const body = isPlain(req.body) ? req.body : {}
    const email = auth.normaliseEmail(body.email)
    const errors = []
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) errors.push({ path: 'email', message: 'Enter a valid email address' })
    const problem = auth.passwordProblem(body.temporaryPassword, email)
    if (problem) errors.push({ path: 'temporaryPassword', message: problem })
    if (errors.length) return res.status(400).json({ errors })
    if (db.prepare('SELECT id FROM admins WHERE email = ?').get(email)) return res.status(400).json({ errors: [{ path: 'email', message: 'That login already exists' }] })
    db.prepare('INSERT INTO admins (email, password_hash, must_change_password, created_at) VALUES (?, ?, 1, ?)').run(email, auth.hashPassword(body.temporaryPassword), nowIso())
    audit(db, req.admin.email, 'admin_added', { email })
    res.status(201).json({ ok: true, email })
  })

  router.post('/sessions/revoke-all', (req, res) => {
    db.prepare('DELETE FROM sessions').run()
    res.setHeader('Set-Cookie', auth.clearedSessionCookie(cookieOpts))
    audit(db, req.admin.email, 'sessions_revoked')
    res.json({ ok: true })
  })

  return router
}
