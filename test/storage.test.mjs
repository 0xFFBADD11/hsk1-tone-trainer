import test from 'node:test'
import assert from 'node:assert/strict'
import { validateBackup, mergeData } from '../assets/js/storage.js'

const validWord = { hanzi: '你好', pinyin: 'nǐ hǎo', tones: [3, 3], en: 'hello', custom: true }

test('accepts a well-formed backup and reports counts', () => {
  const result = validateBackup({
    app: 'hsk1-tone-trainer',
    version: 1,
    customWords: [validWord],
    progress: { scores: { '你好': 0.9, '爱': 0.5 }, mastered: ['你好'] }
  })
  assert.deepEqual(result, { ok: true, wordCount: 1, scoreCount: 2 })
})

test('accepts an empty-but-well-formed backup', () => {
  const result = validateBackup({ customWords: [], progress: { scores: {}, mastered: [] } })
  assert.equal(result.ok, true)
  assert.equal(result.wordCount, 0)
  assert.equal(result.scoreCount, 0)
})

test('rejects non-object input', () => {
  assert.ok(validateBackup(null).error)
  assert.ok(validateBackup(undefined).error)
  assert.ok(validateBackup('not json').error)
  assert.ok(validateBackup(42).error)
})

test('rejects a missing or non-array customWords', () => {
  assert.ok(validateBackup({ progress: { scores: {}, mastered: [] } }).error)
  assert.ok(validateBackup({ customWords: 'nope', progress: { scores: {}, mastered: [] } }).error)
})

test('rejects a malformed word in customWords', () => {
  const bases = { progress: { scores: {}, mastered: [] } }
  assert.ok(validateBackup({ ...bases, customWords: [{ hanzi: '你好' }] }).error)
  assert.ok(validateBackup({ ...bases, customWords: [{ ...validWord, tones: 'nope' }] }).error)
  assert.ok(validateBackup({ ...bases, customWords: [null] }).error)
})

test('rejects missing or malformed progress', () => {
  const bases = { customWords: [] }
  assert.ok(validateBackup(bases).error)
  assert.ok(validateBackup({ ...bases, progress: { scores: {} } }).error)
  assert.ok(validateBackup({ ...bases, progress: { scores: null, mastered: [] } }).error)
  assert.ok(validateBackup({ ...bases, progress: { scores: {}, mastered: 'nope' } }).error)
})

test('accepts progress with a priority array, and without one (older backups)', () => {
  const bases = { customWords: [] }
  assert.equal(validateBackup({ ...bases, progress: { scores: {}, mastered: [], priority: ['你好'] } }).ok, true)
  assert.equal(validateBackup({ ...bases, progress: { scores: {}, mastered: [] } }).ok, true)
})

test('rejects progress with a non-array priority', () => {
  const bases = { customWords: [] }
  assert.ok(validateBackup({ ...bases, progress: { scores: {}, mastered: [], priority: 'nope' } }).error)
})

const coffee = { hanzi: '咖啡', pinyin: 'kā fēi', tones: [1, 1], en: 'coffee', custom: true }
const cat = { hanzi: '猫', pinyin: 'māo', tones: [1], en: 'cat', custom: true }

test('mergeData unions custom words, existing wins on a hanzi collision', () => {
  const existing = { customWords: [coffee], progress: { scores: {}, mastered: [] } }
  const editedCoffee = { ...coffee, en: 'coffee (edited locally)' }
  const incoming = { customWords: [editedCoffee, cat], progress: { scores: {}, mastered: [] } }
  const merged = mergeData(existing, incoming)
  assert.deepEqual(merged.customWords, [coffee, cat])
})

test('mergeData keeps the best (highest) score per word from either side', () => {
  const existing = { customWords: [], progress: { scores: { '爱': 0.5, '猫': 0.9 }, mastered: [] } }
  const incoming = { customWords: [], progress: { scores: { '爱': 0.8, '猫': 0.3, '狗': 0.4 }, mastered: [] } }
  const merged = mergeData(existing, incoming)
  assert.deepEqual(merged.progress.scores, { '爱': 0.8, '猫': 0.9, '狗': 0.4 })
})

test('mergeData unions mastered status without duplicates', () => {
  const existing = { customWords: [], progress: { scores: {}, mastered: ['爱', '猫'] } }
  const incoming = { customWords: [], progress: { scores: {}, mastered: ['猫', '狗'] } }
  const merged = mergeData(existing, incoming)
  assert.deepEqual(new Set(merged.progress.mastered), new Set(['爱', '猫', '狗']))
  assert.equal(merged.progress.mastered.length, 3)
})

test('mergeData unions priority flags without duplicates', () => {
  const existing = { customWords: [], progress: { scores: {}, mastered: [], priority: ['爱', '猫'] } }
  const incoming = { customWords: [], progress: { scores: {}, mastered: [], priority: ['猫', '狗'] } }
  const merged = mergeData(existing, incoming)
  assert.deepEqual(new Set(merged.progress.priority), new Set(['爱', '猫', '狗']))
  assert.equal(merged.progress.priority.length, 3)
})

test('mergeData treats a missing priority field (older data) as empty', () => {
  const existing = { customWords: [], progress: { scores: {}, mastered: [] } }
  const incoming = { customWords: [], progress: { scores: {}, mastered: [], priority: ['爱'] } }
  const merged = mergeData(existing, incoming)
  assert.deepEqual(merged.progress.priority, ['爱'])
})

test('mergeData does not mutate its inputs', () => {
  const existing = { customWords: [coffee], progress: { scores: { '爱': 0.5 }, mastered: ['爱'] } }
  const incoming = { customWords: [cat], progress: { scores: { '爱': 0.9 }, mastered: ['猫'] } }
  const existingCopy = JSON.parse(JSON.stringify(existing))
  const incomingCopy = JSON.parse(JSON.stringify(incoming))
  mergeData(existing, incoming)
  assert.deepEqual(existing, existingCopy)
  assert.deepEqual(incoming, incomingCopy)
})
