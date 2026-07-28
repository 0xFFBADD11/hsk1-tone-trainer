import test from 'node:test'
import assert from 'node:assert/strict'
import { glossClauses, buildIndex, lookupIndex } from '../assets/js/translate.js'

test('glossClauses splits on semicolons and strips parenthetical annotations', () => {
  assert.deepEqual(glossClauses('big; large; great'), ['big', 'large', 'great'])
  assert.deepEqual(glossClauses('cat (CL:隻|只[zhi1])'), ['cat'])
  assert.deepEqual(glossClauses('  '), [])
})

const fixture = [
  { simplified: '大', pinyin: 'da4', english: ['big; large; great'] },
  { simplified: '伟', pinyin: 'wei3', english: ['big; great; grand'] },
  { simplified: '猫', pinyin: 'mao1', english: ['cat (CL:隻|只[zhi1])', '(coll.) modem'] },
  { simplified: '吃', pinyin: 'chi1', english: ['to eat; to consume', 'to eat at (a cafeteria etc)'] },
  { simplified: '女', pinyin: 'nu:3', english: ['female', 'woman', 'daughter'] }
]
const hsk = new Set(['大', '猫', '吃', '女'])

test('buildIndex + lookupIndex finds an exact clause match', () => {
  const idx = buildIndex(fixture)
  const hits = lookupIndex(idx, hsk, 'cat')
  assert.equal(hits.length, 1)
  assert.equal(hits[0].hanzi, '猫')
  assert.equal(hits[0].pinyin, 'māo')
  assert.equal(hits[0].en, 'cat')
})

test('common (HSK) words rank above rare ones for the same gloss', () => {
  const idx = buildIndex(fixture)
  const hits = lookupIndex(idx, hsk, 'big')
  assert.deepEqual(hits.map((h) => h.hanzi), ['大', '伟'])
})

test('a bare verb query also matches the "to " form and vice versa', () => {
  const idx = buildIndex(fixture)
  assert.equal(lookupIndex(idx, hsk, 'eat')[0].hanzi, '吃')
  assert.equal(lookupIndex(idx, hsk, 'to eat')[0].hanzi, '吃')
})

test('numeric pinyin (including ü as "u:") is converted to tone marks', () => {
  const idx = buildIndex(fixture)
  const hits = lookupIndex(idx, hsk, 'daughter')
  assert.equal(hits[0].hanzi, '女')
  assert.equal(hits[0].pinyin, 'nǚ')
})

test('no match returns an empty array', () => {
  const idx = buildIndex(fixture)
  assert.deepEqual(lookupIndex(idx, hsk, 'xylophone'), [])
  assert.deepEqual(lookupIndex(idx, hsk, ''), [])
})

test('duplicate entry/pinyin pairs are not returned twice across query variants', () => {
  const idx = buildIndex(fixture)
  const hits = lookupIndex(idx, hsk, 'to eat')
  const keys = hits.map((h) => `${h.hanzi}|${h.pinyin}`)
  assert.equal(new Set(keys).size, keys.length)
})
