// SQLite through the built-in node:sqlite module (Node 22.13+). One process, one file.
import * as sqlite from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const Database = sqlite.Database ?? sqlite.DatabaseSync

const SCHEMA = `
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS sessions_admin ON sessions(admin_id);
CREATE TABLE IF NOT EXISTS content_versions (
  version INTEGER PRIMARY KEY AUTOINCREMENT,
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  summary_json TEXT NOT NULL DEFAULT '{}',
  page TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT NOT NULL DEFAULT '',
  ip_hash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created ON leads(created_at);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  at TEXT NOT NULL,
  admin_email TEXT,
  action TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT ''
);
`

export const nowIso = () => new Date().toISOString()

export function openDb(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
  const db = new Database(path)
  db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA synchronous=NORMAL;')
  db.exec(SCHEMA)
  return db
}

export function audit(db, adminEmail, action, detail = '') {
  const text = typeof detail === 'string' ? detail : JSON.stringify(detail)
  db.prepare('INSERT INTO audit_log (at, admin_email, action, detail) VALUES (?, ?, ?, ?)').run(nowIso(), adminEmail ?? null, action, text)
}

export function listAudit(db, limit = 100) {
  return db.prepare('SELECT id, at, admin_email AS adminEmail, action, detail FROM audit_log ORDER BY id DESC LIMIT ?').all(limit)
}

/** Escapes a LIKE pattern parameter; use with `LIKE ? ESCAPE '\'`. */
export function likeEscape(s) {
  return String(s).replace(/[\\%_]/g, (c) => '\\' + c)
}

/** Writes a consistent copy of the database to `path` (works for file and in-memory databases). */
export function backupTo(db, path) {
  const quoted = String(path).replace(/'/g, "''")
  db.exec(`VACUUM INTO '${quoted}'`)
}
