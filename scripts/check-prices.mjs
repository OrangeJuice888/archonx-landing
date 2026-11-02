// Checks that every ArchonX price on the static consulting pages is bound to the content file.
//   node scripts/check-prices.mjs        (exit 1 on any violation)
// Rules (see docs/admin-backend/brief.md, "Checker"):
//   - every "$" amount in text (outside <script>/<style>) or in an attribute value must be the
//     whole text of a [data-p] element, or sit inside an element that carries data-market;
//   - every [data-p] element is text-only, its key exists in content/site-content.json and its
//     text equals the formatted default (money, gst, date, plain, int);
//   - the inline scripts contain no literal "$" amounts other than the audit budget-band arrays
//     and the two "$5 to $15" phone-provider strings;
//   - no innerHTML template literal interpolates a content-derived .name without esc();
//   - the formatters here produce the same output as the loader's for every value in the content.
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'parse5'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PAGES = ['public/consultation/index.html', 'public/consultation/fact-sheet.html']
const content = JSON.parse(readFileSync(resolve(root, 'content/site-content.json'), 'utf8'))
const loaderSource = readFileSync(resolve(root, 'public/consultation/ax-content.js'), 'utf8')

/* ---------- formatters (must match public/consultation/ax-content.js) ---------- */
function money(n) {
  n = Number(n)
  if (!isFinite(n)) return ''
  const dp = Number.isInteger(n) ? 0 : 2
  return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: dp, maximumFractionDigits: dp })
}
function gst(n) {
  return '$' + (Math.round(Number(n) * 110) / 100).toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function fmtDate(iso) {
  const d = new Date(iso + (String(iso).length === 10 ? 'T00:00:00' : ''))
  if (isNaN(d)) return String(iso || '')
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
}
function format(v, fmt) {
  return fmt === 'gst' ? gst(v) : fmt === 'plain' ? String(v) : fmt === 'date' ? fmtDate(v) : fmt === 'int' ? Number(v).toLocaleString('en-AU') : money(v)
}
function get(path) {
  let cur = content
  for (const p of String(path).split('.')) { if (cur === null || typeof cur !== 'object' || !Object.hasOwn(cur, p)) return undefined; cur = cur[p] }
  return cur
}
function leaves(obj, prefix = '', out = []) {
  for (const k of Object.keys(obj)) { const p = prefix ? `${prefix}.${k}` : k; if (obj[k] && typeof obj[k] === 'object') leaves(obj[k], p, out); else out.push([p, obj[k]]) }
  return out
}

const problems = []
const report = (file, line, what, snippet = '') => { problems.push(`${file}:${line}: ${what}${snippet ? `\n    ${snippet}` : ''}`) }

/* ---------- 1. the loader's formatters agree with ours ---------- */
{
  const grab = (name) => {
    const m = loaderSource.match(new RegExp(`function ${name}\\([^)]*\\) \\{[\\s\\S]*?\\n  \\}`))
    if (!m) throw new Error(`could not find function ${name} in ax-content.js`)
    return new Function(`return (${m[0]})`)()
  }
  const L = { money: grab('money'), gst: grab('gst'), fmtDate: grab('fmtDate') }
  for (const [path, v] of leaves(content)) {
    if (typeof v === 'number') {
      if (L.money(v) !== money(v)) report('ax-content.js', 0, `money(${v}) differs: loader ${L.money(v)}, checker ${money(v)} (${path})`)
      if (L.gst(v) !== gst(v)) report('ax-content.js', 0, `gst(${v}) differs: loader ${L.gst(v)}, checker ${gst(v)} (${path})`)
    } else if (path === 'text.pricesCorrectAt' && L.fmtDate(v) !== fmtDate(v)) report('ax-content.js', 0, `fmtDate(${v}) differs: loader ${L.fmtDate(v)}, checker ${fmtDate(v)}`)
  }
}

/* ---------- 2. the pages ---------- */
const AMOUNT = /\$\d{1,3}(?:,\d{3})+(?:\.\d+)?|\$\d+(?:\.\d+)?/g
const attr = (node, name) => { const a = (node.attrs || []).find((x) => x.name === name); return a ? a.value : null }
const hasAttr = (node, name) => (node.attrs || []).some((x) => x.name === name)
const lineOf = (node) => (node.sourceCodeLocation ? node.sourceCodeLocation.startLine : 0)
const textOf = (node) => (node.childNodes || []).map((c) => (c.nodeName === '#text' ? c.value : textOf(c))).join('')

for (const rel of PAGES) {
  const html = readFileSync(resolve(root, rel), 'utf8')
  const doc = parse(html, { sourceCodeLocationInfo: true })
  const scripts = []

  const walk = (node, market) => {
    if (node.nodeName === 'script') { scripts.push(node); return }
    if (node.nodeName === 'style') return
    if (node.nodeName === '#text') {
      const parent = node.parentNode
      const bound = parent && hasAttr(parent, 'data-p')
      for (const m of node.value.matchAll(AMOUNT)) {
        if (bound && node.value.trim() === m[0]) continue
        if (market) continue
        report(rel, lineOf(parent) || lineOf(node), `unbound amount ${m[0]} in prose`, node.value.trim().slice(0, 120))
      }
      return
    }
    const thisMarket = market || hasAttr(node, 'data-market')
    for (const a of node.attrs || []) {
      if (a.name === 'data-p' || a.name === 'data-fmt') continue
      for (const m of a.value.matchAll(AMOUNT)) if (!thisMarket) report(rel, lineOf(node), `amount ${m[0]} in the ${a.name} attribute of <${node.nodeName}>`, a.value.slice(0, 120))
    }
    const key = attr(node, 'data-p')
    if (key !== null) {
      const kids = node.childNodes || []
      if (kids.some((c) => c.nodeName !== '#text')) report(rel, lineOf(node), `data-p="${key}" element must contain text only`)
      const v = get(key)
      const text = textOf(node)
      if (v === undefined) report(rel, lineOf(node), `data-p key "${key}" is not in content/site-content.json`)
      else if (format(v, attr(node, 'data-fmt')) !== text) report(rel, lineOf(node), `data-p "${key}" shows "${text}" but the default formats as "${format(v, attr(node, 'data-fmt'))}"`)
    }
    const children = node.nodeName === 'template' && node.content ? node.content.childNodes : node.childNodes || []
    for (const c of children) walk(c, thisMarket)
  }
  walk(doc, false)

  const headEnd = html.indexOf('</head>')
  const head = html.slice(0, headEnd)
  const loaderTag = '<script src="/consultation/ax-content.js"></script>'
  if (!head.includes(loaderTag)) report(rel, 0, 'the content loader tag is missing from <head>', loaderTag)
  else if (head.indexOf(loaderTag) < head.lastIndexOf('<link rel="stylesheet"')) report(rel, 0, 'the content loader tag must come after the stylesheet links')

  scripts.forEach((node, i) => {
    const body = textOf(node)
    const start = node.sourceCodeLocation ? node.sourceCodeLocation.startLine : 0
    const lines = body.split('\n')
    lines.forEach((line, j) => {
      const ln = start + j
      for (const m of line.matchAll(AMOUNT)) {
        if (/^\s*const BM = \[/.test(line)) continue
        if (line.includes('$5 to $15')) continue
        report(rel, ln, `literal amount ${m[0]} in inline script ${i + 1}`, line.trim().slice(0, 120))
      }
      if (/innerHTML\s*(=|\+=)/.test(line) || /^\s*const (opp|free|halfLine|fitText|lead|pm|ownLine) = `/.test(line)) {
        for (const m of line.matchAll(/\$\{([^}]*?\.name)\}/g)) if (!/esc\(/.test(m[1])) report(rel, ln, `innerHTML template interpolates ${m[0]} without esc()`, line.trim().slice(0, 120))
      }
    })
  })
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\ncheck-prices: ${problems.length} problem${problems.length === 1 ? '' : 's'}`)
  process.exit(1)
}
console.log(`check-prices: ok (${PAGES.length} pages, ${leaves(content).length} content values)`)
