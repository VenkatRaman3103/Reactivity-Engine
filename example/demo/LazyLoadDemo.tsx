import { h } from "../../src/index";
import LazyDemo from "../LazyDemo";

export default function LazyLoadDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Lazy Loading</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Load components only when needed using <code>lazy()</code>. Perfect for code-splitting and reducing initial bundle size.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Supports loading fallbacks, error fallbacks, and manual preloading with <code>preload()</code>.
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
                  <span class="monitor-tag-text">Lazy Monitor</span>
                </div>
                <h3 class="monitor-title">Lazy Loading Demo</h3>
              </div>
            </div>
            <LazyDemo />
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>HeavyComponent.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">lazy</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">const</span> HeavyComponent = <span class="highlight-func">lazy</span>(
              {"\n"}
              {"  "}<span class="highlight-func">()</span> => <span class="highlight-func">import</span>(<span class="highlight-string">'./HeavyComponent'</span>),
              {"\n"}
              {"  "}{"{ loading: () => Loading..., error: () => Failed to load }"}
              {"\n"}
              )
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
