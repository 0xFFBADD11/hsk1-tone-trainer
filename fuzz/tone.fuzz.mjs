// jazzer.js fuzz target for the pitch/tone input-processing path. These
// functions consume arrays derived from microphone audio, so they must
// never throw on degenerate, NaN, or extreme input — they should return a
// bounded 0..1 score instead.
import * as jazzer from '@jazzer.js/core'
import { toSemitones, resample, scoreSyllable, scoreWord } from '../assets/js/tone.js'

const { FuzzedDataProvider } = jazzer

export function fuzz(data) {
  const provider = new FuzzedDataProvider(data)
  const len = provider.consumeIntegralInRange(0, 256)
  const freqs = []
  for (let i = 0; i < len; i++) {
    freqs.push(provider.consumeFloatInRange(-1000, 5000))
  }

  const semis = toSemitones(freqs)
  resample(semis, 12)

  const expected = provider.consumeIntegralInRange(1, 5)
  const syl = scoreSyllable(semis, expected)
  assertBounded(syl.score)

  const count = provider.consumeIntegralInRange(1, 4)
  const tones = Array.from({ length: count }, () => provider.consumeIntegralInRange(1, 5))
  const word = scoreWord(semis, tones)
  assertBounded(word.overall)
}

function assertBounded(score) {
  if (!(score >= 0 && score <= 1)) {
    throw new Error(`score out of range: ${score}`)
  }
}
