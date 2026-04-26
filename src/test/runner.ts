import { Step, SuiteDefinition, TestDefinition, suites } from './index'
import { log }  from '../log'
import { moveCursorTo, clickRipple, removeCursor } from './cursor'
import { showTestOverlay } from './overlay'

export interface PlayOptions {
  speed?:  'slow' | 'normal' | 'fast'
  silent?: boolean
}

const SPEEDS = { slow: 800, normal: 400, fast: 100 }

interface StepResult {
  step:    Step
  passed:  boolean
  error?:  string
  time:    number
}

export async function play(
  target:  string | Step[],
  steps?:  Step[],
  options: PlayOptions = {}
): Promise<any> {
  // Signature 1: play(steps, options)
  if (Array.isArray(target)) {
    return runStandalone('Anonymous Test', target, steps as any || options)
  }

  // Signature 2: play(name, steps, options)
  if (typeof target === 'string' && Array.isArray(steps)) {
    return runStandalone(target, steps, options)
  }

  // Signature 3: play(suiteName, options)
  if (typeof target === 'string') {
    const matchedSuite = suites.find(s => s.name === target)
    if (!matchedSuite) throw new Error(`Suite "${target}" not found`)
    return runSuite(matchedSuite, steps as any || options)
  }
}

async function runStandalone(name: string, steps: Step[], options: PlayOptions) {
  const speed = SPEEDS[options.speed ?? 'normal']
  const overlay = showTestOverlay(name, steps)
  const results: StepResult[] = []
  const start = performance.now()

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const stepStart = performance.now()
    overlay.setActive(i)

    try {
      await runStep(step, speed)
      results.push({ step, passed: true, time: performance.now() - stepStart })
      overlay.setResult(i, true)
    } catch (e: any) {
      results.push({ step, passed: false, error: e.message, time: performance.now() - stepStart })
      overlay.setResult(i, false, e.message)
      break
    }
    await sleep(speed)
  }

  const passed = results.every(r => r.passed)
  const time = performance.now() - start
  overlay.setComplete(passed, time)
  removeCursor()

  if (!options.silent) {
    log.tests({ name, passed, time, results })
  }

  return { name, passed, time, results }
}

async function runSuite(suite: SuiteDefinition, options: PlayOptions = {}) {
  log.test_debug(`Running Suite: ${suite.name}`)
  const suiteResults = []

  for (const t of suite.tests) {
    // Run beforeEach if it exists
    if (suite.beforeEach) {
      log.test_debug(`Running beforeEach for: ${t.name}`)
      await suite.beforeEach()
      await settle()
    }

    const result = await runStandalone(`${suite.name} > ${t.name}`, t.steps, options)
    suiteResults.push(result)
    
    // If a test fails, we stop the suite? (Usually yes in E2E)
    if (!result.passed) break
    
    await sleep(1000) // Small gap between tests
  }
  
  return suiteResults
}

async function runStep(step: Step, speed: number) {
  const AUTO_TIMEOUT = 5000

  switch (step.type) {

    case 'click': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT) as HTMLElement
      highlight(el)
      await ensureInViewport(el)
      moveCursorTo(el)
      await sleep(speed)
      clickRipple()
      await sleep(200)
      el.click()
      await settle()
      break
    }

    case 'type': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT) as HTMLInputElement
      highlight(el)
      await ensureInViewport(el)
      moveCursorTo(el)
      await sleep(speed)
      el.focus()
      for (const char of step.text) {
        el.value += char
        el.dispatchEvent(new Event('input', { bubbles: true }))
        await sleep(50)
      }
      await settle()
      break
    }

    case 'hover': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT) as HTMLElement
      highlight(el)
      await ensureInViewport(el)
      moveCursorTo(el)
      await sleep(speed)
      el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      break
    }

    case 'focus': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT) as HTMLElement
      el.focus()
      break
    }

    case 'wait': {
      const timeout = step.timeout ?? AUTO_TIMEOUT
      const start   = Date.now()
      while (!step.condition()) {
        if (Date.now() - start > timeout) {
          throw new Error(`Wait condition timed out after ${timeout}ms`)
        }
        await sleep(50)
      }
      break
    }

    case 'expect': {
      const { actual, matcher, expected } = step
      const start = Date.now()
      
      while (Date.now() - start < AUTO_TIMEOUT) {
        try {
          let value = typeof actual === 'function' ? actual() : actual
          
          if (matcher === 'contains' && typeof value === 'string' && (value.startsWith('#') || value.startsWith('.'))) {
            const el = resolveElement(value)
            value = el?.textContent?.trim() || ""
          }

          if (matcher === 'is') {
            if (value === expected) return
            throw new Error(`Expected ${JSON.stringify(value)} to be ${JSON.stringify(expected)}`)
          }
          
          if (matcher === 'isNot') {
            if (value !== expected) return
            throw new Error(`Expected ${JSON.stringify(value)} not to be ${JSON.stringify(expected)}`)
          }

          if (matcher === 'visible') {
            const el = resolveElement(value) as HTMLElement
            if (el && isElementVisible(el)) return
            throw new Error(`Expected element to be visible`)
          }

          if (matcher === 'class') {
            const el = resolveElement(value)
            if (el && el.classList.contains(expected)) return
            throw new Error(`Expected element to have class "${expected}"`)
          }

          if (matcher === 'contains') {
            if (String(value).includes(String(expected))) return
            throw new Error(`Expected ${JSON.stringify(value)} to contain ${JSON.stringify(expected)}`)
          }
        } catch (e) {
          if (Date.now() - start > AUTO_TIMEOUT - 200) throw e
        }
        await sleep(100)
      }
      break
    }

    case 'see': {
      const exists = step.exists ?? true
      const start  = Date.now()
      
      while (Date.now() - start < AUTO_TIMEOUT) {
        const el = resolveElement(step.selector)
        if (exists && el) return
        if (!exists && !el) return
        await sleep(100)
      }
      
      throw new Error(`Expected ${formatSelector(step.selector)} to ${exists ? 'exist' : 'be absent'}`)
    }

    case 'pause': {
      await sleep(step.ms)
      break
    }

    case 'log': {
      log[step.channel](step.value)
      break
    }
  }
}

function resolveElement(selector: any): Element | null {
  if (typeof selector === 'string') {
    return document.querySelector(selector)
  }

  const { type, value, roleType } = selector
  
  if (type === 'id') {
    return document.getElementById(value)
  }

  if (type === 'text') {
    const items = Array.from(document.querySelectorAll('button, a, span, p, h1, h2, h3, h4, div, li, label'))
    let bestMatch: Element | null = null
    let smallestSize = Infinity

    for (const el of items) {
      if (el.closest('#engine-test-overlay')) continue
      
      const text = el.textContent?.trim() || ""
      if (text.includes(value)) {
        // We want the element with the shortest text content that still matches
        // This usually means it's the most specific element (e.g. the button, not the body)
        if (text.length < smallestSize) {
          smallestSize = text.length
          bestMatch = el
        }
      }
    }
    
    if (bestMatch) {
      log.test_debug(`Matched deepest element: ${bestMatch.tagName}#${bestMatch.id || 'no-id'} with text: "${bestMatch.textContent?.trim().slice(0, 30)}"`)
      return bestMatch
    }
  }

  if (type === 'role') {
    // Basic role/text combination search
    const els = document.querySelectorAll(`[role="${roleType}"], ${roleType}`)
    for (const el of els) {
      if (el.textContent?.includes(value)) return el
    }
  }

  return null
}

function formatSelector(selector: any): string {
  if (typeof selector === 'string') return selector
  if (selector.type === 'text') return `text("${selector.value}")`
  if (selector.type === 'role') return `role("${selector.roleType}", "${selector.value}")`
  return selector.value
}

async function waitForElement(selector: any, timeout: number): Promise<Element> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    const el = resolveElement(selector)
    if (el) return el
    await sleep(100)
  }
  throw new Error(`Element not found: ${formatSelector(selector)}`)
}

function isElementVisible(el: HTMLElement): boolean {
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0' &&
         el.getClientRects().length > 0
}

/**
 * Wait for reactivity microtasks to settle
 */
async function ensureInViewport(el: HTMLElement) {
  const rect = el.getBoundingClientRect()
  const isVisible = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )

  if (!isVisible) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // Wait for the smooth scroll to finish
    await sleep(600)
  }
}

async function settle() {
  return new Promise(r => queueMicrotask(() => setTimeout(r, 0)))
}

function highlight(el: HTMLElement) {
  el.classList.add('engine-test-highlight')
  setTimeout(() => el.classList.remove('engine-test-highlight'), 1000)
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
