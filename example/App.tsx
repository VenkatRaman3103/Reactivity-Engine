import Button from "./Button";
import KitchenSink from "./KitchenSink";
import SVGDemo from "./SVGDemo";
import BindingDemo from "./BindingDemo";
import PersistDemo from "./PersistDemo";
import LazyDemo from "./LazyDemo";
import { runDemoTest } from "./demo.test";
import { runKitchenSinkSuite } from "./kitchen-sink.test";
import { runStressTest } from "./stress.test";
import { runAdvancedTest } from "./advanced.test";
import { device } from "@engine";

export default function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '40px', background: '#f5f5f5', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: '0 0 8px 0', color: '#333' }}>Testing Dashboard</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
            Tests are now integrated into the ⚡ <strong>Engine DevTools</strong>.
          </p>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <span style={{ padding: '4px 8px', background: '#e0e0e0', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Ctrl</span>
            <span style={{ padding: '4px 8px', background: '#e0e0e0', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Shift</span>
            <span style={{ padding: '4px 8px', background: '#e0e0e0', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>E</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '14px', color: '#888', borderLeft: '1px solid #ddd', paddingLeft: '24px' }}>
          <strong>Environment:</strong> Development<br/>
          <strong>Platform:</strong> {device.platform}<br/>
          <strong>Viewport:</strong> {device.isMobile ? 'Mobile' : 'Desktop'}
        </div>
      </div>
      
      <div style={{ borderTop: '2px solid #eee', paddingTop: '40px' }}>
        <KitchenSink />
      </div>

      {/* Two-Way Binding Demo */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '40px', marginTop: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#111' }}>Two-Way Binding</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Compiler-powered <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>bind:*</code> directives — no manual event handlers.
          </p>
        </div>
        <BindingDemo />
      </div>

      {/* State Persistence Demo */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '40px', marginTop: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#111' }}>State Persistence</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Zero-config persistence to <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>localStorage</code> — survives refreshing.
          </p>
        </div>
        <PersistDemo />
      </div>

      {/* Lazy Loading Demo */}
      <div style={{ borderTop: '2px solid #eee', paddingTop: '40px', marginTop: '40px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '20px', color: '#111' }}>Lazy Loading</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Load components only when needed with <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>lazy()</code>.
          </p>
        </div>
        <LazyDemo />
      </div>

      <div style={{ borderTop: '2px solid #eee', marginTop: '40px' }}>
        <SVGDemo />
      </div>
    </div>
  );
}
