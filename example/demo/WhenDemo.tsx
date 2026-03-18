// example/demo/WhenDemo.tsx
import { h, Mount, Unmount, Err, when, type ErrObject } from "@engine/index";
import {
  items, total, isEmpty,
  count, discount, canCheckout, user,
  addItem, removeItem, clearCart, login, logout
} from "./WhenDemo.state";

export default function WhenDemo() {

  when(Mount, () => {
    console.log('🛒 WhenDemo mounted')
  })

  when(Unmount, () => {
    console.log('🛒 WhenDemo unmounted')
  })

  when(Err, (e: ErrObject) => {
    console.warn('🛒 WhenDemo error caught:', e.message)
  })

  return (
    <div class="demo-card">
      <div class="demo-card-header">
        <h3>Conditional Effects & Lifecycle</h3>
      </div>
      
      <div class="demo-card-body">
        <p class="demo-info">
          This demo showcases <code>when()</code> and <code>whenever()</code>. 
          The compiler automatically wraps values in arrow functions.
        </p>

        <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--bg-dim)', borderRadius: '8px' }}>
          {() => user ? (
            <div>
              <span style={{ color: 'var(--brand-main)', fontWeight: 'bold' }}>Logged in as: {user.name}</span>
              <button class="btn btn-sm" onClick={logout} style={{ marginLeft: '12px' }}>Logout</button>
            </div>
          ) : (
            <button class="btn btn-primary btn-sm" onClick={login}>Login to Checkout</button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0 }}>Cart Items ({() => count})</h4>
          <button class="btn btn-primary btn-sm" onClick={addItem}>Add Random Item</button>
        </div>

        {() => isEmpty ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', border: '1px dashed var(--border-main)', borderRadius: '8px' }}>
            Your cart is empty.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {() => items.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: '6px' }}>
                <span>{item.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>${item.price}</span>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 0 }}
                    onClick={() => removeItem(item.id)}
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {() => !isEmpty && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-main)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>${total}</span>
            </div>
            
            {() => discount && (
              <div style={{ color: '#27ae60', fontSize: '12px', marginBottom: '12px', fontWeight: '500' }}>
                ✨ Bulk discount (more than 3 items) applied!
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button class="btn btn-outline" onClick={clearCart} style={{ flex: 1 }}>Clear Cart</button>
              <button 
                class="btn btn-primary" 
                disabled={() => !canCheckout} 
                style={{ flex: 2 }}
                onClick={() => alert('Order placed!')}
              >
                Checkout {() => !canCheckout && "(Login required)"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
