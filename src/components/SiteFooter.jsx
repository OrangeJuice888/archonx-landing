import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS } from '../data/navigation.js'

// Subpage footer — identical markup to the legacy shared footer.
export default function SiteFooter() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="nav-logo">
              <img src="/assets/archonx-logo-mark-4k.png" alt="" className="logo-mark" />
              <span className="logo-text">ArchonX</span>
            </Link>
            <p className="footer-tagline">Driven by Data. Orchestrated by Intelligence. Built for Efficiency.</p>
          </div>
          {FOOTER_COLUMNS.map(({ heading, links }) => (
            <div className="footer-links-group" key={heading}>
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
        <div className="footer-bottom">
          <p>&copy; 2026 ArchonX.ai - All rights reserved.</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
