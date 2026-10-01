# Security Policy

## Supported Versions

This project uses a rolling release model. Only the latest `main` is supported;
older tags do not receive fixes.

## Reporting a Vulnerability

Report suspected vulnerabilities privately to robert.cowan@gmail.com. Please
include reproduction steps and affected files. Do not open public issues for
security reports.

## Security Properties

- The application is fully client-side. Microphone audio and pitch data are
  processed in the browser and never transmitted.
- Responses are served with a Content-Security-Policy that forbids
  `unsafe-inline`. Scripts and connections are limited to this origin plus
  `cdn.jsdelivr.net` (pinyin-pro and Transformers.js only). ONNX Runtime needs
  `'wasm-unsafe-eval'`. Whisper weights are vendored on this origin and are
  not fetched from a model hub. HSTS, `X-Content-Type-Options`, and a
  `Permissions-Policy` that grants microphone access only to this origin are
  set by the Cloudflare Worker; GitHub Pages uses the matching `<meta>` CSP.
- The front end builds DOM with `createElement`/`textContent`; `innerHTML` and
  `eval` are not used and are blocked by lint and CSP.

## Automated Controls

- ESLint (style + `no-eval`/`no-implied-eval`)
- Unit tests for the tone-scoring functions
- jazzer.js fuzz target for the audio input-processing path
- Gitleaks secret scanning (pre-commit and CI)
- CodeQL static analysis and OpenSSF Scorecard
