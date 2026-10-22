import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'

// No 02.3 — the four evidence clauses behind "The Gap". `delay` is the
// stagger each card animates on; the first one leads, so it has none.
const CLAUSES = [
  {
    no: 'Adoption',
    title: '12% of businesses, 11% of small ones',
    body: <>Only 12% of Australian businesses used AI in the workplace in 2024&ndash;25, and 11% of small and micro businesses. Large businesses were at 35%. (ABS Business Characteristics Survey, June 2026)</>,
  },
  {
    no: 'Trust',
    title: '65% want a person in control',
    body: <>Of the small and medium businesses that haven't adopted AI, 65% say they distrust its decisions or prefer human control. (National AI Centre SME AI Pulse, Feb 2026)</>,
    delay: '0.05s',
  },
  {
    no: 'Barriers',
    title: 'Privacy and know-how hold them back',
    body: <>Privacy and security is a top barrier at 39%, level with fear of failure, and lack of knowledge holds back 31%. Both come down to implementation. (Intuit QuickBooks AI Impact Report, 2026)</>,
    delay: '0.1s',
  },
  {
    no: 'Payoff',
    title: 'Those using it report gains',
    body: <>79% report productivity gains from AI, and accountants and bookkeepers using AI save 8 hours a week on average, 11 for the top performers. (Intuit QuickBooks &middot; Xero Modern Practice Playbook, Sept 2026)</>,
    delay: '0.15s',
  },
]

// No 02.4 — the three pillars the company stands on, keyed by their index label.
const PILLARS = [
  {
    index: '02.4a',
    title: <>ArchonX Lab</>,
    body: <>The software arm. Bluework, an operations platform for teams that run shifts: rosters, clock-in and timesheets, leave, tasks, team chat, voice-recorded SOPs and a company AI agent, with an optional Protect layer, in controlled rollout, that flags psychosocial-hazard signals for human review. Plus custom-built systems, from point of sale and back office to marketplaces with escrow payments.</>,
  },
  {
    index: '02.4b',
    title: <>ArchonX Consulting</>,
    body: <>The implementation arm. AI receptionists, chat agents, enquiry follow-up, inbox and bookkeeping automation, workflow builds, and review and launch for apps built with AI. Published prices, a fixed quote in writing, and every system set up in the client's name.</>,
    delay: '0.1s',
  },
  {
    index: '02.4c',
    title: <>The Archon Protocol</>,
    body: <>How both arms work: map the work before touching the tech, build on what the business already runs, keep people in charge of anything that matters, then run it, measure it and expand one job at a time.</>,
    delay: '0.2s',
  },
]

export default function About() {
  usePageMeta({
    title: 'About - ArchonX.ai | Australia',
    description: 'ArchonX is an Australian software company with two arms: ArchonX Lab builds operations software such as Bluework, and ArchonX Consulting puts AI to work inside businesses, from a one-person trade to a large organisation.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — No 02 ===================== */}
      <ChapterCover
        no={<>02 / 06</>}
        ghost="VISION"
        plate="/assets/vision-bg.svg"
        lines={[
          <>Software that runs</>,
          <>the business. People</>,
          <><span className="ed-ghost">in command.</span></>,
        ]}
        dek={<>ArchonX is an Australian software company. We build systems and put the latest AI to work inside businesses, from a one-person trade to a large organisation, so the people running them spend less time on admin.</>}
        aside={
          <>
            <span className="ed-kicker">[ The Vision ]</span>
            <span className="ed-kicker">About ArchonX</span>
          </>
        }
      />

      {/* ===================== No 02.1 — THE NAME ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="02.1" label="The name" />
          <div className="edc-spread">
            <div className="edc-spread-rail reveal-up">
              <span className="ed-bignum">02.1</span>
              <h2 className="ed-title">The name</h2>
            </div>
            <div className="edc-prose reveal-up" style={{ '--delay': '0.1s' }}>
              <p><strong>Archon</strong> is Ancient Greek for <em>ruler</em> or <em>commander</em>: the one who has command of what is going on. That is what good operations software gives an owner or a manager: a clear view of the work and the means to direct it.</p>
              <p><strong>X</strong> is the unknown in every business: the particular software, people, rules and habits it actually runs on. No two are the same, which is why we map the work before we build anything.</p>
              <p>Together, ArchonX means <strong>command of your own operations</strong>: systems that do the repetitive work, with your people making the decisions.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== No 02.2 — THE ORIGIN ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="02.2" label="Background" />
          <div className="edc-spread">
            <div className="edc-spread-rail reveal-up">
              <span className="ed-bignum">02.2</span>
              <h2 className="ed-title">Background</h2>
            </div>
            <div className="edc-prose reveal-up" style={{ '--delay': '0.1s' }}>
              <p>ArchonX builds software for Australian businesses from Brisbane. Bluework, our operations platform for teams that run shifts, is where most of our engineering has gone: rosters, timesheets and the daily admin behind them, with workplace safety handled as one part of running a team well.</p>
              <p>Our engineers have experience working with major companies, including SK Hynix, Samsung, Hyundai, LG, Citibank, MetLife, IBM, Suncorp, OpenAI, Blackbook, Incheon Airport and Shinsegae, and with public sector organisations, including central government agencies, national data centres, provincial and metropolitan governments and public enterprises.</p>
              <p>ArchonX Consulting exists because the question we hear most is whether someone will put AI into a business properly, in that business's name, and stay until it works.</p>
            </div>
          </div>
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">Our view: <strong>the best system is the one your team actually runs, with a person approving anything that matters</strong>.</blockquote>
          </div>
        </div>
      </Section>

      {/* ===================== No 02.3 — THE GAP ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">02</Parallax>
        <div className="ed-container">
          <SectionHead no="02.3" label="The gap" bignum="02.3" title="The gap" />
          <div className="edc-prose reveal-up">
            <p>Australian businesses can buy AI tools today. Most haven't put them to work, and the reasons are practical: trust, privacy, and nobody with the time to do it properly. Every figure below is attributed; none is ours.</p>
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

      {/* ===================== No 02.4 — THE COMPANY ===================== */}
      <Section pole="ink">
        <div className="ed-container">
          <SectionHead no="02.4" label="The company" bignum="02.4" title="Two arms, one method" />
          <div className="edc-prose reveal-up">
            <p>One company builds the software and implements it, so there is a single accountable party from the first conversation to the monthly report:</p>
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
          <SectionHead no="02.5" label="In short" />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <h2 className="ed-quote">An Australian software company that builds AI systems and implements them, one job at a time.</h2>
          </div>
          <div className="edc-prose reveal-up" style={{ marginTop: '32px', '--delay': '0.1s' }}>
            <p>Based in Brisbane and working across Australia, ArchonX is built for small businesses through to larger organisations and government. Prices are published. Quotes are fixed and in writing. Every AI assistant says it is an AI, every account is set up in the client's name, and a monthly report shows what the system did, including where it was wrong. We hold no ISO 27001 or SOC 2 certificate and do not claim one.</p>
          </div>
          <div className="reveal-up" style={{ marginTop: '48px', '--delay': '0.15s' }}>
            <Magnetic to="/protocol" className="ed-btn ed-btn--solid">See how we work <span className="ed-arrow">&rarr;</span></Magnetic>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER ===================== */}
      <NextChapter
        to="/protocol"
        label={<>Next</>}
        title="The Archon Protocol"
      />

      <EdFooter />
    </>
  )
}
