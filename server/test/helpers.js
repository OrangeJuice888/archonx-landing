// Starts the app on an in-memory database and a random port; returns a tiny HTTP client.
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig, SERVER_DIR } from '../src/config.js'
import { openDb } from '../src/db.js'
import { loadDefaults } from '../src/content-schema.js'
import { createContentStore } from '../src/content.js'
import { bootstrapAdmins } from '../src/bootstrap.js'
import { createApp } from '../src/app.js'

export const DEFAULTS_PATH = resolve(SERVER_DIR, '../content/site-content.json')
export const ADMIN = { email: 'owner@example.com', password: 'correct-horse-battery' }
const quiet = { log() {}, warn() {}, error() {} }

export async function startTestServer({ env = {}, limiters = {}, bootstrap = true } = {}) {
  const config = loadConfig({
    NODE_ENV: 'development',
    SESSION_SECRET: 'test-session-secret-that-is-long-enough-0123456789',
    DATABASE_PATH: ':memory:',
    CONTENT_DEFAULTS_PATH: DEFAULTS_PATH,
    ADMIN_EMAIL: ADMIN.email,
    ADMIN_PASSWORD: ADMIN.password,
    ...env,
  })
  const db = openDb(':memory:')
  const content = createContentStore({ db, defaults: loadDefaults(config.contentDefaultsPath) })
  if (bootstrap) bootstrapAdmins(db, config, quiet)
  const uiDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '../admin-ui')
  const app = createApp({ db, config, content, uiDir, log() {}, errorLog() {}, limiters })
  const server = await new Promise((done) => { const s = app.listen(0, '127.0.0.1', () => done(s)) })
  const base = `http://127.0.0.1:${server.address().port}`
  const client = makeClient(base)
  return { db, config, content, server, base, ...client, close: () => new Promise((done) => server.close(done)) }
}

export function makeClient(base) {
  let cookie = ''
  async function request(method, path, { body, headers = {}, origin = base, raw = false, noCookie = false } = {}) {
    const h = { Accept: 'application/json', ...headers }
    if (body !== undefined) h['Content-Type'] = 'application/json'
    if (cookie && !noCookie) h.Cookie = cookie
    if (origin !== null && method !== 'GET' && method !== 'HEAD' && !('Origin' in h)) h.Origin = origin
    const res = await fetch(base + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'manual' })
    const set = res.headers.get('set-cookie')
    if (set) cookie = set.split(';')[0]
    if (raw) return res
    const text = await res.text()
    let json = null
    try { json = JSON.parse(text) } catch {}
    return { status: res.status, headers: res.headers, json, text }
  }
  const admin = (method, path, opts = {}) => request(method, path, { ...opts, headers: { 'X-Requested-With': 'ax-admin', ...(opts.headers || {}) } })
  return {
    request,
    admin,
    get: (path, opts) => request('GET', path, opts),
    cookie: () => cookie,
    setCookie: (c) => { cookie = c },
    login: (email = ADMIN.email, password = ADMIN.password) => admin('POST', '/api/admin/login', { body: { email, password } }),
  }
}
