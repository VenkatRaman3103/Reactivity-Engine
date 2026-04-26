
import { log } from '../log'

const PREFIX = 'engine_snapshot:'

export function getSnapshot(key: string): string | null {
  return localStorage.getItem(PREFIX + key)
}

export function saveSnapshot(key: string, html: string) {
  localStorage.setItem(PREFIX + key, html)
  log.test_debug(`[Snapshot] Created new snapshot for: ${key}`)
}

export function clearSnapshots() {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(PREFIX)) localStorage.removeItem(k)
  })
}

/**
 * Compares two HTML strings and returns a diff description if they differ.
 * Very simple version for now, focusing on structural equality.
 */
export function compareSnapshots(actual: string, expected: string): string | null {
  const cleanActual = cleanHTML(actual)
  const cleanExpected = cleanHTML(expected)

  if (cleanActual === cleanExpected) return null

  // Find the first point of difference for the error message
  let i = 0
  while (i < cleanActual.length && cleanActual[i] === cleanExpected[i]) i++
  
  const context = 20
  const diffPart = cleanActual.substring(Math.max(0, i - context), i + context)
  
  return `Structural mismatch at char ${i}. \nPreview: ...${diffPart}...`
}

function cleanHTML(html: string): string {
  return html
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .replace(/v-[\w\d]+/g, '')          // Strip internal engine IDs
    .replace(/id="[^"]*"/g, 'id=""')    // Optional: could be too aggressive? Let's keep for now.
    .trim()
}
