
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
} {
  return {
    is:           (expected)  => ({ type: 'expect', actual, matcher: 'is',       expected }),
    isNot:        (expected)  => ({ type: 'expect', actual, matcher: 'isNot',    expected }),
    contains:     (expected)  => ({ type: 'expect', actual, matcher: 'contains', expected }),
    toBeVisible:  ()          => ({ type: 'expect', actual, matcher: 'visible' }),
    toHaveClass:  (className) => ({ type: 'expect', actual, matcher: 'class',    expected: className })
  }
}

export function pause(ms: number): Step {
  return { type: 'pause', ms }
}
