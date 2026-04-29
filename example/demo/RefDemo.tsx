import { h, ref } from "../../src/index";

export default function RefDemo() {
  const inputRef = ref<HTMLInputElement>()

  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Ref System</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Create DOM element references with <code>ref()</code>. Use with <code>bind:ref</code> or manually call <code>ref.set(element)</code>.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Returns an object with <code>current</code> property to access the element.
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
                  <span class="monitor-tag-text">Ref Monitor</span>
                </div>
                <h3 class="monitor-title">Ref System Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">REF STATUS</div>
                <div class="monitor-value accent">ATTACHED</div>
              </div>
              <div>
                <div class="monitor-label">CURRENT</div>
                <div class="monitor-value">{inputRef.current ? 'HTMLInputElement' : 'null'}</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <h4 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>Live Demo</h4>
              <input
                bind:ref={inputRef}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  marginRight: '8px'
                }}
                placeholder="Click button to focus"
              />
              <button
                onClick={() => inputRef.current?.focus()}
                style={{
                  padding: '8px 16px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Focus Input
              </button>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>InputFocus.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">ref</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">export default function</span> <span class="highlight-func">InputFocus</span>() {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">const</span> inputRef = <span class="highlight-func">ref</span>()
              {"\n\n"}
              {"  "}<span class="highlight-keyword">return</span> (
              {"\n"}
              {"    "}&lt;<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">input</span> <span class="highlight-func">bind:ref</span>={inputRef} /&gt;
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">button</span> <span class="highlight-func">onClick</span>={() => inputRef.current?.focus()}&gt;
              {"\n"}
              {"        "}Focus Input
              {"\n"}
              {"      "}&lt;/<span class="highlight-keyword">button</span>&gt;
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
