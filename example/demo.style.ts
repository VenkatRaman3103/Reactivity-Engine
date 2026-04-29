import { style, defineTheme } from '@engine/style'

export const theme = defineTheme({
  color: {
    primary: '#4f8ef7',
    primaryHover: '#3a7de8',
    surface: '#0a0a0a',
    surfaceAlt: '#151515',
    border: '#252525',
    text: '#ededec',
    textDim: '#888',
    textMain: '#ededec',
    accent: '#4f8ef7',
    accentSoft: 'rgba(79, 142, 247, 0.1)',
    success: '#4eca8b',
    warning: '#f0b429',
    error: '#e54d4d',
    code: '#1e1e1e'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px'
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.4)',
    md: '0 4px 8px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.4)'
  },
  font: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
    size: '14px',
    sizeLg: '20px',
    sizeXl: '28px'
  }
})

export const pageContainer = style({
  minHeight: '100vh',
  backgroundColor: theme.color.surface,
  color: theme.color.text,
  fontFamily: theme.font.sans,
  padding: theme.spacing.xl
})

export const section = style({
  borderTop: `2px solid ${theme.color.border}`,
  paddingTop: theme.spacing['2xl'],
  marginTop: theme.spacing['2xl'],

  '&:first-child': {
    borderTop: 'none',
    paddingTop: '0',
    marginTop: '0'
  }
})

export const sectionHeader = style({
  marginBottom: `${theme.spacing.lg} 0 ${theme.spacing.sm} 0`,
  fontSize: theme.font.sizeLg,
  color: theme.color.textMain,
  fontWeight: '600'
})

export const sectionDescription = style({
  margin: `0 0 ${theme.spacing.lg} 0`,
  color: theme.color.textDim,
  fontSize: theme.font.size,
  lineHeight: '1.6'
})

export const demoBox = style({
  padding: theme.spacing.lg,
  backgroundColor: theme.color.surfaceAlt,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.color.border}`,
  marginBottom: theme.spacing.md
})

export const codeBlock = style({
  backgroundColor: theme.color.code,
  padding: theme.spacing.md,
  borderRadius: theme.radius.md,
  fontFamily: theme.font.mono,
  fontSize: '13px',
  overflowX: 'auto',
  marginBottom: theme.spacing.md,
  border: `1px solid ${theme.color.border}`
})

export const button = style({
  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
  backgroundColor: theme.color.primary,
  color: 'white',
  border: 'none',
  borderRadius: theme.radius.md,
  cursor: 'pointer',
  fontSize: theme.font.size,
  fontWeight: '500',

  hover: {
    backgroundColor: theme.color.primaryHover
  }
})

export const badge = style({
  display: 'inline-block',
  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
  backgroundColor: theme.color.primary,
  color: 'white',
  borderRadius: theme.radius.sm,
  fontSize: '12px',
  fontWeight: '600',
  marginRight: theme.spacing.sm
})

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: theme.spacing.md,
  marginBottom: theme.spacing.lg
})

export const card = style({
  padding: theme.spacing.lg,
  backgroundColor: theme.color.surfaceAlt,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.color.border}`,

  hover: {
    borderColor: theme.color.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease'
  }
})
