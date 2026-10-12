import '../styles/pages/markets.css'
import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax, handleHashClick } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'

// The eight sectors. The jump index and the clause rows both render from this
// one list so the two can never drift apart. `delay` is optional — the first
// row deliberately carries no --delay stagger. `metrics` name the first jobs
// we usually switch on, not statistics: ArchonX has no client results to cite.
const MARKETS = [
  {
    id: 'market-retail',
    no: '01',
    short: 'Retail',
    chip: 'Front of house',
    name: <>Retail</>,
    desc: <>Stock, order and opening-hours questions answered on web, Instagram and phone from your live catalogue, with anything unusual handed to you. Supplier invoices read from your inbox and queued in Xero or MYOB. One review request after each sale. Point of sale and back office built around how you sell, with orders, payments and inventory feeding the same live data your reports read.</>,
    fit: 'Independent retailers, multi-site stores, online and in-store',
    metrics: [
      <><strong>Catalogue answers</strong> 24 / 7</>,
      <><strong>POS to books</strong> in one flow</>,
    ],
  },
  {
    id: 'market-construction',
    no: '02',
    delay: '0.05s',
    short: 'Trades',
    chip: 'On the tools',
    name: <>Construction &amp; trades</>,
    desc: <>The phone answered while you're on site, with emergencies ringing straight through. A 30-second voice note after the job becomes a draft quote in ServiceM8, Tradify, Simpro or AroFlo. Invoices chased from Xero or MYOB until they're paid. For crews, Bluework handles rosters, clock-in and the SOPs.</>,
    fit: 'Sole traders, trade businesses, builders, site crews',
    metrics: [
      <><strong>Calls answered</strong> jobs booked</>,
      <><strong>Voice note</strong> to draft quote</>,
    ],
  },
  {
    id: 'market-service',
    no: '03',
    delay: '0.1s',
    short: 'Services',
    chip: 'Back office',
    name: <>Professional services &amp; agencies</>,
    desc: <>Document chasing with a live view of who is behind, inbox triage with replies drafted in your tone, reconciliation suggestions in Xero, MYOB or QuickBooks, and meeting notes into the practice system, for accountants, lawyers, agencies and consultancies. Every change still goes through a registered person.</>,
    fit: 'Accounting and bookkeeping firms, legal practices, agencies, consultancies',
    metrics: [
      <><strong>Documents chased</strong> automatically</>,
      <><strong>Drafts ready</strong> a person sends</>,
    ],
  },
  {
    id: 'market-hospitality',
    no: '04',
    delay: '0.15s',
    short: 'Hospitality',
    chip: 'Service speed',
    name: <>Hospitality</>,
    desc: <>Bookings by phone, text and web during service and overnight, placed into your reservation system with anything unusual passed to the floor. Guest questions answered from your own FAQ. Supplier invoices into the books. Rosters, clock-in and award-aware timesheets across venues with Bluework.</>,
    fit: 'Restaurants, cafes, venues, hotels and motels',
    metrics: [
      <><strong>Bookings taken</strong> during service</>,
      <><strong>Rosters</strong> to timesheets</>,
    ],
  },
  {
    id: 'market-logistics',
    no: '05',
    delay: '0.2s',
    short: 'Logistics',
    chip: 'Throughput',
    name: <>Logistics &amp; warehousing</>,
    desc: <>Rostering, clock-in and task boards for floors that run in shifts, with award-aware timesheets and voice-recorded SOPs the team can search. Workflow automation between job, fleet and accounting software, with a person approving anything that matters.</>,
    fit: 'Warehouses, distribution centres, fulfilment floors, transport operators',
    metrics: [
      <><strong>Shift rosters</strong> &amp; timesheets</>,
      <><strong>Systems</strong> connected</>,
    ],
  },
  {
    id: 'market-bpo',
    no: '06',
    delay: '0.25s',
    short: 'BPO',
    chip: 'Volume',
    name: <>BPO &amp; contact centres</>,
    desc: <>AI receptionists and chat agents for overflow and after hours, each announcing it is an AI and handing over on request. Enquiry follow-up until booked. Team rostering and timesheets in Bluework, with fatigue and overload signals from its Protect layer, in controlled rollout, reviewed by a person before anything changes.</>,
    fit: 'Contact centres, support teams, outsourced operations',
    metrics: [
      <><strong>Overflow</strong> answered</>,
      <><strong>Rosters</strong> &amp; timesheets</>,
    ],
  },
  {
    id: 'market-government',
    no: '07',
    delay: '0.3s',
    short: 'Government',
    chip: 'Accountability',
    name: <>Government &amp; infrastructure</>,
    desc: <>Operations software for dispersed teams: rosters, SOPs with citations, and tamper-evident records designed for audits. AI-use policies and automated-decision wording written to align with the Australian Privacy Principles, the Voluntary AI Safety Standard and the National AI Centre's Guidance for AI Adoption.</>,
    fit: 'Public works and infrastructure teams, regulated operations',
    metrics: [
      <><strong>Evidence-grade</strong> records</>,
      <><strong>AI-use policy</strong> included</>,
    ],
  },
  {
    id: 'market-defense',
    no: '08',
    delay: '0.35s',
    short: 'Emergency',
    chip: 'Readiness',
    name: <>Emergency services &amp; dispatch</>,
    desc: <>Shift rosters, clock-in, award-aware timesheets and searchable SOPs for teams that cannot afford a gap. Bluework's Protect layer adds fatigue, overload and psychosocial-hazard signals for a person to review; it is in controlled rollout and subject to legal and jurisdictional approval.</>,
    fit: 'Dispatch centres, emergency teams, mission-critical rosters',
    metrics: [
      <><strong>Rosters</strong> &amp; clock-in</>,
      <><strong>Human review</strong> always</>,
    ],
  },
]

// The four beats of the Protocol. First entry carries no stagger.
const MODEL_STEPS = [
  { index: '04.2a', title: 'Map', body: <>Draw how work moves from first contact to paid invoice, and pick the one job to start with.</> },
  { index: '04.2b', title: 'Build', delay: '0.1s', body: <>Connect the software the sector already runs; build only what is missing, in the client's name.</> },
  { index: '04.2c', title: 'Govern', delay: '0.2s', body: <>Every AI says it is an AI. A person approves money, health, legal and tenancy decisions.</> },
  { index: '04.2d', title: 'Measure', delay: '0.3s', body: <>Report monthly what the system did, including what it got wrong, then expand to the next job.</> },
]

const SIGNALS = [
  { no: '01', body: <>Start with the single job that costs the most time.</> },
  { no: '02', body: <>Connect the software the sector already runs rather than replacing it.</> },
  { no: '03', body: <>Show the owner, every month, what the system did and where it was wrong.</> },
]

export default function Markets() {
  usePageMeta({
    title: 'Markets - ArchonX.ai | Australia',
    description: 'What AI does first in eight Australian sectors: retail, trades, professional services, hospitality, logistics, contact centres, government and emergency services. One method, the Archon Protocol, applied to each.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 04 / 06 ===================== */}
      <ChapterCover
        no={<>&#8470; 04 / 06</>}
        ghost="MARKETS"
        plate="/assets/markets-bg.svg"
        lines={[
          <>What AI does first</>,
          <>in eight Australian</>,
          <><span className="ed-ghost">sectors.</span></>,
        ]}
        dek={<>Different sectors run on different software and different rules. The method stays the same: map the work, build on what you already run, keep people in charge, measure. Here is what that looks like in each.</>}
        aside={<>
          <span className="ed-kicker">[ Market Map ]</span>
          <span className="ed-kicker">Eight sectors &mdash; 01 / 08</span>
        </>}
      />

      {/* ===================== № 04.1 — INDUSTRY MAP ===================== */}
      <Section pole="paper" className="ed-section--protocol pgmarkets-map" id="market-map">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">04</Parallax>
        <div className="ed-container">
          <SectionHead
            no="04.1"
            label="Sectors"
            bignum="04.1"
            title="Where to start in each sector."
            dek={<>Each sector has a different pressure point and its own software. The first job we switch on is the one that costs the most time; the rest follow once it has paid for itself.</>}
          />

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

          <p className="ed-index-note reveal-up">Each row names the first jobs we recommend switching on in that sector, not results. The free audit on the consulting page picks the one that fits your business and budget, with the hours shown as labelled estimates.</p>
        </div>
      </Section>

      {/* ===================== № 04.2 — OPERATING MODEL ===================== */}
      <Section pole="ink" className="pgmarkets-model">
        <div className="ed-container">
          <SectionHead
            no="04.2"
            label="How we work"
            bignum="04.2"
            title="The same method in every sector."
          />
          <div className="edc-prose reveal-up">
            <p>We use one method, the Archon Protocol, and apply it to the software and rules each sector already has.</p>
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

          <div className="pgmarkets-annex reveal-up" aria-label="ArchonX market fit">
            <div className="pgmarkets-annex-head">
              <h4>House rules</h4>
              <span className="pgmarkets-annex-no">Same in every sector</span>
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
          <SectionHead no="04.3" label="Next step" />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <h2 className="ed-quote">Start with <span className="ed-underline ed-underline--heavy">one job</span>.</h2>
            <p className="ed-quote-sub">Pick your sector in the free two-minute audit. It names the first job, suggests a package that fits your budget, and includes one build we run free for 90 days, within the usage limits on the consulting page.</p>
            <Magnetic href="/consultation/#audit" className="ed-btn ed-btn--solid">Start the free audit <span className="ed-arrow">&rarr;</span></Magnetic>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — № 05 / 06 ===================== */}
      <NextChapter to="/competitive" label={<>Next &mdash; &#8470; 05 / 06</>} title="How we're different" />

      <EdFooter />
    </>
  )
}
