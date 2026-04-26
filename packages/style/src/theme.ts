
import { injectGlobalCSS } from './css'

export interface Theme {
  color:   Record<string, string>
  spacing: Record<string, string>
  radius:  Record<string, string>
  shadow:  Record<string, string>
  font:    Record<string, string>
}

let activeTheme: Theme | null = null

export function defineTheme(theme: Theme): Theme {
  activeTheme = theme

  // inject theme as CSS variables on :root
  const vars = flattenTheme(theme)
  const css  = `:root {\n${
    Object.entries(vars)
      .map(([k, v]) => `  ${k}: ${v};`)
      .join('\n')
  }\n}`

  injectGlobalCSS('theme', css)

  return theme
}

function flattenTheme(
  obj:    Record<string, any>,
  prefix: string = '--theme'
): Record<string, string> {
  const result: Record<string, string> = {}

  Object.entries(obj).forEach(([key, value]) => {
    const varName = `${prefix}-${key}`
    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenTheme(value, varName))
    } else {
      result[varName] = value
    }
  })

  return result
}

export function getTheme() {
  return activeTheme
}
