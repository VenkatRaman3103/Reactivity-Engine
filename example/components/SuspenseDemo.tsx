import { Suspense, slot } from "@engine/index";
import { loadData, data } from "../state/suspense.state";

// A component that uses slots for layout
function Card({ children }: any) {
  return (
    <div style={{ 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      overflow: 'hidden',
      marginBottom: '20px',
      background: 'white'
    }}>
      <div style={{ background: '#f0f0f0', padding: '12px 16px', fontWeight: 'bold' }}>
        {slot(children, "header", <span>Default Header</span>)}
      </div>
      <div style={{ padding: '16px' }}>
        {slot(children, "default", <p>No content provided</p>)}
      </div>
      <div style={{ background: '#fafafa', padding: '12px 16px', borderTop: '1px solid #eee', fontSize: '13px', color: '#666' }}>
        {slot(children, "footer", <span>Default Footer</span>)}
      </div>
    </div>
  );
}

// A component that simulates reading from an async state
function AsyncContent() {
  return (
    <div>
      <h3 style={{ marginTop: 0 }}>Loaded Data</h3>
      <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default function SuspenseDemo() {
  return (
    <div>
      <h2>Suspense & Slots Demo</h2>
      <p>This page demonstrates both the <code>&lt;Suspense&gt;</code> boundary and Named <code>Slots</code>.</p>
      
      <div style={{ marginBottom: '30px' }}>
        <button onClick={() => loadData()}>Trigger Async Load (3 Seconds)</button>
      </div>

      <Card>
        <div slot="header">
          Data Dashboard
        </div>
        
        {/* The default slot is anything without a slot attribute */}
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Loading async data...</div>}>
          <AsyncContent />
        </Suspense>

        <div slot="footer">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </Card>

      <h3>Empty Card Fallbacks (testing slots)</h3>
      <Card />
    </div>
  );
}
