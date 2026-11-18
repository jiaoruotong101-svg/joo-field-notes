import { signalForms, type SignalForm } from '../scene/forms'
import { StaticSignalOrbit } from './StaticSignalOrbit'
import { lazy, Suspense, useEffect, useRef, useState, type PointerEvent } from 'react'
import type { SignalCanvasProps, SignalControls } from '../scene/SignalCanvas'

function UnavailableScene({ onAvailability }: SignalCanvasProps) {
  useEffect(() => { onAvailability(false) }, [onAvailability])
  return null
}

const SignalCanvas = lazy(() => import('../scene/SignalCanvas').catch(() => ({ default: UnavailableScene })))
const motionPreference = '(prefers-reduced-motion: reduce)'

export function Signal() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const controls = useRef<SignalControls>({
    form: 0, impulse: 0, hoverX: 0, hoverY: 0, hover: false,
    dragX: 0, dragY: 0, dragging: false, paused: false,
  })
  const press = useRef({ id: -1, startX: 0, startY: 0, x: 0, y: 0, moved: false })
  const [context, setContext] = useState<WebGL2RenderingContext | null>(null)
  const [reduced, setReduced] = useState(() => matchMedia(motionPreference).matches)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [form, setForm] = useState<SignalForm>(0)
  const [paused, setPaused] = useState(false)
  const state = reduced ? 'reduced' : available === null ? 'loading' : available ? 'live' : 'still'
  const orbit = state === 'live' && !paused

  useEffect(() => {
    const query = matchMedia(motionPreference)
    function update() { setReduced(query.matches) }
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const surface = canvas.current
    if (!surface || reduced || context || available === false) return
    let frame = 0
    const view = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      view.disconnect()
      // Let the HTML and still draw before asking the driver to create a context.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          let next: WebGL2RenderingContext | null = null
          try { next = surface.getContext('webgl2', { alpha: true, antialias: false }) }
          catch { /* Keep the static signal. */ }
          if (next) setContext(next)
          else setAvailable(false)
        })
      })
    })
    view.observe(surface)
    return () => {
      view.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [available, context, reduced])

  function nudge() {
    canvas.current?.dispatchEvent(new Event('signalchange'))
  }

  function morph(next?: SignalForm) {
    const input = controls.current
    input.form = next ?? ((input.form + 1) % 3) as SignalForm
    input.impulse++
    setForm(input.form)
    nudge()
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const input = controls.current
    const bounds = event.currentTarget.getBoundingClientRect()
    input.hoverX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    input.hoverY = 1 - ((event.clientY - bounds.top) / bounds.height) * 2
    input.hover = event.pointerType === 'mouse'

    if (!orbit) return
    const gesture = press.current
    if (gesture.id !== event.pointerId) return
    if (!gesture.moved && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 5) return
    gesture.moved = true
    input.dragging = true
    input.dragX += event.clientX - gesture.x
    input.dragY += event.clientY - gesture.y
    gesture.x = event.clientX
    gesture.y = event.clientY
  }

  function end(event: PointerEvent<HTMLButtonElement>) {
    if (press.current.id !== event.pointerId) return
    press.current.id = -1
    controls.current.dragging = false
  }

  return (
    <div className="instrument" data-state={state} data-glyph={form === 1} data-form={form} data-orbit={orbit}>
      <div className="instrument-grid" aria-hidden="true">
        <span className="orbit orbit-a" /><span className="orbit orbit-b" /><span className="orbit orbit-c" />
        <span className="orbit-axis orbit-x" /><span className="orbit-axis orbit-y" />
        <span className="orbit-marker marker-a">+</span><span className="orbit-marker marker-b">+</span>
        <span className="orbit-marker marker-c">+</span><span className="orbit-marker marker-d">+</span>
      </div>
      <div className="readout readout-top" aria-hidden="true"><span className="live-dot" /> {state === 'live' ? 'SIGNAL ACQUIRED' : state === 'loading' ? 'ACQUIRING SIGNAL' : 'STATIC SIGNAL'}</div>
      <div className="readout readout-side" aria-hidden="true"><span>FIELD / 001</span><span>{signalForms[form]}</span></div>
      <button
        type="button"
        className="signal-surface"
        aria-label="Next particle shape"
        aria-describedby="signal-help"
        onPointerDown={(event) => {
          if (!orbit || !event.isPrimary || event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          press.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false }
        }}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onLostPointerCapture={end}
        onPointerLeave={() => { controls.current.hover = false }}
        onClick={(event) => { if (!orbit || event.detail === 0 || !press.current.moved) morph() }}
      >
        <picture className="signal-poster" aria-hidden="true">
          <source media="(max-width: 740px)" srcSet="/signal-still-mobile.webp" />
          <img src="/signal-still.webp" width={650} height={543} alt="" fetchPriority="high" />
        </picture>
        <span className="signal-static-glyph" aria-hidden="true">JOO</span>
        {form === 2 && state !== 'live' && <StaticSignalOrbit />}
        <canvas ref={canvas} aria-hidden="true" />
        {context && <Suspense fallback={null}><SignalCanvas context={context} controls={controls} onAvailability={setAvailable} /></Suspense>}
      </button>
      <div className="signal-forms" role="group" aria-label="Particle shape">
        {(['Field', 'JOO', 'Orbit'] as const).map((label, index) => <button key={label} type="button" aria-label={signalForms[index]} aria-pressed={form === index} onClick={() => morph(index as SignalForm)}>{label}</button>)}
      </div>
      <span className="signal-status" role="status">Current shape: {signalForms[form]}</span>
      <div className="instrument-controls">
        <p id="signal-help">
          {orbit && <span>Drag to orbit</span>}
          {state === 'still' && <span>Static view · WebGL unavailable</span>}
          {state === 'reduced' && <span>Reduced motion</span>}
          <span>Press to reshape</span>
        </p>
        {state === 'live' && <button className="pause" type="button" onClick={() => {
          controls.current.paused = !controls.current.paused
          setPaused(controls.current.paused)
          nudge()
        }} aria-label={paused ? 'Play signal motion' : 'Pause signal motion'} title={paused ? 'Play motion' : 'Pause motion'}>
          <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
        </button>}
      </div>
    </div>
  )
}
