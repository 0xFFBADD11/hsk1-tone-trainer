import test from 'node:test'
import assert from 'node:assert/strict'
import { generateExample } from '../assets/js/example.js'

test('a "to " gloss gets the verb template (我喜欢 + word)', () => {
  const ex = generateExample({ hanzi: '跑', pinyin: 'pǎo', en: 'to run' })
  assert.equal(ex.hanzi, '我喜欢跑。')
  assert.equal(ex.pinyin, 'Wǒ xǐhuan pǎo。')
  assert.equal(ex.en, 'I like to run.')
})

test('a known adjective gloss gets the 这很 template', () => {
  const ex = generateExample({ hanzi: '酷', pinyin: 'kù', en: 'cool' })
  assert.equal(ex.hanzi, '这很酷。')
  assert.equal(ex.pinyin, 'Zhè hěn kù。')
  assert.equal(ex.en, 'This is very cool.')
})

test('an unrecognized gloss falls back to the 这是 noun template', () => {
  const ex = generateExample({ hanzi: '手机', pinyin: 'shǒujī', en: 'mobile phone' })
  assert.equal(ex.hanzi, '这是手机。')
  assert.equal(ex.pinyin, 'Zhè shì shǒujī。')
  assert.equal(ex.en, 'This is mobile phone.')
})

test('only the first clause of a multi-sense gloss is used for classification', () => {
  const ex = generateExample({ hanzi: '漂亮', pinyin: 'piàoliang', en: 'pretty; beautiful' })
  assert.equal(ex.hanzi, '这很漂亮。')
  assert.equal(ex.en, 'This is very pretty.')
})

test('always returns a hanzi/pinyin/en sentence, never empty', () => {
  const ex = generateExample({ hanzi: '猫', pinyin: 'māo', en: 'cat' })
  assert.ok(ex.hanzi.length > 0)
  assert.ok(ex.pinyin.length > 0)
  assert.ok(ex.en.length > 0)
})
