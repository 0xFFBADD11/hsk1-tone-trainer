// The ?v= token must match index.html so the whole module graph is refetched
// together when a deploy changes it; bump both on every deploy.
import { HSK1 } from '../data/hsk1.js?v=20260630b'
import { el, clear } from './dom.js?v=20260630b'
import { speak, speechSupported } from './speech.js?v=20260630b'
import { recordPitchContour, microphoneSupported, primeAudio } from './pitch.js?v=20260630b'
import { toSemitones, scoreWord, TONE_NAMES } from './tone.js?v=20260630b'
import { createQuiz } from './quiz.js?v=20260630b'

// Visible build stamp. The footer placeholder says "stale cache" until this
// line runs, so the badge proves the current app.js actually executed.
const BUILD = '20260630b · mic-fix'
const buildEl = document.getElementById('build')
if (buildEl) buildEl.textContent = BUILD

const app = document.getElementById('app')
const quiz = createQuiz(HSK1)
let recorder = null

function scorePercent(score) {
  return Math.round(score * 100)
}

function verdict(percent) {
  if (percent >= 80) return '✅ Excellent tones'
  if (percent >= 60) return '🟡 Close — keep practicing'
  return '🔴 Tones need work'
}

function renderWord() {
  const word = quiz.current()
  if (!word) return renderSummary()
  const { position, total } = quiz.progress()

  clear(app)
  app.append(
    el('p', { class: 'progress', text: `Word ${position} of ${total}` }),
    el('div', { class: 'card' }, [
      el('div', { class: 'hanzi', text: word.hanzi }),
      el('div', { class: 'pinyin', text: word.pinyin }),
      el('div', { class: 'english', text: word.en })
    ]),
    el('div', { class: 'controls' }, [
      el('button', { class: 'btn', text: '🔊 Listen', onclick: () => speak(word.hanzi) }),
      el('button', { class: 'btn record', text: '🎤 Hold to record', id: 'record-btn' })
    ]),
    el('div', { class: 'meter', id: 'meter' }, [
      el('div', { class: 'meter-bar', id: 'meter-bar' })
    ]),
    el('div', { class: 'feedback', id: 'feedback' }),
    el('div', { class: 'controls' }, [
      el('button', { class: 'btn ghost', text: 'Skip →', onclick: () => advance(0) })
    ])
  )
  wireRecordButton(word)
}

function wireRecordButton(word) {
  const btn = document.getElementById('record-btn')

  async function start(ev) {
    ev.preventDefault()
    if (recorder) return
    // Must run synchronously inside the gesture, before any await, or iOS
    // Safari refuses to start the audio context.
    primeAudio()
    setFeedback('Recording… release to score', 'info')
    btn.classList.add('active')
    try {
      recorder = await recordPitchContour(setMeter)
    } catch {
      recorder = null
      btn.classList.remove('active')
      setMeter(0)
      setFeedback('Microphone access was denied.', 'error')
    }
  }

  async function stop() {
    if (!recorder) return
    btn.classList.remove('active')
    const capture = await recorder.stop()
    recorder = null
    setMeter(0)
    evaluate(word, capture)
  }

  btn.addEventListener('mousedown', start)
  btn.addEventListener('touchstart', start)
  btn.addEventListener('mouseup', stop)
  btn.addEventListener('mouseleave', stop)
  btn.addEventListener('touchend', stop)
}

// Drive the live mic meter. RMS for speech sits around 0.05–0.2, so a square
// root scale gives the bar visible travel without saturating immediately.
function setMeter(level) {
  const bar = document.getElementById('meter-bar')
  if (!bar) return
  const pct = Math.min(100, Math.round(Math.sqrt(level) * 140))
  bar.style.width = `${pct}%`
}

function evaluate(word, capture) {
  const { contour, frames, voiced, peak } = capture
  const semitones = toSemitones(contour)
  if (semitones.length < word.tones.length * 2) {
    setFeedback(
      'Too quiet or too short — try speaking the whole word. ' +
        `(frames ${frames}, peak ${peak.toFixed(3)}, voiced ${voiced})`,
      'error'
    )
    return
  }
  const result = scoreWord(semitones, word.tones)
  const percent = scorePercent(result.overall)
  showResult(word, result, percent)
}

function showResult(word, result, percent) {
  const feedback = document.getElementById('feedback')
  clear(feedback)
  feedback.className = 'feedback shown'

  const rows = result.syllables.map((syl, i) =>
    el('li', {}, [
      el('span', { class: 'syl', text: word.pinyin.split(' ').join('') }),
      el('span', {
        text: `syllable ${i + 1}: expected ${TONE_NAMES[word.tones[i]]}, ` +
          `heard ${TONE_NAMES[syl.detected]} — ${scorePercent(syl.score)}%`
      })
    ])
  )

  feedback.append(
    el('div', { class: 'score', text: `${percent}%  ${verdict(percent)}` }),
    el('ul', { class: 'syllables' }, rows),
    el('button', { class: 'btn', text: 'Next word →', onclick: () => advance(result.overall) })
  )
}

function setFeedback(message, kind) {
  const feedback = document.getElementById('feedback')
  clear(feedback)
  feedback.className = `feedback shown ${kind}`
  feedback.append(el('p', { text: message }))
}

function advance(score) {
  quiz.record(score)
  if (quiz.isDone()) renderSummary()
  else renderWord()
}

function renderSummary() {
  const { count, average } = quiz.summary()
  clear(app)
  app.append(
    el('div', { class: 'card summary' }, [
      el('h2', { text: 'Session complete' }),
      el('p', { text: `${count} words practiced` }),
      el('p', { class: 'score', text: `Average tone accuracy: ${scorePercent(average)}%` }),
      el('button', { class: 'btn', text: 'Practice again', onclick: () => window.location.reload() })
    ])
  )
}

function renderUnsupported() {
  clear(app)
  app.append(el('div', { class: 'card' }, [
    el('h2', { text: 'Browser not supported' }),
    el('p', { text: 'This trainer needs the Web Speech API and microphone access. Try a recent Chrome, Edge, or Safari.' })
  ]))
}

if (!speechSupported() || !microphoneSupported()) renderUnsupported()
else renderWord()
