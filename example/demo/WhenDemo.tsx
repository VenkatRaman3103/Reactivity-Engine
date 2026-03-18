// example/demo/WhenDemo.tsx
import { h, Mount, Unmount, when } from "@engine/index";
import {
  count, total, increment, decrement, resetCount,
  user, welcomed, login, logout,
  items, discount, message, addItem, removeItem, clearCart,
  lifecycleLogs, showLiveComponent, toggleLiveComponent, addLifecycleLog
} from "./WhenDemo.state";

function Highlight({ code }: { code: string }) {
  const lines = code.split('\n');
  return (
    <div class="demo-code-content">
      {lines.map(line => {
        let processed = line;
        if (processed.includes('export let')) {
          const parts = processed.split('export let');
          return <div><span class="highlight-keyword">export let</span>{parts[1]}</div>;
        }
        if (processed.includes('export function')) {
          const parts = processed.split('export function');
          const funcParts = parts[1].split('(');
          return <div><span class="highlight-keyword">export function</span><span class="highlight-func">{funcParts[0]}</span>({funcParts[1]}</div>;
        }
        if (processed.includes('whenever') || processed.includes('when')) {
          const name = processed.includes('whenever') ? 'whenever' : 'when';
          const parts = processed.split(name);
          return <div>{parts[0]}<span class="highlight-func">{name}</span>{parts[1]}</div>;
        }
        if (processed.includes('import')) {
          return <div><span class="highlight-keyword">import</span>{processed.split('import')[1]}</div>;
        }
        if (processed.includes('//')) {
          return <div><span class="highlight-comment">{processed}</span></div>;
        }
        return <div>{processed}</div>;
      })}
    </div>
  );
}

function CodeBlock({ code, filename }: { code: string, filename: string }) {
  return (
    <div class="demo-code-block" style={{ marginTop: '24px' }}>
      <div class="demo-code-header">
        <span>{filename}</span>
      </div>
      <Highlight code={code} />
    </div>
  );
}

function LiveComponent() {
  when(Mount, () => {
    addLifecycleLog(`mounted at ${new Date().toLocaleTimeString()}`);
  });

  when(Unmount, () => {
    addLifecycleLog(`unmounted at ${new Date().toLocaleTimeString()}`);
  });

  return (
    <div style={{ 
      padding: '24px', 
      background: 'var(--accent-soft)', 
      border: '1px solid var(--accent)', 
      borderRadius: '8px',
      textAlign: 'center',
      color: 'var(--accent)',
      fontWeight: 'bold',
      marginTop: '16px'
    }}>
      <div class="monitor-pulse" style={{ margin: '0 auto 12px' }}></div>
      I AM ALIVE
    </div>
  );
}

export default function WhenDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        
        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>1. whenever</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            <code>whenever</code> runs every time the condition changes. No dependency arrays. No <code>useEffect</code>. Just declare the condition and what to do.
          </p>
        </div>

        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>2. when</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            <code>when</code> runs exactly once. When the condition first becomes true — it fires. Never again after that. Perfect for one-time initialization.
          </p>
        </div>

        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>3. Advanced Logic</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            <code>whenever</code> composes naturally with plain TypeScript. One block handles all variants cleanly.
          </p>
        </div>

        <div style={{ marginBottom: '60px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>4. Lifecycle Hooks</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Lifecycle is just <code>when</code> with engine constants like <code>Mount</code> and <code>Unmount</code>.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Showcase</div>

        {/* Part 1 */}
        <div class="demo-interactive">
          <div class="monitor-card">
            <div class="monitor-header">
              <h3 class="monitor-title">Reactive Scaling</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button class="demo-btn primary" onClick={increment}>+</button>
                <button class="demo-btn" onClick={decrement}>-</button>
                <button class="demo-btn" onClick={resetCount}>Reset</button>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">COUNT</div>
                <div class="monitor-value large">{() => count}</div>
              </div>
              <div>
                <div class="monitor-label">TOTAL (COUNT * 2)</div>
                <div class="monitor-value accent large">{() => total}</div>
              </div>
            </div>
          </div>
          <CodeBlock 
            filename="WhenDemo.state.ts"
            code={`export let count = 0\nexport let total = 0\n\nwhenever(count, () => {\n  total = count * 2\n})`} 
          />
        </div>

        {/* Part 2 */}
        <div class="demo-interactive">
          <div class="monitor-card" style={{ borderColor: 'var(--monitor-accent)' }}>
            <div class="monitor-header">
              <h3 class="monitor-title">One-Time Trigger</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button class="demo-btn primary" onClick={login}>Login</button>
                <button class="demo-btn" onClick={logout}>Logout</button>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">USER STATUS</div>
                <div class="monitor-value">{() => user ? 'Authenticated' : 'Guest'}</div>
              </div>
              <div>
                <div class="monitor-label">WELCOMED</div>
                <div class="monitor-value accent">{() => welcomed ? 'YES' : 'NO'}</div>
              </div>
            </div>
          </div>
          <CodeBlock 
            filename="WhenDemo.state.ts"
            code={`export let user = null\nexport let welcomed = false\n\nwhen(user, () => {\n  welcomed = true\n})`} 
          />
        </div>

        {/* Part 3 */}
        <div class="demo-interactive">
          <div class="monitor-card">
            <div class="monitor-header">
              <h3 class="monitor-title">Discount Tiers</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button class="demo-btn primary" onClick={addItem}>Add Item</button>
                <button class="demo-btn" onClick={removeItem}>Remove</button>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div class="monitor-label">ACTIVE MESSAGE</div>
              <div class="monitor-value accent" style={{ fontSize: '16px', fontWeight: '500' }}>{() => message}</div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">ITEMS IN CART</div>
                <div class="monitor-value large">{() => items.length}</div>
              </div>
              <div>
                <div class="monitor-label">DISCOUNT APPLIED</div>
                <div class="monitor-value accent large">{() => discount}%</div>
              </div>
            </div>
          </div>
          <CodeBlock 
            filename="WhenDemo.state.ts"
            code={`whenever(items, () => {\n  switch (true) {\n    case items.length >= 10: discount = 20; break;\n    case items.length >= 5:  discount = 10; break;\n    default: discount = 0;\n  }\n})`} 
          />
        </div>

        {/* Part 4 */}
        <div class="demo-interactive">
          <div class="monitor-card" style={{ background: 'var(--bg-sidebar)' }}>
             <div class="monitor-header">
              <h3 class="monitor-title">Lifecycle Trace</h3>
              <button class="demo-btn primary" onClick={toggleLiveComponent}>
                {() => showLiveComponent ? "Kill Component" : "Spawn Component"}
              </button>
            </div>

            {() => showLiveComponent && <LiveComponent />}

            <div style={{ 
              marginTop: '24px',
              padding: '16px',
              background: '#000',
              borderRadius: '6px',
              border: '1px solid var(--border)',
              maxHeight: '150px',
              overflowY: 'auto'
            }}>
              {() => lifecycleLogs.map(log => (
                <div style={{ color: 'var(--monitor-accent)', fontFamily: 'var(--font-mono)', fontSize: '11px', marginBottom: '4px' }}>
                  {log}
                </div>
              ))}
              {() => lifecycleLogs.length === 0 && <div style={{ color: '#444', fontSize: '11px' }}>Waiting for events...</div>}
            </div>
          </div>
          <CodeBlock 
            filename="WhenDemo.tsx"
            code={`when(Mount, () => {\n  addLog("mounted")\n})\n\nwhen(Unmount, () => {\n  addLog("unmounted")\n})`} 
          />
        </div>
      </div>
    </div>
  );
}
