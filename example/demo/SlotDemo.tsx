import { h, slot } from "../../src/index";

function Card(props: any) {
  return (
    <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}>
      {slot(props, 'header', <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Default Header</h4>)}
      <div style={{ marginBottom: '8px' }}>
        {slot(props.children)}
      </div>
      {slot(props, 'footer')}
    </div>
  );
}

export default function SlotDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Slots</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Content distribution system with default and named slots. Similar to Vue/React patterns.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Supports fallback content and both Vue-style (<code>slot="name"</code>) and React-style (<code>slot:name</code>) syntax.
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
                  <span class="monitor-tag-text">Slot Monitor</span>
                </div>
                <h3 class="monitor-title">Slots Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">SLOT STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
              <div>
                <div class="monitor-label">NAMED SLOTS</div>
                <div class="monitor-value">header, footer</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <Card>
                <p slot="header">Custom Header</p>
                <p>Body content goes here...</p>
                <button slot="footer" style={{ padding: '8px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Action</button>
              </Card>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>Card.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">slot</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">export default function</span> <span class="highlight-func">Card</span>(props) {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">return</span> (
              {"\n"}
              {"    "}&lt;<span class="highlight-keyword">div</span> <span class="highlight-func">class</span>=<span class="highlight-string">"card"</span>&gt;
              {"\n"}
              {"      "}{"{slot(props, 'header', <h2>Default Header</h2>)}"}
              {"\n"}
              {"      "}&lt;<span class="highlight-keyword">div</span> <span class="highlight-func">class</span>=<span class="highlight-string">"body"</span>&gt;
              {"\n"}
              {"        "}{"{slot(props.children)}"}
              {"\n"}
              {"      "}&lt;/<span class="highlight-keyword">div</span>&gt;
              {"\n"}
              {"      "}{"{slot(props, 'footer')}"}
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
