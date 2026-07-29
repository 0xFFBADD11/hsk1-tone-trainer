// Best-effort English -> Chinese lookup for the "Add word" form, so a
// learner can type just an English word and get hanzi/pinyin candidates to
// pick from. Backed by a local, curated CC-CEDICT subset (see
// assets/data/cedict-common.js) rather than the full ~124k-entry, ~16.5MB
// CC-CEDICT dataset: fetching and parsing that much JSON — even as raw JSON
// via fetch().json(), not just a dynamic import() of a bundled JS module —
// overflowed the JS engine's stack on iOS Safari/Chrome ("RangeError:
// Maximum call stack size exceeded") despite working fine on desktop. The
// curated subset (every CC-CEDICT entry whose simplified form is in the
// HSK 1-6 common-word list) covers the vast majority of everyday vocabulary
// a learner would want to add, at a size safely below that limit on any
// device.

import { CEDICT_COMMON } from '../data/cedict-common.js?v=20260728z'
import { numericPinyinToMarks } from './pinyin.js?v=20260728z'

const MAX_CANDIDATES = 8

let index = null // Map<normalized gloss clause, Array<{ entry, senseIndex, display }>>
let hskWords = null // Set<string> of common (HSK 1-6) simplified words

function stripParens(s) {
  return s.replace(/\([^)]*\)/g, '')
}

// A gloss can be one sense ("cat (CL:...)") or several joined by semicolons
// ("big; large; great") — split & normalize each separately so "big" alone
// matches, keeping a clean display form (parens stripped, original casing)
// alongside the lowercased lookup key.
export function glossClauses(gloss) {
  return stripParens(gloss)
    .split(';')
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

// entries: CC-CEDICT-shaped { simplified, pinyin, english: string[] }[].
export function buildIndex(entries) {
  const idx = new Map()
  for (const entry of entries) {
    const seen = new Set()
    entry.english.forEach((gloss, senseIndex) => {
      for (const display of glossClauses(gloss)) {
        const key = display.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        if (!idx.has(key)) idx.set(key, [])
        idx.get(key).push({ entry, senseIndex, display })
      }
    })
  }
  return idx
}

// Ranked hanzi/pinyin/en candidates for a query, given an index built by
// buildIndex() and a Set of common (HSK) simplified words used to rank
// everyday vocabulary above CC-CEDICT's many rare/literary entries. Pure —
// no loading or module-level state.
export function lookupIndex(idx, hskWords, query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []

  // Try the query as typed, plus the "to " form either way, so "eat" and
  // "to eat" both find verb entries (CC-CEDICT glosses verbs with "to ").
  const variants = q.startsWith('to ') ? [q, q.slice(3)] : [q, `to ${q}`]
  const seen = new Set()
  const hits = []
  for (const v of variants) {
    for (const hit of idx.get(v) || []) {
      const key = `${hit.entry.simplified}|${hit.entry.pinyin}`
      if (seen.has(key)) continue
      seen.add(key)
      hits.push(hit)
    }
  }

  hits.sort((a, b) => {
    const aCommon = hskWords.has(a.entry.simplified) ? 0 : 1
    const bCommon = hskWords.has(b.entry.simplified) ? 0 : 1
    if (aCommon !== bCommon) return aCommon - bCommon
    if (a.senseIndex !== b.senseIndex) return a.senseIndex - b.senseIndex
    if (a.entry.simplified.length !== b.entry.simplified.length) {
      return a.entry.simplified.length - b.entry.simplified.length
    }
    return a.entry.simplified < b.entry.simplified ? -1 : 1
  })

  return hits.slice(0, MAX_CANDIDATES).map(({ entry, display }) => ({
    hanzi: entry.simplified,
    pinyin: numericPinyinToMarks(entry.pinyin),
    en: display
  }))
}

// The whole subset is common by construction (see cedict-common.js), so
// every lookup ties on that criterion and falls through to lookupIndex's
// other sort keys — kept as a real Set (rather than dropping the parameter)
// so lookupIndex's ranking behavior stays identical if the data source ever
// grows to include non-common entries again.
function ensureIndex() {
  if (index) return
  index = buildIndex(CEDICT_COMMON)
  hskWords = new Set(CEDICT_COMMON.map((e) => e.simplified))
}

// Ranked hanzi/pinyin/en candidates for an English word or short phrase.
// [] if there's no match. This dictionary is bundled locally, so there's no
// network/loading step or failure mode here (unlike the CDN-fetched version
// this replaced) — kept async since callers already await it.
export async function translateEnglish(query) {
  if (!(query || '').trim()) return []
  ensureIndex()
  return lookupIndex(index, hskWords, query)
}
