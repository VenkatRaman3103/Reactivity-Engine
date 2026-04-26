
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
export function compareSnapshots(actual: string, expected: string): { error: string, actual: string, expected: string } | null {
  const cleanActual = cleanHTML(actual)
  const cleanExpected = cleanHTML(expected)

  if (cleanActual === cleanExpected) return null

  return { 
    error: `Structural mismatch detected.`,
    actual: cleanActual,
    expected: cleanExpected
  }
}

function cleanHTML(html: string): string {
  return html
    .replace(/<!---->/g, '')            // Strip internal anchor comments
    .replace(/<!--[\s\S]*?-->/g, '')    // Strip any other HTML comments
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .replace(/v-[\w\d]+/g, '')          // Strip internal engine IDs
    .replace(/id="[^"]*"/g, 'id=""')    // Standardize IDs for structural check
    .trim()
}
