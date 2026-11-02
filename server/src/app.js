// Builds the Express app. index.js wires it to a real database and port; tests call it with an
// in-memory database and listen on port 0.
import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { securityHeaders, requestLogger, errorHandler, ipHasher, RateLimiter } from './security.js'
import { createPublicRouter } from './routes/public.js'
import { createAdminRouter } from './routes/admin.js'
import { LoginLimiter, parseCookies, readSession, COOKIE_NAME } from './auth.js'

export function createApp({ db, config, content, uiDir, log = console.log, errorLog = console.error, limiters = {} }) {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.trustProxy)
  app.use(securityHeaders(config))
  app.use(requestLogger(log))
  app.use(express.json({ limit: '64kb', strict: true }))

  const hashIp = ipHasher(config.ipHashKey)
  const leadLimiter = limiters.leads || new RateLimiter({ max: 10, windowMs: 60 * 60 * 1000 })
  const loginLimiter = limiters.login || new LoginLimiter()

  app.use(createPublicRouter({ db, config, content, hashIp, leadLimiter, log: errorLog }))
  app.use('/api/admin', createAdminRouter({ db, config, content, hashIp, loginLimiter, log: errorLog }))

  const hasSession = (req) => Boolean(readSession(db, parseCookies(req.get('cookie'))[COOKIE_NAME], config.sessionSecret))
  const sendPage = (res, name) => {
    const file = join(uiDir, name)
    res.setHeader('Cache-Control', 'no-store')
    if (!existsSync(file)) return res.status(404).type('text/plain').send('The admin UI files are missing from server/admin-ui.')
    res.type('html').send(readFileSync(file))
  }
  app.get('/', (req, res) => res.redirect(302, '/admin'))
  app.get('/admin', (req, res) => (hasSession(req) ? sendPage(res, 'index.html') : res.redirect(302, '/admin/login')))
  app.get('/admin/login', (req, res) => (hasSession(req) ? res.redirect(302, '/admin') : sendPage(res, 'login.html')))
  app.use('/admin/assets', express.static(uiDir, { index: false, dotfiles: 'ignore', maxAge: '1h', extensions: false }))

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
  app.use((req, res) => res.status(404).type('text/plain').send('Not found'))
  app.use(errorHandler(errorLog))
  return app
}
