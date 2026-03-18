// src/lifecycle.ts

export const Mount   = Symbol('Mount')
export const Unmount = Symbol('Unmount')
export const Err     = Symbol('Err')

export interface ErrObject {
  message:   string
  stack:     string | undefined
  component: string
  cause:     Error
}

interface LifecycleHandlers {
  mount:   (() => void)[]
  unmount: (() => void)[]
  error:   ((e: ErrObject) => void)[]
}

const registry = new Map<string, LifecycleHandlers>()
const mounted = new Set<string>()
let   currentOwnerId: string | null = null

export function setCurrentOwnerId(id: string | null) {
  currentOwnerId = id
}

export function getCurrentOwnerId() {
  return currentOwnerId
}

export function registerLifecycle(
  componentId: string,
  type:        symbol,
  fn:          Function
) {
  if (!registry.has(componentId)) {
    registry.set(componentId, {
      mount:   [],
      unmount: [],
      error:   []
    })
  }

  const handlers = registry.get(componentId)!

  if (type === Mount) {
    handlers.mount.push(fn as () => void)
    if (mounted.has(componentId)) {
      Promise.resolve().then(() => (fn as () => void)())
    }
  }
  if (type === Unmount) handlers.unmount.push(fn as () => void)
  if (type === Err)     handlers.error.push(fn as (e: ErrObject) => void)
}

export function triggerMount(componentId: string) {
  mounted.add(componentId)
  const handlers = registry.get(componentId)
  if (!handlers) return
  handlers.mount.forEach(fn => fn())
}

export function triggerUnmount(componentId: string) {
  const handlers = registry.get(componentId)
  if (!handlers) return
  handlers.unmount.forEach(fn => fn())
}

export function triggerErr(componentId: string, error: Error) {
  const handlers = registry.get(componentId)
  if (!handlers || handlers.error.length === 0) return

  const errObj: ErrObject = {
    message:   error.message,
    stack:     error.stack,
    component: componentId,
    cause:     error
  }

  handlers.error.forEach(fn => fn(errObj))
}

export function cleanupLifecycle(componentId: string) {
  mounted.delete(componentId)
  registry.delete(componentId)
}
