import { useRef } from 'react'
import { useScroll, useTransform } from 'framer-motion'
import { motionTag } from './motionTag.js'

// Scroll-linked parallax drift. Renders the element itself (span/img/div via
// `as`) with a translateY driven by its position in the viewport. Used for
// ghost numerals, background plates, and hero media.
export default function Parallax({ as = 'div', className, children, range = 60, style, ...rest }) {
  const Comp = motionTag(as)
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [range, -range])

  return (
    <Comp ref={ref} className={className} style={{ y, ...style }} {...rest}>
      {children}
    </Comp>
  )
}
