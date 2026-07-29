const RUNNING_TITLE = 'ArchonX — Field Manual'

// The section-opening ritual every editorial chapter repeats: a hairline rule
// that draws in on reveal, a meta row (issue label + running title), and an
// optional oversized numeral beside the section title.
//
// Two shapes exist in the design system:
//   full   — rule + meta + numeral/title block
//   meta   — rule + meta only, used when the numeral and title live inside a
//            sticky .edc-spread-rail instead (About 02.1/02.2, Protocol)
// Omitting `title` and `bignum` selects the meta shape.
export default function SectionHead({
  no,
  label,
  title,
  bignum,
  dek,
  meta,
  running = RUNNING_TITLE,
  fat = false,
  children,
}) {
  const hasTitleBlock = Boolean(title || bignum || dek)
  return (
    <header className={fat ? 'ed-sechead ed-sechead--fat' : 'ed-sechead'}>
      <span className={fat ? 'ed-rule ed-rule--fat' : 'ed-rule'}></span>
      <div className="ed-sechead-meta">
        <span>{meta ?? `№ ${no} / ${label}`}</span>
        {running ? <span className="ed-running">{running}</span> : null}
      </div>
      {hasTitleBlock ? (
        <div className="ed-sechead-title reveal-up">
          {bignum ? <span className="ed-bignum">{bignum}</span> : null}
          {title ? <h2 className="ed-title">{title}</h2> : null}
          {dek ? <p className="ed-dek">{dek}</p> : null}
        </div>
      ) : null}
      {children}
    </header>
  )
}
