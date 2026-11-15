// Quick regex-based scan of the static consulting pages after a refactor run.
//   node scripts/refactor-scan.mjs [--parse]
// Reports:
//   1. every "$" amount in markup text or attribute values (outside <script>/<style>) that is
//      not the whole text of a [data-p] element and is not inside an element with data-market;
//   2. every "$" amount inside the inline scripts other than the BM/BO band arrays and the two
//      "$5 to $15" phone-provider strings;
//   3. every [data-p] whose key is missing from content/site-content.json or whose literal text
//      differs from the formatted default;
//   4. structural checks: exactly one </html>, no admin leftovers, loader tag in <head>.
// With --parse it also extracts each inline <script> body to the scratch folder and runs
// `node --check` on it.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const content = JSON.parse(readFileSync(resolve(root, 'content/site-content.json'), 'utf8'))
const files = ['public/consultation/index.html', 'public/consultation/fact-sheet.html']
const doParse = process.argv.includes('--parse')

// Formatters copied from public/consultation/ax-content.js (kept in step by hand; the official
// checker in scripts/check-prices.mjs owns the identical-output test).
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
function get(path) {
  let cur = content
  for (const p of String(path).split('.')) { if (cur == null) return undefined; cur = cur[p] }
  return cur
}
function format(v, f) {
  return f === 'gst' ? gst(v) : f === 'plain' ? String(v) : f === 'date' ? fmtDate(v) : f === 'int' ? Number(v).toLocaleString('en-AU') : money(v)
}

const AMOUNT = /\$\d{1,3}(?:,\d{3})+(?:\.\d+)?|\$\d+(?:\.\d+)?/g
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const lineOf = (text, idx) => text.slice(0, idx).split('\n').length
const ctx = (text, idx, span = 70) => text.slice(Math.max(0, idx - span), idx + span).replace(/\s+/g, ' ')

let problems = 0
const report = (file, line, what, snippet) => { problems++; console.log(`${file}:${line}: ${what}\n    ${snippet}`) }

for (const rel of files) {
  const file = resolve(root, rel)
  const raw = readFileSync(file, 'utf8')
  const text = raw.replace(/\r\n/g, '\n')
  console.log(`\n== ${rel} (${raw.includes('\r\n') ? 'CRLF' : 'LF'})`)

  // ---- structural checks
  const htmlClose = (text.match(/<\/html>/g) || []).length
  if (htmlClose !== 1) report(rel, 0, `expected exactly one </html>, found ${htmlClose}`, '')
  const headEnd = text.indexOf('</head>')
  const head = text.slice(0, headEnd)
  const loaderTag = '<script src="/consultation/ax-content.js"></script>'
  if (!head.includes(loaderTag)) report(rel, 0, 'loader <script> tag missing from <head>', loaderTag)
  else {
    const lastSheet = head.lastIndexOf('<link rel="stylesheet"')
    if (head.indexOf(loaderTag) < lastSheet) report(rel, lineOf(text, head.indexOf(loaderTag)), 'loader tag is before the last stylesheet link', '')
    if (/<script src="\/consultation\/ax-content.js"[^>]*(defer|async)/.test(head)) report(rel, 0, 'loader tag must not carry defer/async', '')
  }
  for (const needle of ['id="admin"', 'admin-mode', 'adminLink', 'admIntro', 'admList', 'renderAdmin', 'initAdmin', 'slaPill', 'STATUSES', 'auditRow', 'leadRow', '.adm-', '.tabs', '.kpis', 'use(\'db\')', 'use(\'user\')', 'canEdit']) {
    let i = -1
    while ((i = text.indexOf(needle, i + 1)) >= 0) report(rel, lineOf(text, i), `admin leftover "${needle}"`, ctx(text, i))
  }
  if (!text.includes("use('sample')") && rel.endsWith('index.html')) report(rel, 0, "use('sample') (demo plan generator) must stay", '')
  if (/\bup:\s*'/.test(text)) { const i = text.search(/\bup:\s*'/); report(rel, lineOf(text, i), 'FREE.up property still present', ctx(text, i)) }

  // ---- split markup from scripts/styles
  const segments = [] // { kind: 'markup'|'script'|'style', start, end, body }
  const tagRe = /<(script|style)\b[^>]*>|<\/(script|style)>/g
  let pos = 0, open = null, m
  while ((m = tagRe.exec(text))) {
    if (!open) {
      if (m[1]) {
        segments.push({ kind: 'markup', start: pos, end: m.index, body: text.slice(pos, m.index) })
        open = { kind: m[1], start: m.index + m[0].length, tag: m[0] }
      }
    } else if (m[2] === open.kind) {
      segments.push({ kind: open.kind, start: open.start, end: m.index, body: text.slice(open.start, m.index), tag: open.tag })
      pos = m.index + m[0].length
      open = null
    }
  }
  segments.push({ kind: 'markup', start: pos, end: text.length, body: text.slice(pos) })

  // ---- markup: amounts and data-p checks
  const stack = []
  const inMarket = () => stack.some(e => e.market)
  for (const seg of segments.filter(s => s.kind === 'markup')) {
    const body = seg.body
    const tokRe = /<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g
    let last = 0, t
    const handleText = (s, from) => {
      let a
      AMOUNT.lastIndex = 0
      while ((a = AMOUNT.exec(s))) {
        const abs = seg.start + from + a.index
        const top = stack[stack.length - 1]
        const whole = top && top.dataP && s.trim() === a[0] && top.textStart === from
        if (whole) {
          // record for the default check
          const key = top.dataP, fmt = top.fmt
          const v = get(key)
          if (v === undefined) report(rel, lineOf(text, abs), `data-p key "${key}" not in content`, ctx(text, abs))
          else if (format(v, fmt) !== a[0]) report(rel, lineOf(text, abs), `data-p "${key}" text "${a[0]}" differs from default "${format(v, fmt)}"`, ctx(text, abs))
          continue
        }
        if (inMarket()) continue
        report(rel, lineOf(text, abs), `unbound amount ${a[0]} in prose`, ctx(text, abs))
      }
    }
    while ((t = tokRe.exec(body))) {
      if (t.index > last) handleText(body.slice(last, t.index), last)
      last = t.index + t[0].length
      if (t[0].startsWith('<!--')) continue
      if (t[1]) { // close tag
        const name = t[1].toLowerCase()
        for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { stack.length = i; break }
        continue
      }
      const name = t[2].toLowerCase(), attrs = t[3] || ''
      const market = /(^|\s)data-market(\s|=|$)/.test(attrs)
      const dp = attrs.match(/data-p="([^"]+)"/)
      const fm = attrs.match(/data-fmt="([^"]+)"/)
      // attribute values
      let a
      AMOUNT.lastIndex = 0
      while ((a = AMOUNT.exec(attrs))) {
        if (market || inMarket()) continue
        const abs = seg.start + t.index
        report(rel, lineOf(text, abs), `amount ${a[0]} in an attribute of <${name}>`, ctx(text, abs))
      }
      if (t[4] === '/' || VOID.has(name)) continue
      stack.push({ name, market, dataP: dp ? dp[1] : null, fmt: fm ? fm[1] : null, textStart: last })
    }
    if (last < body.length) handleText(body.slice(last), last)
    // plain/int/date data-p elements carry no "$", so check them separately
    const dpRe = /<([a-zA-Z][\w-]*)\b[^>]*\bdata-p="([^"]+)"[^>]*>([^<]*)<\/\1>/g
    let d
    while ((d = dpRe.exec(body))) {
      const key = d[2], fmt = (d[0].match(/data-fmt="([^"]+)"/) || [])[1]
      const v = get(key)
      const abs = seg.start + d.index
      if (v === undefined) report(rel, lineOf(text, abs), `data-p key "${key}" not in content`, ctx(text, abs))
      else if (format(v, fmt) !== d[3]) report(rel, lineOf(text, abs), `data-p "${key}" text "${d[3]}" differs from default "${format(v, fmt)}"`, ctx(text, abs))
    }
  }

  // ---- scripts: literal amounts
  const scripts = segments.filter(s => s.kind === 'script')
  scripts.forEach((seg, n) => {
    const body = seg.body
    let a
    AMOUNT.lastIndex = 0
    while ((a = AMOUNT.exec(body))) {
      const abs = seg.start + a.index
      const line = text.slice(text.lastIndexOf('\n', abs) + 1, text.indexOf('\n', abs))
      if (/^\s*const BM = \[/.test(line)) continue
      if (body.slice(a.index - 1, a.index + 10).includes('$5 to $15') || body.slice(a.index - 7, a.index + 4).includes('$5 to $15')) continue
      report(rel, lineOf(text, abs), `literal amount ${a[0]} in inline script ${n + 1}`, ctx(text, abs))
    }
    // any template literal interpolating .name} without esc() (the official checker looks at
    // innerHTML assignments; this scan is stricter and lists every template literal, so that
    // fragments built in a const and then interpolated into innerHTML are caught too)
    const nameRe = /\$\{([^}]*?\.name)\}/g
    let nm
    while ((nm = nameRe.exec(body))) {
      if (/esc\(/.test(nm[1])) continue
      const abs = seg.start + nm.index
      const line = text.slice(text.lastIndexOf('\n', abs) + 1, text.indexOf('\n', abs))
      if (/textContent\s*=|\.join\('\\n'\)|^\s*return \[`|^\s*\.\.\.r\.top\.map|^\s*`Suggested package|^\s*`Total: /.test(line)) continue // plain-text uses
      report(rel, lineOf(text, abs), `template literal interpolates ${nm[0]} without esc()`, ctx(text, abs, 50))
    }
    if (doParse) {
      const dir = resolve(tmpdir(), 'ax-refactor-scan')
      mkdirSync(dir, { recursive: true })
      const out = resolve(dir, `${rel.split('/').pop().replace(/\.html$/, '')}-script-${n + 1}.js`)
      writeFileSync(out, body)
      const r = spawnSync(process.execPath, ['--check', out], { encoding: 'utf8' })
      const startLine = lineOf(text, seg.start)
      if (r.status === 0) console.log(`parse ok: ${rel} script ${n + 1} (lines ${startLine}-${lineOf(text, seg.end)}, ${body.split('\n').length - 1} lines)`)
      else report(rel, startLine, `script ${n + 1} failed node --check`, (r.stderr || r.stdout).trim().split('\n').slice(0, 6).join(' | '))
    }
  })
  console.log(`scripts: ${scripts.length}`)
}

console.log(`\n${problems ? problems + ' problem(s)' : 'scan clean'}`)
process.exit(problems ? 1 : 0)
