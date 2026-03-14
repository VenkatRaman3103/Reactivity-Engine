import { items, addItem, removeItem, clearItems } from "./ListDemo.state";

export default function ListDemo() {
  let inputVal = "";

  const handleAdd = () => {
    if (!inputVal.trim()) return;
    addItem(inputVal);
    // Note: The input clear is handled by re-rendering or manual manipulation 
    // depending on the engine's current input binding status.
  };

  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Reactive Collections (Lists)</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Managing lists of data is often where reactivity engines struggle with performance. Traditional frameworks frequently re-render entire lists when a single item changes, or require complex "keys" to keep track of elements. Our engine simplifies this by treating collections as first-class reactive citizens.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            When you use <code>.map()</code> in your JSX, the compiler doesn't just run a loop; it sets up a <strong>Collection Observer</strong>. This observer monitors the array for mutations. Because we use immutable patterns (like the spread operator) for updates, the engine can quickly identify that a new array reference has been provided and perform its magic.
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Efficient Reconciliation</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            When a list is updated, the engine performs a "diff-less" reconciliation. Instead of recreating the entire DOM structure, it compares the new array with the old one. It strategically adds, removes, or moves elements only where necessary. This preserves important UI state like <strong>input focus</strong> and <strong>scroll position</strong> within list items.
          </p>

          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>Internal Logic:</strong> The engine uses a persistent mapping between your data objects and their corresponding DOM nodes. This means that if you move an item from the bottom of a list to the top, the DOM node is physically moved rather than being destroyed and recreated.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Zero-Boilerplate Collections</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            Notice that there are no special "List Objects" or "ArrayList" wrappers. You use standard JavaScript arrays. The reactivity is injected at the declaration site in your <code>.state.ts</code> file, making the data layer stay pure and easy to test.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Example</div>
          <div class="monitor-card">
             <div class="monitor-header">
               <div>
                 <div class="monitor-tag">
                   <div class="monitor-pulse"></div>
                   <span class="monitor-tag-text">Action Monitor</span>
                 </div>
                 <h3 class="monitor-title">Collection Analytics</h3>
               </div>
             </div>
             
             <div class="monitor-grid">
               <div>
                  <div class="monitor-label">TOTAL ITEMS</div>
                  <div class="monitor-value large">{items.length}</div>
               </div>
               <div>
                  <div class="monitor-label">TRACKING STATUS</div>
                  <div class="monitor-value accent">OBSERVING MUTATIONS</div>
               </div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
            <input 
              type="text" 
              class="demo-input"
              style={{ padding: '12px 16px' }}
              placeholder="What needs to be done?" 
              onInput={(e: any) => inputVal = e.target.value}
            />
            <button class="demo-btn primary" style={{ padding: '0 24px' }} onClick={handleAdd}>Add Item</button>
            <button class="demo-btn" onClick={() => clearItems()}>Clear All</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)', border: '1px dashed var(--border)', borderRadius: '6px' }}>
                No items in list. Add some above!
              </div>
            ) : items.map((item: any) => (
              <div class="list-item">
                <span style={{ fontSize: '14px' }}>{item.text}</span>
                <button class="remove-btn" onClick={() => removeItem(item.id)}>
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">State Logic</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>ListDemo.state.ts</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Reactive collections: arrays that track mutations</span>{"\n"}
              <span class="highlight-keyword">export let</span> items = [];{"\n\n"}
              <span class="highlight-comment">// Immutable updates trigger reactive observers</span>{"\n"}
              <span class="highlight-keyword">export function</span> <span class="highlight-func">addItem</span>(text) {"{"}{"\n"}
              {'  '}items = [...items, {"{"} id: Date.now(), text {"}"}];{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">UI Mapping</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>ListDemo.tsx</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Standard .map() is transformed into a Collection Observer</span>{"\n"}
              {"{"}items.<span class="highlight-func">map</span>(item =&gt; ({"\n"}
              {'  '}&lt;<span class="highlight-keyword">div</span>&gt;{"{"}item.text{"}"}&lt;/<span class="highlight-keyword">div</span>&gt;{"\n"}
              )){"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
