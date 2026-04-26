import Chart from './Chart'
import Spinner from './Spinner'
import ArrowRight from './ArrowRight'
import Icon from './Icon'
import { randomizeChart } from './chart.state'

const btnStyle = {
  background: '#111', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px',
  fontWeight: '600'
}

export default function SVGDemo() {
  return (
    <div style={{ padding: '40px 0' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Native SVG Support</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        The Reactivity Engine now flawlessly handles <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>&lt;svg&gt;</code> elements and namespace-specific attributes.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px' }}>
        <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee' }}>
          <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#999', margin: '0 0 16px', letterSpacing: '1px' }}>Reactive Data Viz</h3>
          <Chart />
          <div style={{ marginTop: '20px' }}>
            <button style={btnStyle} onClick={randomizeChart}>
              Randomize Data <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#999', margin: '0 0 16px', letterSpacing: '1px' }}>Animations</h3>
            <Spinner size={48} />
          </div>

          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #eee', flex: 1 }}>
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#999', margin: '0 0 16px', letterSpacing: '1px' }}>Icons</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: '#444' }}>
              <Icon><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon>
              <Icon><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></Icon>
              <Icon><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></Icon>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
