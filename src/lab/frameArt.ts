import { sitePath } from '../sitePaths'
import { clip, faceVerdict, sampleTime, type Sample } from './fixture'

export const frameSheet = sitePath('/qc/studio-run.webp')

const ink = { pass: '#a8f2d1', fail: '#ff8796', hold: '#f5ce91' }
const panels: Record<number, [number, number]> = { 10: [0, 554], 50: [555, 557], 90: [1113, 559] }

export function drawFrame(canvas: HTMLCanvasElement, sample: Sample, overlays: boolean, photo: HTMLImageElement) {
  const { width, height } = clip
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Each panel is slightly taller than 16:9. Crop within its own row, clear of the cut.
  const [top, panelHeight] = panels[sample.percent]
  const cropHeight = photo.naturalWidth * height / width
  const cropTop = top + (panelHeight - cropHeight) / 2
  ctx.drawImage(photo, 0, cropTop, photo.naturalWidth, cropHeight, 0, 0, width, height)

  const shade = ctx.createLinearGradient(0, 0, 0, height)
  shade.addColorStop(0, '#061020a0')
  shade.addColorStop(0.13, '#06102000')
  shade.addColorStop(0.77, '#06102000')
  shade.addColorStop(1, '#061020d0')
  ctx.fillStyle = shade
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#e4edf7'
  ctx.font = '25px monospace'
  ctx.fillText('SYN–001 / SYNTHETIC STILL', 36, 49)
  ctx.textAlign = 'right'
  ctx.fillText(`${sample.percent}%  /  ${sampleTime(sample)}`, width - 36, 49)
  ctx.textAlign = 'left'
  ctx.font = '21px monospace'
  ctx.fillText(sample.description.toUpperCase(), 36, height - 39)

  if (overlays && sample.face) {
    const { x, y, width: boxWidth, height: boxHeight } = sample.face
    const color = ink[faceVerdict(sample)]
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.strokeRect(x, y, boxWidth, boxHeight)
    const label = `FACE  ${boxWidth}×${boxHeight}`
    ctx.font = '20px monospace'
    ctx.fillStyle = '#0b1924e8'
    ctx.fillRect(x - 1, y - 30, ctx.measureText(label).width + 16, 28)
    ctx.fillStyle = color
    ctx.fillText(label, x + 7, y - 9)
  }
  if (overlays && !sample.face) {
    ctx.fillStyle = ink.hold
    ctx.font = '22px monospace'
    ctx.fillText('NO FACE RETURNED', 36, height - 75)
  }
}
