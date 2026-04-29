import {
  count,
  step,
  transientData,
  increment,
  decrement,
  reset,
  setStep,
  setTransientData,
} from "./persist.state";

export default function PersistDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: "40px" }}>
          <h3
            style={{
              color: "var(--text-main)",
              marginBottom: "16px",
              fontSize: "20px",
            }}
          >
            Zero-Config Persistence
          </h3>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "16px",
            }}
          >
            The <strong>persist</strong> function provides automatic localStorage
            persistence with zero configuration. Simply wrap your signals with the
            persist function, and they'll automatically sync with localStorage.
          </p>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "24px",
            }}
          >
            This means your users' state survives page refreshes without any
            additional code. Perfect for user preferences, form drafts, and
            application state.
          </p>

          <h4
            style={{
              color: "var(--text-main)",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          >
            Selective Persistence
          </h4>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "16px",
            }}
          >
            Not all state should be persisted. Use the <code>omit</code> option
            to exclude transient state from localStorage, keeping only the
            essential data that should survive page reloads.
          </p>

          <div class="tip-card" style={{ marginBottom: "24px" }}>
            <strong>Versioning:</strong> Include a version number to handle
            schema changes. When the version updates, old persisted state is
            automatically invalidated and fresh state is used.
          </div>
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
                  <span class="monitor-tag-text">Persistence Monitor</span>
                </div>
                <h3 class="monitor-title">State Persistence Demo</h3>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button class="demo-btn" onClick={() => reset()}>
                  Reset
                </button>
              </div>
            </div>

            <div class="monitor-grid">
              <div>
                <div class="monitor-label">PERSISTED COUNT</div>
                <div class="monitor-value large">{count}</div>
              </div>
              <div>
                <div class="monitor-label">STEP SIZE</div>
                <div class="monitor-value accent">{step}</div>
              </div>
              <div>
                <div class="monitor-label">STATUS</div>
                <div class="monitor-value accent">ACTIVE</div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div class="monitor-label" style={{ marginBottom: "12px" }}>
                COUNTER CONTROLS
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <button
                  class="demo-btn"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    padding: 0,
                  }}
                  onClick={() => decrement()}
                >
                  -
                </button>
                <button
                  class="demo-btn primary"
                  style={{ flex: 1 }}
                  onClick={() => increment()}
                >
                  Increment by {step}
                </button>
                <button
                  class="demo-btn"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    padding: 0,
                  }}
                  onClick={() => increment()}
                >
                  +
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-dim)",
                    fontSize: "12px",
                    marginBottom: "6px",
                  }}
                >
                  Step Size (persisted to localStorage)
                </label>
                <input
                  type="range"
                  class="demo-input"
                  min="1"
                  max="10"
                  value={() => step}
                  onInput={(e) => setStep(e.target.value)}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: "var(--text-dim)",
                  }}
                >
                  Current: {step}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div class="monitor-label" style={{ marginBottom: "12px" }}>
                OMITTED STATE (NOT PERSISTED)
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    color: "var(--text-dim)",
                    fontSize: "12px",
                    marginBottom: "6px",
                  }}
                >
                  Transient Data (resets on refresh)
                </label>
                <input
                  type="text"
                  class="demo-input"
                  value={() => transientData}
                  onInput={(e) => setTransientData(e.target.value)}
                  placeholder="Type something..."
                />
              </div>

              <div
                style={{
                  padding: "12px",
                  background: "var(--accent-soft, rgba(79, 142, 247, 0.1))",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "var(--text-dim)",
                }}
              >
                Current Value:{" "}
                <strong style={{ color: "var(--text-main)" }}>
                  {transientData}
                </strong>
                <div style={{ marginTop: "8px", fontSize: "11px" }}>
                  This value is omitted from persistence and will reset on page
                  refresh.
                </div>
              </div>
            </div>
          </div>

          <div class="tip-card">
            <strong>Pro Tip:</strong> Open DevTools (Ctrl+Shift+E) and check the
            <strong>Storage</strong> tab. Change values above, then refresh the
            page to see persistence in action!
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: "40px" }}>
          <div class="demo-section-label">State Definition</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>persist.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">
                // Define signals with persistence
              </span>
              {"\n"}
              <span class="highlight-keyword">export let</span> count = 0;
              {"\n"}
              <span class="highlight-keyword">export let</span> step = 1;
              {"\n"}
              <span class="highlight-keyword">export let</span> transientData ={" "}
              <span class="highlight-string">'this will not stick'</span>;
              {"\n\n"}
              <span class="highlight-comment">// Wrap with persist function</span>
              {"\n"}
              persist(<span class="highlight-string">'persist-demo'</span>, {"{"}
              {"\n"}
              {"  "}count, step, transientData{"\n"}
              {"}"}, {"{"}
              {"\n"}
              {"  "}<span class="highlight-keyword">omit</span>: [<span class="highlight-string">
                'transientData'
              </span>],
              {"\n"}
              {"  "}<span class="highlight-keyword">version</span>: 1{"\n"}
              {"}"});
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
