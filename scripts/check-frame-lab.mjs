import assert from 'node:assert/strict'
import { buildReport, faceMinimum, faceVerdict, samples, specRules } from '../src/lab/fixture.ts'

const boundary = {
  percent: 10,
  description: 'Threshold check',
  face: { x: 0, y: 0, width: faceMinimum, height: faceMinimum },
}

assert.equal(faceVerdict(boundary), 'pass')
assert.equal(faceVerdict({ ...boundary, face: { ...boundary.face, width: faceMinimum - 1 } }), 'fail')
assert.equal(faceVerdict({ ...boundary, face: { ...boundary.face, height: faceMinimum - 1 } }), 'fail')
assert.equal(faceVerdict({ ...boundary, face: null }), 'hold')
assert(specRules.every((rule) => rule.passes))

const reviews = samples.map(() => ({ decision: 'accept', note: '  Reviewed fixture.  ' }))
const report = buildReport(reviews)
assert.equal(report.simulation, true)
assert.equal(report.automated.faceSampling, 'fail')
assert.equal(report.reviewerDisposition, 'accept')
assert.deepEqual(report.samples.map((sample) => sample.timestampSeconds), [2, 10, 18])
assert.equal(report.samples[0].humanReview.note, 'Reviewed fixture.')

reviews[1].decision = 'hold'
assert.equal(buildReport(reviews).reviewerDisposition, 'hold')
reviews[2].decision = 'reject'
assert.equal(buildReport(reviews).reviewerDisposition, 'reject')
assert.throws(() => buildReport(reviews.slice(0, 2)), /Every sample must be reviewed/)

console.log('Frame lab thresholds and report checks passed.')

