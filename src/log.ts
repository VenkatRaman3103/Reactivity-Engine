
const isDev = import.meta.env.DEV

// each channel holds its log entries
// devtools reads these to show per-channel tabs
const channels = new Map<string, any[]>()

function createChannel(name: string) {
  if (!channels.has(name)) {
    channels.set(name, [])
    // tell devtools a new channel exists
    ;(window as any).__engine?.registerLogChannel?.(name)
  }

  return (value: any) => {
    if (!isDev) return

    const entry = {
      value,
      time:  new Date().toLocaleTimeString(),
      stack: new Error().stack
    }

    channels.get(name)!.push(entry)

    // styled console output
    console.log(
      `%c[${name}]%c`,
      'color: #7ec8e3; font-weight: bold',
      'color: inherit',
      value
    )

    // refresh devtools panel if open
    ;(window as any).__engine?.refreshLogPanel?.()
  }
}

// Proxy — any property access creates a channel
export const log = new Proxy({} as Record<string, (value: any) => void>, {
  get(_, name: string) {
    if (!isDev) return () => {}
    return createChannel(name)
  }
})

// expose channels for devtools
export function getLogChannels() {
  return channels
}
