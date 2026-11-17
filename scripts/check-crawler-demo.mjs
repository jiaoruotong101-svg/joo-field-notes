import assert from 'node:assert/strict'
import { buildDiscovery, canonicalVideo, exportCsv, pages } from '../src/crawler/fixture.ts'

const video = pages[0][0].url
assert.equal(canonicalVideo(pages[1][0].url), video)
assert.equal(canonicalVideo(video + '/?b=2&share_id=mock&a=1&utm_test=x#preview'), video + '?a=1&b=2')

const seed = buildDiscovery([])
assert.equal(seed.videos.size, 0)
assert.equal(buildDiscovery([0, 0]).rows.length, 4)

const all = buildDiscovery([0, 1, 2])
assert.equal(all.rows.length, 12)
assert.equal(all.videos.size, 9)
assert.equal(all.duplicates, 3)
assert.equal(all.rows.find((row) => row.id === 'P2-1').duplicateOf, 'P1-1')
assert.deepEqual(all.videos.get(video).sources, ['tag', 'sound'])

const reversed = buildDiscovery([1, 0])
assert.equal(reversed.rows.find((row) => row.id === 'P1-1').duplicateOf, 'P2-1')

const csv = exportCsv(all.videos)
assert.equal(csv.trimEnd().split('\r\n').length, 10)
assert.match(csv, /"true","101","@mira","https:\/\/video.example.invalid\/@mira\/video\/101","#fieldstudy \| Studio loop","1"/)
assert.doesNotMatch(csv, /utm_|share_id|#preview/)
console.log('Crawler fixture, normalization, deduplication and CSV checks passed.')

