// src/when.ts

import { effect }                from './effect'
import { registerLifecycle,
         getCurrentOwnerId,
         Mount, Unmount, Err }   from './lifecycle'
import { engineWarn }            from './errors'

export function whenever(
  condition: (() => any) | any,
  fn:        () => void
): () => void {

  if (typeof fn !== 'function') {
    engineWarn({
      category: 'Effect',
      what:     'whenever() second argument must be a function.',
      why:      `Received: ${typeof fn}`,
      fix:      'Pass a function as the second argument.\n' +
                '  whenever(items, () => { total = items.length })'
    })
    return () => {}
  }

  // condition is already a function — use directly
  // this is the compiled version — whenever(() => items, fn)
  if (typeof condition === 'function') {
    return effect(() => {
      if (condition()) fn()
    })
  }

  // condition is a raw value — wrap it
  // this path is hit if compiler did not transform
  // or developer passed a raw value directly
  return effect(() => {
    if (condition) fn()
  })
}

export function when(
  condition: (() => any) | symbol | any,
  fn:        Function
): () => void {

  if (typeof fn !== 'function') {
    engineWarn({
      category: 'Effect',
      what:     'when() second argument must be a function.',
      why:      `Received: ${typeof fn}`,
      fix:      'Pass a function as the second argument.\n' +
                '  when(user, () => { fetchPreferences() })\n' +
                '  when(Mount, () => { fetchData() })'
    })
    return () => {}
  }

  // lifecycle symbol — Mount / Unmount / Err
  if (condition === Mount ||
      condition === Unmount ||
      condition === Err) {

    const ownerId = getCurrentOwnerId()

    if (!ownerId) {
      engineWarn({
        category: 'Effect',
        what:     'when(Mount/Unmount/Err) called outside a component.',
        why:      'Lifecycle hooks must be called inside a component function.',
        fix:      'Move when(Mount, ...) inside your component function.\n' +
                  '  export default function MyComponent() {\n' +
                  '    when(Mount, () => { fetchData() })\n' +
                  '  }'
      })
      return () => {}
    }

    registerLifecycle(ownerId, condition as symbol, fn)
    return () => {}
  }

  // regular condition — runs once when first truthy
  let ran = false

  // condition is already a function — use directly
  if (typeof condition === 'function') {
    const stop = effect(() => {
      if ((condition as () => any)() && !ran) {
        ran = true
        fn()
        Promise.resolve().then(() => stop())
      }
    })
    return stop
  }

  // condition is a raw value
  const stop = effect(() => {
    if (condition && !ran) {
      ran = true
      fn()
      Promise.resolve().then(() => stop())
    }
  })

  return stop
}
