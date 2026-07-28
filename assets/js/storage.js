// localStorage persistence for user-added words and quiz progress.
// localStorage may be unavailable (private browsing, disabled storage); every
// read/write is wrapped so a blocked store just degrades to "not persisted"
// rather than breaking the app.

const CUSTOM_WORDS_KEY = 'custom-words'
const PROGRESS_KEY = 'progress'

function safeGet(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Non-fatal: the data just won't persist across reloads.
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Non-fatal.
  }
}

// Words the learner has added, in the same shape as HSK1 entries plus
// `custom: true`. [] if none saved yet or the stored value is malformed.
export function loadCustomWords() {
  const raw = safeGet(CUSTOM_WORDS_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomWords(words) {
  safeSet(CUSTOM_WORDS_KEY, JSON.stringify(words))
}

// Cross-session quiz progress: best score per word (keyed by hanzi) and the
// set of mastered hanzi. Defaults to empty when nothing is saved yet or the
// stored value is malformed.
export function loadProgress() {
  const raw = safeGet(PROGRESS_KEY)
  if (!raw) return { scores: {}, mastered: [] }
  try {
    const parsed = JSON.parse(raw)
    const scores = parsed && typeof parsed.scores === 'object' && parsed.scores !== null ? parsed.scores : {}
    const mastered = Array.isArray(parsed && parsed.mastered) ? parsed.mastered : []
    return { scores, mastered }
  } catch {
    return { scores: {}, mastered: [] }
  }
}

export function saveProgress(progress) {
  safeSet(PROGRESS_KEY, JSON.stringify(progress))
}

export function clearProgress() {
  safeRemove(PROGRESS_KEY)
}
