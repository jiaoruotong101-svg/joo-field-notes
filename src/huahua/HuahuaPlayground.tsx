import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { directionNames, idle, lookDirection, nextFrame, spriteCell, tracks, type Gesture, type Playback } from './sprite'
import atlas from './spritesheet.webp'
import './huahua.css'

const hop = [0, -5, -13, -5, 0]
const artwork = 'https://github.com/JOO5216/huahua-codex-pet#许可与素材说明'

export default function HuahuaPlayground() {
  const stage = useRef<HTMLDivElement>(null)
  const pet = useRef<HTMLButtonElement>(null)
  const nextGreeting = useRef<Gesture>('wave')
  const [playback, setPlayback] = useState<Playback>(idle)
  const [direction, setDirection] = useState<number | null>(null)
  const [asset, setAsset] = useState<'loading' | 'ready' | 'error'>('loading')
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const [reduce, setReduce] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [paused, setPaused] = useState(false)

  const still = reduce || paused
  const gaze = paused ? null : direction
  const cell = spriteCell(playback, gaze, still)
  const idleLoop = playback.name === 'idle'
  const looking = gaze !== null
  const degrees = idleLoop && gaze !== null ? gaze * 22.5 : null
  const current = playback.name === 'wave' ? 'Waving' : playback.name === 'jump' ? 'Jumping' : looking ? 'Following pointer' : 'Idle'
  const shouldRun = asset === 'ready' && inView && tabVisible && (!idleLoop || (!still && !looking))
  const offset = !still && playback.name === 'jump' ? hop[playback.step] : 0

  useEffect(() => {
    const image = new Image()
    let disposed = false
    image.src = atlas
    image.decode().then(() => { if (!disposed) setAsset('ready') }).catch(() => { if (!disposed) setAsset('error') })
    return () => { disposed = true }
  }, [])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    function syncMotion() { setReduce(media.matches) }
    function syncVisibility() { setTabVisible(!document.hidden) }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    if (stage.current) observer.observe(stage.current)
    media.addEventListener('change', syncMotion)
    document.addEventListener('visibilitychange', syncVisibility)
    return () => {
      observer.disconnect()
      media.removeEventListener('change', syncMotion)
      document.removeEventListener('visibilitychange', syncVisibility)
    }
  }, [])

  useEffect(() => {
    if (!shouldRun) return
    const delay = still ? 620 : tracks[playback.name].timing[playback.step]
    const next = still ? idle : nextFrame(playback)
    const timer = window.setTimeout(() => {
      setPlayback((current) => current === playback ? next : current)
    }, delay)
    return () => window.clearTimeout(timer)
  }, [shouldRun, playback, still])

  function play(name: Gesture) {
    setPlayback({ name, step: 0 })
  }

  function greet() {
    const greeting = nextGreeting.current
    nextGreeting.current = greeting === 'wave' ? 'jump' : 'wave'
    play(greeting)
  }

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || !pet.current || paused) return
    const box = pet.current.getBoundingClientRect()
    setDirection(lookDirection(event.clientX - box.left - box.width * .56, event.clientY - box.top - box.height * .24))
  }

  const spriteStyle = {
    backgroundImage: `url(${atlas})`,
    backgroundPosition: `${cell.column / 7 * 100}% ${cell.row / 10 * 100}%`,
    '--hua-hop': `${offset}%`,
  } as CSSProperties

  return (
    <section className="hua-demo" aria-labelledby="hua-title">
      <header className="hua-heading">
        <h2 id="hua-title">Say hello to Huahua.</h2>
        <p>Move the pointer around her, then click or tap <span lang="zh">花花</span> to get a wave or a jump.</p>
      </header>

      <div className="hua-console">
        <div ref={stage} className="hua-stage" onPointerMove={trackPointer} onPointerLeave={() => setDirection(null)} data-action={playback.name} data-asset={asset} data-still={still}>
          <div className="hua-sky" aria-hidden="true" />
          <div className="hua-floor" aria-hidden="true" />
          <span className="hua-ground" aria-hidden="true" />
          <button ref={pet} className="hua-pet" type="button" aria-label="Greet Huahua" onClick={greet} disabled={asset !== 'ready'}>
            <span className="hua-sprite" role="presentation" style={spriteStyle} data-row={cell.row} data-column={cell.column} />
          </button>
          {asset !== 'ready' && <p className="hua-loading mono" role="status">{asset === 'loading' ? 'Loading Huahua…' : 'Huahua’s artwork is unavailable.'}</p>}
        </div>

        <div className="hua-controls">
          <div className="hua-state">
            <p className="hua-label mono">Current pose</p>
            <h3 aria-live="polite">{asset === 'ready' ? current : '—'}</h3>
          </div>

          <div className="hua-gaze">
            <div className="hua-compass" aria-hidden="true">
              {directionNames.map((_, index) => <i key={index} className={idleLoop && gaze === index ? 'hua-tick-active' : undefined}
                style={{ '--hua-angle': `${index * 22.5}deg` } as CSSProperties} />)}
              <span />
            </div>
            <div>
              <p className="hua-label mono">Gaze</p>
              <p>{degrees === null ? 'Neutral' : `${degrees}° · ${directionNames[gaze!]}`}</p>
            </div>
          </div>

          <div className="hua-actions" role="group" aria-label="Huahua actions">
            <button type="button" className="hua-button mono" disabled={asset !== 'ready'} onClick={() => play('wave')}>Wave</button>
            <button type="button" className="hua-button mono" disabled={asset !== 'ready'} onClick={() => play('jump')}>Jump</button>
            {!reduce && <button type="button" className="hua-button hua-pause mono" disabled={asset !== 'ready'} onClick={() => { setDirection(null); setPaused((value) => !value) }}>{paused ? 'Resume motion' : 'Pause motion'}</button>}
          </div>
          <p className="hua-motion-note">{reduce ? 'Reduced motion shows a single pose per action.' : paused ? 'Motion paused. Wave and Jump show a single pose.' : 'Wave and Jump also work with a keyboard.'}</p>
        </div>
      </div>
      <p className="hua-credit">Huahua sprites from JOO5216 · <a href={artwork}>Artwork terms and source ↗</a></p>
    </section>
  )
}
