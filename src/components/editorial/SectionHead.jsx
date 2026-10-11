// The section opener every editorial chapter repeats: a hairline rule that
// draws in on reveal, a small label, then the section title and dek.
// `no`, `bignum` and `running` are still accepted so pages need no change,
// but are no longer rendered: issue numbers and running heads read as template.
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
  running, // eslint-disable-line no-unused-vars
  fat = false,
  children,
}) {
  const hasTitleBlock = Boolean(title || dek)
  return (
    <header className={fat ? 'ed-sechead ed-sechead--fat' : 'ed-sechead'}>
      <span className={fat ? 'ed-rule ed-rule--fat' : 'ed-rule'}></span>
      <div className="ed-sechead-meta">
        <span>{meta ?? label}</span>
      </div>
      {hasTitleBlock ? (
        <div className="ed-sechead-title reveal-up">
          {title ? <h2 className="ed-title">{title}</h2> : null}
          {dek ? <p className="ed-dek">{dek}</p> : null}
        </div>
      ) : null}
      {children}
    </header>
  )
}
