import { engineWarn, engineError } from './errors'
import { Signal } from './reactive'
import { h, Fragment } from './dom'
import { trackAsync } from './suspense'

type ImportFn = () => Promise<{ default: (props?: any) => Node }>
type LazyState = 'idle' | 'loading' | 'loaded' | 'error'

export interface LazyOptions {
  loading?: () => Node
  error?: (e: Error) => Node
}

const registry = new Set<{ reset: () => void }>()

export function lazy(
  importFn: ImportFn,
  options: LazyOptions = {}
): { (props?: any): Node; preload: () => void } {

  let state: LazyState = 'idle'
  let component: ((props?: any) => Node) | null = null
  let error: Error | null = null

  const trigger = new Signal(0)
  trigger.label = 'engine:lazy'

  const reset = () => {
    state = 'idle'
    component = null
    error = null
    trigger.value++
  }

  const load = () => {
    if (state === 'loading' || state === 'loaded') return
    state = 'loading'

    trackAsync(importFn())
      .then(mod => {
        component = mod.default
        state = 'loaded'
        trigger.value++
      })
      .catch(e => {
        error = e
        state = 'error'

        // Only log warning if the developer didn't provide a custom error fallback
        if (!options.error) {
          engineWarn({
            category: 'Component',
            what: 'Lazy component failed to load.',
            why: e.message,
            fix: 'Check the import path and network connection. Add an `error` fallback prop to handle this gracefully.'
          })
        }

        trigger.value++
      })
  }

  const LazyComponent = function(props?: any): Node {
    load()

    // Wrap the lazy conditionally-rendered component in a reactive expression
    return h(Fragment, null, () => {
      // Subscribe to signal
      trigger.value

      switch (state) {
        case 'loaded':
          return component!(props ?? {})

        case 'loading':
          return options.loading?.() ?? createLoadingPlaceholder()

        case 'error':
          return options.error?.(error!) ?? createErrorPlaceholder(error!)

        default:
          return document.createTextNode('')
      }
    })
  }

  LazyComponent.preload = load
  
  registry.add({ reset })

  return LazyComponent
}

export function engineResetAllLazyStates() {
  console.log('[Lazy] Resetting all components');
  registry.forEach(entry => entry.reset())
}

function createLoadingPlaceholder(): Node {
  const el = document.createElement('div')
  el.setAttribute('data-lazy', 'loading')
  el.style.cssText = 'min-height: 40px'
  return el
}

function createErrorPlaceholder(e: Error): Node {
  const el = document.createElement('div')
  el.setAttribute('data-lazy', 'error')
  el.textContent = `Failed to load component`
  return el
}
