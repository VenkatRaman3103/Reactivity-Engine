import { page, goTo } from "./state/app.state";
import Counter from "./components/Counter";
import ProductList from "./components/ProductList";
import Cart from "./components/Cart";
import SuspenseDemo from "./components/SuspenseDemo";

export default function App() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', borderBottom: '3px solid black', paddingBottom: '10px' }}>REACTIVITY ENGINE</h1>
      
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '8px' }}>
        <button onClick={() => goTo("counter")}>Counter</button>
        <button onClick={() => goTo("products")}>Products</button>
        <button onClick={() => goTo("cart")}>Cart</button>
        <button onClick={() => goTo("suspense")}>Suspense & Slots</button>
      </nav>

      <div style={{ padding: '20px', border: '2px solid black' }}>
        {page === "counter" && <Counter />}
        {page === "products" && <ProductList />}
        {page === "cart" && <Cart />}
        {page === "suspense" && <SuspenseDemo />}
      </div>
    </div>
  );
}
