import { Link } from 'react-router-dom'
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
    title: 'AI Receptionist',
    body: 'A voice agent that answers in your brand voice, qualifies callers against your criteria, books into your calendar stack, and hands urgent calls to the right person.',
    points: ['Custom greeting and voice', 'Your qualification script', 'Calendar and phone integration'],
  },
  {
    id: 'chat-agent',
    label: '02',
    delay: '0.08s',
    title: 'AI Chat Agent',
    body: 'A chat agent trained on your documents, policies, and product catalogue, deployed across web, SMS, WhatsApp, and social with handoff rules your team defines.',
    points: ['Trained on your content', 'Multi-channel deployment', 'Custom handoff rules'],
  },
  {
    id: 'dashboard',
    label: '03',
    delay: '0.16s',
    title: 'Operations Dashboard',
    body: 'A live command view built on your KPIs — revenue, leads, team performance, and automation output pulled straight from the tools you already run.',
    points: ['Your KPIs, not templates', 'Live tool connections', 'Role-based views'],
  },
  {
    id: 'automations',
    label: '04',
    delay: '0.24s',
    title: 'Workflow Automations',
    body: 'End-to-end automation mapped to how your business actually operates — intake, follow-up, reporting, and the exceptions that used to need a person watching.',
    points: ['Mapped to your process', 'Cross-tool orchestration', 'Exception alerts'],
  },
  {
    id: 'pos',
    label: '05',
    delay: '0.32s',
    title: 'Point of Sale',
    body: 'A POS shaped around how you sell — orders, payments, and inventory feeding the same live data your dashboard reads, online or offline.',
    points: ['Your sales flow', 'Inventory sync', 'Dashboard-connected'],
  },
  {
    id: 'forms',
    label: '06',
    delay: '0.4s',
    title: 'Intake and Booking Forms',
    body: 'Forms that validate on entry, branch on your rules, and route every submission to the right person or workflow the moment it lands.',
    points: ['Conditional logic', 'Entry validation', 'Automatic routing'],
  },
  {
    id: 'command',
    label: '07',
    delay: '0.48s',
    title: 'Command Systems',
    body: 'Bespoke operational command for teams that need workforce intelligence and task delegation — with a direct upgrade path into the ArchonX Lab suite.',
    points: ['Risk signal design', 'Task routing', 'Lab suite upgrade path'],
  },
  {
    id: 'every-build',
    label: 'Every Build',
    delay: '0.56s',
    wide: true,
    title: 'Yours, not a template',
    body: 'Every product starts in a consultation, is built around your tools and constraints, and ships with training, documentation, and ongoing management.',
    points: ['Scoped in consultation', 'Integrated with your stack', 'Managed after launch'],
  },
]

export default function ConsultingProducts() {
  usePageMeta({
    title: 'Custom Products - ArchonX Consulting - ArchonX.ai',
    description:
      'The customised products ArchonX Consulting delivers: AI receptionists, chat agents, operations dashboards, workflow automations, point of sale, forms, and command systems built around one business at a time.',
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
              <span className="consulting-hero-tag">ArchonX Consulting &mdash; Delivered Work</span>
              <h1>
                <span>Custom Products,</span>
                <span>Built For One</span>
                <span>Business At A Time.</span>
              </h1>
              <p>These are the systems consulting engagements produce &mdash; not demos, not templates. Each one is scoped in consultation, shaped around your tools and team, and run in production.</p>
            </div>
          </div>
        </section>

        <section className="section consulting-frameworks" id="builds">
          <div className="container">
            <div className="section-header reveal-up">
              <span className="section-tag">The Builds</span>
              <h2 className="section-title">What a customised product looks like.</h2>
              <p className="section-subtitle">Seven kinds of systems we deliver, each configured around a single client&rsquo;s workflows, data, and operating constraints.</p>
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
              <span className="section-tag">Your Build</span>
              <h2 className="section-title">The next one is scoped around you.</h2>
              <p className="section-subtitle">Tell us where the manual work piles up and we&rsquo;ll come back with the system that removes it &mdash; scope, timeline, and rollout path included.</p>
            </div>
            <div className="consulting-more-cta reveal-up">
              <Link to="/consultation#consultation-form">Start a Consultation <span aria-hidden="true">&rarr;</span></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
