import { page, goTo } from "./state/app.state";
import Counter from "./components/Counter";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import ErrorDemo from "./components/ErrorDemo";

export default function App() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem' }}>💠 Reactivity Engine</h1>
      
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button onClick={() => goTo("counter")}>Counter</button>
        <button onClick={() => goTo("products")}>Products</button>
        <button onClick={() => goTo("cart")}>Cart</button>
      </nav>

      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
        {page === "counter" && <Counter />}
        {page === "products" && <ProductList />}
        {page === "cart" && <Cart />}
      </div>

      <ErrorDemo />
    </div>
  );
}
