import { useLayoutEffect, useRef } from 'react'
import { chapterMotion } from '../scene/chapterMotion'

const chapters = [
  { id: 'top', color: '#071426', ink: 'light', x: .76, y: .68 },
  { id: 'work', color: '#D4E6FF', ink: 'dark', x: .97, y: .18 },
  { id: 'research', color: '#002060', ink: 'light', x: .2, y: .7 },
  { id: 'practice', color: '#F25767', ink: 'dark', x: .77, y: .65 },
  { id: 'human', color: '#071426', ink: 'light', x: .24, y: .73 },
  { id: 'connection', color: '#D4E6FF', ink: 'dark', x: .79, y: .68 },
] as const

export function ChapterColors() {
  const layer = useRef<HTMLDivElement>(null)
  const bloom = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const background = layer.current!
    const circle = bloom.current!
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    const root = document.documentElement
    let frame = 0
    let width = innerWidth
    let height = innerHeight
    let stops: number[] = []
    const scenes: { element: HTMLElement; index: number }[] = []
    let inkTargets: HTMLElement[] = []
    let sceneIndex = 0
    for (const child of document.getElementById('main')?.children ?? []) {
      const match = chapters.findIndex((chapter) => chapter.id === child.id)
      if (match >= 0) sceneIndex = match
      if (child instanceof HTMLElement) scenes.push({ element: child, index: sceneIndex })
    }

    function measure() {
      width = innerWidth
      height = innerHeight
      stops = chapters.map(({ id }, index) => index ? (document.getElementById(id)?.getBoundingClientRect().top ?? 0) + scrollY : 0)
      const last = stops.length - 1
      stops[last] = Math.min(stops[last], document.documentElement.scrollHeight - height + height * .12 - 1)
      inkTargets = Array.from(document.querySelectorAll<HTMLElement>('.hero-statement > :is(h1,p), .hero-index a, .hero-footer > *, .section-head > :is(h2,p), .project-index a, .essay-head > p, .essay-copy > :is(h2,p,a), .essay-copy details > :is(summary,p), .connection-inner > :is(h2,p), .dis-heading h2, .dis-heading p, .cap-heading h2, .cap-heading p, .growth-heading h3, .growth-heading p, .site-footer > *, .dis-reset, .readout, #signal-help, .instrument-controls .pause'))
      for (const target of inkTargets) target.classList.add('chapter-ink')
      schedule()
    }

    function draw() {
      frame = 0
      if (!root.classList.contains('archive-home')) return
      let index = 0
      while (index + 1 < chapters.length && stops[index + 1] - scrollY <= height * .12) index++
      const current = chapters[index]
      const upcoming = chapters[Math.min(index + 1, chapters.length - 1)]
      const boundary = stops[index + 1] ?? Infinity
      const fraction = Math.max(0, Math.min(1, (height * .96 - (boundary - scrollY)) / (height * .84)))
      const progress = preference.matches ? 0 : fraction * fraction * (3 - 2 * fraction)
      root.dataset.chapterInk = fraction > .5 && !preference.matches ? upcoming.ink : current.ink
      root.style.setProperty('--chapter-header-bg', fraction > .5 && !preference.matches ? upcoming.color : current.color)
      // Keep both chapters readable throughout the wipe. Scroll position is the
      // sole clock, so reversing direction retraces the same state.
      for (const scene of scenes) {
        const drift = preference.matches ? 0 : scene.index === index ? -10 * progress : scene.index === index + 1 ? 14 * (1 - progress) : 0
        scene.element.style.setProperty('--scene-drift', `${drift}px`)
      }
      background.style.backgroundColor = current.color
      root.style.setProperty('--chapter-base', current.color)
      circle.style.backgroundColor = upcoming.color
      circle.style.left = `${upcoming.x * 100}%`
      circle.style.top = `${upcoming.y * 100}%`
      const cover = Math.hypot(Math.max(upcoming.x, 1 - upcoming.x) * width, Math.max(upcoming.y, 1 - upcoming.y) * height) + 2
      const radius = preference.matches || index === chapters.length - 1 ? 0 : 8 + (cover - 8) * progress
      const ink = (light: boolean) => light ? '#f5f5f2' : '#071426'
      // Read rectangles together, before writing local masks; no React renders.
      const boxes = inkTargets.map(element => element.getBoundingClientRect())
      inkTargets.forEach((element, i) => {
        const box = boxes[i]
        if (box.bottom < -80 || box.top > height + 80) return
        const x = upcoming.x * width - box.left
        const y = upcoming.y * height - box.top
        const before = ink(current.ink === 'light')
        const after = ink(upcoming.ink === 'light')
        element.style.setProperty('--ink-wipe', preference.matches || !radius
          ? `linear-gradient(${before},${before})`
          : `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${after} calc(100% - .5px), ${before} calc(100% + .5px))`)
      })
      chapterMotion.circleX = upcoming.x * width
      chapterMotion.circleY = upcoming.y * height
      chapterMotion.radius = index === 0 ? radius : 0
      const signalLight = index === 0 ? progress : current.ink === 'dark' ? 1 : 0
      root.style.setProperty('--signal-wipe', String(signalLight))
      circle.style.width = `${cover * 2}px`
      circle.style.height = `${cover * 2}px`
      circle.style.transform = `translate(-50%, -50%) scale(${radius / cover})`
      background.dataset.chapter = current.id
      background.dataset.progress = fraction.toFixed(3)
    }
    function schedule() { if (!frame) frame = requestAnimationFrame(draw) }
    function restore() { measure(); cancelAnimationFrame(frame); draw() }
    addEventListener('archive:restore', restore)
    const resize = new ResizeObserver(measure)
    const main = document.getElementById('main')
    if (main) resize.observe(main)
    addEventListener('scroll', schedule, { passive: true })
    addEventListener('resize', measure)
    preference.addEventListener('change', schedule)
    measure()
    draw()
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      removeEventListener('archive:restore', restore)
      removeEventListener('scroll', schedule)
      removeEventListener('resize', measure)
      preference.removeEventListener('change', schedule)
      delete root.dataset.chapterInk
      root.style.removeProperty('--chapter-header-bg')
      root.style.removeProperty('--chapter-base')
      for (const { element } of scenes) element.style.removeProperty('--scene-drift')
      for (const target of inkTargets) {
        target.classList.remove('chapter-ink')
        target.style.removeProperty('--ink-wipe')
      }
      root.style.removeProperty('--signal-wipe')
      chapterMotion.radius = 0
    }
  }, [])
  return (
    <div ref={layer} className="chapter-colors" aria-hidden="true">
      <span ref={bloom} className="chapter-bloom" />
      <div className="chapter-seeds"><i /><i /><i /><i /></div>
    </div>
  )
}
