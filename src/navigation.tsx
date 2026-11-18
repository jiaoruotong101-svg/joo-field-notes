import { captureHomeState, homeRestoreY, homeStateReady, readHomeState, waitForHomeState } from './homeState'
import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Home, ProjectPage } from './pages'
import { projects } from './content/projects'

type Entry = { path: string; key: string }
let entrySequence = 0
// LAN previews on a phone may run outside a secure context.
const newKey = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : "archive-" + Date.now() + '-' + ++entrySequence
const entry = (): Entry => ({ path: location.pathname.replace(/\/$/, ''), key: history.state?.archiveKey || newKey() })

export function ArchiveRouter() {
  const [route, setRoute] = useState(entry)
  const [homeVisited, setHomeVisited] = useState(() => !route.path || !!readHomeState()?.entryKey)
  const current = useRef(route)
  const positions = useRef(new Map<string, number>(readHomeState()?.entryKey ? [[readHomeState()!.entryKey, readHomeState()!.y]] : []))
  const home = useRef<{ y: number; href: string; focus: HTMLElement | null } | null>(readHomeState()?.entryKey ? { y: readHomeState()!.y, href: readHomeState()!.href, focus: null } : null)

  useEffect(() => {
    document.title = current.current.path ? (projects.find(p => current.current.path === '/projects/' + p.slug)?.name || 'Page not found') + ' / JOO FIELD NOTES' : 'JOO / FIELD NOTES'
    const oldRestoration = history.scrollRestoration
    history.scrollRestoration = 'manual'
    history.replaceState({ ...history.state, archiveKey: current.current.key }, '')
    let transition: ViewTransition | undefined
    let veil: HTMLElement | undefined
    let disposed = false
    let navigationVersion = 0

    function save() {
      positions.current.set(current.current.key, scrollY)
      if (!current.current.path) {
        const snapshot = captureHomeState(current.current.key)
        home.current = { y: snapshot.y, href: snapshot.href, focus: document.activeElement instanceof HTMLElement ? document.activeElement : null }
      }
    }

    async function go(url: URL, pop = false, point = { x: innerWidth * .8, y: innerHeight * .7 }, restoreHome = false) {
      const path = url.pathname.replace(/\/$/, '')
      const version = ++navigationVersion
      const outgoing = current.current
      if (!pop) save()
      const next = { path, key: pop ? history.state?.archiveKey || newKey() : newKey() }
      const snapshot = !path && restoreHome ? readHomeState() : null
      const y = pop ? positions.current.get(next.key) ?? snapshot?.y : restoreHome ? home.current?.y : undefined
      // Async chunks and fonts must finish while the outgoing detail remains
      // visible; rAF cannot be awaited inside a View Transition update callback.
      if (snapshot && !homeStateReady(snapshot)) await waitForHomeState(snapshot)
      if (disposed || version !== navigationVersion) return
      if (!pop) history.pushState({ archiveKey: next.key }, '', url)
      const root = document.documentElement
      root.style.setProperty('--route-x', point.x + 'px')
      root.style.setProperty('--route-y', point.y + 'px')
      root.style.setProperty('--route-radius', (Math.hypot(Math.max(point.x, innerWidth - point.x), Math.max(point.y, innerHeight - point.y)) + 2) + 'px')
      transition?.skipTransition()
      veil?.remove()
      function apply() {
        if (disposed) return
        document.querySelectorAll('video').forEach(video => video.pause())
        root.classList.toggle('archive-home', !path)
        document.title = path ? (projects.find(p => path === '/projects/' + p.slug)?.name || 'Page not found') + ' / JOO FIELD NOTES' : 'JOO / FIELD NOTES'
        flushSync(() => {
          if (!path) setHomeVisited(true)
          setRoute(next)
        })
        current.current = next
        if (snapshot) scrollTo({ top: homeRestoreY(snapshot), behavior: 'instant' })
        else if (y !== undefined) scrollTo({ top: y, behavior: 'instant' })
        else if (url.hash) document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView({ behavior: 'instant' })
        else scrollTo({ top: 0, behavior: 'instant' })
        // Re-measure the persistent home after display:none, before the snapshot.
        dispatchEvent(new Event('resize'))
        dispatchEvent(new Event('archive:restore'))
        const scope = document.getElementById(snapshot?.anchorId || 'main')
        const savedLink = snapshot?.focusHref ? Array.from(scope?.querySelectorAll<HTMLAnchorElement>('a[href]') || []).find(link => link.getAttribute('href') === snapshot.focusHref) : null
        const focus = !path && restoreHome ? savedLink || home.current?.focus || document.getElementById('main') : document.getElementById(path ? 'project' : url.hash.slice(1) || 'main')
        focus?.focus({ preventScroll: true })
      }
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced || outgoing.path === path) apply()
      else if (document.startViewTransition) {
        transition = document.startViewTransition(apply)
        const active = transition
        void active.ready.catch(() => {})
        void active.updateCallbackDone.catch(() => {})
        void active.finished.catch(() => {}).finally(() => { if (transition === active) transition = undefined })
      } else {
        // Same visual language on browsers without the View Transition API.
        const cover = document.createElement('div')
        cover.className = 'route-veil'
        cover.style.setProperty('--route-x', point.x + 'px')
        cover.style.setProperty('--route-y', point.y + 'px')
        document.body.append(cover)
        veil = cover
        await cover.animate([{ clipPath: 'circle(0px at var(--route-x) var(--route-y))' }, { clipPath: 'circle(150vmax at var(--route-x) var(--route-y))' }], { duration: 220, fill: 'forwards', easing: 'ease-in' }).finished.catch(() => {})
        if (disposed || veil !== cover) return
        apply()
        await cover.animate([{ clipPath: 'circle(150vmax at var(--route-x) var(--route-y))' }, { clipPath: 'circle(0px at var(--route-x) var(--route-y))' }], { duration: 330, fill: 'forwards', easing: 'ease-out' }).finished.catch(() => {})
        cover.remove()
        if (veil === cover) veil = undefined
      }
    }
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element)?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.hasAttribute('download') || anchor.target && anchor.target !== '_self') return
      let url = new URL(anchor.href)
      if (url.origin !== location.origin || !(url.pathname === '/' || url.pathname.startsWith('/projects/'))) return
      if (url.pathname.replace(/\/$/, '') === current.current.path) return
      event.preventDefault()
      const restore = anchor.hasAttribute('data-return-home') && !!home.current
      if (restore) url = new URL(home.current!.href, location.origin)
      const box = anchor.getBoundingClientRect()
      const point = event.detail ? { x: event.clientX, y: event.clientY } : { x: box.left + box.width / 2, y: box.top + box.height / 2 }
      void go(url, false, point, restore)
    }
    function pop() {
      positions.current.set(current.current.key, scrollY)
      void go(new URL(location.href), true, undefined, !location.pathname.replace(/\/$/, ''))
    }
    function hash() {
      if (history.state?.archiveKey === current.current.key) return
      const next = { path: current.current.path, key: newKey() }
      history.replaceState({ ...history.state, archiveKey: next.key }, '')
      current.current = next
    }
    function saveOnExit() { if (!current.current.path) save() }
    function saveOnHidden() { if (document.hidden) saveOnExit() }
    addEventListener('pagehide', saveOnExit)
    document.addEventListener('visibilitychange', saveOnHidden)
    document.addEventListener('click', click)
    addEventListener('popstate', pop)
    addEventListener('hashchange', hash)
    return () => {
      disposed = true
      transition?.skipTransition()
      veil?.remove()
      history.scrollRestoration = oldRestoration
      removeEventListener('pagehide', saveOnExit)
      document.removeEventListener('visibilitychange', saveOnHidden)
      document.removeEventListener('click', click)
      removeEventListener('popstate', pop)
      removeEventListener('hashchange', hash)
    }
  }, [])
  const project = projects.find(item => route.path === '/projects/' + item.slug)
  return <>
    {homeVisited && <div hidden={!!route.path} inert={!!route.path}><Home /></div>}
    {route.path && <ProjectPage key={route.path} project={project} />}
  </>
}
