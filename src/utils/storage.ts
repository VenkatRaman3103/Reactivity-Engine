
export const store = {
  get<T>(key: string): T | null {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : null
    } catch { return null }
  },
  set(key: string, value: any) {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove(key: string) {
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}

export const session = {
  get<T>(key: string): T | null {
    try {
      const v = sessionStorage.getItem(key)
      return v ? JSON.parse(v) : null
    } catch { return null }
  },
  set(key: string, value: any) {
    try { sessionStorage.setItem(key, JSON.stringify(value)) } catch {}
  },
  remove(key: string) { sessionStorage.removeItem(key) }
}
