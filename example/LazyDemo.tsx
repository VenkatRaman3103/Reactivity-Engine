import { lazy, createSignal, Suspense } from '@engine'
import { h } from '@engine/dom'

const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

const placeholderStyle = "min-height: 40px; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 1px dashed #ccc; color: #666; font-size: 14px; display: flex; align-items: center; justify-content: center;"
const contentStyle = { minHeight: '40px', padding: '12px', background: '#e3f2fd', borderRadius: '8px', color: '#1976d2', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }
const btnStyle = { padding: '8px 16px', background: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px', fontSize: '13px', fontWeight: 600 }

const BasicDummy = () => <div id="basic-content" style={contentStyle}>Basic Loaded</div>
const BasicLazy = lazy(async () => {
  await delay(800)
  return { default: BasicDummy }
}, {
  loading: () => <div id="basic-loading" style={placeholderStyle}>Loading...</div>
})

const ErrorLazy = lazy(async () => {
  await delay(400)
  throw new Error('Network failure')
}, {
  loading: () => <div id="error-loading" style={placeholderStyle}>Loading...</div>,
  error: (e) => <div id="error-content" style={{...contentStyle, background: '#ffebee', color: '#c62828'}}>Failed: {e.message}</div>
})

const PreloadDummy = () => <div id="preload-content" style={contentStyle}>Preload Loaded</div>
const PreloadLazy = lazy(async () => {
  await delay(500)
  return { default: PreloadDummy }
}, {
  loading: () => <div id="preload-loading" style={placeholderStyle}>Loading...</div>
})

const SuspenseDummy = () => <div id="suspense-content" style={contentStyle}>Suspense Loaded</div>
const SuspenseLazy = lazy(async () => {
  await delay(600)
  return { default: SuspenseDummy }
})

export default function LazyDemo() {
  const [showBasic, setShowBasic] = createSignal(false)
  const [showError, setShowError] = createSignal(false)
  const [showPreload, setShowPreload] = createSignal(false)
  const [showSuspense, setShowSuspense] = createSignal(false)
  
  return (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Basic Lazy Load</h3>
        <div style={{ marginBottom: '16px' }}>
          <button id="btn-basic" style={btnStyle} onClick={() => setShowBasic(true)}>Show Basic</button>
        </div>
        {() => showBasic() ? <BasicLazy /> : null}
      </div>

      <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Error Handling</h3>
        <div style={{ marginBottom: '16px' }}>
          <button id="btn-error" style={btnStyle} onClick={() => setShowError(true)}>Show Error</button>
        </div>
        {() => showError() ? <ErrorLazy /> : null}
      </div>

      <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>Preloading</h3>
        <div style={{ marginBottom: '16px' }}>
          <button id="btn-preload-action" style={{...btnStyle, background: '#f0f0f0', color: '#111'}} onClick={() => PreloadLazy.preload()}>Preload Now</button>
          <button id="btn-preload-show" style={btnStyle} onClick={() => setShowPreload(true)}>Show Preloaded</button>
        </div>
        {() => showPreload() ? <PreloadLazy /> : null}
      </div>

      <div style={{ padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>With Suspense</h3>
        <div style={{ marginBottom: '16px' }}>
          <button id="btn-suspense" style={btnStyle} onClick={() => setShowSuspense(true)}>Show Suspense</button>
        </div>
        {() => showSuspense()
          ? <Suspense fallback={<div id="suspense-fallback" style={placeholderStyle}>Suspense Fallback</div>}>
              <SuspenseLazy />
            </Suspense>
          : null}
      </div>
    </div>
  )
}
