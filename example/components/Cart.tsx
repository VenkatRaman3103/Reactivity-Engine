import {
  items,
  loading,
  removeFromCart,
  updateQuantity,
  clearCart,
  checkout,
} from "./Cart.state";
import { derive, onMount } from "@engine/index";

export default function Cart() {
  const total = derive(() =>
    items.reduce((s, i) => s + i.price * i.quantity, 0),
  );
  const isEmpty = derive(() => items.length === 0);
  const count = derive(() => items.reduce((s, i) => s + i.quantity, 0));

  onMount(() => {
    console.log("Cart mounted");
  });

  return (
    <div class="cart">
      <h1>Cart ({count.value})</h1>
      {isEmpty.value && <p>Your cart is empty</p>}
      {items.map((item) => (
        <div class="cart-item">
          <h3>{item.title}</h3>
          <p>${item.price}</p>
          <div>
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
              -
            </button>
            <span>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
              +
            </button>
          </div>
          <button onClick={() => removeFromCart(item.id)}>Remove</button>
        </div>
      ))}
      {!isEmpty.value && (
        <div>
          <p>Total: ${total.value.toFixed(2)}</p>
          <button onClick={clearCart}>Clear</button>
          <button onClick={checkout}>
            {loading ? "Processing..." : "Checkout"}
          </button>
        </div>
      )}
    </div>
  );
}
