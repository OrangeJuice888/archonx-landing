import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ED_EASE } from './presets.js'

// Route-level transition wrapper. Also drives the legacy CSS reveal system:
// any .reveal-up / .reveal-left / .reveal-right / .ed-rule inside the page
// gets .revealed added when it enters the viewport — identical thresholds to
// the original script.js, so all existing CSS reveal/stagger rules fire.
export default function PageTransition({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
    )
    root
      .querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .ed-rule')
      .forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.22, ease: 'easeIn' } }}
      transition={{ duration: 0.45, ease: ED_EASE }}
    >
      {children}
    </motion.div>
  )
}
