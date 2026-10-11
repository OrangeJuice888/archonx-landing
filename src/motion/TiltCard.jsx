import { motionTag } from './motionTag.js'

// Card wrapper. It used to tilt in 3D on hover; that effect read as template,
// so it now renders the card element (article/div/a via `as`) without motion.
// `max` is still accepted so callers need no change.
export default function TiltCard({ as = 'div', className, children, max, style, ...rest }) { // eslint-disable-line no-unused-vars
  const Comp = motionTag(as)
  return (
    <Comp className={className} style={style} {...rest}>
      {children}
    </Comp>
  )
}
