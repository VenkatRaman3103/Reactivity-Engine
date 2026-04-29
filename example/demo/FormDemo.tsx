import { h } from "../../src/index";
import { field, required, minLength, setError, touchAll, allValid } from "../../src/index";
import { email, password, isValid, submitStatus, submit } from '../login.form'

export default function FormDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Form Handling</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Use <code>field()</code> to create reactive form fields with built-in validation rules. No manual state management needed.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Includes 12+ validation rules: <code>required</code>, <code>email</code>, <code>minLength</code>, <code>pattern</code>, <code>custom</code>, and more.
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
                  <span class="monitor-tag-text">Form Monitor</span>
                </div>
                <h3 class="monitor-title">Reactive Form Fields</h3>
              </div>
            </div>
            <div class="monitor-grid">
              <div>
                <div class="monitor-label">EMAIL STATUS</div>
                <div class="monitor-value">{() => email.error ? 'INVALID' : 'VALID'}</div>
              </div>
              <div>
                <div class="monitor-label">PASSWORD STATUS</div>
                <div class="monitor-value">{() => password.error ? 'INVALID' : 'VALID'}</div>
              </div>
            </div>
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-main)' }}>Email</label>
                <input
                  bind:value={email.value}
                  class="demo-input"
                  placeholder="Enter email..."
                />
                {() => email.error && (
                  <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                    {email.error}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'var(--text-main)' }}>Password</label>
                <input
                  type="password"
                  bind:value={password.value}
                  onBlur={() => password.touch()}
                  class="demo-input"
                  placeholder="Min 8 characters..."
                />
                {() => password.error && (
                  <div style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px' }}>
                    {password.error}
                  </div>
                )}
              </div>
              <button
                onClick={submit}
                disabled={() => !isValid}
                class="demo-btn primary"
              >
                Submit
              </button>
              {() => submitStatus && (
                <div style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  color: submitStatus.includes('Error') ? 'var(--error)' : 'var(--success)',
                  fontWeight: 500
                }}>
                  {submitStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Code Example</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>login.form.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} <span class="highlight-func">field</span>, <span class="highlight-func">required</span>, <span class="highlight-func">minLength</span> {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>
              {"\n\n"}
              <span class="highlight-keyword">export let</span> email = <span class="highlight-func">field</span>(<span class="highlight-string">''</span>, <span class="highlight-func">required</span>(), <span class="highlight-func">minLength</span>(5))
              {"\n"}
              <span class="highlight-keyword">export let</span> password = <span class="highlight-func">field</span>(<span class="highlight-string">''</span>, <span class="highlight-func">required</span>(), <span class="highlight-func">minLength</span>(8))
              {"\n\n"}
              <span class="highlight-comment">// Access field properties:</span>
              {"\n"}
              <span class="highlight-comment">// email.value, email.error, email.ok, email.touched</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
