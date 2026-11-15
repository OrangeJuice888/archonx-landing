import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, verifyPassword, signSessionId, verifySessionCookie, newSessionId, delayForFailures, LoginLimiter, passwordProblem, parseCookies } from '../src/auth.js'

test('passwords hash with scrypt parameters and verify in constant time', () => {
  const stored = hashPassword('a-long-enough-password')
  assert.match(stored, /^scrypt\$16384\$8\$1\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/)
  assert.equal(verifyPassword('a-long-enough-password', stored), true)
  assert.equal(verifyPassword('a-long-enough-passwore', stored), false)
  assert.equal(verifyPassword('anything', 'garbage'), false)
  assert.notEqual(hashPassword('same'), hashPassword('same'))
})

test('password rules', () => {
  assert.equal(passwordProblem('short', 'a@b.co') !== null, true)
  assert.equal(passwordProblem('x'.repeat(129), 'a@b.co') !== null, true)
  assert.equal(passwordProblem('Owner@Example.com', 'owner@example.com') !== null, true)
  assert.equal(passwordProblem('a fine passphrase here', 'a@b.co'), null)
})

test('session cookies carry a verifiable signature and reject tampering', () => {
  const id = newSessionId()
  const value = signSessionId(id, 'secret-one')
  assert.equal(verifySessionCookie(value, 'secret-one'), id)
  assert.equal(verifySessionCookie(value, 'secret-two'), null)
  assert.equal(verifySessionCookie(value.slice(0, -1) + (value.endsWith('A') ? 'B' : 'A'), 'secret-one'), null)
  assert.equal(verifySessionCookie('x.y', 'secret-one'), null)
  assert.equal(verifySessionCookie(undefined, 'secret-one'), null)
})

test('cookie header parsing', () => {
  assert.deepEqual(parseCookies('a=1; ax_admin=abc.def; b=2'), Object.assign(Object.create(null), { a: '1', ax_admin: 'abc.def', b: '2' }))
  assert.deepEqual(Object.keys(parseCookies('')), [])
})

test('per-email delay grows after five failures and caps at 30 seconds', () => {
  assert.equal(delayForFailures(0), 0)
  assert.equal(delayForFailures(4), 0)
  assert.equal(delayForFailures(5), 1000)
  assert.equal(delayForFailures(6), 2000)
  assert.equal(delayForFailures(9), 16000)
  assert.equal(delayForFailures(20), 30000)
})

test('per-IP block after five failures in the window, then clears', () => {
  let now = 1_000_000
  const l = new LoginLimiter({ now: () => now })
  for (let i = 0; i < 5; i++) { assert.equal(l.ipBlockedFor('ip1'), 0); l.recordFailure('ip1', 'e@x.co') }
  assert.ok(l.ipBlockedFor('ip1') > 0)
  assert.equal(l.ipBlockedFor('ip2'), 0)
  assert.equal(l.emailDelayMs('e@x.co'), 1000)
  l.recordSuccess('ip1', 'e@x.co')
  assert.equal(l.emailDelayMs('e@x.co'), 0)
  now += 15 * 60 * 1000
  assert.equal(l.ipBlockedFor('ip1'), 0)
})

test('attempts for one email run one after another', async () => {
  const l = new LoginLimiter()
  const order = []
  const a = l.serialise('e@x.co', async () => { await new Promise((r) => setTimeout(r, 30)); order.push('a') })
  const b = l.serialise('e@x.co', async () => { order.push('b') })
  await Promise.all([a, b])
  assert.deepEqual(order, ['a', 'b'])
})
