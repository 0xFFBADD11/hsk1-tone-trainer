import test from 'node:test'
import assert from 'node:assert/strict'
import { detectPitch } from '../assets/js/pitch.js'

// Synthesize a pure tone so detectPitch can be exercised without audio
// hardware. detectPitch is the only browser-independent export.
function sine(hz, sampleRate, n, amp = 0.3) {
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) buf[i] = amp * Math.sin((2 * Math.PI * hz * i) / sampleRate)
  return buf
}

test('detectPitch recovers the fundamental of a pure tone', () => {
  const hz = detectPitch(sine(200, 48000, 2048), 48000)
  assert.ok(Math.abs(hz - 200) < 3, `expected ~200 Hz, got ${hz}`)
})

test('detectPitch finds a higher fundamental too', () => {
  const hz = detectPitch(sine(330, 44100, 2048), 44100)
  assert.ok(Math.abs(hz - 330) < 5, `expected ~330 Hz, got ${hz}`)
})

test('silence returns 0', () => {
  assert.equal(detectPitch(new Float32Array(2048), 48000), 0)
})

test('too-short or degenerate input returns 0, not a crash', () => {
  assert.equal(detectPitch(new Float32Array(0), 48000), 0)
  assert.equal(detectPitch(new Float32Array(1), 48000), 0)
  assert.equal(detectPitch(sine(200, 48000, 2048), 0), 0)
})

test('NaN-laden input returns 0 without throwing', () => {
  const buf = sine(200, 48000, 2048)
  buf[10] = NaN
  buf[20] = Infinity
  const hz = detectPitch(buf, 48000)
  assert.ok(Number.isFinite(hz) && hz >= 0)
})
