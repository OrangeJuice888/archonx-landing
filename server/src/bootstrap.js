// Creates the first admin from the environment (once) and handles the emergency reset flag.
import { hashPassword, passwordProblem, deleteAdminSessions } from './auth.js'
import { audit, nowIso } from './db.js'

export function bootstrapAdmins(db, config, log = console) {
  const count = db.prepare('SELECT COUNT(*) AS n FROM admins').get().n

  if (config.adminPasswordReset) {
    if (!config.adminEmail || !config.adminPassword) throw new Error('ADMIN_PASSWORD_RESET=1 needs ADMIN_EMAIL and ADMIN_PASSWORD as well.')
    const problem = passwordProblem(config.adminPassword, config.adminEmail)
    if (problem) throw new Error('ADMIN_PASSWORD: ' + problem)
    const hash = hashPassword(config.adminPassword)
    const existing = db.prepare('SELECT id FROM admins WHERE email = ?').get(config.adminEmail)
    if (existing) {
      db.prepare('UPDATE admins SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(hash, existing.id)
      deleteAdminSessions(db, existing.id)
    } else {
      db.prepare('INSERT INTO admins (email, password_hash, must_change_password, created_at) VALUES (?, ?, 1, ?)').run(config.adminEmail, hash, nowIso())
    }
    audit(db, config.adminEmail, 'password_reset', 'from environment')
    log.warn(`The password for ${config.adminEmail} was reset from the environment. Remove ADMIN_PASSWORD_RESET and ADMIN_PASSWORD now; you will be asked to choose a new password at login.`)
    return 'reset'
  }

  if (count === 0) {
    if (!config.adminEmail || !config.adminPassword) {
      log.warn('No admin login exists yet. Set ADMIN_EMAIL and ADMIN_PASSWORD (12 or more characters) and restart to create the first one.')
      return 'none'
    }
    const problem = passwordProblem(config.adminPassword, config.adminEmail)
    if (problem) throw new Error('ADMIN_PASSWORD: ' + problem)
    db.prepare('INSERT INTO admins (email, password_hash, must_change_password, created_at) VALUES (?, ?, 1, ?)').run(config.adminEmail, hashPassword(config.adminPassword), nowIso())
    audit(db, config.adminEmail, 'admin_created', 'first admin from environment')
    log.log(`Created the first admin login for ${config.adminEmail}. You will be asked to change the password when you first sign in.`)
    return 'created'
  }

  if (config.adminPassword) log.warn('ADMIN_PASSWORD is no longer used; remove it from your environment.')
  return 'existing'
}
