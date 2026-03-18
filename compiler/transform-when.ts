// compiler/transform-when.ts
// transforms whenever(items, fn) to whenever(() => items, fn)
// transforms when(user, fn) to when(() => user, fn)
// leaves lifecycle symbols alone — when(Mount, fn) unchanged

const LIFECYCLE_SYMBOLS = ['Mount', 'Unmount', 'Err']

export function transformWhenConditions(code: string): string {

  // match whenever(condition, and when(condition,
  // captures the keyword and the condition
  const regex = /\b(when|whenever)\s*\(\s*([\s\S]*?)\s*,\s*(\()/g

  let result  = code
  let offset  = 0

  // collect all matches first to avoid mutation during iteration
  const matches: Array<{
    index:     number
    length:    number
    keyword:   string
    condition: string
  }> = []

  let match
  while ((match = regex.exec(code)) !== null) {
    const keyword   = match[1]
    const condition = match[2].trim()

    // skip if probably a function declaration
    const prevText = code.slice(Math.max(0, match.index - 20), match.index);
    if (prevText.includes('function') || prevText.includes('export')) {
      continue
    }

    // skip if already wrapped in arrow function
    if (condition.startsWith('()') ||
        condition.startsWith('function')) {
      continue
    }

    // skip lifecycle symbols
    if (LIFECYCLE_SYMBOLS.includes(condition)) {
      continue
    }

    matches.push({
      index:     match.index,
      length:    match[0].length - 1, // exclude the captured '('
      keyword,
      condition
    })
  }

  // apply replacements from end to start
  // so indices stay correct
  matches.reverse().forEach(({ index, length, keyword, condition }) => {
    const before = result.slice(0, index)
    const after  = result.slice(index + length)
    result = `${before}${keyword}(() => ${condition},${after}`
  })

  return result
}
