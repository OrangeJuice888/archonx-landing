import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'

// Count-up number matching the legacy counter: 1600ms, cubic ease-out,
// fires once at 50% visibility. Renders a bare <span> so surrounding
// markup (sup/sym spans) is untouched.
export default function AnimatedCounter({ target, decimals = 0, className = 'counter', duration = 1600 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })

  useEffect(() => {
    if (!inView || !ref.current) return
    const el = ref.current
    let frameId
    const startTime = performance.now()
    const update = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      el.textContent = (eased * target).toFixed(decimals)
      if (progress < 1) {
        frameId = requestAnimationFrame(update)
      } else {
        el.textContent = Number(target).toFixed(decimals)
      }
    }
    frameId = requestAnimationFrame(update)
    return () => cancelAnimationFrame(frameId)
  }, [inView, target, decimals, duration])

  // data-* mirrors the legacy markup and lets tooling read the settled value
  // without waiting on the animation.
  return (
    <span ref={ref} className={className} data-target={target} data-decimals={decimals}>
      0
    </span>
  )
}
