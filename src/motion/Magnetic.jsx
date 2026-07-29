import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Link } from 'react-router-dom'

const MotionLink = motion.create(Link)

// Magnetic hover: the element eases toward the cursor and springs back on
// leave. Renders the anchor itself (motion.a, or motion(Link) when `to` is
// given) so no wrapper disturbs the layout. Design at rest is unchanged.
export default function Magnetic({
  to,
  href,
  className,
  children,
  strength = 0.3,
  onClick,
  ...rest
}) {
  const ref = useRef(null)
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 })
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 })

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  const motionProps = {
    ref,
    className,
    style: { x, y },
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    whileTap: { scale: 0.97 },
    onClick,
    ...rest,
  }

  if (to) {
    return (
      <MotionLink to={to} {...motionProps}>
        {children}
      </MotionLink>
    )
  }
  return (
    <motion.a href={href} {...motionProps}>
      {children}
    </motion.a>
  )
}
