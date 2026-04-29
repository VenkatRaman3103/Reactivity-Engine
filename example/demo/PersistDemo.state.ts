import { persist } from '../../src/index'

export let count = persist(0, 'demo-counter')
export let theme = persist('light', 'demo-theme')

export function increment() { count++ }
export function decrement() { count-- }
export function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light'
}
