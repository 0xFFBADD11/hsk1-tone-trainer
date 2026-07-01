// Web Worker running on-device speech recognition (Whisper) via Transformers.js.
// Audio is transcribed in the browser; nothing is uploaded. During branch
// development the library and model load from the jsDelivr / Hugging Face CDNs;
// before merging to main these get vendored locally so connect-src stays 'self'.
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3'

// GitHub Pages cannot send COOP/COEP headers, so SharedArrayBuffer (and thus
// multi-threaded WASM) is unavailable — force single-threaded ONNX Runtime.
env.backends.onnx.wasm.numThreads = 1

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
      const out = await transcriber(msg.audio, { language: 'chinese', task: 'transcribe' })
      self.postMessage({ type: 'result', text: (out && out.text) || '' })
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: String((err && err.message) || err) })
  }
}
