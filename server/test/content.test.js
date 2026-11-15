import { test } from 'node:test'
import assert from 'node:assert/strict'
import { loadDefaults, validateContent, contentWarnings, diffPaths, deepMerge, fieldKind, money, numericEntries } from '../src/content-schema.js'
import { DEFAULTS_PATH } from './helpers.js'

const defaults = loadDefaults(DEFAULTS_PATH)
const clone = () => JSON.parse(JSON.stringify(defaults))
const errorsFor = (c) => validateContent(c, defaults).errors.map((e) => `${e.path}: ${e.message}`)

test('the committed defaults validate with no warnings', () => {
  const r = validateContent(clone(), defaults)
  assert.deepEqual(r.errors, [])
  assert.deepEqual(r.value, defaults)
  assert.deepEqual(contentWarnings(defaults), [])
})

test('unknown, forbidden and missing keys are rejected', () => {
  const c = clone(); c.pricing.packs.front.extra = 1
  assert.match(errorsFor(c).join('\n'), /pricing\.packs\.front\.extra: unknown field/)
  // JSON.parse creates an own "__proto__" property (assignment would only set the prototype).
  const p = JSON.parse(JSON.stringify(clone()).replace('"packs":{', '"packs":{"__proto__":{"polluted":true},'))
  assert.match(errorsFor(p).join('\n'), /pricing\.packs\.__proto__: key not allowed/)
  const m = clone(); delete m.pricing.packs.back
  assert.match(errorsFor(m).join('\n'), /pricing\.packs\.back: missing/)
  const q = JSON.parse('{"version":1,"pricing":{},"text":{},"home":{},"constructor":{"prototype":{}}}')
  assert.ok(errorsFor(q).some((e) => e.startsWith('constructor: key not allowed')))
})

test('numbers must be finite, non-negative, whole dollars except the three per-unit costs', () => {
  const a = clone(); a.pricing.packs.front.monthly = -1
  assert.match(errorsFor(a).join('\n'), /must be zero or more/)
  const b = clone(); b.pricing.packs.front.monthly = 400.5
  assert.match(errorsFor(b).join('\n'), /must be a whole number/)
  const c = clone(); c.pricing.frontDesk.receptionist.extraMinute = 0.355
  assert.match(errorsFor(c).join('\n'), /at most two decimal places/)
  const d = clone(); d.pricing.frontDesk.receptionist.extraMinute = 0.4
  assert.deepEqual(errorsFor(d), [])
  const e = clone(); e.pricing.packs.front.monthly = '400'
  assert.match(errorsFor(e).join('\n'), /must be a number/)
})

test('strings reject angle brackets, control characters and over-long values; dates must be real', () => {
  const a = clone(); a.text.opening = 'Hello <b>there</b>'
  assert.match(errorsFor(a).join('\n'), /must not contain < or >/)
  const b = clone(); b.text.opening = 'bad\u0007bell'
  assert.match(errorsFor(b).join('\n'), /control characters/)
  const c = clone(); c.pricing.packs.front.name = 'x'.repeat(81)
  assert.match(errorsFor(c).join('\n'), /80 characters or fewer/)
  const d = clone(); d.text.pricesCorrectAt = '2026-13-40'
  assert.match(errorsFor(d).join('\n'), /must be a date/)
  const e = clone(); e.version = 2
  assert.match(errorsFor(e).join('\n'), /version: must be 1/)
})

test('warnings: the 00 rule, the Front Desk "from" figures and the paired industries', () => {
  const a = clone(); a.pricing.packs.front.monthly = 450
  assert.match(contentWarnings(a).join('\n'), /pricing\.packs\.front\.monthly is \$450: ArchonX prices end in 00/)
  const b = clone(); b.pricing.industries.trades.setup = 1400
  assert.match(contentWarnings(b).join('\n'), /Front Desk setup is \$1,500 but the lowest industry setup is \$1,400/)
  const c = clone(); c.pricing.industries.automotive.own = 4300
  assert.match(contentWarnings(c).join('\n'), /Automotive workshops and Gyms and fitness studios differ on own/)
  const d = clone(); d.pricing.bluework.perEmployeeMonthly = 9; d.pricing.extras.phoneNumberMonthly = 17; d.pricing.frontDesk.receptionist.includedMinutes = 301
  assert.deepEqual(contentWarnings(d), [])
})

test('field kinds and money formatting', () => {
  assert.equal(fieldKind('pricing.packs.front.monthly'), 'price')
  assert.equal(fieldKind('pricing.extras.phoneNumberMonthly'), 'cost')
  assert.equal(fieldKind('pricing.frontDesk.receptionist.includedMinutes'), 'count')
  assert.equal(fieldKind('text.opening'), 'other')
  assert.equal(money(1500), '$1,500')
  assert.equal(money(0.35), '$0.35')
  assert.equal(money(0.2), '$0.20')
  assert.equal(numericEntries(defaults).length > 60, true)
})

test('diffPaths and deepMerge', () => {
  const a = clone(); a.pricing.packs.front.monthly = 500; a.text.opening = 'New'
  assert.deepEqual(diffPaths(defaults, a), ['pricing.packs.front.monthly', 'text.opening'])
  const over = { pricing: { packs: { front: { monthly: 999 } } }, ['__proto__']: { polluted: 1 } }
  const merged = deepMerge(defaults, over)
  assert.equal(merged.pricing.packs.front.monthly, 999)
  assert.equal(merged.pricing.packs.front.setup, 1500)
  assert.equal(defaults.pricing.packs.front.monthly, 400)
  assert.equal(({}).polluted, undefined)
})
