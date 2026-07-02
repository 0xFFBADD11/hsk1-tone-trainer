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

function utterAndSpeak(text, rate) {
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = rate
  const voice = pickChineseVoice()
  if (voice) utter.voice = voice
  synth.speak(utter)
  // Chrome sometimes leaves the synthesizer paused after cancel()/on load, so
  // the utterance queues but never plays; resume() kicks it off.
  synth.resume()
}

// Speak `text` in Mandarin at `rate` (1 = normal; lower is slower). If no voice
// list is available yet, wait once for `voiceschanged`; otherwise speak now,
// falling back to the browser's default zh-CN voice when no Chinese voice is
// installed.
export function speak(text, rate = 0.85) {
  if (!speechSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()

  if (synth.getVoices().length > 0) {
    utterAndSpeak(text, rate)
    return
  }
  synth.addEventListener('voiceschanged', function once() {
    synth.removeEventListener('voiceschanged', once)
    utterAndSpeak(text, rate)
  })
}
