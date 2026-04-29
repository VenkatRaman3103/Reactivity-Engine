export let count = 0
export let message = 'Hello from Reactivity Engine!'
export let isVisible = true
export let items = ['State', 'Components', 'Reactivity', 'Forms', 'Routing']

export function increment() {
  count++
}

export function toggleVisibility() {
  isVisible = !isVisible
}

export function addItem() {
  items.push(`Item ${items.length + 1}`)
}

export function resetAll() {
  count = 0
  message = 'Hello from Reactivity Engine!'
  isVisible = true
  items = ['State', 'Components', 'Reactivity', 'Forms', 'Routing']
}
