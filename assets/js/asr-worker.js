// Web Worker running on-device speech recognition (Whisper) via Transformers.js.
// Audio is transcribed in the browser; nothing is uploaded. whisper-base is
// vendored on our own origin (whisper-small OOMs mobile Safari, so base is the
// practical ceiling).
//
// Transformers.js is loaded with a DYNAMIC import of jsDelivr's flattened ESM
// bundle (/+esm). A top-level static cross-origin import fails to start the
// worker in Chrome; dynamic import of the +esm bundle works across browsers.

let transcriber = null

async function getTranscriber(onProgress) {
  if (transcriber) return transcriber
  const { pipeline, env } = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/+esm')
  // GitHub Pages cannot send COOP/COEP, so no SharedArrayBuffer / threads.
  env.backends.onnx.wasm.numThreads = 1
  // Load the model only from this site, not from a remote hub.
  env.allowRemoteModels = false
  env.allowLocalModels = true
  env.localModelPath = new URL('../vendor/models', import.meta.url).href
  transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
    dtype: 'q8',
    progress_callback: onProgress
  })
  return transcriber
}

self.onmessage = async (e) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      await getTranscriber((p) => self.postMessage({ type: 'progress', data: p }))
      self.postMessage({ type: 'ready' })
    } else if (msg.type === 'transcribe') {
      const t = await getTranscriber()
      // Cap output length and penalize repetition so a bad clip can't spiral
      // into a huge repeated generation; beam search yields cleaner Chinese.
      const out = await t(msg.audio, {
        language: 'chinese',
        task: 'transcribe',
        return_timestamps: false,
        max_new_tokens: 48,
        no_repeat_ngram_size: 3,
        repetition_penalty: 1.5,
        num_beams: 3
      })
      self.postMessage({ type: 'result', text: (out && out.text) || '' })
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) })
  }
}
