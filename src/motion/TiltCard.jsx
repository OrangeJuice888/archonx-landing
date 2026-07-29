import { useRef } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import { motionTag } from './motionTag.js'

// Subtle 3D tilt on hover for cards. Renders the card element itself
// (article/div/a/etc. via `as`) so all legacy CSS selectors still match.
// At rest the card is visually identical to the static site.
export default function TiltCard({ as = 'div', className, children, max = 5, style, ...rest }) {
  const Comp = motionTag(as)
  const ref = useRef(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 220, damping: 20 })
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 220, damping: 20 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }
  const handleLeave = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <Comp
      ref={ref}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformPerspective: 900, ...style }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
