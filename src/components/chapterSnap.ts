const finePointer = '(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
const landmarks = '#work, #research, #practice, #human, #connection'

export function attachChapterSnap() {
  if (!('onscrollend' in document)) return

  const preference = matchMedia(finePointer)
  let direction = 0
  let latestWheel = -Infinity

  function rememberWheel(event: WheelEvent) {
    if (event.ctrlKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
    if (event.target instanceof Element && event.target.closest('dialog[open]')) return
    direction = Math.sign(event.deltaY)
    latestWheel = performance.now()
  }

  function settle() {
    const toward = direction
    direction = 0
    if (!toward || !preference.matches || performance.now() - latestWheel > 900) return

    let nearest = 0
    let distance = Math.min(56, innerHeight * .075)
    for (const section of document.querySelectorAll(landmarks)) {
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0
      const offset = section.getBoundingClientRect().top - margin
      if (Math.sign(offset) === toward && Math.abs(offset) > 2 && Math.abs(offset) < distance) {
        distance = Math.abs(offset)
        nearest = offset
      }
    }
    if (nearest) window.scrollBy({ top: nearest, behavior: 'smooth' })
  }

  window.addEventListener('wheel', rememberWheel, { passive: true })
  document.addEventListener('scrollend', settle)
  return () => {
    window.removeEventListener('wheel', rememberWheel)
    document.removeEventListener('scrollend', settle)
  }
}
