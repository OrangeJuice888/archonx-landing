import { test } from 'node:test'
import assert from 'node:assert/strict'
import { startTestServer, makeClient, ADMIN } from './helpers.js'
import { RateLimiter } from '../src/security.js'

const NEW_PASSWORD = 'a brand new passphrase'

async function signInAndSetPassword(s) {
  const login = await s.login()
  assert.equal(login.status, 200)
  assert.equal(login.json.mustChangePassword, true)
  const changed = await s.admin('POST', '/api/admin/password', { body: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD } })
  assert.equal(changed.status, 200)
}

test('public routes: health, content, CORS and preflight', async () => {
  const s = await startTestServer()
  try {
    const health = await s.get('/healthz')
    assert.equal(health.status, 200)
    assert.deepEqual(health.json, { ok: true })

    const content = await s.get('/api/content')
    assert.equal(content.status, 200)
    assert.equal(content.headers.get('access-control-allow-origin'), '*')
    assert.equal(content.headers.get('cache-control'), 'public, max-age=60')
    assert.equal(content.json.content.pricing.packs.front.monthly, 400)
    assert.equal(content.json.version, 1)
    assert.equal(content.headers.get('content-security-policy').startsWith("default-src 'self'"), true)
    assert.equal(content.headers.get('x-frame-options'), 'DENY')
    assert.equal(content.headers.get('x-content-type-options'), 'nosniff')

    const pre = await s.request('OPTIONS', '/api/leads', { headers: { Origin: 'https://archonx.ai', 'Access-Control-Request-Method': 'POST' } })
    assert.equal(pre.status, 204)
    assert.equal(pre.headers.get('access-control-allow-origin'), '*')
    assert.equal(pre.headers.get('access-control-allow-methods'), 'GET, POST')
    assert.match(pre.headers.get('access-control-allow-headers'), /Content-Type/)

    const adminPre = await s.request('OPTIONS', '/api/admin/content', { headers: { Origin: 'https://archonx.ai' } })
    assert.equal(adminPre.status, 405)
    assert.equal(adminPre.headers.get('access-control-allow-origin'), null)

    const root = await s.request('GET', '/', { raw: true })
    assert.equal(root.status, 302)
    assert.equal(root.headers.get('location'), '/admin')
    const adminPage = await s.request('GET', '/admin', { raw: true })
    assert.equal(adminPage.status, 302)
    assert.equal(adminPage.headers.get('location'), '/admin/login')
    const loginPage = await s.request('GET', '/admin/login', { raw: true })
    assert.ok([200, 404].includes(loginPage.status), 'login page served (404 only while the UI files are missing)')
    assert.equal(loginPage.headers.get('cache-control'), 'no-store')
  } finally { await s.close() }
})

test('leads: validation, storage, rate limit', async () => {
  const s = await startTestServer({ limiters: { leads: new RateLimiter({ max: 2, windowMs: 60_000 }) } })
  try {
    const bad = await s.request('POST', '/api/leads', { body: { kind: 'nope', payload: {} }, origin: null })
    assert.equal(bad.status, 400)
    const deep = await s.request('POST', '/api/leads', { body: { kind: 'other', payload: { a: { b: { c: { d: { e: { f: 1 } } } } } } }, origin: null })
    assert.equal(deep.status, 400)
    assert.match(deep.json.error, /deeply/)
    const proto = await s.request('POST', '/api/leads', { body: JSON.parse('{"kind":"other","payload":{"__proto__":{"x":1}}}'), origin: null })
    assert.equal(proto.status, 400)
    const badKey = await s.request('POST', '/api/leads', { body: { kind: 'other', payload: { '<script>': 'x' } }, origin: null })
    assert.equal(badKey.status, 400)
    const longStr = await s.request('POST', '/api/leads', { body: { kind: 'other', payload: { note: 'x'.repeat(2001) } }, origin: null })
    assert.equal(longStr.status, 400)

    const ok = await s.request('POST', '/api/leads', { body: { kind: 'booking', payload: { name: 'Sam Lee', business: 'Lee Plumbing', email: 'sam@example.com', mobile: '0412345678', team: '2-5' }, page: '/consultation/', submittedAt: new Date().toISOString() }, origin: null })
    assert.equal(ok.status, 201)
    assert.equal(ok.headers.get('access-control-allow-origin'), '*')
    assert.equal(typeof ok.json.id, 'number')
    const second = await s.request('POST', '/api/leads', { body: { kind: 'audit', payload: { contact: { name: 'Ava', business: 'Ava Dental', email: 'ava@example.com', mobile: '0400000000' }, fit: 'ok' } }, origin: null })
    assert.equal(second.status, 201)
    const third = await s.request('POST', '/api/leads', { body: { kind: 'other', payload: {} }, origin: null })
    assert.equal(third.status, 429)
    assert.ok(Number(third.headers.get('retry-after')) > 0)

    const row = s.db.prepare('SELECT summary_json AS s, ip_hash AS ip FROM leads WHERE id = ?').get(second.json.id)
    assert.deepEqual(JSON.parse(row.s), { name: 'Ava', business: 'Ava Dental', email: 'ava@example.com', mobile: '0400000000' })
    assert.match(row.ip, /^[0-9a-f]{32}$/)
  } finally { await s.close() }
})

test('login: same message for unknown email and wrong password, header required, cookie flags, per-IP block', async () => {
  const s = await startTestServer()
  try {
    const noHeader = await s.request('POST', '/api/admin/login', { body: { email: ADMIN.email, password: ADMIN.password } })
    assert.equal(noHeader.status, 403)
    const wrong = await s.login(ADMIN.email, 'not-the-password')
    assert.equal(wrong.status, 401)
    const unknown = await s.login('nobody@example.com', 'not-the-password')
    assert.equal(unknown.status, 401)
    assert.equal(wrong.json.error, unknown.json.error)
    assert.equal(s.cookie(), '')

    const ok = await s.login()
    assert.equal(ok.status, 200)
    assert.equal(ok.json.email, ADMIN.email)
    assert.equal(ok.json.mustChangePassword, true)
    assert.match(s.cookie(), /^ax_admin=[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]+$/)
    const rawLogin = await s.request('POST', '/api/admin/login', { body: { email: 'OWNER@example.com ', password: ADMIN.password }, headers: { 'X-Requested-With': 'ax-admin' }, raw: true })
    const setCookie = rawLogin.headers.get('set-cookie')
    assert.match(setCookie, /HttpOnly/)
    assert.match(setCookie, /SameSite=Lax/)
    assert.match(setCookie, /Path=\//)
    assert.doesNotMatch(setCookie, /Secure/)

    const me = await s.get('/api/admin/me')
    assert.equal(me.status, 200)
    assert.equal(me.headers.get('cache-control'), 'no-store')
    assert.equal(me.json.mustChangePassword, true)
    const gated = await s.get('/api/admin/content')
    assert.equal(gated.status, 403)
    assert.equal(gated.json.error, 'password_change_required')

    const crossSite = await s.admin('POST', '/api/admin/password', { body: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD }, headers: { Origin: 'https://evil.example' } })
    assert.equal(crossSite.status, 403)
    const fetchSite = await s.admin('POST', '/api/admin/password', { body: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD }, headers: { 'Sec-Fetch-Site': 'cross-site' } })
    assert.equal(fetchSite.status, 403)

    const wrongCurrent = await s.admin('POST', '/api/admin/password', { body: { currentPassword: 'nope-nope-nope', newPassword: NEW_PASSWORD } })
    assert.equal(wrongCurrent.status, 400)
    const tooShort = await s.admin('POST', '/api/admin/password', { body: { currentPassword: ADMIN.password, newPassword: 'short' } })
    assert.equal(tooShort.status, 400)
    const changed = await s.admin('POST', '/api/admin/password', { body: { currentPassword: ADMIN.password, newPassword: NEW_PASSWORD } })
    assert.equal(changed.status, 200)
    const after = await s.get('/api/admin/content')
    assert.equal(after.status, 200)

    // Two failures were recorded above for this IP; three more reach the limit of five.
    const other = makeClient(s.base)
    for (let i = 0; i < 5; i++) {
      const r = await other.login(`u${i}@example.com`, 'wrong-password-here')
      assert.equal(r.status, i < 3 ? 401 : 429)
    }
    const blocked = await other.login(ADMIN.email, NEW_PASSWORD)
    assert.equal(blocked.status, 429)
    assert.ok(Number(blocked.headers.get('retry-after')) > 0)
  } finally { await s.close() }
})

test('content editing: validation, versions, restore, export, drift, audit', async () => {
  const s = await startTestServer()
  try {
    await signInAndSetPassword(s)
    const cur = await s.get('/api/admin/content')
    assert.equal(cur.json.version, 1)
    const edited = JSON.parse(JSON.stringify(cur.json.content))
    edited.pricing.packs.front.monthly = 500

    const noHeader = await s.request('PUT', '/api/admin/content', { body: { content: edited, expectedVersion: 1 } })
    assert.equal(noHeader.status, 403)
    const stale = await s.admin('PUT', '/api/admin/content', { body: { content: edited, expectedVersion: 7 } })
    assert.equal(stale.status, 409)
    assert.equal(stale.json.version, 1)
    const invalid = JSON.parse(JSON.stringify(edited)); invalid.pricing.packs.front.setup = -5; invalid.text.opening = 'x<y'
    const bad = await s.admin('PUT', '/api/admin/content', { body: { content: invalid, expectedVersion: 1 } })
    assert.equal(bad.status, 400)
    assert.equal(bad.json.errors.length, 2)

    const saved = await s.admin('PUT', '/api/admin/content', { body: { content: edited, expectedVersion: 1 } })
    assert.equal(saved.status, 200)
    assert.equal(saved.json.version, 2)
    assert.deepEqual(saved.json.warnings, [])
    assert.deepEqual(saved.json.changed, ['pricing.packs.front.monthly'])
    const live = await s.get('/api/content')
    assert.equal(live.json.content.pricing.packs.front.monthly, 500)
    assert.equal(live.json.version, 2)

    const unchanged = await s.admin('PUT', '/api/admin/content', { body: { content: edited, expectedVersion: 2 } })
    assert.equal(unchanged.status, 200)
    assert.equal(unchanged.json.unchanged, true)
    assert.equal(unchanged.json.version, 2)

    const warned = JSON.parse(JSON.stringify(edited)); warned.pricing.packs.front.monthly = 450
    const w = await s.admin('PUT', '/api/admin/content', { body: { content: warned, expectedVersion: 2, summary: 'try 450' } })
    assert.equal(w.status, 200)
    assert.equal(w.json.version, 3)
    assert.match(w.json.warnings.join('\n'), /end in 00/)

    const drift = await s.get('/api/admin/content/drift')
    assert.deepEqual(drift.json.behind, ['pricing.packs.front.monthly'])

    const versions = await s.get('/api/admin/content/versions')
    assert.equal(versions.json.length, 3)
    assert.equal(versions.json[0].version, 3)
    assert.equal(versions.json[0].summary, 'try 450')
    assert.equal(versions.json[0].createdBy, ADMIN.email)
    const v1 = await s.get('/api/admin/content/versions/1')
    assert.equal(v1.json.content.pricing.packs.front.monthly, 400)
    const missing = await s.get('/api/admin/content/versions/99')
    assert.equal(missing.status, 404)

    const restored = await s.admin('POST', '/api/admin/content/versions/1/restore')
    assert.equal(restored.status, 200)
    assert.equal(restored.json.version, 4)
    const back = await s.get('/api/content')
    assert.equal(back.json.content.pricing.packs.front.monthly, 400)
    const drift2 = await s.get('/api/admin/content/drift')
    assert.deepEqual(drift2.json.behind, [])

    const exp = await s.get('/api/admin/content/export')
    assert.equal(exp.status, 200)
    assert.match(exp.headers.get('content-disposition'), /attachment; filename="site-content.json"/)
    assert.equal(JSON.parse(exp.text).pricing.packs.front.monthly, 400)

    const log = await s.get('/api/admin/audit-log')
    const actions = log.json.map((r) => r.action)
    for (const a of ['login_ok', 'password_changed', 'content_saved', 'content_restored']) assert.ok(actions.includes(a), a)
    assert.ok(!log.json.some((r) => r.detail.includes(NEW_PASSWORD)))
  } finally { await s.close() }
})

test('leads admin: list, detail, status, csv, delete, backup, extra logins, logout', async () => {
  const s = await startTestServer()
  try {
    await s.request('POST', '/api/leads', { body: { kind: 'booking', payload: { name: 'Sam Lee', business: '=cmd()', email: 'sam@example.com', mobile: '0412345678', jobs: ['quotes', 'reviews'] } }, origin: null })
    await s.request('POST', '/api/leads', { body: { kind: 'audit', payload: { name: 'Ava', business: 'Ava Dental', email: 'ava@example.com', mobile: '0400000000' } }, origin: null })
    const anon = await s.get('/api/admin/leads')
    assert.equal(anon.status, 401)

    await signInAndSetPassword(s)
    const list = await s.get('/api/admin/leads')
    assert.equal(list.status, 200)
    assert.equal(list.json.total, 2)
    assert.equal(list.json.newCount, 2)
    assert.equal(list.json.items[0].summary.name, 'Ava')
    const filtered = await s.get('/api/admin/leads?kind=booking&q=Lee')
    assert.equal(filtered.json.total, 1)
    const noMatch = await s.get('/api/admin/leads?q=%25zzz')
    assert.equal(noMatch.json.total, 0)

    const id = filtered.json.items[0].id
    const detail = await s.get(`/api/admin/leads/${id}`)
    assert.equal(detail.json.payload.name, 'Sam Lee')
    const patched = await s.admin('PATCH', `/api/admin/leads/${id}`, { body: { status: 'contacted', notes: 'Called, call back Tuesday' } })
    assert.equal(patched.status, 200)
    assert.equal(patched.json.status, 'contacted')
    const badStatus = await s.admin('PATCH', `/api/admin/leads/${id}`, { body: { status: 'spam' } })
    assert.equal(badStatus.status, 400)
    const after = await s.get('/api/admin/leads')
    assert.equal(after.json.newCount, 1)

    const csv = await s.get('/api/admin/leads/export.csv')
    assert.equal(csv.status, 200)
    assert.match(csv.headers.get('content-type'), /text\/csv/)
    // fetch's text() strips the UTF-8 byte-order mark the file starts with.
    assert.match(csv.text, /^id,kind,status,received,updated,page,notes,/)
    assert.match(csv.text, /'=cmd\(\)/)
    assert.match(csv.text, /quotes; reviews/)

    const backup = await s.request('GET', '/api/admin/backup', { raw: true })
    assert.equal(backup.status, 200)
    const bytes = Buffer.from(await backup.arrayBuffer())
    assert.equal(bytes.subarray(0, 15).toString(), 'SQLite format 3')

    const del = await s.admin('DELETE', `/api/admin/leads/${id}`)
    assert.equal(del.status, 200)
    const gone = await s.get(`/api/admin/leads/${id}`)
    assert.equal(gone.status, 404)

    const added = await s.admin('POST', '/api/admin/admins', { body: { email: 'Partner@Example.com', temporaryPassword: 'temporary-pass-123' } })
    assert.equal(added.status, 201)
    assert.equal(added.json.email, 'partner@example.com')
    const dup = await s.admin('POST', '/api/admin/admins', { body: { email: 'partner@example.com', temporaryPassword: 'temporary-pass-123' } })
    assert.equal(dup.status, 400)
    const admins = await s.get('/api/admin/admins')
    assert.equal(admins.json.length, 2)

    const partner = makeClient(s.base)
    const pl = await partner.login('partner@example.com', 'temporary-pass-123')
    assert.equal(pl.status, 200)
    assert.equal(pl.json.mustChangePassword, true)

    const revoked = await s.admin('POST', '/api/admin/sessions/revoke-all')
    assert.equal(revoked.status, 200)
    assert.equal((await partner.get('/api/admin/me')).status, 401)
    assert.equal((await s.get('/api/admin/me')).status, 401)

    await s.login(ADMIN.email, NEW_PASSWORD)
    assert.equal((await s.get('/api/admin/me')).status, 200)
    const out = await s.admin('POST', '/api/admin/logout')
    assert.equal(out.status, 200)
    assert.equal((await s.get('/api/admin/me')).status, 401)
  } finally { await s.close() }
})

test('bad JSON and oversized bodies get plain errors', async () => {
  const s = await startTestServer()
  try {
    const res = await fetch(s.base + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{not json' })
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'Invalid JSON body' })
    const big = await fetch(s.base + '/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'other', payload: { a: 'x'.repeat(70000) } }) })
    assert.equal(big.status, 413)
    const unknown = await s.get('/api/nothing')
    assert.equal(unknown.status, 404)
    assert.equal(unknown.json.error, 'Not found')
  } finally { await s.close() }
})
