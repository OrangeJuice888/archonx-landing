# ArchonX — Legacy HTML → React Port Guide

Every page in `legacy/*.html` is ported to a React component in `src/pages/`.
**Prime directive: the rendered page must be visually identical to the legacy
page at rest.** All legacy CSS (`styles.css`, `styles-home.css`) is loaded
globally and unchanged — so preserving markup structure, class names, ids and
attributes preserves the design. Motion is layered on top, never at the cost
of fidelity.

## What a page component looks like

```jsx
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import SiteFooter from '../components/SiteFooter.jsx'
import { Magnetic, TiltCard, Parallax, AnimatedCounter, GaugeFill, handleHashClick } from '../motion/index.js'

export default function About() {
  usePageMeta({
    title: 'About - ArchonX.ai | Australia',            // from legacy <title>
    description: '…',                                    // from legacy meta description
    bodyClass: 'subpage-modern',                         // from legacy <body class="…">
  })
  return (
    <>
      {/* all sections between </nav> and <footer> from the legacy file */}
      <SiteFooter />
    </>
  )
}
```

- Do NOT render a `<nav>` — `App.jsx` renders the shared `Navbar`.
- Subpages end with `<SiteFooter />`. The home page ends with `<EdFooter />`
  (`src/components/EdFooter.jsx`).
- Do NOT include `<script>` tags. Do NOT wrap the page in extra divs
  (`App.jsx` already wraps each route in `PageTransition`).

## Markup conversion rules (strict)

1. Port **every** section between `</nav>` and the footer, in order, with
   **all text content verbatim** — including HTML entities (`&mdash;`,
   `&middot;`, `&#8470;`, `&rarr;` …); JSX renders them fine. Never reword,
   reorder, or drop copy.
2. `class` → `className`, `for` → `htmlFor`. Keep every class name exactly,
   including `reveal-up` / `reveal-left` / `reveal-right` (the scaffold's
   IntersectionObserver adds `.revealed`, driving the existing CSS reveals and
   CSS grid staggers — do not remove these classes, do not add `.revealed`).
3. Keep all `id`, `aria-*`, `data-*` attributes (`data-nav` etc.).
4. Inline styles → objects: `style="--delay: 0.1s"` → `style={{ '--delay': '0.1s' }}`,
   `style="background: var(--text); color: #fff;"` → `style={{ background: 'var(--text)', color: '#fff' }}`.
5. Self-close void elements: `<br/>`, `<img … />`, `<input … />`.
6. HTML comments `<!-- x -->` → `{/* x */}`.
7. Links:
   - `href="somepage.html"` → `<Link to="/somepage">` (import from react-router-dom); `index.html` → `/`.
   - `href="somepage.html#hash"` → `<Link to="/somepage#hash">`.
   - Same-page anchors `href="#id"` → keep `<a href="#id" onClick={handleHashClick}>` (60px-offset smooth scroll).
   - `mailto:` and external links stay plain `<a>`.
8. Asset paths: `assets/…` → `/assets/…` (also for `<source src>`, poster, etc.).
9. `<video autoplay muted loop playsinline preload="auto">` →
   `<video autoPlay muted loop playsInline preload="auto">`.
10. `<textarea>`/`<select>`/`<input>`: keep uncontrolled, keep `name`,
    `required`, `autocomplete` → `autoComplete`, `rows`, etc. A `<select>` with
    a `selected` option → put `defaultValue` on the select instead.

## Motion layering (the point of the port)

Use these scaffold components — they render the *same tag and className*, so
CSS is unaffected. At rest nothing moves; interaction and scroll bring the
page to life.

- **Buttons / CTAs** (`.ed-btn`, `.btn`, `.consulting-cta` …):
  `<Magnetic to="/consultation" className="ed-btn ed-btn--solid">Label <span className="ed-arrow">&rarr;</span></Magnetic>`
  (`to=` for internal, `href=` for mailto/anchors; pass `onClick={handleHashClick}` for `#hash` hrefs).
- **Cards** (feature/pillar/stat cards — e.g. `.ed-clause`, `.ed-entry`,
  `.content-pillar`, `.problem-insight-item`, `.consulting-*-card`,
  product/market cards): `<TiltCard as="article" className="ed-clause reveal-up" style={{ '--delay': '0.05s' }} id="…">…</TiltCard>`.
  Keep the original tag via `as`. Skip TiltCard for full-width rows and text-only blocks.
- **Big decorative elements** (ghost numerals like `.ed-ghostnum`, background
  plates like `.ed-doctrine-plate`, oversized watermark text):
  `<Parallax as="span" className="ed-ghostnum" range={80} aria-hidden="true">03</Parallax>`,
  `<Parallax as="img" src="/assets/features-bg.png" alt="" className="ed-doctrine-plate" range={50} aria-hidden="true" />`.
- **Counters**: `<span class="counter" data-target="28.6" data-decimals="1">0</span>` →
  `<AnimatedCounter target={28.6} decimals={1} className="counter" />`
  (same for `hero-stat-value`: pass `className="hero-stat-value"`).
- **Gauges**: `<div class="ed-gauge-fill" data-percent="12"></div>` →
  `<GaugeFill percent={12} />`.
- **Row links** (index rows like `.ed-index-row`, list rows that link):
  convert to `motion.create(Link)` or wrap arrow interactions with
  `whileHover={{ x: 6 }}` on the row — subtle, spring-free is fine — OR leave
  plain `<Link>` if CSS already has a hover treatment. Never change layout.
- Everything with `reveal-up` classes animates via the scaffold observer —
  no extra work needed.

Do not invent new visible elements, text, colors, or spacing. Motion must be
subtle and must degrade gracefully (`prefers-reduced-motion` is respected by
the scaffold components where relevant).

## Special cases

- **Home** (`legacy/index.html`): `bodyClass: 'home-editorial'`, footer is
  `<EdFooter />`. Keep `data-nav` attributes on every section — the navbar
  theme probe depends on them. Keep the hero `.ed-line`/`.ed-line-inner`
  structure verbatim (CSS animates it on load). Hero stats use
  `AnimatedCounter className="hero-stat-value"`.
- **Consultation** (`legacy/consultation.html`): `bodyClass: 'subpage-modern consulting-body'`.
  Replace `<div class="consulting-data-orb" data-consulting-orb></div>` with
  `<ConsultationOrb />` from `../components/ConsultationOrb.jsx`. Keep the
  mailto form uncontrolled exactly as-is (`action`, `method`, `encType`).
- **Privacy / Terms**: plain text pages — port faithfully, reveal classes do
  the motion; no TiltCard needed.

## Definition of done for a page

- All legacy copy present, byte-for-byte (entities included).
- All class names / ids / data attributes preserved.
- Links converted per rule 7; assets per rule 8.
- Motion components imported from `../motion/index.js` and used per above.
- Valid JSX: default-exported component, no stray HTML attributes
  (`class=`, `for=`, unclosed tags), file named as in `src/App.jsx` imports.
