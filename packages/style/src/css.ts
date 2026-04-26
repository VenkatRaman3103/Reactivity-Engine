
let globalStyles: Record<string, string> = {}

export function css(strings: TemplateStringsArray, ...values: any[]): string {
  const result = strings.reduce((acc, str, i) => {
    return acc + str + (values[i] ?? '')
  }, '')

  // inject directly into document
  injectGlobalCSS(`css-${hashString(result)}`, result)

  return result
}

// inject a global CSS rule
// used by theme, keyframes, global resets etc
export function injectGlobalCSS(id: string, css: string) {
  if (globalStyles[id]) return

  globalStyles[id] = css

  if (typeof document === 'undefined') return

  const style = document.createElement('style')
  style.setAttribute('data-engine-style', id)
  style.textContent = css
  document.head.appendChild(style)
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
