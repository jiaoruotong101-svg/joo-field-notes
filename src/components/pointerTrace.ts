// A single pointer feed shared by every line on the page. Readers pull the
// latest position inside their own animation frame, so pointer movement never
// becomes React render state and only one listener touches the document.

export type Trace = {
  clientX: number
  clientY: number
  inside: boolean
}

const state: Trace = { clientX: 0, clientY: 0, inside: false }
const readers = new Set<() => void>()
let attached = false
let frame = 0

function pump() {
  frame = 0
  readers.forEach((read) => read())
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(pump)
}

function move(event: PointerEvent) {
  if (event.pointerType !== 'mouse') return
  state.clientX = event.clientX
  state.clientY = event.clientY
  state.inside = true
  schedule()
}

function leave() {
  state.inside = false
  schedule()
}

function listen() {
  if (attached) return
  window.addEventListener('pointermove', move, { passive: true })
  window.addEventListener('pointerup', move, { passive: true })
  document.addEventListener('pointerleave', leave, { passive: true })
  window.addEventListener('blur', leave)
  window.addEventListener('scroll', schedule, { passive: true })
  attached = true
}

function unlisten() {
  if (!attached) return
  window.removeEventListener('pointermove', move)
  window.removeEventListener('pointerup', move)
  document.removeEventListener('pointerleave', leave)
  window.removeEventListener('blur', leave)
  window.removeEventListener('scroll', schedule)
  attached = false
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

export function readTrace(): Trace {
  return state
}

/** Subscribe a frame reader. Returns the unsubscribe function. */
export function followTrace(read: () => void): () => void {
  readers.add(read)
  listen()
  schedule()
  return () => {
    readers.delete(read)
    if (!readers.size) unlisten()
  }
}

export function traceAllowed(): boolean {
  return matchMedia('(pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches
}
