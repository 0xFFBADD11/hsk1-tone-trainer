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
  const scores = []

  return {
    current() {
      return order[index] ?? null
    },
    progress() {
      return { position: index + 1, total: order.length }
    },
    // Record a 0..1 score for the current word and advance.
    record(score) {
      scores.push({ word: order[index], score })
      index += 1
    },
    isDone() {
      return index >= order.length
    },
    summary() {
      if (scores.length === 0) return { count: 0, average: 0, scores: [] }
      const average = scores.reduce((s, r) => s + r.score, 0) / scores.length
      return { count: scores.length, average, scores: scores.slice() }
    }
  }
}
