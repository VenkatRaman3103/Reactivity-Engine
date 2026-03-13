import {
  products,
  loading,
  error,
  selectedId,
  fetchProducts,
  selectProduct,
  clearSelection,
} from "./ProductList.state";
import { addToCart } from "./Cart.state";
import { derive, onMount, onError } from "@engine/index";

export default function ProductList() {
  const selected = derive(
    () => products.find((p) => p.id === selectedId) ?? null,
  );
  const total = derive(() => products.reduce((s, p) => s + p.price, 0));

  onMount(() => {
    fetchProducts();
  });

  onError((e) => (
    <div>
      <p>{e.message}</p>
      <button onClick={fetchProducts}>Retry</button>
    </div>
  ));

  return (
    <div class="product-list">
      <h1>Products</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {products.map((p) => (
        <div
          class={selectedId === p.id ? "product selected" : "product"}
          onClick={() => selectProduct(p.id)}
        >
          <h3>{p.title}</h3>
          <p>${p.price}</p>
          <button onClick={() => addToCart(p)}>Add to Cart</button>
        </div>
      ))}
      {products.length > 0 && <p>Total: ${total.value.toFixed(2)}</p>}
      {selected.value && (
        <div class="detail">
          <h2>{selected.value.title}</h2>
          <button onClick={clearSelection}>Close</button>
        </div>
      )}
    </div>
  );
}
