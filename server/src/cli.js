// Operator commands. Usage: node src/cli.js reset-password <email>
import { randomBytes } from 'node:crypto'
import { loadConfig } from './config.js'
import { openDb, audit, nowIso } from './db.js'
import { hashPassword, deleteAdminSessions, normaliseEmail } from './auth.js'

const [command, ...args] = process.argv.slice(2)

function resetPassword(emailArg) {
  const email = normaliseEmail(emailArg)
  if (!email) { console.error('Usage: node src/cli.js reset-password <email>'); process.exit(2) }
  const config = loadConfig()
  const db = openDb(config.databasePath)
  const admin = db.prepare('SELECT id FROM admins WHERE email = ?').get(email)
  const password = randomBytes(18).toString('base64url')
  const hash = hashPassword(password)
  if (admin) {
    db.prepare('UPDATE admins SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(hash, admin.id)
    deleteAdminSessions(db, admin.id)
  } else {
    db.prepare('INSERT INTO admins (email, password_hash, must_change_password, created_at) VALUES (?, ?, 1, ?)').run(email, hash, nowIso())
  }
  audit(db, email, 'password_reset', admin ? 'from the command line' : 'from the command line (login created)')
  db.close()
  console.log(`${admin ? 'Password reset' : 'Login created'} for ${email}.`)
  console.log('Temporary password (shown once; you must change it at first sign-in):')
  console.log(password)
}

switch (command) {
  case 'reset-password':
    resetPassword(args[0])
    break
  default:
    console.error('Commands:\n  reset-password <email>   set a new temporary password and sign that admin out everywhere')
    process.exit(2)
}
