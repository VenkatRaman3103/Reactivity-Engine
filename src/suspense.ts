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

  return h('div', { 'data-suspense': '' }, () => {
    return pendingCount.value > 0 ? props.fallback : props.children
  })
}
