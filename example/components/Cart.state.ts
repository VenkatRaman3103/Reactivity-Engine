interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

export let items: CartItem[] = [];
export let loading: boolean = false;

export function addToCart(p: Omit<CartItem, "quantity">) {
  const found = items.find((i) => i.id === p.id);
  items = found
    ? items.map((i) => (i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i))
    : [...items, { ...p, quantity: 1 }];
}

export function removeFromCart(id: number) {
  items = items.filter((i) => i.id !== id);
}

export function updateQuantity(id: number, qty: number) {
  if (qty <= 0) {
    removeFromCart(id);
    return;
  }
  items = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
}

export function clearCart() {
  items = [];
}

export async function checkout() {
  loading = true;
  try {
    await fetch("/api/checkout", {
      method: "POST",
      body: JSON.stringify({ items }),
      headers: { "Content-Type": "application/json" },
    });
    clearCart();
  } finally {
    loading = false;
  }
}
