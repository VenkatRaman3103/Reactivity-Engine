import { h, memo } from "../../src/index";

function ExpensiveComponent() {
  return <div style={{ padding: '24px', background: 'var(--accent-soft)', borderRadius: '8px' }}>
    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Memoized Component</h4>
    <p style={{ margin: 0, color: 'var(--text-dim)' }}>This component only re-renders when its state changes.</p>
  </div>;
}

const MemoizedComponent = memo(ExpensiveComponent);

export default function MemoDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Memoization</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Skip unnecessary re-renders with <code>memo()</code>. Uses snapshot-based change detection to cache rendered output.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Wrap your component function to automatically memoize based on state changes.
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
                  <span class="monitor-tag-text">Memo Monitor</span>
                </div>
                <h3 class="monitor-title">Memoization Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">MEMO STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
              <div>
                <div class="monitor-label">RE-RENDERS</div>
                <div class="monitor-value">SKIPPED</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <MemoizedComponent />
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>ExpensiveComponent.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">memo</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">const</span> ExpensiveComponent = <span class="highlight-func">memo</span>(<span class="highlight-keyword">function</span> <span class="highlight-func">Expensive</span>() {"{"}
              {"\n"}
              {"  "}<span class="highlight-comment">// This only re-renders when its state actually changes</span>
              {"\n"}
              {"  "}<span class="highlight-keyword">return</span> &lt;<span class="highlight-keyword">div</span>&gt;Expensive UI...&lt;/<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"}"});
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
