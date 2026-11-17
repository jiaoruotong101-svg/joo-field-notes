import assert from 'node:assert/strict'
import { canSaveFeedback, conditions, explanationVisible, newRun, nextStage } from '../src/research/disclosure.ts'

const phases = [0, 1, 2, 3]
assert.deepEqual(phases.map((phase) => nextStage(phase)), [1, 2, 3, 3])
const expected = {
  before: [true, true, true, true],
  during: [false, true, true, true],
  after: [false, false, false, true],
}
for (const condition of Object.keys(conditions)) {
  assert.deepEqual(phases.map((phase) => explanationVisible(condition, phase)), expected[condition])
}
const run = newRun()
const ratings = { procedure: 4, interaction: 3, outcome: 2 }
assert(!canSaveFeedback({ ...run, ratings }))
assert(!canSaveFeedback({ ...run, stage: 3, ratings: { procedure: 4, outcome: 2 } }))
assert(canSaveFeedback({ ...run, stage: 3, ratings }))
assert.deepEqual(newRun(), { stage: 0, ratings: {}, saved: false })
console.log('Disclosure timing and fairness feedback checks passed.')

