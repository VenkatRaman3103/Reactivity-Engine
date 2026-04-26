
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
  switch (step.type) {

    case 'click': {
      const el = document.querySelector(step.selector)
      if (!el) throw new Error(`Element not found: ${step.selector}`)
      moveCursorTo(el)
      await sleep(speed / 2)
      ;(el as HTMLElement).click()
      break
    }

    case 'type': {
      const el = document.querySelector(step.selector) as HTMLInputElement
      if (!el) throw new Error(`Element not found: ${step.selector}`)
      moveCursorTo(el)
      el.focus()
      for (const char of step.text) {
        el.value += char
        el.dispatchEvent(new Event('input', { bubbles: true }))
        await sleep(speed / step.text.length)
      }
      break
    }

    case 'wait': {
      const timeout = step.timeout ?? 3000
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
      const value = typeof actual === 'function' ? actual() : actual

      if (matcher === 'is' && value !== expected) {
        throw new Error(
          `Expected ${JSON.stringify(value)} to be ${JSON.stringify(expected)}`
        )
      }
      if (matcher === 'isNot' && value === expected) {
        throw new Error(
          `Expected ${JSON.stringify(value)} not to be ${JSON.stringify(expected)}`
        )
      }
      if (matcher === 'contains' && !String(value).includes(String(expected))) {
        throw new Error(
          `Expected ${JSON.stringify(value)} to contain ${JSON.stringify(expected)}`
        )
      }
      break
    }

    case 'see': {
      const el      = document.querySelector(step.selector)
      const exists  = step.exists ?? true
      if (exists && !el) {
        throw new Error(`Expected ${step.selector} to exist`)
      }
      if (!exists && el) {
        throw new Error(`Expected ${step.selector} not to exist`)
      }
      break
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

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}
