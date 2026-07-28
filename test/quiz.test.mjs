import test from 'node:test'
import assert from 'node:assert/strict'
import { shuffle, createQuiz, priorityOrder } from '../assets/js/quiz.js'

const words = [
  { hanzi: 'a', pinyin: 'a', tones: [1], en: 'a' },
  { hanzi: 'b', pinyin: 'b', tones: [1], en: 'b' },
  { hanzi: 'c', pinyin: 'c', tones: [1], en: 'c' }
]

test('shuffle returns a same-length permutation without mutating the input', () => {
  const original = words.slice()
  const out = shuffle(words, () => 0.5)
  assert.equal(out.length, words.length)
  assert.deepEqual(words, original)
  assert.deepEqual([...out].sort((a, b) => a.hanzi.localeCompare(b.hanzi)), words)
})

// With rand always returning 0, the Fisher-Yates swaps put the run in a
// known, deterministic order: [b, c, a].
test('createQuiz walks a deterministic order for a fixed rand', () => {
  const quiz = createQuiz(words, () => 0)
  assert.equal(quiz.current().hanzi, 'b')
  quiz.advance()
  assert.equal(quiz.current().hanzi, 'c')
  quiz.advance()
  assert.equal(quiz.current().hanzi, 'a')
  quiz.advance()
  assert.equal(quiz.isDone(), true)
})

test('setScore keeps the best attempt for the current word', () => {
  const quiz = createQuiz(words, () => 0) // current: 'b'
  quiz.setScore(0.4)
  quiz.setScore(0.2) // worse, should not overwrite
  assert.equal(quiz.scoreAt(quiz.currentIndex()), 0.4)
})

test('scores are seeded from a prior session and available immediately', () => {
  const quiz = createQuiz(words, () => 0, { c: 0.55 }) // order [b, c, a]
  assert.equal(quiz.scoreAt(1), 0.55)
  assert.equal(quiz.scoreAt(0), undefined)
})

test('snapshot returns a hanzi-keyed plain object of best scores', () => {
  const quiz = createQuiz(words, () => 0) // order [b, c, a]
  quiz.setScore(0.6) // 'b'
  quiz.advance()
  quiz.setScore(0.8) // 'c'
  assert.deepEqual(quiz.snapshot(), { b: 0.6, c: 0.8 })
})

test('attempts lists only scored words, lowest score first', () => {
  const quiz = createQuiz(words, () => 0) // order [b, c, a]
  quiz.setScore(0.9) // 'b'
  quiz.advance()
  quiz.setScore(0.3) // 'c'
  const attempts = quiz.attempts()
  assert.deepEqual(attempts.map((a) => a.word.hanzi), ['c', 'b'])
})

test('addWord appends to the remaining queue without disturbing scored positions', () => {
  const quiz = createQuiz(words, () => 0) // order [b, c, a]
  quiz.setScore(0.5) // 'b'
  quiz.addWord({ hanzi: 'd', pinyin: 'd', tones: [1], en: 'd' })
  assert.equal(quiz.progress().total, 4)
  assert.equal(quiz.currentIndex(), 0)
  assert.equal(quiz.scoreAt(0), 0.5)
})

test('removeWord drops a word and shifts the index if it was before the current position', () => {
  const quiz = createQuiz(words, () => 0) // order [b, c, a]
  quiz.goTo(2) // 'a'
  quiz.removeWord('b') // removed at position 0, before the current position
  assert.equal(quiz.currentIndex(), 1)
  assert.equal(quiz.current().hanzi, 'a')
  assert.equal(quiz.progress().total, 2)
})

test('removeWord deletes any recorded score for that word', () => {
  const quiz = createQuiz(words, () => 0) // current: 'b'
  quiz.setScore(0.7)
  quiz.removeWord('b')
  assert.deepEqual(quiz.snapshot(), {})
})

test('removeWord on an absent hanzi is a no-op', () => {
  const quiz = createQuiz(words, () => 0)
  quiz.removeWord('nope')
  assert.equal(quiz.progress().total, 3)
})

test('priorityOrder puts never-attempted words before attempted ones', () => {
  const order = priorityOrder(words, { a: 0.9 }, () => 0)
  assert.deepEqual(order.map((w) => w.hanzi).slice(-1), ['a'])
  assert.deepEqual(new Set(order.slice(0, 2).map((w) => w.hanzi)), new Set(['b', 'c']))
})

test('priorityOrder sorts attempted words worst-score-first', () => {
  const order = priorityOrder(words, { a: 0.9, b: 0.2, c: 0.5 }, () => 0)
  assert.deepEqual(order.map((w) => w.hanzi), ['b', 'c', 'a'])
})

test('priorityOrder with no scores at all is equivalent to a full shuffle', () => {
  const order = priorityOrder(words, {}, () => 0)
  assert.deepEqual(order, shuffle(words, () => 0))
})

test('priorityOrder does not mutate its inputs', () => {
  const wordsCopy = words.slice()
  const scores = { a: 0.9, b: 0.2 }
  priorityOrder(words, scores, () => 0)
  assert.deepEqual(words, wordsCopy)
  assert.deepEqual(scores, { a: 0.9, b: 0.2 })
})

test('createQuiz accepts an orderOverride instead of shuffling', () => {
  const custom = [words[2], words[0], words[1]] // [c, a, b]
  const quiz = createQuiz(words, () => 0, {}, custom)
  assert.equal(quiz.current().hanzi, 'c')
  quiz.advance()
  assert.equal(quiz.current().hanzi, 'a')
})
