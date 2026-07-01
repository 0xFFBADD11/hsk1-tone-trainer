// Web Worker running on-device speech recognition (Whisper) via Transformers.js.
// Audio is transcribed in the browser; nothing is uploaded. The MODEL is
// vendored on our own origin (assets/vendor/models), so it never comes from a
// hub. The library + ONNX Runtime WASM are still pinned from jsDelivr for now;
// vendoring those too (to reach connect-src 'self') is the final step.
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
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
          dtype: 'q8',
          progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
        })
      }
      self.postMessage({ type: 'ready' })
    } else if (msg.type === 'transcribe') {
      // Greedy, no timestamps, and no-repeat to curb tiny-Whisper's tendency to
      // hallucinate a common phrase (好/你好/谢谢) on short single-syllable clips.
      const out = await transcriber(msg.audio, {
        language: 'chinese',
        task: 'transcribe',
        return_timestamps: false,
        no_repeat_ngram_size: 3,
        temperature: 0
      })
      self.postMessage({ type: 'result', text: (out && out.text) || '' })
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) })
  }
}
