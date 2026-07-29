import { Parallax } from '../../motion/index.js'

// The ink chapter cover that opens every subpage: masthead rules, an
// outline ghost word drifting on scroll, the headline whose lines slide up on
// load, and a dek paired with small right-aligned meta tags.
//
// `lines` are the headline rows (nodes, so a line may contain <span className="ed-ghost">).
// `aside` holds the small bracket tag(s) — keep it to one or two items; the
// cover is a masthead, not a content block.
// `plate` is an optional background artwork URL (monochrome line-art SVG)
// rendered full-bleed behind the cover, parallax-shifted like the ghostword.
export default function ChapterCover({
  no,
  ghost,
  lines,
  dek,
  aside,
  ghostRange = 50,
  plate,
  children,
}) {
  return (
    <section className="edc-cover" data-nav="ink">
      {plate && (
        <Parallax as="img" src={plate} alt="" className="edc-cover-plate" range={30} aria-hidden="true" />
      )}
      <Parallax as="span" className="edc-ghostword" range={ghostRange} aria-hidden="true">
        {ghost}
      </Parallax>
      <div className="ed-container">
        <div className="edc-masthead">
          <span className="ed-masthead-cell">ArchonX &mdash; Field Manual</span>
          <span className="ed-masthead-cell edc-masthead-no">{no}</span>
          <span className="ed-masthead-cell edc-masthead-vol">Australia &mdash; Vol. 01 &mdash; 2026</span>
        </div>
        <h1 className="edc-cover-title">
          {lines.map((line, i) => (
            <span className="ed-line" key={i}>
              <span className="ed-line-inner">{line}</span>
            </span>
          ))}
        </h1>
        <div className="edc-cover-sub">
          <p className="edc-cover-dek">{dek}</p>
          <div className="edc-cover-aside">{aside}</div>
        </div>
        <span className="edc-cover-rule"></span>
        {children}
      </div>
    </section>
  )
}
