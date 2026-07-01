// Web Worker running on-device speech recognition (Whisper) via Transformers.js.
// Audio is transcribed in the browser; nothing is uploaded. whisper-small is too
// large to bundle within GitHub's 100 MB file limit, so the MODEL streams from
// the Hugging Face hub (cached by the browser after first load). The library +
// ONNX Runtime WASM come from jsDelivr.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1'

// GitHub Pages cannot send COOP/COEP headers, so SharedArrayBuffer (and thus
// multi-threaded WASM) is unavailable — force single-threaded ONNX Runtime.
env.backends.onnx.wasm.numThreads = 1

// The model is fetched from the hub (it is larger than can be vendored here).
env.allowRemoteModels = true
env.allowLocalModels = false

let transcriber = null

self.onmessage = async (e) => {
  const msg = e.data
  try {
    if (msg.type === 'load') {
      if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-small', {
          dtype: 'q8',
          progress_callback: (p) => self.postMessage({ type: 'progress', data: p })
        })
      }
      self.postMessage({ type: 'ready' })
    } else if (msg.type === 'transcribe') {
      const out = await transcriber(msg.audio, {
        language: 'chinese',
        task: 'transcribe',
        return_timestamps: false
      })
      self.postMessage({ type: 'result', text: (out && out.text) || '' })
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) })
  }
}
