// The alternating ink/paper band every chapter is built from. `pole` sets both
// the modifier class and the data-nav attribute the navbar probes when it
// re-themes itself mid-scroll, so the two can never drift apart.
export default function Section({ pole = 'paper', id, className, children, ...rest }) {
  const classes = ['ed-section', `ed-section--${pole}`, className].filter(Boolean).join(' ')
  return (
    <section className={classes} id={id} data-nav={pole} {...rest}>
      {children}
    </section>
  )
}
