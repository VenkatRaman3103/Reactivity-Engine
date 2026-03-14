import { engineWarn } from './errors'

// snapshot of state values at last render
// used to compare against current values
interface MemoSnapshot {
  file:   string
  values: Record<string, any>
}

let memoCounter = 0

// populated by wrapState so memo can access raw module values
export const stateModules     = new Map<string, Record<string, any>>()
export const snapshotRegistry = new Map<string, Record<string, any>>()

export function memo(fn: any): any {
  if (typeof fn !== 'function') {
    engineWarn({
      category: 'Component',
      what:     'memo() received a non-function argument.',
      why:      `Received: ${typeof fn}`,
      fix:      'Pass a component function to memo().\n  const MyComponent = memo(function MyComponent() { ... })'
    })
    return fn
  }

  let lastNode:       Node | null     = null
  let initialized                     = false
  let snapshots:      MemoSnapshot[]  = []
  const memoId                        = `memo-${memoCounter++}`

  const checkChanged = (): boolean => {
    // read current values and compare to snapshot
    for (const snap of snapshots) {
      const mod = stateModules.get(snap.file)
      if (!mod) return true

      for (const [key, oldVal] of Object.entries(snap.values)) {
        if (typeof mod[key] === 'function') continue
        if (mod[key] !== oldVal) return true
      }
    }
    return false
  }

  const captureSnapshot = () => {
    snapshots = []
    // snapshotRegistry is populated by wrapState
    snapshotRegistry.forEach((mod, file) => {
      const values: Record<string, any> = {}
      Object.keys(mod).forEach(k => {
        if (typeof mod[k] !== 'function') values[k] = mod[k]
      })
      snapshots.push({ file, values })
    })
  }

  return function memoized(props: any): Node {
    // first render — always run
    if (!initialized) {
      initialized = true
      // normally setActiveComponent(memoId) would be here
      lastNode = fn(props)
      // setActiveComponent(null)
      captureSnapshot()
      return lastNode!
    }

    // subsequent renders — check if anything changed
    if (!checkChanged() && lastNode) {
      return lastNode  // nothing changed — return cached
    }

    // something changed — re-render
    lastNode = fn(props)
    captureSnapshot()

    return lastNode!
  }
}
