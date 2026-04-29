// src/devtools/store.ts
// combines static tree with live runtime data

import { componentRegistry } from '../reactive'
import { instances }         from '../component'
import { stateModules }      from '../memo'

export interface ComponentData {
  name:        string
  file:        string
  renders:     string[]
  renderedBy:  string[]
  reads:       string[]
  mounted:     boolean
  stateValues: Record<string, Record<string, any>>
}

export interface StateData {
  file:      string
  shortName: string
  exports:   Array<{ name: string, value: any, isFunction: boolean }>
  usedBy:    string[]
}

export interface DevStore {
  components: ComponentData[]
  state:      StateData[]
}

export function buildDevStore(): DevStore {
  const staticTree = (window as any).__engineStaticTree

  // build component data
  const components: ComponentData[] = (staticTree?.components ?? [])
    .map((comp: any) => {
      // which state files does this component read
      const reads: string[] = []
      componentRegistry.forEach((comps, stateFile) => {
        if (stateModules.has(stateFile) && comps.has(comp.name)) reads.push(stateFile)
      })

      // live state values for this component
      const stateValues: Record<string, Record<string, any>> = {}
      reads.forEach(file => {
        const mod = stateModules.get(file)
        if (!mod) return
        stateValues[file] = {}
        Object.keys(mod).forEach(k => {
          if (typeof mod[k] !== 'function') {
            stateValues[file][k] = mod[k]
          }
        })
      })

      return {
        name:        comp.name,
        file:        comp.file,
        renders:     comp.renders,
        renderedBy:  comp.renderedBy,
        reads,
        mounted:     instances.has(comp.name),
        stateValues
      }
    })

  // build state data
  const state: StateData[] = []
  stateModules.forEach((mod, file) => {
    const shortName = file.split('/').pop()?.replace('.state.ts', '') ?? file
    const usedBy: string[] = []

    componentRegistry.get(file)?.forEach(comp => {
      if (!usedBy.includes(comp)) usedBy.push(comp)
    })

    const exports = Object.keys(mod).map(name => ({
      name,
      value:      typeof mod[name] === 'function' ? null : mod[name],
      isFunction: typeof mod[name] === 'function'
    }))

    state.push({ file, shortName, exports, usedBy })
  })

  return { components, state }
}

// listen for tree updates from HMR
if (import.meta.hot) {
  import.meta.hot.on('engine:tree-update', (tree: any) => {
    ;(window as any).__engineStaticTree = tree
  })
}
