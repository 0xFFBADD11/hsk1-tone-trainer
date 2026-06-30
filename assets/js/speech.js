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

// Speak `text` in Mandarin at `rate` (1 = normal; lower is slower). Voices can
// load asynchronously, so retry once after the voiceschanged event if none are
// ready yet.
export function speak(text, rate = 0.85) {
  if (!speechSupported()) return
  window.speechSynthesis.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'zh-CN'
  utter.rate = rate

  const voice = pickChineseVoice()
  if (voice) {
    utter.voice = voice
    window.speechSynthesis.speak(utter)
    return
  }
  window.speechSynthesis.addEventListener('voiceschanged', function once() {
    window.speechSynthesis.removeEventListener('voiceschanged', once)
    const ready = pickChineseVoice()
    if (ready) utter.voice = ready
    window.speechSynthesis.speak(utter)
  })
}
