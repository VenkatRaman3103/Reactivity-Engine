// src/form/rules.ts

type RuleFn = (value: any) => string | null | Promise<string | null>

export const required = (message = 'This field is required'): RuleFn =>
  (value) => {
    if (value === null || value === undefined) return message
    if (typeof value === 'string' && !value.trim()) return message
    if (Array.isArray(value) && value.length === 0) return message
    return null
  }

export const email = (message = 'Invalid email address'): RuleFn =>
  (value) => {
    if (!value) return null
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : message
  }

export const url = (message = 'Invalid URL'): RuleFn =>
  (value) => {
    if (!value) return null
    try { new URL(value); return null }
    catch { return message }
  }

export const phone = (message = 'Invalid phone number'): RuleFn =>
  (value) => {
    if (!value) return null
    return /^\+?[\d\s\-().]{7,}$/.test(value) ? null : message
  }

export const minLength = (min: number, message?: string): RuleFn =>
  (value) => {
    if (!value) return null
    const msg = message ?? `Minimum ${min} characters`
    return String(value).length >= min ? null : msg
  }

export const maxLength = (max: number, message?: string): RuleFn =>
  (value) => {
    if (!value) return null
    const msg = message ?? `Maximum ${max} characters`
    return String(value).length <= max ? null : msg
  }

export const min = (n: number, message?: string): RuleFn =>
  (value) => {
    if (value === '' || value === null) return null
    const msg = message ?? `Minimum value is ${n}`
    return Number(value) >= n ? null : msg
  }

export const max = (n: number, message?: string): RuleFn =>
  (value) => {
    if (value === '' || value === null) return null
    const msg = message ?? `Maximum value is ${n}`
    return Number(value) <= n ? null : msg
  }

export const pattern = (regex: RegExp, message = 'Invalid format'): RuleFn =>
  (value) => {
    if (!value) return null
    return regex.test(String(value)) ? null : message
  }

export const numeric = (message = 'Must be a number'): RuleFn =>
  (value) => {
    if (!value && value !== 0) return null
    return !isNaN(Number(value)) ? null : message
  }

export const positive = (message = 'Must be a positive number'): RuleFn =>
  (value) => {
    if (!value && value !== 0) return null
    return Number(value) > 0 ? null : message
  }

export const custom = (
  fn: (value: any) => string | null | Promise<string | null>
): RuleFn => fn
