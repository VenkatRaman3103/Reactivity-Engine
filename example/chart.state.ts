export let data = [
  { id: 1, label: 'Jan', value: 30 },
  { id: 2, label: 'Feb', value: 80 },
  { id: 3, label: 'Mar', value: 45 },
  { id: 4, label: 'Apr', value: 90 },
  { id: 5, label: 'May', value: 60 },
]

export let max = 100

export function randomizeChart() {
  data = data.map(d => ({ ...d, value: Math.floor(Math.random() * max) }))
}
