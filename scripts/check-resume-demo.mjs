import assert from 'node:assert/strict'
import { getFillPlan, initialDrafts } from '../src/resume/fixture.ts'

const drafts = initialDrafts()
assert.deepEqual(getFillPlan(drafts).map(({ id }) => id), ['name', 'email', 'location', 'project'])
assert.equal(drafts.location.value, 'Hangzhou')

drafts.location.value = '  Suzhou  '
drafts.start.included = true
drafts.start.value = '  '
drafts.project.included = false
assert.deepEqual(getFillPlan(drafts).map(({ id, value }) => [id, value]), [
  ['name', 'Mira Lin'],
  ['email', 'mira.lin@example.com'],
  ['location', 'Suzhou'],
])

drafts.title = { included: true, value: 'Research Assistant' }
assert.equal(getFillPlan(drafts).at(-1).value, 'Research Assistant')
assert.equal(initialDrafts().title.included, false)
console.log('Résumé demo matches and fill plan checks passed.')

