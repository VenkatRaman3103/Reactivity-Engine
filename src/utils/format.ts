
export const format = {
  date(date: Date | string, locale = 'en-US'): string {
    return new Date(date).toLocaleDateString(locale)
  },
  time(date: Date | string, locale = 'en-US'): string {
    return new Date(date).toLocaleTimeString(locale)
  },
  datetime(date: Date | string, locale = 'en-US'): string {
    return new Date(date).toLocaleString(locale)
  },
  relative(date: Date | string): string {
    const diff = Date.now() - new Date(date).getTime()
    const s    = Math.floor(diff / 1000)
    if (s < 60)   return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  },
  currency(amount: number, currency = 'USD', locale = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency', currency
    }).format(amount)
  },
  number(n: number, locale = 'en-US'): string {
    return new Intl.NumberFormat(locale).format(n)
  },
  bytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024
      i++
    }
    return `${bytes.toFixed(1)} ${units[i]}`
  }
}
