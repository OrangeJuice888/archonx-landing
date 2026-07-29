import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'
import '../styles/pages/competitive.css'

// № 05.1 — the ledger of contrasts. Each entry is one .ed-clause article:
// the competition's status quo on the left, the ArchonX answer on the right.
// `delay` is absent on the first card (no inline style is emitted for it).
const CONTRASTS = [
  {
    no: '01',
    title: 'Active Command vs. Passive Reporting',
    competition: 'Workday, SAP SuccessFactors, Kronos - these are passive digital filing cabinets. They record data and generate reports after the fact. They don\'t take action. They don\'t lead.',
    way: 'An active management engine that takes autonomous action, issues real-time directives to human workers, and removes the middle-management bottleneck entirely. Not reporting - commanding.',
  },
  {
    no: '02',
    title: 'Holistic Safety',
    competition: 'Siloed solutions: computer vision products for physical safety in one vendor, text/sentiment analysis for mental health in another. No integration. No unified picture.',
    way: 'Dual-layered oversight in a single platform - video for physical and environmental hazards, hazard word and phrase detection for psychosocial stress, fatigue, and cognitive overload. Complete risk coverage, built to operationalise the psychosocial-hazard duty in Australia\'s WHS regulations.',
    delay: '0.05s',
  },
  {
    no: '03',
    title: 'Bespoke Leadership Personas',
    competition: 'Generic, robotic interfaces that feel impersonal and drive low adoption. One-size-fits-all AI that ignores company culture, tone, and unique operational context.',
    way: 'Custom-trained AI personas that embody each client company\'s culture, tone, and institutional knowledge. Improves morale, drives adoption, and leads with emotional intelligence.',
    delay: '0.1s',
  },
  {
    no: '04',
    title: 'Closed-Loop Efficiency',
    competition: 'Detect a hazard, generate an alert, wait for slow manual human intervention. The gap between detection and resolution is where accidents happen and productivity dies.',
    way: 'Closes the loop instantly. Re-routes workflows, reassigns tasks, enforces breaks - all in real-time without requiring human executive intervention. Detection to resolution in seconds, not hours.',
    delay: '0.15s',
  },
]

// № 05.3 — the land-and-expand ladder. Three .edc-tier cards, staggered.
const TIERS = [
  {
    name: 'BLUEWORK',
    meta: 'TIER 1 - Base',
    desc: 'Cognitive and psychosocial monitoring. Hazard word and phrase detection for stress detection and fatigue identification.',
    tag: '[ For teams starting with mental health monitoring ]',
  },
  {
    name: 'ARGOS-5',
    meta: 'TIER 2 - Professional',
    desc: 'Active oversight with physical hazard detection. Computer vision for PPE compliance, environmental monitoring, and real-time safety alerts.',
    tag: '[ For operations requiring dual-layered protection ]',
    delay: '0.05s',
  },
  {
    name: 'ARCHONX',
    meta: 'TIER 3 - The Archon Protocol',
    desc: 'Complete closed-loop automated management. Bespoke AI personas, total autonomous rerouting, and predictive liability modeling.',
    tag: '[ For enterprise and government ]',
    delay: '0.1s',
  },
]

export default function Competitive() {
  usePageMeta({
    title: 'Competitive Advantage - ArchonX.ai',
    description: 'How ArchonX differs from legacy HR tools: Active Command vs Passive Reporting, Holistic Safety, Bespoke Personas, and Closed-Loop Efficiency.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 05 ===================== */}
      <ChapterCover
        no={<>&#8470; 05 / 07</>}
        ghost="MOAT"
        plate="/assets/moat-bg.svg"
        lines={[
          <>We're not an <span className="ed-ghost">HR tool.</span></>,
          <>We're a management engine.</>,
        ]}
        dek={<>ArchonX replaces mid-level management entirely with a proprietary, end-to-end solution for absolute oversight. Here's how we differ from everything else on the market.</>}
        aside={<span className="ed-kicker">[ Our Moat ]</span>}
      />

      {/* ===================== № 05.1 — THE LEDGER OF CONTRASTS ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">05</Parallax>
        <div className="ed-container">
          <SectionHead
            no="05.1"
            label="The Ledger of Contrasts"
            bignum="05.1"
            title="The Ledger of Contrasts"
          />

          {CONTRASTS.map((c) => (
            <article
              key={c.no}
              className="ed-clause pgcompetitive-contrast reveal-up"
              style={c.delay ? { '--delay': c.delay } : undefined}
            >
              <span className="ed-clause-num">{c.no}</span>
              <div>
                <h3 className="ed-clause-title">{c.title}</h3>
                <span className="edc-clause-no">The Competition</span>
                <p className="ed-ledger-crisis pgcompetitive-crisis">{c.competition}</p>
              </div>
              <div className="ed-clause-body">
                <span className="edc-clause-no">The ArchonX Way</span>
                <p className="ed-ledger-solution pgcompetitive-way">{c.way}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ===================== № 05.2 — STRATEGIC SUMMARY ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead
            no="05.2"
            label="Strategic Summary"
            bignum="05.2"
            title="Strategic Summary"
          />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">
              Building a tool that <span className="ed-underline ed-underline--heavy">replaces mid-level management entirely</span>.
            </blockquote>
            <p className="ed-quote-sub">ArchonX is not another SaaS dashboard. It's a proprietary end-to-end solution for absolute operational oversight - an autonomous management engine with no direct competitor offering this complete closed-loop capability.</p>
            <div className="ed-offering-ctas">
              <Magnetic to="/invest" className="ed-btn ed-btn--solid">Investor Information <span className="ed-arrow">&rarr;</span></Magnetic>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== № 05.3 — LAND AND EXPAND ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead
            no="05.3"
            label="Revenue Strategy"
            bignum="05.3"
            title="Land and Expand"
            dek={<>Pilot in one department, prove ROI, then roll out globally to expand ARR.</>}
          />
          <div className="edc-tiers pgcompetitive-tiers">
            {TIERS.map((t) => (
              <article
                key={t.name}
                className="edc-tier reveal-up"
                style={t.delay ? { '--delay': t.delay } : undefined}
              >
                <span className="edc-tier-meta">{t.meta}</span>
                <h3 className="edc-tier-name">{t.name}</h3>
                <p className="edc-tier-desc">{t.desc}</p>
                <span className="ed-clause-tag">{t.tag}</span>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — № 06 ===================== */}
      <NextChapter to="/invest" label={<>Next &mdash; &#8470; 06 / 07</>} title="The Offering" />

      <EdFooter />
    </>
  )
}
