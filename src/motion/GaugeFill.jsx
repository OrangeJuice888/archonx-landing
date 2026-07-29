import { useRef } from 'react'
import { useInView } from 'framer-motion'

// Fills .ed-gauge-fill to its percentage once 50% visible; the width
// transition itself lives in the legacy CSS, exactly as before.
export default function GaugeFill({ percent, className = 'ed-gauge-fill' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  return (
    <div
      ref={ref}
      className={className}
      data-percent={percent}
      style={{ width: inView ? `${percent}%` : undefined }}
    />
  )
}
