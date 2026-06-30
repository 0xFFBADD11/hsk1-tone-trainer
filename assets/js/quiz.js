// Quiz state: a shuffled run over the vocabulary, tracking the current
// word, per-tone score history, and aggregate stats. Pure data logic with
// no DOM or audio dependencies.

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

export function createQuiz(words, rand = Math.random) {
  const order = shuffle(words, rand)
  let index = 0
  // Best 0..1 score per attempted word, keyed by its position in `order`.
  const scores = new Map()

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
      const prev = scores.get(index)
      if (prev === undefined || score > prev) scores.set(index, score)
    },
    // Move to the next word. Unattempted words simply have no recorded score.
    advance() {
      index += 1
    },
    // Step back to the previous word (scores are kept, keyed by position).
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
      return scores.get(i)
    },
    // Attempted words with their best score, lowest first (most practice needed).
    attempts() {
      return [...scores.entries()]
        .map(([i, score]) => ({ index: i, word: order[i], score }))
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
    }
  }
}
