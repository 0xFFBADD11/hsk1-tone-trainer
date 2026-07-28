// Pronunciation via the Web Speech API (SpeechSynthesis) with a Mandarin
// voice. No audio files or network calls are needed.

export function speechSupported() {
  return typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined'
}

// Rank Chinese voices by naturalness. Google's network voice sounds best;
// Tingting is the standard macOS voice; the character voices (Eddy, Flo,
// Grandma, Rocko, …) are deliberately robotic and rank last.
function voiceRank(v) {
  if (/google/i.test(v.name)) return 3
  if (/^tingting/i.test(v.name)) return 2
  return 1
}

function pickChineseVoice() {
  const voices = window.speechSynthesis.getVoices()
  const zhCN = voices.filter((v) => (v.lang || '').toLowerCase() === 'zh-cn')
  const pool = zhCN.length ? zhCN : voices.filter((v) => (v.lang || '').toLowerCase().startsWith('zh'))
  return pool.slice().sort((a, b) => voiceRank(b) - voiceRank(a))[0] || null
}

// If `getVoices()` is empty, wait this long for `voiceschanged` before giving
// up and trying anyway — iOS Safari has a known history of that event
// sometimes never firing, which would otherwise leave speak() waiting
// forever with no sound and no error.
const VOICES_TIMEOUT_MS = 2000

function utterAndSpeak(text, rate, onStatus) {
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = rate
  const voice = pickChineseVoice()
  if (voice) utter.voice = voice
  else if (onStatus) onStatus('No Chinese voice found on this device — using its default voice.')
  utter.onerror = (ev) => { if (onStatus) onStatus(`Speech synthesis error: ${ev.error}`) }
  synth.speak(utter)
  // Chrome sometimes leaves the synthesizer paused after cancel()/on load, so
  // the utterance queues but never plays; resume() kicks it off.
  synth.resume()
}

// Speak `text` in Mandarin at `rate` (1 = normal; lower is slower). If no voice
// list is available yet, wait once for `voiceschanged` (bounded — see
// VOICES_TIMEOUT_MS); otherwise speak now, falling back to the browser's
// default zh-CN voice when no Chinese voice is installed. `onStatus`, if
// given, is called with a short diagnostic string for anything unusual (not
// on the ordinary success path) — e.g. wire it to a visible status line.
export function speak(text, rate = 0.85, onStatus) {
  if (!speechSupported()) {
    if (onStatus) onStatus('Speech synthesis not supported in this browser.')
    return
  }
  const synth = window.speechSynthesis
  synth.cancel()

  if (synth.getVoices().length > 0) {
    utterAndSpeak(text, rate, onStatus)
    return
  }

  let settled = false
  const timer = setTimeout(() => {
    if (settled) return
    settled = true
    synth.removeEventListener('voiceschanged', onVoicesChanged)
    if (onStatus) onStatus('Voice list never loaded — trying the default voice anyway.')
    utterAndSpeak(text, rate, onStatus)
  }, VOICES_TIMEOUT_MS)
  function onVoicesChanged() {
    if (settled) return
    settled = true
    clearTimeout(timer)
    synth.removeEventListener('voiceschanged', onVoicesChanged)
    utterAndSpeak(text, rate, onStatus)
  }
  synth.addEventListener('voiceschanged', onVoicesChanged)
}
