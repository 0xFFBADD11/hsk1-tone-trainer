// Tone scoring. Mandarin tones have characteristic pitch shapes:
//   1 high-flat, 2 rising, 3 dipping (fall-rise), 4 falling, 5 neutral.
// We score a recorded pitch contour by how well its shape matches the
// expected tone. Everything here is pure so it can be unit-tested and
// fuzzed without audio hardware.

const RESAMPLE_N = 12

// Normalized shape templates over RESAMPLE_N points, used for tones whose
// identity is carried by direction/curvature (2, 3, 4). Tone 1 and 5 are
// scored by flatness instead, since a flat line has no shape to correlate.
const TEMPLATES = {
  2: buildLine(-1, 1),
  3: buildDip(),
  4: buildLine(1, -1)
}

function buildLine(start, end) {
  const out = []
  for (let i = 0; i < RESAMPLE_N; i++) {
    out.push(start + (end - start) * (i / (RESAMPLE_N - 1)))
  }
  return out
}

// Tone 3 dips: descends to a low point around the first third, then rises.
function buildDip() {
  const out = []
  const valley = Math.floor(RESAMPLE_N / 3)
  for (let i = 0; i < RESAMPLE_N; i++) {
    out.push(i <= valley
      ? -(i / valley)
      : -1 + (i - valley) / (RESAMPLE_N - 1 - valley) * 2)
  }
  return out
}

// Convert a frequency series (Hz) to a semitone series relative to its
// own median, dropping non-positive/non-finite samples at the boundary.
export function toSemitones(freqs) {
  const valid = freqs.filter((f) => Number.isFinite(f) && f > 0)
  if (valid.length === 0) return []
  const median = valid.slice().sort((a, b) => a - b)[Math.floor(valid.length / 2)]
  return valid.map((f) => 12 * Math.log2(f / median))
}

// Resample an arbitrary-length series to `n` points via linear interpolation.
export function resample(series, n = RESAMPLE_N) {
  if (series.length === 0) return new Array(n).fill(0)
  if (series.length === 1) return new Array(n).fill(series[0])
  const out = []
  for (let i = 0; i < n; i++) {
    const pos = (i / (n - 1)) * (series.length - 1)
    const lo = Math.floor(pos)
    const hi = Math.ceil(pos)
    const frac = pos - lo
    out.push(series[lo] * (1 - frac) + series[hi] * frac)
  }
  return out
}

function pearson(a, b) {
  const n = Math.min(a.length, b.length)
  let ma = 0
  let mb = 0
  for (let i = 0; i < n; i++) {
    ma += a[i]
    mb += b[i]
  }
  ma /= n
  mb /= n
  let num = 0
  let da = 0
  let db = 0
  for (let i = 0; i < n; i++) {
    const xa = a[i] - ma
    const xb = b[i] - mb
    num += xa * xb
    da += xa * xa
    db += xb * xb
  }
  if (da === 0 || db === 0) return 0
  return num / Math.sqrt(da * db)
}

function standardDeviation(series) {
  if (series.length === 0) return 0
  const mean = series.reduce((s, v) => s + v, 0) / series.length
  const variance = series.reduce((s, v) => s + (v - mean) ** 2, 0) / series.length
  return Math.sqrt(variance)
}

// A contour is "flat" (tone 1 / neutral) when its semitone spread is small.
const FLAT_STD_SEMITONES = 2.5

// Score one syllable's semitone contour against an expected tone (1-5).
// Returns { score: 0..1, detected: 1..5 }.
export function scoreSyllable(semitones, expectedTone) {
  if (semitones.length < 2) return { score: 0, detected: 0 }
  const shape = resample(semitones)
  const std = standardDeviation(shape)

  const correlations = {
    2: Math.max(0, pearson(shape, TEMPLATES[2])),
    3: Math.max(0, pearson(shape, TEMPLATES[3])),
    4: Math.max(0, pearson(shape, TEMPLATES[4]))
  }
  const flatness = Math.max(0, 1 - std / FLAT_STD_SEMITONES)

  const detected = detectTone(std, correlations)

  let score
  if (expectedTone === 1 || expectedTone === 5) {
    score = flatness
  } else {
    score = correlations[expectedTone] ?? 0
  }
  return { score: clamp01(score), detected }
}

function detectTone(std, correlations) {
  if (std < FLAT_STD_SEMITONES) return 1
  let best = 2
  let bestVal = correlations[2]
  for (const tone of [3, 4]) {
    if (correlations[tone] > bestVal) {
      bestVal = correlations[tone]
      best = tone
    }
  }
  return best
}

// Split a whole-word contour into `count` equal voiced segments (one per
// syllable) and score each against its expected tone. Returns per-syllable
// results plus the averaged overall score.
export function scoreWord(semitones, expectedTones) {
  const count = expectedTones.length
  if (semitones.length < count * 2) {
    return { overall: 0, syllables: expectedTones.map(() => ({ score: 0, detected: 0 })) }
  }
  const size = Math.floor(semitones.length / count)
  const syllables = expectedTones.map((tone, i) => {
    const start = i * size
    const end = i === count - 1 ? semitones.length : start + size
    return scoreSyllable(semitones.slice(start, end), tone)
  })
  const overall = syllables.reduce((s, r) => s + r.score, 0) / count
  return { overall: clamp01(overall), syllables }
}

function clamp01(v) {
  if (!Number.isFinite(v)) return 0
  if (v < 0) return 0
  if (v > 1) return 1
  return v
}

export const TONE_NAMES = {
  0: 'unclear',
  1: 'high-flat (1)',
  2: 'rising (2)',
  3: 'dipping (3)',
  4: 'falling (4)',
  5: 'neutral (5)'
}
