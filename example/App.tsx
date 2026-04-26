import Button from "./Button";
import KitchenSink from "./KitchenSink";
import { runDemoTest } from "./demo.test";
import { runKitchenSinkTest } from "./kitchen-sink.test";
import { runStressTest } from "./stress.test";
import { runAdvancedTest } from "./advanced.test";
import { device } from "@engine";

export default function App() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <div style={{ marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center', background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={runDemoTest}
            style={{ padding: '10px 20px', background: '#7ec8e3', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ▶ Run Simple Test
          </button>
          <button 
            onClick={runAdvancedTest}
            style={{ padding: '10px 20px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔍 Run Advanced Features Test (Text/Role/Visible)
          </button>
          <button 
            onClick={runKitchenSinkTest}
            style={{ padding: '10px 20px', background: '#4eca8b', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ▶ Run Kitchen Sink Test
          </button>
          <button 
            onClick={runStressTest}
            style={{ padding: '10px 20px', background: '#ff6b6b', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🔥 Run Performance Stress Test
          </button>
        </div>
        <div style={{ flex: 1, fontSize: '14px', color: '#666' }}>
          <strong>System Info</strong><br/>
          Platform: {device.platform}<br/>
          Screen: {device.isMobile ? 'Mobile' : device.isTablet ? 'Tablet' : 'Desktop'}
        </div>
      </div>
      
      <div style={{ borderTop: '2px solid #eee', paddingTop: '40px' }}>
        <KitchenSink />
      </div>
    </div>
  );
}
