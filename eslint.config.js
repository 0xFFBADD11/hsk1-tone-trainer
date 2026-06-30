// Flat ESLint config enforcing the project house style and the
// security bans (no eval, no implied eval). Browser globals cover the
// front end; Node globals cover tests and tooling.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  requestAnimationFrame: 'readonly',
  cancelAnimationFrame: 'readonly',
  AudioContext: 'readonly',
  webkitAudioContext: 'readonly',
  SpeechSynthesisUtterance: 'readonly',
  Float32Array: 'readonly',
  Headers: 'readonly',
  Response: 'readonly',
  Request: 'readonly'
}

export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...browserGlobals, globalThis: 'readonly', console: 'readonly', process: 'readonly' }
    },
    rules: {
      semi: ['error', 'never'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-unused-vars': 'error',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
]
