export let role    = 'user'
export let user: { name: string } | null = { name: 'John' }
export let loading = false

export function setRole(r: string)    { role    = r    }
export function setLoading(v: boolean){ loading = v    }
export function login(name: string)   { user    = { name } }
export function logout()              { user    = null }
