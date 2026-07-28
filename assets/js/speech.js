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

// How long to wait before reporting the synthesizer's internal state, if
// nothing else (onstart/onend/onerror) already told us something — long
// enough for a short word's audio to plausibly have started and finished.
const STATE_CHECK_MS = 1500

function utterAndSpeak(text, rate, onStatus) {
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = rate
  // getVoices() may still be empty here (it can take a moment to populate,
  // and on some devices the voiceschanged event that would tell us it's
  // ready never fires at all). That's fine — utter.lang alone is usually
  // enough for the platform to pick a reasonable default. What matters more
  // is not waiting: see the note in speak() below.
  const voice = pickChineseVoice()
  if (voice) utter.voice = voice

  // Diagnostic only — reports what the synthesizer itself thinks happened,
  // since "speak() didn't error" turns out not to mean "sound came out".
  // onstart/onend tell us whether the engine ever actually began/finished
  // this utterance; synth.speaking/pending/paused are its state a moment
  // later. Skipped if onerror already reported something more specific.
  let settled = false
  let started = false
  let ended = false
  utter.onstart = () => { started = true }
  utter.onend = () => { ended = true }
  setTimeout(() => {
    if (settled || !onStatus) return
    onStatus(
      `Diag: voice=${voice ? voice.name : '(default)'} started=${started} ended=${ended} ` +
      `speaking=${synth.speaking} pending=${synth.pending} paused=${synth.paused}`
    )
  }, STATE_CHECK_MS)

  utter.onerror = (ev) => {
    // "canceled"/"interrupted" fire whenever our own cancel() above cuts off
    // a still-playing previous utterance (e.g. tapping play again quickly) —
    // routine, not a failure worth reporting.
    if (ev.error === 'canceled' || ev.error === 'interrupted') return
    settled = true
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
