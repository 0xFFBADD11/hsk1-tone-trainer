import test from 'node:test'
import assert from 'node:assert/strict'
import worker from '../worker/index.js'

function mockEnv(body = 'ok', status = 200) {
  return {
    ASSETS: {
      fetch: async () => new Response(body, {
        status,
        headers: { 'content-type': 'text/html; charset=utf-8' }
      })
    }
  }
}

test('stamps a CSP that allows the vendored-model library hosts', async () => {
  const res = await worker.fetch(new Request('https://trainer.example/'), mockEnv())
  const csp = res.headers.get('Content-Security-Policy')
  assert.equal(res.status, 200)
  assert.match(csp, /script-src[^;]*'wasm-unsafe-eval'/)
  assert.match(csp, /script-src[^;]*https:\/\/cdn\.jsdelivr\.net/)
  assert.match(csp, /worker-src[^;]*blob:/)
  assert.match(csp, /connect-src[^;]*https:\/\/cdn\.jsdelivr\.net/)
  assert.doesNotMatch(csp, /unsafe-inline/)
  assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff')
  assert.equal(res.headers.get('X-Frame-Options'), 'DENY')
  assert.match(res.headers.get('Permissions-Policy'), /microphone=\(self\)/)
})

test('rejects methods other than GET and HEAD', async () => {
  const res = await worker.fetch(new Request('https://trainer.example/', { method: 'POST' }), mockEnv())
  assert.equal(res.status, 405)
  assert.equal(res.headers.get('Allow'), 'GET, HEAD')
})
