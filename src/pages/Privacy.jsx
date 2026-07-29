import { usePageMeta } from '../hooks/usePageMeta.js'
import EdFooter from '../components/EdFooter.jsx'
import { ChapterCover, Section, SectionHead, NextChapter } from '../components/editorial/index.js'
import { Parallax, handleHashClick } from '../motion/index.js'

// The ten clauses of Appendix A. Each entry drives both the contents rail and
// the clause body below it, so the numbering can never drift between the two.
// `rail` and `body` are JSX so every entity and inline link survives verbatim.
const CLAUSES = [
  {
    id: 'overview',
    no: 'A.1',
    rail: <>A.1 &mdash; Overview</>,
    heading: '1. Overview',
    body: (
      <>
        <p>ArchonX.ai ("ArchonX", "we", "us", or "our") respects privacy and is committed to handling personal information responsibly. We are based in Australia and handle personal information in accordance with the Privacy Act 1988 (Cth) and the Australian Privacy Principles. This Privacy Policy applies to information collected through our website, consultation requests, email communications, pilot discussions, and related business interactions.</p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    no: 'A.2',
    rail: <>A.2 &mdash; Information We Collect</>,
    heading: '2. Information We Collect',
    body: (
      <>
        <p>We may collect information you provide directly, including your name, company, role, email address, phone number, business requirements, consultation notes, and any details submitted through forms or email.</p>
        <p>We may also collect technical and usage information, such as browser type, device information, IP address, referring pages, pages viewed, and general analytics data used to understand site performance and improve the experience.</p>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    no: 'A.3',
    rail: <>A.3 &mdash; How We Use Information</>,
    heading: '3. How We Use Information',
    body: (
      <>
        <p>We use information to respond to enquiries, schedule demos or consultations, evaluate business fit, provide requested information, operate and improve our website, support pilots or services, maintain security, and comply with applicable business or legal obligations.</p>
      </>
    ),
  },
  {
    id: 'operational-data',
    no: 'A.4',
    rail: <>A.4 &mdash; AI, Pilot &amp; Operational Data</>,
    heading: '4. AI, Pilot, and Operational Data',
    body: (
      <>
        <p>For demos, pilots, or deployments, customer-provided operational information may be used to configure, test, support, and deliver the agreed ArchonX service. Production data handling should be governed by the applicable customer agreement, statement of work, or data processing terms.</p>
        <p>We do not sell customer operational data. We use service-related data only for legitimate business purposes connected to delivering, securing, maintaining, and improving ArchonX services.</p>
      </>
    ),
  },
  {
    id: 'sharing-information',
    no: 'A.5',
    rail: <>A.5 &mdash; Sharing Information</>,
    heading: '5. Sharing Information',
    body: (
      <>
        <p>We may share information with trusted service providers who help us operate the website, manage communications, provide hosting, analyse usage, or deliver requested services. We may also share information with professional advisors, in connection with corporate transactions, or where required by law.</p>
      </>
    ),
  },
  {
    id: 'cookies-analytics',
    no: 'A.6',
    rail: <>A.6 &mdash; Cookies &amp; Analytics</>,
    heading: '6. Cookies and Analytics',
    body: (
      <>
        <p>Our website may use cookies or similar technologies to support core site functionality, understand traffic patterns, and improve performance. You can adjust cookie settings through your browser, though some site features may not work as intended if cookies are disabled.</p>
      </>
    ),
  },
  {
    id: 'retention-security',
    no: 'A.7',
    rail: <>A.7 &mdash; Retention &amp; Security</>,
    heading: '7. Data Retention and Security',
    body: (
      <>
        <p>We retain information for as long as reasonably necessary to support the purposes described in this policy, maintain business records, resolve disputes, and meet legal or operational requirements. We use reasonable technical and organisational measures to protect information, but no system can be guaranteed completely secure.</p>
      </>
    ),
  },
  {
    id: 'your-choices',
    no: 'A.8',
    rail: <>A.8 &mdash; Your Choices</>,
    heading: '8. Your Choices',
    body: (
      <>
        <p>You may contact us to request access, correction, deletion, or restriction of personal information, or to opt out of non-essential communications. We will respond to requests in accordance with the Privacy Act 1988 (Cth), the Australian Privacy Principles, other applicable requirements, and our ability to verify the request. If you are not satisfied with our response, you may lodge a complaint with the Office of the Australian Information Commissioner (OAIC).</p>
      </>
    ),
  },
  {
    id: 'international-processing',
    no: 'A.9',
    rail: <>A.9 &mdash; International Processing</>,
    heading: '9. International Processing',
    body: (
      <>
        <p>ArchonX may process information in locations where we or our service providers operate. Where information is transferred across borders, we take reasonable steps to protect it in line with this policy and applicable agreements.</p>
      </>
    ),
  },
  {
    id: 'contact',
    no: 'A.10',
    rail: <>A.10 &mdash; Contact</>,
    heading: '10. Contact',
    body: (
      <>
        <p>For privacy questions or requests, contact us at <a href="mailto:hello@archonx.ai">hello@archonx.ai</a>.</p>
      </>
    ),
  },
]

export default function Privacy() {
  usePageMeta({
    title: 'Privacy Policy - ArchonX.ai',
    description: 'Privacy Policy for ArchonX.ai, including how we collect, use, protect, and manage website, consultation, and service-related information.',
    bodyClass: 'home-editorial subpage-editorial',
  })
  return (
    <>
      {/* ===================== CHAPTER COVER — Appendix A ===================== */}
      <ChapterCover
        no={<>Appendix A / Privacy</>}
        ghost="PRIVACY"
        lines={[<>How ArchonX</>, <>handles data.</>]}
        dek={<>This policy explains what information we collect, how we use it, and how you can contact us about privacy matters.</>}
        aside={
          <>
            <span className="ed-kicker">[ Privacy Policy ]</span>
            <span className="ed-kicker">Last updated &mdash; June 9, 2026</span>
          </>
        }
      />

      {/* ===================== APPENDIX A — THE RECORD ===================== */}
      <Section pole="paper" className="ed-section--protocol">
        <Parallax as="span" className="ed-ghostnum" range={60} aria-hidden="true">A</Parallax>
        <div className="ed-container">
          <SectionHead
            meta={<>Appendix A / Privacy Policy</>}
            bignum="A"
            title="Privacy Policy"
          />
          <div className="edc-doc">
            <nav className="edc-doc-rail reveal-up" aria-label="Privacy Policy contents">
              {CLAUSES.map((clause) => (
                <a key={clause.id} href={`#${clause.id}`} onClick={handleHashClick}>{clause.rail}</a>
              ))}
            </nav>
            <div className="edc-doc-body">
              {CLAUSES.map((clause) => (
                <article className="edc-clause reveal-up" id={clause.id} key={clause.id}>
                  <span className="edc-clause-no">{clause.no}</span>
                  <h2>{clause.heading}</h2>
                  {clause.body}
                </article>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ===================== NEXT CHAPTER — Appendix B ===================== */}
      <NextChapter
        to="/terms"
        label={<>Next &mdash; &#8470; B / 07</>}
        title="Terms of Service"
      />

      <EdFooter />
    </>
  )
}
