// Quiz state: a shuffled run over the vocabulary, tracking the current
// word, per-tone score history, and aggregate stats. Pure data logic with
// no DOM or audio dependencies — persistence (localStorage) lives in the
// caller, which seeds `initialScores` and reads `snapshot()` back out.

export function shuffle(items, rand = Math.random) {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

export function createQuiz(words, rand = Math.random, initialScores = {}) {
  const order = shuffle(words, rand)
  let index = 0
  // Best 0..1 score per attempted word, keyed by hanzi (not position) so it
  // survives reshuffles and can be seeded from — and snapshotted back into —
  // persisted progress across sessions.
  const scores = new Map(Object.entries(initialScores))

  return {
    current() {
      return order[index] ?? null
    },
    progress() {
      return { position: index + 1, total: order.length }
    },
    // Record a 0..1 score for the current word, keeping the best attempt.
    // Does not advance, so a word can be re-recorded before moving on.
    setScore(score) {
      const word = order[index]
      if (!word) return
      const prev = scores.get(word.hanzi)
      if (prev === undefined || score > prev) scores.set(word.hanzi, score)
    },
    // Move to the next word. Unattempted words simply have no recorded score.
    advance() {
      index += 1
    },
    // Step back to the previous word (scores are kept, keyed by hanzi).
    back() {
      if (index > 0) index -= 1
    },
    // Jump to an arbitrary word (e.g. from the word list).
    goTo(i) {
      if (i >= 0 && i < order.length) index = i
    },
    currentIndex() {
      return index
    },
    // The best recorded score for a given word position, or undefined.
    scoreAt(i) {
      const word = order[i]
      return word ? scores.get(word.hanzi) : undefined
    },
    // Attempted words with their best score, lowest first (most practice needed).
    attempts() {
      return order
        .map((word, i) => ({ index: i, word, score: scores.get(word.hanzi) }))
        .filter((a) => a.score !== undefined)
        .sort((a, b) => a.score - b.score)
    },
    isDone() {
      return index >= order.length
    },
    summary() {
      const values = [...scores.values()]
      if (values.length === 0) return { count: 0, average: 0, scores: [] }
      const average = values.reduce((s, v) => s + v, 0) / values.length
      return { count: values.length, average, scores: values }
    },
    // Plain-object snapshot of best scores, keyed by hanzi, for persistence.
    snapshot() {
      return Object.fromEntries(scores)
    },
    // Add a word to the remaining queue (e.g. one just added by the learner)
    // without disturbing already-scored positions.
    addWord(word) {
      order.push(word)
    },
    // Drop a word from the queue (e.g. deleting a mistaken custom entry) and
    // its recorded score, keeping the current position pointed at the same word.
    removeWord(hanzi) {
      const i = order.findIndex((w) => w.hanzi === hanzi)
      if (i === -1) return
      order.splice(i, 1)
      scores.delete(hanzi)
      if (i < index) index -= 1
    }
  }
}
