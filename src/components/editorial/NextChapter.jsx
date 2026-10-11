import { Link } from 'react-router-dom'

// The closing ink band that chains one chapter to the next, so the subpages
// read as a sequence rather than a set of dead ends. The whole band is the
// link target; the title and arrow slide on hover.
// `label` is still accepted but not rendered; the band always reads "Next".
export default function NextChapter({ to, label, title }) { // eslint-disable-line no-unused-vars
  return (
    <section className="ed-section ed-section--ink" data-nav="ink">
      <div className="ed-container">
        <Link to={to} className="edc-next reveal-up">
          <span>
            <span className="edc-next-label">Next</span>
            <span className="edc-next-title">{title}</span>
          </span>
          <span className="edc-next-go">&rarr;</span>
        </Link>
      </div>
    </section>
  )
}
