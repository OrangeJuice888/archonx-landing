import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import GlobeBackdrop from '../components/GlobeBackdrop.jsx'
import { Magnetic, TiltCard, Parallax, AnimatedCounter, handleHashClick } from '../motion/index.js'
import { Section, SectionHead } from '../components/editorial/index.js'
import { useSiteContent } from '../content/useSiteContent.js'

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

// No 02 — the usual way → the ArchonX way. No amounts here: every price
// lives on the consulting page.
const LEDGER = [
  {
    letter: 'A',
    crisis: <>A traditional consultancy bills the hours and keeps the logins</>,
    solution: 'We price the outcome and hand you the keys: your accounts, your numbers, a one-page runbook',
  },
  {
    letter: 'B',
    delay: '0.05s',
    crisis: <>Software subscriptions charge per seat, every month, for as long as you use them</>,
    solution: "Own what we build outright. No per-seat fees, no lock-in, 30 days' notice on any plan",
  },
  {
    letter: 'C',
    delay: '0.1s',
    crisis: <>AI that acts on its own and lets callers think it is a person</>,
    solution: 'Every assistant says it is an AI. Money, health, legal and tenancy decisions go through a person',
  },
  {
    letter: 'D',
    delay: '0.15s',
    crisis: <>A pilot elsewhere opens with a strategy deck and takes four to ten weeks</>,
    solution: 'One working system in two weeks, tested on your real calls and documents, and signed off only once it is live',
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

// No 05 — six plain facts about working with ArchonX. No prices here; the
// consulting page carries every price, and the Markets page the sector detail.
const FACTS = [
  {
    id: 'fact-speed',
    title: 'Live in two weeks',
    body: <>One workflow or agent, scoped in writing, tested on your real calls and documents, and live in your name within 14 days. The quote arrives in writing within two business days, with the go-live date in it.</>,
  },
  {
    id: 'fact-engineers',
    delay: '0.05s',
    title: 'Built by engineers who have done this at scale',
    body: <>Our engineers have worked with SK Hynix, Samsung, Hyundai, LG, Citibank, MetLife, IBM, Suncorp, OpenAI, Blackbook, Incheon Airport and Shinsegae, and with central government agencies, national data centres and public enterprises. The same discipline, with far less ceremony.</>,
  },
  {
    id: 'fact-ownership',
    delay: '0.1s',
    title: 'Yours to keep',
    body: <>Every account, phone number and subscription sits under your business with your logins, with a one-page runbook and recorded training. Month to month, 30 days' notice, no exit fee, no per-seat fees. If ArchonX disappeared tomorrow, it would keep running.</>,
  },
  {
    id: 'fact-people',
    delay: '0.15s',
    title: 'Honest AI, with people in charge',
    body: <>Every assistant says it is an AI. Money, health, legal and tenancy decisions go through a person. Nothing faces a customer until you have heard it, read it and approved the rules it follows.</>,
  },
  {
    id: 'fact-data',
    delay: '0.2s',
    title: 'Your data stays yours',
    body: <>Business accounts whose terms exclude training on your data, data-sharing settings turned off, and records kept in the Australian region wherever the provider offers one. Written into the quote, not left to a policy page.</>,
  },
  {
    id: 'fact-measured',
    delay: '0.25s',
    title: 'Measured every month',
    body: <>Thirty days of included fixes after go-live, then a monthly report of what the system did and what it got wrong, in plain numbers. The next job starts when the first one has paid for itself.</>,
  },
]

// The first item in each staggered group carries no `--delay`, so keep the
// style attribute off entirely rather than emitting an empty one.
const delayStyle = (delay) => (delay ? { '--delay': delay } : undefined)

export default function Home() {
  const { home } = useSiteContent()
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
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={14} /><sup>days</sup></span>
              <span className="ed-stat-label">from a signed quote to one working system, live and in your name</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={2} /><sup>min</sup></span>
              <span className="ed-stat-label">free AI audit with your result on screen, and one build we set up free</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num">24/7</span>
              <span className="ed-stat-label">calls answered and enquiries followed up, by an assistant that says it is an AI</span>
            </div>
          </div>
          <div className="ed-hero-scroll" aria-hidden="true">
            <span>01 / 05 &mdash; Scroll</span>
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
          <SectionHead meta={<>Why ArchonX</>} />
          <div className="ed-deficit">
            <div className="ed-deficit-left reveal-up">
              <div className="ed-deficit-num"><AnimatedCounter className="counter" target={100} /><span className="ed-deficit-sym">%</span></div>
              <p className="ed-deficit-cap">of what we build runs in your name: your accounts, your logins, your phone number</p>
              <p className="ed-deficit-copy">If ArchonX disappeared tomorrow, your system would keep running. Traditional consultancies bill the hours and keep the keys; software companies bill per seat forever. We <strong>price the outcome</strong>, hand over the logins on day one, and stay on only if you want a care plan.</p>
            </div>
            <div className="ed-deficit-right reveal-up" style={{ '--delay': '0.1s' }}>
              <span className="ed-kicker">What you can hold us to</span>
              <p className="ed-deficit-copy">A fixed quote in writing within two business days, with a go-live date. Nothing faces a customer until you've heard it, read it and approved the rules. Thirty days of included fixes. A monthly report of what the system did and got wrong. And if we can't get it live as quoted, <span className="ed-underline">you don't pay the second half of the setup</span>.</p>
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
              {home.doctrineQuote} <span className="ed-underline ed-underline--heavy">{home.doctrineQuoteEmphasis}</span>.
            </blockquote>
            <p className="ed-quote-attr">The rule we work by</p>
            <p className="ed-quote-sub">Software that helps run the business, with your people in charge of it.</p>
          </div>
        </div>
      </Section>

      {/* ===================== No 05 — WHAT YOU GET ===================== */}
      <Section pole="paper" id="facts">
        <div className="ed-container">
          <SectionHead no="05" label="What you get" bignum="05" title="What working with ArchonX looks like." />
          <div className="ed-lexicon">
            {FACTS.map((fact) => (
              <TiltCard as="article" key={fact.id} className="ed-entry reveal-up" style={delayStyle(fact.delay)} id={fact.id}>
                <h3>{fact.title}</h3>
                <p>{fact.body}</p>
              </TiltCard>
            ))}
          </div>
          <p className="ed-index-note reveal-up">Prices and packages are on the <a href="/consultation/">consulting page</a>; sector-by-sector starting points are on the <Link to="/markets">Markets page</Link>. ArchonX has no client results to report yet, and it won't invent any.</p>
        </div>
      </Section>

      {/* ===================== No 06 — WORK WITH US ===================== */}
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
                <span className="ed-term-value">Bluework: rosters, time and daily operations, in early access &middot; <a href="https://bluework.com.au" target="_blank" rel="noopener">bluework.com.au</a></span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Consulting</span>
                <span className="ed-term-value">Packages, builds you own, and an engineer in your team &middot; fixed quotes in writing, month to month, every price published on the <a href="/consultation/">consulting page</a></span>
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
