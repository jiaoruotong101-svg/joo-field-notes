import { useEffect, useRef } from 'react'

export type StarNode = {
  id: string
  label: string
  kind: 'source' | 'creator' | 'video'
  x: number
  y: number
}

export type StarLink = { from: string; to: string }

type Props = {
  nodes: StarNode[]
  links: StarLink[]
  active: string | null
  highlighted: ReadonlySet<string>
  onSelect: (id: string) => void
}

export function StarMap({ nodes, links, active, highlighted, onSelect }: Props) {
  const surface = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = surface.current!
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const stars = new Map(nodes.map((node) => [node.id, node]))
    const reduce = matchMedia('(prefers-reduced-motion: reduce)')
    const start = performance.now()
    let raf = 0
    let width = 0
    let height = 0
    let dpr = 1

    function paint(now: number) {
      ctx!.clearRect(0, 0, width, height)
      const t = reduce.matches ? 1 : Math.min(1, (now - start) / 650)
      const ease = 1 - (1 - t) ** 3

      for (let i = 0; i < 160; i++) {
        const x = ((131 * i + 23 * i * i) % 997) / 997 * width
        const y = ((367 * i + 7 * i * i) % 991) / 991 * height
        ctx!.fillStyle = i % 9 === 0 ? '#b6d3f46e' : '#96b6d642'
        ctx!.fillRect(x, y, i % 13 === 0 ? 2 : 1, i % 13 === 0 ? 2 : 1)
      }

      ctx!.lineWidth = 1
      ctx!.strokeStyle = '#98b6d723'
      for (const radius of [0.23, 0.36, 0.49]) {
        ctx!.beginPath()
        ctx!.ellipse(width * 0.47, height * 0.53, width * radius, height * radius * 0.82, 0, 0, 2 * Math.PI)
        ctx!.stroke()
      }

      for (const { from, to } of links) {
        const a = stars.get(from)!
        const b = stars.get(to)!
        const x = a.x * width
        const y = a.y * height
        const dx = (b.x - a.x) * width
        const endY = b.y * height
        const chosen = highlighted.has(from + '|' + to)
        const opacity = !active || chosen ? 1 : 0.32
        ctx!.globalAlpha = opacity * (0.16 + ease * 0.84)
        ctx!.strokeStyle = chosen ? '#ffafba' : a.kind === 'source' ? '#5a91b7' : '#447599'
        ctx!.lineWidth = chosen ? 1.65 : 1
        ctx!.beginPath()
        ctx!.moveTo(x, y)
        ctx!.bezierCurveTo(x + dx * 0.51, y, x + dx * 0.5, endY, x + dx, endY)
        ctx!.stroke()
        if (t < 1) {
          const p = ease
          const inv = 1 - p
          const sx = x + dx * (3 * inv * inv * p * .51 + 3 * inv * p * p * .5 + p ** 3)
          const sy = y + (endY - y) * (3 * inv * p * p + p ** 3)
          ctx!.fillStyle = '#dbecff'
          ctx!.fillRect(sx - 1, sy - 1, 2, 2)
        }
      }
      ctx!.globalAlpha = 1
      if (t < 1) raf = requestAnimationFrame(paint)
    }

    function redraw() {
      cancelAnimationFrame(raf)
      width = canvas.clientWidth
      height = canvas.clientHeight
      dpr = Math.min(window.devicePixelRatio, 1.75)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint(performance.now())
    }

    const resize = new ResizeObserver(redraw)
    resize.observe(canvas)
    reduce.addEventListener('change', redraw)
    redraw()
    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      reduce.removeEventListener('change', redraw)
    }
  }, [nodes, links, active, highlighted])

  return (
    <div className="crawler-map" role="group" aria-label="Discovered network">
      <canvas aria-hidden="true" ref={surface} />
      <div className="crawler-lanes mono" aria-hidden="true"><span>Sources</span><span>Creators</span><span>Videos</span></div>
      <div className="crawler-guides" aria-hidden="true"><i /><i /><i /></div>
      {nodes.map((node) => (
        <button key={node.id} type="button" className={`crawler-node crawler-node-${node.kind}`}
          style={{ left: `${node.x * 100}%`, top: `${node.y * 100}%` }}
          aria-label={`${node.kind}: ${node.label}`}
          aria-pressed={active === node.id} onClick={() => onSelect(node.id)}>
          <i aria-hidden="true" /><span>{node.label}</span>
        </button>
      ))}
    </div>
  )
}
