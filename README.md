# Reactivity Engine

A reactive UI engine for building web applications. State is a plain TypeScript file. Components are TSX files that import from state files. The compiler makes everything reactive automatically. No virtual DOM. No hooks. No framework concepts. Just TypeScript.

## Why it exists

Frameworks have become burdened by complex state management and virtual DOM diffing. Reactivity Engine returns to the simplicity of plain variables. It avoids the performance overhead of the virtual DOM by tracking updates at the import level. When a variable in a state file changes, the compiler detects which components import from that file and updates only those. This results in O(1) updates without hooks or boilerplate.

## Quick start

Install the core engine.

```bash
npm install @engine/core
```

Create a state file for your data and logic.

```ts
// counter.state.ts
export let count = 0
export function increment() { count++ }
export function decrement() { count-- }
```

Create a component that imports from the state file.

```tsx
// Counter.tsx
import { count, increment, decrement } from './counter.state'

export default function Counter() {
  return (
    <div>
      <h1>{count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

## The four files

Every feature is defined by four files. Each has a single responsibility.

The state file owns data and logic.

```ts
// cart.state.ts
export let items = []
export function add(item) { items.push(item) }
```

The layout file handles composition and structure through a class-based system.

```tsx
// cart.layout.tsx
class CartLayout extends Layout {
  header = Header
  footer = Footer
}

export const cartLayout = new CartLayout()
```

The component file is the entry point and pure output.

```tsx
// Cart.tsx
import { cartLayout } from './cart.layout'

export default function Cart() {
  return (
    <div>
      <cartLayout.header />
      <main>Items list</main>
      <cartLayout.footer />
    </div>
  )
}
```

The style file handles appearance and compiles to CSS.

```ts
// cart.style.ts
import { style } from '@engine/style'
import { items } from './cart.state'

export const container = style({
  display: items.length > 0 ? 'block' : 'none'
})
```

## Core concepts

### Reactivity

State is tracked at the import level. When a function in a state file is called, the compiler detects which components import from that file and updates only those. No virtual DOM diffing is involved. Calling a state function updates the DOM directly.

### When and Whenever

Conditional triggers and lifecycles use `when` and `whenever`.

```ts
whenever(condition, () => {
  // runs every time condition is truthy
})

when(condition, () => {
  // runs once when condition first becomes truthy
})

when(Mount, () => {
  // runs when component mounts
})
```

### Layout System

Layouts use class-based composition. Properties are reactive automatically and methods act as components. Inheritance replaces copy-paste for sharing structure across pages.

```tsx
class DashboardLayout extends Layout {
  header = Header
  
  Content() {
    if (!user) return <LoginPage />
    return <Dashboard />
  }

  constructor() {
    super()
    whenever(role === 'admin', () => {
      this.header = AdminHeader
    })
  }
}
```

### Style System

Static properties in style files compile to CSS classes. Reactive properties become CSS variables updated automatically by the engine.

```ts
export const button = style({
  padding: '10px 20px',
  backgroundColor: isDisabled ? color.surface : color.primary,
  hover: {
    backgroundColor: color.primaryHover
  }
})
```

## API reference

`persist(key, state, options)`
Persists state variables to storage. Supports expiration, versioning, and omitting specific fields.

`urlState(config)`
Maps state to URL parameters. State is restored on refresh and can be shared via the URL.

`lazy(() => import('./File'))`
Handles code splitting for components. Use with `Suspense` for loading states.

`bind:value={name}`
Compiler-level two-way data binding for inputs, checkboxes, and selects.

`log.channel(data)`
Creates a logging channel in the devtools. Any property access on `log` creates a new channel.

`play(name, steps)`
Visual test runner with an animated cursor and step overlay.

`utilities`
Namespaces for `dom`, `store`, `format`, `device`, `str`, `arr`, and `clipboard` provide common helpers.

## What is missing

It is not a meta-framework and does not include file-based routing. It is client-side only and does not support Server Side Rendering (SSR) in its current state. It is unopinionated about the backend; you must use your own API.

## Roadmap

Version 0.1.0 is the current release. Production use is at your own risk.

Version 2.0.0 will focus on Server Side Rendering (SSR) and hydration. Enhancements to the dev panel subscription mapping and state inspector are ongoing.
