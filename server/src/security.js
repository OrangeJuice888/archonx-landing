// Response headers, CORS for the public routes, the same-origin guard for admin writes,
// rate limiting, IP hashing, request logging and the error handler.
import { createHmac } from 'node:crypto'

export function securityHeaders({ production }) {
  return (req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'")
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Referrer-Policy', 'no-referrer')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    if (production) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    next()
  }
}

/** Public, credential-less routes: any origin may read content and post a lead. */
export function publicCors() {
  return (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept')
      res.setHeader('Access-Control-Max-Age', '600')
      res.status(204).end()
      return
    }
    next()
  }
}

export function noStore(req, res, next) {
  res.setHeader('Cache-Control', 'no-store')
  next()
}

/** Admin routes never take part in CORS: a preflight gets 405 and no Access-Control headers. */
export function rejectPreflight(req, res, next) {
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE'); res.status(405).end(); return }
  next()
}

/** Mutating admin requests must come from the admin's own origin with the custom header. */
export function sameOriginGuard(config) {
  return (req, res, next) => {
    if (req.method === 'GET' || req.method === 'HEAD') return next()
    if (req.get('x-requested-with') !== 'ax-admin') return res.status(403).json({ error: 'Missing X-Requested-With header' })
    const site = req.get('sec-fetch-site')
    if (site && site !== 'same-origin') return res.status(403).json({ error: 'Cross-site request refused' })
    const origin = req.get('origin')
    if (origin) {
      const expected = config.adminOrigin || `${req.protocol}://${req.get('host')}`
      if (origin.replace(/\/+$/, '').toLowerCase() !== expected.toLowerCase()) return res.status(403).json({ error: 'Origin mismatch' })
    }
    next()
  }
}

export class RateLimiter {
  constructor({ max, windowMs, now = Date.now }) {
    this.max = max
    this.windowMs = windowMs
    this.now = now
    this.buckets = new Map()
  }
  _bucket(key) {
    const t = this.now()
    let b = this.buckets.get(key)
    if (!b || t - b.start >= this.windowMs) { b = { start: t, count: 0 }; this.buckets.set(key, b) }
    if (this.buckets.size > 10000) for (const [k, v] of this.buckets) if (t - v.start >= this.windowMs) this.buckets.delete(k)
    return b
  }
  /** Counts one hit; returns { allowed, retryAfter (seconds) }. */
  hit(key) {
    const b = this._bucket(key)
    if (b.count >= this.max) return { allowed: false, retryAfter: Math.max(1, Math.ceil((b.start + this.windowMs - this.now()) / 1000)) }
    b.count++
    return { allowed: true, retryAfter: 0 }
  }
}

export function ipHasher(key) {
  return (ip) => createHmac('sha256', String(key)).update(String(ip ?? '')).digest('hex').slice(0, 32)
}

/** One line per request: time, method, path, status, duration. No bodies, cookies or query strings. */
export function requestLogger(log = console.log) {
  return (req, res, next) => {
    if (req.path === '/healthz') return next()
    const start = process.hrtime.bigint()
    res.on('finish', () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6
      log(`${new Date().toISOString()} ${req.method} ${req.path} ${res.statusCode} ${ms.toFixed(1)}ms`)
    })
    next()
  }
}

export function errorHandler(log = console.error) {
  // eslint-disable-next-line no-unused-vars
  return (err, req, res, next) => {
    if (err && err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' })
    if (err && (err.type === 'entity.parse.failed' || err.type === 'charset.unsupported' || err.type === 'encoding.unsupported')) return res.status(400).json({ error: 'Invalid JSON body' })
    log(err && err.stack ? err.stack : String(err))
    if (res.headersSent) return
    res.status(500).json({ error: 'Server error' })
  }
}
