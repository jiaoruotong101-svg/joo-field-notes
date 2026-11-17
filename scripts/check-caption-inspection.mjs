import assert from 'node:assert/strict'
import { stat } from 'node:fs/promises'
import { annotations, checkAnnotations, clip, evidence, segmentAt, timecode } from '../src/caption/timeline.ts'

assert.equal(segmentAt(annotations, 4.5), null)
assert.equal(segmentAt(annotations, 5).id, 'A03')
assert.equal(segmentAt(annotations, clip.duration), null)
assert.equal(timecode(4.5), '00:04.50')
const findings = checkAnnotations([...annotations].reverse())
assert.deepEqual(findings.map(({ kind, seek }) => [kind, seek]), [
  ['Timestamp gap', 4.5],
  ['Caption mismatch', 7],
  ['Person ID mismatch', 9],
])
assert.match(findings[0].expected, /Leon.*Lifts the blue folder/)
assert.equal(findings[1].expected, 'Opens the blue folder.')
assert.equal(findings[2].expected, 'P01 · Mira')
assert.deepEqual(checkAnnotations(evidence), [])

const movie = await stat(new URL('../public/caption/studio.mp4', import.meta.url))
assert(movie.size > 0)
console.log('Caption fixture, timeline boundaries and three findings passed.')

