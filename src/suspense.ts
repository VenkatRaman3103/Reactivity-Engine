import { engineWarn }   from './errors'
import { Signal }       from './reactive'
import { h }            from './dom'
import { createEffect } from './effect'

// global tracker for async operations
const pendingCount = new Signal(0)
pendingCount.label = 'engine:suspense:pendingCount'

export function trackAsync<T>(promise: Promise<T>): Promise<T> {
  pendingCount.value++

  return promise.finally(() => {
    pendingCount.value--
  })
}

export function isPending(): boolean {
  return pendingCount.value > 0
}

interface SuspenseProps {
  fallback:  any
  children?: any
}

export function Suspense(props: SuspenseProps): Node {
  if (!props.fallback) {
    engineWarn({
      category: 'Component',
      what:     'Suspense requires a fallback prop.',
      why:      'Without a fallback there is nothing to show while loading.',
      fix:      'Pass a fallback node to Suspense.',
      example:  '<Suspense fallback={<p>Loading...</p>}>\n  <ProductList />\n</Suspense>'
    })
  }

  // Refactored to avoid "Suspense Loop":
  // Instead of swapping nodes (which unmounts and remounts components, 
  // triggering their onMount effects repeatedly), we render BOTH and toggle visibility.
  
  const content = h('div', { 'data-suspense-content': '' }, props.children);
  const fallback = h('div', { 'data-suspense-fallback': '' }, props.fallback);
  const container = h('div', { 'data-suspense': '' }, content, fallback);

  createEffect(() => {
    const active = pendingCount.value > 0;
    (content as HTMLElement).style.display = active ? 'none' : '';
    (fallback as HTMLElement).style.display = active ? '' : 'none';
  });

  return container;
}
