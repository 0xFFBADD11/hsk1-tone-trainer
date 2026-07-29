// localStorage persistence for user-added words and quiz progress.
// localStorage may be unavailable (private browsing, disabled storage); every
// read/write is wrapped so a blocked store just degrades to "not persisted"
// rather than breaking the app.

const CUSTOM_WORDS_KEY = 'custom-words'
const PROGRESS_KEY = 'progress'
const STRICTNESS_KEY = 'strictness'
const SLOW_KEY = 'slow'
const PRON_KEY = 'pron'

// Bump if the backup shape ever changes incompatibly.
const BACKUP_VERSION = 1

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
  if (!raw) return { scores: {}, mastered: [], priority: [] }
  try {
    const parsed = JSON.parse(raw)
    const scores = parsed && typeof parsed.scores === 'object' && parsed.scores !== null ? parsed.scores : {}
    const mastered = Array.isArray(parsed && parsed.mastered) ? parsed.mastered : []
    const priority = Array.isArray(parsed && parsed.priority) ? parsed.priority : []
    return { scores, mastered, priority }
  } catch {
    return { scores: {}, mastered: [], priority: [] }
  }
}

export function saveProgress(progress) {
  safeSet(PROGRESS_KEY, JSON.stringify(progress))
}

export function clearProgress() {
  safeRemove(PROGRESS_KEY)
}

// A full snapshot of everything this app stores locally: custom words,
// practice progress, and preferences (strictness/slow/pronunciation-check).
// Suitable for saving to a file and restoring later, on this device or
// another one.
export function exportBackup() {
  return {
    app: 'hsk1-tone-trainer',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    customWords: loadCustomWords(),
    progress: loadProgress(),
    prefs: {
      strictness: safeGet(STRICTNESS_KEY),
      slow: safeGet(SLOW_KEY),
      pron: safeGet(PRON_KEY)
    }
  }
}

// Validate a parsed backup object (from exportBackup(), possibly hand-edited
// or from an older version) before it's applied — checked separately from
// applying it so the caller can show the user what's about to change first.
// Returns { error } or { ok: true, wordCount, scoreCount }.
export function validateBackup(data) {
  if (!data || typeof data !== 'object') return { error: 'Not a valid backup file.' }
  if (!Array.isArray(data.customWords)) return { error: 'Missing or invalid word list in this file.' }
  for (const w of data.customWords) {
    if (!w || typeof w.hanzi !== 'string' || typeof w.pinyin !== 'string' ||
        !Array.isArray(w.tones) || typeof w.en !== 'string') {
      return { error: 'One of the words in this file is malformed.' }
    }
  }
  const progress = data.progress
  if (!progress || typeof progress !== 'object' ||
      typeof progress.scores !== 'object' || progress.scores === null ||
      !Array.isArray(progress.mastered) ||
      (progress.priority !== undefined && !Array.isArray(progress.priority))) {
    return { error: 'Missing or invalid progress data in this file.' }
  }
  return { ok: true, wordCount: data.customWords.length, scoreCount: Object.keys(progress.scores).length }
}

// Apply an already-validated backup object, replacing current custom words,
// progress, and preferences entirely. Caller should reload afterward so
// every in-memory copy of this data (the live word pool, the quiz, etc.)
// picks it up fresh rather than needing to be patched individually.
export function applyBackup(data) {
  saveCustomWords(data.customWords)
  saveProgress({ scores: data.progress.scores, mastered: data.progress.mastered, priority: data.progress.priority || [] })
  const prefs = data.prefs || {}
  if (prefs.strictness) safeSet(STRICTNESS_KEY, prefs.strictness)
  if (prefs.slow) safeSet(SLOW_KEY, prefs.slow)
  if (prefs.pron) safeSet(PRON_KEY, prefs.pron)
}

// Pure merge of two { customWords, progress } shaped objects (as returned by
// { customWords: loadCustomWords(), progress: loadProgress() }, or an
// already-validated backup): custom words are unioned by hanzi — `existing`
// wins on a collision, so a local edit made since the backup was taken isn't
// clobbered — scores take the best (highest) of the two sides per word
// (consistent with how a single session already only ever keeps a word's
// best attempt), and mastered/priority status is each the union. Never
// loses data already on this device, unlike a replace.
export function mergeData(existing, incoming) {
  const existingHanzi = new Set(existing.customWords.map((w) => w.hanzi))
  const customWords = [
    ...existing.customWords,
    ...incoming.customWords.filter((w) => !existingHanzi.has(w.hanzi))
  ]

  const scores = { ...existing.progress.scores }
  for (const [hanzi, score] of Object.entries(incoming.progress.scores)) {
    if (scores[hanzi] === undefined || score > scores[hanzi]) scores[hanzi] = score
  }
  const mastered = [...new Set([...existing.progress.mastered, ...incoming.progress.mastered])]
  const priority = [...new Set([...(existing.progress.priority || []), ...(incoming.progress.priority || [])])]

  return { customWords, progress: { scores, mastered, priority } }
}

// Merge an already-validated backup into what's currently saved (see
// mergeData for the merge rules). Preferences are left untouched — a
// backup's prefs, possibly from a different device, shouldn't override this
// device's current settings the way an explicit "replace" does. Caller
// should reload afterward, same as applyBackup().
export function mergeBackup(data) {
  const merged = mergeData(
    { customWords: loadCustomWords(), progress: loadProgress() },
    { customWords: data.customWords, progress: data.progress }
  )
  saveCustomWords(merged.customWords)
  saveProgress(merged.progress)
}
