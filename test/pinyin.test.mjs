import test from 'node:test'
import assert from 'node:assert/strict'
import { numericSyllableToMarks, numericPinyinToMarks } from '../assets/js/pinyin.js'

test('marks a/e/o with priority over i/u/ü', () => {
  assert.equal(numericSyllableToMarks('ni3'), 'nǐ')
  assert.equal(numericSyllableToMarks('hao3'), 'hǎo')
  assert.equal(numericSyllableToMarks('ma1'), 'mā')
  assert.equal(numericSyllableToMarks('gou3'), 'gǒu') // "ou" -> o
  assert.equal(numericSyllableToMarks('guo2'), 'guó') // "uo" -> o
})

test('marks the second vowel of "iu" and "ui" combos', () => {
  assert.equal(numericSyllableToMarks('liu2'), 'liú')
  assert.equal(numericSyllableToMarks('dui4'), 'duì')
  assert.equal(numericSyllableToMarks('gui4'), 'guì')
})

test('handles ü written as "u:" and preserves capitalization', () => {
  assert.equal(numericSyllableToMarks('nu:3'), 'nǚ')
  assert.equal(numericSyllableToMarks('lu:e4'), 'lüè') // mark goes on e, ü unmarked
  assert.equal(numericSyllableToMarks('Bei3'), 'Běi')
})

test('neutral tone (5, 0, or no digit) leaves the syllable unmarked', () => {
  assert.equal(numericSyllableToMarks('de5'), 'de')
  assert.equal(numericSyllableToMarks('de0'), 'de')
  assert.equal(numericSyllableToMarks('de'), 'de')
})

test('numericPinyinToMarks converts a whitespace-separated string syllable by syllable', () => {
  assert.equal(numericPinyinToMarks('ni3 hao3'), 'nǐ hǎo')
  assert.equal(numericPinyinToMarks('xi3 huan5'), 'xǐ huan')
  assert.equal(numericPinyinToMarks(''), '')
})

test('non-syllable input is returned unchanged rather than throwing', () => {
  assert.equal(numericSyllableToMarks(''), '')
  assert.equal(numericSyllableToMarks('3C'), '3C')
})
