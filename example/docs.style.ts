import { style, defineTheme } from '@engine/style'

export const { color, spacing, font } = defineTheme({
  color: {
    primary: '#4f8ef7',
    primaryHover: '#3a7de8',
    surface: '#0a0a0a',
    surfaceAlt: '#151515',
    border: '#252525',
    text: '#ededec',
    textMuted: '#888',
    code: '#1e1e1e',
    success: '#4eca8b',
    warning: '#f0b429'
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
    lg: '8px'
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.4)'
  },
  font: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace'
  }
})

export const layout = style({
  display: 'flex',
  minHeight: '100vh',
  fontFamily: font.sans,
  color: color.text,
  backgroundColor: color.surface
})

export const sidebar = style({
  width: '260px',
  backgroundColor: color.surfaceAlt,
  borderRight: `1px solid ${color.border}`,
  padding: spacing.md,
  overflowY: 'auto',
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0
})

export const sidebarTitle = style({
  fontSize: '20px',
  fontWeight: '700',
  marginBottom: spacing.lg,
  color: color.primary
})

export const navItem = style({
  display: 'flex',
  alignItems: 'center',
  padding: `${spacing.sm} ${spacing.md}`,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginBottom: spacing.xs,
  fontSize: '14px',

  hover: {
    backgroundColor: color.border,
    color: color.primary
  }
})

export const navItemActive = style({
  backgroundColor: color.primary,
  color: 'white',

  hover: {
    backgroundColor: color.primaryHover
  }
})

export const content = style({
  marginLeft: '260px',
  padding: spacing.xl,
  maxWidth: '900px',
  width: '100%'
})

export const section = style({
  marginBottom: spacing.xl,
  padding: spacing.lg,
  backgroundColor: color.surfaceAlt,
  borderRadius: '8px',
  border: `1px solid ${color.border}`
})

export const heading = style({
  fontSize: '28px',
  fontWeight: '700',
  marginBottom: spacing.md,
  color: color.text
})

export const subheading = style({
  fontSize: '20px',
  fontWeight: '600',
  marginBottom: spacing.sm,
  marginTop: spacing.lg,
  color: color.primary
})

export const paragraph = style({
  fontSize: '15px',
  lineHeight: '1.6',
  marginBottom: spacing.md,
  color: color.textMuted
})

export const codeBlock = style({
  backgroundColor: color.code,
  padding: spacing.md,
  borderRadius: '6px',
  fontFamily: font.mono,
  fontSize: '13px',
  overflowX: 'auto',
  marginBottom: spacing.md,
  border: `1px solid ${color.border}`
})

export const demoBox = style({
  padding: spacing.lg,
  backgroundColor: color.surface,
  borderRadius: '8px',
  border: `1px solid ${color.border}`,
  marginBottom: spacing.md
})

export const button = style({
  padding: `${spacing.sm} ${spacing.md}`,
  backgroundColor: color.primary,
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',

  hover: {
    backgroundColor: color.primaryHover
  }
})

export const badge = style({
  display: 'inline-block',
  padding: `${spacing.xs} ${spacing.sm}`,
  backgroundColor: color.primary,
  color: 'white',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: '600',
  marginRight: spacing.sm
})
