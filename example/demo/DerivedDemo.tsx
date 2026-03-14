import { derive } from "../../src/index";
import { search, setSearchQuery } from "./DerivedDemo.state";

export default function DerivedDemo() {
  const users = [
    "Leanne Graham", "Ervin Howell", "Clementine Bauch", "Patricia Lebsack", 
    "Chelsey Dietrich", "Mrs. Dennis Schulist", "Kurtis Weissnat"
  ];

  const filtered = derive(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(u => u.toLowerCase().includes(q));
  });

  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>The Power of Lazy Evaluation</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            One of the most common pitfalls in frontend development is over-computing data. If you have a list of 1,000 items and you want to filter them based on a search query, you don't want to re-run that filter every single time the component re-renders for unrelated reasons. Our engine solves this with <strong>Derived State</strong> (also known as Computed Values).
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Derived state is "lazy" by default. This means the engine won't actually perform the calculation until something—like a component—explicitly asks for the value. Once computed, the result is cached. As long as the source signals (like the search query or the raw data) haven't changed, subsequent reads are instant.
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Automatic Memoization</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            You don't need to manually use <code>useMemo</code> or handle complex dependency arrays. The engine's dependency tracker (the same one used for Signals) keeps an eye on which signals are accessed during the calculation. If any of those signals change, the cache is invalidated, and the value will be re-computed on the next read.
          </p>

          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>Reactive Chains:</strong> You can even derive state from other derived state! The engine manages these chains automatically, ensuring that an update at the root propagates perfectly through the entire network of computations.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Declarative Computation</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            This approach promotes a declarative programming style. Instead of writing "how" to update your UI when data changes, you write "what" the data should be based on its sources. The engine takes care of the "how," keeping your code clean, readable, and highly performant.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Example</div>
        <div class="demo-interactive">
          <div style={{ marginBottom: '24px' }}>
            <input 
              type="text" 
              class="demo-input"
              style={{ width: '100%', fontSize: '15px', padding: '14px 20px' }}
              placeholder="Search users (e.g. 'Alice', 'Smith')..." 
              onInput={(e: any) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '32px' }}>
            <div class="demo-section-label" style={{ fontSize: '9px', marginBottom: '16px' }}>Computed Results ({filtered.value.length})</div>
            {filtered.value.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {filtered.value.map(item => (
                  <div class="list-item" style={{ fontSize: '13px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.8 }}></div>
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div class="tip-card" style={{ textAlign: 'center', padding: '48px' }}>
                No matches found for "{search}"
              </div>
            )}
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Logic (State File)</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>DerivedDemo.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">export let</span> search = <span class="highlight-string">""</span>;{"\n\n"}
              <span class="highlight-comment">// derive() auto-memoizes based on dependencies</span>{"\n"}
              <span class="highlight-keyword">export const</span> filtered = <span class="highlight-func">derive</span>(() =&gt; {"{"}{"\n"}
              {'  '}<span class="highlight-comment">// Only re-runs when 'search' or 'users' changes</span>{"\n"}
              {'  '}<span class="highlight-keyword">return</span> users.<span class="highlight-func">filter</span>(u =&gt; u.<span class="highlight-func">includes</span>(search));{"\n"}
              {"}"});
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">UI Rendering</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>DerivedDemo.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{"} filtered {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">"./DerivedDemo.state"</span>;{"\n\n"}
              <span class="highlight-comment">// Access .value for derived state (lazy evaluation)</span>{"\n"}
              {"{"}filtered.value.<span class="highlight-func">map</span>(user =&gt; ({"\n"}
              {'  '}&lt;<span class="highlight-keyword">div</span>&gt;{"{"}user{"}"}&lt;/<span class="highlight-keyword">div</span>&gt;{"\n"}
              )){"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
