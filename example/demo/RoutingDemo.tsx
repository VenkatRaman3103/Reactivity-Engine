import { h } from "../../src/index";

export default function RoutingDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Routing System</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Client-side routing with dynamic parameters and query string support. Register routes and navigate programmatically.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Supports wildcard routes for 404 pages and popstate for browser back/forward navigation.
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
                  <span class="monitor-tag-text">Routing Monitor</span>
                </div>
                <h3 class="monitor-title">Routing Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">ROUTER STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
              <div>
                <div class="monitor-label">CURRENT PATH</div>
                <div class="monitor-value">{window.location.pathname}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>main.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">registerRoute</span>, <span class="highlight-func">navigate</span>, <span class="highlight-func">params</span>, <span class="highlight-func">query</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/navigate'</span>
              {"\n\n"}
              <span class="highlight-comment">// Register routes</span>
              {"\n"}
              <span class="highlight-func">registerRoute</span>(<span class="highlight-string">"/"</span>, HomePage)
              {"\n"}
              <span class="highlight-func">registerRoute</span>(<span class="highlight-string">"/user/:id"</span>, UserPage)
              {"\n"}
              <span class="highlight-func">registerRoute</span>(<span class="highlight-string">"*"</span>, NotFoundPage)
              {"\n\n"}
              <span class="highlight-comment">// Navigate programmatically</span>
              {"\n"}
              <span class="highlight-func">navigate</span>(<span class="highlight-string">'/user/123'</span>)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
