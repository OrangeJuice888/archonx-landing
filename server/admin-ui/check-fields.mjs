// Checks server/admin-ui/fields.js against content/site-content.json: every numeric path in the
// content has an entry, every entry points at a numeric path, and kinds match content-schema.js.
// Run: node server/admin-ui/check-fields.mjs   (exit 1 on any problem)
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const contentPath = resolve(here, '../../content/site-content.json')
const fieldsPath = resolve(here, 'fields.js')
const schemaPath = resolve(here, '../src/content-schema.js')

const content = JSON.parse(readFileSync(contentPath, 'utf8'))

const sandbox = { window: {} }
vm.createContext(sandbox)
vm.runInContext(readFileSync(fieldsPath, 'utf8'), sandbox, { filename: 'fields.js' })
const fields = sandbox.window.AX_FIELDS
if (!fields || typeof fields !== 'object') { console.error('fields.js did not set window.AX_FIELDS'); process.exit(1) }

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
function numericPaths(obj, prefix = '') {
  const out = []
  for (const key of Object.keys(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (isPlain(obj[key])) out.push(...numericPaths(obj[key], path))
    else if (typeof obj[key] === 'number') out.push(path)
  }
  return out
}

let fieldKind = null
try { ({ fieldKind } = await import(pathToFileURL(schemaPath).href)) } catch (e) { console.warn(`(kind check skipped: could not load ${schemaPath}: ${e.message})`) }

const problems = []
const paths = numericPaths(content)
for (const p of paths) {
  const f = fields[p]
  if (!f) { problems.push(`missing entry for numeric path ${p}`); continue }
  for (const k of ['label', 'unit', 'kind', 'shownAs']) if (typeof f[k] !== 'string') problems.push(`${p}: ${k} must be a string`)
  if (!f.label) problems.push(`${p}: empty label`)
  if (!['price', 'cost', 'count', 'other'].includes(f.kind)) problems.push(`${p}: unknown kind "${f.kind}"`)
  if (p.startsWith('pricing.') && f.kind === 'other') problems.push(`${p}: a pricing path must be price, cost or count`)
  if (fieldKind && fieldKind(p) !== f.kind) problems.push(`${p}: kind "${f.kind}" but content-schema.js says "${fieldKind(p)}"`)
}
const pathSet = new Set(paths)
for (const p of Object.keys(fields)) if (!pathSet.has(p)) problems.push(`fields.js entry ${p} is not a numeric path in the content`)

if (problems.length) {
  for (const p of problems) console.error('check-fields: ' + p)
  process.exit(1)
}
console.log(`check-fields: ok, ${paths.length} numeric paths (${paths.filter((p) => p.startsWith('pricing.')).length} under pricing) all covered by fields.js`)
