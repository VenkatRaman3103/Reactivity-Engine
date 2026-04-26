import {
  count,
  increment,
  reset,
  inputValue,
  setInputValue,
  name,
  setName,
} from "./SignalsDemo.state";

export default function SignalsDemo() {
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
            The Core Philosophy
          </h3>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "16px",
            }}
          >
            At the heart of this engine lies the concept of{" "}
            <strong>Signals</strong>. Unlike traditional state management
            libraries that require complex "stores" or "actions", signals are
            simple, atomic values that are aware of their context. When you
            define a variable in a state file, it becomes a living entity that
            knows exactly which parts of your UI depend on it.
          </p>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "24px",
            }}
          >
            This approach eliminates the need for virtual DOM diffing. While
            other frameworks must compare entire trees of elements to find
            changes, our engine performs <strong>granular DOM updates</strong>.
            If a single number changes, only the exact text node containing that
            number is touched in the real DOM.
          </p>

          <h4
            style={{
              color: "var(--text-main)",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          >
            Automatic Dependency Tracking
          </h4>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "16px",
            }}
          >
            The most powerful feature of signals is their transparency. You
            don't need to manually subscribe to updates or list dependencies.
            When a component reads a signal during its execution, a "link" is
            automatically established.
          </p>

          <div class="tip-card" style={{ marginBottom: "24px" }}>
            <strong>Fine-Grained Reactivity:</strong> The engine tracks
            reactivity at the expression level. If you have a component with ten
            reactive values and only one changes, the remaining nine nodes are
            never even looked at.
          </div>

          <h4
            style={{
              color: "var(--text-main)",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          >
            Zero-Boilerplate State
          </h4>
          <p style={{ color: "var(--text-dim)", lineHeight: "1.7" }}>
            By leveraging a custom Vite plugin, we transform standard JavaScript{" "}
            <code>export let</code> declarations into signals. This means you
            write "normal" code, and the engine handles the complexity of
            reactive wrapping, proxying, and notification behind the scenes.
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
                  <span class="monitor-tag-text">Action Monitor</span>
                </div>
                <h3 class="monitor-title">Atomic Signal Track</h3>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  class="demo-btn primary"
                  style={{ padding: "8px 20px" }}
                  onClick={() => increment()}
                >
                  Increment
                </button>
                <button class="demo-btn" onClick={() => reset()}>
                  Reset
                </button>
              </div>
            </div>

            <div class="monitor-grid">
              <div>
                <div class="monitor-label">SIGNAL VALUE</div>
                <div class="monitor-value large">{count}</div>
              </div>
              <div>
                <div class="monitor-label">DEPENDENCY STATUS</div>
                <div class="monitor-value accent">TRACKING ACTIVE</div>
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
                INPUT BINDING TEST
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
                  Text Input (bound with onChange)
                </label>
                <input
                  type="text"
                  class="demo-input"
                  value={() => inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  // onInput={(e) => setInputValue(e.target.value)}
                  placeholder="Type something..."
                />
              </div>

              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-dim)",
                      fontSize: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    Live Preview
                  </label>
                  <div
                    class="monitor-value"
                    style={{ fontSize: "14px", wordBreak: "break-all" }}
                  >
                    {inputValue}
                  </div>
                </div>
                <button class="demo-btn" onClick={() => setInputValue("")}>
                  Clear
                </button>
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
                NAME INPUT TEST
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
                  Your Name
                </label>
                <input
                  type="text"
                  class="demo-input"
                  value={() => name}
                  onInput={(e) => setName(e.target.value)}
                  placeholder="Enter your name..."
                />
              </div>

              <div
                style={{ display: "flex", gap: "16px", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--text-dim)",
                      fontSize: "12px",
                      marginBottom: "6px",
                    }}
                  >
                    Greeting
                  </label>
                  <div
                    class="monitor-value accent"
                    style={{ fontSize: "16px" }}
                  >
                    {() =>
                      name ? `Hello, ${name}!` : "Enter a name to see greeting"
                    }
                  </div>
                </div>
                <button class="demo-btn" onClick={() => setName("")}>
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div class="tip-card">
            <strong>Pro Tip:</strong> Open your console to see the engine's
            reactive cycles in action. Every time the number above changes, only
            the specific DOM node is updated – no VDOM diffing required!
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: "40px" }}>
          <div class="demo-section-label">State Definition</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>SignalsDemo.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">
                // Atomic signal: track changes at the core
              </span>
              {"\n"}
              <span class="highlight-keyword">export let</span> count = 0;
              {"\n\n"}
              <span class="highlight-comment">
                // Actions modify signals directly
              </span>
              {"\n"}
              <span class="highlight-keyword">export function</span>{" "}
              <span class="highlight-func">increment</span>() {"{"}
              {"\n"}
              {"  "}count++;{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: "24px" }}>
          <div class="demo-section-label">Component Logic</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>SignalsDemo.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">
                // Import signals and actions
              </span>
              {"\n"}
              <span class="highlight-keyword">import</span> {"{"} count,
              increment {"}"} <span class="highlight-keyword">from</span>{" "}
              <span class="highlight-string">"./SignalsDemo.state"</span>;
              {"\n\n"}
              <span class="highlight-comment">
                // Use signals directly in JSX
              </span>
              {"\n"}
              <span class="highlight-keyword">
                export default function
              </span>{" "}
              <span class="highlight-func">Counter</span>() {"{"}
              {"\n"}
              {"  "}
              <span class="highlight-keyword">return</span> &lt;
              <span class="highlight-keyword">button</span>{" "}
              <span class="highlight-func">onClick</span>={"{"}increment{"}"}
              &gt;{"{"}count{"}"}&lt;/
              <span class="highlight-keyword">button</span>&gt;;{"\n"}
              {"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
