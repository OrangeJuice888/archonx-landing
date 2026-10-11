import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { Magnetic, Parallax } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'
import '../styles/pages/competitive.css'

// № 05.1 — the ledger of contrasts. Each entry is one .ed-clause article:
// the usual way on the left, the ArchonX answer on the right. No competitor is
// named; the contrast is with how AI work is commonly sold.
// `delay` is absent on the first card (no inline style is emitted for it).
const CONTRASTS = [
  {
    no: '01',
    title: 'We build what we recommend',
    competition: "A strategy deck, a workshop and a list of tools. The business is left to build it, or to pay someone else to.",
    way: "We build it, test it on real calls, emails and documents, and hand it over with a one-page runbook and 30 days of included fixes. The written quote names the go-live date.",
  },
  {
    no: '02',
    title: 'Built in your name',
    competition: "The provider holds the accounts, the phone number and the subscriptions, so leaving means starting again.",
    way: "Every account, number and subscription sits under your business with your logins. Month to month, 30 days' notice, no exit fee. If we disappeared tomorrow, the system would keep running.",
    delay: '0.05s',
  },
  {
    no: '03',
    title: 'People stay in charge',
    competition: "Automation that acts without anyone checking, and assistants that let callers believe they are talking to a person.",
    way: "Every assistant says it is an AI. Money, health, legal and tenancy decisions go through a person. The monthly report shows what the system got wrong as well as what it handled.",
    delay: '0.1s',
  },
  {
    no: '04',
    title: 'Software and consulting under one roof',
    competition: "Vendors who sell a platform and consultants who sell hours, and rarely the same people when something breaks.",
    way: "ArchonX Lab builds the software and ArchonX Consulting implements it. When your operations need something that doesn't exist yet, we build it, and the same people answer the phone afterwards.",
    delay: '0.15s',
  },
]

// № 05.3 — three ways to begin. Three .edc-tier cards, staggered.
const TIERS = [
  {
    name: 'Bluework',
    meta: 'Software, in early access',
    desc: 'Rosters, clock-in and timesheets, leave, tasks, team chat, voice-recorded SOPs and a company AI agent for teams that run shifts. The optional Protect layer flags psychosocial-hazard signals for human review and is in controlled rollout. From A$8 per active employee a month (minimum four), ex GST.',
    tag: '[ ArchonX Lab — bluework.com.au ]',
  },
  {
    name: 'Packages',
    meta: 'Consulting at published prices',
    desc: 'Front Desk, Back Office and Whole Shop: AI receptionist, chat agent, lead follow-up, inbox, bookkeeping and workflow automation, from $399 a month plus $990 setup, or own the build outright from $3,900. All prices ex GST, month to month.',
    tag: '[ ArchonX Consulting — fixed quotes ]',
    delay: '0.05s',
  },
  {
    name: 'Custom builds',
    meta: 'Both arms, scoped in consultation',
    desc: 'Workflow automation from $2,500, 90-day pilots from $5,900, and review and launch for apps built with AI from $1,500, all ex GST. Bespoke systems too: point of sale and back office, marketplaces, operations dashboards. Built in your name, handed over with a runbook.',
    tag: '[ Mapped first, then built ]',
    delay: '0.1s',
  },
]

export default function Competitive() {
  usePageMeta({
    title: "How we're different - ArchonX.ai",
    description: 'How ArchonX differs: we build what we recommend, in your name, with people in charge, and software and consulting sit under one roof.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — № 05 ===================== */}
      <ChapterCover
        no={<>&#8470; 05 / 06</>}
        ghost="ADVANTAGE"
        plate="/assets/moat-bg.svg"
        lines={[
          <>Software, and the</>,
          <>people who put it</>,
          <><span className="ed-ghost">to work.</span></>,
        ]}
        dek={<>Most businesses can buy AI tools. Few get them running inside the business, in their own name, with someone accountable for the result. That's the part we do.</>}
        aside={<span className="ed-kicker">[ The Advantage ]</span>}
      />

      {/* ===================== № 05.1 — THE LEDGER OF CONTRASTS ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">05</Parallax>
        <div className="ed-container">
          <SectionHead
            no="05.1"
            label="How we're different"
            bignum="05.1"
            title="Four things we do differently."
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
                <span className="edc-clause-no">The usual way</span>
                <p className="ed-ledger-crisis pgcompetitive-crisis">{c.competition}</p>
              </div>
              <div className="ed-clause-body">
                <span className="edc-clause-no">What we do</span>
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
            label="Our view"
            bignum="05.2"
            title="The short version."
          />
          <div className="ed-quote-block reveal-up">
            <span className="ed-quote-dash"></span>
            <blockquote className="ed-quote">
              Start with <span className="ed-underline ed-underline--heavy">one job</span>, prove it, then expand.
            </blockquote>
            <p className="ed-quote-sub">Fixed quotes in writing, prices published on the page, a go-live date in the quote, and a measured report after 30 days. That is the whole strategy. We don't promise business results; we show what the system did.</p>
            <div className="ed-offering-ctas">
              <Magnetic href="/consultation/#audit" className="ed-btn ed-btn--solid">Start the free audit <span className="ed-arrow">&rarr;</span></Magnetic>
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== № 05.3 — THREE WAYS TO BEGIN ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead
            no="05.3"
            label="Ways to start"
            bignum="05.3"
            title="Start small, then grow."
            dek={<>Three ways in. Each one starts with a single job and grows only when it has paid for itself.</>}
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
      <NextChapter href="/consultation/" label={<>Next &mdash; &#8470; 06 / 06</>} title="Start a consultation" />

      <EdFooter />
    </>
  )
}
