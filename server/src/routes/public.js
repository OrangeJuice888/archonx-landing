// Public, credential-less routes: the live content, lead intake and the health check.
import { Router } from 'express'
import { createHmac } from 'node:crypto'
import { publicCors } from '../security.js'
import { nowIso } from '../db.js'

export const LEAD_KINDS = new Set(['booking', 'audit', 'other'])
const KEY_RE = /^[A-Za-z0-9_ .:/-]{1,64}$/
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const MAX_BODY_BYTES = 32 * 1024
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

/** Returns an error message, or null when the payload is acceptable. */
export function payloadProblem(value, depth = 0) {
  if (depth > 4) return 'payload nests too deeply'
  if (isPlain(value)) {
    const keys = Object.keys(value)
    if (keys.length > 100) return 'payload has too many fields'
    for (const key of keys) {
      if (FORBIDDEN_KEYS.has(key)) return `field name "${key}" is not allowed`
      if (!KEY_RE.test(key)) return `field name "${key.slice(0, 40)}" is not allowed`
      const problem = payloadProblem(value[key], depth + 1)
      if (problem) return problem
    }
    return null
  }
  if (Array.isArray(value)) {
    if (value.length > 100) return 'a list in the payload is too long'
    for (const item of value) { const problem = payloadProblem(item, depth + 1); if (problem) return problem }
    return null
  }
  if (typeof value === 'string') return value.length > 2000 ? 'a field is longer than 2,000 characters' : null
  if (typeof value === 'number') return Number.isFinite(value) ? null : 'a number is not finite'
  if (typeof value === 'boolean' || value === null) return null
  return 'unsupported value type'
}

const pick = (payload, key) => {
  const direct = payload[key]
  if (typeof direct === 'string') return direct.trim().slice(0, 200)
  const nested = isPlain(payload.contact) ? payload.contact[key] : undefined
  return typeof nested === 'string' ? nested.trim().slice(0, 200) : ''
}

export function summarise(payload) {
  return { name: pick(payload, 'name'), business: pick(payload, 'business'), email: pick(payload, 'email'), mobile: pick(payload, 'mobile') }
}

function isIsoDate(s) {
  return typeof s === 'string' && s.length <= 40 && !Number.isNaN(new Date(s).getTime())
}

async function notifyWebhook(config, lead, log) {
  if (!config.leadWebhookUrl) return
  try {
    const body = JSON.stringify(lead)
    const headers = { 'Content-Type': 'application/json' }
    if (config.leadWebhookSecret) headers['X-AX-Signature'] = 'sha256=' + createHmac('sha256', config.leadWebhookSecret).update(body).digest('hex')
    const res = await fetch(config.leadWebhookUrl, { method: 'POST', headers, body, redirect: 'error', signal: AbortSignal.timeout(5000) })
    if (!res.ok) log(`Lead webhook responded ${res.status}`)
  } catch (err) {
    log(`Lead webhook failed: ${err && err.message ? err.message : err}`)
  }
}

export function createPublicRouter({ db, config, content, hashIp, leadLimiter, log = console.error }) {
  const router = Router()
  router.use(['/api/content', '/api/leads'], publicCors())

  router.get('/healthz', (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    try {
      db.prepare('SELECT 1 AS ok').get()
      res.json({ ok: true })
    } catch {
      res.status(503).json({ ok: false })
    }
  })

  router.get('/api/content', (req, res) => {
    const c = content.current()
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.json({ content: c.content, version: c.version, updatedAt: c.updatedAt })
  })

  router.post('/api/leads', (req, res) => {
    const body = isPlain(req.body) ? req.body : null
    if (!body) return res.status(400).json({ error: 'Send a JSON object' })
    if (Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES) return res.status(413).json({ error: 'Lead is too large' })
    if (!LEAD_KINDS.has(body.kind)) return res.status(400).json({ error: 'kind must be booking, audit or other' })
    if (!isPlain(body.payload)) return res.status(400).json({ error: 'payload must be an object' })
    const problem = payloadProblem(body.payload)
    if (problem) return res.status(400).json({ error: problem })
    if (body.page !== undefined && (typeof body.page !== 'string' || body.page.length > 200)) return res.status(400).json({ error: 'page must be text of 200 characters or fewer' })
    if (body.submittedAt !== undefined && !isIsoDate(body.submittedAt)) return res.status(400).json({ error: 'submittedAt must be a date' })

    const ip = hashIp(req.ip)
    const limit = leadLimiter.hit(ip)
    if (!limit.allowed) { res.setHeader('Retry-After', String(limit.retryAfter)); return res.status(429).json({ error: 'Too many submissions. Please try again later.' }) }

    const at = nowIso()
    const summary = summarise(body.payload)
    const r = db.prepare('INSERT INTO leads (kind, payload_json, summary_json, page, status, notes, ip_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(body.kind, JSON.stringify(body.payload), JSON.stringify(summary), body.page ?? null, 'new', '', ip, at, at)
    const id = Number(r.lastInsertRowid)
    res.status(201).json({ id })
    void notifyWebhook(config, { id, kind: body.kind, page: body.page ?? null, submittedAt: body.submittedAt ?? at, receivedAt: at, payload: body.payload }, log)
  })

  return router
}
