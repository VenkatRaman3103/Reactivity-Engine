interface Product {
  id: number;
  title: string;
  price: number;
}

export let products: Product[] = [];
export let loading: boolean = false;
export let error: string | null = null;
export let selectedId: number | null = null;

export async function fetchProducts() {
  loading = true;
  error = null;
  products = [];
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=5");
    if (!res.ok) throw new Error("API call failed");
    products = await res.json();
  } catch (e: any) {
    console.warn("API fetch failed, using mock data:", e.message);
    error = null; // Clear error to show mock data instead
    products = [
      { id: 1, title: "Mock Backpack", price: 109.95 },
      { id: 2, title: "Mock T-Shirt", price: 22.3 },
      { id: 3, title: "Mock Jacket", price: 55.99 },
      { id: 4, title: "Mock Slim Fit", price: 15.99 },
      { id: 5, title: "Mock Bracelet", price: 695.00 },
    ];
  } finally {
    loading = false;
  }
}

export function selectProduct(id: number) {
  selectedId = id;
}
export function clearSelection() {
  selectedId = null;
}
