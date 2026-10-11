import { Link } from 'react-router-dom'
import { FOOTER_COLUMNS } from '../data/navigation.js'

// Editorial footer that closes every chapter.
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
                {links.map(({ to, href, label, reload, external }) => (
                  <li key={label}>
                    {to
                      ? (reload ? <a href={`${to}/`}>{label}</a> : <Link to={to}>{label}</Link>)
                      : external
                        ? <a href={href} target="_blank" rel="noopener">{label}</a>
                        : <a href={href}>{label}</a>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ed-footer-bottom">
          <p>&copy; 2026 ArchonX. Brisbane, Australia.</p>
          <p className="ed-colophon">Figures from ABS, National AI Centre, Intuit QuickBooks, Xero and CPA Australia</p>
          <p className="ed-footer-legal"><Link to="/privacy">Privacy</Link> &middot; <Link to="/terms">Terms</Link></p>
        </div>
      </div>
    </footer>
  )
}
