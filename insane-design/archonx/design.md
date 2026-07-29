---
schema_version: 3.1
service_name: ArchonX Command Ledger
source_url: http://localhost:3000 (styles-home.css — the site's own home page)
medium: web
primary_font: Inter
display_weight: 800
meta_font: Space Grotesk
meta_weight: 500
body_weight: 400
brand_color: "#0a0a0a"
bg: "#ffffff"
fg: "#0a0a0a"
radius_sm: 0px
radius_md: 0px
radius_lg: 0px
---

# ArchonX — Command Ledger Design System

Extracted from the live home page CSS (`styles-home.css`, body.home-editorial).
Every hex, size, and easing below exists in the shipped stylesheet — nothing invented.

## §00 Visual Theme

**Editorial Command.** A monochrome broadsheet for an AI that commands
operations: ruled hairlines, numbered clauses, tabular figures, uppercase
micro-labels, ghost outline type. The page reads like a field manual issue —
"№ 03 / Core Capabilities" — not like a SaaS template. Two poles only: ink
(#0a0a0a) and paper (#ffffff); authority comes from typographic extremes and
rules, never from color, gradients, or rounded chrome.

Key characteristics:
- Ink/paper alternating sections; hairline rules (1px) structure everything
- Numbered everything: sections (01–08), clauses (03.1, 03.2a), index rows
- Typographic extremes: 800-weight uppercase display at clamp(36px→118px)
  against 11px/0.18em uppercase Space Grotesk meta labels
- Ghost type: transparent fill + 1px text-stroke for emphasis words
- Zero border-radius, zero drop shadows, zero accent color

## §01 Quick Start

- Fonts: `Inter` (display 800 / body 400) + `Space Grotesk` (meta labels 500)
- Poles: ink `#0a0a0a` on paper `#ffffff` — inverted for ink sections
- Greys: `#141414` `#f4f4f4` `#4a4a4a` `#6b6b6b` `#9c9c9c` `#c9c9c9`
- Rules: `rgba(10,10,10,0.15)` on paper, `rgba(255,255,255,0.18)` on ink
- Ease: `cubic-bezier(0.16, 1, 0.3, 1)` (--ed-ease)

## §11 Layout Patterns

- Container: max-width 1320px, padding-inline clamp(20px, 4vw, 56px)
- Section header ritual (every section): 1px full-width rule → meta row
  (`№ NN / Title` left, running title right, 11px uppercase) → oversized
  section numeral (clamp(56px, 7vw, 96px), grey #c9c9c9) beside the title
- Ink sections (`#0a0a0a` bg, white type) alternate with paper sections;
  drastic pole flips, never mid-greys as backgrounds
- Ledger rows: grid `letter | crisis | → | solution` with hairline dividers
- Index rows: grid `num | name | description | metrics | →` — full-bleed rows
  divided by hairlines, not cards
- Termsheet: label/value rows divided by hairlines
- Ghost numerals: oversized section numbers (or outline words) positioned
  absolute behind content, aria-hidden
- Stat blocks: clamp(72px, 9vw, 150px) tabular numerals with sup symbols and
  11px uppercase captions

## §12 Responsive

- Breakpoints: 1024px (grids collapse to single column), 768px (type scale
  floors, masthead stacks), 480px
- Meta rows stay horizontal; multi-column grids collapse; rules stay full-width
- Touch targets ≥ 44px on nav and index rows

## §13 Components

- **Buttons** (`.ed-btn`): Space Grotesk 13px/500/0.12em uppercase,
  padding 16px 32px, radius 0. Variants: solid (ink bg on paper / paper bg on
  ink), outline (1px current-color border), bare (text + arrow). Arrow glyph
  `→` shifts +4px on hover.
- **Section head** (`.ed-sechead`): rule + meta + bignum + title (see §11)
- **Entry/clause cards**: no boxes — hairline-topped columns with index
  numeral (01.1), h3, body; tag in brackets `[ AI-Powered Routing ]`
- **Gauge**: 1px track, ink fill bar, `NN / 100` caption in tabular numerals
- **Quote block**: dash rule, clamp(36px,5vw,72px) quote with underlined
  emphasis, attribution in meta type
- **Nav/footer**: existing shared components — do not modify

## §14 Content Voice

Declarative, imperial, numbered. "Eight theatres of command." "The stakes,
measured." Meta labels: `№ 02 / The Crisis → The Solution`. Keep all existing
copy verbatim — voice guidance applies only to markup emphasis choices.

## §15 Drop-in CSS

```css
:root {
  --ink: #0a0a0a;
  --paper: #ffffff;
  --ink-dim: #141414;
  --paper-dim: #f4f4f4;
  --grey-600: #4a4a4a;
  --grey-500: #6b6b6b;
  --grey-400: #9c9c9c;
  --grey-300: #c9c9c9;
  --rule-light: rgba(10, 10, 10, 0.15);
  --rule-dark: rgba(255, 255, 255, 0.18);
  --t-hero: clamp(36px, 8.2vw, 118px);
  --t-display: clamp(40px, 5.5vw, 76px);
  --t-quote: clamp(36px, 5vw, 72px);
  --t-stat: clamp(72px, 9vw, 150px);
  --t-bignum: clamp(56px, 7vw, 96px);
  --t-index-title: clamp(24px, 3vw, 40px);
  --ed-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --nav-height: 52px;
}
```

## §17 Agent Prompt

Implement pages as React components (JSX) using the framer-motion primitives
in `src/motion/` and page-scoped CSS files that extend the tokens above.
Meta type = Space Grotesk 11px 500 0.18em uppercase. Display = Inter 800
uppercase, letter-spacing -0.04em, line-height ≤ 1.0. All numerals
tabular-nums. Rules are 1px, full-width, and animate scaleX 0→1 on reveal.

## §18 DO / DON'T

DO:
- Alternate pure ink and pure paper sections
- Number every section and clause; use `№` meta rows
- Use hairline rules as the primary structural device
- Use ghost/outline type (text-stroke) for emphasis display words
- Use tabular numerals for every figure
- Uppercase all display headlines and meta labels

DON'T:
- **No border-radius above 0** on any redesigned surface (radius stays 0)
- **No box-shadow** anywhere in redesigned pages
- **No color accents**: never use #0071e3, #0077ed, or any hue — monochrome only
- **No purple/violet gradients** (no linear-gradient with #667eea/#764ba2 or
  any hued gradient)
- **No mid-grey section backgrounds**: section backgrounds are only #0a0a0a,
  #141414, #ffffff, or #f4f4f4 — never #6b6b6b-range greys
- **No generic card grids**: no boxed image+title+text+button cards; use
  ruled rows and hairline columns
- **No new fonts**: only Inter and Space Grotesk (plus existing Cormorant
  Garamond on the untouched consultation page)
- **No lowercase COVER/HERO headlines**: h1 cover titles, offering titles, and
  next-chapter titles are uppercase (Inter 800). Section h2s (`.ed-title`) are
  sentence case — that is the shipped system convention on the home page and
  applies site-wide.
