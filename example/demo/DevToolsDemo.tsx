import { h } from "../../src/index";

export default function DevToolsDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>DevTools (Ctrl+Shift+E)</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Built-in developer tools panel with 7 tabs for real-time inspection and debugging.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Features channel-based logging with <code>log</code> proxy, component-state relationship mapping, and click-to-inspect functionality.
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
                  <span class="monitor-tag-text">DevTools Monitor</span>
                </div>
                <h3 class="monitor-title">DevTools Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">DEVTOOLS STATUS</div>
                <div class="monitor-value accent">AVAILABLE</div>
              </div>
              <div>
                <div class="monitor-label">SHORTCUT</div>
                <div class="monitor-value">Ctrl+Shift+E</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Features</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>DevTools Tabs</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">State Tab</span> — View all .state.ts files & values{"\n"}
              <span class="highlight-keyword">Storage Tab</span> — Inspect persisted localStorage data{"\n"}
              <span class="highlight-keyword">Logs Tab</span> — View channel-based logs from log API{"\n"}
              <span class="highlight-keyword">Map Tab</span> — Visual graph of component-state relationships{"\n"}
              <span class="highlight-keyword">Tree Tab</span> — Hierarchical view of components & state{"\n"}
              <span class="highlight-keyword">Inspector Tab</span> — Click-to-inspect components on page{"\n"}
              <span class="highlight-keyword">Tests Tab</span> — Auto-record tests, coverage display{"\n\n"}
              Press <span class="highlight-func">Ctrl+Shift+E</span> to toggle DevTools
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
