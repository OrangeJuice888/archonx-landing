// Versioned site content. Every save is a new row; the served content is the newest row
// deep-merged over the committed defaults, so a new default key appears without a migration.
import { nowIso } from './db.js'
import { deepMerge } from './content-schema.js'

export function createContentStore({ db, defaults }) {
  let cache = null

  const count = db.prepare('SELECT COUNT(*) AS n FROM content_versions').get().n
  if (count === 0) {
    db.prepare('INSERT INTO content_versions (content_json, created_at, created_by, summary) VALUES (?, ?, ?, ?)')
      .run(JSON.stringify(defaults), nowIso(), 'system', 'Seeded from content/site-content.json')
  }

  function current() {
    if (cache) return cache
    const row = db.prepare('SELECT version, content_json AS json, created_at AS updatedAt, created_by AS updatedBy FROM content_versions ORDER BY version DESC LIMIT 1').get()
    cache = { version: row.version, updatedAt: row.updatedAt, updatedBy: row.updatedBy, content: deepMerge(defaults, JSON.parse(row.json)) }
    return cache
  }

  function save(content, by, summary = '') {
    const at = nowIso()
    const r = db.prepare('INSERT INTO content_versions (content_json, created_at, created_by, summary) VALUES (?, ?, ?, ?)')
      .run(JSON.stringify(content), at, by, summary)
    cache = null
    return { version: Number(r.lastInsertRowid), updatedAt: at }
  }

  function listVersions(limit = 50) {
    return db.prepare('SELECT version, created_at AS createdAt, created_by AS createdBy, summary FROM content_versions ORDER BY version DESC LIMIT ?').all(limit)
  }

  function getVersion(version) {
    const row = db.prepare('SELECT version, content_json AS json, created_at AS createdAt, created_by AS createdBy, summary FROM content_versions WHERE version = ?').get(version)
    if (!row) return null
    return { version: row.version, content: deepMerge(defaults, JSON.parse(row.json)), createdAt: row.createdAt, createdBy: row.createdBy, summary: row.summary }
  }

  return { current, save, listVersions, getVersion, defaults }
}
