import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// On route change: jump to top (new page) or smooth-scroll to the hash
// target with the legacy 60px navbar offset (e.g. /markets#market-retail).
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }
    // The outgoing page keeps its DOM until AnimatePresence's exit finishes
    // (~220ms) and may contain an element with the same id, so measure only
    // after the incoming page has mounted. A second pass corrects for layout
    // shifts from late-loading fonts/images.
    const jump = () => {
      const target = document.querySelector(hash)
      if (!target) return false
      window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 60)
      return true
    }
    const t1 = setTimeout(jump, 450)
    const t2 = setTimeout(jump, 1200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [pathname, hash])

  return null
}
