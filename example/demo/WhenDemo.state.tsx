// example/demo/WhenDemo.state.tsx
import { whenever, when } from "@engine/index";

interface CartItem {
  id: number;
  name: string;
  price: number;
}

interface User {
  name: string;
  isLoggedIn: boolean;
}

export let items: CartItem[] = []
export let total       = 0
export let isEmpty     = true
export let count       = 0
export let discount    = false
export let user: User | null = null
export let canCheckout = false

// plain variable — compiler wraps to () => items
whenever(items, () => {
  total    = items.reduce((s, i) => s + (i.price || 0), 0)
  isEmpty  = items.length === 0
  count    = items.length
})

// expression — compiler wraps to () => items.length > 3
whenever(items.length > 3, () => {
  discount = true
})

whenever(!(items.length > 3), () => {
  discount = false
})

// multiple conditions — compiler wraps to () => items && user
whenever(items.length > 0 && user, () => {
  canCheckout = !isEmpty && user.isLoggedIn
})

// runs once when user first set
when(user, () => {
  console.log('User detected for the first time:', user.name)
})

export function addItem() {
  const id = Math.floor(Math.random() * 1000)
  items = [...items, { id, name: `Item ${id}`, price: Math.floor(Math.random() * 50) + 10 }]
}

export function removeItem(id: number) {
  items = items.filter(i => i.id !== id)
}

export function clearCart() {
  items = []
}

export function login() {
  user = { name: 'Demo User', isLoggedIn: true }
}

export function logout() {
  user = null
  canCheckout = false
}
