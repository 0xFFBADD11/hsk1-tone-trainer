// The ?v= token must match index.html so the whole module graph is refetched
// together when a deploy changes it; bump both on every deploy.
import { HSK1 } from '../data/hsk1.js?v=20260701b'
import { HSK1_EXAMPLES } from '../data/hsk1-examples.js?v=20260701b'
import { el, clear } from './dom.js?v=20260701b'
import { speak, speechSupported } from './speech.js?v=20260701b'
import { recordPitchContour, microphoneSupported, primeAudio } from './pitch.js?v=20260701b'
import { scoreWord, TONE_NAMES } from './tone.js?v=20260701b'
import { createQuiz } from './quiz.js?v=20260701b'
import { toWhisperInput } from './audio.js?v=20260701b'
import { pronounceSupported, pronounceReady, loadModel, transcribe, cleanHeard, tonelessPinyin, bestWindowCloseness } from './pronounce.js?v=20260701b'

// Playback rates. 0.85 is "normal"; Slow mode (a toggle) plays everything well
// below that so the contrast is clearly audible.
const NORMAL_RATE = 0.85
const SLOW_RATE = 0.25

// A tone score at or above this percent counts as acceptable ("mastered").
const ACCEPT_PERCENT = 70

// Shown when the mic is blocked (e.g. accidentally denied) — how to re-enable.
const MIC_HELP = 'Mic blocked. On iPhone: tap “aA” in the address bar → Website Settings → Microphone → Allow, then reload.'

// Pronunciation closeness (0..1) bands: at/above ACCEPT is correct, above NEAR
// is a near miss, below is a different word.
const PRON_ACCEPT = 0.7
const PRON_NEAR = 0.5

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
const BUILD = '20260701b · force-zh-cache-bust'
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
    return window.localStorage.getItem('pron') !== '0'
  } catch {
    return true
  }
}

// Slow-playback toggle: when on, every playback uses the slow rate.
let slowMode = loadSlowPref()

function loadSlowPref() {
  try {
    return window.localStorage.getItem('slow') === '1'
  } catch {
    return false
  }
}

// Speak, honoring the slow toggle. Use this for all playback.
function say(text) {
  speak(text, slowMode ? SLOW_RATE : NORMAL_RATE)
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

// Strictness + toggles (slow playback, pronunciation), grouped at the bottom.
function renderSettings() {
  const children = [
    el('button', {
      class: `chip ${slowMode ? 'active' : ''}`,
      id: 'slow-chip',
      text: '🐢 Slow',
      onclick: () => toggleSlow()
    }),
    renderStrictness()
  ]
  if (pronounceSupported()) {
    children.push(el('button', {
      class: `chip pron-chip ${pronounceEnabled ? 'active' : ''}`,
      id: 'pron-chip',
      text: '🗣 Check pronunciation',
      onclick: () => togglePronunciation()
    }))
  }
  return el('div', { class: 'settings' }, children)
}

function toggleSlow() {
  slowMode = !slowMode
  try {
    window.localStorage.setItem('slow', slowMode ? '1' : '0')
  } catch {
    // Non-fatal: preference just won't persist.
  }
  const chip = document.getElementById('slow-chip')
  if (chip) chip.classList.toggle('active', slowMode)
}

// Status text goes in the subtle footer line, not the practice area.
function setPronStatus(text) {
  const s = document.getElementById('app-status')
  if (s) s.textContent = text
}

function updatePronChip() {
  const chip = document.getElementById('pron-chip')
  if (chip) chip.classList.toggle('active', pronounceEnabled)
}

function togglePronunciation() {
  pronounceEnabled = !pronounceEnabled
  try {
    window.localStorage.setItem('pron', pronounceEnabled ? '1' : '0')
  } catch {
    // Non-fatal: preference just won't persist.
  }
  updatePronChip()
  if (pronounceEnabled) ensurePronModel()
  else setPronStatus('')
}

// Load the model on demand (also called at startup when the toggle defaults on).
function ensurePronModel() {
  if (!pronounceEnabled || !pronounceSupported() || pronounceReady()) return
  setPronStatus('Loading pronunciation model…')
  loadModel((p) => {
    if (p && p.status === 'progress' && p.file) {
      setPronStatus(`Downloading pronunciation model… ${Math.round(p.progress || 0)}%`)
    }
  }).then(() => setPronStatus('Pronunciation model ready')).catch((e) => {
    pronounceEnabled = false
    updatePronChip()
    setPronStatus(`Pronunciation model unavailable: ${e.message}`)
  })
}

// Lazy-load pinyin-pro (from jsDelivr). Returns the pinyin fn or null (offline).
let pinyinFn = null
async function ensurePinyin() {
  if (pinyinFn) return pinyinFn
  try {
    const mod = await import('https://cdn.jsdelivr.net/npm/pinyin-pro@3/+esm')
    pinyinFn = mod.pinyin
  } catch {
    pinyinFn = null
  }
  return pinyinFn
}

// Per-character tone-marked pinyin array; [] on failure so callers degrade.
async function toPinyinArray(hanzi) {
  if (!hanzi) return []
  const fn = await ensurePinyin()
  if (!fn) return []
  try {
    return fn(hanzi, { toneType: 'symbol', type: 'array' })
  } catch {
    return []
  }
}

// Tone-marked pinyin for a whole word (syllables joined, no spaces).
function wordPinyin(word) {
  if (!pinyinFn) return ''
  try {
    return pinyinFn(word, { toneType: 'symbol', type: 'string' }).replace(/\s+/g, '')
  } catch {
    return ''
  }
}

// Segment a sentence into words by greedy longest-match against the HSK1
// vocabulary (so 什么时候 splits into 什么 + 时候, the words the learner knows),
// falling back to single characters for anything not in the list.
const HSK1_SET = new Set(HSK1.map((w) => w.hanzi))
const HSK1_MAXLEN = HSK1.reduce((m, w) => Math.max(m, [...w.hanzi].length), 1)

function segmentSentence(text) {
  const chars = [...text]
  const out = []
  let i = 0
  while (i < chars.length) {
    let matched = ''
    for (let len = Math.min(HSK1_MAXLEN, chars.length - i); len >= 2; len--) {
      const cand = chars.slice(i, i + len).join('')
      if (HSK1_SET.has(cand)) {
        matched = cand
        break
      }
    }
    if (matched) {
      out.push(matched)
      i += [...matched].length
    } else {
      out.push(chars[i])
      i += 1
    }
  }
  return out
}

// Build spans for a Chinese string: each word is one span that plays the whole
// word on click and highlights as a unit on hover, with pinyin + English on
// hover. Call after ensurePinyin() so word pinyin is available. Non-Han runs
// pass through as plain text.
function speakableSpans(text, target = '') {
  const spans = []
  for (const w of segmentSentence(text)) {
    if (!/[一-鿿]/.test(w)) {
      spans.push(el('span', { text: w }))
      continue
    }
    const wp = wordPinyin(w)
    const known = HSK1.find((x) => x.hanzi === w)
    const title = known ? `${wp} — ${known.en}`.trim() : wp
    const cls = w === target ? 'ex-word ex-target' : 'ex-word'
    spans.push(el('span', { class: cls, text: w, title, onclick: () => say(w) }))
  }
  return spans
}

// Render the heard sentence as clickable words with per-character coloring:
// green for characters in the matched target window, red for characters not in
// the expected sentence (mis-heard/extra), neutral for correctly-heard others.
function heardSpans(text, matchStart, matchLen, expectedChars) {
  const spans = []
  const end = matchStart + matchLen
  let idx = 0
  for (const w of segmentSentence(text)) {
    const wchars = [...w]
    if (!/[一-鿿]/.test(w)) {
      spans.push(el('span', { text: w }))
      idx += wchars.length
      continue
    }
    const wp = wordPinyin(w)
    const known = HSK1.find((x) => x.hanzi === w)
    const title = known ? `${wp} — ${known.en}`.trim() : wp
    const start = idx
    const charSpans = wchars.map((ch, j) => {
      let cls = ''
      if (!expectedChars.has(ch)) cls = 'heard-wrong'
      else if (matchLen > 0 && start + j >= matchStart && start + j < end) cls = 'matched-green'
      return el('span', cls ? { class: cls, text: ch } : { text: ch })
    })
    spans.push(el('span', { class: 'ex-word', title, onclick: () => say(w) }, charSpans))
    idx += wchars.length
  }
  return spans
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
// ring the card and note the best percent so far in the tone panel.
function showBest(best) {
  const pct = scorePercent(best)
  const passed = pct >= ACCEPT_PERCENT
  setCardRing(passed)
  const box = document.getElementById('tone-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel shown'
  box.append(el('p', { class: 'best-note', text: `Best so far: ${pct}%  ${verdict(pct)}` }))
}

// The example sentence currently shown (so the shuffle button and the sentence
// record/play can use it without rebuilding their listeners).
let currentExample = null

// Pick a random example sentence for a word (data may be one object or an
// array), optionally avoiding the current one.
function pickExample(word, avoid) {
  const ex = HSK1_EXAMPLES[word.hanzi]
  if (!ex) return null
  const list = Array.isArray(ex) ? ex : [ex]
  if (list.length === 1) return list[0]
  let pick = list[Math.floor(Math.random() * list.length)]
  while (avoid && pick === avoid) pick = list[Math.floor(Math.random() * list.length)]
  return pick
}

// Swap to a different random example sentence in place.
function newSentence(word) {
  const next = pickExample(word, currentExample)
  if (!next) return
  currentExample = next
  const py = document.getElementById('ex-pinyin')
  if (py) py.textContent = next.pinyin
  const en = document.getElementById('ex-en')
  if (en) en.textContent = next.en
  fillSentenceHanzi(word)
  const pron = document.getElementById('pron-result')
  if (pron) {
    clear(pron)
    pron.className = 'score-panel'
  }
}

// A play (▶️) + hold-to-record (🎤) control pair for a panel.
function playRecordControls(playLabel, onPlay, recordId, recordLabel) {
  return el('div', { class: 'controls' }, [
    iconBtn('▶️', playLabel, onPlay),
    el('button', {
      class: 'btn icon record',
      id: recordId,
      title: recordLabel,
      'aria-label': recordLabel,
      text: '🎤'
    })
  ])
}

function renderWord() {
  const word = quiz.current()
  if (!word) return renderSummary()
  currentExample = pickExample(word)
  const ex = currentExample
  const pool = HSK1_EXAMPLES[word.hanzi]
  const canShuffle = Array.isArray(pool) && pool.length > 1

  clear(app)
  const backAttrs = { class: 'btn ghost', text: '← Back', onclick: () => prevWord() }
  if (quiz.currentIndex() === 0) backAttrs.disabled = 'disabled'

  const wordCard = el('div', { class: 'card panel', id: 'word-card' }, [
    el('div', {
      class: 'hanzi word-speak',
      title: `${word.pinyin} — ${word.en}`,
      text: word.hanzi,
      onclick: () => say(word.hanzi)
    }),
    el('div', { class: 'pinyin', text: word.pinyin }),
    el('div', { class: 'english', text: word.en }),
    playRecordControls('Play word', () => say(word.hanzi), 'record-btn', 'Hold to record'),
    el('div', { class: 'meter' }, [el('div', { class: 'meter-bar', id: 'meter-bar' })])
  ])

  const sentenceCard = el('div', { class: 'card panel sentence' }, [
    canShuffle
      ? el('button', { class: 'shuffle', title: 'Another sentence', 'aria-label': 'Another sentence', text: '↻', onclick: () => newSentence(word) })
      : null,
    el('div', { class: 'ex-hanzi', id: 'ex-hanzi' }),
    el('div', { class: 'ex-pinyin', id: 'ex-pinyin', text: ex ? ex.pinyin : '' }),
    el('div', { class: 'ex-en', id: 'ex-en', text: ex ? ex.en : 'No example sentence yet.' }),
    ex ? playRecordControls('Play sentence', () => currentExample && say(currentExample.hanzi), 'sentence-record-btn', 'Hold to read the sentence') : null,
    el('div', { class: 'meter' }, [el('div', { class: 'meter-bar', id: 'sentence-meter-bar' })])
  ])

  app.append(
    el('div', { class: 'topbar', id: 'topbar' }),
    el('div', { class: 'layout' }, [
      el('div', { class: 'practice-cols' }, [
        el('div', { class: 'pair' }, [wordCard, el('div', { class: 'score-panel', id: 'tone-result' })]),
        el('div', { class: 'pair' }, [sentenceCard, el('div', { class: 'score-panel', id: 'pron-result' })]),
        el('div', { class: 'controls nav' }, [
          el('button', backAttrs),
          el('button', { class: 'btn ghost next', text: 'Next →', onclick: () => nextWord() })
        ])
      ]),
      el('aside', { class: 'wordlist', id: 'wordlist' })
    ]),
    renderSettings()
  )

  fillTopbar(document.getElementById('topbar'))
  fillWordList(document.getElementById('wordlist'))
  wireRecordButton(word)
  if (ex) {
    fillSentenceHanzi(word)
    wireSentenceRecord(word)
  }

  const best = quiz.scoreAt(quiz.currentIndex())
  if (best !== undefined) showBest(best)

  // Play the word automatically (blocked before the first gesture on cold load).
  say(word.hanzi)
}

// Fill the sentence hanzi row with clickable words (target word bold).
async function fillSentenceHanzi(word) {
  const row = document.getElementById('ex-hanzi')
  if (!row || !currentExample) return
  await ensurePinyin()
  clear(row)
  for (const span of speakableSpans(currentExample.hanzi, word.hanzi)) row.append(span)
}

function wireRecordButton(word) {
  const btn = document.getElementById('record-btn')
  let pressActive = false

  async function start(ev) {
    ev.preventDefault()
    if (recorder) return
    pressActive = true
    // Hold the pointer captured on the button so the release fires here even
    // if the finger/cursor drifts off — avoids a premature stop and the
    // accidental text selection that made some presses register as misses.
    if (ev.pointerId !== undefined && btn.setPointerCapture) {
      btn.setPointerCapture(ev.pointerId)
    }
    // Must run synchronously inside the gesture, before any await, or iOS
    // Safari refuses to start the audio context.
    primeAudio()
    btn.classList.add('active')
    // Mic startup can lag; don't claim "Recording" until it's actually live.
    setFeedback('Preparing mic…', 'info')
    try {
      recorder = await recordPitchContour(setMeter)
      if (!pressActive) {
        // Released before the mic came up — discard silently.
        await recorder.stop()
        recorder = null
        setMeter(0)
        clearFeedback()
        return
      }
      setFeedback('Recording… release to score', 'info')
    } catch {
      recorder = null
      btn.classList.remove('active')
      setMeter(0)
      setFeedback(MIC_HELP, 'error')
    }
  }

  async function stop() {
    pressActive = false
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

// Hold-to-record the sentence reading, then rate the target word from it.
function wireSentenceRecord(word) {
  const btn = document.getElementById('sentence-record-btn')
  if (!btn) return
  let pressActive = false
  let sentRec = null

  async function start(ev) {
    ev.preventDefault()
    if (sentRec) return
    if (!pronounceEnabled || !pronounceReady()) {
      setSentencePron('Turn on “Check pronunciation” below and let it load first.')
      return
    }
    pressActive = true
    if (ev.pointerId !== undefined && btn.setPointerCapture) btn.setPointerCapture(ev.pointerId)
    primeAudio()
    btn.classList.add('active')
    setSentencePron('Preparing mic…')
    try {
      sentRec = await recordPitchContour((l) => setMeter(l, 'sentence-meter-bar'), { captureAudio: true })
      if (!pressActive) {
        await sentRec.stop()
        sentRec = null
        setMeter(0, 'sentence-meter-bar')
        setSentencePron('')
        return
      }
      setSentencePron('Recording… read the whole sentence, then release')
    } catch {
      sentRec = null
      btn.classList.remove('active')
      setMeter(0, 'sentence-meter-bar')
      setSentencePron(MIC_HELP)
    }
  }

  async function stop() {
    pressActive = false
    if (!sentRec) return
    btn.classList.remove('active')
    const capture = await sentRec.stop()
    sentRec = null
    setMeter(0, 'sentence-meter-bar')
    scoreSentence(word, currentExample, capture)
  }

  btn.addEventListener('pointerdown', start)
  btn.addEventListener('pointerup', stop)
  btn.addEventListener('pointercancel', stop)
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
function setMeter(level, barId = 'meter-bar') {
  const bar = document.getElementById(barId)
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
  const tonePercent = scorePercent(result.overall)
  showResult(word, result, tonePercent)
}

function setCardRing(passed) {
  const card = document.getElementById('word-card')
  if (card) {
    card.classList.toggle('pass', passed)
    card.classList.toggle('fail', !passed)
  }
}

// Render the tone result: percent + status, then the per-syllable readings and
// pitch plots. Pronunciation is a separate, sentence-based flow (see below).
function showResult(word, result, tonePercent) {
  const tonePassed = tonePercent >= ACCEPT_PERCENT
  quiz.setScore(result.overall)
  if (tonePassed) mastered.add(word.hanzi)

  const box = document.getElementById('tone-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel shown'

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

  box.append(
    el('div', { class: `section-head ${tonePassed ? 'good' : 'bad'}`, text: `Tone ${tonePercent}% — ${verdict(tonePercent)}` }),
    plots,
    el('p', { class: 'plot-legend' }, [
      el('span', { class: 'leg-you', text: '— you' }),
      el('span', { class: 'leg-target', text: '┄ target' })
    ]),
    el('ul', { class: 'syllables' }, rows)
  )
  for (const [canvas, syl] of toDraw) drawPlot(canvas, syl.contour, syl.target)

  setCardRing(tonePassed)
  fillTopbar(document.getElementById('topbar'))
  fillWordList(document.getElementById('wordlist'))
}

function pronStatus(closeness) {
  if (closeness >= PRON_ACCEPT) return { cls: 'good', label: '✅ Correct sound' }
  if (closeness >= PRON_NEAR) return { cls: 'warn-status', label: '🟡 Near miss' }
  return { cls: 'bad', label: '❌ Not heard' }
}

function setSentencePron(text) {
  const box = document.getElementById('pron-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel shown'
  box.append(el('p', { class: 'best-note', text }))
}

// "Checking…" with an indeterminate progress bar so the wait is visible.
function setSentenceChecking() {
  const box = document.getElementById('pron-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel shown'
  box.append(
    el('p', { class: 'best-note', text: 'Checking pronunciation…' }),
    el('div', { class: 'checking-bar' }, [el('div', { class: 'checking-fill' })])
  )
}

// Longest audio (seconds) sent to the recognizer; guards memory/runaway.
const MAX_PRON_SECONDS = 12

// Transcribe a full-sentence reading and rate just the target word within it,
// by finding the best-matching syllable window. Whisper is far more reliable on
// a sentence than on a lone syllable, so this rates the target more fairly.
function scoreSentence(word, ex, capture) {
  if (!capture.audio || capture.audio.length === 0) {
    setSentencePron('No audio captured — try again.')
    return
  }
  setSentenceChecking()
  let pcm = toWhisperInput(capture.audio, capture.sampleRate)
  if (pcm.length > 16000 * MAX_PRON_SECONDS) pcm = pcm.slice(0, 16000 * MAX_PRON_SECONDS)
  const durSec = (pcm.length / 16000).toFixed(1)
  transcribe(pcm).then(async (text) => {
    const heard = cleanHeard(text)
    if (!heard) {
      // Empty after keeping only Chinese. If the recognizer returned Latin text
      // it detected the wrong language — almost always a stale cached worker
      // that isn't forcing Chinese; a hard reload replaces it. Otherwise it
      // simply heard no speech.
      const gotLatin = /[a-z]/i.test(text || '')
      setSentencePron(gotLatin
        ? 'Heard non-Chinese — the recognizer needs refreshing. Hard-reload the page (⌘/Ctrl+Shift+R) and try again.'
        : 'No speech detected — check the mic and try again.')
      setPronStatus(`audio ${durSec}s · raw “${text || '—'}”`)
      return
    }
    const heardChars = [...heard]
    const pyArr = await toPinyinArray(heard)
    const best = bestWindowCloseness(pyArr.map(tonelessPinyin), word.pinyin, word.tones.length)
    const matchedHanzi = heardChars.slice(best.start, best.start + best.length).join('')
    const matchedPinyin = pyArr.slice(best.start, best.start + best.length).join('')
    renderSentencePron(word, ex, heard, best, matchedHanzi, matchedPinyin)
    // Diagnostics go in the subtle footer status line, not the result box.
    setPronStatus(`audio ${durSec}s · raw “${text || '—'}”`)
  }).catch((e) => setSentencePron(`Pronunciation check failed: ${e.message}`))
}

// Set of characters in the shown example sentence, used to flag heard characters
// that shouldn't be there.
function expectedChars(ex, word) {
  return new Set([...((ex && ex.hanzi) || word.hanzi)])
}

// Render the target word's pronunciation rating from the sentence reading. When
// the target wasn't clearly found, also show the closest word actually heard,
// with hanzi + pinyin.
function renderSentencePron(word, ex, heard, best, matchedHanzi, matchedPinyin) {
  const box = document.getElementById('pron-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel shown'
  const st = pronStatus(best.closeness)
  const rows = [
    el('div', { class: `section-head ${st.cls}` }, [
      el('span', {
        class: 'ex-word',
        text: word.hanzi,
        title: `${word.pinyin} — ${word.en}`,
        onclick: () => say(word.hanzi)
      }),
      el('span', { text: ` (${word.pinyin}): ${scorePercent(best.closeness)}% — ${st.label}` })
    ])
  ]
  if (best.closeness < PRON_ACCEPT && matchedHanzi) {
    rows.push(el('p', { class: 'best-note' }, [
      el('span', { text: 'closest heard: ' }),
      el('span', { class: 'ex-word', text: matchedHanzi, onclick: () => say(matchedHanzi) }),
      el('span', { text: matchedPinyin ? ` (${matchedPinyin})` : '' })
    ]))
  }
  rows.push(
    el('p', { class: 'best-note' }, [
      el('span', { text: 'heard sentence: ' }),
      ...(heard ? heardSpans(heard, best.start, best.length, expectedChars(ex, word)) : [el('span', { text: '—' })])
    ])
  )
  box.append(...rows)
}

// Word-side status (mic/errors) lives in the tone-result panel.
function setFeedback(message, kind) {
  const box = document.getElementById('tone-result')
  if (!box) return
  clear(box)
  box.className = `score-panel shown ${kind}`
  box.append(el('p', { text: message }))
}

function clearFeedback() {
  const box = document.getElementById('tone-result')
  if (!box) return
  clear(box)
  box.className = 'score-panel'
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

// Prompt for microphone access up front and release the stream immediately, so
// recording later needs no prompt. Browsers may require a user gesture (iOS),
// so this is also retried on the first tap. Leaves micDone false on failure so
// the gesture retry can prompt.
let micDone = false
async function requestMic() {
  if (micDone || !microphoneSupported()) return
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    for (const track of stream.getTracks()) track.stop()
    micDone = true
  } catch {
    // Leave micDone false so the first user gesture can prompt.
  }
}

// The first user gesture unlocks audio: request the mic and play the current
// word (its autoplay was blocked on cold load). Skip if the tap is the record
// button, which handles the mic itself and must not hear the word played back.
function onFirstGesture(ev) {
  const onRecord = ev.target && ev.target.closest && ev.target.closest('#record-btn')
  if (onRecord) return
  requestMic()
  const word = quiz.current()
  if (word) say(word.hanzi)
}

if (!speechSupported() || !microphoneSupported()) {
  renderUnsupported()
} else {
  renderWord()
  // Pronunciation defaults on; start fetching the model so it's ready to use.
  ensurePronModel()
  // Ask for the mic on load (works on desktop); iOS retries on first gesture.
  requestMic()
  document.addEventListener('pointerdown', onFirstGesture, { capture: true, once: true })
}
