// Reads the environment into one config object. Fails fast with a plain message when a
// production setting is missing or unsafe; in development it fills in what it can and warns.
import { fileURLToPath } from 'node:url'
import { dirname, resolve, isAbsolute } from 'node:path'
import { randomBytes, hkdfSync } from 'node:crypto'

export const SERVER_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const PLACEHOLDER_SECRET = 'replace-with-64-hex-characters-from-the-readme'
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000

const flag = (v) => ['1', 'true', 'yes', 'on'].includes(String(v ?? '').trim().toLowerCase())

export function loadConfig(env = process.env) {
  const nodeEnv = (env.NODE_ENV || 'development').trim()
  const production = nodeEnv === 'production'
  const warnings = []
  const resolvePath = (p) => (p === ':memory:' ? p : isAbsolute(p) ? p : resolve(SERVER_DIR, p))

  let sessionSecret = String(env.SESSION_SECRET || '').trim()
  if (!sessionSecret) {
    if (production) throw new Error('SESSION_SECRET is required in production: at least 32 characters. See server/README.md.')
    sessionSecret = randomBytes(32).toString('hex')
    warnings.push('SESSION_SECRET is not set: using a random one for this run, so logins end when the server restarts.')
  } else if (sessionSecret.length < 32 || sessionSecret === PLACEHOLDER_SECRET) {
    if (production) throw new Error('SESSION_SECRET must be at least 32 characters and not the example placeholder.')
    warnings.push('SESSION_SECRET is shorter than 32 characters or still the example value. Fine for development only.')
  }

  const port = Number.parseInt(env.PORT || '4324', 10)
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error(`PORT must be a number between 0 and 65535, got "${env.PORT}".`)
  const host = (env.HOST || '0.0.0.0').trim()

  const leadWebhookUrl = (env.LEAD_WEBHOOK_URL || '').trim() || null
  if (leadWebhookUrl && !/^https:\/\/\S+$/i.test(leadWebhookUrl)) throw new Error('LEAD_WEBHOOK_URL must start with https://')

  const adminOrigin = (env.ADMIN_ORIGIN || '').trim().replace(/\/+$/, '') || null
  if (adminOrigin && !/^https?:\/\/[^/\s]+$/i.test(adminOrigin)) throw new Error('ADMIN_ORIGIN must look like https://admin.example.com (scheme and host only).')

  const ipHashKey = (env.IP_HASH_SECRET || '').trim() || Buffer.from(hkdfSync('sha256', sessionSecret, '', 'ax-ip-hash', 32)).toString('hex')

  const adminEmail = (env.ADMIN_EMAIL || '').trim().toLowerCase() || null
  const adminPassword = env.ADMIN_PASSWORD ? String(env.ADMIN_PASSWORD) : null

  return {
    nodeEnv,
    production,
    host,
    port,
    warnings,
    serverDir: SERVER_DIR,
    databasePath: resolvePath((env.DATABASE_PATH || './data/archonx.sqlite').trim()),
    contentDefaultsPath: resolvePath((env.CONTENT_DEFAULTS_PATH || '../content/site-content.json').trim()),
    sessionSecret,
    sessionTtlMs: SESSION_TTL_MS,
    adminEmail,
    adminPassword,
    adminPasswordReset: flag(env.ADMIN_PASSWORD_RESET),
    trustProxy: flag(env.TRUST_PROXY) ? 1 : false,
    adminOrigin,
    leadWebhookUrl,
    leadWebhookSecret: (env.LEAD_WEBHOOK_SECRET || '').trim() || null,
    ipHashKey,
  }
}
