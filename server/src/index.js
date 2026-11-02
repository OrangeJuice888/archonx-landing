// Starts the ArchonX admin server.
import { join } from 'node:path'
import { loadConfig } from './config.js'
import { openDb } from './db.js'
import { loadDefaults } from './content-schema.js'
import { createContentStore } from './content.js'
import { bootstrapAdmins } from './bootstrap.js'
import { deleteExpiredSessions } from './auth.js'
import { createApp } from './app.js'

const [major, minor] = process.versions.node.split('.').map(Number)
if (major < 22 || (major === 22 && minor < 13)) {
  console.error(`Node 22.13 or newer is required; you have ${process.versions.node}. Install the current Node LTS from https://nodejs.org and try again.`)
  process.exit(1)
}

let config
try {
  config = loadConfig()
} catch (err) {
  console.error('Configuration problem: ' + err.message)
  process.exit(1)
}
for (const w of config.warnings) console.warn('Warning: ' + w)

let db, content
try {
  db = openDb(config.databasePath)
  content = createContentStore({ db, defaults: loadDefaults(config.contentDefaultsPath) })
  bootstrapAdmins(db, config)
} catch (err) {
  console.error('Startup problem: ' + err.message)
  process.exit(1)
}

const app = createApp({ db, config, content, uiDir: join(config.serverDir, 'admin-ui') })
setInterval(() => { try { deleteExpiredSessions(db) } catch (err) { console.error(err) } }, 60 * 60 * 1000).unref()

const server = app.listen(config.port, config.host, () => {
  const address = server.address()
  const host = config.host === '0.0.0.0' || config.host === '::' ? 'localhost' : config.host
  console.log(`ArchonX admin is running: http://${host}:${address.port}/admin (${config.nodeEnv}; database ${config.databasePath})`)
})

const shutdown = () => { server.close(() => { try { db.close() } catch {} process.exit(0) }) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
