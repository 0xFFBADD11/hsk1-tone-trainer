// Main-thread wrapper around the ASR worker, plus target matching. Loading the
// model is a one-time, on-demand cost (opt-in). Tone scoring is unaffected; this
// only adds a segmental "did you say the right syllable" check.

let worker = null
let ready = false

export function pronounceSupported() {
  return typeof Worker !== 'undefined'
}

export function pronounceReady() {
  return ready
}

// Spin up the worker (if needed) and load the model. onProgress receives the
// Transformers.js progress events so the UI can show a download bar.
export function loadModel(onProgress) {
  if (ready) return Promise.resolve()
  if (!worker) {
    worker = new Worker(new URL('./asr-worker.js', import.meta.url), { type: 'module' })
  }
  return new Promise((resolve, reject) => {
    const onMsg = (e) => {
      const m = e.data
      if (m.type === 'progress') {
        if (onProgress) onProgress(m.data)
      } else if (m.type === 'ready') {
        ready = true
        worker.removeEventListener('message', onMsg)
        resolve()
      } else if (m.type === 'error') {
        worker.removeEventListener('message', onMsg)
        reject(new Error(m.message))
      }
    }
    worker.addEventListener('message', onMsg)
    worker.onerror = (err) => reject(new Error(err.message || 'worker failed to start'))
    worker.postMessage({ type: 'load' })
  })
}

// Transcribe 16 kHz mono Float32 audio to Chinese text.
export function transcribe(audio16k) {
  return new Promise((resolve, reject) => {
    if (!ready) {
      reject(new Error('model not loaded'))
      return
    }
    const onMsg = (e) => {
      const m = e.data
      if (m.type === 'result') {
        worker.removeEventListener('message', onMsg)
        resolve(m.text)
      } else if (m.type === 'error') {
        worker.removeEventListener('message', onMsg)
        reject(new Error(m.message))
      }
    }
    worker.addEventListener('message', onMsg)
    worker.postMessage({ type: 'transcribe', audio: audio16k }, [audio16k.buffer])
  })
}

// Compare a Chinese transcription to the target word. Whisper outputs hanzi, so
// we match on how many of the target's characters appear. Returns
// { pass, heard, ratio }. Homophone characters can cause a miss; this is a
// gross-error guard (e.g. "Bay" vs 喂), not a phonetic grader.
export function matchPronunciation(transcription, word) {
  const heard = (transcription || '').replace(/[\s，。！？、,.!?"'’]/g, '')
  const chars = [...word.hanzi]
  const present = chars.filter((c) => heard.includes(c)).length
  const ratio = chars.length ? present / chars.length : 0
  return { pass: ratio >= 0.5, heard, ratio }
}
