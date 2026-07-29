import '../styles/pages/markets.css'
import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax, AnimatedCounter, handleHashClick } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'

// The eight market theatres. The jump index and the clause rows both render from
// this one list so the two can never drift apart. `delay` is optional — the first
// row deliberately carries no --delay stagger.
const MARKETS = [
  {
    id: 'market-retail',
    no: '01',
    short: 'Retail',
    chip: 'Customer flow',
    name: <>Retail</>,
    desc: <>Improves floor coverage, queue response, staff allocation, and loss-prevention workflows across Australia's A$444 billion retail sector, where retail crime costs businesses up to A$9 billion a year and 88% of frontline workers report customer abuse.</>,
    fit: 'Multi-site stores, busy floors, distributed teams',
    metrics: [
      <><strong>1.49M</strong> AU workers (ABS)</>,
      <><strong>A$9B</strong> retail crime / yr (NRA)</>,
    ],
  },
  {
    id: 'market-construction',
    no: '02',
    delay: '0.05s',
    short: 'Construction',
    chip: 'Site visibility',
    name: <>Construction &amp; Trades</>,
    desc: <>Coordinates crews, flags safety risks, tracks site progress, and keeps field work moving. Australian construction employs 1.37 million people and recorded 37 worker fatalities in 2024, with 17,600 serious claims a year.</>,
    fit: 'Job sites, trades teams, project-based operations',
    metrics: [
      <><strong>37</strong> deaths in 2024 (SWA)</>,
      <><strong>17,600</strong> serious claims / yr</>,
    ],
  },
  {
    id: 'market-service',
    no: '03',
    delay: '0.1s',
    short: 'Service',
    chip: 'Delivery control',
    name: <>Service &amp; Consulting</>,
    desc: <>Gives client-facing teams workload routing, delivery oversight, utilisation visibility, and engagement-level performance tracking. Australian employees donate an average 3.6 hours of unpaid overtime a week &mdash; worth A$95.8 billion a year.</>,
    fit: 'Agencies, consultancies, managed service teams',
    metrics: [
      <><strong>3.6h</strong> unpaid OT / wk</>,
      <><strong>A$95.8B</strong> unpaid OT / yr</>,
    ],
  },
  {
    id: 'market-hospitality',
    no: '04',
    delay: '0.15s',
    short: 'Hospitality',
    chip: 'Service speed',
    name: <>Hospitality</>,
    desc: <>Optimises staffing, guest-response workflows, service consistency, and incident visibility across venues. Accommodation and food services employs 1.26 million Australians and has the nation's highest staff turnover at 15.5% a year.</>,
    fit: 'Hotels, venues, restaurants, event operations',
    metrics: [
      <><strong>1.26M</strong> AU workers (ABS)</>,
      <><strong>15.5%</strong> annual turnover</>,
    ],
  },
  {
    id: 'market-logistics',
    no: '05',
    delay: '0.2s',
    short: 'Logistics',
    chip: 'Throughput',
    name: <>Logistics &amp; Warehousing</>,
    desc: <>Detects safety hazards, worker overload, zone congestion, and task-routing inefficiencies. Transport, postal and warehousing is Australia's deadliest industry &mdash; 54 fatalities in 2024 &mdash; and body stressing drives 34.5% of all serious claims nationally.</>,
    fit: 'Warehouses, distribution centres, fulfilment floors',
    metrics: [
      <><strong>54</strong> deaths in 2024 (SWA)</>,
      <><strong>34.5%</strong> claims body stressing</>,
    ],
  },
  {
    id: 'market-bpo',
    no: '06',
    delay: '0.25s',
    short: 'BPO',
    chip: 'Cognitive load',
    name: <>BPO &amp; Contact Centres</>,
    desc: <>Monitors agent stress, hazard phrases, fatigue, queue pressure, and call complexity to protect quality and reduce churn. Australian contact-centre attrition hit 29% in 2025, and a psychological injury claim costs a median 35.7 weeks of lost work.</>,
    fit: 'Contact centres, support teams, outsourced operations',
    metrics: [
      <><strong>29%</strong> agent attrition (ACXPA)</>,
      <><strong>35.7wk</strong> median psych absence</>,
    ],
  },
  {
    id: 'market-government',
    no: '07',
    delay: '0.3s',
    short: 'Government',
    chip: 'Compliance',
    name: <>Critical Infrastructure &amp; Government</>,
    desc: <>Creates accountable oversight for dispersed public-sector teams, safety protocols, labour visibility, and high-liability compliance. Commonwealth psychological injury claims are up 75% since 2017, and psychological claims now drive around half the average Comcare premium.</>,
    fit: 'Infrastructure teams, public works, regulated operations',
    metrics: [
      <><strong>+75%</strong> psych claims since 2017</>,
      <><strong>57%</strong> psych return-to-work</>,
    ],
  },
  {
    id: 'market-defense',
    no: '08',
    delay: '0.35s',
    short: 'Emergency',
    chip: 'Mission readiness',
    name: <>Emergency Services &amp; Dispatch</>,
    desc: <>Maintains operational readiness by monitoring cognitive load, response pressure, fatigue risk, and mission-critical coordination signals. 1 in 3 Australian police and emergency services employees experience high psychological distress &mdash; versus 1 in 8 adults generally &mdash; and probable PTSD runs at 2.5 times the general population.</>,
    fit: 'Dispatch centres, emergency teams, mission-critical operations',
    metrics: [
      <><strong>1 in 3</strong> high distress (Beyond Blue)</>,
      <><strong>2.5&times;</strong> PTSD vs population</>,
    ],
  },
]

// The four beats of the command loop. First entry carries no stagger.
const MODEL_STEPS = [
  { index: '04.2a', title: 'Sense', body: <>Capture safety, workload, service, queue, fatigue, compliance, and delivery signals.</> },
  { index: '04.2b', title: 'Prioritise', delay: '0.1s', body: <>Rank risk and urgency before a delay becomes a cost, incident, or customer failure.</> },
  { index: '04.2c', title: 'Route', delay: '0.2s', body: <>Move tasks, calls, crews, agents, or response paths to the best available capacity.</> },
  { index: '04.2d', title: 'Report', delay: '0.3s', body: <>Give leaders a live view of performance, incidents, workload, and improvement areas.</> },
]

const SIGNALS = [
  { no: '01', body: <>Detect workforce load, risk signals, service delays, and site bottlenecks.</> },
  { no: '02', body: <>Route work to the right person, zone, crew, team, or response path.</> },
  { no: '03', body: <>Report performance, risk, and compliance in real time for leadership.</> },
]

export default function Markets() {
  usePageMeta({
    title: 'Markets - ArchonX.ai | Australia',
    description: 'Explore ArchonX markets across Australian retail, construction, service, hospitality, logistics, BPO, government infrastructure, and emergency operations.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 04 / 07 ===================== */}
      <ChapterCover
        no={<>&#8470; 04 / 07</>}
        ghost="MARKETS"
        plate="/assets/markets-bg.svg"
        lines={[
          <>Operational</>,
          <>intelligence for every</>,
          <>high-pressure</>,
          <>Australian <span className="ed-ghost">workforce.</span></>,
        ]}
        dek={<>ArchonX is built for environments where safety, speed, staffing, and accountability directly affect margin. One command layer adapts across field teams, service teams, logistics floors, public infrastructure, and mission-critical operations &mdash; and operationalises the positive duty to manage psychosocial hazards embedded in Australian WHS regulations since 2022.</>}
        aside={<>
          <span className="ed-kicker">[ Market Command ]</span>
          <span className="ed-kicker">Eight theatres &mdash; 01 / 08</span>
        </>}
      />

      {/* ===================== № 04.1 — INDUSTRY MAP ===================== */}
      <Section pole="paper" className="ed-section--protocol pgmarkets-map" id="market-map">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">04</Parallax>
        <div className="ed-container">
          <SectionHead
            no="04.1"
            label="Industry Map"
            bignum="04.1"
            title="Where ArchonX creates leverage."
            dek={<>Each market has a different operating pressure. The system stays the same: sense what is happening, prioritise the work, route action, and measure the outcome.</>}
          />

          <div className="ed-hero-strip pgmarkets-snapshot reveal-up" aria-label="Market coverage snapshot">
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={8} /></span>
              <span className="ed-stat-label">core Australian industries</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><sup>A$</sup><AnimatedCounter className="hero-stat-value" target={28.6} decimals={1} /><sup>B</sup></span>
              <span className="ed-stat-label">annual cost of workplace harm (Safe Work Australia)</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={1} /></span>
              <span className="ed-stat-label">autonomous command layer</span>
            </div>
          </div>

          <div className="pgmarkets-dispatch reveal-up">
            <Magnetic href="#market-map" onClick={handleHashClick} className="ed-btn ed-btn--solid">Explore Markets <span className="ed-arrow">&rarr;</span></Magnetic>
            <Magnetic to="/consultation" className="ed-btn ed-btn--outline">Start a Consultation</Magnetic>
          </div>

          <div className="pgmarkets-jumpline reveal-up" aria-label="Market categories">
            {MARKETS.map((m) => (
              <a key={m.id} href={`#${m.id}`} onClick={handleHashClick}><span>{m.no}</span>{m.short}</a>
            ))}
          </div>

          <div className="pgmarkets-clauses">
            {MARKETS.map((m) => (
              <article key={m.id} className="ed-clause reveal-up" style={m.delay ? { '--delay': m.delay } : undefined} id={m.id}>
                <div className="pgmarkets-clause-head">
                  <span className="ed-clause-num">{m.no}</span>
                  <span className="edc-clause-no">{m.chip}</span>
                </div>
                <div className="pgmarkets-clause-main">
                  <h3 className="ed-clause-title">{m.name}</h3>
                  <p>{m.desc}</p>
                </div>
                <div className="pgmarkets-clause-side">
                  <strong className="pgmarkets-fit-label">Best fit</strong>
                  <span className="pgmarkets-fit">{m.fit}</span>
                  <div className="pgmarkets-metrics">
                    {m.metrics.map((metric, i) => (
                      <span key={i}>{metric}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="ed-index-note reveal-up">Sector data: Australian Bureau of Statistics &middot; Safe Work Australia, Key WHS Statistics 2025 &middot; National Retail Association &middot; The Australia Institute &middot; ACXPA &middot; Comcare &middot; Beyond Blue, Answering the Call &mdash; 2024&ndash;2026</p>
        </div>
      </Section>

      {/* ===================== № 04.2 — OPERATING MODEL ===================== */}
      <Section pole="ink" className="pgmarkets-model">
        <div className="ed-container">
          <SectionHead
            no="04.2"
            label="Operating Model"
            bignum="04.2"
            title="One deployment logic across every market."
          />
          <div className="edc-prose reveal-up">
            <p>ArchonX is not a collection of disconnected tools. It is a command loop that adapts to the operating pressure of each industry.</p>
          </div>
          <div className="ed-lexicon">
            {MODEL_STEPS.map((s) => (
              <article key={s.index} className="ed-entry reveal-up" style={s.delay ? { '--delay': s.delay } : undefined}>
                <span className="ed-entry-index">{s.index}</span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </article>
            ))}
          </div>

          <div className="pgmarkets-annex reveal-up" aria-label="ArchonX market command model">
            <div className="pgmarkets-annex-head">
              <h4>ArchonX Market Fit</h4>
              <span className="pgmarkets-annex-no">Live command layer</span>
            </div>
            {SIGNALS.map((s) => (
              <div key={s.no} className="pgmarkets-signal">
                <span className="pgmarkets-signal-no">{s.no}</span>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== № 04.3 — NEXT STEP ===================== */}
      <Section pole="paper" className="pgmarkets-cta">
        <div className="ed-container">
          <SectionHead no="04.3" label="Next Step" />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <h2 className="ed-quote">Map ArchonX to your <span className="ed-underline ed-underline--heavy">operating environment</span>.</h2>
            <p className="ed-quote-sub">Start with one department, site, team, or workflow. Prove ROI, then expand across the operating surface.</p>
            <Magnetic to="/consultation" className="ed-btn ed-btn--solid">Start a Consultation <span className="ed-arrow">&rarr;</span></Magnetic>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — № 05 / 07 ===================== */}
      <NextChapter to="/competitive" label={<>Next &mdash; &#8470; 05 / 07</>} title="The Advantage" />

      <EdFooter />
    </>
  )
}
