import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const LOADER = 'public/consultation/ax-content.js'
const MARK_START = '/*AX_API_URL_START*/'
const MARK_END = '/*AX_API_URL_END*/'

// Writes the admin API base URL into the static loader's marker. The committed file always
// carries '' so the repo never holds a localhost or production URL; the built copy in dist (and
// the file served by `vite dev`) gets VITE_API_URL from the environment or a .env.local file.
function apiUrlPlugin(apiUrl) {
  const fill = (js) => {
    const i = js.indexOf(MARK_START)
    const j = js.indexOf(MARK_END)
    if (i < 0 || j < 0) return js
    return js.slice(0, i + MARK_START.length) + JSON.stringify(apiUrl) + js.slice(j)
  }
  return {
    name: 'ax-api-url',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url || '').split('?')[0] !== '/consultation/ax-content.js') return next()
        res.setHeader('Content-Type', 'text/javascript; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(fill(readFileSync(LOADER, 'utf8')))
      })
    },
    closeBundle() {
      const built = 'dist/consultation/ax-content.js'
      if (existsSync(built)) writeFileSync(built, fill(readFileSync(built, 'utf8')))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiUrl = String(env.VITE_API_URL || process.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
  return {
    plugins: [
      react(),
      {
        // GitHub Pages serves 404.html for unknown paths — copy the SPA shell
        // there so deep links like /markets resolve client-side.
        name: 'spa-404-fallback',
        closeBundle() {
          copyFileSync('dist/index.html', 'dist/404.html')
        },
      },
      apiUrlPlugin(apiUrl),
    ],
    server: {
      port: 3000,
    },
  }
})
