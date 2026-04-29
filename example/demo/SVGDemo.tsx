import { h } from "../../src/index";
import SVGDemo from "../SVGDemo";

export default function SVGDDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>SVG Support</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Full SVG support with namespace handling. SVG elements get proper XML namespace automatically.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Supports SVG-specific attributes, event handlers, and reactive updates to SVG properties.
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
                  <span class="monitor-tag-text">SVG Monitor</span>
                </div>
                <h3 class="monitor-title">SVG Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">SVG STATUS</div>
                <div class="monitor-value accent">RENDERING</div>
              </div>
              <div>
                <div class="monitor-label">NAMESPACE</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <SVGDemo />
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>Icon.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} h {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/dom'</span>
              {"\n\n"}
              <span class="highlight-keyword">export default function</span> <span class="highlight-func">Icon</span>() {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">return</span> (
              {"\n"}
              {"    "}&lt;<span class="highlight-keyword">svg</span> <span class="highlight-func">viewBox</span>=<span class="highlight-string">"0 0 24 24"</span> <span class="highlight-func">fill</span>=<span class="highlight-string">"none"</span> <span class="highlight-func">stroke</span>=<span class="highlight-string">"currentColor"</span>&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">circle</span> <span class="highlight-func">cx</span>=<span class="highlight-string">"12"</span> <span class="highlight-func">cy</span>=<span class="highlight-string">"12"</span> <span class="highlight-func">r</span>=<span class="highlight-string">"10"</span> /&gt;
              {"\n"}
              {"    "}&lt;/<span class="highlight-keyword">svg</span>&gt;
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
