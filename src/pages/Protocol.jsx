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
    id: 'delegation',
    pole: 'paper',
    ghost: true,
    no: '03.1',
    label: 'Delegation',
    title: 'Intelligent Task Delegation',
    tag: '[ AI-Powered Routing ]',
    prose: (
      <>
        <p>AI agents direct human agents in real-time, optimising task distribution for absolute adherence to performance metrics. ArchonX acts as an omnipresent floor manager - dynamically routing tasks based on capacity, priority, and worker status.</p>
        <p>Unlike traditional systems that merely track task completion after the fact, ArchonX <strong>proactively assigns, reassigns, and re-routes work</strong> at the speed of operations. When a hazard is detected or a worker shows signs of stress, tasks are instantly redistributed - no manager needed, no delays incurred.</p>
      </>
    ),
    annex: {
      title: 'Key Capabilities',
      no: <>Annex &mdash; 03.1</>,
      delay: '0.1s',
      body: (
        <ul className="pgprotocol-list">
          <li>Real-time autonomous direction of human agents</li>
          <li>Dynamic capacity-based task routing and assignment</li>
          <li>Performance-metric-driven optimisation</li>
          <li>Instant redistribution upon hazard or stressor detection</li>
          <li>Zero middle-management bottleneck</li>
        </ul>
      ),
    },
  },
  {
    id: 'hazard',
    pole: 'ink',
    no: '03.2',
    label: 'Hazard Mitigation',
    title: 'Holistic Hazard Mitigation',
    tag: '[ Multi-Modal Detection ]',
    prose: (
      <>
        <p>A dual-layered protection system that combines physical and psychosocial monitoring through multi-modal audio/visual analytics - identifying risks before they become liabilities.</p>
      </>
    ),
    subclauses: [
      {
        num: '03.2a',
        delay: '0.05s',
        heading: <>03.2a &mdash; Physical Safety</>,
        body: <p>Computer vision scans continuously for PPE compliance and environmental hazards in real time. Video detection systems monitor warehouse floors, construction sites, and operational zones for safety violations, obstructions, and dangerous conditions.</p>,
      },
      {
        num: '03.2b',
        delay: '0.1s',
        heading: <>03.2b &mdash; Psychosocial Monitoring</>,
        body: <p>Hazard word and phrase detection flags stress markers, fatigue indicators, and cognitive load in real time. The system identifies precursors to burnout before they manifest - triggering micro-breaks, call re-routing, or workload redistribution automatically.</p>,
      },
    ],
    annex: {
      title: 'Why Dual-Layered Matters',
      no: <>Annex &mdash; 03.2</>,
      delay: '0.15s',
      body: <p>The competition offers siloed solutions - computer vision for physical safety in one product, text analysis for sentiment in another. ArchonX is the only platform that provides <strong>both physical and psychosocial monitoring in a single, integrated system</strong>, ensuring that no risk vector goes undetected.</p>,
    },
  },
  {
    id: 'personas',
    pole: 'paper',
    ghost: true,
    no: '03.3',
    label: 'Personas',
    title: 'Bespoke Management Personas',
    tag: '[ Cultural Alignment ]',
    prose: (
      <>
        <p>Generic, robotic interfaces kill adoption and morale. ArchonX takes a fundamentally different approach - creating <strong>custom-trained AI personalities</strong> that embody your company's unique culture, knowledge, tone, and directives.</p>
        <p>Each persona is trained to match your specific management style - whether friendly and supportive, or professional and directive. The AI doesn't just execute commands; it leads with emotional intelligence, improving morale and driving adoption rates that generic systems cannot achieve.</p>
      </>
    ),
    annex: {
      title: 'Implementation',
      no: <>Annex &mdash; 03.3</>,
      delay: '0.1s',
      body: (
        <ul className="pgprotocol-list">
          <li>Custom-trained on your company's culture, policies, and values</li>
          <li>Tone-matched to your leadership style (friendly, professional, etc.)</li>
          <li>Embeds institutional knowledge for contextual decision-making</li>
          <li>Premium implementation service for bespoke personality development</li>
          <li>Drives higher adoption rates through cultural alignment</li>
        </ul>
      ),
    },
  },
  {
    id: 'closed-loop',
    pole: 'ink',
    no: '03.4',
    label: 'Closed Loop',
    title: 'Closed-Loop Efficiency Engine',
    tag: '[ Zero Latency ]',
    prose: (
      <>
        <p>The competition detects a hazard and then waits for slow, manual human intervention. ArchonX <strong>closes the loop instantly</strong> - re-routing workflows and reassigning tasks in real-time without requiring human executive intervention.</p>
        <p>This is the core differentiator. ArchonX doesn't just identify problems; it solves them autonomously. When fatigue is detected in a contact-centre agent, the system re-routes complex calls to fresher agents and enforces micro-breaks - all before a human manager would even know there was an issue.</p>
      </>
    ),
    annex: {
      title: 'The Closed Loop in Action',
      no: <>Annex &mdash; 03.4</>,
      delay: '0.1s',
      body: (
        <ol className="pgprotocol-list pgprotocol-list--steps">
          <li><strong>Detect</strong> - Multi-modal sensors identify a hazard or stressor</li>
          <li><strong>Assess</strong> - AI evaluates severity, context, and available resources</li>
          <li><strong>Act</strong> - Workflows are re-routed and tasks reassigned instantly</li>
          <li><strong>Verify</strong> - System confirms resolution and adjusts parameters</li>
          <li><strong>Learn</strong> - Predictive models update for future prevention</li>
        </ol>
      ),
    },
  },
]

export default function Protocol() {
  usePageMeta({
    title: 'The Archon Protocol - ArchonX.ai',
    description: 'Four pillars of autonomous intelligence: Intelligent Task Delegation, Holistic Hazard Mitigation, Bespoke Management Personas, and Closed-Loop Efficiency.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 03 ===================== */}
      <ChapterCover
        no={<>&#8470; 03 / 07</>}
        ghost="PROTOCOL"
        plate="/assets/protocol-bg.svg"
        lines={[
          <>The Archon</>,
          <><span className="ed-ghost">Protocol.</span></>,
        ]}
        dek={<>Four pillars of autonomous intelligence that transform management into a closed-loop, automated engine - replacing reactive oversight with decisive, real-time command.</>}
        aside={
          <>
            <span className="ed-clause-tag">[ Core Capabilities ]</span>
            <span className="ed-kicker">Clauses 03.1 &mdash; 03.4</span>
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
          <SectionHead no="03.5" label="Dispatch" bignum="03.5" title="See the Protocol in action." />
          <div className="pgprotocol-cta reveal-up">
            <p>Discover how ArchonX transforms operations across Australian logistics, BPO, government, and emergency services sectors.</p>
            <div className="pgprotocol-cta-actions">
              <Magnetic to="/markets" className="ed-btn ed-btn--solid">Explore Markets <span className="ed-arrow">&rarr;</span></Magnetic>
              <Magnetic to="/invest" className="ed-btn ed-btn--outline">Investor Information</Magnetic>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — № 04 ===================== */}
      <NextChapter to="/markets" label={<>Next &mdash; &#8470; 04 / 07</>} title="Markets" />

      <EdFooter />
    </>
  )
}
