import { h } from "../../src/index";

export default function StylingDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Styling System</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Write styles in <code>.style.ts</code> files — engine converts to CSS automatically. Supports reactive properties that become auto-updated CSS variables.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Includes pseudo-selectors (<code>hover</code>, <code>focus</code>), media queries, and theme support with <code>defineTheme()</code>.
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
                  <span class="monitor-tag-text">Style Monitor</span>
                </div>
                <h3 class="monitor-title">Styling System Demo</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">STYLE STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
              <div>
                <div class="monitor-label">CSS GENERATION</div>
                <div class="monitor-value accent">AUTO</div>
              </div>
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>button.style.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">style</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/style'</span>
              {"\n"}
              <span class="highlight-keyword">import</span> {"{"} isDisabled {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'./button.state'</span>
              {"\n\n"}
              <span class="highlight-keyword">export const</span> button = <span class="highlight-func">style</span>({"{"}
              {"\n"}
              {"  "}<span class="highlight-func">padding</span>: <span class="highlight-string">'8px 16px'</span>,
              {"\n"}
              {"  "}<span class="highlight-func">backgroundColor</span>: <span class="highlight-string">'#4f8ef7'</span>,
              {"\n"}
              {"  "}<span class="highlight-func">color</span>: <span class="highlight-string">'white'</span>,
              {"\n\n"}
              {"  "}<span class="highlight-comment">// Reactive — updates when state changes</span>
              {"\n"}
              {"  "}<span class="highlight-func">opacity</span>: isDisabled ? 0.5 : 1,
              {"\n"}
              {"  "}<span class="highlight-func">cursor</span>: isDisabled ? <span class="highlight-string">'not-allowed'</span> : <span class="highlight-string">'pointer'</span>
              {"\n"}
              {"}"});
             </div>
           </div>
         </div>
       </div>
     </div>
   );
}
