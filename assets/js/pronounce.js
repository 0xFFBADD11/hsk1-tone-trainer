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

// Strip punctuation/whitespace from a transcription.
export function cleanHeard(transcription) {
  return (transcription || '').replace(/[\s，。！？、,.!?"'’“”]/g, '')
}

// Reduce pinyin to its segmental letters only — no tone marks, spaces, or
// apostrophes — lowercased. Tone is scored separately, so we compare sounds.
export function tonelessPinyin(pinyin) {
  return (pinyin || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z]/g, '')
    .toLowerCase()
}

function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
    }
    prev = cur
  }
  return prev[n]
}

// Phonetic closeness 0..1 between expected and heard pinyin, tones ignored. A
// near miss (wei vs bei — one sound off) scores high; a different word (wei vs
// hao) scores low. This grades "how close" rather than a hard match.
export function pronunciationCloseness(expectedPinyin, heardPinyin) {
  const a = tonelessPinyin(expectedPinyin)
  const b = tonelessPinyin(heardPinyin)
  if (!a && !b) return 1
  if (!a || !b) return 0
  return Math.max(0, 1 - levenshtein(a, b) / Math.max(a.length, b.length))
}

// Given a sentence transcription split into per-syllable pinyin, find the window
// of `targetSyllableCount` syllables that best matches the expected word, and
// return its closeness and the matched pinyin. This rates a target word from a
// full-sentence reading, where Whisper is far more reliable than on a lone
// syllable.
export function bestWindowCloseness(heardSyllables, expectedPinyin, targetSyllableCount) {
  const k = Math.max(1, targetSyllableCount || 1)
  const windows = []
  if (heardSyllables.length <= k) {
    windows.push(heardSyllables.join(''))
  } else {
    for (let i = 0; i + k <= heardSyllables.length; i++) {
      windows.push(heardSyllables.slice(i, i + k).join(''))
    }
  }
  let best = { closeness: 0, matched: '' }
  for (const w of windows) {
    const c = pronunciationCloseness(expectedPinyin, w)
    if (c > best.closeness) best = { closeness: c, matched: w }
  }
  return best
}
