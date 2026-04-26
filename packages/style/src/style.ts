
import { effect } from '@engine'
import { split, injectCSS, hashStyle, type StyleObject } from './generate'

// registry of all style objects and their CSS variable updaters
const styleRegistry = new Map<string, {
  className: string
  updaters:  Array<() => void>
}>()

export function style(obj: StyleObject): string {
  // generate a unique class name from the style object
  const hash      = hashStyle(obj)
  const className = `e-${hash}`

  // if already registered — return class name
  if (styleRegistry.has(className)) {
    return className
  }

  // split into static and reactive properties
  const { reactive: reactiveProps } = split(obj, className)

  // inject CSS into the document (base class, pseudo, media)
  injectCSS(className, obj)

  // set up reactive CSS variable updaters
  const updaters = reactiveProps.map(({ varName, fn }) => {
    const update = () => {
      const value = fn()
      document.documentElement.style.setProperty(varName, String(value))
    }

    // run immediately and track dependencies
    effect(update)

    return update
  })

  styleRegistry.set(className, { className, updaters })

  return className
}
