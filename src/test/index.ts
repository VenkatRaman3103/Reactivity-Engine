
export type Step =
  | { type: 'click',   selector: string }
  | { type: 'type',    selector: string,  text: string }
  | { type: 'wait',    condition: () => boolean, timeout?: number }
  | { type: 'expect',  actual: any, matcher: 'is' | 'isNot' | 'contains', expected: any }
  | { type: 'see',     selector: string, exists?: boolean }
  | { type: 'log',     channel: string, value: any }
  | { type: 'pause',   ms: number }

export function click(selector: string): Step {
  return { type: 'click', selector }
}

export function type(selector: string, text: string): Step {
  return { type: 'type', selector, text }
}

export function wait(condition: () => boolean, timeout = 3000): Step {
  return { type: 'wait', condition, timeout }
}

export function see(selector: string): {
  exists: () => Step
  absent: () => Step
} {
  return {
    exists: () => ({ type: 'see', selector, exists: true }),
    absent: () => ({ type: 'see', selector, exists: false })
  }
}

export function expect(actual: any): {
  is:       (expected: any) => Step
  isNot:    (expected: any) => Step
  contains: (expected: any) => Step
} {
  return {
    is:       (expected) => ({ type: 'expect', actual, matcher: 'is',       expected }),
    isNot:    (expected) => ({ type: 'expect', actual, matcher: 'isNot',    expected }),
    contains: (expected) => ({ type: 'expect', actual, matcher: 'contains', expected })
  }
}

export function pause(ms: number): Step {
  return { type: 'pause', ms }
}
