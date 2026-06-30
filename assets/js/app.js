import { HSK1 } from '../data/hsk1.js'
import { el, clear } from './dom.js'
import { speak, speechSupported } from './speech.js'
import { recordPitchContour, microphoneSupported } from './pitch.js'
import { toSemitones, scoreWord, TONE_NAMES } from './tone.js'
import { createQuiz } from './quiz.js'

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
    setFeedback('Recording… release to score', 'info')
    btn.classList.add('active')
    try {
      recorder = await recordPitchContour()
    } catch {
      recorder = null
      btn.classList.remove('active')
      setFeedback('Microphone access was denied.', 'error')
    }
  }

  async function stop() {
    if (!recorder) return
    btn.classList.remove('active')
    const contour = await recorder.stop()
    recorder = null
    evaluate(word, contour)
  }

  btn.addEventListener('mousedown', start)
  btn.addEventListener('touchstart', start)
  btn.addEventListener('mouseup', stop)
  btn.addEventListener('mouseleave', stop)
  btn.addEventListener('touchend', stop)
}

function evaluate(word, contour) {
  const semitones = toSemitones(contour)
  if (semitones.length < word.tones.length * 2) {
    setFeedback('Too quiet or too short — try speaking the whole word.', 'error')
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
