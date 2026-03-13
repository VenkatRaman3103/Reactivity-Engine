// src/errors.ts

// @ts-ignore - import.meta.env is provided by Vite
const isDev = import.meta.env.DEV

export type ErrorCategory =
  | 'State'
  | 'Component'
  | 'Compiler'
  | 'Reactivity'
  | 'Navigation'
  | 'Derived'
  | 'Effect'
  | 'DOM'
  | 'Mount'

export interface EngineError {
  category: ErrorCategory
  what:     string
  why?:     string
  fix:      string
  file?:    string
}

export function engineError(err: EngineError): never {
  if (isDev) {
    const file = err.file ? ` — ${err.file}` : ''
    const why  = err.why  ? `\nWhy:  ${err.why}` : ''
    console.error(
      `\n[Engine] ${err.category} Error${file}` +
      `\nWhat: ${err.what}`                      +
      why                                        +
      `\nFix:  ${err.fix}\n`
    )
  }
  throw new Error(`[Engine] ${err.category}: ${err.what}`)
}

export function engineWarn(err: Omit<EngineError, 'fix'> & { fix?: string }) {
  if (!isDev) return
  const file = err.file ? ` — ${err.file}` : ''
  const why  = err.why  ? `\nWhy:  ${err.why}` : ''
  const fix  = err.fix  ? `\nFix:  ${err.fix}` : ''
  console.warn(
    `\n[Engine] ${err.category} Warning${file}` +
    `\nWhat: ${err.what}`                        +
    why                                          +
    fix                                          +
    '\n'
  )
}

export function engineInfo(category: ErrorCategory, message: string) {
  if (!isDev) return
  console.info(`[Engine] ${category}: ${message}`)
}
