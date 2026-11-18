import { orbitalPoint } from './forms'
import { BufferAttribute, BufferGeometry } from 'three'

export const PARTICLE_COUNT = 48000

function randomSequence(seed: number) {
  return () => {
    seed = (1664525 * seed + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function glyphPoints() {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 180
  const ctx = canvas.getContext('2d')!
  ctx.font = '900 162px Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('JOO', 240, 97)
  const pixels = ctx.getImageData(0, 0, 480, 180).data
  const samples: [number, number][] = []
  for (let y = 0; y < 180; y += 2) {
    for (let x = 0; x < 480; x += 2) {
      if (pixels[(y * 480 + x) * 4 + 3] > 160) samples.push([x, y])
    }
  }
  return samples
}

export function createSignalGeometry(count: number) {
  const random = randomSequence(8421)
  const glyph = glyphPoints()
  const positions = new Float32Array(count * 3)
  const letters = new Float32Array(count * 3)
  const traits = new Float32Array(count * 3)
  const orbits = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const offset = i * 3
    const kind = random()
    const angle = random() * Math.PI * 2
    const z = random() * 2 - 1
    const plane = Math.sqrt(1 - z * z)
    const x = Math.cos(angle) * plane
    const y = Math.sin(angle) * plane
    const ridge = Math.sin(7 * z + 3 * angle) * Math.cos(4 * angle - 4 * z)
    const radius = 1.30 + 0.17 * ridge + 0.20 * Math.sin(3 * angle + 5 * z)
    const thickness = 0.79 + 0.25 * Math.pow(random(), 0.4)
    if (kind < 0.67) {
      positions[offset] = x * radius * thickness
      positions[offset + 1] = y * radius * thickness
      positions[offset + 2] = z * radius * thickness
    } else if (kind < 0.94) {
      const band = Math.floor(random() * 5) - 2
      const spread = (random() - 0.5) * (random() - 0.5) * 0.48
      const r = 1.30 + 0.23 * Math.sin(2 * angle + band * 0.31) + spread
      positions[offset] = Math.cos(angle) * r * 1.18
      positions[offset + 1] = Math.sin(angle) * r * 0.72 + 0.33 * Math.sin(2.2 * Math.cos(angle) + band * 0.4) + band * 0.025
      positions[offset + 2] = Math.sin(angle) * r * 0.72 + 0.20 * Math.cos(3 * angle) + spread * 0.8
    } else {
      const r = 1.52 + Math.pow(random(), 1.9) * 1.18
      positions[offset] = x * r
      positions[offset + 1] = y * r * 0.89
      positions[offset + 2] = z * r
    }
    const pixel = glyph[Math.floor(random() * glyph.length)]
    letters[offset] = (pixel[0] - 240 + random()) * 0.009
    letters[offset + 1] = (90 - pixel[1] + random()) * 0.009
    letters[offset + 2] = (random() - 0.5) * 0.16
    orbits.set(orbitalPoint(angle, (i * 2.399963229728653) % (Math.PI * 2), i % 3 - 1), offset)
    traits[offset] = kind
    traits[offset + 1] = random()
    traits[offset + 2] = random()
  }
  return new BufferGeometry()
    .setAttribute('position', new BufferAttribute(positions, 3))
    .setAttribute('aOrbit', new BufferAttribute(orbits, 3))
    .setAttribute('aGlyph', new BufferAttribute(letters, 3))
    .setAttribute('aTraits', new BufferAttribute(traits, 3))
}
