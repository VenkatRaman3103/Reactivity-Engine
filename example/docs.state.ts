export let currentPage = 'intro'
export let activeSection = ''
export let searchQuery = ''

export const sections = [
  { id: 'intro', title: 'Introduction', icon: '📖' },
  { id: 'state', title: 'State Management', icon: '📦' },
  { id: 'components', title: 'Components', icon: '🧩' },
  { id: 'reactivity', title: 'Reactivity', icon: '⚡' },
  { id: 'forms', title: 'Form Handling', icon: '📝' },
  { id: 'routing', title: 'Routing', icon: '🧭' },
  { id: 'layouts', title: 'Layouts', icon: '📐' },
  { id: 'styling', title: 'Styling', icon: '🎨' },
  { id: 'async', title: 'Async & Suspense', icon: '⏳' },
  { id: 'testing', title: 'Testing', icon: '🧪' },
  { id: 'devtools', title: 'DevTools', icon: '🔧' },
  { id: 'utilities', title: 'Utilities', icon: '🛠️' }
]

export function navigateTo(page: string) {
  currentPage = page
  activeSection = page
}

export function setSearch(query: string) {
  searchQuery = query
}
