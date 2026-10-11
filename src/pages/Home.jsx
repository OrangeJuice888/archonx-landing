import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import GlobeBackdrop from '../components/GlobeBackdrop.jsx'
import { Magnetic, TiltCard, Parallax, AnimatedCounter, GaugeFill, handleHashClick } from '../motion/index.js'
import { Section, SectionHead } from '../components/editorial/index.js'

const MotionLink = motion.create(Link)

// No 01 — the three lexicon entries. `dict` is the dictionary gloss that only
// the first entry carries.
const LEXICON = [
  {
    index: '01.1',
    title: 'The name',
    dict: <>ar&middot;chon, noun: ruler, commander (Greek)</>,
    body: (
      <><strong>Archon</strong> is Ancient Greek for <em>ruler</em> or <em>commander</em>. The <strong>X</strong> is the unknown in every business: the software, people and rules it runs on. ArchonX builds systems that help a business run its operations, with people making the decisions.</>
    ),
  },
  {
    index: '01.2',
    title: 'Two arms',
    delay: '0.1s',
    body: (
      <><strong>ArchonX Lab</strong> builds software: Bluework for rosters, time and daily operations, and custom systems from point of sale to marketplaces. <strong>ArchonX Consulting</strong> puts AI into a business's daily work: reception, enquiries, admin, bookkeeping and the workflows between them.</>
    ),
  },
  {
    index: '01.3',
    title: "Who it's for",
    delay: '0.2s',
    body: (
      <>Small businesses through to larger organisations and government, across Australia, from Brisbane. The rule is the same for all of them: <strong>start with one job</strong>, prove it works, then expand.</>
    ),
  },
]

// No 02 — the gap → the answer ledger. Every figure is attributed.
const LEDGER = [
  {
    letter: 'A',
    crisis: <>65% of SMEs that haven't adopted AI distrust its decisions or prefer human control (National AI Centre)</>,
    solution: 'A person approves anything that matters',
  },
  {
    letter: 'B',
    delay: '0.05s',
    crisis: <>Privacy and security is a top barrier, at 39% (Intuit QuickBooks)</>,
    solution: 'Data kept in Australia where the provider offers it; business accounts whose terms exclude training on your data',
  },
  {
    letter: 'C',
    delay: '0.1s',
    crisis: <>Lack of knowledge holds back 31% (Intuit QuickBooks)</>,
    solution: 'A free audit, a written plan and one job first',
  },
  {
    letter: 'D',
    delay: '0.15s',
    crisis: <>79% report productivity gains from AI (Intuit QuickBooks)</>,
    solution: 'A monthly report on what it did and what it got wrong',
  },
]

// No 03 — the four protocol clauses. Only 03.2 breaks out into subclauses.
const CLAUSES = [
  {
    id: 'feature-map',
    num: '1',
    title: 'Map the work',
    body: <>The first hour goes on how work actually moves through the business, from first call to paid invoice. Most of what is worth automating is obvious once it is drawn, and so is what to leave alone.</>,
    tag: '[ Map Before Build ]',
    to: '/protocol#map',
  },
  {
    id: 'feature-build',
    num: '2',
    delay: '0.05s',
    title: 'Build on what you run',
    body: <>We connect the software you already use and build only what is missing:</>,
    subclauses: [
      {
        id: '03.2a',
        label: <>Our software</>,
        body: <>Bluework for rosters, clock-in, timesheets, SOPs and a company AI agent, built by ArchonX Lab</>,
      },
      {
        id: '03.2b',
        label: <>Custom systems</>,
        body: <>Receptionists, chat agents, workflows, dashboards, point of sale and marketplaces, built in your name</>,
      },
    ],
    tag: '[ Software + Implementation ]',
    to: '/protocol#build',
  },
  {
    id: 'feature-govern',
    num: '3',
    delay: '0.1s',
    title: 'Keep people in charge',
    body: <>Every AI assistant says it is an AI. Money, health, legal and tenancy decisions go through a person. Nothing we build is a black box or pretends to be human.</>,
    tag: '[ Human Review ]',
    to: '/protocol#govern',
  },
  {
    id: 'feature-run',
    num: '4',
    delay: '0.15s',
    title: 'Run, measure, expand',
    body: <>Nothing faces a customer until it has been tested on real calls and emails. A monthly report shows what the system did, including where it was wrong. The next job starts when the first one has paid for itself.</>,
    tag: '[ Closed Loop, Measured ]',
    to: '/protocol#run',
  },
]

// No 05 — the eight sectors. Note that market 03 deep-links to
// `#market-service` while its own anchor id is `market-services`.
const MARKETS = [
  {
    id: 'market-retail',
    to: '/markets#market-retail',
    num: '01',
    name: <>Retail</>,
    desc: <>Stock, order and opening-hours questions answered on web, Instagram and phone from your live catalogue; supplier invoices into the books; review requests after each sale. Point of sale and back office built around how you sell.</>,
    metrics: <><span><strong>Catalogue answers</strong> 24 / 7</span><span><strong>POS to books</strong> in one flow</span></>,
  },
  {
    id: 'market-construction',
    to: '/markets#market-construction',
    num: '02',
    delay: '0.05s',
    name: <>Construction &amp; trades</>,
    desc: <>The phone answered while you're on the tools, a voice note turned into a draft quote, invoices chased until they're paid. For crews, Bluework handles rosters, clock-in and the SOPs.</>,
    metrics: <><span><strong>Calls answered</strong> jobs booked</span><span><strong>Voice note</strong> to draft quote</span></>,
  },
  {
    id: 'market-services',
    to: '/markets#market-service',
    num: '03',
    delay: '0.1s',
    name: <>Professional services &amp; agencies</>,
    desc: <>Document chasing, inbox triage, reconciliation suggestions and meeting notes into the practice system, for accountants, lawyers, agencies and consultancies. Every change still goes through a registered person.</>,
    metrics: <><span><strong>Documents chased</strong> automatically</span><span><strong>Drafts ready</strong> a person sends</span></>,
  },
  {
    id: 'market-hospitality',
    to: '/markets#market-hospitality',
    num: '04',
    delay: '0.15s',
    name: <>Hospitality</>,
    desc: <>Bookings by phone, text and web during service; guest questions answered from your own FAQ; supplier invoices into the books; rosters and clock-in across venues with Bluework.</>,
    metrics: <><span><strong>Bookings taken</strong> during service</span><span><strong>Rosters</strong> to timesheets</span></>,
  },
  {
    id: 'market-logistics',
    to: '/markets#market-logistics',
    num: '05',
    delay: '0.2s',
    name: <>Logistics &amp; warehousing</>,
    desc: <>Rostering, clock-in and task boards for floors that run in shifts, with award-aware timesheets and SOPs the team can search. Workflow automation between job, fleet and accounting software.</>,
    metrics: <><span><strong>Shift rosters</strong> &amp; timesheets</span><span><strong>Systems</strong> connected</span></>,
  },
  {
    id: 'market-bpo',
    to: '/markets#market-bpo',
    num: '06',
    delay: '0.25s',
    name: <>BPO &amp; contact centres</>,
    desc: <>AI receptionists and chat agents for overflow and after hours, and enquiry follow-up until booked. Team rostering in Bluework, with fatigue and overload signals from its Protect layer (in controlled rollout), reviewed by a person.</>,
    metrics: <><span><strong>Overflow</strong> answered</span><span><strong>Rosters</strong> &amp; timesheets</span></>,
  },
  {
    id: 'market-government',
    to: '/markets#market-government',
    num: '07',
    delay: '0.3s',
    name: <>Government &amp; infrastructure</>,
    desc: <>Operations software for dispersed teams: rosters, SOPs with citations, and tamper-evident records designed for audits. AI-use policies written to align with the Australian Privacy Principles and the Voluntary AI Safety Standard.</>,
    metrics: <><span><strong>Evidence-grade</strong> records</span><span><strong>AI-use policy</strong> included</span></>,
  },
  {
    id: 'market-defense',
    to: '/markets#market-defense',
    num: '08',
    delay: '0.35s',
    name: <>Emergency services &amp; dispatch</>,
    desc: <>Shift rosters, clock-in and searchable SOPs for teams that cannot afford a gap. Fatigue and overload signals come with Bluework Protect (in controlled rollout), and a person reviews every one.</>,
    metrics: <><span><strong>Rosters</strong> &amp; clock-in</span><span><strong>Human review</strong> always</span></>,
  },
]

// No 06 — the three measured figures. `value` drives both the counter and the
// gauge; `cap` is the printed "n / 100" caption.
const RESULTS = [
  {
    id: 'impact-adoption',
    meta: <>Adoption</>,
    value: 12,
    cap: '12 / 100',
    title: 'Businesses using AI at work',
    body: <>12% of Australian businesses used AI in the workplace in 2024&ndash;25, and 11% of small and micro businesses. Large businesses were at 35%. (ABS Business Characteristics Survey, June 2026)</>,
  },
  {
    id: 'impact-smes',
    delay: '0.1s',
    meta: <>SMEs</>,
    value: 44,
    cap: '44 / 100',
    title: 'SMEs reporting some AI adoption',
    body: <>44% of Australian small and medium businesses reported some AI adoption in February 2026, mostly content generation and data analysis. Agentic AI is largely untouched. (National AI Centre SME AI Pulse)</>,
  },
  {
    id: 'impact-intent',
    delay: '0.2s',
    meta: <>Plans</>,
    value: 71,
    cap: '71 / 100',
    title: 'Businesses planning more AI in 2026',
    body: <>71% of Australian businesses plan to increase their use of AI in 2026, and 76% of AI users reported higher profitability against 34% of non-users. (CPA Australia Business Technology Report)</>,
  },
]

// The first item in each staggered group carries no `--delay`, so keep the
// style attribute off entirely rather than emitting an empty one.
const delayStyle = (delay) => (delay ? { '--delay': delay } : undefined)

export default function Home() {
  usePageMeta({
    title: 'ArchonX.ai – AI Software and Consulting for Australian Business | Brisbane',
    description:
      'ArchonX is an Australian software company. ArchonX Lab builds operations software such as Bluework; ArchonX Consulting puts AI to work inside businesses, from a one-person trade to a large organisation, with people in charge.',
    bodyClass: 'home-editorial',
  })
  return (
    <>
      {/* ===================== COVER / HERO ===================== */}
      <section className="ed-hero" id="hero" data-nav="ink">
        <div className="ed-hero-bg" aria-hidden="true">
          <video className="ed-hero-video" autoPlay muted loop playsInline preload="auto">
            <source src="/assets/hero-background-original.mp4" type="video/mp4" />
          </video>
          <div className="ed-hero-overlay"></div>
        </div>
        <div className="ed-container ed-hero-inner">
          <h1 className="ed-hero-title" id="hero-title">
            <span className="ed-line"><span className="ed-line-inner">Driven by <span className="ed-ghost">data.</span></span></span>
            <span className="ed-line"><span className="ed-line-inner">Orchestrated by <span className="ed-ghost">intelligence.</span></span></span>
            <span className="ed-line"><span className="ed-line-inner">Built for <span className="ed-ghost">efficiency.</span></span></span>
          </h1>
          <div className="ed-hero-sub">
            <p className="ed-hero-dek" id="hero-subtitle">
              ArchonX is an Australian software company. We build AI systems and put them to work inside businesses, from a one-person trade to a large organisation. ArchonX Lab builds the software; ArchonX Consulting puts it into your operations.
            </p>
            <div className="ed-hero-ctas">
              <Magnetic href="/consultation/" className="ed-btn ed-btn--solid" id="hero-cta-primary">Start a consultation <span className="ed-arrow">&rarr;</span></Magnetic>
              <Magnetic href="#features" onClick={handleHashClick} className="ed-btn ed-btn--bare" id="hero-cta-secondary">How we work</Magnetic>
            </div>
          </div>
          <div className="ed-hero-strip">
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={44} /><sup>%</sup></span>
              <span className="ed-stat-label">of Australian SMEs report some AI adoption (National AI Centre, Feb 2026)</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={71} /><sup>%</sup></span>
              <span className="ed-stat-label">of businesses plan to increase AI use in 2026 (CPA Australia)</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={8} /><sup>h / wk</sup></span>
              <span className="ed-stat-label">saved on average by accountants and bookkeepers using AI (Xero, Sept 2026)</span>
            </div>
          </div>
          <div className="ed-hero-scroll" aria-hidden="true">
            <span>01 / 06 &mdash; Scroll</span>
            <span className="ed-scroll-line"></span>
          </div>
        </div>
      </section>

      {/* ===================== No 01 — THE LEXICON ===================== */}
      <Section pole="paper" id="about">
        <div className="ed-container">
          <SectionHead no="01" label="The company" bignum="01" title="About us" />
          <div className="ed-lexicon">
            {LEXICON.map((entry) => (
              <TiltCard as="article" key={entry.index} className="ed-entry reveal-up" style={delayStyle(entry.delay)}>
                <span className="ed-entry-index">{entry.index}</span>
                <h3>{entry.title}</h3>
                {entry.dict ? <p className="ed-entry-dict">{entry.dict}</p> : null}
                <p>{entry.body}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== No 02 — THE GAP ===================== */}
      <Section pole="ink" id="problem">
        <div className="ed-container">
          <SectionHead meta={<>The problem</>} />
          <div className="ed-deficit">
            <div className="ed-deficit-left reveal-up">
              <div className="ed-deficit-num"><AnimatedCounter className="counter" target={12} /><span className="ed-deficit-sym">%</span></div>
              <p className="ed-deficit-cap">of Australian businesses used AI in the workplace in 2024&ndash;25 (ABS Business Characteristics Survey, June 2026)</p>
              <p className="ed-deficit-copy">Only <strong>12% of Australian businesses</strong> used AI at work in 2024&ndash;25, and 11% of small and micro businesses (ABS). Among small and medium businesses that haven't adopted it, <strong>65% say they distrust AI decisions or prefer human control</strong> (National AI Centre). The tools exist. Getting them working is the hard part.</p>
            </div>
            <div className="ed-deficit-right reveal-up" style={{ '--delay': '0.1s' }}>
              <span className="ed-kicker">What we do about it</span>
              <p className="ed-deficit-copy">Software, and the people who put it to work. We build the system, connect it to what you already run, keep a person <span className="ed-underline">approving anything that matters</span>, and report what it did every month.</p>
            </div>
          </div>
          <div className="ed-ledger">
            {LEDGER.map((row) => (
              <div key={row.letter} className="ed-ledger-row reveal-up" style={delayStyle(row.delay)}>
                <span className="ed-ledger-letter">{row.letter}</span>
                <span className="ed-ledger-crisis">{row.crisis}</span>
                <span className="ed-ledger-arrow">&rarr;</span>
                <span className="ed-ledger-solution">{row.solution}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== No 03 — THE PROTOCOL ===================== */}
      <Section pole="paper" className="ed-section--protocol" id="features">
        <Parallax as="span" className="ed-ghostnum" range={80} aria-hidden="true">03</Parallax>
        <div className="ed-container">
          <SectionHead
            no="03"
            label="How we work"
            bignum="03"
            title="The Archon Protocol"
            dek="Four steps we follow in our software and our consulting work."
          />
          <div className="ed-clauses">
            {CLAUSES.map((clause) => (
              <TiltCard as="article" key={clause.id} className="ed-clause reveal-up" style={delayStyle(clause.delay)} id={clause.id}>
                <span className="ed-clause-num">{clause.num}</span>
                <h3 className="ed-clause-title">{clause.title}</h3>
                <div className="ed-clause-body">
                  <p>{clause.body}</p>
                  {clause.subclauses?.map((sub) => (
                    <div key={sub.id} className="ed-subclause">
                      <span className="ed-subclause-num">{sub.label}</span>
                      <p>{sub.body}</p>
                    </div>
                  ))}
                  <span className="ed-clause-tag">{clause.tag}</span>
                  <Link to={clause.to} className="ed-link">Learn more <span className="ed-arrow">&rarr;</span></Link>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ===================== No 04 — DOCTRINE ===================== */}
      <Section pole="ink" className="ed-doctrine">
        <GlobeBackdrop className="ed-doctrine-globe" />
        <div className="ed-container">
          <SectionHead no="04" label="Our view" running={null} />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">
              AI does the repetitive work. <span className="ed-underline ed-underline--heavy">People make the calls</span>.
            </blockquote>
            <p className="ed-quote-attr">The rule we work by</p>
            <p className="ed-quote-sub">Software that helps run the business, with your people in charge of it.</p>
          </div>
        </div>
      </Section>

      {/* ===================== No 05 — INDEX OF SECTORS ===================== */}
      <Section pole="paper" id="markets">
        <div className="ed-container">
          <SectionHead
            no="05"
            label="Sectors"
            running={<>Index &mdash; 01&ndash;08</>}
            bignum="05"
            title="Where to start, by sector."
          />
          <div className="ed-index">
            {MARKETS.map((market) => (
              <MotionLink key={market.id} to={market.to} whileHover={{ x: 6 }} className="ed-index-row reveal-up" style={delayStyle(market.delay)} id={market.id}>
                <span className="ed-index-num">{market.num}</span>
                <span className="ed-index-name">{market.name}</span>
                <span className="ed-index-desc">{market.desc}</span>
                <span className="ed-index-metrics">{market.metrics}</span>
                <span className="ed-index-go">&rarr;</span>
              </MotionLink>
            ))}
          </div>
          <p className="ed-index-note reveal-up">Each row names the first jobs we recommend switching on in that sector. The free audit on the consulting page picks the one that fits your business and budget.</p>
        </div>
      </Section>

      {/* ===================== No 06 — THE AUSTRALIAN PICTURE ===================== */}
      <Section pole="paper" className="ed-results" id="impact">
        <div className="ed-container">
          <SectionHead no="06" label="The numbers" bignum="06" title="Where business is up to." fat />
          <div className="ed-results-grid">
            {RESULTS.map((result) => (
              <TiltCard as="div" key={result.id} className="ed-result reveal-up" style={delayStyle(result.delay)} id={result.id}>
                <span className="ed-result-meta">{result.meta}</span>
                <div className="ed-result-num"><AnimatedCounter className="counter" target={result.value} /><sup>%</sup></div>
                <div className="ed-gauge">
                  <span className="ed-gauge-cap">{result.cap}</span>
                  <div className="ed-gauge-track"><GaugeFill percent={result.value} /></div>
                </div>
                <h3>{result.title}</h3>
                <p>{result.body}</p>
              </TiltCard>
            ))}
          </div>
          <p className="ed-index-note reveal-up">These figures describe the Australian market. ArchonX publishes its prices and its method; it has no client results to report yet, and it won't invent any.</p>
        </div>
      </Section>

      {/* ===================== No 07 — WORK WITH US ===================== */}
      <Section pole="ink" className="ed-offering" id="start">
        <div className="ed-container">
          <SectionHead meta={<>Work with us</>} />
          <div className="ed-offering-head reveal-up">
            <h2 className="ed-offering-title">Two ways to <span className="ed-ghost ed-ghost--ink">start</span>.</h2>
            <span className="ed-offering-underscore"></span>
          </div>
          <div className="ed-offering-spread">
            <div className="ed-offering-pitch reveal-up">
              <p><strong>Consulting.</strong> A free two-minute AI audit tells you which jobs AI could take on, what fits your budget, and the one build we'll run free for 90 days. Or book a 15-minute call. Fixed quotes in writing, published prices, everything built in your name.</p>
              <p><strong>Software.</strong> Bluework, our operations platform for teams that run shifts, is in early access. Custom systems, from point of sale to marketplaces, are scoped in consultation and built by ArchonX Lab.</p>
              <div className="ed-offering-ctas">
                <Magnetic href="/consultation/#audit" className="ed-btn ed-btn--solid" id="audit-cta">Start the free audit <span className="ed-arrow">&rarr;</span></Magnetic>
                <Magnetic href="/consultation/" className="ed-btn ed-btn--outline" id="consult-cta">Book a call</Magnetic>
              </div>
            </div>
            <div className="ed-termsheet reveal-up" style={{ '--delay': '0.1s' }}>
              <div className="ed-term-row">
                <span className="ed-term-label">Software</span>
                <span className="ed-term-value">Bluework: rosters, time and daily operations &middot; from A$8 per active employee a month (minimum four), ex GST &middot; <a href="https://bluework.com.au" target="_blank" rel="noopener">bluework.com.au</a></span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Consulting</span>
                <span className="ed-term-value">Packages from $399 a month plus $990 setup, or own a build outright from $3,900 &middot; ex GST, month to month</span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Based in</span>
                <span className="ed-term-value">Brisbane, Queensland. We work across Australia.</span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Contact</span>
                <span className="ed-term-value"><a href="mailto:hello@archonx.ai">hello@archonx.ai</a></span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <EdFooter />
    </>
  )
}
