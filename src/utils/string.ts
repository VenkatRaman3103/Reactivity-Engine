
export const str = {
  truncate(s: string, max: number, suffix = '...'): string {
    return s.length > max ? s.slice(0, max - suffix.length) + suffix : s
  },
  slugify(s: string): string {
    return s.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
  },
  titleCase(s: string): string {
    return s.replace(/\b\w/g, c => c.toUpperCase())
  },
  camelToKebab(s: string): string {
    return s.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`)
  },
  kebabToCamel(s: string): string {
    return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  }
}
