
import { Step } from './index'
import { log }  from '../log'
import { moveCursorTo } from './cursor'
import { showTestOverlay } from './overlay'

export interface PlayOptions {
  speed?:  'slow' | 'normal' | 'fast'
  silent?: boolean
}

const SPEEDS = { slow: 800, normal: 400, fast: 100 }

interface TestResult {
  name:   string
  steps:  StepResult[]
  passed: boolean
  time:   number
}

interface StepResult {
  step:    Step
  passed:  boolean
  error?:  string
  time:    number
}

export async function play(
  name:    string,
  steps:   Step[],
  options: PlayOptions = {}
): Promise<TestResult> {
  const speed   = SPEEDS[options.speed ?? 'normal']
  const results: StepResult[] = []
  const start   = performance.now()

  // show test runner overlay
  const overlay = showTestOverlay(name, steps)

  for (let i = 0; i < steps.length; i++) {
    const step      = steps[i]
    const stepStart = performance.now()

    // highlight current step in overlay
    overlay.setActive(i)

    try {
      await runStep(step, speed)

      results.push({
        step,
        passed: true,
        time:   performance.now() - stepStart
      })

      overlay.setResult(i, true)

    } catch (e: any) {
      results.push({
        step,
        passed: false,
        error:  e.message,
        time:   performance.now() - stepStart
      })

      overlay.setResult(i, false, e.message)

      // stop on first failure
      break
    }

    await sleep(speed)
  }

  const passed = results.every(r => r.passed)
  const time   = performance.now() - start

  overlay.setComplete(passed, time)

  if (!options.silent) {
    log.tests({ name, passed, time, results })
  }

  return { name, steps: results, passed, time }
}

async function runStep(step: Step, speed: number) {
  const AUTO_TIMEOUT = 5000

  switch (step.type) {

    case 'click': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT)
      moveCursorTo(el)
      await sleep(speed / 2)
      ;(el as HTMLElement).click()
      await settle()
      break
    }

    case 'type': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT) as HTMLInputElement
      moveCursorTo(el)
      el.focus()
      for (const char of step.text) {
        el.value += char
        el.dispatchEvent(new Event('input', { bubbles: true }))
        await sleep(speed / 10)
      }
      await settle()
      break
    }

    case 'hover': {
      const el = await waitForElement(step.selector, AUTO_TIMEOUT)
      moveCursorTo(el)
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
async function settle() {
  return new Promise(r => queueMicrotask(() => setTimeout(r, 0)))
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
