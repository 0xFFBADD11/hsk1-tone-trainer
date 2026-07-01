// The ?v= token must match index.html so the whole module graph is refetched
// together when a deploy changes it; bump both on every deploy.
import { HSK1 } from '../data/hsk1.js?v=20260630p'
import { HSK1_EXAMPLES } from '../data/hsk1-examples.js?v=20260630p'
import { el, clear } from './dom.js?v=20260630p'
import { speak, speechSupported } from './speech.js?v=20260630p'
import { recordPitchContour, microphoneSupported, primeAudio } from './pitch.js?v=20260630p'
import { scoreWord, TONE_NAMES } from './tone.js?v=20260630p'
import { createQuiz } from './quiz.js?v=20260630p'
import { toWhisperInput } from './audio.js?v=20260630p'
import { pronounceSupported, pronounceReady, loadModel, transcribe, matchPronunciation } from './pronounce.js?v=20260630p'

// Playback rates. speak()'s default (0.85) is "normal"; Slow is well below it
// so the contrast is clearly audible even on voices that compress the range.
const SLOW_RATE = 0.4

// A tone score at or above this percent counts as acceptable ("mastered").
const ACCEPT_PERCENT = 70

// Pitch-overlay plot size (CSS px) and vertical scale (full height = this many
// semitones of pitch movement, centered on each contour's mean).
const PLOT_W = 150
const PLOT_H = 80
const PLOT_SPAN_ST = 12

// Selectable strictness. `gamma` shapes the scoring curve (see scoreWord);
// lower = more forgiving. Native (default) lets a fluent speaker score near
// the top while staying encouraging for learners.
const STRICTNESS = {
  native: { label: 'Native', gamma: 0.45 },
  solid: { label: 'Solid', gamma: 0.8 },
  strict: { label: 'Strict', gamma: 1.6 }
}

function loadStrictness() {
  try {
    const v = window.localStorage.getItem('strictness')
    if (v && STRICTNESS[v]) return v
  } catch {
    // localStorage may be unavailable (private mode); fall through to default.
  }
  return 'native'
}

let strictness = loadStrictness()

function setStrictness(level) {
  if (!STRICTNESS[level]) return
  strictness = level
  try {
    window.localStorage.setItem('strictness', level)
  } catch {
    // Non-fatal: the choice just won't persist across reloads.
  }
  const box = document.getElementById('strictness')
  if (!box) return
  for (const btn of box.querySelectorAll('.chip')) {
    btn.classList.toggle('active', btn.dataset.level === level)
  }
}

// Visible build stamp. The footer placeholder says "stale cache" until this
// line runs, so the badge proves the current app.js actually executed.
const BUILD = '20260630p · local-model'
const buildEl = document.getElementById('build')
if (buildEl) buildEl.textContent = BUILD

const app = document.getElementById('app')
const quiz = createQuiz(HSK1)
// Hanzi of words pronounced acceptably this session (best attempt counts).
const mastered = new Set()
let recorder = null

// Opt-in on-device pronunciation check (Whisper). Off unless the user enables it.
let pronounceEnabled = loadPronPref()

function loadPronPref() {
  try {
    return window.localStorage.getItem('pron') === '1'
  } catch {
    return false
  }
}

function scorePercent(score) {
  return Math.round(score * 100)
}

function verdict(percent) {
  if (percent >= 80) return '✅ Excellent tones'
  if (percent >= 60) return '🟡 Close — keep practicing'
  return '🔴 Tones need work'
}

// Equal-size playback button: just the icon, with the description as a hover
// tooltip (title) and an accessible label.
function iconBtn(icon, label, onclick) {
  return el('button', { class: 'btn icon', title: label, 'aria-label': label, text: icon, onclick })
}

// Strictness selector, rendered at the bottom of the practice view.
function renderStrictness() {
  return el('div', { class: 'strictness', id: 'strictness' }, [
    el('span', { class: 'strictness-label', text: 'Strictness' }),
    ...Object.keys(STRICTNESS).map((key) =>
      el('button', {
        class: `chip ${key === strictness ? 'active' : ''}`,
        'data-level': key,
        text: STRICTNESS[key].label,
        onclick: () => setStrictness(key)
      })
    )
  ])
}

// Opt-in pronunciation toggle. Shown only where Web Workers are available.
function renderPronToggle() {
  if (!pronounceSupported()) return null
  return el('div', { class: 'pron', id: 'pron' }, [
    el('button', {
      class: `chip pron-chip ${pronounceEnabled ? 'active' : ''}`,
      id: 'pron-chip',
      text: '🗣 Check pronunciation',
      onclick: () => togglePronunciation()
    }),
    el('span', { class: 'pron-status', id: 'pron-status', text: pronounceEnabled && pronounceReady() ? 'ready' : '' })
  ])
}

function setPronStatus(text) {
  const s = document.getElementById('pron-status')
  if (s) s.textContent = text
}

function updatePronChip() {
  const chip = document.getElementById('pron-chip')
  if (chip) chip.classList.toggle('active', pronounceEnabled)
}

async function togglePronunciation() {
  pronounceEnabled = !pronounceEnabled
  try {
    window.localStorage.setItem('pron', pronounceEnabled ? '1' : '')
  } catch {
    // Non-fatal: preference just won't persist.
  }
  updatePronChip()
  if (!pronounceEnabled) {
    setPronStatus('')
    return
  }
  if (pronounceReady()) {
    setPronStatus('ready')
    return
  }
  setPronStatus('downloading model… (one time)')
  try {
    await loadModel((p) => {
      if (p && p.status === 'progress' && p.file) {
        setPronStatus(`downloading ${p.file} ${Math.round(p.progress || 0)}%`)
      }
    })
    setPronStatus('ready')
  } catch (e) {
    pronounceEnabled = false
    updatePronChip()
    setPronStatus(`failed: ${e.message}`)
  }
}

// Fill the top bar: prominent word count and a green mastered badge.
function fillTopbar(node) {
  if (!node) return
  clear(node)
  const { position, total } = quiz.progress()
  node.append(el('span', { class: 'progress-count', text: `Word ${position} / ${total}` }))
  if (mastered.size) {
    node.append(el('span', { class: 'mastered-badge', text: `✓ ${mastered.size} mastered` }))
  }
}

// Fill the side word list: attempted words with their best percent, lowest
// (most practice needed) first, clickable to jump back to that word.
function fillWordList(node) {
  if (!node) return
  clear(node)
  const attempts = quiz.attempts()
  node.append(el('h3', { class: 'wordlist-title', text: 'Needs practice' }))
  if (attempts.length === 0) {
    node.append(el('p', { class: 'wordlist-empty', text: 'Scored words appear here, lowest first.' }))
    return
  }
  const cur = quiz.currentIndex()
  const items = el('div', { class: 'wordlist-items' })
  for (const a of attempts) {
    const pct = scorePercent(a.score)
    const ok = pct >= ACCEPT_PERCENT
    const tip = `${a.word.pinyin} — ${a.word.en}`
    items.append(el('button', {
      class: `wl-item ${ok ? 'good' : 'bad'} ${a.index === cur ? 'current' : ''}`,
      title: tip,
      'aria-label': `${a.word.hanzi}, ${tip}, ${pct}%`,
      onclick: () => jumpTo(a.index)
    }, [
      el('span', { class: 'wl-hanzi', text: a.word.hanzi }),
      el('span', { class: 'wl-pct', text: `${pct}%` })
    ]))
  }
  node.append(items)
}

// When returning to a word that was already scored, restore its result status:
// ring the card and note the best percent so far.
function showBest(best) {
  const pct = scorePercent(best)
  const passed = pct >= ACCEPT_PERCENT
  const card = document.getElementById('word-card')
  if (card) {
    card.classList.toggle('pass', passed)
    card.classList.toggle('fail', !passed)
  }
  const fb = document.getElementById('feedback')
  if (!fb) return
  clear(fb)
  fb.className = 'feedback shown'
  fb.append(el('p', { class: 'best-note', text: `Best so far: ${pct}%  ${verdict(pct)}` }))
}

function renderWord() {
  const word = quiz.current()
  if (!word) return renderSummary()

  clear(app)
  const backAttrs = { class: 'btn ghost back', text: '← Back', onclick: () => prevWord() }
  if (quiz.currentIndex() === 0) backAttrs.disabled = 'disabled'

  const practice = el('div', { class: 'practice' }, [
    el('div', { class: 'topbar', id: 'topbar' }),
    el('div', { class: 'practice-grid' }, [
      el('div', { class: 'card', id: 'word-card' }, [
        el('div', { class: 'hanzi', text: word.hanzi }),
        el('div', { class: 'pinyin', text: word.pinyin }),
        el('div', { class: 'english', text: word.en })
      ]),
      el('div', { class: 'col-right' }, [
        el('div', { class: 'controls playback' }, [
          iconBtn('▶️', 'Play', () => speak(word.hanzi)),
          iconBtn('🐢', 'Play slowly', () => speak(word.hanzi, SLOW_RATE)),
          iconBtn('💬', 'Example sentence', () => playSentence(word))
        ]),
        el('div', { class: 'controls' }, [
          el('button', { class: 'btn record', text: '🎤 Hold to record', id: 'record-btn' })
        ]),
        el('div', { class: 'meter', id: 'meter' }, [
          el('div', { class: 'meter-bar', id: 'meter-bar' })
        ]),
        el('div', { class: 'controls nav' }, [
          el('button', backAttrs),
          el('button', { class: 'btn ghost next', text: 'Next →', onclick: () => nextWord() })
        ])
      ])
    ]),
    el('div', { class: 'example', id: 'example' }),
    el('div', { class: 'feedback', id: 'feedback' }),
    renderStrictness(),
    renderPronToggle()
  ])

  app.append(el('div', { class: 'layout' }, [
    practice,
    el('aside', { class: 'wordlist', id: 'wordlist' })
  ]))
  fillTopbar(document.getElementById('topbar'))
  fillWordList(document.getElementById('wordlist'))
  wireRecordButton(word)

  // Restore the prior result if this word was already scored this session.
  const best = quiz.scoreAt(quiz.currentIndex())
  if (best !== undefined) showBest(best)

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
      recorder = await recordPitchContour(setMeter, { captureAudio: pronounceEnabled && pronounceReady() })
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

function cssVar(name) {
  return window.getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#fff'
}

// Draw the target tone shape (dashed) and the learner's contour (solid) on a
// canvas. Both are semitone deviations from their own mean, so the comparison is
// about tone shape, not absolute pitch height.
function drawPlot(canvas, contour, target) {
  const dpr = window.devicePixelRatio || 1
  canvas.width = PLOT_W * dpr
  canvas.height = PLOT_H * dpr
  canvas.style.width = `${PLOT_W}px`
  canvas.style.height = `${PLOT_H}px`
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(dpr, dpr)

  const y = (dev) => {
    const half = PLOT_H / 2
    const v = Math.max(-1, Math.min(1, dev / (PLOT_SPAN_ST / 2)))
    return half - v * (half - 6)
  }
  const curve = (pts, color, dashed) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.setLineDash(dashed ? [5, 4] : [])
    ctx.beginPath()
    pts.forEach((d, i) => {
      const x = 2 + (i / (pts.length - 1)) * (PLOT_W - 4)
      if (i === 0) ctx.moveTo(x, y(d))
      else ctx.lineTo(x, y(d))
    })
    ctx.stroke()
  }

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, PLOT_H / 2)
  ctx.lineTo(PLOT_W, PLOT_H / 2)
  ctx.stroke()

  curve(target, cssVar('--good'), true)
  curve(contour, cssVar('--accent-soft'), false)
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
  const result = scoreWord(contour, word.tones, STRICTNESS[strictness].gamma)
  const percent = scorePercent(result.overall)
  showResult(word, result, percent)
  checkPronunciation(word, percent, capture)
}

// If pronunciation checking is on, transcribe the captured audio and append a
// pass/fail line; a word is mastered only when tone and pronunciation both pass.
function checkPronunciation(word, percent, capture) {
  if (!pronounceEnabled || !pronounceReady()) return
  if (!capture.audio || capture.audio.length === 0) return
  const fb = document.getElementById('feedback')
  if (fb) fb.append(el('p', { class: 'pron-line', id: 'pron-pending', text: 'Checking pronunciation…' }))
  const pcm = toWhisperInput(capture.audio, capture.sampleRate)
  transcribe(pcm).then((text) => {
    const pending = document.getElementById('pron-pending')
    if (pending) pending.remove()
    const m = matchPronunciation(text, word)
    showPronunciation(m, word)
    if (percent >= ACCEPT_PERCENT && m.pass) {
      mastered.add(word.hanzi)
      fillTopbar(document.getElementById('topbar'))
      fillWordList(document.getElementById('wordlist'))
    }
  }).catch((e) => {
    const pending = document.getElementById('pron-pending')
    if (pending) pending.textContent = `Pronunciation check failed: ${e.message}`
  })
}

function showPronunciation(m, word) {
  const fb = document.getElementById('feedback')
  if (!fb) return
  const text = m.pass
    ? `Pronunciation ✓ — heard “${m.heard || '—'}”`
    : `Pronunciation ✗ — heard “${m.heard || '—'}”, expected ${word.hanzi} (${word.pinyin})`
  fb.append(el('p', { class: `pron-line ${m.pass ? 'good' : 'bad'}`, text }))
}

function showResult(word, result, percent) {
  quiz.setScore(result.overall)
  const passed = percent >= ACCEPT_PERCENT
  // With pronunciation checking on, mastery waits for both tone AND pronunciation
  // (handled in checkPronunciation); otherwise tone alone masters the word.
  const willCheckPron = pronounceEnabled && pronounceReady()
  if (passed && !willCheckPron) mastered.add(word.hanzi)

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

  // Pitch overlay: target tone shape vs the learner's contour, per syllable.
  const plots = el('div', { class: 'plots' })
  const toDraw = []
  result.syllables.forEach((syl, i) => {
    if (!syl.contour || !syl.target) return
    const canvas = el('canvas', { class: 'plot' })
    plots.append(el('div', { class: 'plot-cell' }, [
      canvas,
      el('div', { class: 'plot-label', text: `tone ${word.tones[i]}` })
    ]))
    toDraw.push([canvas, syl])
  })

  feedback.append(
    el('div', { class: 'score', text: `${percent}%  ${verdict(percent)}` }),
    el('div', {
      class: 'pass-badge',
      text: passed ? '✓ Acceptable — tone mastered' : '↻ Not quite — try again'
    }),
    plots,
    el('p', { class: 'plot-legend' }, [
      el('span', { class: 'leg-you', text: '— you' }),
      el('span', { class: 'leg-target', text: '┄ target' })
    ]),
    el('ul', { class: 'syllables' }, rows)
  )
  for (const [canvas, syl] of toDraw) drawPlot(canvas, syl.contour, syl.target)

  // The score just changed: refresh the mastered badge and the word list.
  fillTopbar(document.getElementById('topbar'))
  fillWordList(document.getElementById('wordlist'))
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

// Go back to the previous word; its recorded best score is preserved.
function prevWord() {
  quiz.back()
  renderWord()
}

// Jump to any previously scored word from the word list.
function jumpTo(index) {
  quiz.goTo(index)
  renderWord()
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
