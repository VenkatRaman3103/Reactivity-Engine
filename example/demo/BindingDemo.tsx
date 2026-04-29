import { h } from "../../src/index";
import { name } from "./BindingDemo.state";

export default function BindingDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Two-Way Binding</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Use <code>bind:value</code> directive for automatic two-way data binding on inputs, checkboxes, and selects.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            No manual event handlers needed — the compiler transforms <code>bind:value</code> into reactive getters/setters.
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
                  <span class="monitor-tag-text">Binding Monitor</span>
                </div>
                <h3 class="monitor-title">Two-Way Binding</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">CURRENT VALUE</div>
                <div class="monitor-value">{name}</div>
              </div>
              <div>
                <div class="monitor-label">BINDING STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <input
                bind:value={name}
                class="demo-input"
                placeholder="Type your name..."
              />
              <p style={{ marginTop: '12px', color: 'var(--text-dim)' }}>Hello, {name}!</p>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>Greeting.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} h {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/dom'</span>
              {"\n"}
              <span class="highlight-keyword">import</span> {"{"} name {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'./state'</span>
              {"\n\n"}
              <span class="highlight-keyword">export default function</span> <span class="highlight-func">Greeting</span>() {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">return</span> (
              {"\n"}
              {"    "}&lt;<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">input</span> <span class="highlight-func">bind:value</span>={"{"}name {"}"} /&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">p</span>&gt;Hello, {"{"}name{"}"}!&lt;/<span class="highlight-keyword">p</span>&gt;
              {"\n"}
              {"    "}&lt;/<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"  "});
              {"\n"}
              {"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
