// Single source of truth for site navigation, shared by the navbar and both
// footers so a route change can't leave one of them stale.
//
// The business runs as two named arms:
//   ArchonX Lab        — the software arm: Bluework and custom-built systems
//   ArchonX Consulting — implementation: AI reception, admin automation,
//                        workflows and app launch for individual clients
//
// `reload: true` marks a link to a standalone static page outside the React app
// (the consulting page at /consultation/), so it renders as a plain <a> that
// loads the page instead of a client-side <Link>. `external: true` opens an
// outside site in a new tab.

export const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/protocol', label: 'Protocol' },
  { to: '/markets', label: 'Markets' },
  { to: '/competitive', label: 'Advantage' },
  { to: '/consultation', label: 'Consulting', reload: true },
]

export const FOOTER_COLUMNS = [
  {
    heading: 'ArchonX Lab',
    links: [
      { href: 'https://bluework.com.au', label: 'Bluework', external: true },
      { to: '/protocol', label: 'Archon Protocol' },
      { to: '/markets', label: 'Markets' },
      { to: '/competitive', label: 'Advantage' },
    ],
  },
  {
    heading: 'ArchonX Consulting',
    links: [
      { to: '/consultation', label: 'Start a Consultation', reload: true },
      { href: '/consultation/#audit', label: 'Free AI Audit' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Service' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { href: 'mailto:hello@archonx.ai', label: 'hello@archonx.ai' },
      { href: 'https://www.linkedin.com/company/archonx/', label: 'LinkedIn', external: true },
    ],
  },
]

export const CONTACT_EMAIL = 'hello@archonx.ai'
