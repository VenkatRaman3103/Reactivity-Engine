
import type { Plugin } from 'vite'
import { transformStyle } from './transform-style'

export function engineStyle(): Plugin {
  return {
    name: 'engine-style',
    enforce: 'pre',

    transform(code: string, id: string) {
      // only handle style files
      const cleanId = id.split('?')[0]
      if (!cleanId.endsWith('.style.ts')) return null

      return {
        code: transformStyle(code),
        map:  null
      }
    }
  }
}
