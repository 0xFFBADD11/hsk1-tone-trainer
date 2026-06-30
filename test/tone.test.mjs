import test from 'node:test'
import assert from 'node:assert/strict'
import { toSemitones, resample, scoreSyllable, scoreWord } from '../assets/js/tone.js'

// Build a syllable-length Hz series with a given direction so the tests
// exercise the real classifier rather than hand-picked semitone arrays.
function ramp(startHz, endHz, n = 24) {
  return Array.from({ length: n }, (_, i) => startHz + (endHz - startHz) * (i / (n - 1)))
}

test('toSemitones drops invalid samples and centers on the median', () => {
  const out = toSemitones([0, -5, NaN, 200, 200, 200])
  assert.equal(out.length, 3)
  assert.ok(Math.abs(out[1]) < 1e-9)
})

test('resample returns the requested length', () => {
  assert.equal(resample([1, 2, 3], 12).length, 12)
  assert.equal(resample([], 12).length, 12)
})

test('a flat contour scores high for tone 1', () => {
  const semis = toSemitones(ramp(150, 150))
  const { score, detected } = scoreSyllable(semis, 1)
  assert.ok(score > 0.7)
  assert.equal(detected, 1)
})

test('a rising contour scores high for tone 2 and low for tone 4', () => {
  const semis = toSemitones(ramp(120, 220))
  assert.ok(scoreSyllable(semis, 2).score > 0.8)
  assert.ok(scoreSyllable(semis, 4).score < 0.2)
  assert.equal(scoreSyllable(semis, 2).detected, 2)
})

test('a falling contour scores high for tone 4', () => {
  const semis = toSemitones(ramp(240, 120))
  assert.ok(scoreSyllable(semis, 4).score > 0.8)
  assert.equal(scoreSyllable(semis, 4).detected, 4)
})

test('scoreWord splits a two-syllable contour and averages', () => {
  const word = toSemitones([...ramp(150, 150, 20), ...ramp(120, 220, 20)])
  const result = scoreWord(word, [1, 2])
  assert.equal(result.syllables.length, 2)
  assert.ok(result.overall > 0.6)
})

test('too-short input yields zero score, not a crash', () => {
  assert.equal(scoreSyllable([100], 1).score, 0)
  assert.equal(scoreWord([100], [1, 2]).overall, 0)
})
