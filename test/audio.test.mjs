import test from 'node:test'
import assert from 'node:assert/strict'
import { concatChunks, resamplePcm, toWhisperInput, WHISPER_RATE } from '../assets/js/audio.js'

test('concatChunks joins Float32 chunks in order', () => {
  const out = concatChunks([new Float32Array([1, 2]), new Float32Array([3])])
  assert.deepEqual([...out], [1, 2, 3])
})

test('resamplePcm halves length when downsampling 32k to 16k', () => {
  const input = new Float32Array(320)
  const out = resamplePcm(input, 32000, 16000)
  assert.equal(out.length, 160)
})

test('resamplePcm preserves a constant signal', () => {
  const input = new Float32Array(100).fill(0.5)
  const out = resamplePcm(input, 48000, 16000)
  assert.ok(out.every((v) => Math.abs(v - 0.5) < 1e-6))
})

test('resamplePcm returns a copy when rates match', () => {
  const input = new Float32Array([0.1, 0.2, 0.3])
  const out = resamplePcm(input, 16000, 16000)
  assert.deepEqual(out, new Float32Array([0.1, 0.2, 0.3]))
  assert.notEqual(out, input)
})

test('resamplePcm handles degenerate input without crashing', () => {
  assert.equal(resamplePcm(new Float32Array(0), 48000, 16000).length, 0)
  assert.equal(resamplePcm(new Float32Array([1]), 0, 16000).length, 0)
})

test('toWhisperInput concatenates and resamples to 16 kHz', () => {
  const chunks = [new Float32Array(48000).fill(0.2), new Float32Array(48000).fill(0.2)]
  const out = toWhisperInput(chunks, 48000)
  assert.equal(out.length, 2 * 48000 * (WHISPER_RATE / 48000))
  assert.ok(out.every((v) => Math.abs(v - 0.2) < 1e-6))
})
