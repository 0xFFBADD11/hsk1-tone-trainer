// Best-effort example sentence for a custom (learner-added) word. HSK1's own
// words get hand-written sentences (hsk1-examples.js); a freshly added word
// has none, so it can't be read aloud or tone-checked in the sentence panel
// until it gets one. This generates a single simple, grammatical sentence
// built only from common HSK1 function words (我 这 是 很 喜欢), picked by a
// light heuristic on the word's English gloss. It won't always be the most
// natural phrasing, but it is always valid Mandarin grammar.

const WO_HANZI = '我'
const WO_PINYIN = 'wǒ'
const ZHE_HANZI = '这'
const ZHE_PINYIN = 'zhè'
const SHI_HANZI = '是'
const SHI_PINYIN = 'shì'
const HEN_HANZI = '很'
const HEN_PINYIN = 'hěn'
const XIHUAN_HANZI = '喜欢'
const XIHUAN_PINYIN = 'xǐhuan'

// English glosses in HSK1 (and typically typed by a learner) mark verbs with
// a "to " prefix, e.g. "to eat", "to like" — see assets/data/hsk1.js.
function isVerbGloss(clause) {
  return /^to\s+\S/i.test(clause)
}

// Common HSK1-level adjectives. Not exhaustive — glosses outside this list
// fall back to the noun template, which reads fine even for an adjective
// ("this is cold") if slightly less idiomatic than "this is very cold".
const COMMON_ADJECTIVES = new Set([
  'cold', 'hot', 'warm', 'cool', 'big', 'small', 'tall', 'short', 'long',
  'new', 'old', 'pretty', 'beautiful', 'ugly', 'happy', 'sad', 'angry',
  'tired', 'hungry', 'thirsty', 'busy', 'free', 'easy', 'difficult', 'hard',
  'expensive', 'cheap', 'fast', 'slow', 'good', 'bad', 'nice', 'delicious',
  'tasty', 'clean', 'dirty', 'heavy', 'light', 'strong', 'weak', 'rich',
  'poor', 'young', 'interesting', 'boring', 'fun', 'quiet', 'loud', 'wet',
  'dry', 'full', 'empty', 'early', 'late', 'near', 'far', 'high', 'low',
  'thick', 'thin', 'fat', 'wide', 'narrow', 'bright', 'dark', 'sweet',
  'sour', 'spicy', 'salty', 'bitter', 'smart', 'clever', 'kind', 'honest',
  'lazy', 'polite', 'rude', 'shy', 'brave', 'careful', 'safe', 'dangerous'
])

// The clause a multi-sense gloss like "to eat" or "pretty; beautiful" is
// classified on: the first item, lowercased.
function firstClause(en) {
  return (en || '').split(/[;,]/)[0].trim().toLowerCase()
}

// One simple, grammatical example sentence for a word, chosen by a rough
// part-of-speech guess from its English gloss. Always returns a sentence.
export function generateExample(word) {
  const { hanzi, pinyin, en } = word
  const clause = firstClause(en)

  if (isVerbGloss(clause)) {
    const verb = clause.replace(/^to\s+/i, '')
    return {
      hanzi: `${WO_HANZI}${XIHUAN_HANZI}${hanzi}。`,
      pinyin: `${cap(WO_PINYIN)} ${XIHUAN_PINYIN} ${pinyin}。`,
      en: `I like to ${verb}.`
    }
  }
  if (COMMON_ADJECTIVES.has(clause)) {
    return {
      hanzi: `${ZHE_HANZI}${HEN_HANZI}${hanzi}。`,
      pinyin: `${cap(ZHE_PINYIN)} ${HEN_PINYIN} ${pinyin}。`,
      en: `This is very ${clause}.`
    }
  }
  return {
    hanzi: `${ZHE_HANZI}${SHI_HANZI}${hanzi}。`,
    pinyin: `${cap(ZHE_PINYIN)} ${SHI_PINYIN} ${pinyin}。`,
    en: `This is ${en}.`
  }
}

function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
