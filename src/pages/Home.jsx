import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, TiltCard, Parallax, AnimatedCounter, GaugeFill, handleHashClick } from '../motion/index.js'
import { Section, SectionHead } from '../components/editorial/index.js'

const MotionLink = motion.create(Link)

// No 01 — the three lexicon entries. `dict` is the dictionary gloss that only
// the first entry carries.
const LEXICON = [
  {
    index: '01.1',
    title: 'The Name',
    dict: <>ar&middot;chon &mdash; n. ruler, commander (Gk.)</>,
    body: (
      <><strong>"Archon"</strong> - Ancient Greek for <em>Ruler</em> and <em>Commander</em>. Paired with <strong>"X"</strong>, representing mastery of the human operational domain. Together, they define the new standard of AI-driven authority.</>
    ),
  },
  {
    index: '01.2',
    title: 'Unblinking Oversight',
    delay: '0.1s',
    body: (
      <>Born from the need for total visibility in chaotic enterprise operations. ArchonX is the "Big Boss" - providing <strong>absolute operational authority</strong> and comprehensive system control where human supervisors fall short.</>
    ),
  },
  {
    index: '01.3',
    title: 'Autonomous Action',
    delay: '0.2s',
    body: (
      <>ArchonX doesn't just report data - it takes <strong>autonomous action</strong>. It replaces passive reporting with active, AI-driven leadership that makes real-time decisions at the speed of operations.</>
    ),
  },
]

// No 02 — the crisis → solution ledger.
const LEDGER = [
  {
    letter: 'A',
    crisis: <>Slowest productivity decade in 60 years &mdash; Productivity Commission</>,
    solution: 'Proactive, predictive decision-making',
  },
  {
    letter: 'B',
    delay: '0.05s',
    crisis: <>146,700 serious injury claims a year &mdash; 400+ every day</>,
    solution: 'Autonomous task routing and delegation',
  },
  {
    letter: 'C',
    delay: '0.1s',
    crisis: <>7.4 weeks median time lost per serious claim</>,
    solution: 'Real-time hazard and stress detection',
  },
  {
    letter: 'D',
    delay: '0.15s',
    crisis: <>1 in 2 workers report burnout in the past year &mdash; Beyond Blue</>,
    solution: '24/7 unblinking operational oversight',
  },
]

// No 03 — the four protocol clauses. Only 03.2 breaks out into subclauses.
const CLAUSES = [
  {
    id: 'feature-delegation',
    num: '03.1',
    title: 'Intelligent Task Delegation',
    body: <>Real-time, autonomous routing of tasks to human agents to ensure absolute adherence to performance metrics and peak efficiency. No delays. No bottlenecks.</>,
    tag: '[ AI-Powered Routing ]',
    to: '/protocol#delegation',
  },
  {
    id: 'feature-hazard',
    num: '03.2',
    delay: '0.05s',
    title: 'Holistic Hazard Mitigation',
    body: <>Dual-layered protection combining physical and psychosocial monitoring:</>,
    subclauses: [
      {
        id: '03.2a',
        label: <>03.2a &mdash; Physical Safety</>,
        body: <>Computer vision scans for PPE compliance and environmental hazards in real time</>,
      },
      {
        id: '03.2b',
        label: <>03.2b &mdash; Psychosocial Monitoring</>,
        body: <>Hazard word and phrase detection surfaces stress, fatigue, and cognitive load signals to prevent burnout</>,
      },
    ],
    tag: '[ Multi-Modal Detection ]',
    to: '/protocol#hazard',
  },
  {
    id: 'feature-personas',
    num: '03.3',
    delay: '0.1s',
    title: 'Bespoke Management Personas',
    body: <>Custom-trained AI personalities that embody your company's culture and values, ensuring high employee adoption and morale through personalised leadership.</>,
    tag: '[ Cultural Alignment ]',
    to: '/protocol#personas',
  },
  {
    id: 'feature-loop',
    num: '03.4',
    delay: '0.15s',
    title: 'Closed-Loop Efficiency',
    body: <>Instantaneous workflow rerouting when a hazard or stressor is detected, without requiring middle-management intervention. Fully autonomous response.</>,
    tag: '[ Zero Latency ]',
    to: '/protocol#closed-loop',
  },
]

// No 05 — the eight theatres of command. Note that market 03 deep-links to
// `#market-service` while its own anchor id is `market-services`.
const MARKETS = [
  {
    id: 'market-retail',
    to: '/markets#market-retail',
    num: '01',
    name: <>Retail</>,
    desc: <>Improves floor coverage, queue response, staff allocation, and loss-prevention workflows across Australia's A$444 billion retail sector, where crime costs up to A$9 billion a year.</>,
    metrics: <><span><strong>1.49M</strong> AU workers</span><span><strong>A$9B</strong> Retail crime / yr</span></>,
  },
  {
    id: 'market-construction',
    to: '/markets#market-construction',
    num: '02',
    delay: '0.05s',
    name: <>Construction &amp; Trades</>,
    desc: <>Coordinates crews, flags safety risks, and keeps field work moving across an industry that recorded 37 worker deaths in 2024 and 17,600 serious claims a year.</>,
    metrics: <><span><strong>37</strong> Deaths in 2024</span><span><strong>17,600</strong> Serious claims / yr</span></>,
  },
  {
    id: 'market-services',
    to: '/markets#market-service',
    num: '03',
    delay: '0.1s',
    name: <>Service &amp; Consulting</>,
    desc: <>Gives client-facing teams better workload routing and delivery oversight, in a workforce donating 3.6 unpaid overtime hours a week &mdash; A$95.8 billion a year nationally.</>,
    metrics: <><span><strong>3.6h</strong> Unpaid OT / wk</span><span><strong>A$95.8B</strong> Unpaid OT / yr</span></>,
  },
  {
    id: 'market-hospitality',
    to: '/markets#market-hospitality',
    num: '04',
    delay: '0.15s',
    name: <>Hospitality</>,
    desc: <>Optimises staffing, guest-response workflows, and service consistency across the industry with Australia's highest staff turnover &mdash; 15.5% change employers each year.</>,
    metrics: <><span><strong>1.26M</strong> AU workers</span><span><strong>15.5%</strong> Annual turnover</span></>,
  },
  {
    id: 'market-logistics',
    to: '/markets#market-logistics',
    num: '05',
    delay: '0.2s',
    name: <>Logistics &amp; Warehousing</>,
    desc: <>Real-time task routing and safety monitoring for Australia's deadliest industry &mdash; 54 transport and warehousing workers died in 2024, and body stressing drives 34.5% of all serious claims.</>,
    metrics: <><span><strong>54</strong> Deaths in 2024</span><span><strong>34.5%</strong> Claims from body stressing</span></>,
  },
  {
    id: 'market-bpo',
    to: '/markets#market-bpo',
    num: '06',
    delay: '0.25s',
    name: <>BPO &amp; Contact Centres</>,
    desc: <>Hazard phrase detection monitors agent stress to re-route calls or enforce micro-breaks &mdash; against 29% annual agent attrition and 35.7 weeks median absence per psychological claim.</>,
    metrics: <><span><strong>29%</strong> Agent attrition</span><span><strong>35.7wk</strong> Median psych absence</span></>,
  },
  {
    id: 'market-government',
    to: '/markets#market-government',
    num: '07',
    delay: '0.3s',
    name: <>Government &amp; Infrastructure</>,
    desc: <>Accountable oversight for public-sector teams, where Commonwealth psychological claims are up 75% since 2017 and only 57% return to work &mdash; versus 92% for physical injuries.</>,
    metrics: <><span><strong>+75%</strong> Psych claims since 2017</span><span><strong>57%</strong> Psych return-to-work</span></>,
  },
  {
    id: 'market-defense',
    to: '/markets#market-defense',
    num: '08',
    delay: '0.35s',
    name: <>Emergency Services &amp; Dispatch</>,
    desc: <>Monitors cognitive load to preserve readiness among Australian first responders &mdash; 1 in 3 experience high psychological distress, versus 1 in 8 of all adults.</>,
    metrics: <><span><strong>1 in 3</strong> High distress</span><span><strong>2.5&times;</strong> PTSD vs population</span></>,
  },
]

// No 06 — the three measured results. `value` drives both the counter and the
// gauge; `cap` is the printed "n / 100" caption.
const RESULTS = [
  {
    id: 'impact-cost',
    meta: <>06.1 &mdash; Claims</>,
    value: 12,
    cap: '12 / 100',
    title: 'Mental-Health Share of Serious Claims',
    body: <>12% of Australia's serious workers' compensation claims are now psychological &mdash; up 161% in a decade, at A$67,400 median compensation each. (Safe Work Australia, 2023&ndash;24)</>,
  },
  {
    id: 'impact-safety',
    delay: '0.1s',
    meta: <>06.2 &mdash; Burnout</>,
    value: 50,
    cap: '50 / 100',
    title: 'Workers Reporting Burnout',
    body: <>1 in 2 Australian workers experienced workplace burnout in the past year, with inappropriate workload the leading driver. (Beyond Blue, 2025)</>,
  },
  {
    id: 'impact-reporting',
    delay: '0.2s',
    meta: <>06.3 &mdash; Recovery</>,
    value: 57,
    cap: '57 / 100',
    title: 'Psychological Return-to-Work Rate',
    body: <>Only 57% of psychological injury claims in the Commonwealth scheme return to work, against 92% for physical injuries. (Comcare, 2023&ndash;24)</>,
  },
]

// The first item in each staggered group carries no `--delay`, so keep the
// style attribute off entirely rather than emitting an empty one.
const delayStyle = (delay) => (delay ? { '--delay': delay } : undefined)

export default function Home() {
  usePageMeta({
    title: 'ArchonX.ai – Autonomous AI Leadership & Workforce Optimisation | Australia',
    description:
      'ArchonX.ai replaces reactive management with autonomous AI-driven leadership for Australian enterprise and government. Real-time task delegation, hazard mitigation, and WHS psychosocial compliance.',
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
          <div className="ed-masthead">
            <span className="ed-masthead-cell">ArchonX.ai &mdash; Autonomous Command</span>
            <span className="ed-masthead-cell ed-masthead-badge" id="hero-badge">
              <span className="badge-pulse"></span>
              <span className="badge-text">Now Raising &mdash; Pre-Seed Funding Round</span>
            </span>
            <span className="ed-masthead-cell ed-masthead-vol">Australia &mdash; Vol. 01 &mdash; 2026</span>
          </div>
          <h1 className="ed-hero-title" id="hero-title">
            <span className="ed-line"><span className="ed-line-inner">Driven by <span className="ed-ghost">Data.</span></span></span>
            <span className="ed-line"><span className="ed-line-inner">Orchestrated by <span className="ed-ghost">Intelligence.</span></span></span>
            <span className="ed-line"><span className="ed-line-inner">Built for <span className="ed-ghost">Efficiency.</span></span></span>
          </h1>
          <div className="ed-hero-sub">
            <p className="ed-hero-dek" id="hero-subtitle">
              The ultimate standard in automated leadership and workforce optimisation. ArchonX replaces reactive, error-prone human supervision with autonomous AI-driven command &mdash; built for Australian enterprise and government.
            </p>
            <div className="ed-hero-ctas">
              <Magnetic href="#invest" onClick={handleHashClick} className="ed-btn ed-btn--solid" id="hero-cta-primary">Get Started <span className="ed-arrow">&rarr;</span></Magnetic>
              <Magnetic to="/about" className="ed-btn ed-btn--bare" id="hero-cta-secondary">Learn More</Magnetic>
            </div>
          </div>
          <div className="ed-hero-strip">
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><sup>A$</sup><AnimatedCounter className="hero-stat-value" target={28.6} decimals={1} /><sup>B</sup></span>
              <span className="ed-stat-label">Annual cost of workplace harm to Australia &mdash; Safe Work Australia</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={400} /><sup>+</sup></span>
              <span className="ed-stat-label">Serious injury claims lodged every day &mdash; Safe Work Australia</span>
            </div>
            <div className="ed-hero-stat">
              <span className="ed-stat-num"><AnimatedCounter className="hero-stat-value" target={161} /><sup>%</sup></span>
              <span className="ed-stat-label">Decade rise in psychological injury claims &mdash; Safe Work Australia</span>
            </div>
          </div>
          <div className="ed-hero-scroll" aria-hidden="true">
            <span>01 / 07 &mdash; Scroll</span>
            <span className="ed-scroll-line"></span>
          </div>
        </div>
      </section>

      {/* ===================== No 01 — THE LEXICON ===================== */}
      <Section pole="paper" id="about">
        <div className="ed-container">
          <SectionHead no="01" label="The Vision" bignum="01" title="About Us" />
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

      {/* ===================== No 02 — THE DEFICIT ===================== */}
      <Section pole="ink" id="problem">
        <div className="ed-container">
          <SectionHead meta={<>&#8470; 02 / The Crisis &rarr; The Solution</>} />
          <div className="ed-deficit">
            <div className="ed-deficit-left reveal-up">
              <div className="ed-deficit-num"><span className="ed-deficit-sym">A$</span><AnimatedCounter className="counter" target={28.6} decimals={1} /><span className="ed-deficit-sym">B</span></div>
              <p className="ed-deficit-cap">Annual cost of work-related injury and illness to Australia's economy &mdash; Safe Work Australia / Deloitte Access Economics</p>
              <p className="ed-deficit-copy">Work-related injuries and illnesses leave Australia's economy <strong>A$28.6 billion smaller every year</strong> &mdash; 1.6% of GDP and roughly 185,500 full-time jobs. Mental ill-health costs the nation a further <strong>A$200&ndash;220 billion a year</strong> (Productivity Commission). Traditional supervision is broken.</p>
            </div>
            <div className="ed-deficit-right reveal-up" style={{ '--delay': '0.1s' }}>
              <span className="ed-kicker">The ArchonX Answer</span>
              <p className="ed-deficit-copy">An autonomous management engine that doesn't just monitor - it <span className="ed-underline">leads</span>. Since 2022, Australian WHS regulations impose a positive duty to manage psychosocial hazards. ArchonX turns that duty into decisive, real-time operational control.</p>
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
            label="Core Capabilities"
            bignum="03"
            title="The Archon Protocol"
            dek="Four clauses of autonomous command."
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
        <Parallax as="img" src="/assets/doctrine-bg.svg" alt="" className="ed-doctrine-plate" range={50} aria-hidden="true" />
        <div className="ed-container">
          <SectionHead no="04" label="Doctrine" running={null} />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">
              ArchonX doesn't manage people &mdash; it <span className="ed-underline ed-underline--heavy">commands operations</span>.
            </blockquote>
            <p className="ed-quote-attr">&mdash; The Archon Principle</p>
            <p className="ed-quote-sub">Replacing human supervisors with unblinking AI leadership for absolute operational authority.</p>
          </div>
        </div>
      </Section>

      {/* ===================== No 05 — INDEX OF OPERATIONS ===================== */}
      <Section pole="paper" id="markets">
        <div className="ed-container">
          <SectionHead
            no="05"
            label="Target Markets"
            running={<>Index &mdash; 01&ndash;08</>}
            bignum="05"
            title="Eight theatres of command."
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
          <p className="ed-index-note reveal-up">Sector data: ABS &middot; Safe Work Australia &middot; National Retail Association &middot; The Australia Institute &middot; ACXPA &middot; Comcare &middot; Beyond Blue &mdash; 2024&ndash;2026</p>
        </div>
      </Section>

      {/* ===================== No 06 — LEDGER OF RESULTS ===================== */}
      <Section pole="paper" className="ed-results" id="impact">
        <div className="ed-container">
          <SectionHead no="06" label="The Australian Data" bignum="06" title="The stakes, measured." fat />
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
        </div>
      </Section>

      {/* ===================== No 07 — THE OFFERING ===================== */}
      <Section pole="ink" className="ed-offering" id="invest">
        <div className="ed-container">
          <SectionHead meta={<>&#8470; 07 / Investment &mdash; Pre-Seed</>} />
          <div className="ed-offering-head reveal-up">
            <h2 className="ed-offering-title">Join the <span className="ed-ghost ed-ghost--ink">Pre-Seed</span> round.</h2>
            <span className="ed-offering-underscore"></span>
          </div>
          <div className="ed-offering-spread">
            <div className="ed-offering-pitch reveal-up">
              <p>We are raising a <strong>Pre-Seed Funding Round</strong> to finalise multi-modal detection algorithms and execute pilot programs across Australian logistics, contact-centre, government, and high-pressure service environments.</p>
              <p>Generative AI is projected to add up to <strong>A$115 billion a year</strong> to Australia's economy by 2030 &mdash; with the largest gains in workforce productivity. (Tech Council of Australia &amp; Microsoft)</p>
              <div className="ed-offering-ctas">
                <Magnetic href="mailto:hello@archonx.ai?subject=Request%20a%20Demo" className="ed-btn ed-btn--solid" id="demo-cta">Request a Demo <span className="ed-arrow">&rarr;</span></Magnetic>
                <Magnetic to="/consultation" className="ed-btn ed-btn--outline" id="invest-cta">Start a Consultation</Magnetic>
              </div>
            </div>
            <div className="ed-termsheet reveal-up" style={{ '--delay': '0.1s' }}>
              <div className="ed-term-row">
                <span className="ed-term-label">Round</span>
                <span className="ed-term-value">Pre-Seed</span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Revenue Model</span>
                <span className="ed-term-value">B2B Enterprise SaaS + premium implementation fees for bespoke AI personality training</span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Use of Funds</span>
                <span className="ed-term-value">Multi-modal algorithm R&amp;D &middot; Australian pilot programs in logistics &amp; BPO &middot; enterprise sales expansion</span>
              </div>
              <div className="ed-term-row">
                <span className="ed-term-label">Base of Operations</span>
                <span className="ed-term-value">Australia</span>
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
