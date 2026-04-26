
import { injectGlobalCSS } from './css'

export interface StyleObject {
  // standard CSS properties
  [key: string]: any

  // pseudo selectors
  hover?:  StyleObject
  focus?:  StyleObject
  active?: StyleObject
  disabled?: StyleObject
  placeholder?: StyleObject

  // responsive breakpoints
  sm?: StyleObject
  md?: StyleObject
  lg?: StyleObject
  xl?: StyleObject
}

const PSEUDO_SELECTORS = ['hover', 'focus', 'active', 'disabled', 'placeholder']

const BREAKPOINTS: Record<string, string> = {
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)'
}

const CAMEL_TO_KEBAB = (s: string) =>
  s.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`)

export interface ReactiveProp {
  cssProp:  string
  varName:  string
  fn:       () => any
}

export function split(obj: StyleObject, className?: string): {
  static:   Record<string, string>
  reactive: ReactiveProp[]
  pseudo:   Record<string, Record<string, string>>
  media:    Record<string, Record<string, string>>
} {
  const staticProps:   Record<string, string>                    = {}
  const reactiveProps: ReactiveProp[]                            = []
  const pseudoProps:   Record<string, Record<string, string>>    = {}
  const mediaProps:    Record<string, Record<string, string>>    = {}

  Object.entries(obj).forEach(([key, value]) => {
    // pseudo selector
    if (PSEUDO_SELECTORS.includes(key)) {
      pseudoProps[key] = value as Record<string, string>
      return
    }

    // breakpoint
    if (key in BREAKPOINTS) {
      mediaProps[key] = value as Record<string, string>
      return
    }

    // reactive — value is a function (compiler wraps expressions in () =>)
    if (typeof value === 'function') {
      const cssProp = CAMEL_TO_KEBAB(key)
      const prefix  = className ? `e-${className}` : `e-${Math.random().toString(36).slice(2, 6)}`
      const varName = `--${prefix}-${cssProp}`
      
      reactiveProps.push({ cssProp, varName, fn: value as () => any })
      // add CSS variable reference to static
      staticProps[cssProp] = `var(${varName})`
      return
    }

    // static
    staticProps[CAMEL_TO_KEBAB(key)] = String(value)
  })

  return {
    static:   staticProps,
    reactive: reactiveProps,
    pseudo:   pseudoProps,
    media:    mediaProps
  }
}

export function generateCSS(
  className: string,
  obj:       StyleObject
): string {
  const { static: staticProps, pseudo, media } = split(obj, className)

  let css = ''

  // base class
  css += `.${className} {\n`
  Object.entries(staticProps).forEach(([k, v]) => {
    css += `  ${k}: ${v};\n`
  })
  css += '}\n\n'

  // pseudo selectors
  Object.entries(pseudo).forEach(([selector, props]) => {
    css += `.${className}:${selector} {\n`
    Object.entries(props).forEach(([k, v]) => {
      css += `  ${CAMEL_TO_KEBAB(k)}: ${v};\n`
    })
    css += '}\n\n'
  })

  // media queries
  Object.entries(media).forEach(([breakpoint, props]) => {
    const query = BREAKPOINTS[breakpoint]
    css += `@media ${query} {\n`
    css += `  .${className} {\n`
    Object.entries(props).forEach(([k, v]) => {
      css += `    ${CAMEL_TO_KEBAB(k)}: ${v};\n`
    })
    css += '  }\n'
    css += '}\n\n'
  })

  return css
}

export function injectCSS(className: string, obj: StyleObject) {
  const css = generateCSS(className, obj)
  injectGlobalCSS(className, css)
}

export function hashStyle(obj: StyleObject): string {
  const str = JSON.stringify(obj, (key, value) => 
    typeof value === 'function' ? value.toString() : value
  )
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
