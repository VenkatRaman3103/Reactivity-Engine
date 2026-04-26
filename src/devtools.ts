import { instances }         from './component'
import { getSignalCache }    from './state'
import { getLogChannels }   from './log'
import { suites, Step }      from './test/index'
import { play }             from './test/runner'

// @ts-ignore
const isDev = import.meta.env.DEV

const stateRegistry = new Map<string, Record<string, any>>()
const history: any[] = []
const MAX_HISTORY = 50

// Cache to hold references to specific DOM elements for instant updates
const uiCache = {
  testNodes: new Map<string, HTMLElement>(),
  stepNodes: new Map<string, HTMLElement[]>(),
  stateRows: new Map<string, HTMLElement>(),
  logContainer: null as HTMLElement | null,
  testContainer: null as HTMLElement | null,
  stateContainer: null as HTMLElement | null
}

let wrapperEl: HTMLElement | null = null
let activeTab: string = 'state'

export function registerStateFile(file: string, mod: any) {
  if (!isDev) return
  stateRegistry.set(file, mod)
}

export function recordStateChange(file: string, key: string, oldVal: any, newVal: any) {
  if (!isDev) return
  history.push({ file, key, oldVal, newVal, timestamp: Date.now() })
  if (history.length > MAX_HISTORY) history.shift()
  syncStateUI()
}

// Global update hook
export function initDevTools() {
  if (!isDev) return
  ;(window as any).__engine = {
    updateTestStatus(suiteName: string, testName: string, status: { passed?: boolean, activeStep?: number, running?: boolean, error?: string }) {
      updateTestUI(suiteName, testName, status)
    },
    refreshLogPanel() { syncLogUI() }
  }
}

/**
 * Perform a partial update on the Test UI without re-rendering the tree
 */
function updateTestUI(suiteName: string, testName: string, status: any) {
  const key = `${suiteName}:${testName}`
  const node = uiCache.testNodes.get(key)
  if (!node) return

  const item = node.querySelector('.dt-test-item') as HTMLElement
  const statusIcon = node.querySelector('.dt-test-status') as HTMLElement
  const testNameEl = node.querySelector('.dt-test-name') as HTMLElement

  // Update Test Header
  if (status.running) {
    testNameEl.style.color = '#7ec8e3'
    testNameEl.style.fontWeight = '700'
    statusIcon.textContent = '●'
    statusIcon.className = 'dt-test-status running'
  } else {
    testNameEl.style.color = status.passed ? '#4eca8b' : status.passed === false ? '#ff5f56' : '#aaa'
    testNameEl.style.fontWeight = '600'
    statusIcon.textContent = status.passed ? '✓' : status.passed === false ? '✗' : '○'
    statusIcon.className = `dt-test-status ${status.passed ? 'passed' : status.passed === false ? 'failed' : ''}`
  }

  // Update Individual Steps
  const stepElems = uiCache.stepNodes.get(key)
  if (stepElems) {
    stepElems.forEach((el, i) => {
      el.className = 'dt-step-item'
      if (status.running && status.activeStep === i) el.classList.add('active')
      else if (status.passed === false && i === status.activeStep) el.classList.add('failed')
      else if (status.passed === true || (status.running && i < status.activeStep)) el.classList.add('passed')
    })
  }
}

/**
 * Partially updates the State tab
 */
function syncStateUI() {
  if (!uiCache.stateContainer) return
  // For simplicity, we rebuild state rows but only if they change
  // In a truly massive app we'd target individual spans
  let html = ''
  stateRegistry.forEach((mod, file) => {
    html += `<div class="dt-file-header">${file.split('/').pop()}</div>`
    Object.keys(mod).forEach(k => {
      if (typeof mod[k] === 'function') return
      html += `<div class="dt-row"><span class="dt-key">${k}</span><span class="dt-val">${JSON.stringify(mod[k])}</span></div>`
    })
  })
  uiCache.stateContainer.innerHTML = html || '<div class="dt-empty">No state files</div>'
}

function syncLogUI() {
  if (!uiCache.logContainer) return
  let html = ''
  getLogChannels().forEach((entries, name) => {
    html += `<div class="dt-file-header">${name}</div>`
    entries.slice(-10).reverse().forEach(e => {
        html += `<div class="dt-row"><span class="dt-val">${JSON.stringify(e.value)}</span></div>`
    })
  })
  uiCache.logContainer.innerHTML = html || '<div class="dt-empty">No logs</div>'
}

const panelStyles = `
  #engine-devtools-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 100005; font-family: system-ui, sans-serif; pointer-events: none; }
  #engine-devtools { pointer-events: auto; background: #0f0f0f; border-radius: 16px; width: 450px; height: 500px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #000; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-header span { font-size: 12px; font-weight: 800; color: #7ec8e3; letter-spacing: 1px; }
  .dt-close { background: none; border: none; color: #444; cursor: pointer; font-size: 14px; }
  .dt-tabs { display: flex; background: #000; padding: 0 10px; }
  .dt-tab { background: none; border: none; padding: 12px 14px; color: #555; font-size: 10px; font-weight: 800; cursor: pointer; border-bottom: 2px solid transparent; text-transform: uppercase; transition: all 0.2s; }
  .dt-tab.active { color: #7ec8e3; border-bottom-color: #7ec8e3; }
  .dt-body { flex: 1; overflow-y: auto; padding: 12px; }
  .dt-panel { display: none; }
  .dt-panel.active { display: block; }

  .dt-suite { background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); margin-bottom: 12px; overflow: hidden; }
  .dt-suite-head { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .dt-suite-name { font-size: 12px; font-weight: 700; color: #fff; }
  .dt-run-btn { background: #4eca8b; border: none; color: #000; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  
  .dt-test-node { margin-bottom: 4px; }
  .dt-test-item { display: flex; align-items: center; gap: 10px; padding: 6px 16px; font-size: 12px; color: #888; }
  .dt-test-name { transition: all 0.2s; }
  .dt-test-status { width: 14px; font-size: 14px; text-align: center; }
  .dt-test-status.running { color: #7ec8e3; animation: dt-pulse 0.8s infinite alternate; }
  .dt-test-status.passed { color: #4eca8b; }
  .dt-test-status.failed { color: #ff5f56; }
  
  .dt-step-list { padding: 4px 0 10px 38px; display: flex; flex-direction: column; gap: 6px; border-left: 1px solid rgba(255,255,255,0.03); margin-left: 22px; }
  .dt-step-item { font-size: 11px; color: #444; display: flex; gap: 10px; align-items: center; transition: all 0.2s; }
  .dt-step-item.active { color: #7ec8e3 !important; font-weight: 800; transform: translateX(2px); }
  .dt-step-item.passed { color: #4eca8b; opacity: 0.8; }
  .dt-step-item.failed { color: #ff5f56; font-weight: 800; }
  .dt-step-dot { width: 5px; height: 5px; border-radius: 50%; background: #222; }
  .dt-step-item.active .dt-step-dot { background: #7ec8e3; box-shadow: 0 0 8px #7ec8e3; }
  .dt-step-item.passed .dt-step-dot { background: #4eca8b; }
  .dt-step-item.failed .dt-step-dot { background: #ff5f56; }

  @keyframes dt-pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
  .dt-row { display: flex; padding: 6px 0; font-size: 11px; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .dt-key { color: #7ec8e3; width: 110px; font-weight: 700; }
  .dt-val { color: #fff; font-family: monospace; opacity: 0.7; overflow: hidden; text-overflow: ellipsis; }
  .dt-file-header { font-size: 9px; color: #444; font-weight: 900; margin: 12px 0 4px 0; text-transform: uppercase; }
  .dt-empty { padding: 40px; text-align: center; color: #444; font-size: 12px; }
`;

export function toggleDevPanel() {
  if (wrapperEl) { wrapperEl.remove(); wrapperEl = null; return }
  
  // Build Structure
  const style = document.createElement('style')
  style.textContent = panelStyles
  document.head.appendChild(style)

  wrapperEl = document.createElement('div')
  wrapperEl.id = 'engine-devtools-wrapper'
  
  const panel = document.createElement('div')
  panel.id = 'engine-devtools'
  panel.innerHTML = `
    <div class="dt-header"><span>⚡ ENGINE DEVTOOLS</span><button class="dt-close">✕</button></div>
    <div class="dt-tabs">
      <button class="dt-tab active" data-tab="state">State</button>
      <button class="dt-tab" data-tab="logs">Logs</button>
      <button class="dt-tab" data-tab="tests">Tests</button>
    </div>
    <div class="dt-body">
      <div class="dt-panel active" id="dt-state"></div>
      <div class="dt-panel" id="dt-logs"></div>
      <div class="dt-panel" id="dt-tests"></div>
    </div>
  `
  
  uiCache.stateContainer = panel.querySelector('#dt-state')
  uiCache.logContainer = panel.querySelector('#dt-logs')
  uiCache.testContainer = panel.querySelector('#dt-tests')

  renderTestStructure()
  syncStateUI()
  syncLogUI()

  wrapperEl.appendChild(panel)
  document.body.appendChild(wrapperEl)

  // Event handlers
  panel.querySelector('.dt-close')?.addEventListener('click', toggleDevPanel)
  panel.querySelectorAll('.dt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!
      panel.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'))
      panel.querySelectorAll('.dt-panel').forEach(p => p.classList.remove('active'))
      tab.classList.add('active')
      panel.querySelector(`#dt-${activeTab}`)?.classList.add('active')
    })
  })

  uiCache.testContainer?.querySelectorAll('.dt-run-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const suiteName = (btn as HTMLElement).dataset.suite!
      play(suiteName, undefined, { devToolsReporter: true })
    })
  })
}

function renderTestStructure() {
  if (!uiCache.testContainer) return
  uiCache.testNodes.clear()
  uiCache.stepNodes.clear()

  let html = ''
  suites.forEach(s => {
    html += `<div class="dt-suite"><div class="dt-suite-head"><span class="dt-suite-name">${s.name}</span><button class="dt-run-btn" data-suite="${s.name}">▶ RUN</button></div>`
    s.tests.forEach(t => {
      const key = `${s.name}:${t.name}`
      html += `
        <div class="dt-test-node" data-key="${key}">
          <div class="dt-test-item">
            <span class="dt-test-status">○</span>
            <span class="dt-test-name">${t.name}</span>
          </div>
          <div class="dt-step-list">
            ${t.steps.map(step => `<div class="dt-step-item"><span class="dt-step-dot"></span>${describeStep(step)}</div>`).join('')}
          </div>
        </div>`
    })
    html += `</div>`
  })
  uiCache.testContainer.innerHTML = html

  // Cache nodes
  uiCache.testContainer.querySelectorAll('.dt-test-node').forEach(node => {
    const key = (node as HTMLElement).dataset.key!
    uiCache.testNodes.set(key, node as HTMLElement)
    uiCache.stepNodes.set(key, Array.from(node.querySelectorAll('.dt-step-item')))
  })
}

function describeStep(step: Step): string {
  switch (step.type) {
    case 'click':   return `click ${formatSelector(step.selector)}`
    case 'type':    return `type "${step.text}"`
    case 'expect':  {
      const val = typeof step.expected === 'string' ? `"${step.expected}"` : JSON.stringify(step.expected)
      if (step.matcher === 'is') return `expect to be ${val}`
      if (step.matcher === 'contains') return `expect to contain ${val}`
      if (step.matcher === 'visible') return `expect visible`
      return `expect ${step.matcher}`
    }
    case 'see':     return `see ${formatSelector(step.selector)} ${step.exists ? 'exists' : 'absent'}`
    case 'mock':    return `mock "${step.url instanceof RegExp ? step.url.source : step.url}"`
    default:        return step.type
  }
}

function formatSelector(selector: any): string {
  if (typeof selector === 'string') return selector
  if (selector.type === 'text') return `"${selector.value}"`
  if (selector.type === 'role') return `<${selector.roleType}>`
  return String(selector.value)
}

if (import.meta.env.DEV) {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') toggleDevPanel()
  })
}
