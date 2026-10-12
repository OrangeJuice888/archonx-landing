import { Parallax } from '../../motion/index.js'

// The ink chapter cover that opens every subpage: an
// outline ghost word drifting on scroll, the headline whose lines slide up on
// load, and a dek paired with small right-aligned meta tags.
//
// `lines` are the headline rows (nodes, so a line may contain <span className="ed-ghost">).
// `aside` holds the small bracket tag(s) — keep it to one or two items; the
// cover is a title page, not a content block.
// `no` is still accepted so existing pages need no change, but is not rendered.
// `plate` is an optional background artwork URL (monochrome line-art SVG)
// rendered full-bleed behind the cover, parallax-shifted like the ghostword.
export default function ChapterCover({
  no, // eslint-disable-line no-unused-vars
  ghost, // eslint-disable-line no-unused-vars
  lines,
  dek,
  aside, // eslint-disable-line no-unused-vars
  plate,
  children,
}) {
  return (
    <section className="edc-cover" data-nav="ink">
      {plate && (
        <Parallax as="img" src={plate} alt="" className="edc-cover-plate" range={30} aria-hidden="true" />
      )}
      <div className="ed-container">
        <h1 className="edc-cover-title">
          {lines.map((line, i) => (
            <span className="ed-line" key={i}>
              <span className="ed-line-inner">{line}</span>
            </span>
          ))}
        </h1>
        <div className="edc-cover-sub">
          <p className="edc-cover-dek">{dek}</p>
        </div>
        <span className="edc-cover-rule"></span>
        {children}
      </div>
    </section>
  )
}
