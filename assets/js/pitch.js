// Microphone capture and fundamental-frequency (F0) extraction. The pitch
// detector uses normalized autocorrelation on short time-domain frames,
// which is robust enough for single-speaker tone practice. Audio never
// leaves the browser.

const SAMPLE_FRAMES = 2048
const MIN_HZ = 70
const MAX_HZ = 500
const MIN_RMS = 0.01

// Older iOS Safari exposes the constructor only as webkitAudioContext.
const AudioCtx = window.AudioContext || window.webkitAudioContext

export function microphoneSupported() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && AudioCtx)
}

// Detect F0 (Hz) in one Float32 time-domain frame, or 0 if the frame is
// too quiet or has no clear periodicity.
export function detectPitch(buffer, sampleRate) {
  let rms = 0
  for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i]
  rms = Math.sqrt(rms / buffer.length)
  if (rms < MIN_RMS) return 0

  const maxLag = Math.floor(sampleRate / MIN_HZ)
  const minLag = Math.floor(sampleRate / MAX_HZ)
  let bestLag = -1
  let bestCorr = 0
  let prevCorr = 1

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0
    for (let i = 0; i < buffer.length - lag; i++) {
      corr += buffer[i] * buffer[i + lag]
    }
    corr /= buffer.length - lag
    if (corr > 0.5 && corr > prevCorr && corr > bestCorr) {
      bestCorr = corr
      bestLag = lag
    }
    prevCorr = corr
  }
  if (bestLag <= 0) return 0
  return sampleRate / bestLag
}

// Record from the microphone until `stop()` is called, sampling the pitch
// on every animation frame. Resolves with the collected F0 series (Hz).
export async function recordPitchContour() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const ctx = new AudioCtx()
  if (ctx.state === 'suspended') await ctx.resume()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = SAMPLE_FRAMES
  source.connect(analyser)

  const frame = new Float32Array(analyser.fftSize)
  const contour = []
  let running = true
  let rafId = 0

  function tick() {
    if (!running) return
    analyser.getFloatTimeDomainData(frame)
    contour.push(detectPitch(frame, ctx.sampleRate))
    rafId = requestAnimationFrame(tick)
  }
  rafId = requestAnimationFrame(tick)

  async function stop() {
    running = false
    cancelAnimationFrame(rafId)
    for (const track of stream.getTracks()) track.stop()
    await ctx.close()
    return contour
  }

  return { stop }
}
