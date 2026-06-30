// Tone scoring. Mandarin tones are pitch shapes over a syllable, defined mainly
// by direction and, secondarily, by height in the speaker's range:
//   1 high-level, 2 rising, 3 low-dipping, 4 falling, 5 neutral.
// We clean the raw F0 track (octave-correct + smooth), split it into syllables
// by voiced runs, and score each syllable's slope/curvature in semitones — which
// is independent of the speaker's absolute pitch — with a light height cue when
// the utterance shows a usable pitch range. Everything here is pure so it can be
// unit-tested and fuzzed without audio hardware.

const MIN_VOICED = 3
// Semitone references for full credit, tuned to typical tone excursions.
const RISE_FALL_ST = 4
const FLAT_RANGE_ST = 3
const DIP_ST = 2
// Utterance pitch range (semitones) above which absolute height is a reliable
// cue; below it (e.g. one flat syllable) we score on shape alone.
const USABLE_RANGE_ST = 5

// Convert a frequency series (Hz) to a semitone series relative to its own
// median, dropping non-positive/non-finite samples. Retained for callers and
// tests that want a normalized contour; the scorer works from raw Hz.
export function toSemitones(freqs) {
  const valid = freqs.filter((f) => Number.isFinite(f) && f > 0)
  if (valid.length === 0) return []
  const median = valid.slice().sort((a, b) => a - b)[Math.floor(valid.length / 2)]
  return valid.map((f) => 12 * Math.log2(f / median))
}

// Clean an F0 track: snap each voiced frame to the octave nearest the previous
// frame (fixes the autocorrelation detector's occasional octave jumps), then
// median-smooth. Unvoiced frames (<= 0) are preserved as 0 so timing survives.
export function cleanContour(hz) {
  const out = hz.map((f) => (Number.isFinite(f) && f > 0 ? f : 0))
  let prev = 0
  for (let i = 0; i < out.length; i++) {
    if (out[i] <= 0) continue
    if (prev > 0) out[i] = nearestOctave(out[i], prev)
    prev = out[i]
  }
  return medianSmooth3(out)
}

function nearestOctave(f, ref) {
  let best = f
  let bestDist = Infinity
  for (const c of [f / 2, f, f * 2]) {
    const d = Math.abs(Math.log2(c / ref))
    if (d < bestDist) {
      bestDist = d
      best = c
    }
  }
  return best
}

function medianSmooth3(hz) {
  const out = hz.slice()
  for (let i = 1; i < hz.length - 1; i++) {
    const a = hz[i - 1]
    const b = hz[i]
    const c = hz[i + 1]
    if (a > 0 && b > 0 && c > 0) out[i] = a + b + c - Math.max(a, b, c) - Math.min(a, b, c)
  }
  return out
}

function semitone(hz) {
  return 12 * Math.log2(hz)
}

function mean(a) {
  return a.reduce((s, v) => s + v, 0) / a.length
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0
  const i = Math.min(sortedAsc.length - 1, Math.max(0, Math.round(p * (sortedAsc.length - 1))))
  return sortedAsc[i]
}

// Split a cleaned contour into `count` syllables: prefer contiguous voiced runs
// (gaps = unvoiced frames); if that doesn't yield exactly `count` usable runs,
// fall back to an even split of all voiced frames.
export function segment(cleanHz, count) {
  const runs = []
  let cur = []
  for (const f of cleanHz) {
    if (f > 0) {
      cur.push(f)
    } else if (cur.length) {
      runs.push(cur)
      cur = []
    }
  }
  if (cur.length) runs.push(cur)
  const usable = runs.filter((r) => r.length >= MIN_VOICED)
  if (usable.length === count) return usable

  const voiced = cleanHz.filter((f) => f > 0)
  if (voiced.length < count * MIN_VOICED) return []
  const size = Math.floor(voiced.length / count)
  const segs = []
  for (let i = 0; i < count; i++) {
    const start = i * size
    const end = i === count - 1 ? voiced.length : start + size
    segs.push(voiced.slice(start, end))
  }
  return segs
}

// Score one syllable (voiced Hz) against an expected tone (1-5). floorSt/ceilSt
// describe the utterance pitch range for the optional height cue, which is only
// trusted when that range is wide enough to be meaningful.
export function scoreSyllable(sylHz, expectedTone, floorSt = 0, ceilSt = 0) {
  const voiced = sylHz.filter((f) => Number.isFinite(f) && f > 0)
  if (voiced.length < MIN_VOICED) return { score: 0, detected: 0 }
  const semis = voiced.map(semitone)
  const n = semis.length

  let lo = semis[0]
  let hi = semis[0]
  let minPos = 0
  for (let i = 0; i < n; i++) {
    if (semis[i] < lo) {
      lo = semis[i]
      minPos = i
    }
    if (semis[i] > hi) hi = semis[i]
  }
  const head = Math.max(1, Math.round(n * 0.25))
  const tail = Math.max(1, Math.round(n * 0.25))
  const onset = mean(semis.slice(0, head))
  const offset = mean(semis.slice(n - tail))
  const range = hi - lo
  const slope = offset - onset
  const inside = minPos >= head && minPos < n - tail
  const dipDepth = inside ? Math.min(onset, offset) - lo : 0

  // Shape scores (independent of absolute pitch).
  const flat = clamp01(1 - range / FLAT_RANGE_ST)
  const scores = {
    1: flat,
    2: clamp01(slope / RISE_FALL_ST),
    3: clamp01(dipDepth / DIP_ST),
    4: clamp01(-slope / RISE_FALL_ST),
    5: flat * 0.8
  }

  // Height cue: with a usable range, tone 1 sits high and tone 3 sits low.
  const span = ceilSt - floorSt
  if (span >= USABLE_RANGE_ST) {
    const level = clamp01((mean(semis) - floorSt) / span)
    scores[1] *= 0.5 + 0.5 * level
    scores[3] = Math.max(scores[3], clamp01((0.5 - level) / 0.5))
  }

  let detected = 1
  for (const t of [2, 3, 4, 5]) if (scores[t] > scores[detected]) detected = t
  return { score: clamp01(scores[expectedTone] ?? 0), detected }
}

// Score a whole-word F0 contour (Hz, 0 for unvoiced frames) against the expected
// per-syllable tones. `gamma` shapes the strictness curve: < 1 is forgiving
// (lifts partial scores), 1 is linear, > 1 is harsh. Returns per-syllable
// results plus the averaged overall.
export function scoreWord(contourHz, expectedTones, gamma = 1) {
  const count = expectedTones.length
  const clean = cleanContour(Array.from(contourHz))
  const segs = segment(clean, count)
  if (segs.length !== count) {
    return { overall: 0, syllables: expectedTones.map(() => ({ score: 0, detected: 0 })) }
  }
  const allSemis = clean.filter((f) => f > 0).map(semitone).sort((a, b) => a - b)
  const floorSt = percentile(allSemis, 0.1)
  const ceilSt = percentile(allSemis, 0.9)

  const syllables = expectedTones.map((tone, i) => {
    const r = scoreSyllable(segs[i], tone, floorSt, ceilSt)
    return { score: clamp01(r.score ** gamma), detected: r.detected }
  })
  const overall = mean(syllables.map((s) => s.score))
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
