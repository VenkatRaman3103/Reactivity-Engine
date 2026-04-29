import { h, Fragment } from '@engine/dom'
import { createEffect, derive } from '@engine/index'
import { navigateTo, currentPage, sections, activeSection } from './docs.state'
import { layout, sidebar, sidebarTitle, navItem, navItemActive, content, heading, paragraph, section, codeBlock, demoBox, button, subheading, badge } from './docs.style'
import DemoFeatures from './DemoFeatures'

const pageContent = derive(() => {
  const page = currentPage
  switch(page) {
    case 'intro': return <IntroPage />
    case 'state': return <StatePage />
    case 'components': return <ComponentsPage />
    case 'reactivity': return <ReactivityPage />
    case 'forms': return <FormsPage />
    case 'routing': return <RoutingPage />
    case 'layouts': return <LayoutsPage />
    case 'styling': return <StylingPage />
    case 'async': return <AsyncPage />
    case 'testing': return <TestingPage />
    case 'devtools': return <DevToolsPage />
    case 'utilities': return <UtilitiesPage />
    default: return <IntroPage />
  }
})

export default function Docs() {
  return (
    <div class={layout}>
      <aside class={sidebar}>
        <h2 class={sidebarTitle}>Reactivity Engine</h2>
        {sections.map(s => (
          <div
            class={activeSection === s.id ? navItemActive : navItem}
            onClick={() => navigateTo(s.id)}
          >
            <span style="margin-right: 8px">{s.icon}</span>
            {s.title}
          </div>
        ))}
      </aside>

      <main class={content}>
        {pageContent}
      </main>
    </div>
  )
}

function IntroPage() {
  return (
    <div>
      <h1 class={heading}>Reactivity Engine Documentation</h1>
      <p class={paragraph}>
        A lightweight, file-convention based reactivity engine for building modern web applications.
        No virtual DOM, no hooks, no boilerplate — just write TypeScript and let the engine handle reactivity.
      </p>

      <div class={section}>
        <h2 class={subheading}>Key Features <badge>Core</badge></h2>
        <p class={paragraph}>
          • File-based state with <code>.state.ts</code> — zero boilerplate reactive state<br/>
          • Automatic CSS generation from <code>.style.ts</code> — TS-to-CSS with reactive variables<br/>
          • Layout system with <code>.layout.ts</code> — class-based reusable layouts<br/>
          • Built-in testing framework with <code>.test.ts</code> — auto-discovered tests<br/>
          • Function components with JSX — no classes required<br/>
          • Deep reactivity for objects and arrays<br/>
          • Built-in DevTools (Ctrl+Shift+E)
        </p>
      </div>

      <div class={section}>
        <h2 class={subheading}>Quick Start</h2>
        <div class={codeBlock}>
{`// counter.state.ts
export let count = 0
export function increment() {
  count++
}`}
        </div>
        <div class={codeBlock}>
{`// Counter.tsx
import { h } from '@engine/dom'
import { count, increment } from './counter.state'

export default function Counter() {
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  )
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Live Demo <badge>Interactive</badge></h2>
        <p class={paragraph}>Try the engine features below:</p>
        <DemoFeatures />
      </div>
    </div>
  )
}

function StatePage() {
  return (
    <div>
      <h1 class={heading}>State Management</h1>
      <p class={paragraph}>File-based state with automatic reactivity using <code>.state.ts</code> convention.</p>

      <div class={section}>
        <h2 class={subheading}>Basic State <badge>Core</badge></h2>
        <p class={paragraph}>Export variables from <code>.state.ts</code> — they become reactive automatically.</p>
        <div class={codeBlock}>
{`// app.state.ts
export let count = 0
export let name = 'World'
export let items = ['a', 'b', 'c']

export function increment() {
  count++ // Triggers reactive updates
}

export function addItem(item: string) {
  items.push(item) // Array mutations are reactive
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Deep Reactivity</h2>
        <p class={paragraph}>Nested objects and arrays are deeply reactive. All array methods trigger updates.</p>
        <div class={codeBlock}>
{`// todo.state.ts
export let todos = [
  { id: 1, text: 'Learn engine', done: false }
]

export function toggleTodo(id: number) {
  const todo = todos.find(t => t.id === id)
  if (todo) todo.done = !todo.done // Deep reactivity
}

export function addTodo(text: string) {
  todos.push({ id: Date.now(), text, done: false })
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Persistence</h2>
        <p class={paragraph}>Persist state to localStorage or sessionStorage with <code>persist</code>.</p>
        <div class={codeBlock}>
{`import { persist } from '@engine/index'

// user.state.ts
export let user = { name: '', email: '' }

persist('user', user, {
  storage: 'local', // or 'session'
  expires: 3600, // seconds
  version: 1
})`}
        </div>
      </div>
    </div>
  )
}

function ComponentsPage() {
  return (
    <div>
      <h1 class={heading}>Components</h1>
      <p class={paragraph}>Function-based components with JSX, lifecycle hooks, and automatic reactivity.</p>

      <div class={section}>
        <h2 class={subheading}>Basic Component <badge>Core</badge></h2>
        <p class={paragraph}>Write components as functions returning JSX. No classes or hooks needed.</p>
        <div class={codeBlock}>
{`// Greeting.tsx
import { h } from '@engine/dom'
import { name } from './app.state'

export default function Greeting() {
  return <h1>Hello, {name}!</h1>
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Lifecycle Hooks</h2>
        <p class={paragraph}>Use <code>onMount</code>, <code>onUnmount</code>, and <code>onError</code> for lifecycle management.</p>
        <div class={codeBlock}>
{`import { onMount, onUnmount } from '@engine/index'

export default function MyComponent() {
  onMount(() => {
    console.log('Component mounted')
    return () => console.log('Cleanup')
  })

  onUnmount(() => {
    console.log('Component will unmount')
  })

  return <div>Content</div>
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Two-Way Binding</h2>
        <p class={paragraph}>Use <code>bind:value</code> for automatic two-way data binding on inputs.</p>
        <div class={codeBlock}>
{`import { h } from '@engine/dom'
import { name } from './app.state'

export default function InputDemo() {
  return (
    <div>
      <input bind:value={name} />
      <p>Your name: {name}</p>
    </div>
  )
}`}
        </div>
      </div>
    </div>
  )
}

function ReactivityPage() {
  return (
    <div>
      <h1 class={heading}>Reactivity</h1>
      <p class={paragraph}>Effects, derived state, and conditional reactivity primitives.</p>

      <div class={section}>
        <h2 class={subheading}>Effects <badge>Core</badge></h2>
        <p class={paragraph}>Use <code>createEffect</code> to run side effects when dependencies change.</p>
        <div class={codeBlock}>
{`import { createEffect } from '@engine/index'
import { count } from './counter.state'

createEffect(() => {
  console.log('Count changed:', count)
  document.title = \`Count: \${count}\`
})`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Derived State</h2>
        <p class={paragraph}>Use <code>derive</code> for computed values that update when dependencies change.</p>
        <div class={codeBlock}>
{`import { derive } from '@engine/index'
import { todos } from './todo.state'

export const completedCount = derive(() => {
  return todos.filter(t => t.done).length
})

export const progress = derive(() => {
  return (completedCount / todos.length) * 100
})`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Conditional Reactivity</h2>
        <p class={paragraph}>Use <code>when</code> and <code>whenever</code> for conditional execution.</p>
        <div class={codeBlock}>
{`import { when, whenever } from '@engine/index'
import { Mount, Unmount } from '@engine/index'

// Run once when condition is true
when(() => count > 10, () => {
  console.log('Count exceeded 10!')
})

// Run every time condition is true
whenever(() => isLoaded, () => {
  console.log('Data loaded')
})

// With lifecycle symbols
when(Mount, () => console.log('Mounted'))
when(Unmount, () => console.log('Unmounted'))`}
        </div>
      </div>
    </div>
  )
}

function FormsPage() {
  return (
    <div>
      <h1 class={heading}>Form Handling</h1>
      <p class={paragraph}>Reactive form fields with built-in validation rules.</p>

      <div class={section}>
        <h2 class={subheading}>Field Primitive <badge>Core</badge></h2>
        <p class={paragraph}>Use <code>field</code> to create reactive form fields with validation.</p>
        <div class={codeBlock}>
{`import { field, required, email } from '@engine/form'

const username = field('', required('Username is required'))
const emailField = field('', required(), email())

export default function SignupForm() {
  return (
    <form>
      <input bind:value={username} />
      {username.error && <p>{username.error}</p>}

      <input bind:value={emailField} />
      {emailField.error && <p>{emailField.error}</p>}

      <button disabled={!username.ok || !emailField.ok}>
        Submit
      </button>
    </form>
  )
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Validation Rules</h2>
        <p class={paragraph}>12+ built-in rules: <code>required</code>, <code>email</code>, <code>minLength</code>, <code>pattern</code>, <code>custom</code>, and more.</p>
        <div class={codeBlock}>
{`import { field, required, minLength, pattern, custom } from '@engine/form'

const password = field('',
  required(),
  minLength(8, 'Must be at least 8 characters'),
  pattern(/[A-Z]/, 'Must contain uppercase'),
  custom(val => val.includes('123') || 'Must contain 123')
)`}
        </div>
      </div>
    </div>
  )
}

function RoutingPage() {
  return (
    <div>
      <h1 class={heading}>Routing</h1>
      <p class={paragraph}>Simple client-side routing with dynamic parameters.</p>

      <div class={section}>
        <h2 class={subheading}>Basic Routing <badge>Core</badge></h2>
        <p class={paragraph}>Register routes and navigate between pages.</p>
        <div class={codeBlock}>
{`import { registerRoute, navigate, route, params } from '@engine/navigate'

registerRoute('/', HomePage)
registerRoute('/user/:id', UserPage)
registerRoute('/404', NotFoundPage)

// Navigate
navigate('/user/123')

// Get current route
const current = route() // '/user/123'

// Get dynamic params
const id = params().id // '123'`}
        </div>
      </div>
    </div>
  )
}

function LayoutsPage() {
  return (
    <div>
      <h1 class={heading}>Layouts</h1>
      <p class={paragraph}>Class-based layouts with reactive properties and inheritance.</p>

      <div class={section}>
        <h2 class={subheading}>Layout Class <badge>Core</badge></h2>
        <p class={paragraph}>Extend <code>Layout</code> to create reusable layouts in <code>.layout.ts</code> files.</p>
        <div class={codeBlock}>
{`// main.layout.ts
import { Layout } from '@engine/layout'

export class MainLayout extends Layout {
  title = 'My App'

  header() {
    return <header><h1>{this.title}</h1></header>
  }

  body() {
    return <main>{this.slot()}</main>
  }

  footer() {
    return <footer>© 2024</footer>
  }
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Using Layouts</h2>
        <p class={paragraph}>Call layout methods as components in your pages.</p>
        <div class={codeBlock}>
{`import { MainLayout } from './main.layout'

const layout = new MainLayout()

export default function HomePage() {
  return (
    <layout.header />
    <layout.body>
      <p>Page content here</p>
    </layout.body>
    <layout.footer />
  )
}`}
        </div>
      </div>
    </div>
  )
}

function StylingPage() {
  return (
    <div>
      <h1 class={heading}>Styling</h1>
      <p class={paragraph}>TS-to-CSS conversion with reactive variables and pseudo-selectors.</p>

      <div class={section}>
        <h2 class={subheading}>Style Objects <badge>Core</badge></h2>
        <p class={paragraph}>Write styles in <code>.style.ts</code> — engine converts to CSS automatically.</p>
        <div class={codeBlock}>
{`// button.style.ts
import { style } from '@engine/style'
import { isDisabled } from './button.state'

export const button = style({
  padding: '8px 16px',
  backgroundColor: '#4f8ef7',
  color: 'white',

  // Reactive — updates when state changes
  opacity: isDisabled ? 0.5 : 1,
  cursor: isDisabled ? 'not-allowed' : 'pointer',

  // Pseudo-selectors
  hover: {
    backgroundColor: '#3a7de8'
  },

  // Media queries
  sm: { padding: '4px 8px' }
})`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Themes</h2>
        <p class={paragraph}>Define themes with <code>defineTheme</code> for consistent design tokens.</p>
        <div class={codeBlock}>
{`import { defineTheme } from '@engine/style'

export const { color, spacing } = defineTheme({
  color: {
    primary: '#4f8ef7',
    surface: '#1a1a1a'
  },
  spacing: {
    sm: '8px',
    md: '16px'
  }
})`}
        </div>
      </div>
    </div>
  )
}

function AsyncPage() {
  return (
    <div>
      <h1 class={heading}>Async & Suspense</h1>
      <p class={paragraph}>Handle async operations with Suspense and lazy loading.</p>

      <div class={section}>
        <h2 class={subheading}>Suspense <badge>Core</badge></h2>
        <p class={paragraph}>Wrap async components to show fallback UI while loading.</p>
        <div class={codeBlock}>
{`import { Suspense, lazy } from '@engine/index'

const LazyComponent = lazy(() => import('./HeavyComponent'))

export default function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <LazyComponent />
    </Suspense>
  )
}`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Lazy Loading</h2>
        <p class={paragraph}>Use <code>lazy</code> to code-split components with loading/error fallbacks.</p>
        <div class={codeBlock}>
{`const Dashboard = lazy(
  () => import('./Dashboard'),
  {
    loading: () => <p>Loading dashboard...</p>,
    error: () => <p>Failed to load</p>
  }
)

// Preload
Dashboard.preload()`}
        </div>
      </div>
    </div>
  )
}

function TestingPage() {
  return (
    <div>
      <h1 class={heading}>Testing</h1>
      <p class={paragraph}>Built-in testing framework with auto-discovery from <code>.test.ts</code> files.</p>

      <div class={section}>
        <h2 class={subheading}>Test Definition <badge>Core</badge></h2>
        <p class={paragraph}>Define tests with <code>suite</code> and <code>test</code> in <code>.test.ts</code> files.</p>
        <div class={codeBlock}>
{`// counter.test.ts
import { suite, test, click, see } from '@engine/test'

suite('Counter', () => {
  test('increments on click', [
    click('#increment'),
    see('#count').hasText('1')
  ])
})`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Assertions & Mocking</h2>
        <p class={paragraph}>Use <code>expect</code>, <code>see</code>, and <code>mock</code> for assertions and network mocking.</p>
        <div class={codeBlock}>
{`import { expect, see, mock } from '@engine/test'

test('API integration', [
  mock('/api/users', { users: [] }).once(),
  click('#load-users'),
  see('.user-list').exists(),
  expect(2).is(2)
])`}
        </div>
      </div>
    </div>
  )
}

function DevToolsPage() {
  return (
    <div>
      <h1 class={heading}>DevTools</h1>
      <p class={paragraph}>Built-in developer tools panel (Ctrl+Shift+E) with real-time state inspection.</p>

      <div class={section}>
        <h2 class={subheading}>Features <badge>Core</badge></h2>
        <p class={paragraph}>
          • <strong>State Tab</strong>: View all <code>.state.ts</code> files and values in real-time<br/>
          • <strong>Storage Tab</strong>: Inspect persisted data in localStorage<br/>
          • <strong>Logs Tab</strong>: View channel-based logs from <code>log</code> API<br/>
          • <strong>Map Tab</strong>: Visual graph of component-state relationships<br/>
          • <strong>Tree Tab</strong>: Hierarchical view of components and state<br/>
          • <strong>Inspector Tab</strong>: Click-to-inspect components on page<br/>
          • <strong>Tests Tab</strong>: Auto-record tests, coverage display, snapshots
        </p>
      </div>

      <div class={section}>
        <h2 class={subheading}>Logging</h2>
        <p class={paragraph}>Use the <code>log</code> proxy for channel-based logging that appears in DevTools.</p>
        <div class={codeBlock}>
{`import { log } from '@engine/index'

log.userAction('Clicked button')
log.api({ users: [...] })
log.error('Something went wrong')`}
        </div>
      </div>
    </div>
  )
}

function UtilitiesPage() {
  return (
    <div>
      <h1 class={heading}>Utilities</h1>
      <p class={paragraph}>Built-in utility namespaces for common tasks.</p>

      <div class={section}>
        <h2 class={subheading}>DOM Utilities <badge>Core</badge></h2>
        <div class={codeBlock}>
{`import { dom } from '@engine/utils'

const el = dom.get('.my-class')
dom.addClass(el, 'active')
dom.on(el, 'click', handler)
dom.scrollTo(el)`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Format & Device</h2>
        <div class={codeBlock}>
{`import { format, device } from '@engine/utils'

format.date(new Date()) // "Apr 29, 2026"
format.relative(new Date()) // "just now"
device.isMobile // true/false
device.isDark // prefers dark mode`}
        </div>
      </div>

      <div class={section}>
        <h2 class={subheading}>Storage & Clipboard</h2>
        <div class={codeBlock}>
{`import { store, clipboard } from '@engine/utils'

store.set('key', value)
const data = store.get('key')

await clipboard.write('text')
const text = await clipboard.read()`}
        </div>
      </div>
    </div>
  )
}
