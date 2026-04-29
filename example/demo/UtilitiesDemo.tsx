import { h } from "../../src/index";

export default function UtilitiesDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Utilities</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Built-in utility namespaces: <code>dom</code>, <code>store</code>/<code>session</code>, <code>format</code>, <code>device</code>, <code>str</code>, <code>arr</code>, <code>clipboard</code>.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            All utilities are tree-shakeable and work with the engine's reactive system.
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
                  <span class="monitor-tag-text">Utilities Monitor</span>
                </div>
                <h3 class="monitor-title">Utilities Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">UTILS STATUS</div>
                <div class="monitor-value accent">LOADED</div>
              </div>
              <div>
                <div class="monitor-label">MODULES</div>
                <div class="monitor-value">7 NAMESPACES</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>utils.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">dom</span>, <span class="highlight-func">store</span>, <span class="highlight-func">format</span>, <span class="highlight-func">device</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/utils'</span>
              {"\n\n"}
              <span class="highlight-comment">// DOM helpers</span>
              {"\n"}
              <span class="highlight-func">dom</span>.<span class="highlight-func">get</span>(<span class="highlight-string">'.my-class'</span>)
              {"\n"}
              <span class="highlight-func">dom</span>.<span class="highlight-func">addClass</span>(el, <span class="highlight-string">'active'</span>)
              {"\n\n"}
              <span class="highlight-comment">// Storage</span>
              {"\n"}
              <span class="highlight-func">store</span>.<span class="highlight-func">set</span>(<span class="highlight-string">'key'</span>, value)
              {"\n"}
              <span class="highlight-keyword">const</span> data = <span class="highlight-func">store</span>.<span class="highlight-func">get</span>(<span class="highlight-string">'key'</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
