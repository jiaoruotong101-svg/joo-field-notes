import { appHref, siteBase } from './sitePaths'

/** Tab-scoped UI state only. No résumé, feedback or form data is stored. */
export type HomeSnapshot = {
  version: 1
  href: string
  y: number
  entryKey: string
  anchorId: string
  offset: number
  focusHref: string | null
  openDetails: string[]
  growthNode: string
  demos: string[]
}
const key = 'joo:home-state:v1' + (siteBase === '/' ? '' : siteBase)
const detailIds = ['research-work', 'research-interests', 'caption-checks', 'caption-transcript']
const demoIds = ['disclosure-experiment', 'caption-inspection', 'growth-timeline']
const nodeIds = ['management', 'research', 'engineering', 'projects', 'huahua']
const anchorIds = ['top', 'work', 'research', 'disclosure-experiment', 'practice', 'caption-inspection', 'human', 'growth-timeline', 'connection']
const initial = (): HomeSnapshot => ({ version: 1, href: '/', y: 0, entryKey: '', anchorId: 'top', offset: 0, focusHref: null, openDetails: [], growthNode: 'management', demos: [] })
let memory: HomeSnapshot | null = null
try {
  const value = JSON.parse(sessionStorage.getItem(key) || 'null')
  if (value?.version === 1 && /^\/(?:#[\w-]*)?$/.test(value.href) && Number.isFinite(value.y) && value.y >= 0
    && typeof value.entryKey === 'string' && anchorIds.includes(value.anchorId) && Number.isFinite(value.offset)
    && Array.isArray(value.openDetails) && Array.isArray(value.demos) && nodeIds.includes(value.growthNode)) {
    memory = { ...value, openDetails: value.openDetails.filter((id: string) => detailIds.includes(id)), demos: value.demos.filter((id: string) => demoIds.includes(id)),
      focusHref: typeof value.focusHref === 'string' && /^\/(?:projects\/[\w-]+)?(?:#[\w-]*)?$/.test(value.focusHref) ? value.focusHref : null }
  }
} catch { /* Disabled storage or invalid state must never block the archive. */ }

export const readHomeState = () => memory
function write(patch: Partial<HomeSnapshot>) {
  memory = { ...(memory || initial()), ...patch }
  try { sessionStorage.setItem(key, JSON.stringify(memory)) } catch { /* Keep in-memory navigation available. */ }
}
export function rememberDetail(id: string, open: boolean) {
  if (!detailIds.includes(id)) return
  const ids = new Set(memory?.openDetails || [])
  if (open) ids.add(id)
  else ids.delete(id)
  write({ openDetails: [...ids] })
}
export function rememberGrowth(id: string) { if (nodeIds.includes(id)) write({ growthNode: id }) }
export function rememberDemo(id: string) {
  if (demoIds.includes(id) && !memory?.demos.includes(id)) write({ demos: [...(memory?.demos || []), id] })
}
export function captureHomeState(entryKey: string): HomeSnapshot {
  let anchorId = 'top'
  let top = 0
  for (const id of anchorIds.slice(1)) {
    const element = document.getElementById(id)
    if (!element) continue
    const candidate = element.getBoundingClientRect().top + scrollY
    if (candidate <= scrollY + 100 && candidate >= top) { anchorId = id; top = candidate }
  }
  const active = document.activeElement
  write({ href: appHref(location.href) || '/', y: scrollY, entryKey, anchorId, offset: scrollY - top,
    focusHref: active instanceof HTMLAnchorElement && active.closest('#main') ? appHref(active.getAttribute('href')) : null })
  return memory!
}
export function homeRestoreY(state: HomeSnapshot) {
  if (state.anchorId === 'top') return state.y
  const anchor = document.getElementById(state.anchorId)
  return anchor ? anchor.getBoundingClientRect().top + scrollY + state.offset : state.y
}
export function homeStateReady(state: HomeSnapshot) {
  return state.demos.every(id => document.getElementById(id)?.dataset.demoReady === 'true') && document.fonts.status === 'loaded'
}
/** Called before, never inside, the View Transition update callback. */
export function waitForHomeState(state: HomeSnapshot): Promise<void> {
  if (homeStateReady(state)) return Promise.resolve()
  return new Promise(resolve => {
    const check = () => { if (homeStateReady(state)) finish() }
    const observer = new MutationObserver(check)
    const timeout = setTimeout(finish, 4000)
    function finish() { clearTimeout(timeout); observer.disconnect(); resolve() }
    observer.observe(document.getElementById('main') || document.body, { subtree: true, attributes: true, attributeFilter: ['data-demo-ready'], childList: true })
    void document.fonts.ready.then(check)
    check()
  })
}
