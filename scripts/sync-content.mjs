// Keeps every copy of the site content in step with content/site-content.json:
//   - public/consultation/ax-content.js  (defaults for the static pages, between markers)
//   - src/content/defaults.json          (defaults for the React site)
// The admin API base URL is NOT written here: the committed loader always carries '' and the
// Vite plugin in vite.config.js fills it into the built copy from VITE_API_URL. Runs before
// `vite build` and `vite dev` through the package.json pre-scripts; safe to run by hand:
//   node scripts/sync-content.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const src = resolve(root, 'content/site-content.json')
const loader = resolve(root, 'public/consultation/ax-content.js')
const reactDefaults = resolve(root, 'src/content/defaults.json')

const raw = readFileSync(src, 'utf8')
const content = JSON.parse(raw)
if (!content || typeof content !== 'object' || !content.pricing || !content.text) {
  throw new Error('content/site-content.json must have "pricing" and "text" objects')
}
const json = JSON.stringify(content)

function replaceBetween(text, startMark, endMark, value, file) {
  const i = text.indexOf(startMark)
  const j = text.indexOf(endMark, i)
  if (i < 0 || j < 0) throw new Error(`${file}: markers ${startMark} … ${endMark} not found`)
  return text.slice(0, i + startMark.length) + value + text.slice(j)
}

let js = readFileSync(loader, 'utf8')
const before = js
js = replaceBetween(js, '/*AX_DEFAULTS_START*/', '/*AX_DEFAULTS_END*/', json, 'ax-content.js')
// The committed loader never carries an API URL; vite.config.js fills the marker at build time.
js = replaceBetween(js, '/*AX_API_URL_START*/', '/*AX_API_URL_END*/', "''", 'ax-content.js')
if (js !== before) writeFileSync(loader, js)

mkdirSync(dirname(reactDefaults), { recursive: true })
const pretty = JSON.stringify(content, null, 2) + '\n'
if (!existsSync(reactDefaults) || readFileSync(reactDefaults, 'utf8') !== pretty) writeFileSync(reactDefaults, pretty)

console.log(`content synced (${Object.keys(content.pricing).length} pricing groups)`)
