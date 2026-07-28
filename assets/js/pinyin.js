// Convert numeric-tone pinyin (as used by CC-CEDICT, e.g. "ni3", or "nu:3"
// for nǚ) to the tone-marked form used everywhere else in this app (e.g.
// "nǐ", "nǚ"). Pure and synchronous — no dictionary data required.

const TONE_MARKS = {
  a: 'āáǎà',
  e: 'ēéěè',
  o: 'ōóǒò',
  i: 'īíǐì',
  u: 'ūúǔù',
  ü: 'ǖǘǚǜ'
}

// Which vowel in a syllable takes the tone mark, per standard pinyin
// orthography: a, then e, then o (this also covers "ou", since the o alone
// is found first); "iu"/"ui" are the two combos where neither vowel is
// a/e/o and the mark goes on the *second* vowel; otherwise the sole
// remaining vowel (i, u, or ü) takes it.
function markVowel(base, tone) {
  if (tone === 5 || tone === 0) return base
  let idx = -1
  let ch = null
  for (const cand of ['a', 'e', 'o']) {
    const i = base.indexOf(cand)
    if (i !== -1) { idx = i; ch = cand; break }
  }
  if (!ch) {
    const iu = base.indexOf('iu')
    if (iu !== -1) {
      idx = iu + 1
      ch = 'u'
    } else {
      const ui = base.indexOf('ui')
      if (ui !== -1) {
        idx = ui + 1
        ch = 'i'
      }
    }
  }
  if (!ch) {
    for (const cand of ['i', 'u', 'ü']) {
      const i = base.indexOf(cand)
      if (i !== -1) { idx = i; ch = cand; break }
    }
  }
  if (!ch) return base
  const marked = TONE_MARKS[ch][tone - 1]
  return base.slice(0, idx) + marked + base.slice(idx + 1)
}

// One numeric-tone syllable, e.g. "ni3", "nu:3" (ü written "u:"), or
// "de5"/"de" (neutral). Capitalization (proper nouns) is preserved.
export function numericSyllableToMarks(syllable) {
  const m = /^([A-Za-z:]+)([0-5]?)$/.exec(syllable || '')
  if (!m) return syllable || ''
  const [, letters, toneStr] = m
  const tone = toneStr ? Number(toneStr) : 5
  const isUpper = /^[A-Z]/.test(letters)
  const lower = letters.toLowerCase().replace(/u:/g, 'ü')
  const marked = markVowel(lower, tone)
  return isUpper ? marked.charAt(0).toUpperCase() + marked.slice(1) : marked
}

// A whitespace-separated numeric-tone pinyin string (CC-CEDICT's format),
// converted syllable by syllable to the tone-marked form.
export function numericPinyinToMarks(pinyin) {
  return (pinyin || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(numericSyllableToMarks)
    .join(' ')
}
