import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'
import { Magnetic, Parallax, AnimatedCounter, GaugeFill } from '../motion/index.js'
import '../styles/pages/invest.css'

// № 06.1 — allocation rows. `pct` drives the counter target, the gauge caption
// and the gauge fill, which are the same number in every row.
const FUNDS = [
  {
    id: 'product',
    pct: 50,
    label: <>Product &amp; Engineering</>,
    body: <>Senior ML engineers, computer vision specialists, finalizing multi-modal detection algorithms, and cloud computing infrastructure costs.</>,
  },
  {
    id: 'gtm',
    pct: 30,
    delay: '0.05s',
    label: <>GTM &amp; Pilot Execution</>,
    body: <>Equipment and hardware for Australian pilot deployments, establishing case studies in logistics and BPO, building initial enterprise sales and customer success teams.</>,
  },
  {
    id: 'ops',
    pct: 15,
    delay: '0.1s',
    label: <>Operations, Legal &amp; Compliance</>,
    body: <>HR/privacy regulatory navigation, patent filing for proprietary multi-modal methodology and task routing logic.</>,
  },
  {
    id: 'reserve',
    pct: 5,
    delay: '0.15s',
    label: <>Reserve &amp; Strategic Opportunity</>,
    body: <>Flexible capital cushion for strategic opportunities and unforeseen needs during commercialization.</>,
  },
]

// № 06.2 — the thesis clause stack.
const CLAUSES = [
  {
    no: '06.2a',
    title: <>A Regulated Tailwind</>,
    body: <>Since 2022, model WHS Regulations impose a positive duty on employers to manage psychosocial hazards, backed by a national Code of Practice; Victoria's psychological-health regulations commenced 1 December 2025. Proactive management is now a legal obligation, not an option.</>,
  },
  {
    no: '06.2b',
    delay: '0.05s',
    title: <>A Measurable Problem</>,
    body: <>Workplace harm leaves Australia's economy A$28.6 billion smaller each year (Safe Work Australia / Deloitte). Psychological claims are up 161% in a decade, at A$67,400 median compensation and 35.7 weeks median absence per claim.</>,
  },
  {
    no: '06.2c',
    delay: '0.1s',
    title: <>A Priced Incentive</>,
    body: <>The average Comcare premium reached 0.98% of payroll in 2025-26, with psychological claims driving roughly half. PwC and Beyond Blue estimate every $1 invested in workplace mental health returns an average $2.30.</>,
  },
  {
    no: '06.2d',
    delay: '0.15s',
    title: <>A Growing Market</>,
    body: <>Australian IT spending is forecast to exceed A$172 billion in 2026 (Gartner), the global workforce-management software market is projected to grow from US$9.6 billion to US$15.7 billion by 2030 (MarketsandMarkets), and generative AI could add up to A$115 billion a year to Australia's economy by 2030 (Tech Council of Australia).</>,
  },
]

// № 06.3 — the four primary revenue streams. The GTM "land and expand" block
// that follows them is a different shape (h4, own wrapper) and stays inline.
const STREAMS = [
  {
    no: '06.3a',
    title: <>Upfront Integration Fee</>,
    body: <>Premium implementation and onboarding fee for bespoke AI personality training, system integration, and custom configuration tailored to each client's operations.</>,
  },
  {
    no: '06.3b',
    delay: '0.05s',
    title: <>Subscription Fee</>,
    body: <>Ongoing monthly or annual platform subscription for autonomous monitoring, analytics, workflow routing, and continuous operational command.</>,
  },
  {
    no: '06.3c',
    delay: '0.1s',
    title: <>LLM Credit / Token Credit Revenue</>,
    body: <>Usage-based revenue from AI inference, agent actions, and token credit consumption as customers scale automation across teams and workflows.</>,
  },
  {
    no: '06.3d',
    delay: '0.15s',
    title: <>Scalable ARR</>,
    body: <>Recurring annual revenue that scales with usage - tiered licensing from Base (cognitive/psychosocial) through Professional (physical hazard) to full Archon Protocol (enterprise-grade).</>,
  },
]

// № 06.4 — milestones.
const MILESTONES = [
  {
    no: '01',
    title: <>V1.0 Commercial Release</>,
    body: <>Complete multi-modal detection algorithms and launch production-ready platform with full closed-loop capability.</>,
  },
  {
    no: '02',
    delay: '0.05s',
    title: <>3 Enterprise Pilot Programs</>,
    body: <>Execute pilot deployments across Australian logistics, BPO, and government sectors - establishing quantifiable case studies and proving ROI.</>,
  },
  {
    no: '03',
    delay: '0.1s',
    title: <>Contracted ARR</>,
    body: <>Convert pilot programs into contracted annual recurring revenue, validate product-market fit, and demonstrate scaleable demand.</>,
  },
  {
    no: '04',
    delay: '0.15s',
    title: <>Series A Ready</>,
    body: <>Prove market demand and technical efficacy to raise Series A at a significantly higher valuation with proven traction.</>,
  },
]

// № 06.5 — the termsheet label/value pairs.
const TERMS = [
  { label: 'Round', value: <>Pre-Seed</> },
  { label: 'Revenue Model', value: <>Scalable B2B Enterprise SaaS</> },
  { label: 'Base of Operations', value: <>Australia</> },
  { label: 'Contact', value: <a href="mailto:invest@archonx.ai">invest@archonx.ai</a> },
]

const delayStyle = (delay) => (delay ? { '--delay': delay } : undefined)

export default function Invest() {
  usePageMeta({
    title: 'Investor Information - ArchonX.ai | Australia',
    description: 'ArchonX.ai is raising a Pre-Seed Round to finalise proprietary AI models, execute Australian enterprise pilot programs, and establish GTM motion.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 06 ===================== */}
      <ChapterCover
        no={<>&#8470; 06 / 07</>}
        ghost="PRE-SEED"
        plate="/assets/offering-bg.svg"
        lines={[
          <>Pre-Seed</>,
          <><span className="ed-ghost">Round.</span></>,
        ]}
        dek={<>Finalise proprietary AI models, execute our first three Australian enterprise pilot programs, and establish our go-to-market motion for enterprise scale.</>}
        aside={<span className="ed-kicker">[ Investment Opportunity ]</span>}
      />

      {/* ===================== № 06.1 — USE OF FUNDS ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="06.1" label="Use of Funds" bignum="06.1" title="Use of Funds" />
          <div className="pginvest-funds">
            {FUNDS.map((f) => (
              <div key={f.id} className="edc-statline reveal-up" style={delayStyle(f.delay)}>
                <div className="edc-statline-num"><AnimatedCounter className="counter" target={f.pct} /><sup>%</sup></div>
                <div className="ed-gauge">
                  <span className="ed-gauge-cap">{`${f.pct} / 100`}</span>
                  <div className="ed-gauge-track"><GaugeFill percent={f.pct} /></div>
                </div>
                <div>
                  <h3 className="edc-statline-label">{f.label}</h3>
                  <p className="edc-statline-copy">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== № 06.2 — THE THESIS ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="06.2" label="The Thesis" bignum="06.2" title="Why Australia, Why Now" />
          <div className="pginvest-thesis">
            <div className="pginvest-thesis-rail reveal-up">
              <div className="ed-deficit-num"><span className="ed-deficit-sym">A$</span><AnimatedCounter className="counter" target={28.6} decimals={1} /><span className="ed-deficit-sym">B</span></div>
              <span className="pginvest-thesis-ref">[ Ref. Clause 06.2b ]</span>
            </div>
            <div className="pginvest-thesis-flow">
              {CLAUSES.map((c) => (
                <article key={c.no} className="pginvest-clause reveal-up" style={delayStyle(c.delay)}>
                  <span className="pginvest-clause-no">{c.no}</span>
                  <h3>{c.title}</h3>
                  <p>{c.body}</p>
                </article>
              ))}
            </div>
          </div>
          <p className="pginvest-sources reveal-up">Sources: Safe Work Australia &middot; WorkSafe Victoria &middot; Comcare &middot; PwC / Beyond Blue &middot; Gartner &middot; MarketsandMarkets &middot; Tech Council of Australia &amp; Microsoft</p>
        </div>
      </Section>

      {/* ===================== № 06.3 — REVENUE MODEL ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">06</Parallax>
        <div className="ed-container">
          <SectionHead no="06.3" label="Revenue Model" bignum="06.3" title="Revenue Model" />
          <p className="pginvest-lead reveal-up">Scalable B2B Enterprise SaaS with four primary revenue streams:</p>
          <div className="pginvest-streams">
            {STREAMS.map((s) => (
              <article key={s.no} className="pginvest-stream reveal-up" style={delayStyle(s.delay)}>
                <span className="pginvest-stream-no">{s.no}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>
          <div className="pginvest-gtm reveal-up">
            <span className="pginvest-stream-no">06.3e</span>
            <h4>GTM Strategy: Land and Expand</h4>
            <p>Pilot in one department to prove immediate ROI, then roll out across the organisation to increase ARR. Each successful pilot becomes a case study that accelerates the next sale.</p>
          </div>
        </div>
      </Section>

      {/* ===================== № 06.4 — MILESTONES ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="06.4" label="Milestones" bignum="06.4" title="Milestones" />
          <div className="pginvest-miles">
            {MILESTONES.map((m) => (
              <article key={m.no} className="pginvest-mile reveal-up" style={delayStyle(m.delay)}>
                <span className="pginvest-mile-no">{m.no}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== № 06.5 — THE TERMS ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="06.5" label="The Terms" bignum="06.5" title="Join the future of autonomous management." />
          <div className="pginvest-terms">
            <div className="pginvest-terms-pitch edc-prose reveal-up">
              <p>We're looking for strategic investors who understand the scale of the opportunity: generative AI is projected to add up to <strong>A$115 billion a year</strong> to Australia's economy by 2030, with the largest gains in workforce productivity (Tech Council of Australia &amp; Microsoft). Request our full investor deck to learn more.</p>
              <div className="pginvest-ctas">
                <Magnetic href="mailto:invest@archonx.ai" className="ed-btn ed-btn--solid">Request Investor Deck <span className="ed-arrow">&rarr;</span></Magnetic>
                <Magnetic href="mailto:hello@archonx.ai" className="ed-btn ed-btn--outline">Schedule a Call</Magnetic>
              </div>
            </div>
            <div className="ed-termsheet reveal-up" style={{ '--delay': '0.1s' }}>
              {TERMS.map((t) => (
                <div key={t.label} className="ed-term-row">
                  <span className="ed-term-label">{t.label}</span>
                  <span className="ed-term-value">{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER ===================== */}
      <NextChapter to="/consultation" label={<>Next &mdash; &#8470; 07 / 07</>} title="Start a Consultation" />

      <EdFooter />
    </>
  )
}
