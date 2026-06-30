// Cloudflare Worker that serves the static trainer and stamps strong
// security headers on every response. The strict CSP (no 'unsafe-inline')
// is what lets the front end forbid inline scripts and innerHTML.

const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
    "media-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; " +
    "form-action 'none'; object-src 'none'",
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'microphone=(self), camera=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin'
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
    }
    const asset = await env.ASSETS.fetch(request)
    const headers = new Headers(asset.headers)
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value)
    return new Response(asset.body, { status: asset.status, statusText: asset.statusText, headers })
  }
}
