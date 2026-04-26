import { count, step, theme, transientData, increment, decrement, reset, toggleTheme, setStep, setTransientData } from './persist.state'

export default function PersistDemo() {
  const isDark = theme === 'dark'
  
  return (
    <div style={{
      padding: '24px',
      borderRadius: '12px',
      background: isDark ? '#1a1a1a' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
      border: `1px solid ${isDark ? '#333' : '#eee'}`,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>State Persistence Demo</h3>
        <button 
          onClick={toggleTheme}
          style={{
            background: isDark ? '#333' : '#f0f0f0',
            color: isDark ? '#fff' : '#000',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>

      <p style={{ margin: '0 0 16px 0', fontSize: '14px', opacity: 0.8 }}>
        Open DevTools (Ctrl+Shift+E) and check the <strong>Storage</strong> tab. Change values below, then refresh the page.
      </p>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '8px' }}>Counter</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={decrement}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#ff5f56', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >-</button>
              <span style={{ fontSize: '32px', fontWeight: 'bold' }}>{count}</span>
              <button 
                onClick={increment}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#4eca8b', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
              >+</button>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '8px' }}>Step Size</div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              bind:value={step} 
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 'bold' }}>Current Step: {step}</div>
          </div>
          
          <button 
            onClick={reset}
            style={{
              background: 'transparent',
              color: isDark ? '#7ec8e3' : '#0066cc',
              border: `1px solid ${isDark ? '#7ec8e3' : '#0066cc'}`,
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Reset
          </button>
        </div>

        <div style={{ flex: 1, minWidth: '200px', padding: '16px', background: isDark ? '#000' : '#f9f9f9', borderRadius: '8px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '12px' }}>Omitted State (Resets on Refresh)</div>
          <input 
            type="text" 
            bind:value={transientData}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: `1px solid ${isDark ? '#444' : '#ccc'}`,
              background: isDark ? '#222' : '#fff',
              color: isDark ? '#fff' : '#000',
              marginBottom: '8px'
            }}
            placeholder="Type something..."
          />
          <div style={{ fontSize: '11px', opacity: 0.7 }}>
            Current Value: <strong>{transientData}</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
