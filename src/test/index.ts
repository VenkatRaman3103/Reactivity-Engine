
export type Selector = string | { type: 'text' | 'role' | 'id', value: string, roleType?: string }

export type Step =
  | { type: 'click',   selector: Selector }
  | { type: 'type',    selector: Selector,  text: string }
  | { type: 'wait',    condition: () => boolean, timeout?: number }
  | { type: 'expect',  actual: any, matcher: string, expected?: any }
  | { type: 'see',     selector: Selector, exists?: boolean }
  | { type: 'log',     channel: string, value: any }
  | { type: 'pause',   ms: number }
  | { type: 'hover',   selector: Selector }
  | { type: 'focus',   selector: Selector }
  | { type: 'mock',    url: string | RegExp, expected: any, status?: number, delay?: number }

export const find = {
  text:  (value: string): Selector => ({ type: 'text', value }),
  role:  (roleType: string, value: string): Selector => ({ type: 'role', value, roleType }),
  id:    (value: string): Selector => ({ type: 'id', value })
}

export function click(selector: Selector): Step {
  return { type: 'click', selector }
}

export function type(selector: Selector, text: string): Step {
  return { type: 'type', selector, text }
}

export function hover(selector: Selector): Step {
  return { type: 'hover', selector }
}

export function focus(selector: Selector): Step {
  return { type: 'focus', selector }
}

export function wait(condition: () => boolean, timeout = 3000): Step {
  return { type: 'wait', condition, timeout }
}

export function see(selector: Selector): {
  exists: () => Step
  absent: () => Step
} {
  return {
    exists: () => ({ type: 'see', selector, exists: true }),
    absent: () => ({ type: 'see', selector, exists: false })
  }
}

export function expect(actual: any): {
  is:           (expected: any) => Step
  isNot:        (expected: any) => Step
  contains:     (expected: any) => Step
  toBeVisible:  () => Step
  toHaveClass:  (className: string) => Step
  toMatchSnapshot: () => Step
} {
  return {
    is:           (expected)  => ({ type: 'expect', actual, matcher: 'is',       expected }),
    isNot:        (expected)  => ({ type: 'expect', actual, matcher: 'isNot',    expected }),
    contains:     (expected)  => ({ type: 'expect', actual, matcher: 'contains', expected }),
    toBeVisible:  ()          => ({ type: 'expect', actual, matcher: 'visible' }),
    toHaveClass:  (className) => ({ type: 'expect', actual, matcher: 'class',    expected: className }),
    toMatchSnapshot: ()       => ({ type: 'expect', actual, matcher: 'snapshot' })
  }
}

export function pause(ms: number): Step {
  return { type: 'pause', ms }
}

export { clearMocks } from './network'
export { clearSnapshots } from './snapshots'

export function mock(url: string | RegExp, response: any): any {
  const m: any = {
    type: 'mock',
    url,
    expected: response,
    _status: 200,
    _delay: 0,
    _once: false,
    _times: -1
  }

  m.delay  = (ms: number) => { m._delay = ms; return m }
  m.status = (code: number) => { m._status = code; return m }
  m.once   = () => { m._once = true; m._times = 1; return m }
  m.times  = (n: number) => { m._times = n; return m }

  return m
}

// --- New Suite & Hook Support ---

export interface TestDefinition {
  name: string
  steps: Step[]
}

export interface SuiteDefinition {
  name: string
  tests: TestDefinition[]
  beforeEach?: () => void | Promise<void>
}

let currentSuite: SuiteDefinition | null = null
export const suites: SuiteDefinition[] = []

export function suite(name: string, fn: () => void) {
  const outerSuite = currentSuite
  currentSuite = { name, tests: [] }
  fn()
  suites.push(currentSuite)
  currentSuite = outerSuite
}

export function test(name: string, steps: Step[]) {
  if (!currentSuite) {
    suite('Global Tests', () => {
      currentSuite!.tests.push({ name, steps })
    })
    return
  }
  currentSuite.tests.push({ name, steps })
}

export function beforeEach(fn: () => void | Promise<void>) {
  if (currentSuite) {
    currentSuite.beforeEach = fn
  }
}

/**
 * Universal play function that handles both standalone steps 
 * and registered suites by name.
 */
export { play } from "./runner"
