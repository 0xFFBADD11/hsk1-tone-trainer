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
  return new Promise((resolve, reject) => {
    if (!worker) {
      try {
        // Carry this module's ?v= cache-bust onto the worker URL so a deploy
        // actually loads the new worker instead of a cached copy.
        const workerUrl = new URL('./asr-worker.js', import.meta.url)
        workerUrl.search = new URL(import.meta.url).search
        worker = new Worker(workerUrl, { type: 'module' })
      } catch (err) {
        reject(new Error(`worker failed to start: ${err.message}`))
        return
      }
    }
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

// Keep only Chinese characters from a transcription, dropping English,
// punctuation, digits and spaces. Whisper sometimes transcribes background
// English (a radio, etc.) even with Chinese forced; this ignores all of that.
export function cleanHeard(transcription) {
  return (transcription || '').replace(/[^一-鿿]/g, '')
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
  if (heardSyllables.length <= k) {
    return {
      closeness: pronunciationCloseness(expectedPinyin, heardSyllables.join('')),
      matched: heardSyllables.join(''),
      start: 0,
      length: heardSyllables.length
    }
  }
  let best = { closeness: -1, matched: '', start: 0, length: k }
  for (let i = 0; i + k <= heardSyllables.length; i++) {
    const joined = heardSyllables.slice(i, i + k).join('')
    const c = pronunciationCloseness(expectedPinyin, joined)
    if (c > best.closeness) best = { closeness: c, matched: joined, start: i, length: k }
  }
  return best
}
