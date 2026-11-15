// The content schema IS content/site-content.json: every key there must exist with the same
// type, and nothing else is allowed. Also the field kinds (price / cost / count), the
// non-blocking warnings shown on save, and small deep-object helpers.
import { readFileSync } from 'node:fs'

const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const DECIMAL_KEYS = new Set(['extraMinute', 'extraConversation', 'smsCost'])
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/
const MAX_NUMBER = 1_000_000_000

export const COUNT_PATHS = new Set([
  'pricing.frontDesk.receptionist.includedMinutes',
  'pricing.frontDesk.chat.includedConversations',
  'pricing.bluework.minimumEmployees',
])
export const COST_PATHS = new Set([
  'pricing.extras.phoneNumberMonthly',
  'pricing.extras.frontDeskExtrasLow',
  'pricing.extras.frontDeskExtrasHigh',
  'pricing.extras.providerCostsLow',
  'pricing.extras.providerCostsHigh',
  'pricing.builds.workflow.toolsLow',
  'pricing.builds.workflow.toolsHigh',
  'pricing.frontDesk.receptionist.extraMinute',
  'pricing.frontDesk.chat.extraConversation',
  'pricing.frontDesk.leadFollowUp.smsCost',
])
export const ROUND_EXEMPT_PATHS = new Set(['pricing.bluework.perEmployeeMonthly'])

export const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const join = (prefix, key) => (prefix ? `${prefix}.${key}` : key)

export function loadDefaults(path) {
  const obj = JSON.parse(readFileSync(path, 'utf8'))
  if (!isPlain(obj) || !isPlain(obj.pricing) || !isPlain(obj.text)) throw new Error(`${path} must be an object with "pricing" and "text".`)
  return obj
}

/** 'price' (an ArchonX price), 'cost' (a third-party estimate), 'count' (a plain number) or 'other'. */
export function fieldKind(path) {
  if (!path.startsWith('pricing.')) return 'other'
  if (COUNT_PATHS.has(path)) return 'count'
  if (COST_PATHS.has(path)) return 'cost'
  return 'price'
}

export function money(n) {
  const num = Number(n)
  const dp = Number.isInteger(num) ? 0 : 2
  return '$' + num.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}

/** Validates `candidate` against the shape of `defaults`. Returns { ok, errors, value } where
 *  value is a fresh object in the defaults' key order. */
export function validateContent(candidate, defaults) {
  const errors = []
  const value = walk(defaults, candidate, '', errors)
  if (errors.length === 0 && value.version !== defaults.version) errors.push({ path: 'version', message: `must be ${defaults.version}` })
  return { ok: errors.length === 0, errors, value }
}

function walk(def, cand, prefix, errors) {
  if (!isPlain(cand)) { errors.push({ path: prefix || '(root)', message: 'must be an object' }); return undefined }
  for (const key of Object.keys(cand)) {
    if (FORBIDDEN_KEYS.has(key)) { errors.push({ path: join(prefix, key), message: 'key not allowed' }); continue }
    if (!Object.hasOwn(def, key)) errors.push({ path: join(prefix, key), message: 'unknown field' })
  }
  const out = {}
  for (const key of Object.keys(def)) {
    const path = join(prefix, key)
    const d = def[key]
    if (!Object.hasOwn(cand, key)) { errors.push({ path, message: 'missing' }); continue }
    const c = cand[key]
    if (isPlain(d)) { out[key] = walk(d, c, path, errors); continue }
    if (typeof d === 'number') {
      if (typeof c !== 'number' || !Number.isFinite(c)) { errors.push({ path, message: 'must be a number' }); continue }
      if (c < 0) { errors.push({ path, message: 'must be zero or more' }); continue }
      if (c > MAX_NUMBER) { errors.push({ path, message: 'is too large' }); continue }
      if (DECIMAL_KEYS.has(key)) {
        if (Math.round(c * 100) / 100 !== c) { errors.push({ path, message: 'at most two decimal places' }); continue }
      } else if (!Number.isInteger(c)) { errors.push({ path, message: 'must be a whole number' }); continue }
      out[key] = c
      continue
    }
    if (typeof d === 'string') {
      if (typeof c !== 'string') { errors.push({ path, message: 'must be text' }); continue }
      const max = key === 'name' ? 80 : 500
      if (c.length > max) { errors.push({ path, message: `must be ${max} characters or fewer` }); continue }
      if (/[<>]/.test(c)) { errors.push({ path, message: 'must not contain < or >' }); continue }
      if (CONTROL_CHARS.test(c)) { errors.push({ path, message: 'must not contain control characters' }); continue }
      if (key === 'pricesCorrectAt' && !isIsoDate(c)) { errors.push({ path, message: 'must be a date like 2026-11-02' }); continue }
      out[key] = c
      continue
    }
    if (typeof c !== typeof d) { errors.push({ path, message: `must be ${typeof d}` }); continue }
    out[key] = c
  }
  return out
}

function isIsoDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00Z')
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s
}

/** Non-blocking warnings about prices that break the owner's rules or a sentence on the page. */
export function contentWarnings(content) {
  const w = []
  for (const [path, v] of numericEntries(content)) {
    if (fieldKind(path) === 'price' && !ROUND_EXEMPT_PATHS.has(path) && v !== 0 && Number.isInteger(v) && v % 100 !== 0) {
      w.push(`${path} is ${money(v)}: ArchonX prices end in 00.`)
    }
  }
  const p = content.pricing || {}
  const inds = isPlain(p.industries) ? Object.values(p.industries) : []
  if (inds.length && isPlain(p.packs) && isPlain(p.packs.front)) {
    const minSetup = Math.min(...inds.map((i) => i.setup))
    const minOwn = Math.min(...inds.map((i) => i.own))
    if (p.packs.front.setup !== minSetup) w.push(`Front Desk setup is ${money(p.packs.front.setup)} but the lowest industry setup is ${money(minSetup)}; the page says "from" the Front Desk figure.`)
    if (p.packs.front.own !== minOwn) w.push(`Front Desk own-it-outright is ${money(p.packs.front.own)} but the lowest industry own price is ${money(minOwn)}; the page says "from" the Front Desk figure.`)
  }
  const pairs = [
    ['automotive', 'gyms', 'workshop or studio setup'],
    ['realestate', 'logistics', 'property or freight setup'],
    ['dental', 'legal', 'clinic or legal setup'],
  ]
  for (const [a, b, label] of pairs) {
    const A = p.industries && p.industries[a], B = p.industries && p.industries[b]
    if (!A || !B) continue
    for (const field of ['setup', 'own']) {
      if (A[field] !== B[field]) w.push(`${A.name || a} and ${B.name || b} differ on ${field} (${money(A[field])} vs ${money(B[field])}); the pricing page pairs them in one sentence: "from … with ${label}".`)
    }
  }
  return w
}

export function numericEntries(obj, prefix = '') {
  const out = []
  if (!isPlain(obj)) return out
  for (const key of Object.keys(obj)) {
    const path = join(prefix, key)
    const v = obj[key]
    if (isPlain(v)) out.push(...numericEntries(v, path))
    else if (typeof v === 'number') out.push([path, v])
  }
  return out
}

export function leafEntries(obj, prefix = '') {
  const out = []
  if (!isPlain(obj)) return out
  for (const key of Object.keys(obj)) {
    const path = join(prefix, key)
    const v = obj[key]
    if (isPlain(v)) out.push(...leafEntries(v, path))
    else out.push([path, v])
  }
  return out
}

/** Dotted paths whose leaf value differs between a and b. */
export function diffPaths(a, b) {
  const A = new Map(leafEntries(a)), B = new Map(leafEntries(b))
  const paths = new Set([...A.keys(), ...B.keys()])
  return [...paths].filter((p) => A.get(p) !== B.get(p)).sort()
}

export function getPath(obj, path) {
  let cur = obj
  for (const part of String(path).split('.')) { if (!isPlain(cur) || !Object.hasOwn(cur, part)) return undefined; cur = cur[part] }
  return cur
}

/** Fresh object: `over` wins where both are plain objects or leaves; never mutates either input. */
export function deepMerge(base, over) {
  if (!isPlain(base) || !isPlain(over)) return over === undefined ? base : over
  const out = {}
  for (const key of Object.keys(base)) out[key] = base[key]
  for (const key of Object.keys(over)) {
    if (FORBIDDEN_KEYS.has(key)) continue
    out[key] = isPlain(base[key]) && isPlain(over[key]) ? deepMerge(base[key], over[key]) : over[key]
  }
  return out
}
