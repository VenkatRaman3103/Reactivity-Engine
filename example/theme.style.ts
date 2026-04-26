
import { defineTheme } from '@engine/style'

export const { color, spacing, radius, shadow, font } = defineTheme({
  color: {
    primary:      '#4f8ef7',
    primaryHover: '#3a7de8',
    surface:      '#1a1a1a',
    surfaceHover: '#1f1f1f',
    border:       '#2a2a2a',
    text:         '#ededec',
    textMuted:    '#9b9b9b',
    error:        '#e54d4d',
    success:      '#4eca8b',
    warning:      '#f0b429'
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px'
  },

  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    full: '9999px'
  },

  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.4)',
    md: '0 4px 8px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.4)'
  },

  font: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace'
  }
})
