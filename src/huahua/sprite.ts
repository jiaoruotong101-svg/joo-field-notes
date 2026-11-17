// Atlas rows and used cells follow the upstream v2 validation report.
export const tracks = {
  idle: { row: 0, timing: [280, 110, 110, 140, 140, 110, 210] },
  wave: { row: 3, timing: [140, 140, 140, 280] },
  jump: { row: 4, timing: [140, 140, 140, 140, 280] },
} as const

export type Gesture = 'wave' | 'jump'
export type Playback = { name: keyof typeof tracks; step: number }

export const idle: Playback = { name: 'idle', step: 0 }

export const directionNames = [
  'Up', 'Up–right', 'Up–right', 'Up–right',
  'Right', 'Down–right', 'Down–right', 'Down–right',
  'Down', 'Down–left', 'Down–left', 'Down–left',
  'Left', 'Up–left', 'Up–left', 'Up–left',
]

export function lookDirection(dx: number, dy: number) {
  if (Math.hypot(dx, dy) < 18) return null
  return (Math.round(Math.atan2(dx, -dy) / (Math.PI / 8)) + 16) % 16
}

export function spriteCell(playback: Playback, direction: number | null, still: boolean) {
  if (playback.name === 'idle' && direction !== null) {
    return { row: 9 + Math.floor(direction / 8), column: direction % 8 }
  }
  return {
    row: tracks[playback.name].row,
    column: still ? playback.name === 'idle' ? 0 : 2 : playback.step,
  }
}

export function nextFrame(playback: Playback): Playback {
  const step = playback.step + 1
  if (step < tracks[playback.name].timing.length) return { name: playback.name, step }
  return idle
}
