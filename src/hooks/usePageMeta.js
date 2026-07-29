import { useEffect } from 'react'

// Sets document.title, meta description, and the body class the legacy
// stylesheets key off (home-editorial / subpage-modern / consulting-body).
export function usePageMeta({ title, description, bodyClass }) {
  useEffect(() => {
    if (title) document.title = title
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }
  }, [title, description])

  // Body class must be present before first paint or the page flashes unstyled.
  if (typeof document !== 'undefined' && bodyClass && document.body.className !== bodyClass) {
    document.body.className = bodyClass
  }
}
