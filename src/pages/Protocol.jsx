import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { ChapterCover, Section, SectionHead, NextChapter } from '../components/editorial/index.js'
import { Magnetic, Parallax } from '../motion/index.js'
import '../styles/pages/protocol.css'

// The four clauses of the Protocol (03.1 — 03.4). Every clause is the same
// spread: a sticky rail carrying the SectionHead + clause tag, then prose, an
// optional run of subclauses, and a closing annex.
//
//   ghost      — paper clauses hang an oversized parallax numeral off the band,
//                which also earns the section its .pgprotocol-ghost-host class
//   subclauses — only 03.2 splits its body into lettered subclauses
//   annex.body — varies by clause (ul, plain p, ordered steps), so it is stored
//                as a JSX node rather than a list of strings
const CLAUSES = [
  {
    id: 'map',
    pole: 'paper',
    ghost: true,
    no: '03.1',
    label: 'Map',
    title: 'Map the work',
    tag: '[ Map Before Build ]',
    prose: (
      <>
        <p>The first hour of every engagement is spent on how a job actually moves through the business, from the first call to the paid invoice: who touches it, which software it lives in, where it waits. Most of what is worth automating is obvious once it is drawn.</p>
        <p>So is what to leave alone. The map ends with a ranked list of opportunities, each with an <strong>estimated</strong> hours figure, labelled as an estimate, and a "don't bother" list of work that isn't worth automating.</p>
      </>
    ),
    annex: {
      title: 'What the map covers',
      no: <>Step 1 of 4</>,
      delay: '0.1s',
      body: (
        <ul className="pgprotocol-list">
          <li>Every step from first contact to paid invoice, and who approves what</li>
          <li>The software each step already lives in</li>
          <li>Hours each job takes today, as a labelled estimate</li>
          <li>The one job to start with, and the order for the rest</li>
          <li>The "don't bother" list</li>
        </ul>
      ),
    },
  },
  {
    id: 'build',
    pole: 'ink',
    no: '03.2',
    label: 'Build',
    title: 'Build on what you run',
    tag: '[ Software + Implementation ]',
    prose: (
      <>
        <p>We connect the software a business already uses and build only what is missing. If ServiceM8, Cliniko or Xero already does something, we connect it instead of rebuilding it.</p>
      </>
    ),
    subclauses: [
      {
        num: '03.2a',
        delay: '0.05s',
        heading: <>Platforms we build</>,
        body: <p>Bluework, ArchonX Lab's operations platform for teams that run shifts: rosters, clock-in and timesheets, leave, tasks, team chat, voice-recorded SOPs and a company AI agent, with an optional Protect layer, in controlled rollout, that flags psychosocial-hazard signals for human review. Custom systems built in-house: point of sale and back office, marketplaces with escrow payments, operations dashboards.</p>,
      },
      {
        num: '03.2b',
        delay: '0.1s',
        heading: <>Systems we connect</>,
        body: <p>Job, practice, booking and accounting software most Australian businesses run: ServiceM8, Tradify, Simpro, AroFlo, Cliniko, Halaxy, Nookal, Best Practice, Xero, MYOB, QuickBooks, HubSpot, Pipedrive, Zoho, Shopify, Square, Lightspeed, Google Workspace and Microsoft 365. Workflows run on standard tools, in the client's own workspace.</p>,
      },
    ],
    annex: {
      title: 'What "in your name" means',
      no: <>Step 2 of 4</>,
      delay: '0.15s',
      body: <p>Every account, phone number and subscription is set up under the client's business with the client's logins. A one-page runbook is written so another provider could pick it up. <strong>If ArchonX disappeared tomorrow, the system would keep running.</strong> Month to month, no exit fee.</p>,
    },
  },
  {
    id: 'govern',
    pole: 'paper',
    ghost: true,
    no: '03.3',
    label: 'Govern',
    title: 'Keep people in charge',
    tag: '[ Human Review ]',
    prose: (
      <>
        <p>Every AI assistant we deploy says it is an AI at the start of the conversation and hands over to a person when asked. Nothing we build pretends to be a named human, and we do not clone voices.</p>
        <p>Anything a customer would be upset to find out was automatic goes through a person first: money, health, legal and tenancy decisions, and every change to a ledger or a calendar that a rule didn't already allow.</p>
      </>
    ),
    annex: {
      title: 'Standing rules',
      no: <>Step 3 of 4</>,
      delay: '0.1s',
      body: (
        <ul className="pgprotocol-list">
          <li>Every AI assistant identifies itself as an AI</li>
          <li>A person approves money, health, legal and tenancy decisions</li>
          <li>Data kept in the Australian region wherever the provider offers one, and disclosed where it isn't</li>
          <li>Business-tier AI accounts whose terms exclude training on client data</li>
          <li>Designed to align with the Australian Privacy Principles, the Voluntary AI Safety Standard and the National AI Centre's Guidance for AI Adoption; no certification claimed</li>
        </ul>
      ),
    },
  },
  {
    id: 'run',
    pole: 'ink',
    no: '03.4',
    label: 'Run',
    title: 'Run, measure, expand',
    tag: '[ Closed Loop, Measured ]',
    prose: (
      <>
        <p>Nothing faces a customer until the client has heard it, read it and approved the rules. Then it goes live with a go-live date committed in the quote, a text every Friday during the build, and 30 days of included fixes afterwards.</p>
        <p>Every month the system reports what it did: calls answered, messages handled, drafts approved and drafts rejected, so the client can see where it got things wrong as well as right. The next job starts when the first one has paid for itself.</p>
      </>
    ),
    annex: {
      title: 'How it runs',
      no: <>Step 4 of 4</>,
      delay: '0.1s',
      body: (
        <ol className="pgprotocol-list pgprotocol-list--steps">
          <li><strong>Test</strong>: on real calls, emails and documents before anything faces a customer</li>
          <li><strong>Go live</strong>: on the date in the quote, in the client's name</li>
          <li><strong>Report</strong>: monthly, on what ran, what it handled and what it got wrong</li>
          <li><strong>Fix</strong>: 30 days of included fixes, then a care plan if wanted</li>
          <li><strong>Expand</strong>: the next job, once the first has paid for itself</li>
        </ol>
      ),
    },
  },
]

export default function Protocol() {
  usePageMeta({
    title: 'The Archon Protocol - ArchonX.ai',
    description: 'How ArchonX puts AI to work in a business: map the work, build on what you already run, keep people in charge, then run, measure and expand. The same four steps apply to our software and our consulting.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 03 ===================== */}
      <ChapterCover
        no={<>03 / 06</>}
        ghost="PROTOCOL"
        plate="/assets/protocol-bg.svg"
        lines={[
          <>The Archon</>,
          <><span className="ed-ghost">Protocol.</span></>,
        ]}
        dek={<>How ArchonX puts AI to work in a business: map the work, build on what you already run, keep people in charge, then run, measure and expand. The same four steps apply to our software and our consulting.</>}
        aside={
          <>
            <span className="ed-clause-tag">[ How We Work ]</span>
            <span className="ed-kicker">Four steps</span>
          </>
        }
      />

      {/* ===================== № 03.1 — 03.4 — THE FOUR CLAUSES ===================== */}
      {CLAUSES.map((clause) => (
        <Section
          key={clause.id}
          pole={clause.pole}
          id={clause.id}
          className={clause.ghost ? 'pgprotocol-ghost-host' : undefined}
        >
          {clause.ghost ? (
            <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">{clause.no}</Parallax>
          ) : null}
          <div className="ed-container">
            <div className="edc-spread pgprotocol-spread">
              <div className="edc-spread-rail">
                <SectionHead no={clause.no} label={clause.label} bignum={clause.no} title={clause.title} />
                <span className="ed-clause-tag reveal-up">{clause.tag}</span>
              </div>
              <div>
                <div className="edc-prose reveal-up">{clause.prose}</div>
                {clause.subclauses?.map((sub) => (
                  <div key={sub.num} className="ed-subclause pgprotocol-subclause reveal-up" style={{ '--delay': sub.delay }}>
                    <h3 className="ed-subclause-num">{sub.heading}</h3>
                    {sub.body}
                  </div>
                ))}
                <div className="pgprotocol-annex reveal-up" style={{ '--delay': clause.annex.delay }}>
                  <div className="pgprotocol-annex-head">
                    <h4>{clause.annex.title}</h4>
                    <span className="pgprotocol-annex-no">{clause.annex.no}</span>
                  </div>
                  {clause.annex.body}
                </div>
              </div>
            </div>
          </div>
        </Section>
      ))}

      {/* ===================== № 03.5 — DISPATCH ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead no="03.5" label="Next step" bignum="03.5" title="See it by sector." />
          <div className="pgprotocol-cta reveal-up">
            <p>Read how the four steps apply in your sector, or start with the free two-minute audit: it names the first job AI could take on in your business and what fits your budget.</p>
            <div className="pgprotocol-cta-actions">
              <Magnetic to="/markets" className="ed-btn ed-btn--solid">Explore markets <span className="ed-arrow">&rarr;</span></Magnetic>
              <Magnetic href="/consultation/#audit" className="ed-btn ed-btn--outline">Start the free audit</Magnetic>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — № 04 ===================== */}
      <NextChapter to="/markets" label={<>Next</>} title="Markets" />

      <EdFooter />
    </>
  )
}
