// Web Worker running on-device speech recognition (Whisper) via Transformers.js.
// Audio is transcribed in the browser; nothing is uploaded. whisper-base is
// vendored on our own origin (whisper-small OOMs mobile Safari, so base is the
// practical ceiling). The library + ONNX Runtime WASM come from jsDelivr.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'

// GitHub Pages cannot send COOP/COEP headers, so SharedArrayBuffer (and thus
// multi-threaded WASM) is unavailable — force single-threaded ONNX Runtime.
env.backends.onnx.wasm.numThreads = 1

// Load the model only from this site, not from a remote hub.
env.allowRemoteModels = false
env.allowLocalModels = true
env.localModelPath = new URL('../vendor/models', import.meta.url).href

let transcriber = null

self.onmessage = async (e) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-base', {
          dtype: 'q8',
          progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
        })
      }
      self.postMessage({ type: 'ready' })
    } else if (msg.type === 'transcribe') {
      // Cap output length and penalize repetition so a bad clip can't spiral
      // into a huge repeated generation (the "射射射…" runaway) that eats memory.
      const out = await transcriber(msg.audio, {
        language: 'chinese',
        task: 'transcribe',
        return_timestamps: false,
        max_new_tokens: 48,
        no_repeat_ngram_size: 3,
        repetition_penalty: 1.5,
        // Beam search yields cleaner Chinese output (fewer Latin/garbled results
        // for real Chinese speech) than greedy decoding.
        num_beams: 3
      })
      self.postMessage({ type: 'result', text: (out && out.text) || '' })
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) })
  }
}
