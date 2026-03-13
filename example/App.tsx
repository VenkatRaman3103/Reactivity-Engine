import { page, goTo } from "./state/app.state";
import Counter from "./components/Counter";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";

export default function App() {
  return (
    <div>
      <nav>
        <button onClick={() => goTo("counter")}>Counter</button>
        <button onClick={() => goTo("products")}>Products</button>
        <button onClick={() => goTo("cart")}>Cart</button>
      </nav>
      {page === "counter" && <Counter />}
      {page === "products" && <ProductList />}
      {page === "cart" && <Cart />}
    </div>
  );
}
