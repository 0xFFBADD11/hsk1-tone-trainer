# HSK 1 Tone Trainer

A browser-based trainer for the HSK 1 Mandarin vocabulary set. For each word it
shows the hanzi, tone-marked pinyin, and English, pronounces it with the Web
Speech API, then records you through the microphone and scores how well your
**tones** match the expected pitch shapes.

Everything runs in the browser. Microphone audio never leaves your device.

## How tone scoring works

1. The microphone is captured with `getUserMedia` into an `AudioContext`.
2. A normalized autocorrelation detector estimates the fundamental frequency
   (F0) on each frame, producing a pitch contour.
3. The contour is converted to semitones relative to its own median, resampled,
   and compared to the canonical shape of each Mandarin tone
   (1 high-flat, 2 rising, 3 dipping, 4 falling, 5 neutral).
4. Multi-syllable words are split into equal voiced segments, scored per
   syllable, and averaged.

Scoring is approximate and meant for practice — see `THREAT_MODEL.md`.

## Requirements

- A browser with the Web Speech API and microphone support
  (recent Chrome, Edge, or Safari — **including iOS Safari**).
- A secure context (HTTPS or `localhost`); the microphone will not work from a
  `file://` page.

## Develop

```bash
pnpm install        # or: make install
make check          # lint + unit tests
make test           # unit tests only
make fuzz           # jazzer.js fuzz target for the audio path
make dev            # run locally via wrangler (Cloudflare Worker + assets)
```

Enable the pre-commit gate once:

```bash
git config core.hooksPath .githooks
```

## Deploy

This repo is published with **GitHub Pages** (Settings → Pages → Deploy from a
branch → `main` / root). The page ships a `<meta>` CSP so the security policy
holds on a static host.

A Cloudflare Worker (`worker/index.js`) is also included for hosts that can set
response headers (HSTS, `Permissions-Policy`, etc.); deploy it with
`make deploy` if you use Cloudflare instead.

## Project layout

```
index.html              app shell (no inline scripts/styles)
assets/css/styles.css   styling
assets/js/              app.js, quiz.js, speech.js, pitch.js, tone.js, dom.js
assets/data/hsk1.js     vocabulary (hanzi, pinyin, per-syllable tones, English)
worker/index.js         Cloudflare Worker: serves assets + security headers
test/                   node:test unit tests for tone scoring
fuzz/                   jazzer.js fuzz target
.github/workflows/      CI, CodeQL, Gitleaks, OpenSSF Scorecard
```

## Standards

Built following the [strongentropy](https://github.com/strongentropy/strongentropy.github.io)
practices: 2-space indent, single quotes, no semicolons, no dead code, no
`eval`/`innerHTML`, input validated at trust boundaries, Conventional Commits,
and the CI/security controls listed in `SECURITY.md`.
