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

// Kept alive so the in-flight utterance can't be garbage-collected before the
// engine finishes speaking it. SpeechSynthesisUtterance is a classic trap: a
// local variable going out of scope when the calling function returns is not
// enough to guarantee it survives — event listeners attached to it don't
// necessarily count as a keep-alive reference in every engine either.
let currentUtterance = null

function utterAndSpeak(text, rate, onStatus) {
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  currentUtterance = utter
  utter.lang = 'zh-CN'
  utter.rate = rate
  // getVoices() may still be empty here (it can take a moment to populate,
  // and on some devices the voiceschanged event that would tell us it's
  // ready never fires at all). That's fine — utter.lang alone is usually
  // enough for the platform to pick a reasonable default. What matters more
  // is not waiting: see the note in speak() below.
  const voice = pickChineseVoice()
  if (voice) utter.voice = voice

  utter.onend = () => {
    // Release the keep-alive reference once this utterance is genuinely
    // done, but only if a newer speak() call hasn't already replaced it.
    if (currentUtterance === utter) currentUtterance = null
  }
  utter.onerror = (ev) => {
    if (currentUtterance === utter) currentUtterance = null
    // "canceled"/"interrupted" fire whenever our own cancel() above cuts off
    // a still-playing previous utterance (e.g. tapping play again quickly) —
    // routine, not a failure worth reporting.
    if (ev.error === 'canceled' || ev.error === 'interrupted') return
    if (onStatus) onStatus(`Speech synthesis error: ${ev.error}`)
  }
  synth.speak(utter)
  // Chrome sometimes leaves the synthesizer paused after cancel()/on load, so
  // the utterance queues but never plays; resume() kicks it off.
  synth.resume()
}

// Speak `text` in Mandarin at `rate` (1 = normal; lower is slower), falling
// back to the platform's default zh-CN voice when no preferred Chinese voice
// is installed/loaded yet. `onStatus`, if given, is called with a short
// diagnostic string for anything unusual (not on the ordinary success path)
// — e.g. wire it to a visible status line.
//
// Always calls speechSynthesis.speak() synchronously, in the same tick as
// the call to speak() itself — never after an await, a timeout, or a
// voiceschanged event. iOS requires speak() to run inside the original user
// gesture, exactly like this codebase's AudioContext handling already has to
// (see pitch.js); calling it from an async callback doesn't error, it just
// produces no sound, which is far more confusing to debug than picking a
// worse (or no) voice on an occasional first call before the voice list has
// loaded.
export function speak(text, rate = 0.85, onStatus) {
  if (!speechSupported()) {
    if (onStatus) onStatus('Speech synthesis not supported in this browser.')
    return
  }
  window.speechSynthesis.cancel()
  utterAndSpeak(text, rate, onStatus)
}
