
import { log } from '../log'

interface MockDefinition {
  url:        string | RegExp
  response:   any
  status:     number
  delay:      number
  remaining:  number // -1 for infinite
}

export interface CapturedRequest {
  url:      string
  response: any
}

const mocks: MockDefinition[] = []
let isIntercepting = false
const originalFetch = window.fetch

// --- Spy / Capture state ---
let isSpying = false
let spyLog: CapturedRequest[] = []
let preSpyFetch: typeof window.fetch = originalFetch

export function initNetworkInterceptor() {
  if (isIntercepting) return
  isIntercepting = true

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.href : input.url)
    
    // Find matching mock
    const match = mocks.find(m => {
      if (m.remaining === 0) return false
      return typeof m.url === 'string' ? url.includes(m.url) : m.url.test(url)
    })

    if (match) {
      log.test_debug(`[Network] Mocked call to: ${url}`)
      
      if (match.remaining > 0) match.remaining--
      
      if (match.delay > 0) {
        await new Promise(r => setTimeout(r, match.delay))
      }

      const body = typeof match.response === 'string' 
        ? match.response 
        : JSON.stringify(match.response)

      return new Response(body, {
        status: match.status,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Passthrough
    return originalFetch(input, init)
  }
}

export function mock(url: string | RegExp, response: any) {
  if (!isIntercepting) initNetworkInterceptor()

  const definition: MockDefinition = {
    url,
    response,
    status: 200,
    delay: 0,
    remaining: -1
  }

  mocks.push(definition)

  const api = {
    delay: (ms: number) => { definition.delay = ms; return api },
    status: (code: number) => { definition.status = code; return api },
    once: () => { definition.remaining = 1; return api },
    times: (n: number) => { definition.remaining = n; return api }
  }

  return api
}

export function clearMocks() {
  mocks.length = 0
}

export function restoreNetwork() {
  window.fetch = originalFetch
  isIntercepting = false
  clearMocks()
}

/**
 * Start spy mode: every fetch() passes through but the URL + response
 * body are captured so the recorder can auto-generate mock() steps.
 */
export function startNetworkSpy() {
  if (isSpying) return
  isSpying  = true
  spyLog    = []
  // Wrap whatever fetch is currently active (could be the mock interceptor)
  preSpyFetch   = window.fetch

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.href
        : (input as Request).url

    // Call the real (or already-mocked) fetch
    const res = await preSpyFetch(input, init)

    // Clone so the caller can still consume the body
    try {
      const cloned = res.clone()
      const text   = await cloned.text()
      let parsed: any = text
      try { parsed = JSON.parse(text) } catch {}
      spyLog.push({ url, response: parsed })
      log.test_debug(`[Recorder] Captured network call: ${url}`)
    } catch {}

    return res
  }
}

/**
 * Stop spy mode and return captured calls. Restores fetch to the
 * state it was in before spying started.
 */
export function stopNetworkSpy(): CapturedRequest[] {
  if (!isSpying) return []
  isSpying       = false
  window.fetch   = preSpyFetch
  const captured = [...spyLog]
  spyLog         = []
  return captured
}
