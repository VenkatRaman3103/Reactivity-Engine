import { h, portal } from "../../src/index";

export default function PortalDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Portals</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Render components into external DOM containers with <code>portal()</code>. Perfect for modals, tooltips, and overlays.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Automatic cleanup on component unmount. Returns a comment placeholder in the original location.
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
                  <span class="monitor-tag-text">Portal Monitor</span>
                </div>
                <h3 class="monitor-title">Portals Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">PORTAL STATUS</div>
                <div class="monitor-value accent">READY</div>
              </div>
              <div>
                <div class="monitor-label">TARGET</div>
                <div class="monitor-value">document.body</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>Modal.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">portal</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">export default function</span> <span class="highlight-func">Modal</span>() {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">return</span> (
              {"\n"}
              {"    "}&lt;<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">p</span>&gt;Normal content&lt;/<span class="highlight-keyword">p</span>&gt;
              {"\n"}
              {"      "}{"{portal("}
              {"\n"}
              {"        "}&lt;<span class="highlight-keyword">div</span> <span class="highlight-func">class</span>=<span class="highlight-string">"modal"</span>&gt;
              {"\n"}
              {"          "}&lt;<span class="highlight-keyword">h2</span>&gt;Modal Title&lt;/<span class="highlight-keyword">h2</span>&gt;
              {"\n"}
              {"        "}&lt;/<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"      })"}}
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
