import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanHeard, tonelessPinyin, pronunciationCloseness } from '../assets/js/pronounce.js'

test('cleanHeard strips punctuation and whitespace', () => {
  assert.equal(cleanHeard(' 你好，世界。'), '你好世界')
})

test('tonelessPinyin drops tone marks, spaces, punctuation', () => {
  assert.equal(tonelessPinyin('wèi'), 'wei')
  assert.equal(tonelessPinyin('Běijīng'), 'beijing')
  assert.equal(tonelessPinyin("nǚ'ér"), 'nuer')
})

test('identical pinyin scores 1', () => {
  assert.equal(pronunciationCloseness('wèi', 'wèi'), 1)
})

test('a near miss (one sound off) scores high but below 1', () => {
  const c = pronunciationCloseness('wèi', 'bèi') // w -> b, same final
  assert.ok(c > 0.5 && c < 1, `near-miss closeness ${c}`)
})

test('a different word scores low', () => {
  const c = pronunciationCloseness('wèi', 'hǎo')
  assert.ok(c < 0.4, `different-word closeness ${c}`)
})

test('near miss scores clearly higher than a different word', () => {
  const near = pronunciationCloseness('wèi', 'bèi')
  const wrong = pronunciationCloseness('wèi', 'hǎo')
  assert.ok(near > wrong)
})

test('empty heard scores 0', () => {
  assert.equal(pronunciationCloseness('wèi', ''), 0)
})
