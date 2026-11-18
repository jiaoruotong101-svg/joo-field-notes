import { orbitalPoint } from '../scene/forms'

let cached: string[] | undefined
function paths() {
  if (cached) return cached
  const groups = ['', '', '']
  let seed = 6473
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 }
  for (let i = 0; i < 1700; i++) {
    const group = i % 3
    const [x, y] = orbitalPoint(random() * Math.PI * 2, random() * Math.PI * 2, group - 1)
    groups[group] += `M${(x * 85).toFixed(2)} ${(-y * 85).toFixed(2)}m-.48 0a.48 .48 0 1 0 .96 0a.48 .48 0 1 0 -.96 0`
  }
  cached = groups
  return groups
}
export function StaticSignalOrbit() {
  return <svg className="signal-static-orbit" viewBox="-160 -130 320 260" aria-hidden="true">
    <g transform="rotate(-24)">
      {paths().map((d,i) => <path key={i} d={d} fill={['#86a9dc','#d4e6ff','#f2a3ad'][i]} opacity=".78" />)}
    </g>
  </svg>
}
