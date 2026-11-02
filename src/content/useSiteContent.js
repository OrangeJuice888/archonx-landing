// Site content for the React pages: the committed defaults (src/content/defaults.json, generated
// from content/site-content.json) with the live content from the admin backend merged over
// them once it arrives. One fetch per page load; never throws; defaults until the response.
import { useEffect, useState } from 'react'
import defaults from './defaults.json'

const API_URL = String(import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')
const FORBIDDEN = new Set(['__proto__', 'constructor', 'prototype'])

let cache = defaults
let pending = null
const listeners = new Set()

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

function merge(base, over) {
  if (!isPlain(base) || !isPlain(over)) return over === undefined ? base : over
  const out = {}
  for (const key of Object.keys(base)) out[key] = base[key]
  for (const key of Object.keys(over)) {
    if (FORBIDDEN.has(key)) continue
    out[key] = isPlain(base[key]) && isPlain(over[key]) ? merge(base[key], over[key]) : over[key]
  }
  return out
}

function load() {
  if (!API_URL || typeof fetch !== 'function') return Promise.resolve(cache)
  if (pending) return pending
  const signal = typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined
  pending = fetch(`${API_URL}/api/content`, { headers: { Accept: 'application/json' }, signal })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const live = data && isPlain(data.content) ? data.content : null
      if (live) {
        cache = merge(defaults, live)
        listeners.forEach((fn) => fn(cache))
      }
      return cache
    })
    .catch(() => cache)
  return pending
}

export function useSiteContent() {
  const [content, setContent] = useState(cache)
  useEffect(() => {
    listeners.add(setContent)
    if (cache !== content) setContent(cache)
    load()
    return () => { listeners.delete(setContent) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return content
}

export { defaults as siteDefaults }
