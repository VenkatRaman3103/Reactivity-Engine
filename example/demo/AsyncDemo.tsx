import { Suspense } from "../../src/index";
import { userId, setUserId, userData } from "./AsyncDemo.state";

function UserProfile() {
  // Use a local guard for maximum safety with the compiler
  const user = userData;
  if (!user) return <div style={{ color: 'var(--text-dim)', padding: '20px' }}>Initializing user profile...</div>;

  return (
    <div style={{ padding: '24px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)' }}>
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-main)', fontSize: '20px' }}>{user.name}</h3>
      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '14px' }}>@{user.username}</p>
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)', fontSize: '14px', display: 'flex', gap: '12px' }}>
        <span style={{ color: 'var(--text-dim)' }}>Email:</span>
        <span style={{ color: '#ccc' }}>{user.email}</span>
      </div>
    </div>
  );
}

export default function AsyncDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>The Async Revolution</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            Handling asynchronous data is one of the most repetitive tasks in frontend development. Developers often find themselves managing multiple boolean flags like <code>isLoading</code>, <code>isError</code>, and <code>data</code> for every single API call. Our engine eliminates this boilerplate by introducing a deep integration between signals and <strong>Suspense Boundaries</strong>.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            Instead of manually toggling loading states, you simply "wrap" your potentially async components in a <code>&lt;Suspense&gt;</code> component. The engine automatically detects when an underlying signal is waiting for data and switches to your provided fallback UI until the resolution is complete.
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Understanding trackAsync</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            The <code>trackAsync</code> utility is the bridge between standard Promises and our reactive system. When you call it within a state function, it tells the engine: "Wait for this specific operation before considering the UI ready." This allows you to coordinate complex data fetching across multiple components with zero effort.
          </p>

          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>Race Condition Protection:</strong> One of the silent killers in web apps is the race condition—where an old API response overwrites a newer one. Our engine's async tracking is designed to be cancellation-aware, ensuring that only the most recent request affects the final UI state.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Flicker-Free Transitions</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            By managing async flows at the engine level, we can intelligently batch updates and prevent the common "loading flicker" that occurs when multiple components update slightly out of sync. Your app feels solid, professional, and reliable.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Example</div>
          <div class="monitor-card">
             <div class="monitor-header">
               <div>
                 <div class="monitor-tag">
                   <div class="monitor-pulse"></div>
                   <span class="monitor-tag-text">Telemetry Monitor</span>
                 </div>
                 <h3 class="monitor-title">Async Data Stream</h3>
               </div>
             </div>
             
             <div class="monitor-grid">
               <div>
                  <div class="monitor-label">TRACKED ID</div>
                  <div class="monitor-value large">#{userId}</div>
               </div>
               <div>
                  <div class="monitor-label">NETWORK RESOLUTION</div>
                  <div class="monitor-value accent">{() => userData ? 'RESOLVED' : 'PENDING'}</div>
               </div>
             </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
            {[1, 2, 3, 4].map(id => (
              <button 
                class={() => userId === id ? 'demo-btn primary' : 'demo-btn'}
                style={{ flex: 1, minWidth: '120px' }}
                onClick={() => setUserId(id)}
              >
                Fetch User #{id}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '160px', position: 'relative' }}>
            <Suspense fallback={
              <div style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '4px', border: '1px dashed var(--border)' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '4px', color: 'var(--accent)', animation: 'pulse 1.5s infinite' }}>PENDING...</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '12px' }}>Fetching remote API data via trackAsync</div>
              </div>
            }>
              <UserProfile />
            </Suspense>
          </div>

        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">Logic (State File)</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>AsyncDemo.state.ts</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Signals can hold pending or resolved values</span>{"\n"}
              <span class="highlight-keyword">export let</span> userData = <span class="highlight-keyword">null</span>;{"\n\n"}
              <span class="highlight-comment">// trackAsync interacts with Suspense boundaries</span>{"\n"}
              <span class="highlight-keyword">export async function</span> <span class="highlight-func">fetchUser</span>(id) {"{"}{"\n"}
              {'  '}userData = <span class="highlight-keyword">await</span> <span class="highlight-func">trackAsync</span>(API_REQUEST);{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">UI Rendering</div>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>AsyncDemo.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Handle loading states declaratively</span>{"\n"}
              &lt;<span class="highlight-func">Suspense</span> <span class="highlight-func">fallback</span>={"{"}&lt;Loading /&gt;{"}"}&gt;{"\n"}
              {'  '}<span class="highlight-comment">// Waits for userData to resolve</span>{"\n"}
              {'  '}&lt;<span class="highlight-func">UserProfile</span> /&gt;{"\n"}
              &lt;/<span class="highlight-func">Suspense</span>&gt;
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
