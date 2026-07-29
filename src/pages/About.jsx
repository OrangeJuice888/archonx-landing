import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'

// No 02.3 — the four evidence clauses behind "The Problem". `delay` is the
// stagger each card animates on; the first one leads, so it has none.
const CLAUSES = [
  {
    no: 'Productivity',
    title: 'Slowest decade in 60 years',
    body: <>Australia's productivity growth in the decade to 2020 was the slowest in six decades &mdash; teams work harder while throughput stalls. (Productivity Commission)</>,
  },
  {
    no: 'Cost',
    title: '146,700 serious claims a year',
    body: <>More than 400 serious workers' compensation claims are lodged every day, each costing a median A$16,300 and 7.4 weeks of lost work. (Safe Work Australia, 2023&ndash;24)</>,
    delay: '0.05s',
  },
  {
    no: 'Control',
    title: 'A new legal duty to manage risk',
    body: <>Since 2022, Australian WHS regulations impose a positive duty on employers to proactively manage psychosocial hazards &mdash; a duty passive dashboards cannot discharge.</>,
    delay: '0.1s',
  },
  {
    no: 'Workforce',
    title: 'Burnout at 1 in 2',
    body: <>Half of Australian workers report burnout in the past year, and psychological claims are up 161% in a decade with 35.7 weeks median absence. (Beyond Blue &middot; Safe Work Australia)</>,
    delay: '0.15s',
  },
]

// No 02.4 — the three pillars the solution stands on, keyed by their index label.
const PILLARS = [
  {
    index: '02.4a',
    title: <>Master Workflows</>,
    body: <>AI agents direct human agents in real-time, optimising task distribution for absolute adherence to performance metrics.</>,
  },
  {
    index: '02.4b',
    title: <>Hazard &amp; Risk Management</>,
    body: <>Dual-layered A/V monitoring for physical environments and psychosocial detection - identifying risks before they become liabilities.</>,
    delay: '0.1s',
  },
  {
    index: '02.4c',
    title: <>Bespoke Management Personas</>,
    body: <>Custom-trained AI that reflects your company's unique culture, knowledge, tone, and directives - not generic, robotic interfaces.</>,
    delay: '0.2s',
  },
]

export default function About() {
  usePageMeta({
    title: 'About - ArchonX.ai | Australia',
    description: 'Learn about ArchonX.ai - the Australian autonomous AI-driven workforce management platform redefining corporate governance and operational perfection.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — No 02 ===================== */}
      <ChapterCover
        no={<>&#8470; 02 / 07</>}
        ghost="VISION"
        plate="/assets/vision-bg.svg"
        lines={[
          <>The ultimate standard</>,
          <>in automated</>,
          <>leadership.</>,
        ]}
        dek={<>ArchonX.ai is the fundamental, unshakable operating system that modern businesses must be built upon. It's not just an HR tool - it covers efficiency entirely.</>}
        aside={
          <>
            <span className="ed-kicker">[ The Vision ]</span>
            <span className="ed-kicker">Chapter 02 &mdash; Read in order</span>
          </>
        }
      />

      {/* ===================== No 02.1 — THE NAME ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="02.1" label="The Name" />
          <div className="edc-spread">
            <div className="edc-spread-rail reveal-up">
              <span className="ed-bignum">02.1</span>
              <h2 className="ed-title">The Name</h2>
            </div>
            <div className="edc-prose reveal-up" style={{ '--delay': '0.1s' }}>
              <p><strong>Archon</strong> - Ancient Greek for <em>Ruler</em> or <em>Commander</em>. It represents the authoritative, guiding intelligence that acts as the ultimate supervisor, leading workers to peak performance while managing safety and well-being through custom-trained AI personalities.</p>
              <p><strong>X (Ten)</strong> - The Roman numeral 10. It symbolizes scale, absolute power, control, completion, and flawless execution. It grounds our high-tech identity in the Base-10 numerical system - the foundation of all human-centric computing.</p>
              <p>Together, ArchonX represents the pinnacle of intelligent corporate governance and operational perfection - <strong>absolute operational authority and comprehensive system control</strong>.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== No 02.2 — THE ORIGIN ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="02.2" label="The Origin" />
          <div className="edc-spread">
            <div className="edc-spread-rail reveal-up">
              <span className="ed-bignum">02.2</span>
              <h2 className="ed-title">The Origin</h2>
            </div>
            <div className="edc-prose reveal-up" style={{ '--delay': '0.1s' }}>
              <p>Born from the realization that modern enterprise operations are chaotic and traditional management simply cannot keep up. Achieving operational perfection requires a flawless, all-seeing authority - a true "Big Boss."</p>
              <p>We reimagined the concept of omnipresent oversight and engineered it for corporate good. Using unblinking audio and visual monitoring, ArchonX protects and optimises - watching for physical safety hazards and signs of human burnout, then instantly re-routing tasks for maximum efficiency.</p>
            </div>
          </div>
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">Our philosophy: <strong>true authority is real-time awareness that keeps business running perfectly and people operating safely</strong>.</blockquote>
          </div>
        </div>
      </Section>

      {/* ===================== No 02.3 — THE PROBLEM ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">02</Parallax>
        <div className="ed-container">
          <SectionHead no="02.3" label="The Problem" bignum="02.3" title="The Problem" />
          <div className="edc-prose reveal-up">
            <p>Work-related injury and illness leaves Australia's economy <strong>A$28.6 billion smaller every year</strong> &mdash; 1.6% of GDP (Safe Work Australia / Deloitte Access Economics). Mental ill-health and suicide cost a further <strong>A$200&ndash;220 billion a year</strong> (Productivity Commission). Passive tools report these problems only after the damage is done.</p>
          </div>
          <div className="ed-clauses" style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
            {CLAUSES.map((clause) => (
              <article
                key={clause.no}
                className="ed-clause reveal-up"
                style={clause.delay ? { '--delay': clause.delay } : undefined}
              >
                <span className="edc-clause-no">{clause.no}</span>
                <h3 className="ed-clause-title">{clause.title}</h3>
                <div className="ed-clause-body">
                  <p>{clause.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== No 02.4 — THE SOLUTION ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="02.4" label="The Solution" bignum="02.4" title="The Solution" />
          <div className="edc-prose reveal-up">
            <p>An integrated autonomous management system built on three core pillars that transforms management into a closed-loop, automated engine:</p>
          </div>
          <div className="ed-lexicon" style={{ marginTop: 'clamp(40px, 5vw, 64px)' }}>
            {PILLARS.map((pillar) => (
              <article
                key={pillar.index}
                className="ed-entry reveal-up"
                style={pillar.delay ? { '--delay': pillar.delay } : undefined}
              >
                <span className="ed-entry-index">{pillar.index}</span>
                <h3>{pillar.title}</h3>
                <p>{pillar.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== No 02.5 — EXECUTIVE SUMMARY ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="02.5" label="Executive Summary" />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <h2 className="ed-quote">Autonomous workforce management with active, AI-driven leadership.</h2>
          </div>
          <div className="edc-prose reveal-up" style={{ marginTop: '32px', '--delay': '0.1s' }}>
            <p>ArchonX acts as the frontline supervisor for efficiency and safety. Built in Australia for Australian operating conditions and WHS compliance, it targets high-liability, high-volume sectors - delivering a closed-loop efficiency engine unlike passive HR software or siloed camera systems. Scalable B2B Enterprise SaaS with premium integration and tiered licensing.</p>
          </div>
          <div className="reveal-up" style={{ marginTop: '48px', '--delay': '0.15s' }}>
            <Magnetic to="/protocol" className="ed-btn ed-btn--solid">Explore the Protocol <span className="ed-arrow">&rarr;</span></Magnetic>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER ===================== */}
      <NextChapter
        to="/protocol"
        label={<>Next &mdash; &#8470; 03 / 07</>}
        title="The Archon Protocol"
      />

      <EdFooter />
    </>
  )
}
