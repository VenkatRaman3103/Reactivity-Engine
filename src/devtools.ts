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

// Performance: Tracks DOM nodes for direct updates without re-renders
const nodes = {
  state:    new Map<string, HTMLElement>(),
  tests:    new Map<string, HTMLElement>(),
  testDots: new Map<string, HTMLElement>()
}

let wrapperEl: HTMLElement | null = null
let styleEl:   HTMLStyleElement | null = null
let activeTab: string = 'state'
let renderPending = false

export function registerStateFile(file: string, mod: any) {
  if (!isDev) return
  stateRegistry.set(file, mod)
}

export function recordStateChange(file: string, key: string, oldVal: any, newVal: any) {
  if (!isDev) return
  history.push({ file, key, oldVal, newVal, timestamp: Date.now() })
  if (history.length > MAX_HISTORY) history.shift()
  requestRender()
}

// Optimization: Debounce renders to once per frame
function requestRender() {
  if (renderPending || !wrapperEl) return
  renderPending = true
  requestAnimationFrame(() => {
    renderPanel()
    renderPending = false
  })
}

export function initDevTools() {
  if (!isDev) return
  ;(window as any).__engine = {
    state() { return stateRegistry },
    refreshLogPanel() { requestRender() },
    updateTestStatus(suiteName: string, testName: string, status: { passed?: boolean, activeStep?: number, running?: boolean }) {
      const key = `${suiteName}:${testName}`
      // partial update logic
      if (wrapperEl) updateSingleTestUI(suiteName, testName, status)
    }
  }
}

function updateSingleTestUI(suiteName: string, testName: string, status: any) {
  const testKey = `${suiteName}:${testName}`
  const testNode = nodes.tests.get(testKey)
  if (!testNode) return

  const statusEl = testNode.querySelector('.dt-test-status') as HTMLElement
  if (statusEl) {
    statusEl.className = `dt-test-status ${status.running ? 'running' : status.passed ? 'passed' : status.passed === false ? 'failed' : ''}`
    statusEl.textContent = status.running ? '●' : status.passed ? '✓' : status.passed === false ? '✗' : '○'
  }

  // Update steps specifically
  const stepList = testNode.nextElementSibling as HTMLElement
  if (stepList && stepList.classList.contains('dt-step-list')) {
    const steps = stepList.querySelectorAll('.dt-step-item')
    steps.forEach((s, i) => {
      s.className = 'dt-step-item'
      if (status.running && status.activeStep === i) s.classList.add('active')
      else if (status.passed === false && i === status.activeStep) s.classList.add('failed')
      else if (status.passed || (status.running && i < status.activeStep)) s.classList.add('passed')
    })
  }
}

const panelStyles = `
  #engine-devtools-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 100001; font-family: system-ui, sans-serif; pointer-events: none; }
  #engine-devtools { pointer-events: auto; background: #121212; border-radius: 16px; width: 450px; height: 500px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); overflow: hidden; }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-header span { font-size: 13px; font-weight: 700; color: #7ec8e3; }
  .dt-close { background: none; border: none; color: #666; cursor: pointer; font-size: 16px; }
  .dt-tabs { display: flex; background: #0a0a0a; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-tab { background: none; border: none; padding: 12px 16px; color: #666; font-size: 11px; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; text-transform: uppercase; letter-spacing: 0.5px; }
  .dt-tab.active { color: #7ec8e3; border-bottom-color: #7ec8e3; }
  .dt-body { flex: 1; overflow-y: auto; background: #121212; padding: 12px; }
  .dt-panel { display: none; }
  .dt-panel.active { display: block; }

  .dt-suite { background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 12px; overflow: hidden; }
  .dt-suite-head { padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
  .dt-suite-name { font-size: 12px; font-weight: 700; color: #efefef; }
  .dt-run-btn { background: #4eca8b; border: none; color: #000; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  
  .dt-test-item { display: flex; align-items: center; gap: 10px; padding: 8px 14px; font-size: 12px; color: #aaa; border-bottom: 1px solid rgba(255,255,255,0.02); }
  .dt-test-status { width: 14px; text-align: center; font-family: monospace; }
  .dt-test-status.passed { color: #4eca8b; }
  .dt-test-status.failed { color: #ff5f56; }
  .dt-test-status.running { color: #7ec8e3; animation: dt-pulse 1s infinite alternate; }
  
  .dt-step-list { padding: 4px 0 8px 38px; display: flex; flex-direction: column; gap: 4px; }
  .dt-step-item { font-size: 11px; color: #555; display: flex; gap: 8px; align-items: center; }
  .dt-step-item.active { color: #7ec8e3; font-weight: bold; }
  .dt-step-item.passed { color: #4eca8b88; }
  .dt-step-item.failed { color: #ff5f56; }
  .dt-step-dot { width: 5px; height: 5px; border-radius: 50%; border: 1px solid #333; }
  .dt-step-item.active .dt-step-dot { background: #7ec8e3; border-color: #7ec8e3; box-shadow: 0 0 5px #7ec8e3; }
  .dt-step-item.passed .dt-step-dot { background: #4eca8b; border-color: #4eca8b; }
  .dt-step-item.failed .dt-step-dot { background: #ff5f56; border-color: #ff5f56; }

  @keyframes dt-pulse { from { opacity: 0.3; } to { opacity: 1; } }
  .dt-row { display: flex; padding: 6px 10px; font-size: 12px; border-bottom: 1px solid rgba(255,255,255,0.01); }
  .dt-key { color: #7ec8e3; width: 120px; flex-shrink: 0; }
  .dt-val { color: #fff; font-family: monospace; opacity: 0.8; word-break: break-all; }
`;

export function toggleDevPanel() {
  if (wrapperEl) { wrapperEl.remove(); wrapperEl = null; return }
  renderPanel()
}

function renderPanel() {
  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.id = 'engine-devtools-style'
    styleEl.textContent = panelStyles
    document.head.appendChild(styleEl)
  }

  if (!wrapperEl) {
    wrapperEl = document.createElement('div')
    wrapperEl.id = 'engine-devtools-wrapper'
    document.body.appendChild(wrapperEl)
  }

  const scrollPos = wrapperEl.querySelector('.dt-body')?.scrollTop || 0

  const stateRows: string[] = []
  stateRegistry.forEach((mod, file) => {
    stateRows.push(`<div style="font-size:10px; color:#444; margin:10px 0 5px 0; font-weight:bold">${file.split('/').pop()}</div>`)
    Object.keys(mod).forEach(k => {
      if (typeof mod[k] === 'function') return
      stateRows.push(`<div class="dt-row"><span class="dt-key">${k}</span><span class="dt-val">${JSON.stringify(mod[k])}</span></div>`)
    })
  })

  const logRows: string[] = []
  getLogChannels().forEach((entries, name) => {
    logRows.push(`<div style="font-size:10px; color:#444; margin:10px 0 5px 0; font-weight:bold">${name}</div>`)
    entries.slice(-10).reverse().forEach(e => logRows.push(`<div class="dt-row"><span class="dt-val">${JSON.stringify(e.value)}</span></div>`))
  })

  const testRows = suites.map(s => {
    const testsHtml = s.tests.map(t => {
      const key = `${s.name}:${t.name}`
      return `
        <div class="dt-test-node" data-key="${key}">
          <div class="dt-test-item">
            <span class="dt-test-status">○</span>
            <span class="dt-test-name">${t.name}</span>
          </div>
          <div class="dt-step-list" style="display:none">
            ${t.steps.map(step => `<div class="dt-step-item"><span class="dt-step-dot"></span>${describeStep(step)}</div>`).join('')}
          </div>
        </div>`
    }).join('')

    return `
      <div class="dt-suite">
        <div class="dt-suite-head">
          <span class="dt-suite-name">${s.name}</span>
          <button class="dt-run-btn" data-suite="${s.name}">▶ RUN</button>
        </div>
        ${testsHtml}
      </div>`
  }).join('')

  wrapperEl.innerHTML = `
    <div id="engine-devtools">
      <div class="dt-header"><span>⚡ ENGINE DEVTOOLS</span><button class="dt-close">✕</button></div>
      <div class="dt-tabs">
        <button class="dt-tab ${activeTab === 'state' ? 'active' : ''}" data-tab="state">State</button>
        <button class="dt-tab ${activeTab === 'logs' ? 'active' : ''}" data-tab="logs">Logs</button>
        <button class="dt-tab ${activeTab === 'tests' ? 'active' : ''}" data-tab="tests">Tests</button>
      </div>
      <div class="dt-body">
        <div class="dt-panel ${activeTab === 'state' ? 'active' : ''}" id="dt-state">${stateRows.join('')}</div>
        <div class="dt-panel ${activeTab === 'logs' ? 'active' : ''}" id="dt-logs">${logRows.join('')}</div>
        <div class="dt-panel ${activeTab === 'tests' ? 'active' : ''}" id="dt-tests">${testRows}</div>
      </div>
    </div>
  `

  nodes.tests.clear()
  wrapperEl.querySelectorAll('.dt-test-node').forEach(node => {
    nodes.tests.set((node as HTMLElement).dataset.key!, node as HTMLElement)
  })

  wrapperEl.querySelector('.dt-body')!.scrollTop = scrollPos
  addEventListeners(wrapperEl)
}

function addEventListeners(parent: HTMLElement) {
  parent.querySelector('.dt-close')?.addEventListener('click', toggleDevPanel)
  parent.querySelectorAll('.dt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!
      renderPanel()
    })
  })
  parent.querySelectorAll('.dt-run-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const suiteName = (btn as HTMLElement).dataset.suite!
      // Expand all tests in this suite when starting
      parent.querySelectorAll(`.dt-test-node[data-key^="${suiteName}:"] .dt-step-list`).forEach(l => (l as HTMLElement).style.display = 'flex')
      play(suiteName, undefined, { devToolsReporter: true })
    })
  })
}

function describeStep(step: Step): string {
  switch (step.type) {
    case 'click':   return `click ${formatSelector(step.selector)}`
    case 'type':    return `type "${step.text}"`
    case 'expect':  return `expect to be ${JSON.stringify(step.expected)}`
    case 'see':     return `see ${formatSelector(step.selector)} ${step.exists ? 'exists' : 'absent'}`
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
