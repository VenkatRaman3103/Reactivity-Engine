// src/form/helpers.ts

import type { FieldState } from './field'

export function setError(field: FieldState, message: string) {
  field.setError(message)
}

export function clearError(field: FieldState) {
  field.clearError()
}

export function touchAll(...fields: FieldState[]) {
  fields.forEach(f => f.touch())
}

export function allValid(...fields: FieldState[]): boolean {
  return fields.every(f => f.ok)
}

export function resetAll(...fields: FieldState[]) {
  fields.forEach(f => f.reset())
}
