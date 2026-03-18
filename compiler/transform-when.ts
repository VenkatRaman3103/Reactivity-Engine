// compiler/transform-when.ts
const LIFECYCLE_SYMBOLS = ['Mount', 'Unmount', 'Err']

export function transformWhenConditions(code: string): string {
  // Match whenever(condition, and when(condition,
  // captures the keyword, the condition (no newlines permitted in shorthand), and the start of the callback
  const regex = /\b(when|whenever)\s*\(\s*([^,\n]+)\s*,\s*(\(|function|async)/g

  let result  = code
  const matches: Array<{
    index:     number
    length:    number
    keyword:   string
    condition: string
    cbStartLen: number
  }> = []

  let match
  while ((match = regex.exec(code)) !== null) {
    const keyword   = match[1]
    const condition = match[2].trim()
    const cbStart   = match[3]

    // skip if this is a function declaration (e.g. export function whenever() { ... })
    const prevText = code.slice(0, match.index).trim();
    if (prevText.endsWith('function')) {
      continue
    }

    // skip if already wrapped in arrow function
    if (condition.startsWith('()') || condition.startsWith('function')) {
      continue
    }

    // skip lifecycle symbols
    if (LIFECYCLE_SYMBOLS.includes(condition)) {
      continue
    }

    matches.push({
      index:     match.index,
      length:    match[0].length - cbStart.length,
      keyword,
      condition,
      cbStartLen: cbStart.length
    })
  }

  matches.reverse().forEach(({ index, length, keyword, condition }) => {
    const before = result.slice(0, index)
    const after  = result.slice(index + length)
    result = `${before}${keyword}(() => ${condition},${after}`
  })

  return result
}
