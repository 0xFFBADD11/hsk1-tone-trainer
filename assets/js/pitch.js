// Microphone capture and fundamental-frequency (F0) extraction. The pitch
// detector uses peak-finding autocorrelation with parabolic interpolation on
// short time-domain frames, which is robust enough for single-speaker tone
// practice. Audio never leaves the browser.

const SAMPLE_FRAMES = 2048
const MIN_HZ = 70
const MAX_HZ = 500
const MIN_RMS = 0.01
// The autocorrelation peak at the fundamental period must be at least this
// fraction of the zero-lag frame energy to count as voiced. A raw amplitude
// threshold (the previous approach) never fired for real speech.
const PEAK_RATIO = 0.2

// Older iOS Safari exposes the constructor only as webkitAudioContext. Guard
// the window reference so this module can also be imported under Node for
// unit tests and fuzzing (detectPitch itself needs no browser globals).
const AudioCtx = typeof window !== 'undefined'
  ? window.AudioContext || window.webkitAudioContext
  : null

// A single AudioContext is created+resumed synchronously on the first tap and
// reused across recordings; see primeAudio.
let primedCtx = null

export function microphoneSupported() {
  return Boolean(
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    AudioCtx
  )
}

function rms(buffer) {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i]
  return Math.sqrt(sum / buffer.length)
}

// Detect F0 (Hz) in one Float32 time-domain frame, or 0 if the frame is too
// quiet or has no clear periodicity.
export function detectPitch(buffer, sampleRate) {
  const n = buffer.length
  if (n < 2 || !Number.isFinite(sampleRate) || sampleRate <= 0) return 0

  let energy = 0
  for (let i = 0; i < n; i++) energy += buffer[i] * buffer[i]
  if (Math.sqrt(energy / n) < MIN_RMS) return 0

  const minLag = Math.max(1, Math.floor(sampleRate / MAX_HZ))
  const maxLag = Math.min(Math.floor(sampleRate / MIN_HZ), n - 1)
  if (maxLag <= minLag) return 0

  const corr = new Float32Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0
    for (let i = 0; i < n - lag; i++) sum += buffer[i] * buffer[i + lag]
    corr[lag] = sum
  }

  // Skip the descending shoulder near lag 0, then take the strongest peak —
  // that lag is the fundamental period.
  let lag = minLag
  while (lag < maxLag && corr[lag] > corr[lag + 1]) lag++

  let bestLag = -1
  let bestCorr = 0
  for (; lag <= maxLag; lag++) {
    if (corr[lag] > bestCorr) {
      bestCorr = corr[lag]
      bestLag = lag
    }
  }
  if (bestLag <= 0 || bestCorr < PEAK_RATIO * energy) return 0

  // Parabolic interpolation around the integer peak for sub-sample accuracy.
  // The true peak of a parabola through three points lies within ±0.5 of the
  // center, so clamping keeps the refined lag positive.
  const left = bestLag > minLag ? corr[bestLag - 1] : bestCorr
  const right = bestLag < maxLag ? corr[bestLag + 1] : bestCorr
  const denom = left - 2 * bestCorr + right
  let shift = denom !== 0 ? (0.5 * (left - right)) / denom : 0
  if (shift < -0.5) shift = -0.5
  if (shift > 0.5) shift = 0.5
  return sampleRate / (bestLag + shift)
}

// Create and resume the shared AudioContext. iOS Safari only starts a context
// from inside a user-gesture handler and refuses to start one created after an
// await, so this must be called synchronously on the tap before any await.
export function primeAudio() {
  if (!AudioCtx) return null
  if (!primedCtx) primedCtx = new AudioCtx()
  if (primedCtx.state === 'suspended') primedCtx.resume()
  return primedCtx
}

// Record from the microphone until `stop()` is called, sampling the pitch on
// every animation frame. `onLevel(level)` is invoked each frame with the
// current RMS (0..1) so the UI can drive a live meter. stop() resolves with
// the F0 series plus capture diagnostics { contour, frames, voiced, peak }.
export async function recordPitchContour(onLevel) {
  const ctx = primeAudio() || new AudioCtx()
  if (ctx.state === 'suspended') await ctx.resume()
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = SAMPLE_FRAMES

  // iOS Safari only advances the audio graph once it reaches the destination.
  // Route the analyser through a silent gain node so it actually receives data
  // without making the microphone audible.
  const sink = ctx.createGain()
  sink.gain.value = 0
  source.connect(analyser)
  analyser.connect(sink)
  sink.connect(ctx.destination)

  const frame = new Float32Array(analyser.fftSize)
  const contour = []
  let frames = 0
  let voiced = 0
  let peak = 0
  let running = true
  let rafId = 0

  function tick() {
    if (!running) return
    analyser.getFloatTimeDomainData(frame)
    const level = rms(frame)
    if (level > peak) peak = level
    frames++
    const hz = detectPitch(frame, ctx.sampleRate)
    if (hz > 0) voiced++
    contour.push(hz)
    if (onLevel) onLevel(level)
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  async function stop() {
    running = false
    cancelAnimationFrame(rafId)
    for (const track of stream.getTracks()) track.stop()
    source.disconnect()
    analyser.disconnect()
    sink.disconnect()
    // Keep the primed context open for reuse; only close a throwaway one.
    if (ctx !== primedCtx) await ctx.close()
    return { contour, frames, voiced, peak }
  }

  return { stop }
}
