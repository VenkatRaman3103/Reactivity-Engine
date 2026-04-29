import { h } from "../../src/index";
import { play } from "../../src/index";
import FeatureDemo from '../KitchenSink'

export default function TestingDemo() {
  const startTesting = () => {
    play('Comprehensive Tests', { devToolsReporter: true })
  }

  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Testing Framework</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Built-in test runner with auto-discovery from <code>.test.ts</code> files. Define suites and tests with simple API.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Includes user simulation steps (<code>click</code>, <code>type</code>), assertions (<code>expect</code>, <code>see</code>), and network mocking (<code>mock</code>).
          </p>
        </div>
      </div>
      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Demo - Test Runner</div>
        <div class="demo-interactive">
          <div class="monitor-card" style={{ background: 'var(--accent-soft)', border: '2px solid var(--accent)' }}>
            <div class="monitor-header">
              <div>
                <div class="monitor-tag">
                  <div class="monitor-pulse"></div>
                  <span class="monitor-tag-text">Test Monitor</span>
                </div>
                <h3 class="monitor-title">Built-in Testing</h3>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ color: 'var(--text-dim)', marginBottom: '16px' }}>
                Click below to run tests on the demo component. Tests use the built-in test runner.
              </p>
              <button
                id="start-testing"
                class="demo-btn primary"
                style={{ padding: '12px 24px', fontSize: '16px' }}
                onClick={startTesting}
              >
                ▶ Start Testing
              </button>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">TEST STATUS</div>
                <div class="monitor-value accent">READY</div>
              </div>
              <div>
                <div class="monitor-label">AUTO-DISCOVERY</div>
                <div class="monitor-value accent">ENABLED</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Demo Component</div>
          <div style={{ margin: 0, padding: 0 }}>
            <FeatureDemo />
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>counter.test.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">suite</span>, <span class="highlight-func">test</span>, <span class="highlight-func">click</span>, <span class="highlight-func">expect</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine'</span>
              {"\n\n"}
              <span class="highlight-func">suite</span>(<span class="highlight-string">'Counter Tests'</span>, () => {"{"}
              {"\n"}
              {"  "}<span class="highlight-func">test</span>(<span class="highlight-string">'increments on click'</span>, [
              {"\n"}
              {"    "}<span class="highlight-func">click</span>(<span class="highlight-string">'#counter-inc'</span>),
              {"\n"}
              {"    "}<span class="highlight-func">expect</span>(() => count).<span class="highlight-func">is</span>(1)
              {"\n"}
              {"  "}]);
              {"\n"}
              {"}"});
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
