import { persist } from '../src/index'

export let count = 0
export let step = 1
export let theme = 'light'
export let transientData = 'this will not stick'

persist('persist-demo', { count, step, theme, transientData }, {
  omit: ['transientData'],
  version: 1
})

export function increment() { count = Number(count) + Number(step) }
export function decrement() { count = Number(count) - Number(step) }
export function reset()     { count = 0; step = 1 }
export function toggleTheme() { theme = theme === 'light' ? 'dark' : 'light' }
export function setStep(v: number | string) { step = Number(v) }
export function setTransientData(v: string) { transientData = v }
