# Threat Model

## Assets

- The user's microphone audio and derived pitch data.
- The integrity of the served static application.

## Trust Boundaries

1. **Browser ↔ microphone.** `getUserMedia` requires an explicit user grant and
   a secure context (HTTPS). Audio is consumed in-page and discarded after the
   pitch contour is computed; nothing is stored or sent.
2. **Browser ↔ edge (Cloudflare Worker).** The Worker serves static assets and
   only accepts `GET`/`HEAD`. It adds security headers to every response.

## Inputs and Validation

- **Audio frames → pitch.** `detectPitch` rejects silent/low-RMS frames and
  out-of-range periods, returning `0` rather than throwing.
- **Pitch series → tone score.** `toSemitones`, `resample`, `scoreSyllable`, and
  `scoreWord` are pure, tolerate empty/NaN/extreme values, and always return a
  bounded `0..1` score. This path has a jazzer.js fuzz target.
- **No user-supplied text is rendered as markup.** DOM is built node-by-node
  with `textContent`.

## Out of Scope

- Authenticity of the Web Speech API's pronunciation (provided by the OS/browser
  voice engine).
- Tone scoring is approximate and intended for practice, not certification.

## Residual Risks

- Pitch detection accuracy degrades in noisy environments; mitigated by the RMS
  gate and by surfacing per-syllable feedback so users can retry.
- SpeechSynthesis voice quality varies by platform; a missing `zh-CN` voice
  falls back to any available Chinese voice.
