import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS } from '../data/navigation.js'

// Editorial footer — the colophon that closes every chapter.
export default function EdFooter() {
  return (
    <footer className="ed-footer" id="footer" data-nav="ink">
      <div className="ed-container">
        <div className="ed-footer-grid">
          <div className="ed-footer-brand">
            <Link to="/" className="nav-logo">
              <img src="/assets/archonx-logo-mark-4k.png" alt="" className="logo-mark" />
              <span className="logo-text">ArchonX</span>
            </Link>
            <p className="ed-footer-tagline">
              <span>Driven by Data</span>
              <span>Orchestrated by Intelligence</span>
              <span>Built for Efficiency</span>
            </p>
          </div>
          {FOOTER_COLUMNS.map(({ heading, links }) => (
            <div className="ed-footer-col" key={heading}>
              <h4>{heading}</h4>
              <ul>
                {links.map(({ to, href, label }) => (
                  <li key={label}>
                    {/* href="#" marks a profile that doesn't exist yet; an <a>
                        without href keeps the styling but is inert. */}
                    {to ? <Link to={to}>{label}</Link> : href === '#' ? <a>{label}</a> : <a href={href}>{label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ed-footer-bottom">
          <p>&copy; 2026 ArchonX.ai &mdash; Australia &mdash; All rights reserved</p>
          <p className="ed-colophon">Data: Safe Work Australia &middot; ABS &middot; Productivity Commission &middot; Comcare &middot; Beyond Blue &mdash; &#8470; 07 / 07</p>
          <p className="ed-footer-legal"><Link to="/privacy">Privacy</Link> &mdash; <Link to="/terms">Terms</Link></p>
        </div>
      </div>
    </footer>
  )
}
