import { usePageMeta } from '../hooks/usePageMeta.js'
import SiteFooter from '../components/SiteFooter.jsx'

// The customised products ArchonX Consulting delivers — each card describes
// what a build looks like once it has been shaped around one client's stack.
// `wide` makes the closing card span the last row; `delay` staggers the reveal.
const BUILD_CARDS = [
  {
    id: 'receptionist',
    label: '01',
    delay: '0s',
    title: 'AI receptionist',
    body: 'A voice agent that answers in your brand voice, qualifies callers against your criteria, books into your calendar stack, and hands urgent calls to the right person.',
    points: ['Custom greeting and voice', 'Your qualification script', 'Calendar and phone integration'],
  },
  {
    id: 'chat-agent',
    label: '02',
    delay: '0.08s',
    title: 'AI chat agent',
    body: 'A chat agent trained on your documents, policies, and product catalogue, deployed across web, SMS, WhatsApp, and social with handoff rules your team defines.',
    points: ['Trained on your content', 'Multi-channel deployment', 'Custom handoff rules'],
  },
  {
    id: 'dashboard',
    label: '03',
    delay: '0.16s',
    title: 'Operations dashboard',
    body: 'A live view built on your KPIs: revenue, leads, team performance and automation output, pulled straight from the tools you already run.',
    points: ['Your own KPIs', 'Live tool connections', 'Role-based views'],
  },
  {
    id: 'automations',
    label: '04',
    delay: '0.24s',
    title: 'Workflow automations',
    body: 'Automation mapped to how your business actually runs: intake, follow-up, reporting, and the exceptions that used to need a person watching.',
    points: ['Mapped to your process', 'Works across your tools', 'Exception alerts'],
  },
  {
    id: 'pos',
    label: '05',
    delay: '0.32s',
    title: 'Point of sale',
    body: 'A POS shaped around how you sell, with orders, payments and inventory feeding the same live data your dashboard reads.',
    points: ['Your sales flow', 'Inventory sync', 'Dashboard-connected'],
  },
  {
    id: 'forms',
    label: '06',
    delay: '0.4s',
    title: 'Intake and booking forms',
    body: 'Forms that validate on entry, branch on your rules, and route every submission to the right person or workflow the moment it lands.',
    points: ['Conditional logic', 'Entry validation', 'Automatic routing'],
  },
  {
    id: 'command',
    label: '07',
    delay: '0.48s',
    title: 'Operations platforms',
    body: 'Rosters, clock-in, timesheets and SOPs for teams that run shifts, on Bluework from ArchonX Lab, or a bespoke build when your operation needs something that does not exist yet.',
    points: ['Bluework for shift teams', 'Bespoke when needed', 'Built in your name'],
  },
  {
    id: 'every-build',
    label: 'Every build',
    delay: '0.56s',
    wide: true,
    title: 'What you always get',
    body: 'Every product starts in a consultation, is built around your tools and constraints, and ships with training and documentation, with an optional care plan after launch.',
    points: ['Scoped in consultation', 'Integrated with your stack', 'Care plan optional'],
  },
]

export default function ConsultingProducts() {
  usePageMeta({
    title: 'Custom Products - ArchonX Consulting - ArchonX.ai',
    description:
      'The customised products ArchonX Consulting delivers: AI receptionists, chat agents, operations dashboards, workflow automations, point of sale, forms, and operations platforms built around one business at a time.',
    bodyClass: 'subpage-modern consulting-body',
  })

  return (
    <>
      <main className="consulting-page">
        <section className="consulting-hero consulting-hero--sub">
          <div className="consulting-starfield"></div>
          <div className="consulting-orbit consulting-orbit--one"></div>
          <div className="consulting-orbit consulting-orbit--two"></div>
          <div className="container">
            <div className="consulting-hero-inner reveal-up">
              <span className="consulting-hero-tag">ArchonX Consulting: what we build</span>
              <h1>
                <span>Custom products,</span>
                <span>built for one</span>
                <span>business at a time.</span>
              </h1>
              <p>These are the kinds of systems a consulting engagement produces. Each one is scoped in consultation, shaped around your tools and team, and set up in your name.</p>
            </div>
          </div>
        </section>

        <section className="section consulting-frameworks" id="builds">
          <div className="container">
            <div className="section-header reveal-up">
              <span className="section-tag">The builds</span>
              <h2 className="section-title">What a customised product looks like.</h2>
              <p className="section-subtitle">Seven kinds of systems we build, each configured around one business&rsquo;s workflows, data, and operating constraints.</p>
            </div>
            <div className="consulting-card-grid reveal-up">
              {BUILD_CARDS.map((card) => (
                <article
                  key={card.id}
                  className={card.wide ? 'consulting-service-card consulting-service-card--wide' : 'consulting-service-card'}
                  style={{ '--delay': card.delay }}
                >
                  <span>{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <ul>
                    {card.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section consulting-frameworks" id="start">
          <div className="container">
            <div className="section-header reveal-up">
              <span className="section-tag">Your build</span>
              <h2 className="section-title">The next one is scoped around you.</h2>
              <p className="section-subtitle">Tell us where the manual work piles up. We&rsquo;ll come back with the system that removes it, including scope, timeline and rollout path.</p>
            </div>
            <div className="consulting-more-cta reveal-up">
              <a href="/consultation/#book">Start a consultation <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
