export const clip = { id: 'SYN-CAP-01', duration: 12, fps: 24 } as const
export const people = { P01: 'Mira', P02: 'Leon' } as const

type Person = keyof typeof people
type Action = 'enter' | 'place' | 'lift' | 'open' | 'close' | 'point' | 'leave'

export type Segment = {
  id: string
  start: number
  end: number
  person: Person
  action: Action
  text: string
}

export const evidence: Segment[] = [
  { id: 'E01', start: 0, end: 2, person: 'P01', action: 'enter', text: 'Walks in from the left.' },
  { id: 'E02', start: 2, end: 4, person: 'P01', action: 'place', text: 'Sets the yellow block on the workbench.' },
  { id: 'E03', start: 4, end: 6, person: 'P02', action: 'lift', text: 'Lifts the blue folder from the workbench.' },
  { id: 'E04', start: 6, end: 8, person: 'P02', action: 'open', text: 'Opens the blue folder.' },
  { id: 'E05', start: 8, end: 10, person: 'P01', action: 'point', text: 'Points toward the yellow block.' },
  { id: 'E06', start: 10, end: 12, person: 'P02', action: 'leave', text: 'Carries the folder toward the right exit.' },
]

export const annotations: Segment[] = evidence.map((segment, index) => {
  const row = { ...segment, id: 'A' + String(index + 1).padStart(2, '0') }
  if (index === 2) return { ...row, start: 5 }
  if (index === 3) return { ...row, action: 'close', text: 'Closes the blue folder.' }
  if (index === 4) return { ...row, person: 'P02' }
  return row
})

export function segmentAt(track: Segment[], time: number) {
  return track.find((segment) => time >= segment.start && time < segment.end) ?? null
}

export function timecode(seconds: number) {
  const whole = Math.round(seconds * 100)
  return `${String(Math.floor(whole / 6000)).padStart(2, '0')}:${(whole % 6000 / 100).toFixed(2).padStart(5, '0')}`
}

export function personLabel(id: Person) {
  return `${id} · ${people[id]}`
}

export type Finding = {
  id: string
  row: string | null
  kind: 'Timestamp gap' | 'Caption mismatch' | 'Person ID mismatch'
  start: number
  end: number
  seek: number
  observed: string
  expected: string
  fix: string
}

function gap(start: number, end: number): Finding {
  const seek = (start + end) / 2
  const reference = segmentAt(evidence, seek)
  return {
    id: `gap-${start}`,
    row: null,
    kind: 'Timestamp gap',
    start,
    end,
    seek,
    observed: 'No caption covers this interval.',
    expected: reference ? `${personLabel(reference.person)} — ${reference.text}` : 'Continuous caption coverage.',
    fix: 'Review the missing frames and restore the verified interval. Then rerun the continuity check.',
  }
}

export function checkAnnotations(track: Segment[]) {
  const findings: Finding[] = []
  let coveredUntil = 0
  for (const row of [...track].sort((a, b) => a.start - b.start)) {
    if (row.start - coveredUntil > 1 / clip.fps) findings.push(gap(coveredUntil, row.start))
    coveredUntil = Math.max(coveredUntil, row.end)
    const seek = (row.start + row.end) / 2
    const reference = segmentAt(evidence, seek)
    if (!reference) continue
    const span = { row: row.id, start: row.start, end: row.end, seek }
    if (row.action !== reference.action) {
      findings.push({
        ...span,
        id: 'caption-' + row.id,
        kind: 'Caption mismatch',
        observed: row.text,
        expected: reference.text,
        fix: 'Replace the action label and caption with the verified action. Retain the time range and person ID when they match.',
      })
    }
    if (row.person !== reference.person) {
      findings.push({
        ...span,
        id: 'person-' + row.id,
        kind: 'Person ID mismatch',
        observed: personLabel(row.person),
        expected: personLabel(reference.person),
        fix: 'Assign the caption to the person performing the action. Check the neighboring clips for consistent IDs.',
      })
    }
  }
  if (clip.duration - coveredUntil > 1 / clip.fps) findings.push(gap(coveredUntil, clip.duration))
  return findings
}
