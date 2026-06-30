// jazzer.js fuzz target for the tone scoring path. These functions consume an
// F0 contour (Hz, with 0 for unvoiced frames) derived from microphone audio, so
// they must never throw on degenerate, NaN, or extreme input — they should
// return a bounded 0..1 score and per-syllable results instead.
import * as jazzer from '@jazzer.js/core'
import { toSemitones, cleanContour, scoreWord } from '../assets/js/tone.js'

const { FuzzedDataProvider } = jazzer

export function fuzz(data) {
  const provider = new FuzzedDataProvider(data)
  const len = provider.consumeIntegralInRange(0, 256)
  const contour = []
  for (let i = 0; i < len; i++) {
    contour.push(provider.consumeFloatInRange(-1000, 5000))
  }

  toSemitones(contour)
  cleanContour(contour)

  const count = provider.consumeIntegralInRange(1, 4)
  const tones = Array.from({ length: count }, () => provider.consumeIntegralInRange(1, 5))
  const word = scoreWord(contour, tones)
  assertBounded(word.overall)
  for (const syl of word.syllables) assertBounded(syl.score)
}

function assertBounded(score) {
  if (!(score >= 0 && score <= 1)) {
    throw new Error(`score out of range: ${score}`)
  }
}
