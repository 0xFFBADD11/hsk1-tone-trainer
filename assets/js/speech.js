// Pronunciation via the Web Speech API (SpeechSynthesis) with a Mandarin
// voice. No audio files or network calls are needed.

export function speechSupported() {
  return typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance !== 'undefined'
}

function pickChineseVoice() {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((v) => v.lang === 'zh-CN') ||
    voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('zh')) ||
    null
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
