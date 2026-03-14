import { effect, onMount, onUnmount } from "../../src/index";
import { count, logs, increment, reset, addLog } from "./EffectDemo.state";

export default function EffectDemo() {
  effect(() => {
    document.title = `Count: ${count}`;
    addLog(`Effect ran: document.title updated to ${count}`);
  });

  onMount(() => {
    addLog("Component mounted");
    return () => console.log("cleanup");
  });

  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Reactive Side Effects</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            While signals and derived state handle the <strong>data</strong> and <strong>view</strong>, sometimes you need to interact with the "outside world". This is where <strong>Effects</strong> come in. An effect is a piece of code that runs automatically whenever the reactive values it reads are updated.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Effects are perfect for tasks like synchronizing with external APIs, manipulating the <code>document.title</code>, logging analytics, or setting up timers. They bridge the gap between our reactive system and non-reactive browser APIs.
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>The Effect Lifecycle</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            When you define an <code>effect(() =&gt; ...)</code>, the engine immediately runs the function once to track its dependencies. After that, it schedules a re-run whenever those dependencies change. What's unique about our implementation is <strong>Automatic Cleanup</strong>—if your component unmounts, the engine intelligently stops the effects to prevent memory leaks.
          </p>
          
          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>Batching:</strong> If you update five signals in a single function, the effect only runs <strong>once</strong> at the end of the operation. This prevents "state flapping" and ensures your side effects are efficient.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Reactive Synchronicity</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            Effects provide a reliable way to ensure that your application's external state always matches its internal data. It's the ultimate tool for developers who want to maintain high consistency across the entire user experience without writing complex event listeners.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Example</div>
        <div class="demo-interactive">
          <div class="monitor-card">
             <div class="monitor-header">
               <div>
                 <div class="monitor-tag">
                   <div class="monitor-pulse"></div>
                   <span class="monitor-tag-text">Action Monitor</span>
                 </div>
                 <h3 class="monitor-title">Side Effect Synchronization</h3>
               </div>
               <div style={{ display: 'flex', gap: '8px' }}>
                 <button class="demo-btn primary" style={{ padding: '8px 20px' }} onClick={() => increment()}>Increment</button>
                 <button class="demo-btn" onClick={() => reset()}>Reset</button>
               </div>
             </div>
             
             <div class="monitor-grid">
               <div>
                  <div class="monitor-label">TARGET STATUS</div>
                  <div class="monitor-value">"Count: {count}"</div>
               </div>
               <div>
                  <div class="monitor-label">ENGINE STATUS</div>
                  <div class="monitor-value accent">SYNC ACTIVE</div>
               </div>
             </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
             <div class="demo-section-label" style={{ fontSize: '9px', marginBottom: '16px' }}>Execution Trace</div>
             <div style={{ 
               background: 'var(--bg-card)', 
               padding: '20px', 
               border: '1px solid var(--border)', 
               borderRadius: '6px', 
               fontFamily: 'var(--font-mono)', 
               fontSize: '12px', 
               color: 'var(--monitor-accent)',
               minHeight: '80px'
             }}>
               {logs.map(log => (
                 <div style={{ marginBottom: '4px', opacity: 1 }}>
                   <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>LOG</span> {new Date().toLocaleTimeString()} - {log}
                 </div>
               ))}
               {logs.length === 0 && <div style={{ color: '#444' }}>Waiting for updates...</div>}
             </div>
          </div>
          
          <div class="tip-card" style={{ marginTop: '24px' }}>
            <strong>Observe:</strong> Look at the browser tab title or the logs above as you interact with the counter.
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">State & Actions</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>EffectDemo.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Standard variables transformed into signals</span>{"\n"}
              <span class="highlight-keyword">export let</span> count = 0;{"\n"}
              <span class="highlight-keyword">export let</span> logs = [];{"\n\n"}
              <span class="highlight-comment">// Actions that trigger reactivity</span>{"\n"}
              <span class="highlight-keyword">export function</span> <span class="highlight-func">increment</span>() {"{"}{"\n"}
              {'  '}count++;{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">Side Effect Logic</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>EffectDemo.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} effect {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">"@engine"</span>;{"\n\n"}
              <span class="highlight-comment">// Effects run automatically on dependency changes</span>{"\n"}
              <span class="highlight-func">effect</span>(() =&gt; {"{"}{"\n"}
              {'  '}<span class="highlight-comment">// Tracks 'count' automatically</span>{"\n"}
              {'  '}document.title = <span class="highlight-string">`Count: ${"{"}count{"}"}`</span>;{"\n"}
              {'  '}<span class="highlight-func">addLog</span>(<span class="highlight-string">"Updated title"</span>);{"\n"}
              {"}"});
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
