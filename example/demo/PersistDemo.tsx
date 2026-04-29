import { h } from "../../src/index";

export default function PersistDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>State Persistence</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Zero-config localStorage persistence with <code>persist()</code>. Automatically saves and restores state across page reloads.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Supports custom storage keys, conditional persistence, and works with any signal type.
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
                  <span class="monitor-tag-text">Persistence Monitor</span>
                </div>
                <h3 class="monitor-title">State Persistence Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">STORAGE STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
              <div>
                <div class="monitor-label">PERSISTENCE</div>
                <div class="monitor-value accent">ENABLED</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">State Definition</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>counter.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Persistence with automatic localStorage sync</span>
              {"\n"}
              <span class="highlight-keyword">export let</span> count = <span class="highlight-func">persist</span>(0, <span class="highlight-string">'my-counter'</span>);
              {"\n\n"}
              <span class="highlight-comment">// State survives page reloads</span>
              {"\n"}
              <span class="highlight-keyword">export function</span> <span class="highlight-func">increment</span>() {"{"}
              {"\n"}
              {"  "}count++;{"\n"}
              {"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
