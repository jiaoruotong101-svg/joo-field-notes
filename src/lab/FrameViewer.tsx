import { useEffect, useRef, useState } from 'react'
import { samples } from './fixture'
import { drawFrame, frameSheet } from './frameArt'
import type { mountFrameScene } from './frameScene'

type Props = {
  selected: number
  overlays: boolean
  onSelect: (index: number) => void
}

export function FrameViewer({ selected, overlays, onSelect }: Props) {
  const fallback = useRef<HTMLCanvasElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const photo = useRef<HTMLImageElement | null>(null)
  const scene = useRef<ReturnType<typeof mountFrameScene>>(null)
  const current = useRef({ selected, overlays, onSelect })
  const [state, setState] = useState<'loading' | 'live' | 'still' | 'unavailable'>('loading')

  useEffect(() => {
    current.current = { selected, overlays, onSelect }
    scene.current?.update(selected, overlays)
    if (state !== 'live' && fallback.current && photo.current) drawFrame(fallback.current, samples[selected], overlays, photo.current)
  }, [selected, overlays, onSelect, state])

  useEffect(() => {
    let disposed = false
    const image = new Image()
    image.src = frameSheet
    const ready = image.decode().then(() => {
      if (disposed || !fallback.current) return
      photo.current = image
      drawFrame(fallback.current, samples[current.current.selected], current.current.overlays, image)
    })
    const graphics = import('./frameScene').catch(() => null)
    Promise.all([ready, graphics]).then(([, module]) => {
      if (disposed || !canvas.current) return
      const { selected, overlays } = current.current
      if (!module) { setState('still'); return }
      scene.current = module.mountFrameScene(canvas.current, {
        selected,
        overlays,
        photo: image,
        onSelect: (index) => current.current.onSelect(index),
        onAvailability: (available) => setState(available ? 'live' : 'still'),
      })
    }).catch(() => {
      if (!disposed) setState(photo.current ? 'still' : 'unavailable')
    })
    return () => {
      disposed = true
      scene.current?.dispose()
      scene.current = null
      photo.current = null
    }
  }, [])

  return (
    <div className="qc-viewer" data-renderer={state}>
      <canvas className="qc-fallback" ref={fallback} aria-hidden="true" />
      <canvas className="qc-world" ref={canvas} aria-hidden="true" />
      <span className="qc-view-label mono">
        {state === 'live' ? 'Perspective view · Select a frame' : state === 'still' ? '2D frame view' : state === 'unavailable' ? 'Frame preview unavailable' : 'Loading frames…'}
      </span>
    </div>
  )
}
