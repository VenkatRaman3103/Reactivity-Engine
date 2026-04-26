import { log } from '@engine'

export let count = 0
export let todos = [
  { id: 1, text: 'Build Reactivity Engine', completed: true },
  { id: 2, text: 'Implement Style System', completed: true },
  { id: 3, text: 'Create Test Runner', completed: false }
]
export let inputValue = ''
export let isModalOpen = false
export let theme: 'light' | 'dark' = 'light'

export function increment() { count++ }
export function decrement() { count-- }

export function addTodo(text: string) {
  if (!text) return
  todos = [...todos, { id: Date.now(), text, completed: false }]
  inputValue = ''
}

export function toggleTodo(id: number) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
}

export function removeTodo(id: number) {
  todos = todos.filter(t => t.id !== id)
}

export function setInput(val: string) {
  inputValue = val
}

export function toggleModal() {
  isModalOpen = !isModalOpen
}
export function toggleTheme() {
  theme = theme === 'light' ? 'dark' : 'light'
  log.theme_debug(`Theme toggled to: ${theme}`)
}
export function setTheme(val: 'light' | 'dark') {
  theme = val
}

export let logsCount = 0
export let items: number[] = []

export function bulkAdd(n: number) {
  log.bulk_add(`Adding ${n} items. Previous count: ${items.length}`)
  const start = performance.now()
  const newItems = Array.from({ length: n }, (_, i) => i)
  items = [...items, ...newItems]
  return performance.now() - start
}

export function clearItems() {
  items = []
}

export function incrementLogs() {
  logsCount++
}

export function resetState() {
  count = 0
  todos = [
    { id: 1, text: 'Build Reactivity Engine', completed: true },
    { id: 2, text: 'Implement Style System', completed: true },
    { id: 3, text: 'Create Test Runner', completed: false }
  ]
  inputValue = ''
  isModalOpen = false
  theme = 'light'
  items = []
  logsCount = 0
}
