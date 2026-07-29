import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta.js'
import SiteFooter from '../components/SiteFooter.jsx'
import ConsultationOrb from '../components/ConsultationOrb.jsx'

// The seven service lines plus the pilot-roadmap offering. `wide` makes the
// Core Offering card span the last row's remaining columns; `delay` drives the
// staggered reveal.
const SERVICE_CARDS = [
  {
    id: 'receptionist',
    label: '01',
    delay: '0s',
    title: 'AI Receptionist',
    body: 'Voice agents that answer calls, qualify prospects, capture intent, and route bookings or urgent requests around the clock.',
    points: ['24/7 availability', 'Lead qualification', 'Calendar routing'],
  },
  {
    id: 'chat-agents',
    label: '02',
    delay: '0.08s',
    title: 'AI Chat Agents',
    body: 'Chat agents trained on your business, deployed across web, SMS, WhatsApp, and social channels with human handoff when needed.',
    points: ['Trained on your data', 'Lead capture', 'Human handoff'],
  },
  {
    id: 'dashboards',
    label: '03',
    delay: '0.16s',
    title: 'Custom Dashboards',
    body: 'Live dashboards connected to your real data so leaders can see revenue, leads, team performance, and automation output instantly.',
    points: ['Real-time data', 'Custom KPIs', 'Tool integrations'],
  },
  {
    id: 'automations',
    label: '04',
    delay: '0.24s',
    title: 'Custom AI Automations',
    body: 'End-to-end workflow systems designed around how your business actually operates, from intake to reporting to follow-up.',
    points: ['Workflow mapping', 'Bespoke builds', 'Ongoing optimisation'],
  },
  {
    id: 'pos',
    label: '05',
    delay: '0.32s',
    title: 'Custom POS',
    body: 'Point-of-sale systems built around how you sell, with orders, payments, and inventory feeding the same live data your dashboards read.',
    points: ['Order and payment flow', 'Inventory sync', 'Offline-ready'],
  },
  {
    id: 'forms',
    label: '06',
    delay: '0.4s',
    title: 'Custom Forms',
    body: 'Intake, booking, and data-capture forms that validate on entry, route each submission to the right person, and feed your workflows.',
    points: ['Conditional logic', 'Validation rules', 'Workflow routing'],
  },
  {
    id: 'command-systems',
    label: '07',
    delay: '0.48s',
    title: 'ArchonX Command Systems',
    body: 'Autonomous operational management for teams that need workforce intelligence, safety signals, task delegation, and real-time command.',
    points: ['Risk signal design', 'Task routing', 'Operational command'],
  },
  {
    id: 'pilot-roadmap',
    label: 'Core Offering',
    delay: '0.56s',
    wide: true,
    title: 'Pilot Roadmap',
    body: 'Turn the consultation into a clear project scope, timeline, data plan, success metrics, and rollout path your team can act on.',
    points: ['30-day pilot plan', 'ROI model', 'Deployment path'],
  },
]

const PROCESS_STEPS = [
  {
    id: 'consultation',
    number: '01',
    title: 'Consultation',
    body: 'We learn the business, the bottlenecks, the customer or operational journey, and where AI can create the biggest lift.',
  },
  {
    id: 'proposal',
    number: '02',
    title: 'Proposal',
    body: 'You receive a clear scope with the system design, project milestones, timeline, and commercial model.',
  },
  {
    id: 'project',
    number: '03',
    title: 'Project',
    body: 'We build, test, integrate, and tune the AI system around your tools, team, data, and operating constraints.',
  },
  {
    id: 'ongoing-management',
    number: '04',
    title: 'Ongoing Management',
    body: 'We monitor performance, optimise workflows, add new automations, and keep the system improving as the business scales.',
  },
]

const BENEFIT_CARDS = [
  {
    id: 'efficiency',
    number: '01',
    title: 'Increased Efficiency',
    body: 'Remove repetitive work and give teams more time for decisions, customers, and high-value operations.',
  },
  {
    id: 'scalable-growth',
    number: '02',
    title: 'Scalable Growth',
    body: 'Systems that expand with volume without forcing every new workload into another manual hire.',
  },
  {
    id: 'cost-reductions',
    number: '03',
    title: 'Cost Reductions',
    body: 'Replace slow manual workflows with automated systems that run continuously and report clearly.',
  },
  {
    id: 'response-times',
    number: '04',
    title: 'Faster Response Times',
    body: 'Respond to leads, questions, incidents, and operational signals before the opportunity is lost.',
  },
  {
    id: 'data-driven',
    number: '05',
    title: 'Data-Driven Decisions',
    body: 'Use live dashboards and AI-generated insights to understand performance as it changes.',
  },
  {
    id: 'competitive-advantage',
    number: '06',
    title: 'Competitive Advantage',
    body: 'Move earlier than competitors by putting automation and command intelligence into daily operations.',
  },
]

const CONSULTATION_POINTS = [
  {
    id: 'fit',
    label: 'Fit',
    body: 'Built for every sector we serve: retail, construction, service, hospitality, logistics, BPO, government, and emergency operations.',
  },
  {
    id: 'scope',
    label: 'Scope',
    body: 'Focused on pilot design, operational ROI, and deployment readiness.',
  },
  {
    id: 'output',
    label: 'Output',
    body: 'A practical recommendation across the ArchonX Lab suite — Bluework, Argos-5, or ArchonX.',
  },
]

export default function Consultation() {
  usePageMeta({
    title: 'ArchonX Consulting - ArchonX.ai',
    description:
      'ArchonX Consulting: AI and ML consulting, custom automation, and intelligent agents. Start a consultation to assess operational command, workforce intelligence, and autonomous management opportunities.',
    bodyClass: 'subpage-modern consulting-body',
  })

  return (
    <>
      <main className="consulting-page">
        <section className="consulting-hero">
          <div className="consulting-starfield"></div>
          <div className="consulting-orbit consulting-orbit--one"></div>
          <div className="consulting-orbit consulting-orbit--two"></div>
          <div className="container">
            <div className="consulting-hero-inner reveal-up">
              <span className="consulting-hero-tag">ArchonX Consulting</span>
              <h1>
                <span>AI &amp; ML Consulting</span>
                <span>Custom Automation</span>
                <span>Intelligent Agents</span>
              </h1>
              <p>Built for measurable operational return. We consult, design, and deploy production-grade AI systems that qualify enquiries, automate workflows, surface live performance, and extend into ArchonX operational command.</p>
              <ConsultationOrb />
              <span className="consulting-orb-caption">[ Every signal in orbit &mdash; one point of command ]</span>
            </div>
          </div>
        </section>

        <section className="section consulting-frameworks" id="frameworks">
          <div className="container">
            <div className="section-header reveal-up">
              <span className="section-tag">Frameworks</span>
              <h2 className="section-title">Everything your business needs to run on AI.</h2>
              <p className="section-subtitle">Seven service lines. One consulting partner for customer-facing agents, live dashboards, point-of-sale, custom automation, and autonomous operational command.</p>
            </div>
            <div className="consulting-card-grid reveal-up">
              {SERVICE_CARDS.map((card) => (
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
            <div className="consulting-more-cta reveal-up">
              <Link to="/consultation/products">See the custom products we build <span aria-hidden="true">&rarr;</span></Link>
            </div>
          </div>
        </section>

        <section className="section consulting-process" id="process">
          <div className="container">
            <div className="consulting-process-grid reveal-up">
              <div>
                <span className="section-tag">Process</span>
                <h2 className="section-title">From first call to deployment-ready plan.</h2>
                <p className="body-large">The goal is not a generic AI workshop. It is a practical build plan that defines the system, implementation path, cost, timeline, and ongoing management model.</p>
              </div>
              <div className="consulting-step-list">
                {PROCESS_STEPS.map((step) => (
                  <div className="consulting-step" key={step.id}>
                    <strong>{step.number}</strong>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section consulting-benefits" id="benefits">
          <div className="container">
            <div className="section-header reveal-up">
              <span className="section-tag">Why ArchonX Consulting</span>
              <h2 className="section-title">Built for businesses that mean business.</h2>
              <p className="section-subtitle">We combine consulting, implementation, and operational intelligence so the AI system is useful on day one and stronger every month after.</p>
            </div>
            <div className="consulting-benefits-grid reveal-up">
              {BENEFIT_CARDS.map((card) => (
                <article className="consulting-benefit-card" key={card.id}>
                  <span>{card.number}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section consultation-section" id="consultation-form">
          <div className="container">
            <div className="consultation-grid reveal-up">
              <div className="consultation-copy">
                <span className="section-tag">Start</span>
                <h2 className="section-title">Tell us where command breaks down today.</h2>
                <p className="body-large">Share the environment, team, and operational pressure you want to improve. We will respond with the right consultation path and the first questions we need to answer.</p>
                <div className="consultation-points">
                  {CONSULTATION_POINTS.map((point) => (
                    <div key={point.id}>
                      <span>{point.label}</span>
                      <p>{point.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              <form className="consultation-form" action="mailto:hello@archonx.ai" method="post" encType="text/plain">
                <div className="form-row">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" autoComplete="name" required />
                </div>
                <div className="form-row">
                  <label htmlFor="email">Work Email</label>
                  <input id="email" name="email" type="email" autoComplete="email" required />
                </div>
                <div className="form-row">
                  <label htmlFor="company">Company</label>
                  <input id="company" name="company" type="text" autoComplete="organization" required />
                </div>
                <div className="form-row">
                  <label htmlFor="message">Operational Priority</label>
                  <textarea id="message" name="operational_priority" rows="5" required></textarea>
                </div>
                <button className="btn btn-primary btn-large" type="submit">
                  <span>Start a Consultation</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
