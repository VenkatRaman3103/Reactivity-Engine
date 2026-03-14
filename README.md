# Reactivity Engine

A lightweight, from-scratch reactivity system for the web. Write components in JSX-like syntax, manage state through plain TypeScript files, and get fine-grained reactivity, async handling, routing, and devtools out of the box.

> **Status:** Early stage — core features are stable and actively expanding.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
  - [Signals](#signals)
  - [State Files](#state-files)
  - [Effects](#effects)
  - [Derived Values](#derived-values)
  - [Components](#components)
- [Advanced Features](#advanced-features)
  - [Async & Suspense](#async--suspense)
  - [Router](#router)
  - [Portals](#portals)
  - [Slots](#slots)
  - [Memo](#memo)
  - [Batching](#batching)
- [Developer Experience](#developer-experience)
  - [Error Overlay](#error-overlay)
  - [DevTools Panel](#devtools-panel)
  - [HMR](#hmr)
- [Compiler](#compiler)
- [Project Structure](#project-structure)

## Overview

Reactivity Engine is a **zero-dependency** reactivity layer that brings a reactive programming model to the DOM without a virtual DOM or a heavy framework. Key ideas:

- **Signals** are the atomic unit of state — reading a signal inside an effect automatically subscribes to it.
- **State files** are plain `.state.ts` files with `export let` variables; the compiler transforms them into reactive signals transparently.
- **JSX** is compiled to plain DOM `h()` calls — no virtual DOM diffing.
- The scheduler ensures updates are batched and free of infinite loops.

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server (includes HMR + devtools)
npm run dev
```

The entry point is `example/main.ts`. Open [http://localhost:5173](http://localhost:5173) to see the interactive demo.

## Core Concepts

### Signals

Signals are the primitive reactive value. Reading `.value` inside a reactive context (effect, derived, component render) automatically subscribes to future updates.

```ts
import { Signal, createSignal } from "@engine/index";

// Low-level Signal class
const count = new Signal(0);
count.value = 1; // triggers any subscribers

// Functional API — returns a [getter, setter] pair
const [getCount, setCount] = createSignal(0);
getCount(); // read
setCount(10); // write + notify
```

Signals protect against infinite loops with a circular-update guard, and warn (once) when a signal is updated with no subscribers.

### State Files

The recommended pattern. Create a `.state.ts` file with plain `export let` variables and exported functions:

```ts
// counter.state.ts
export let count = 0;
export let label = "clicks";

export function increment() {
  count++;
}

export function reset() {
  count = 0;
}
```

The **compiler** automatically transforms every assignment to `count` into a signal notification — no boilerplate needed. Import and use state directly in components:

```tsx
import { count, increment } from "./counter.state";

export default function Counter() {
  return (
    <div>
      <p>{() => count}</p>
      <button onClick={increment}>+1</button>
    </div>
  );
}
```

**State Guard:** Any mutation of state variables from _outside_ the state file is caught at runtime and triggers a warning pointing to the available setter functions, helping enforce unidirectional data flow.

### Effects

Effects run immediately and re-run whenever a signal they read changes.

```ts
import { effect, onMount, onUnmount, onError } from '@engine/index';

// Reactive side effect
effect(() => {
  document.title = `Count: ${count}`;
});

// Inside a component:
export default function MyComponent() {
  // Runs once after mount
  onMount(() => {
    const id = setInterval(() => tick(), 1000);
    // Return a cleanup function
    return () => clearInterval(id);
  });

  // Runs before the component is unmounted
  onUnmount(() => {
    console.log('goodbye');
  });

  // Catches errors thrown during render
  onError((e) => <p>Something went wrong: {e.message}</p>);

  return <div>...</div>;
}
```

Effects are automatically disposed when the owning component unmounts. Nested effects are child effects — disposing a parent disposes all children.

### Derived Values

`derive()` creates a lazy, cached computed value. It only recomputes when a dependency changes, and propagates updates to its own subscribers.

```ts
import { derive } from '@engine/index';
import { items } from './cart.state';

const total = derive(() => items.reduce((s, i) => s + i.price, 0));

// In a component:
<p>Total: {() => total.value}</p>
```

Circular dependencies are detected and reported immediately.

### Components

Components are plain functions that return DOM nodes. JSX is compiled to `h()` calls:

```tsx
import { h } from "@engine/index";

function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}!</h1>;
}
```

Reactive expressions in JSX are written as arrow functions so the engine can track and update only the affected text nodes or attributes:

```tsx
// Static — renders once
<p>{count}</p>

// Reactive — re-evaluates when `count` changes
<p>{() => count}</p>

// Reactive class
<div class={() => isActive ? 'active' : ''}>...</div>
```

## Advanced Features

### Async & Suspense

`trackAsync` integrates a promise into the global pending counter. `Suspense` renders a fallback while any tracked promise is in flight:

```tsx
import { Suspense, trackAsync } from "@engine/index";

async function fetchUser() {
  return trackAsync(fetch("/api/user").then((r) => r.json()));
}

<Suspense fallback={<p>Loading...</p>}>
  <UserProfile />
</Suspense>;
```

`isPending()` returns `true` reactively while any async operation is pending — useful for showing spinners.

### Router

Client-side SPA routing with path parameters and query strings:

```ts
import {
  setContainer,
  registerRoute,
  renderRoute,
  navigate,
  params,
  query,
} from "@engine/index";

setContainer(document.getElementById("app")!);

registerRoute("/", Home);
registerRoute("/product/:id", ProductDetail);
registerRoute("*", NotFound); // 404 fallback

renderRoute(); // render the current URL

// Navigate programmatically
navigate("/product/42");
navigate(-1); // browser back

// Inside a component
const { id } = params();
const { page } = query();
```

### Portals

Render a node into an arbitrary DOM container (e.g. `document.body` for modals) while keeping it scoped to the component lifecycle:

```tsx
import { portal } from "@engine/index";

function Modal({ children }: any) {
  return portal(<div class="modal">{children}</div>, document.body);
}
```

Portals are automatically removed when the owning component unmounts.

### Slots

Named and default slot composition for component APIs:

```tsx
import { slot } from "@engine/index";

function Card(props: any) {
  return (
    <div class="card">
      <header>{slot(props, "header", <span>Default Header</span>)}</header>
      <main>{slot(props)}</main>
    </div>
  );
}

// Usage — Vue-style slot attribute
<Card>
  <h2 slot="header">My Title</h2>
  <p>Body content goes in the default slot.</p>
</Card>;
```

### Memo

`memo()` wraps a component to skip re-renders when none of the state it reads has changed:

```ts
import { memo } from '@engine/index';

const ExpensiveList = memo(function ExpensiveList(props) {
  return <ul>...</ul>;
});
```

### Batching

Group multiple state changes into a single update pass to avoid intermediate renders:

```ts
import { batch } from "@engine/index";

batch(() => {
  count = 10;
  label = "updated";
}); // subscribers notified once, after both changes
```

State file functions already run inside `batch` automatically.

## Developer Experience

### Error Overlay

In development, errors and warnings surface as a rich in-browser overlay instead of silent console logs. Each entry shows:

- **Category** (State / Effect / Derived / Navigation / Component)
- **What** went wrong
- **Why** it happened
- **How to fix it** — with a copy-paste code snippet
- **Source location** — file and line from your code

### DevTools Panel

A floating devtools panel (toggled with `toggleDevPanel()`) shows:

- All registered state files and their current signal values
- A live log of every state change (key, old value, new value, timestamp)

### HMR

Hot Module Replacement is enabled in dev mode via Vite. The engine re-runs affected module logic and re-renders components without a full page reload.

## Compiler

The `compiler/` directory contains a Vite plugin (`plugin.ts`) that runs two Babel transforms at build time:

| Transform                | File                      | What it does                                                                                                                          |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **JSX transform**        | `transform-jsx.ts`        | Converts JSX to `h()` calls with reactive expression support                                                                          |
| **State file transform** | `transform-state-file.ts` | Rewrites `export let` assignments (`count = 1`, `count++`) to emit `notifySignal()` calls, making plain variable assignments reactive |

No decorators, no class syntax, no `useState` wrapper — just regular TypeScript.

## Project Structure

```
Reactivity-Engine/
├── src/
│   ├── reactive.ts       # Signal class, observer tracking, batch
│   ├── effect.ts         # effect(), onMount(), onUnmount(), onError()
│   ├── derived.ts        # derive() — lazy computed values
│   ├── state.ts          # wrapState(), state file proxy & mutation guard
│   ├── component.ts      # Component mounting, lifecycle, cleanup registry
│   ├── dom.ts            # h() — hyperscript / JSX runtime
│   ├── scheduler.ts      # Microtask-based effect scheduler
│   ├── memo.ts           # memo() — component memoization
│   ├── suspense.ts       # Suspense, trackAsync, isPending
│   ├── navigate.ts       # Client-side router
│   ├── portal.ts         # portal(), closePortal()
│   ├── slot.ts           # slot() — named & default slots
│   ├── keyed.ts          # Keyed list reconciliation helper
│   ├── ref.ts            # ref() — DOM node reference
│   ├── devtools.ts       # DevTools panel
│   ├── hmr.ts            # HMR integration
│   ├── error-overlay.ts  # Dev error/warning overlay
│   ├── errors.ts         # engineError / engineWarn helpers
│   └── index.ts          # Public API exports
│
├── compiler/
│   ├── plugin.ts               # Vite plugin entry
│   ├── transform-jsx.ts        # JSX → h() compiler
│   ├── transform-state.ts      # Single assignment transform
│   └── transform-state-file.ts # Babel AST plugin for state files
│
└── example/                    # Interactive feature demo app
```

## License

ISC
