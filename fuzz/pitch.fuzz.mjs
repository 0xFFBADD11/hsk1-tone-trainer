// jazzer.js fuzz target for detectPitch. It consumes a Float32 frame derived
// from microphone audio plus a sample rate, so it must never throw on
// degenerate, NaN, or extreme input — it should return a finite, non-negative
// frequency (0 when no clear pitch is present).
import * as jazzer from '@jazzer.js/core'
import { detectPitch } from '../assets/js/pitch.js'

const { FuzzedDataProvider } = jazzer

export function fuzz(data) {
  const provider = new FuzzedDataProvider(data)
  const len = provider.consumeIntegralInRange(0, 4096)
  const buffer = new Float32Array(len)
  for (let i = 0; i < len; i++) buffer[i] = provider.consumeFloatInRange(-2, 2)
  const sampleRate = provider.consumeIntegralInRange(0, 96000)

  const hz = detectPitch(buffer, sampleRate)
  if (!(Number.isFinite(hz) && hz >= 0)) {
    throw new Error(`detectPitch returned out-of-range value: ${hz}`)
  }
}
