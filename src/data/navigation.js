// Single source of truth for site navigation, shared by the navbar and both
// footers so a route change can't leave one of them stale.
//
// The business runs as two named divisions:
//   ArchonX Lab        — the product suite (Bluework, Argos-5, ArchonX)
//   ArchonX Consulting — services and custom builds for individual clients
//
// `reload: true` marks a link to a standalone static page outside the React app
// (the consulting page at /consultation/), so it renders as a plain <a> that
// loads the page instead of a client-side <Link>.

export const NAV_LINKS = [
  { to: '/about', label: 'About' },
  { to: '/protocol', label: 'Protocol' },
  { to: '/markets', label: 'Markets' },
  { to: '/competitive', label: 'Advantage' },
  { to: '/consultation', label: 'Consulting', reload: true },
  { to: '/invest', label: 'Investors' },
]

export const FOOTER_COLUMNS = [
  {
    heading: 'ArchonX Lab',
    links: [
      { to: '/protocol', label: 'Archon Protocol' },
      { to: '/markets', label: 'Markets' },
      { to: '/competitive', label: 'Advantage' },
    ],
  },
  {
    heading: 'ArchonX Consulting',
    links: [
      { to: '/consultation', label: 'Start a Consultation', reload: true },
      { to: '/consultation/products', label: 'Custom Products' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/invest', label: 'Investors' },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { href: 'mailto:hello@archonx.ai', label: 'hello@archonx.ai' },
      { href: '#', label: 'LinkedIn' },
      { href: '#', label: 'Twitter / X' },
    ],
  },
]

export const CONTACT_EMAIL = 'hello@archonx.ai'
