import { useEffect, useRef } from 'react'

// Dotted globe with travelling arcs, ported from the ArchonX Consulting page
// (PalantirX `initGlobe`). Drawn on a canvas that fills its parent box, so
// size and place it with CSS. It pauses while off screen and draws a single
// still frame when the visitor prefers reduced motion.
const N = 800 // points on the sphere
const HUBS = 12 // brighter nodes
const ARCS = 4 // concurrent arcs
const FOV = 2.6

export default function GlobeBackdrop({ className, radius = 0.44 }) {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv && cv.getContext('2d')
    if (!ctx) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const pts = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(Math.max(0, 1 - y * y))
      const th = golden * i
      pts.push({ x: Math.cos(th) * r, y, z: Math.sin(th) * r })
    }
    const hubIdx = []
    for (let i = 0; i < HUBS; i++) hubIdx.push(Math.floor((i + 0.5) * (N / HUBS)))
    const newArc = (delay) => ({
      a: hubIdx[Math.floor(Math.random() * HUBS)],
      b: hubIdx[Math.floor(Math.random() * HUBS)],
      t: -delay,
    })
    const arcs = []
    for (let i = 0; i < ARCS; i++) arcs.push(newArc(Math.random() * 1.6))

    let w = 0
    let h = 0
    let cx = 0
    let cy = 0
    let R = 0
    let yaw = 0.4
    let tilt = -0.32
    let tiltTarget = -0.32
    let yawDrift = 0
    let yawDriftTarget = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = cv.clientWidth
      h = cv.clientHeight
      cv.width = Math.floor(w * dpr)
      cv.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cx = w * 0.5
      cy = h * 0.5
      R = Math.min(w, h) * radius
    }

    const project = (p, sinY, cosY, sinT, cosT) => {
      const x1 = p.x * cosY - p.z * sinY
      const z1 = p.x * sinY + p.z * cosY
      const y2 = p.y * cosT - z1 * sinT
      const z2 = p.y * sinT + z1 * cosT
      const s = FOV / (FOV - z2)
      return { sx: cx + x1 * R * s, sy: cy + y2 * R * s, depth: z2 }
    }

    const arcPoint = (A, B, t) => {
      const lift = 1 + 0.2 * Math.sin(Math.PI * t)
      const x = A.x + (B.x - A.x) * t
      const y = A.y + (B.y - A.y) * t
      const z = A.z + (B.z - A.z) * t
      const m = Math.sqrt(x * x + y * y + z * z) || 1
      return { x: (x / m) * lift, y: (y / m) * lift, z: (z / m) * lift }
    }

    const draw = (yawNow) => {
      ctx.clearRect(0, 0, w, h)
      const sinY = Math.sin(yawNow)
      const cosY = Math.cos(yawNow)
      const sinT = Math.sin(tilt)
      const cosT = Math.cos(tilt)

      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.09)'
      ctx.lineWidth = 1
      ctx.stroke()

      for (let i = 0; i < N; i++) {
        const pr = project(pts[i], sinY, cosY, sinT, cosT)
        const near = pr.depth * 0.5 + 0.5
        const alpha = 0.1 + 0.5 * near * near
        const size = 0.7 + 1.4 * near
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`
        ctx.fillRect(pr.sx - size / 2, pr.sy - size / 2, size, size)
      }

      for (let i = 0; i < HUBS; i++) {
        const pr = project(pts[hubIdx[i]], sinY, cosY, sinT, cosT)
        if (pr.depth < -0.1) continue
        const near = pr.depth * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(pr.sx, pr.sy, 1.3 + near * 1.1, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${(0.4 + 0.45 * near).toFixed(3)})`
        ctx.fill()
      }

      for (const arc of arcs) {
        if (arc.t < 0 || arc.a === arc.b) continue
        const prog = Math.min(arc.t, 1)
        const fade = Math.sin(Math.PI * Math.min(arc.t / 1.15, 1))
        const A = pts[arc.a]
        const B = pts[arc.b]
        const steps = 36
        const upto = Math.max(2, Math.floor(steps * prog))
        ctx.beginPath()
        let head = null
        for (let s = 0; s <= upto; s++) {
          const pr = project(arcPoint(A, B, s / steps), sinY, cosY, sinT, cosT)
          if (s === 0) ctx.moveTo(pr.sx, pr.sy)
          else ctx.lineTo(pr.sx, pr.sy)
          head = pr
        }
        ctx.strokeStyle = `rgba(255,255,255,${(0.26 * fade).toFixed(3)})`
        ctx.lineWidth = 1
        ctx.stroke()
        if (head && prog < 1) {
          ctx.beginPath()
          ctx.arc(head.sx, head.sy, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,255,255,${(0.8 * fade).toFixed(3)})`
          ctx.fill()
        }
      }
    }

    let raf = 0
    let last = 0
    const loop = (now) => {
      const dt = Math.min(now - (last || now), 50)
      last = now
      yaw += 0.00000105 * dt * 60 // one revolution ≈ 100 s
      yawDrift += (yawDriftTarget - yawDrift) * 0.04
      tilt += (tiltTarget - tilt) * 0.04
      for (const arc of arcs) {
        arc.t += 0.003 * (dt / 16.7)
        if (arc.t > 1.6) Object.assign(arc, newArc(Math.random() * 1.4))
      }
      draw(yaw + yawDrift)
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf || reduced) return
      last = 0
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onMove = (e) => {
      yawDriftTarget = (e.clientX / window.innerWidth - 0.5) * 0.16
      tiltTarget = -0.32 + (e.clientY / window.innerHeight - 0.5) * 0.1
    }

    resize()
    draw(yaw)
    const ro = new ResizeObserver(() => {
      resize()
      draw(yaw + yawDrift)
    })
    ro.observe(cv)
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()))
    io.observe(cv)
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [radius])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
