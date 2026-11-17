import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { idle, lookDirection, nextFrame, spriteCell, tracks } from '../src/huahua/sprite.ts'

assert.equal(lookDirection(0, 0), null)
for (let index = 0; index < 16; index++) {
  const angle = index * Math.PI / 8
  assert.equal(lookDirection(Math.sin(angle) * 100, -Math.cos(angle) * 100), index)
  assert.deepEqual(spriteCell(idle, index, false), { row: 9 + Math.floor(index / 8), column: index % 8 })
}
for (const [name, track] of Object.entries(tracks)) {
  let frame = { name, step: 0 }
  for (let column = 0; column < track.timing.length; column++) {
    assert.deepEqual(spriteCell(frame, 4, false), name === 'idle' ? { row: 9, column: 4 } : { row: track.row, column })
    frame = nextFrame(frame)
  }
  assert.deepEqual(frame, idle)
}
assert.deepEqual(spriteCell({ name: 'jump', step: 0 }, null, true), { row: 4, column: 2 })
const image = await readFile(new URL('../src/huahua/spritesheet.webp', import.meta.url))
assert.equal(createHash('sha256').update(image).digest('hex'), '5df4df741f67ed4df8195363240b69381a5af493cba5d836fefa4b1cad6c4607')
console.log('Huahua atlas, 16 directions and action frames passed.')

