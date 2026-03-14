// browser side HMR
// only runs in dev mode

import { instances, updateComponent } from './component'
import { notifyAllInFile }            from './state'
import { engineInfo }                 from './errors'
import { recordStateChange }          from './devtools'

export function initHMR() {
  // @ts-ignore
  if (!import.meta.hot) return

  // state file changed
  // re-import the module and notify all subscribers
  // @ts-ignore
  import.meta.hot.on(
    'engine:state-update',
    async ({ file }: { file: string }) => {
      engineInfo('HMR', `State file updated: ${file}`)

      try {
        // bust the module cache with a timestamp
        const newMod = await import(/* @vite-ignore */ `${file}?t=${Date.now()}`)
        
        // update existing signals with new scalar values
        const { getSignalCache } = await import('./state');
        // The file path mapped in cache might have the example/ prefix if that's the cwd
        // Let's find the correct cache key by checking all keys
        let cacheKey = file;
        const cache = getSignalCache();
        
        if (!cache.has(cacheKey)) {
          // try finding it by suffix (e.g. file is /components/Counter.state.ts, cache is example/components/Counter.state.ts)
          const match = Array.from(cache.keys()).find(k => k.endsWith(file) || ('/' + k).endsWith(file));
          if (match) cacheKey = match;
        }

        const signals = cache.get(cacheKey);
        if (signals && newMod) {
          Object.keys(newMod).forEach(k => {
            if (typeof newMod[k] !== 'function') {
              const sig = signals.get(k)
              if (sig && (sig as any)._value !== newMod[k]) {
                const oldVal = (sig as any)._value;
                // update internal value without triggering its own notify
                // so we can batch them below
                (sig as any)._value = newMod[k]
                
                // Keep DevTools history in sync during HMR
                recordStateChange(cacheKey, k, oldVal, newMod[k])
              }
            }
          })
        }

        // notify all components subscribed to this file
        notifyAllInFile(cacheKey)
      } catch (e: any) {
        engineInfo('HMR', `Failed to reload state file: ${e.message}`)
      }
    }
  )

  // component file changed
  // re-render all instances of that component
  // @ts-ignore
  import.meta.hot.on(
    'engine:component-update',
    ({ file }: { file: string }) => {
      engineInfo('HMR', `Component updated: ${file}`)

      // update all mounted component instances
      instances.forEach((_, id) => {
        updateComponent(id)
      })
    }
  )

  // accept self — prevents full page reload
  // @ts-ignore
  import.meta.hot.accept()
}
