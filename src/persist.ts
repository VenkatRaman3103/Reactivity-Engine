import { engineWarn }         from './errors'
import { globalStateListeners } from './state'

interface PersistOptions {
  storage?:  'local' | 'session'
  expires?:  number                    // seconds
  version?:  number
  pick?:     string[]
  omit?:     string[]
}

export interface PersistEntry {
  value:     any
  timestamp: number
  version:   number
}

const persistRegistry = new Map<string, {
  key:     string
  state:   Record<string, any>
  options: PersistOptions
}>()

export function persist(
  key:       string,
  state:     Record<string, any>,
  options:   PersistOptions = {},
  filename?: string,
  restoreFn?: (restored: Record<string, any>) => void
) {
  const storage = options.storage === 'session'
    ? sessionStorage
    : localStorage

  const version = options.version ?? 1

  // restore persisted values immediately
  try {
    const raw = storage.getItem(`engine:${key}`)

    if (raw) {
      const entry: PersistEntry = JSON.parse(raw)

      // version mismatch — clear old data
      if (entry.version !== version) {
        storage.removeItem(`engine:${key}`)
      } else if (options.expires) {
        // check expiry
        const age = (Date.now() - entry.timestamp) / 1000
        if (age > options.expires) {
          storage.removeItem(`engine:${key}`)
        } else {
          restore(state, entry.value, options, restoreFn)
        }
      } else {
        restore(state, entry.value, options, restoreFn)
      }
    }
  } catch (e: any) {
    engineWarn({
      category: 'State',
      what:     `Failed to restore persisted state for key '${key}'.`,
      why:      e.message,
      fix:      `Clear localStorage and try again.`
    })
  }

  // watch for changes and persist
  persistRegistry.set(key, { key, state, options })

  // intercept state mutations via Proxy
  // when any value changes — save to storage
  watchState(key, state, options, storage, version, filename)
}

function restore(
  state:     Record<string, any>,
  saved:     Record<string, any>,
  options:   PersistOptions,
  restoreFn?: (restored: Record<string, any>) => void
) {
  const validSaved: Record<string, any> = {}
  Object.keys(saved).forEach(k => {
    // respect pick and omit
    if (options.pick && !options.pick.includes(k)) return
    if (options.omit && options.omit.includes(k))  return
    if (k in state) {
      state[k] = saved[k]
      validSaved[k] = saved[k]
    }
  })
  if (restoreFn) restoreFn(validSaved)
}

function watchState(
  key:       string,
  state:     Record<string, any>,
  options:   PersistOptions,
  storage:   Storage,
  version:   number,
  filename?: string
) {
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const save = () => {
    if (saveTimer) clearTimeout(saveTimer)

    saveTimer = setTimeout(() => {
      try {
        const toSave: Record<string, any> = {}

        Object.keys(state).forEach(k => {
          if (typeof state[k] === 'function') return
          if (options.pick && !options.pick.includes(k)) return
          if (options.omit && options.omit.includes(k))  return
          toSave[k] = state[k]
        })

        const entry: PersistEntry = {
          value:     toSave,
          timestamp: Date.now(),
          version
        }

        storage.setItem(`engine:${key}`, JSON.stringify(entry))
        
        // Notify devtools that storage was updated (after debounce)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('engine:storage-updated'))
        }
      } catch (e: any) {
        engineWarn({
          category: 'State',
          what:     `Failed to persist state for key '${key}'.`,
          why:      e.message,
          fix:      'localStorage may be full. Clear some space.'
        })
      }
    }, 100)
  }

  if (filename) {
    globalStateListeners.add((file, changedKey, value) => {
      if (file === filename && changedKey in state) {
        state[changedKey] = value
        save()
      }
    })
  }

  // legacy wrapper just in case module is accessed directly
  Object.keys(state).forEach(k => {
    if (typeof state[k] === 'function') return
    let value = state[k]
    Object.defineProperty(state, k, {
      get() { return value },
      set(newValue) {
        if (newValue === value) return
        value = newValue
        save()
      },
      enumerable:   true,
      configurable: true
    })
  })
}

// clear persisted state for a key
export function clearPersisted(key: string) {
  localStorage.removeItem(`engine:${key}`)
  sessionStorage.removeItem(`engine:${key}`)
}

// clear all persisted engine state
export function clearAllPersisted() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('engine:'))
    .forEach(k => localStorage.removeItem(k))
  Object.keys(sessionStorage)
    .filter(k => k.startsWith('engine:'))
    .forEach(k => sessionStorage.removeItem(k))
}

// get all persisted keys
export function getPersistedKeys(): string[] {
  return Object.keys(localStorage)
    .filter(k => k.startsWith('engine:'))
    .map(k => k.replace('engine:', ''))
}
