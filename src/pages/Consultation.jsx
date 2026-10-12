import { useEffect } from 'react'

// The ArchonX Consulting page is a standalone static page (public/consultation/index.html,
// served at /consultation/) with its own nav, globe hero, free audit and forms. This route only
// hands over to it, so old bookmarks (/consultation, /consultation.html,
// /consultation/products) land on the new page. Old in-page anchors map to the new sections.
const HASH_MAP = {
  '#consultation-form': '#book',
  '#frameworks': '#services',
  '#process': '#how-it-works',
  '#benefits': '#about',
}

export default function Consultation() {
  useEffect(() => {
    const { pathname, hash } = window.location
    const target = HASH_MAP[hash] || hash || (pathname.startsWith('/consultation/products') ? '#services' : '')
    // In production GitHub Pages serves /consultation/ as a static file. The dev server
    // falls back to the SPA there instead, so ask for the file itself to avoid a loop.
    const page = pathname.endsWith('/') ? '/consultation/index.html' : '/consultation/'
    window.location.replace(page + target)
  }, [])

  // Render nothing: the browser is already leaving for the static page, and
  // a placeholder frame here showed up as a flash of an older page.
  return null
}
