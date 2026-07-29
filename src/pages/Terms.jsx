import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { handleHashClick } from '../motion/index.js'
import { ChapterCover, SectionHead, NextChapter, Section } from '../components/editorial/index.js'

// Single source for the clause rail and the clause bodies below it: `n` drives
// the rail's "B.n", the body's "Clause B.n", and the heading's "n. Label", so
// the index and the text can never drift apart.
const CLAUSES = [
  {
    id: 'acceptance-of-terms',
    n: 1,
    label: 'Acceptance of Terms',
    body: <p>These Terms and Conditions ("Terms") apply to your access to and use of the ArchonX.ai website, related pages, consultation request forms, demos, and business communications. By using the website or requesting information from ArchonX, you agree to these Terms.</p>,
  },
  {
    id: 'about-archonx',
    n: 2,
    label: 'About ArchonX',
    body: <p>ArchonX is based in Australia and provides AI-driven operational intelligence, automation, workforce optimisation, and consulting-related services. Website content is provided for general business information and does not create a customer agreement, service commitment, or professional advisory relationship unless a separate written agreement is executed.</p>,
  },
  {
    id: 'website-use',
    n: 3,
    label: 'Website Use',
    body: <p>You agree to use the website lawfully and responsibly. You may not attempt to disrupt, reverse engineer, scrape at scale, compromise, overload, or misuse the website or any systems connected to it. You may not submit unlawful, harmful, misleading, confidential third-party, or unauthorized information through the website.</p>,
  },
  {
    id: 'consultations-demos-pilots',
    n: 4,
    label: 'Consultations, Demos, and Pilots',
    body: <p>Consultation requests, demo discussions, pilot proposals, pricing conversations, technical descriptions, timelines, and potential outcomes are exploratory unless confirmed in a signed agreement. Any pilot or production deployment should be governed by separate written terms, including scope, fees, data handling, security, responsibilities, and service levels.</p>,
  },
  {
    id: 'no-guaranteed-outcomes',
    n: 5,
    label: 'No Guaranteed Outcomes',
    body: <p>ArchonX may describe potential efficiency, safety, reporting, or cost outcomes based on use cases, assumptions, or projected benefits. Actual results depend on customer environment, data quality, implementation scope, adoption, integrations, and operational factors. We do not guarantee specific business, financial, safety, compliance, or operational results from website information alone.</p>,
  },
  {
    id: 'intellectual-property',
    n: 6,
    label: 'Intellectual Property',
    body: <p>The website, brand elements, copy, designs, graphics, software concepts, product descriptions, and other materials are owned by ArchonX or its licensors and are protected by applicable intellectual property laws. You may view the website for business evaluation purposes, but you may not copy, reproduce, modify, distribute, or create derivative works without written permission.</p>,
  },
  {
    id: 'user-submissions',
    n: 7,
    label: 'User Submissions',
    body: <p>If you submit business information, requirements, feedback, or other materials to ArchonX, you represent that you have the right to provide that information. You grant ArchonX permission to use submitted information to respond to your request, evaluate fit, prepare proposals, provide support, and improve our services, subject to our Privacy Policy and any separate written agreement.</p>,
  },
  {
    id: 'third-party-services',
    n: 8,
    label: 'Third-Party Services and Links',
    body: <p>The website may reference third-party tools, platforms, integrations, or external links. ArchonX is not responsible for third-party websites, policies, availability, performance, or content. Your use of third-party services may be governed by their own terms and policies.</p>,
  },
  {
    id: 'disclaimers',
    n: 9,
    label: 'Disclaimers',
    body: <p>The website and its content are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, ArchonX disclaims warranties of merchantability, fitness for a particular purpose, non-infringement, uninterrupted availability, and error-free operation.</p>,
  },
  {
    id: 'limitation-of-liability',
    n: 10,
    label: 'Limitation of Liability',
    body: <p>To the fullest extent permitted by law, ArchonX will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages, or for lost profits, lost revenue, lost data, or business interruption arising from website use or reliance on website content.</p>,
  },
  {
    id: 'changes-to-terms',
    n: 11,
    label: 'Changes to These Terms',
    body: <p>We may update these Terms from time to time. Updates will be reflected by the "Last updated" date on this page. Continued use of the website after changes are posted means you accept the updated Terms.</p>,
  },
  {
    id: 'governing-law',
    n: 12,
    label: 'Governing Law',
    body: <p>These Terms are governed by the laws of Australia. Any disputes arising from these Terms or your use of the website are subject to the non-exclusive jurisdiction of the Australian courts. Nothing in these Terms excludes, restricts, or modifies any consumer guarantee or right you may have under the Australian Consumer Law that cannot lawfully be excluded.</p>,
  },
  {
    id: 'contact',
    n: 13,
    label: 'Contact',
    body: <p>For questions about these Terms, contact us at <a href="mailto:hello@archonx.ai">hello@archonx.ai</a>.</p>,
  },
]

export default function Terms() {
  usePageMeta({
    title: 'Terms and Conditions - ArchonX.ai',
    description: 'Terms and Conditions for using the ArchonX.ai website, consultation services, demos, pilots, and related business interactions.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — APPENDIX B ===================== */}
      <ChapterCover
        no={<>Appendix B / Terms</>}
        ghost="TERMS"
        lines={[
          <>Terms for</>,
          <>using <span className="ed-ghost">ArchonX.</span></>,
        ]}
        dek={<>These terms explain the rules for using our website, requesting consultations, and engaging with ArchonX demos, pilots, and services.</>}
        aside={
          <>
            <span className="ed-kicker">[ Appendix B &mdash; 13 Clauses ]</span>
            <span className="ed-kicker">Last updated &mdash; June 9, 2026</span>
          </>
        }
      />

      {/* ===================== № B.1–B.13 — THE CLAUSES ===================== */}
      <Section pole="paper">
        <div className="ed-container">
          <SectionHead
            meta={<>&#8470; B.1&ndash;B.13 / Terms and Conditions</>}
            bignum="B"
            title="Terms and Conditions"
          />

          <div className="edc-doc">
            <nav className="edc-doc-rail reveal-up" aria-label="Clause index">
              {CLAUSES.map((c) => (
                <a key={c.id} href={`#${c.id}`} onClick={handleHashClick}>{`B.${c.n}`} &mdash; {c.label}</a>
              ))}
            </nav>

            <div className="edc-doc-body">
              {CLAUSES.map((c) => (
                <section className="edc-clause reveal-up" id={c.id} key={c.id}>
                  <span className="edc-clause-no">{`Clause B.${c.n}`}</span>
                  <h2>{`${c.n}. ${c.label}`}</h2>
                  {c.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER ===================== */}
      <NextChapter
        to="/"
        label={<>Cover &mdash; &#8470; 01 / 07</>}
        title="Return to Cover"
      />

      <EdFooter />
    </>
  )
}
