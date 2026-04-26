
export const arr = {
  unique<T>(arr: T[]): T[] {
    return [...new Set(arr)]
  },
  groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
    return arr.reduce((acc, item) => {
      const k = String(item[key])
      return { ...acc, [k]: [...(acc[k] ?? []), item] }
    }, {} as Record<string, T[]>)
  },
  chunk<T>(arr: T[], size: number): T[][] {
    return Array.from(
      { length: Math.ceil(arr.length / size) },
      (_, i) => arr.slice(i * size, i * size + size)
    )
  },
  sortBy<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
    return [...arr].sort((a, b) => {
      if (a[key] < b[key]) return dir === 'asc' ? -1 : 1
      if (a[key] > b[key]) return dir === 'asc' ? 1 : -1
      return 0
    })
  },
  last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1]
  },
  shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5)
  }
}
