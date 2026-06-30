import test from 'node:test'
import assert from 'node:assert/strict'
import { toSemitones, cleanContour, segment, scoreWord, toneTarget, PLOT_N } from '../assets/js/tone.js'

// Build a voiced syllable as an Hz series moving linearly from `fromSt` to
// `toSt` semitones around a base, so tests exercise the real scorer.
function ramp(fromSt, toSt, n = 30, base = 150) {
  return Array.from({ length: n }, (_, i) => {
    const st = fromSt + (toSt - fromSt) * (i / (n - 1))
    return base * 2 ** (st / 12)
  })
}

// Tone 3: dip down then back up (low valley in the middle).
function dipSyllable(n = 36, base = 150) {
  const out = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const st = -6 * Math.sin(Math.PI * t) - (t < 0.5 ? 0 : (t - 0.5) * 2)
    out.push(base * 2 ** (st / 12))
  }
  return out
}

const silence = (n) => new Array(n).fill(0)

test('toSemitones drops invalid samples and centers on the median', () => {
  const out = toSemitones([0, -5, NaN, 200, 200, 200])
  assert.equal(out.length, 3)
  assert.ok(Math.abs(out[1]) < 1e-9)
})

test('cleanContour corrects a single-frame octave jump', () => {
  const hz = ramp(0, 0, 9) // flat 150 Hz
  hz[4] *= 2 // octave glitch
  const cleaned = cleanContour(hz)
  assert.ok(Math.abs(cleaned[4] - 150) < 10, `glitch not corrected: ${cleaned[4]}`)
})

test('segment finds two voiced runs separated by a gap', () => {
  const two = [...ramp(0, 0, 8), ...silence(5), ...ramp(0, 0, 8)]
  assert.equal(segment(cleanContour(two), 2).length, 2)
})

test('a flat contour scores high for tone 1', () => {
  const { syllables, overall } = scoreWord([...silence(4), ...ramp(1, 1), ...silence(4)], [1])
  assert.equal(syllables[0].detected, 1)
  assert.ok(overall > 0.6, `overall ${overall}`)
})

test('a rising contour scores high for tone 2 and low for tone 4', () => {
  const hz = [...silence(4), ...ramp(-2, 4), ...silence(4)]
  assert.ok(scoreWord(hz, [2]).overall > 0.6)
  assert.ok(scoreWord(hz, [4]).overall < 0.2)
  assert.equal(scoreWord(hz, [2]).syllables[0].detected, 2)
})

test('a falling contour scores high for tone 4', () => {
  const hz = [...silence(4), ...ramp(4, -4), ...silence(4)]
  assert.ok(scoreWord(hz, [4]).overall > 0.6)
  assert.equal(scoreWord(hz, [4]).syllables[0].detected, 4)
})

test('a dipping contour scores well for tone 3', () => {
  const hz = [...silence(4), ...dipSyllable(), ...silence(4)]
  assert.ok(scoreWord(hz, [3]).overall > 0.5, `tone 3 overall ${scoreWord(hz, [3]).overall}`)
})

test('scoreWord splits a two-syllable contour and averages', () => {
  const hz = [...ramp(1, 1, 20), ...silence(6), ...ramp(4, -4, 20)]
  const result = scoreWord(hz, [1, 4])
  assert.equal(result.syllables.length, 2)
  assert.ok(result.overall > 0.5, `overall ${result.overall}`)
})

test('gamma makes scoring more forgiving (<1) or harsher (>1)', () => {
  const hz = [...silence(4), ...ramp(-2, 3), ...silence(4)] // a decent tone 2
  const linear = scoreWord(hz, [2], 1).overall
  const forgiving = scoreWord(hz, [2], 0.45).overall
  const harsh = scoreWord(hz, [2], 1.6).overall
  assert.ok(forgiving >= linear, `forgiving ${forgiving} < linear ${linear}`)
  assert.ok(harsh <= linear, `harsh ${harsh} > linear ${linear}`)
})

test('toneTarget returns canonical shapes of the right length', () => {
  assert.equal(toneTarget(1).length, PLOT_N)
  assert.ok(Math.max(...toneTarget(1).map(Math.abs)) < 1e-9) // tone 1 flat
  const t2 = toneTarget(2)
  assert.ok(t2[t2.length - 1] > t2[0]) // tone 2 rises
  const t4 = toneTarget(4)
  assert.ok(t4[0] > t4[t4.length - 1]) // tone 4 falls
})

test('scoreWord exposes plot contour and target arrays per syllable', () => {
  const hz = [...silence(4), ...ramp(4, -4), ...silence(4)]
  const syl = scoreWord(hz, [4]).syllables[0]
  assert.equal(syl.contour.length, PLOT_N)
  assert.equal(syl.target.length, PLOT_N)
})

test('too-short or empty input yields zero score, not a crash', () => {
  assert.equal(scoreWord([], [1]).overall, 0)
  assert.equal(scoreWord([0, 0, 0], [1]).overall, 0)
  assert.equal(scoreWord([150, 150], [1, 2]).overall, 0)
})
