import { useEffect } from 'react'

// The ArchonX Consulting page is a standalone static page (public/consultation/index.html,
// served at /consultation/) with its own nav, globe hero, free audit and forms. This route only
// hands over to it, so client-side links to /consultation (NextChapter, old bookmarks,
// /consultation.html) land on the new page. Old in-page anchors map to the new sections.
const HASH_MAP = {
  '#consultation-form': '#book',
  '#frameworks': '#services',
  '#process': '#how-it-works',
  '#benefits': '#about',
}

export default function Consultation() {
  useEffect(() => {
    const { pathname, hash } = window.location
    const target = HASH_MAP[hash] || hash
    // In production GitHub Pages serves /consultation/ as a static file. The dev server
    // falls back to the SPA there instead, so ask for the file itself to avoid a loop.
    const page = pathname.endsWith('/') ? '/consultation/index.html' : '/consultation/'
    window.location.replace(page + target)
  }, [])

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', background: '#060707', color: '#efefef' }}>
      <p>
        Opening ArchonX Consulting&hellip; <a href="/consultation/" style={{ color: '#fff' }}>Continue</a>
      </p>
    </main>
  )
}
