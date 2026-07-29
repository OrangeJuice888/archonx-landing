import { useEffect, useRef } from 'react'

// React port of legacy/consultation-orb.js — the pointer-reactive particle
// sphere on the consultation hero. Same point math, frame pacing, and
// reduced-motion handling; lifecycle is tied to the component.
export default function ConsultationOrb() {
  const hostRef = useRef(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', { alpha: true })
    host.appendChild(canvas)

    let size = 0
    let dpr = 1
    let points = []
    let pulseIdxs = []
    let pulseTime = 0
    let frameId = 0
    let lastFrame = 0
    let isVisible = true
    let spin = 0

    const target = { x: -0.18, y: 0.2 }
    const current = { x: -0.18, y: 0.2 }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const frameInterval = 1000 / 24

    const createPoints = () => {
      const count = size < 330 ? 340 : 520
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      points = Array.from({ length: count }, (_, i) => {
        const y = 1 - (i / (count - 1)) * 2
        const radius = Math.sqrt(1 - y * y)
        const theta = goldenAngle * i
        return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius }
      })
      // Six "live signals" spread evenly across the sphere — dots that pulse
      // in turn, reading as enquiries being caught by the system.
      pulseIdxs = Array.from({ length: 6 }, (_, k) => Math.floor((k + 0.5) * (count / 6)))
    }

    const draw = () => {
      const center = size / 2
      const radius = size * 0.36
      const cosX = Math.cos(current.x)
      const sinX = Math.sin(current.x)
      const cosY = Math.cos(spin + current.y)
      const sinY = Math.sin(spin + current.y)

      ctx.clearRect(0, 0, size, size)

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(center, center, radius * 1.04, 0, Math.PI * 2)
      ctx.stroke()

      ctx.beginPath()
      ctx.ellipse(center, center, radius * 1.04, radius * 0.26, 0.08, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'
      ctx.stroke()

      for (const point of points) {
        const y1 = point.y * cosX - point.z * sinX
        const z1 = point.y * sinX + point.z * cosX
        const x2 = point.x * cosY + z1 * sinY
        const z2 = -point.x * sinY + z1 * cosY
        const depth = (z2 + 1) / 2
        const px = center + x2 * radius
        const py = center + y1 * radius
        const dot = 0.65 + depth * 1.05

        ctx.globalAlpha = 0.22 + depth * 0.58
        ctx.fillStyle = 'rgb(226, 232, 240)'
        ctx.fillRect(px, py, dot, dot)
      }

      // Pulse pass: a staggered sine per signal dot; skipped entirely under
      // reduced motion (the static frame shows the plain sphere).
      if (!prefersReducedMotion) {
        for (let k = 0; k < pulseIdxs.length; k++) {
          const point = points[pulseIdxs[k]]
          if (!point) continue
          const strength = Math.max(0, Math.sin(pulseTime * 0.0012 + k * 2.1)) ** 3
          if (strength < 0.05) continue
          const y1 = point.y * cosX - point.z * sinX
          const z1 = point.y * sinX + point.z * cosX
          const x2 = point.x * cosY + z1 * sinY
          const z2 = -point.x * sinY + z1 * cosY
          const depth = (z2 + 1) / 2
          const px = center + x2 * radius
          const py = center + y1 * radius
          ctx.globalAlpha = strength * (0.2 + depth * 0.5)
          ctx.strokeStyle = 'rgba(226, 232, 240, 0.9)'
          ctx.beginPath()
          ctx.arc(px, py, 3 + strength * 8, 0, Math.PI * 2)
          ctx.stroke()
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(px - 1, py - 1, 2.5 + strength * 1.5, 2.5 + strength * 1.5)
        }
      }
      ctx.globalAlpha = 1
    }

    const resize = () => {
      size = Math.max(220, Math.round(host.getBoundingClientRect().width))
      dpr = Math.min(window.devicePixelRatio || 1, 1.25)
      canvas.width = Math.round(size * dpr)
      canvas.height = Math.round(size * dpr)
      canvas.style.width = `${size}px`
      canvas.style.height = `${size}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createPoints()
      draw()
    }

    const setPointerTarget = (clientX, clientY) => {
      const rect = host.getBoundingClientRect()
      const x = ((clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((clientY - rect.top) / rect.height - 0.5) * 2
      target.y = x * 0.42
      target.x = -0.18 + y * 0.28
    }

    const hero = host.closest('.consulting-hero')
    const onPointerMove = (event) => setPointerTarget(event.clientX, event.clientY)
    const onPointerLeave = () => {
      target.x = -0.18
      target.y = 0.2
    }
    hero?.addEventListener('pointermove', onPointerMove, { passive: true })
    hero?.addEventListener('pointerleave', onPointerLeave)

    const tick = (time = 0) => {
      if (time - lastFrame >= frameInterval) {
        lastFrame = time
        pulseTime = time
        current.x += (target.x - current.x) * 0.08
        current.y += (target.y - current.y) * 0.08
        spin += 0.006
        draw()
      }
      if (isVisible) frameId = requestAnimationFrame(tick)
    }

    const start = () => {
      if (prefersReducedMotion || frameId) return
      isVisible = true
      frameId = requestAnimationFrame(tick)
    }
    const stop = () => {
      isVisible = false
      if (frameId) {
        cancelAnimationFrame(frameId)
        frameId = 0
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) start()
        else stop()
      },
      { threshold: 0.05 },
    )
    observer.observe(host)

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)

    resize()
    window.addEventListener('resize', resize, { passive: true })

    if (prefersReducedMotion) draw()
    else start()

    return () => {
      stop()
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      hero?.removeEventListener('pointermove', onPointerMove)
      hero?.removeEventListener('pointerleave', onPointerLeave)
      canvas.remove()
    }
  }, [])

  return <div ref={hostRef} className="consulting-data-orb" data-consulting-orb aria-hidden="true" />
}
