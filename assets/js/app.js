// The ?v= token must match index.html so the whole module graph is refetched
// together when a deploy changes it; bump both on every deploy.
import { HSK1 } from '../data/hsk1.js?v=20260630g'
import { HSK1_EXAMPLES } from '../data/hsk1-examples.js?v=20260630g'
import { el, clear } from './dom.js?v=20260630g'
import { speak, speechSupported } from './speech.js?v=20260630g'
import { recordPitchContour, microphoneSupported, primeAudio } from './pitch.js?v=20260630g'
import { scoreWord, TONE_NAMES } from './tone.js?v=20260630g'
import { createQuiz } from './quiz.js?v=20260630g'

// Playback rates. speak()'s default (0.85) is "normal"; Slow is well below it
// so the contrast is clearly audible even on voices that compress the range.
const SLOW_RATE = 0.4

// A tone score at or above this percent counts as acceptable ("mastered").
const ACCEPT_PERCENT = 70

// Visible build stamp. The footer placeholder says "stale cache" until this
// line runs, so the badge proves the current app.js actually executed.
const BUILD = '20260630g · tone-scoring-v2'
const buildEl = document.getElementById('build')
if (buildEl) buildEl.textContent = BUILD

const app = document.getElementById('app')
const quiz = createQuiz(HSK1)
// Hanzi of words pronounced acceptably this session (best attempt counts).
const mastered = new Set()
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
  const progressText = `Word ${position} of ${total}` +
    (mastered.size ? ` · ✓ ${mastered.size} mastered` : '')
  app.append(
    el('p', { class: 'progress', text: progressText }),
    el('div', { class: 'card', id: 'word-card' }, [
      el('div', { class: 'hanzi', text: word.hanzi }),
      el('div', { class: 'pinyin', text: word.pinyin }),
      el('div', { class: 'english', text: word.en })
    ]),
    el('div', { class: 'controls' }, [
      el('button', { class: 'btn', text: '▶️ Play', onclick: () => speak(word.hanzi) }),
      el('button', { class: 'btn ghost', text: '🐢 Slow', onclick: () => speak(word.hanzi, SLOW_RATE) }),
      el('button', { class: 'btn ghost', text: '💬 Sentence', onclick: () => playSentence(word) })
    ]),
    el('div', { class: 'controls' }, [
      el('button', { class: 'btn record', text: '🎤 Hold to record', id: 'record-btn' })
    ]),
    el('div', { class: 'meter', id: 'meter' }, [
      el('div', { class: 'meter-bar', id: 'meter-bar' })
    ]),
    el('div', { class: 'example', id: 'example' }),
    el('div', { class: 'feedback', id: 'feedback' }),
    el('div', { class: 'controls' }, [
      el('button', { class: 'btn ghost', text: 'Next →', onclick: () => nextWord() })
    ])
  )
  wireRecordButton(word)
  // Play the word automatically when it appears (after the first user gesture;
  // browsers may suppress the very first utterance until the page is tapped).
  speak(word.hanzi)
}

function wireRecordButton(word) {
  const btn = document.getElementById('record-btn')

  async function start(ev) {
    ev.preventDefault()
    if (recorder) return
    // Hold the pointer captured on the button so the release fires here even
    // if the finger/cursor drifts off — avoids a premature stop and the
    // accidental text selection that made some presses register as misses.
    if (ev.pointerId !== undefined && btn.setPointerCapture) {
      btn.setPointerCapture(ev.pointerId)
    }
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

  // Pointer events unify mouse/touch and, with pointer capture above, deliver
  // the release reliably; pointercancel covers interruptions (e.g. a call).
  btn.addEventListener('pointerdown', start)
  btn.addEventListener('pointerup', stop)
  btn.addEventListener('pointercancel', stop)
}

// Show the example sentence for a word (hanzi + pinyin + English) and speak it.
function playSentence(word) {
  const box = document.getElementById('example')
  if (!box) return
  clear(box)
  box.className = 'example shown'
  const ex = HSK1_EXAMPLES[word.hanzi]
  if (!ex) {
    box.append(el('p', { class: 'ex-en', text: 'No example sentence for this word yet.' }))
    return
  }
  box.append(
    el('div', { class: 'ex-hanzi', text: ex.hanzi }),
    el('div', { class: 'ex-pinyin', text: ex.pinyin }),
    el('div', { class: 'ex-en', text: ex.en })
  )
  speak(ex.hanzi)
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
  if (voiced < word.tones.length * 3) {
    setFeedback(
      'Too quiet or too short — try speaking the whole word. ' +
        `(frames ${frames}, peak ${peak.toFixed(3)}, voiced ${voiced})`,
      'error'
    )
    return
  }
  const result = scoreWord(contour, word.tones)
  const percent = scorePercent(result.overall)
  showResult(word, result, percent)
}

function showResult(word, result, percent) {
  quiz.setScore(result.overall)
  const passed = percent >= ACCEPT_PERCENT
  if (passed) mastered.add(word.hanzi)

  // Score-driven visual: ring the word card green on an acceptable attempt,
  // red otherwise, so the result is obvious without reading the numbers.
  const card = document.getElementById('word-card')
  if (card) {
    card.classList.toggle('pass', passed)
    card.classList.toggle('fail', !passed)
  }

  const feedback = document.getElementById('feedback')
  clear(feedback)
  feedback.className = `feedback shown ${passed ? 'pass' : 'fail'}`

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
    el('div', {
      class: 'pass-badge',
      text: passed ? '✓ Acceptable — tone mastered' : '↻ Not quite — try again'
    }),
    el('ul', { class: 'syllables' }, rows)
  )
}

function setFeedback(message, kind) {
  const feedback = document.getElementById('feedback')
  clear(feedback)
  feedback.className = `feedback shown ${kind}`
  feedback.append(el('p', { text: message }))
}

// Move to the next word. The current word's score (if any) was already
// recorded in showResult, so this only advances.
function nextWord() {
  quiz.advance()
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
      el('p', { class: 'pass-badge', text: `✓ ${mastered.size} tones mastered` }),
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
