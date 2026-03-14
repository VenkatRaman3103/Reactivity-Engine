import { count, increment } from "./feature.state";

export default function StateDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Unidirectional Data Flow</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            In large-scale applications, the most common source of "impossible bugs" is unpredictable state mutation. When any component can modify any piece of state at any time, tracking down the source of a change becomes a nightmare. Our engine enforces <strong>Strict Unidirectionality</strong> by protecting your state from direct manipulation.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            All state objects are wrapped in <strong>Reactive Proxies</strong>. These proxies acting as "gatekeepers" that distinguish between "Contextual Actions" (code inside your <code>.state.ts</code> files) and "External Access" (code in your components).
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Proxy Projection & Protection</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            When you import a state variable into a <code>.tsx</code> file, you are receiving a "projected" view of that state. It is reactive and readable, but any attempt to write to it directly—like <code>count++</code> inside an event handler—will be caught by the engine's security layer.
          </p>
          
          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>The Console Warning:</strong> When a violation occurs, the engine doesn't just block the update; it triggers our <strong>Error Overlay</strong> and logs a detailed stack trace to help you find the offending line immediately.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>The Action Enforcement Pattern</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            By requiring all mutations to happen inside exported functions in your state files, we ensure that every state change is <strong>deliberate</strong> and <strong>traceable</strong>. This creates a clean "Audit Log" of how your application's data evolves over time, making debugging significantly easier.
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
                   <span class="monitor-tag-text">Security Monitor</span>
                 </div>
                 <h3 class="monitor-title">Context Enforcement</h3>
               </div>
               <button class="demo-btn primary" onClick={() => increment()}>Call Action (Valid)</button>
             </div>
             
             <div class="monitor-grid">
               <div>
                  <div class="monitor-label">VALUE MONITOR</div>
                  <div class="monitor-value large">{count}</div>
               </div>
               <div>
                  <div class="monitor-label">WRITE ACCESS</div>
                  <div class="monitor-value accent">PROTECTED</div>
               </div>
             </div>
          </div>
          
          <div style={{ padding: '32px', border: '1px solid rgba(255, 77, 77, 0.3)', borderRadius: '8px', background: 'rgba(255, 77, 77, 0.05)' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#dc2626', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Violation Simulator</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.6' }}>
              The button below attempts to modify <code>count</code> directly from this component file. The engine will intercept this, block the update, and show the Error Overlay.
            </p>
            <button class="demo-btn" style={{ borderColor: '#ff4d4d', color: '#ff4d4d', background: 'transparent' }} onClick={() => {
              // @ts-ignore
              count++;
            }}>
              Trigger Direct Mutation
            </button>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">State Definition (Safe)</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>feature.state.ts</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// State is protected from external mutation</span>{"\n"}
              <span class="highlight-keyword">export let</span> count = 0;{"\n\n"}
              <span class="highlight-comment">// Mutations are ONLY allowed in state files</span>{"\n"}
              <span class="highlight-keyword">export function</span> <span class="highlight-func">increment</span>() {"{"}{"\n"}
              {'  '}count++;{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">Component Logic (Restricted)</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>StateDemo.tsx</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Security: components receive read-only proxies</span>{"\n"}
              <span class="highlight-keyword">import</span> {"{"} count {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">"./feature.state"</span>;{"\n\n"}
              <span class="highlight-comment">// This will trigger a Security Violation!</span>{"\n"}
              &lt;<span class="highlight-keyword">button</span> <span class="highlight-func">onClick</span>={"{"}() =&gt; count++{"}"}&gt; {"\n"}
              {'  '}Attemp mutation{"\n"}
              &lt;/<span class="highlight-keyword">button</span>&gt;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
