import test from 'node:test'
import assert from 'node:assert/strict'
import { validateBackup } from '../assets/js/storage.js'

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
