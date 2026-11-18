import { useEffect, useRef } from 'react'
import { followTrace, readTrace, traceAllowed } from './pointerTrace'

type FieldLineProps = {
  tone?: 'coral' | 'ice' | 'rule'
  pull?: number
  reveal?: 'load' | 'view'
  className?: string
}
const straight = 'M0 60 L1000 60'

function rope(reach: number, lift: number) {
  if (Math.abs(lift) < .02) return straight
  let d = ''
  for (let index = 0; index <= 48; index++) {
    const u = index / 48
    const displacement = lift * Math.sin(Math.PI * u) * Math.exp(-Math.pow((u - reach) / .24, 2))
    d += `${index ? 'L' : 'M'}${(u * 1000).toFixed(2)} ${(60 + displacement).toFixed(2)}`
  }
  return d
}

export function FieldLine({ tone = 'rule', pull = 18, reveal = 'view', className = '' }: FieldLineProps) {
  const svg = useRef<SVGSVGElement>(null)
  const path = useRef<SVGPathElement>(null)

  useEffect(() => {
    const element = svg.current
    const line = path.current
    if (!element || !line || !pull) return
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let last = 0
    let reach = .5
    let lift = 0
    let velocity = 0
    let target = 0

    function tick(now: number) {
      frame = 0
      const dt = Math.min(.032, (now - last) / 1000)
      last = now
      for (let step = 0; step < 4; step++) {
        const h = dt / 4
        velocity += ((target - lift) * 210 - velocity * 13) * h
        lift += velocity * h
      }
      const settled = Math.abs(lift - target) < .025 && Math.abs(velocity) < .06
      if (settled) { lift = target; velocity = 0 }
      line!.setAttribute('d', rope(reach, lift))
      if (!settled) frame = requestAnimationFrame(tick)
    }

    function sample() {
      if (!traceAllowed()) {
        cancelAnimationFrame(frame)
        frame = 0
        lift = velocity = target = 0
        line!.setAttribute('d', straight)
        return
      }
      const trace = readTrace()
      const box = element!.getBoundingClientRect()
      if (!box.width || !box.height) return
      const x = (trace.clientX - box.left) / box.width
      const distance = trace.clientY - box.top - box.height / 2
      const near = trace.inside && x > 0 && x < 1 && Math.abs(distance) < 52
        && box.bottom > 0 && box.top < innerHeight
      if (near) reach = Math.min(.95, Math.max(.05, x))
      target = near ? Math.max(-pull, Math.min(pull, distance * .8)) * 120 / box.height : 0
      if (!frame && (Math.abs(target - lift) > .02 || Math.abs(velocity) > .06)) {
        last = performance.now()
        frame = requestAnimationFrame(tick)
      }
    }

    const stop = followTrace(sample)
    preference.addEventListener('change', sample)
    return () => {
      stop()
      preference.removeEventListener('change', sample)
      cancelAnimationFrame(frame)
      line.setAttribute('d', straight)
    }
  }, [pull])

  useEffect(() => {
    const element = svg.current
    if (!element) return
    if (reveal === 'load') {
      element.dataset.drawn = 'true'
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      element.dataset.drawn = 'true'
      observer.disconnect()
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [reveal])

  return (
    <svg ref={svg} className={`field-line field-line--${tone} ${className}`.trim()}
      viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path ref={path} d={straight} fill="none" stroke="currentColor" strokeWidth={1}
        pathLength={1} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function ScrollTrace() {
  useEffect(() => {
    let frame = 0
    function read() {
      frame = 0
      const travel = document.documentElement.scrollHeight - innerHeight
      document.documentElement.style.setProperty('--scroll', (travel > 0 ? Math.min(1, scrollY / travel) : 0).toFixed(4))
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(read) }
    read()
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', schedule)
    }
  }, [])
  return null
}
