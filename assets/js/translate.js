// Best-effort English -> Chinese lookup for the "Add word" form, so a
// learner can type just an English word and get hanzi/pinyin candidates to
// pick from. Backed by CC-CEDICT (via the `cedict-json` package), lazily
// loaded from jsdelivr — the same CDN this app already uses for pinyin-pro
// and Transformers.js — so it costs nothing until the learner actually uses
// it, and degrades to "no matches" rather than breaking the form if it can't
// load (offline, CDN blocked).
//
// CC-CEDICT alone has no frequency signal and is dominated by rare/literary
// entries, so results are ranked against a common-word list (HSK 1-6, via
// `@leonsilicon/hsk2.0`) — a match that's actual everyday vocabulary sorts
// first.

import { numericPinyinToMarks } from './pinyin.js?v=20260728i'
import { withTimeout } from './timeout.js?v=20260728i'

const CEDICT_URL = 'https://cdn.jsdelivr.net/npm/cedict-json@1.3.20251213/+esm'
const HSK_WORDS_URL = 'https://cdn.jsdelivr.net/npm/@leonsilicon/hsk2.0@0.0.0/HSK2.0_words.json'

const MAX_CANDIDATES = 8
// The dictionary is a multi-MB one-time download; on a slow connection this
// bounds the wait so a stalled fetch fails outright instead of leaving
// "Looking up…" stuck forever.
const LOAD_TIMEOUT_MS = 20000

let index = null // Map<normalized gloss clause, Array<{ entry, senseIndex, display }>>
let hskWords = null // Set<string> of common (HSK 1-6) simplified words
let loading = null

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

async function ensureLoaded() {
  if (index) return
  if (!loading) {
    const attempt = (async () => {
      const [cedictMod, words] = await Promise.all([
        import(CEDICT_URL),
        fetch(HSK_WORDS_URL).then((r) => {
          if (!r.ok) throw new Error(`HSK word list request failed (${r.status})`)
          return r.json()
        })
      ])
      hskWords = new Set(words)
      index = buildIndex(cedictMod.default)
    })()
    loading = withTimeout(attempt, LOAD_TIMEOUT_MS, 'timed out loading the dictionary').catch((err) => {
      // Let a later call retry instead of staying wedged on one failure
      // (e.g. a transient network blip).
      loading = null
      throw err
    })
  }
  await loading
}

// Ranked hanzi/pinyin/en candidates for an English word or short phrase.
// Common (HSK) words sort first, then by how prominent the matched sense is
// in the dictionary entry, then shorter words first. [] if there's no match.
// Throws if the dictionary itself couldn't be loaded (offline, CDN
// unreachable) — the caller should show that as distinct from "no match",
// since they call for different next steps.
export async function translateEnglish(query) {
  if (!(query || '').trim()) return []
  await ensureLoaded()
  return lookupIndex(index, hskWords, query)
}
