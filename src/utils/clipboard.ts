
export const clipboard = {
  async write(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch { return false }
  },
  async read(): Promise<string | null> {
    try {
      return await navigator.clipboard.readText()
    } catch { return null }
  }
}
