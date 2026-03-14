import { sharedCount, incrementShared, decrementShared } from "./SharedDemo.state";

function ComponentA() {
  return (
    <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', flex: 1 }}>
      <div class="demo-section-label" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Component A</div>
      <h3 style={{ margin: '10px 0', fontSize: '24px', color: 'var(--text-main)' }}>Value: {sharedCount}</h3>
      <button class="demo-btn primary" onClick={() => incrementShared()}>Add from A</button>
    </div>
  );
}

function ComponentB() {
  return (
    <div style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border)', flex: 1 }}>
      <div class="demo-section-label" style={{ fontSize: '9px', color: 'var(--text-dim)' }}>Component B</div>
      <h3 style={{ margin: '10px 0', fontSize: '24px', color: 'var(--text-main)' }}>Value: {sharedCount}</h3>
      <button class="demo-btn" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }} onClick={() => decrementShared()}>Remove from B</button>
    </div>
  );
}

export default function SharedDemo() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '20px' }}>Shared State Architecture</h3>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            In modern web development, sharing state between distant components is often a major pain point. Developers are forced to choose between "Prop Drilling" (passing data through dozens of layers) or complex state management libraries like Redux or Pinia. Our engine provides a third way: <strong>File-Based Shared State</strong>.
          </p>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '24px' }}>
            When multiple components import from the same <code>.state.ts</code> file, they aren't just getting a copy of the data—they are subscribing to the same reactive source. This means that if "Component A" updates a value, "Component B" is notified instantly, even if they share no common parent other than the root of the app.
          </p>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>The End of Prop Drilling</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7', marginBottom: '16px' }}>
            By decoupling state from the component tree, we free your architecture from rigid hierarchies. You can move components around, wrap them in new containers, or refactor your UI layout without ever breaking the reactive data flow. The components stay "dumb" about where the state comes from, and the state stays "pure" about how it's used.
          </p>

          <div class="tip-card" style={{ marginBottom: '24px' }}>
            <strong>Scalability Note:</strong> Because updates are granular, having 100 components listen to the same state file is just as efficient as having one. The engine only pings the specific subscribers that are actually rendered on the current screen.
          </div>

          <h4 style={{ color: 'var(--text-main)', marginBottom: '12px', fontSize: '16px' }}>Global State, Local Scope</h4>
          <p style={{ color: 'var(--text-dim)', lineHeight: '1.7' }}>
            Even though the state is technically "global" (accessible from any file), it remains encapsulated within its module. This gives you the best of both worlds: the ease of global access with the safety and maintainability of modular code.
          </p>
        </div>
      </div>

      <div class="demo-demo-pane">
          <div class="monitor-card">
             <div class="monitor-header">
               <div>
                 <div class="monitor-tag">
                   <div class="monitor-pulse"></div>
                   <span class="monitor-tag-text">Action Monitor</span>
                 </div>
                 <h3 class="monitor-title">Cross-Component Sync</h3>
               </div>
             </div>
             
             <div class="monitor-grid">
               <div>
                  <div class="monitor-label">SHARED VALUE</div>
                  <div class="monitor-value large">{sharedCount}</div>
               </div>
               <div>
                  <div class="monitor-label">SYNC TOPOLOGY</div>
                  <div class="monitor-value accent">GLOBAL BROADCAST</div>
               </div>
             </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center', justifyContent: 'center' }}>
            <ComponentA />
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--accent)', 
              fontSize: '20px', 
              background: 'var(--bg-card)', 
              width: '48px',
              height: '48px',
              border: '1px solid var(--accent-soft)',
              borderRadius: '50%',
              flexShrink: 0,
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)'
            }}>⇌</div>
            <ComponentB />
          </div>
          
          <div class="tip-card">
             <strong style={{ color: 'var(--text-main)' }}>Reactive Sync:</strong> Notice how both components update simultaneously. There are no props being passed between them – they both listen directly to the state file.
          </div>
        <div class="demo-section" style={{ marginTop: '40px' }}>
          <div class="demo-section-label">State Definition</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>SharedDemo.state.ts</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Central source of truth: shared across components</span>{"\n"}
              <span class="highlight-keyword">export let</span> sharedCount = 10;{"\n\n"}
              <span class="highlight-comment">// Any file calling this action triggers all subscribers</span>{"\n"}
              <span class="highlight-keyword">export function</span> <span class="highlight-func">increment</span>() {"{"}{"\n"}
              {'  '}sharedCount++;{"\n"}
              {"}"}
            </div>
          </div>
        </div>

        <div class="demo-section" style={{ marginTop: '24px' }}>
          <div class="demo-section-label">Component Implementation</div>
          <div class="demo-code-block">
            <div class="demo-code-header"><span>SharedDemo.tsx</span></div>
            <div class="demo-code-content">
              <span class="highlight-comment">// Import directly: no prop drilling needed</span>{"\n"}
              <span class="highlight-keyword">import</span> {"{"} sharedCount {"}"} <span class="highlight-keyword">from</span> <span class="highlight-string">"./SharedDemo.state"</span>;{"\n\n"}
              <span class="highlight-comment">// The engine automatically syncs all files reading this signal</span>{"\n"}
              <span class="highlight-keyword">function</span> <span class="highlight-func">ComponentA</span>() {"{"}{"\n"}
              {'  '}<span class="highlight-keyword">return</span> &lt;<span class="highlight-keyword">div</span>&gt;Value: {"{"}sharedCount{"}"}&lt;/<span class="highlight-keyword">div</span>&gt;;{"\n"}
              {"}"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
