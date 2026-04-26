import { instances }         from './component'
import { getSignalCache }    from './state'
import { getLogChannels }   from './log'
import { suites, SuiteDefinition, Step } from './test/index'
import { play }             from './test/runner'

// @ts-ignore - env provided by Vite
const isDev = import.meta.env.DEV

const stateRegistry = new Map<string, Record<string, any>>()
interface StateChange {
  file:      string
  key:       string
  oldValue:  any
  newValue:  any
  timestamp: number
}
const history: StateChange[] = []
const MAX_HISTORY = 50

export function registerStateFile(file: string, mod: Record<string, any>) {
  if (!isDev) return
  stateRegistry.set(file, mod)
}

export function recordStateChange(file: string, key: string, oldValue: any, newValue: any) {
  if (!isDev) return
  history.push({ file, key, oldValue, newValue, timestamp: Date.now() })
  if (history.length > MAX_HISTORY) history.shift()
  if (wrapperEl) renderPanel()
}

// Global state for test results in DevTools
// Key: suite:test or suite:test:step
const testResults = new Map<string, { passed?: boolean, error?: string, running?: boolean, activeStep?: number }>()

export function initDevTools() {
  if (!isDev) return
  ;(window as any).__engine = {
    state() {
      const result: any = {}
      stateRegistry.forEach((mod, file) => {
        result[file] = {}
        Object.keys(mod).forEach(k => { if (typeof mod[k] !== 'function') result[file][k] = mod[k] })
      })
      console.table(result); return result
    },
    inspect(file: string) {
      const mod = stateRegistry.get(file)
      if (!mod) return
      const result: any = {}
      Object.keys(mod).forEach(k => { if (typeof mod[k] !== 'function') result[k] = mod[k] })
      console.table(result); return result
    },
    components() {
      const result = Array.from(instances.keys())
      console.log(result); return result
    },
    subscriptions() {
      const result: any = {}
      getSignalCache().forEach((signals, file) => {
        let count = 0
        signals.forEach(s => count += (s as any).subscribers?.size || 0)
        result[file] = count + ' listeners'
      })
      console.table(result); return result
    },
    history() { console.table(history); return history },
    refreshLogPanel() { if (wrapperEl) renderPanel() },
    updateTestStatus(suiteName: string, testName: string, status: { passed?: boolean, error?: string, running?: boolean, activeStep?: number }) {
      testResults.set(`${suiteName}:${testName}`, status)
      if (wrapperEl) renderPanel()
    }
  }
}

const panelStyles = `
  #engine-devtools-wrapper {
    position: fixed; bottom: 20px; right: 20px; z-index: 100001;
    font-family: system-ui, sans-serif; color: #efefef; pointer-events: none;
  }
  #engine-devtools {
    pointer-events: auto; background: #121212; border-radius: 16px;
    width: 450px; height: 600px; max-height: 85vh; display: flex; flex-direction: column;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);
    overflow: hidden;
  }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-header span { font-size: 14px; font-weight: 600; }
  .dt-close { background: rgba(255,255,255,0.05); border: none; color: #aaa; border-radius: 8px; width: 28px; height: 28px; cursor: pointer; }
  .dt-tabs { display: flex; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); padding: 0 10px; }
  .dt-tab { background: transparent; border: none; padding: 12px 16px; color: #888; font-size: 12px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent; }
  .dt-tab.active { color: #7ec8e3; border-bottom-color: #7ec8e3; }
  .dt-body { flex: 1; overflow-y: auto; background: #121212; }
  .dt-panel { display: none; padding: 16px; }
  .dt-panel.active { display: block; }
  .dt-row { display: flex; padding: 8px 12px; background: rgba(255,255,255,0.02); border-radius: 8px; margin-bottom: 4px; font-size: 13px; }
  .dt-key { color: #7ec8e3; font-weight: 600; min-width: 100px; }
  .dt-val { color: #efefef; font-family: monospace; flex: 1; }
  .dt-file { font-size: 11px; color: #555; text-transform: uppercase; margin: 16px 0 8px 0; font-weight: bold; }
  
  .dt-suite {
    margin-bottom: 12px; border-radius: 12px; overflow: hidden;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
  }
  .dt-suite-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 16px; background: rgba(255,255,255,0.03);
  }
  .dt-suite-name { font-size: 13px; font-weight: 700; color: #7ec8e3; }
  .dt-run-btn { background: #4eca8b; border: none; color: #000; font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 6px; cursor: pointer; }
  
  .dt-test-node { margin-bottom: 2px; }
  .dt-test-item {
    display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: 12px; color: #efefef;
    cursor: default; background: rgba(255,255,255,0.01); transition: background 0.2s;
  }
  .dt-test-item:hover { background: rgba(255,255,255,0.03); }
  
  .dt-test-status { width: 14px; text-align: center; }
  .dt-test-status.passed { color: #4eca8b; }
  .dt-test-status.failed { color: #ff5f56; }
  .dt-test-status.running { color: #7ec8e3; animation: dt-pulse 1s infinite; }
  
  .dt-step-list { padding: 4px 0 8px 38px; border-left: 1px solid rgba(255,255,255,0.05); margin-left: 23px; display: flex; flex-direction: column; gap: 4px; }
  .dt-step-item {
    font-size: 11px; color: #666; display: flex; gap: 8px; align-items: center;
  }
  .dt-step-item.active { color: #efefef; font-weight: bold; }
  .dt-step-item.passed { color: #4eca8b; }
  .dt-step-item.failed { color: #ff5f56; }
  .dt-step-dot { width: 6px; height: 6px; border-radius: 50%; border: 1px solid #444; }
  .dt-step-item.active .dt-step-dot { background: #7ec8e3; border-color: #7ec8e3; }
  .dt-step-item.passed .dt-step-dot { background: #4eca8b; border-color: #4eca8b; }
  .dt-step-item.failed .dt-step-dot { background: #ff5f56; border-color: #ff5f56; }

  @keyframes dt-pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
  .dt-empty { padding: 40px; text-align: center; color: #666; font-size: 13px; }
`;

let wrapperEl: HTMLElement | null = null
let styleEl: HTMLStyleElement | null = null
let activeTab: string = 'state'

export function toggleDevPanel() {
  if (!isDev) return
  if (wrapperEl) { wrapperEl.remove(); wrapperEl = null; return }
  renderPanel()
}

function renderPanel() {
  if (wrapperEl) {
    const oldPanel = wrapperEl.querySelector('#engine-devtools')
    if (oldPanel) {
      const scrollPos = oldPanel.querySelector('.dt-body')?.scrollTop || 0
      buildContent(oldPanel as HTMLElement)
      oldPanel.querySelector('.dt-body')!.scrollTop = scrollPos
      return
    }
  }

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.textContent = panelStyles
    document.head.appendChild(styleEl)
  }

  wrapperEl = document.createElement('div')
  wrapperEl.id = 'engine-devtools-wrapper'
  const panelEl = document.createElement('div')
  panelEl.id = 'engine-devtools'
  buildContent(panelEl)
  wrapperEl.appendChild(panelEl)
  document.body.appendChild(wrapperEl)
}

function buildContent(panelEl: HTMLElement) {
  // State, Components, etc. (Omitted for brevity, kept functional)
  const stateRows: string[] = []
  stateRegistry.forEach((mod, file) => {
    stateRows.push(`<div class="dt-file">${file.split('/').pop()}</div>`)
    Object.keys(mod).forEach(k => {
      if (typeof mod[k] === 'function') return
      stateRows.push(`<div class="dt-row"><span class="dt-key">${k}</span><span class="dt-val">${JSON.stringify(mod[k])}</span></div>`)
    })
  })

  const compRows = Array.from(instances.keys()).map(id => `<div class="dt-row"><span class="dt-key">${id}</span></div>`)
  
  const subRows: string[] = []
  getSignalCache().forEach((signals, file) => {
    let subCount = 0
    signals.forEach(s => subCount += (s as any).subscribers?.size || 0)
    subRows.push(`<div class="dt-row"><span class="dt-key">${file.split('/').pop()}</span><span class="dt-val">${subCount} listeners</span></div>`)
  })

  const logRows: string[] = []
  getLogChannels().forEach((entries, name) => {
    logRows.push(`<div class="dt-file">${name}</div>`)
    entries.slice(-5).forEach(e => logRows.push(`<div class="dt-row"><span class="dt-val">${JSON.stringify(e.value)}</span></div>`))
  })

  const testRows = suites.map(s => {
    const testsHtml = s.tests.map(t => {
      const result = testResults.get(`${s.name}:${t.name}`)
      let statusIcon = '○'
      let statusClass = ''
      if (result?.running) { statusIcon = '●'; statusClass = 'running' }
      else if (result?.passed === true) { statusIcon = '✓'; statusClass = 'passed' }
      else if (result?.passed === false) { statusIcon = '✗'; statusClass = 'failed' }
      
      const stepsHtml = t.steps.map((step, i) => {
        let stepClass = ''
        if (result?.running && result?.activeStep === i) stepClass = 'active'
        else if (result?.passed === false && i === result?.activeStep) stepClass = 'failed'
        else if (result && (i < (result.activeStep || 0) || result.passed)) stepClass = 'passed'
        
        return `<div class="dt-step-item ${stepClass}"><span class="dt-step-dot"></span>${describeStep(step)}</div>`
      }).join('')

      return `
        <div class="dt-test-node">
          <div class="dt-test-item">
            <span class="dt-test-status ${statusClass}">${statusIcon}</span>
            <span class="dt-test-name">${t.name}</span>
          </div>
          ${(result?.running || result?.passed !== undefined) ? `<div class="dt-step-list">${stepsHtml}</div>` : ''}
        </div>
      `
    }).join('')

    return `
      <div class="dt-suite">
        <div class="dt-suite-header">
          <span class="dt-suite-name">${s.name}</span>
          <button class="dt-run-btn" data-suite="${s.name}">▶ Run Suite</button>
        </div>
        <div>${testsHtml}</div>
      </div>
    `
  })

  panelEl.innerHTML = `
    <div class="dt-header"><span>⚡ Engine DevTools</span><button class="dt-close">✕</button></div>
    <div class="dt-tabs">
      <button class="dt-tab ${activeTab === 'state' ? 'active' : ''}" data-tab="state">State</button>
      <button class="dt-tab ${activeTab === 'components' ? 'active' : ''}" data-tab="components">Components</button>
      <button class="dt-tab ${activeTab === 'logs' ? 'active' : ''}" data-tab="logs">Logs</button>
      <button class="dt-tab ${activeTab === 'tests' ? 'active' : ''}" data-tab="tests">Tests</button>
    </div>
    <div class="dt-body">
      <div class="dt-panel ${activeTab === 'state' ? 'active' : ''}" id="dt-state">${stateRows.join('') || '<div class="dt-empty">No state</div>'}</div>
      <div class="dt-panel ${activeTab === 'components' ? 'active' : ''}" id="dt-components">${compRows.join('') || '<div class="dt-empty">No components</div>'}</div>
      <div class="dt-panel ${activeTab === 'logs' ? 'active' : ''}" id="dt-logs">${logRows.join('') || '<div class="dt-empty">No logs</div>'}</div>
      <div class="dt-panel ${activeTab === 'tests' ? 'active' : ''}" id="dt-tests">${testRows.join('') || '<div class="dt-empty">No tests registered</div>'}</div>
    </div>
  `

  panelEl.querySelector('.dt-close')?.addEventListener('click', () => { wrapperEl?.remove(); wrapperEl = null })
  panelEl.querySelectorAll('.dt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!
      panelEl.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'))
      panelEl.querySelectorAll('.dt-panel').forEach(p => p.classList.remove('active'))
      tab.classList.add('active')
      panelEl.querySelector(`#dt-${activeTab}`)?.classList.add('active')
    })
  })
  panelEl.querySelectorAll('.dt-run-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const suiteName = (btn as HTMLElement).dataset.suite!
      play(suiteName, undefined, { devToolsReporter: true })
    })
  })
}

function describeStep(step: Step): string {
  switch (step.type) {
    case 'click':   return `click ${formatSelector(step.selector)}`
    case 'type':    return `type "${step.text}"`
    case 'hover':   return `hover ${formatSelector(step.selector)}`
    case 'expect':  {
      const val = typeof step.expected === 'string' ? `"${step.expected}"` : JSON.stringify(step.expected)
      if (step.matcher === 'is') return `expect to be ${val}`
      if (step.matcher === 'contains') return `expect to contain ${val}`
      if (step.matcher === 'visible') return `expect ${formatSelector(typeof step.actual === 'string' ? step.actual : '')} to be visible`
      return `expect ${step.matcher} ${val || ''}`
    }
    case 'see':     return `see ${formatSelector(step.selector)} ${step.exists ? 'exists' : 'absent'}`
    case 'pause':   return `pause ${step.ms}ms`
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
