// src/form/field.ts

import { createSignal } from '../reactive'

type RuleFn = (value: any) => string | null | Promise<string | null>

export interface FieldState {
  value:     any
  error:     string | null
  ok:        boolean
  touched:   boolean
  touch:     () => void
  setError:  (msg: string) => void
  clearError: () => void
  reset:     () => void
}

export function field(
  initial:  any,
  ...rules: RuleFn[]
): FieldState {
  const [getValue, setValue] = createSignal(initial, 'internal:form:value')
  const [getRuleError, setRuleError] = createSignal<string | null>(null, 'internal:form:ruleError')
  const [getCustomError, setCustomError] = createSignal<string | null>(null, 'internal:form:customError')
  const [getTouched, setTouched] = createSignal(false, 'internal:form:touched')
  const _initial = initial

  let currentRunId = 0
  const runRules = (value: any) => {
    currentRunId++
    const runId = currentRunId

    for (let i = 0; i < rules.length; i++) {
      const res = rules[i](value)
      
      if (res instanceof Promise) {
        res.then(async (err) => {
          if (currentRunId !== runId) return
          if (err) { setRuleError(err); return }
          
          for (let j = i + 1; j < rules.length; j++) {
            const asyncRes = await rules[j](value)
            if (currentRunId !== runId) return
            if (asyncRes) { setRuleError(asyncRes); return }
          }
          if (currentRunId === runId) setRuleError(null)
        })
        return
      } else if (res) {
        setRuleError(res)
        return
      }
    }
    setRuleError(null)
  }

  const state: FieldState = {
    get value() {
      return getValue()
    },

    set value(v: any) {
      if (v === getValue()) return
      setCustomError(null)
      runRules(v)
      setValue(v)
    },

    get error(): string | null {
      if (!getTouched()) return null
      return getCustomError() ?? getRuleError()
    },

    get ok(): boolean {
      // Access values to establish dependencies
      const rErr = getRuleError()
      const cErr = getCustomError()
      return rErr === null && cErr === null
    },

    get touched(): boolean {
      return getTouched()
    },

    touch() {
      setTouched(true)
      runRules(getValue())
    },

    setError(msg: string) {
      setCustomError(msg)
      setTouched(true)
    },

    clearError() {
      setCustomError(null)
    },

    reset() {
      setValue(_initial)
      setTouched(false)
      setCustomError(null)
      setRuleError(null)
    }
  }

  // Pre-validate initial state so that `ok` tracks correctly from the start
  runRules(_initial)

  return state
}
