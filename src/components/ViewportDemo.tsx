import { readHomeState, rememberDemo } from '../homeState'
import { Suspense, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

function AnchorContent({ anchor, children }: { anchor: string; children: ReactNode }) {
  useLayoutEffect(() => {
    const target = document.getElementById(anchor)
    if (target) target.dataset.demoReady = 'true'
    if (!target || location.hash !== `#${anchor}`) return
    // The first fragment scroll used the reserved height. Align after the actual
    // chapter content and fonts are in place, unless the visitor left the area.
    let current = true
    function align() {
      if (!document.documentElement.classList.contains('archive-home') || !target?.getClientRects().length || !current || location.hash !== `#${anchor}`) return
      if (Math.abs(target.getBoundingClientRect().top) < innerHeight / 2) {
        target.scrollIntoView({ behavior: 'instant' })
      }
    }
    align()
    void document.fonts.ready.then(align)
    return () => { current = false }
  }, [anchor])
  return children
}

export function ViewportDemo({ children, anchor, label }: { children: ReactNode; anchor: string; label: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(() => readHomeState()?.demos.includes(anchor) || false)
  const placeholder = <p className="demo-placeholder mono">{label}</p>

  useEffect(() => {
    if (visible) rememberDemo(anchor)
    const element = host.current
    if (!element || visible) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        setVisible(true)
      }
    }, { rootMargin: '300px 0px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [visible, anchor])

  return (
    <div ref={host}>
      {visible ? (
        <Suspense fallback={placeholder}>
          <AnchorContent anchor={anchor}>{children}</AnchorContent>
        </Suspense>
      ) : placeholder}
    </div>
  )
}
