import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { NAV_LINKS } from '../data/navigation.js'

// Faithful port of the legacy navbar. On the home route it starts
// transparent, gains .scrolled past 60px, and swaps ink/paper theme by
// probing which [data-nav] section sits under the bar — same as script.js.
// On subpages it is permanently .scrolled, as in the original HTML.
export default function Navbar() {
  const { pathname } = useLocation()
  // Every route except the /consultation pages now uses the editorial
  // ink/paper system: transparent bar over the ink cover, theme probed per
  // section.
  const isEditorial = !pathname.startsWith('/consultation')
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(!isEditorial)
  const [paper, setPaper] = useState(false)

  useEffect(() => {
    setOpen(false)
    if (!isEditorial) {
      setScrolled(true)
      setPaper(false)
      return
    }
    setScrolled(window.scrollY > 60)

    let queued = false
    const probeTheme = () => {
      queued = false
      const probe = 26
      let theme = 'ink'
      for (const sec of document.querySelectorAll('[data-nav]')) {
        const rect = sec.getBoundingClientRect()
        if (rect.top <= probe && rect.bottom > probe) {
          theme = sec.dataset.nav
          break
        }
      }
      setPaper(theme === 'paper')
    }
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      if (!queued) {
        queued = true
        requestAnimationFrame(probeTheme)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    probeTheme()
    // Re-probe once the incoming page has mounted (AnimatePresence keeps the
    // outgoing page's sections in the DOM for ~220ms during exit).
    const settle = setTimeout(probeTheme, 500)
    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(settle)
    }
  }, [isEditorial, pathname])

  const navClass = ['navbar', scrolled ? 'scrolled' : '', paper ? 'navbar--paper' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <nav className={navClass} id="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" id="nav-logo" aria-label="ArchonX home">
          <img src="/assets/archonx-logo-mark-4k.png" alt="" className="logo-mark" />
          <span className="logo-text">ArchonX</span>
        </Link>
        <ul className={open ? 'nav-links open' : 'nav-links'} id="nav-links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="nav-link" onClick={() => setOpen(false)}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          className={open ? 'nav-toggle open' : 'nav-toggle'}
          id="nav-toggle"
          aria-label="Toggle Navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
