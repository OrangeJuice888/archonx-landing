// Shared framer-motion presets tuned to match the site's existing CSS motion
// language: cubic-bezier(0.16, 1, 0.3, 1) style easing, restrained distances.

export const ED_EASE = [0.16, 1, 0.3, 1]

export const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12, margin: '0px 0px -30px 0px' },
  transition: { duration: 0.7, ease: ED_EASE, delay },
})

export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.8, ease: 'easeOut', delay },
})

// Smooth-scroll helper for same-page anchors, matching the legacy 60px
// navbar offset. Use on <a href="#id"> clicks.
export function smoothScrollTo(hash) {
  const target = document.querySelector(hash)
  if (!target) return
  const pos = target.getBoundingClientRect().top + window.scrollY - 60
  window.scrollTo({ top: pos, behavior: 'smooth' })
}

export function handleHashClick(e) {
  const href = e.currentTarget.getAttribute('href')
  if (href && href.startsWith('#') && href.length > 1) {
    e.preventDefault()
    smoothScrollTo(href)
  }
}
