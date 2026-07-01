// PCM helpers for the (optional) on-device pronunciation check. Whisper expects
// 16 kHz mono Float32 audio; the microphone gives us the AudioContext sample
// rate (often 44.1/48 kHz), so we downsample. Pure functions, unit-tested
// without audio hardware. This is separate from tone scoring, which continues to
// use the F0 contour regardless of whether pronunciation checking is enabled.

export const WHISPER_RATE = 16000

// Concatenate an array of Float32 chunks into one contiguous buffer.
export function concatChunks(chunks) {
  let total = 0
  for (const c of chunks) total += c.length
  const out = new Float32Array(total)
  let offset = 0
  for (const c of chunks) {
    out.set(c, offset)
    offset += c.length
  }
  return out
}

// Resample a Float32 PCM buffer from `fromRate` to `toRate` with linear
// interpolation. Adequate for speech recognition preprocessing.
export function resamplePcm(input, fromRate, toRate) {
  if (!(fromRate > 0) || !(toRate > 0) || input.length === 0) return new Float32Array(0)
  if (fromRate === toRate) return input.slice()
  const ratio = fromRate / toRate
  const outLen = Math.max(1, Math.round(input.length / ratio))
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio
    const lo = Math.floor(pos)
    const hi = Math.min(input.length - 1, lo + 1)
    const frac = pos - lo
    out[i] = input[lo] * (1 - frac) + input[hi] * frac
  }
  return out
}

// Prepare captured microphone audio for Whisper: concatenate the chunks and
// resample to 16 kHz mono.
export function toWhisperInput(chunks, sourceRate) {
  return resamplePcm(concatChunks(chunks), sourceRate, WHISPER_RATE)
}
