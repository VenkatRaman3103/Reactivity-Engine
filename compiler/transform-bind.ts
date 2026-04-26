/**
 * compiler/transform-bind.ts
 *
 * Regex-based text transform that rewrites bind:* JSX props before Babel
 * sees the code (Babel chokes on colons in attribute names).
 *
 * Handles:
 *   bind:value    → value={expr}   onInput={e => expr = e.target.value}
 *   bind:checked  → checked={expr} onChange={e => expr = e.target.checked}
 *   bind:selected → value={expr}   onChange={e => expr = e.target.value}
 *   bind:group    → checked={expr === <value attr>} onChange={e => expr = e.target.value}
 */

interface BindingRule {
  /** JSX attribute to emit for the read side */
  readAttr: string
  /** DOM event name */
  event: string
  /** Element property to read from e.target in the setter */
  targetProp: 'value' | 'checked'
}

const BIND_MAP: Record<string, BindingRule> = {
  'bind:value':    { readAttr: 'value',   event: 'onInput',  targetProp: 'value'   },
  'bind:checked':  { readAttr: 'checked', event: 'onChange', targetProp: 'checked' },
  'bind:selected': { readAttr: 'value',   event: 'onChange', targetProp: 'value'   },
  'bind:group':    { readAttr: 'checked', event: 'onChange', targetProp: 'value'   },
}

export function transformBind(code: string): string {
  let result = code

  // Process each bind directive from most specific to least specific
  // to avoid partial matches (bind:selected before bind:value etc.)
  const directives = Object.keys(BIND_MAP).sort((a, b) => b.length - a.length)

  for (const directive of directives) {
    result = rewriteDirective(result, directive, BIND_MAP[directive])
  }

  return result
}

/**
 * Matches every occurrence of   directive={<expr>}
 * and rewrites it to:           readAttr={<expr>} event={e => <expr> = e.target.<targetProp>}
 *
 * The expression inside {} may be arbitrarily nested — we balance braces manually.
 */
function rewriteDirective(code: string, directive: string, rule: BindingRule): string {
  const isGroup = directive === 'bind:group'
  let result = ''
  let pos = 0

  while (pos < code.length) {
    // Find next occurrence of the directive followed by ={
    const idx = code.indexOf(`${directive}={`, pos)
    if (idx === -1) {
      result += code.slice(pos)
      break
    }

    // Copy everything up to the directive
    result += code.slice(pos, idx)

    // Extract the balanced brace expression starting at the {
    const exprStart = idx + directive.length + 1 // points at '{'
    const { inner, end } = extractBalancedBraces(code, exprStart)

    // For bind:group we need the sibling value="" attr to build the checked expression.
    // We look forward in the same JSX tag for   value="..."  or  value={...}
    let groupValue: string | null = null
    if (isGroup) {
      groupValue = extractGroupValue(code, idx)
    }

    // Build replacement
    const readSide  = buildReadSide(rule, inner, groupValue)
    const writeSide = buildWriteSide(rule, inner, groupValue)

    result += `${readSide} ${writeSide}`
    pos = end + 1 // skip past the closing '}'
  }

  return result
}

/** Walk code starting at the '{', return the inner content and end index of '}' */
function extractBalancedBraces(code: string, openIdx: number): { inner: string; end: number } {
  let depth = 0
  let i = openIdx
  while (i < code.length) {
    if (code[i] === '{') depth++
    else if (code[i] === '}') {
      depth--
      if (depth === 0) return { inner: code.slice(openIdx + 1, i), end: i }
    }
    i++
  }
  // Malformed — return as-is
  return { inner: code.slice(openIdx + 1), end: code.length - 1 }
}

/**
 * For bind:group we need to find the static value="admin" or value={'admin'}
 * that lives in the same JSX element.  We scan backwards from the bind:group
 * position to the nearest '<' to find the opening tag, then scan forward to
 * the matching '>' collecting attrs.
 */
function extractGroupValue(code: string, bindPos: number): string | null {
  // Scan back to '<'
  let tagStart = bindPos
  while (tagStart > 0 && code[tagStart] !== '<') tagStart--

  // Scan forward to '>' (simple — doesn't handle nested tags)
  let tagEnd = bindPos
  while (tagEnd < code.length && code[tagEnd] !== '>' && code[tagEnd] !== '/') tagEnd++

  const tagContent = code.slice(tagStart, tagEnd)

  // value="literal"
  const litMatch = tagContent.match(/\bvalue="([^"]*)"/)
  if (litMatch) return JSON.stringify(litMatch[1])  // e.g. '"admin"'

  // value={'literal'}
  const exprMatch = tagContent.match(/\bvalue=\{([^}]+)\}/)
  if (exprMatch) return exprMatch[1].trim()

  return null
}

function buildReadSide(rule: BindingRule, expr: string, groupValue: string | null): string {
  if (rule.readAttr === 'checked' && groupValue !== null) {
    // bind:group — checked only when the group state matches this radio's value
    return `checked={${expr} === ${groupValue}}`
  }
  return `${rule.readAttr}={${expr}}`
}

function buildWriteSide(rule: BindingRule, expr: string, groupValue: string | null): string {
  const { event, targetProp } = rule

  const trimmedExpr = expr.trim()
  const isSimpleId = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmedExpr)
  const setterName = isSimpleId ? `set${trimmedExpr.charAt(0).toUpperCase() + trimmedExpr.slice(1)}` : null

  let rightSide: string
  if (rule.readAttr === 'checked' && groupValue !== null) {
    rightSide = groupValue
  } else if (targetProp === 'checked') {
    rightSide = '(e.target as HTMLInputElement).checked'
  } else {
    rightSide = '(e.target as HTMLInputElement).value'
  }

  let setterBody: string
  if (isSimpleId) {
    setterBody = `${setterName}(${rightSide})`
  } else {
    setterBody = `${trimmedExpr} = ${rightSide}`
  }

  return `${event}={(e: any) => { ${setterBody} }}`
}
