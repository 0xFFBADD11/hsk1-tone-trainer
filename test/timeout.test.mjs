import test from 'node:test'
import assert from 'node:assert/strict'
import { withTimeout } from '../assets/js/timeout.js'

test('resolves with the promise value when it settles before the timeout', async () => {
  const result = await withTimeout(Promise.resolve('ok'), 100, 'timed out')
  assert.equal(result, 'ok')
})

test('rejects with the timeout message when the promise never settles in time', async () => {
  const never = new Promise(() => {})
  await assert.rejects(withTimeout(never, 20, 'took too long'), /took too long/)
})

test('propagates a rejection from the promise itself, not the timeout', async () => {
  await assert.rejects(
    withTimeout(Promise.reject(new Error('boom')), 100, 'timed out'),
    /boom/
  )
})
