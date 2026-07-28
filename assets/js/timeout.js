// Race a promise against a timer, rejecting with `message` if the timer wins.
// For operations with no native timeout (e.g. dynamic import(), a stuck
// AudioContext resume) that can otherwise hang indefinitely instead of
// rejecting on failure.
export function withTimeout(promise, ms, message) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
