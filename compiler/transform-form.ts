// compiler/transform-form.ts
// reads .form.ts files
// detects type annotations on export let declarations
// transforms them to field() calls

export function transformForm(code: string, id: string): string {
  if (!id.endsWith('.form.ts')) return code

  let result = code
  let needsImport = false

  // match: export let name: TypeAnnotation = initialValue
  // note: updated to capture optional spaces better
  const declarationRegex =
    /export\s+let\s+(\w+)\s*:\s*([^=]+?)\s*=\s*([^\n;]+)/g

  let m: RegExpExecArray | null

  while ((m = declarationRegex.exec(code)) !== null) {
    const [full, varName, typeAnnotation, initialValue] = m

    // check if type annotation contains any rule types
    const rules = extractRules(typeAnnotation.trim())
    if (rules.length === 0) continue

    // build field() call
    const rulesStr  = rules.join(', ')
    const fieldCall = `export let ${varName} = __engine_field(${initialValue.trim()}, ${rulesStr})`

    result      = result.replace(full, fieldCall)
    needsImport = true
  }

  // add field import if needed
  if (needsImport) {
    result = `import { field as __engine_field } from '@engine/index'\n` + result
    result = addRuleImports(result, extractAllRules(result))
  }

  return result
}

// extract rule function calls from type annotation
// Required & Email & MinLength<8>
// → ['__engine_required()', '__engine_email()', '__engine_minLength(8)']
function extractRules(typeAnnotation: string): string[] {
  const parts = typeAnnotation.split('&').map(s => s.trim())
  const rules: string[] = []

  parts.forEach(part => {
    // simple types — Required, Email, URL, Phone, Numeric, Positive
    const simpleMap: Record<string, string> = {
      Required: '__engine_required()',
      Email:    '__engine_email()',
      URL:      '__engine_url()',
      Phone:    '__engine_phone()',
      Numeric:  '__engine_numeric()',
      Positive: '__engine_positive()'
    }

    if (simpleMap[part]) {
      rules.push(simpleMap[part])
      return
    }

    // parameterized types — MinLength<8>, MaxLength<20>, Min<0>, Max<100>
    const genericMatch = part.match(/^(\w+)<(.+)>$/)
    if (genericMatch) {
      const [, name, param] = genericMatch

      const genericMap: Record<string, string> = {
        MinLength: `__engine_minLength(${param})`,
        MaxLength: `__engine_maxLength(${param})`,
        Min:       `__engine_min(${param})`,
        Max:       `__engine_max(${param})`,
        Pattern:   `__engine_pattern(/${param}/)`,
      }

      if (genericMap[name]) {
        rules.push(genericMap[name])
      }
    }
  })

  return rules
}

function extractAllRules(code: string): Set<string> {
  const rules  = new Set<string>()
  const regex  = /__engine_(required|email|url|phone|numeric|positive|minLength|maxLength|min|max|pattern)\(/g
  let   m: RegExpExecArray | null

  while ((m = regex.exec(code)) !== null) {
    rules.add(m[1])
  }

  return rules
}

function addRuleImports(code: string, rules: Set<string>): string {
  if (rules.size === 0) return code
  const aliasedImports = [...rules].map(r => `${r} as __engine_${r}`).join(', ')
  return `import { ${aliasedImports} } from '@engine/index'\n` + code
}
