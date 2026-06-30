// Tone scoring. Mandarin tones are pitch shapes over a syllable:
//   1 high-level, 2 rising, 3 low-dipping, 4 falling, 5 neutral.
// We clean the raw F0 track (octave-correct + smooth), split it into syllables
// by voiced runs, and score each syllable by how closely its pitch contour
// matches the canonical tone target — the same shape drawn in the comparison
// plot, so the score and the picture always agree. Everything here is pure so it
// can be unit-tested and fuzzed without audio hardware.

const MIN_VOICED = 3
// Average semitone gap between the learner's contour and the target at which the
// match score reaches 0 (smaller = stricter). The score is 1 minus the
// normalized RMS distance, so it tracks how close the two plotted curves look.
const SIM_TOL_ST = 3

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

// Number of points each plotted contour is resampled to.
export const PLOT_N = 24

function resampleSeries(series, n) {
  if (series.length === 0) return new Array(n).fill(0)
  if (series.length === 1) return new Array(n).fill(series[0])
  const out = []
  for (let i = 0; i < n; i++) {
    const pos = (i / (n - 1)) * (series.length - 1)
    const lo = Math.floor(pos)
    const hi = Math.ceil(pos)
    out.push(series[lo] + (series[hi] - series[lo]) * (pos - lo))
  }
  return out
}

// Canonical pitch shape for a tone as semitone deviations from the syllable
// mean over `n` points (positive = higher). This is the target contour the
// learner aims for, mirroring the features the scorer rewards.
export function toneTarget(tone, n = PLOT_N) {
  const out = []
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    let dev
    if (tone === 2) dev = -3 + 6 * t // rising (35)
    else if (tone === 3) dev = t < 0.4 ? -1 - 10 * t : -5 + (t - 0.4) / 0.6 * 6 // dip (214)
    else if (tone === 4) dev = 4 - 8 * t // falling (51)
    else if (tone === 5) dev = 0.5 - t // light neutral
    else dev = 0 // high-flat (55)
    out.push(dev)
  }
  // Center on the mean so the target and the learner's contour (also mean-zero)
  // are compared on the same axis — keeps the score and the plot consistent.
  const m = out.reduce((s, v) => s + v, 0) / out.length
  return out.map((v) => v - m)
}

// The learner's syllable as semitone deviations from its own mean, resampled to
// `n` points so it can be drawn against a tone target on the same axis.
export function syllableContour(sylHz, n = PLOT_N) {
  const voiced = sylHz.filter((f) => Number.isFinite(f) && f > 0)
  if (voiced.length === 0) return new Array(n).fill(0)
  const semis = voiced.map(semitone)
  const m = mean(semis)
  return resampleSeries(semis.map((s) => s - m), n)
}

// Similarity (0..1) of a learner contour to a tone target, both as semitone
// deviations from their own mean: 1 minus their RMS gap, normalized by
// SIM_TOL_ST. This is the distance between the two curves drawn in the
// comparison plot, so the score matches the picture — and it is magnitude-aware,
// so a barely-moving contour does not match a strong rise/fall.
function toneSimilarity(user, target) {
  const n = Math.min(user.length, target.length)
  let sum = 0
  for (let i = 0; i < n; i++) {
    const d = user[i] - target[i]
    sum += d * d
  }
  const rms = Math.sqrt(sum / n)
  return clamp01(1 - rms / SIM_TOL_ST)
}

// Score one syllable (voiced Hz) against an expected tone (1-5) by comparing its
// pitch contour to the canonical tone targets — the same shapes drawn in the
// comparison plot. `detected` is whichever target it matches best.
export function scoreSyllable(sylHz, expectedTone) {
  const voiced = sylHz.filter((f) => Number.isFinite(f) && f > 0)
  if (voiced.length < MIN_VOICED) return { score: 0, detected: 0 }
  const user = syllableContour(sylHz)

  const sims = {}
  for (const t of [1, 2, 3, 4, 5]) sims[t] = toneSimilarity(user, toneTarget(t))
  let detected = 1
  for (const t of [2, 3, 4, 5]) if (sims[t] > sims[detected]) detected = t
  return { score: clamp01(sims[expectedTone] ?? 0), detected }
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
  const syllables = expectedTones.map((tone, i) => {
    const r = scoreSyllable(segs[i], tone)
    return {
      score: clamp01(r.score ** gamma),
      detected: r.detected,
      contour: syllableContour(segs[i]),
      target: toneTarget(tone)
    }
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
