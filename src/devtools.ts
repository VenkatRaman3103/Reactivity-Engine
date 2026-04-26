import { suites, Step, clearSnapshots, setViewport, resetViewport }      from './test/index'
import { play }             from './test/runner'
import { computeSideBySideDiff, renderSideBySide } from './test/diff'

// @ts-ignore
const isDev = import.meta.env.DEV

const stateRegistry = new Map<string, Record<string, any>>()
const history: any[] = []
const MAX_HISTORY = 50

// --- Coverage State ---
const touchedKeys = new Set<string>()
const collapsedFiles = new Set<string>()

// --- Diff State ---
const expandedDiffs = new Set<string>()

// --- Recorder State ---
let isRecording = false
let recordedSteps: any[] = []
let lastTypedElement: HTMLElement | null = null

const uiCache = {
  testNodes: new Map<string, HTMLElement>(),
  stepNodes: new Map<string, HTMLElement[]>(),
  stateContainer: null as HTMLElement | null,
  logContainer: null as HTMLElement | null,
  testContainer: null as HTMLElement | null,
  coverageContainer: null as HTMLElement | null,
  recorderOutput: null as HTMLElement | null
}

let wrapperEl: HTMLElement | null = null
let activeTab: string = 'state'

export function registerStateFile(file: string, mod: any) {
  if (!isDev) return
  stateRegistry.set(file, mod)
  collapsedFiles.add(file) // Collapse by default
}

export function recordStateChange(file: string, key: string, oldVal: any, newVal: any) {
  if (!isDev) return
  history.push({ file, key, oldVal, newVal, timestamp: Date.now() })
  if (history.length > MAX_HISTORY) history.shift()
  syncStateUI()
}

export function initDevTools() {
  if (!isDev) return
  ;(window as any).__engine = {
    updateTestStatus(suiteName: string, testName: string, status: any) {
      updateTestUI(suiteName, testName, status)
    },
    refreshLogPanel() { syncLogUI() },
    recordAccess(label: string) {
      if (touchedKeys.has(label)) return
      touchedKeys.add(label)
      syncCoverageUI()
    },
    clearCoverage() {
      touchedKeys.clear()
      syncCoverageUI()
    }
  }

  window.addEventListener('click', handleGlobalClick, true)
  window.addEventListener('input', handleGlobalInput, true)
}

function handleGlobalClick(e: MouseEvent) {
  if (!isRecording) return
  const target = e.target as HTMLElement
  if (wrapperEl && wrapperEl.contains(target)) return

  const selector = getBestSelector(target)
  addRecordedStep({ type: 'click', selector })
}

function handleGlobalInput(e: Event) {
  if (!isRecording) return
  const target = e.target as HTMLInputElement
  if (wrapperEl && wrapperEl.contains(target)) return

  const selector = getBestSelector(target)
  const val = target.value

  const lastStep = recordedSteps[recordedSteps.length - 1]
  if (lastStep && lastStep.type === 'type' && lastTypedElement === target) {
    lastStep.text = val
    updateRecorderUI()
    return
  }

  lastTypedElement = target
  addRecordedStep({ type: 'type', selector, text: val })
}

function addRecordedStep(step: any) {
  recordedSteps.push(step)
  updateRecorderUI()
}

function getBestSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`
  const text = el.textContent?.trim()
  if (text && text.length < 30) return `find.text('${text.replace(/'/g, "\\'")}')`
  const className = el.className.toString().split(' ')[0]
  if (className && !className.includes('v-')) return `.${className}`
  return el.tagName.toLowerCase()
}

function updateRecorderUI() {
  if (!uiCache.recorderOutput) return
  const code = recordedSteps.map(s => {
    const selector = s.selector.includes('find.text') ? s.selector : `'${s.selector}'`
    return `    ${s.type}(${selector}${s.text ? `, '${s.text}'` : ''}),`
  }).join('\n')

  uiCache.recorderOutput.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
      <span style="font-size:9px; color:#444; font-weight:900">GENERATED CODE</span>
      <button onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText); this.textContent='COPIED!'" style="background:#222; border:none; color:#7ec8e3; font-size:9px; padding:3px 8px; border-radius:4px; cursor:pointer">COPY</button>
      <div style="display:none">test('Recorded Test', [\n${code}\n])</div>
    </div>
    <pre style="color:#7ec8e3; margin:0; font-size:10px; white-space:pre-wrap; word-break:break-all">test('Recorded Test', [\n${code}\n])</pre>`
}

function updateTestUI(suiteName: string, testName: string, status: any) {
  const key = `${suiteName}:${testName}`
  const node = uiCache.testNodes.get(key)
  if (!node) return

  const statusIcon = node.querySelector('.dt-test-status') as HTMLElement
  const testNameEl = node.querySelector('.dt-test-name') as HTMLElement

  if (status.running) {
    testNameEl.style.color = '#7ec8e3'
    testNameEl.style.fontWeight = 'bold'
    statusIcon.textContent = '●'
    statusIcon.className = 'dt-test-status running'
  } else {
    testNameEl.style.color = status.passed ? '#4eca8b' : status.passed === false ? '#ff5f56' : '#aaa'
    testNameEl.style.fontWeight = status.passed ? 'bold' : 'normal'
    statusIcon.textContent = status.passed ? '✓' : status.passed === false ? '✗' : '○'
    statusIcon.className = `dt-test-status ${status.passed ? 'passed' : status.passed === false ? 'failed' : ''}`
  }

  const stepElems = uiCache.stepNodes.get(key)
  if (stepElems) {
    stepElems.forEach((el, i) => {
      // Clear previous diffs in this element if it was just rerendered or reset
      const existingDiff = el.querySelector('.dt-inline-diff')
      if (existingDiff) existingDiff.remove()
      const existingBtn = el.querySelector('.dt-diff-btn')
      if (existingBtn) existingBtn.remove()

      el.className = 'dt-step-item'
      if (status.running && status.activeStep === i) el.classList.add('active')
      else if (status.passed === false && i === status.activeStep) {
        el.classList.add('failed')
        if (status.diff) {
          const btn = document.createElement('button')
          btn.className = 'dt-diff-btn'
          btn.textContent = expandedDiffs.has(`${key}:${i}`) ? 'HIDE DIFF' : 'VIEW DIFF'
          btn.onclick = () => toggleInlineDiff(el, status.diff, `${key}:${i}`, btn)
          el.appendChild(btn)
          
          if (expandedDiffs.has(`${key}:${i}`)) {
            renderInlineDiff(el, status.diff)
          }
        }
      }
      else if (status.passed === true || (status.running && i < status.activeStep)) el.classList.add('passed')
    })
  }

  if (!status.running) syncCoverageUI()
}

function toggleInlineDiff(parent: HTMLElement, diffData: any, diffKey: string, btn: HTMLButtonElement) {
  if (expandedDiffs.has(diffKey)) {
    expandedDiffs.delete(diffKey)
    parent.querySelector('.dt-inline-diff')?.remove()
    btn.textContent = 'VIEW DIFF'
  } else {
    expandedDiffs.add(diffKey)
    renderInlineDiff(parent, diffData)
    btn.textContent = 'HIDE DIFF'
  }
}

function renderInlineDiff(parent: HTMLElement, diffData: any) {
  const container = document.createElement('div')
  container.className = 'dt-inline-diff'
  
  const pairs = computeSideBySideDiff(diffData.expected, diffData.actual)
  const rendered = renderSideBySide(pairs)
  
  container.innerHTML = rendered
  parent.appendChild(container)
}

function syncStateUI() {
  if (!uiCache.stateContainer) return
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
  const channels = (window as any).__engine.getLogChannels?.() || new Map()
  channels.forEach((entries: any[], name: string) => {
    html += `<div class="dt-file-header">${name}</div>`
    entries.slice(-10).reverse().forEach(e => {
        html += `<div class="dt-row"><span class="dt-val">${JSON.stringify(e.value)}</span></div>`
    })
  })
  uiCache.logContainer.innerHTML = html || '<div class="dt-empty">No logs</div>'
}

function syncCoverageUI() {
  if (!uiCache.coverageContainer) return
  
  let totalProps = 0
  let coveredProps = 0
  let html = ''

  stateRegistry.forEach((mod, file) => {
    const filename = file.split('/').pop()
    const fileProps: string[] = []
    
    Object.keys(mod).forEach(k => {
      if (typeof mod[k] === 'function') return
      totalProps++
      const label = `${file}:${k}`
      const isCovered = touchedKeys.has(label)
      if (isCovered) coveredProps++
      
      fileProps.push(`
        <div class="dt-row" style="padding-left:12px; margin:2px 0; border-radius:4px; ${isCovered ? 'background:rgba(78,202,139,0.05)' : ''}">
          <span class="dt-test-status ${isCovered ? 'passed' : ''}" style="margin-right:10px; font-size:10px; width:12px">${isCovered ? '✓' : '○'}</span>
          <span class="dt-key" style="color: ${isCovered ? '#4eca8b' : '#777'}; font-size:11px">${k}</span>
          <span class="dt-val" style="font-size:9px; opacity:0.5">${isCovered ? 'Tested' : 'Untested'}</span>
        </div>`)
    })

    const isCollapsed = collapsedFiles.has(file)
    html += `
      <div class="dt-coverage-file">
        <div class="dt-file-header dt-collapsible ${isCollapsed ? 'collapsed' : ''}" data-file="${file}" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 0">
           <span>${filename}</span>
           <span style="font-size:8px; opacity:0.5">${isCollapsed ? '▶' : '▼'}</span>
        </div>
        <div style="display: ${isCollapsed ? 'none' : 'block'}; margin-bottom:10px">
          ${fileProps.join('')}
        </div>
      </div>`
  })

  const percent = totalProps === 0 ? 0 : Math.round((coveredProps / totalProps) * 100)
  const header = `
    <div style="background: #111; padding: 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid #1a1a1a">
       <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
          <span style="font-size:9px; font-weight:900; color:#555; letter-spacing:0.5px">SESSION COVERAGE</span>
          <span style="font-size:14px; font-weight:900; color:#4eca8b">${percent}%</span>
       </div>
       <div style="height:3px; background:#1a1a1a; border-radius:1.5px; overflow:hidden">
          <div style="width:${percent}%; height:100%; background:#4eca8b; transition: width 0.3s ease"></div>
       </div>
    </div>
  `

  uiCache.coverageContainer.innerHTML = header + html
  
  // Wire up toggles
  uiCache.coverageContainer.querySelectorAll('.dt-collapsible').forEach(el => {
    el.addEventListener('click', (e) => {
      const f = (el as HTMLElement).dataset.file!
      if (collapsedFiles.has(f)) collapsedFiles.delete(f)
      else collapsedFiles.add(f)
      syncCoverageUI()
    })
  })
}

const panelStyles = `
  #engine-devtools-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 100005; font-family: system-ui, sans-serif; pointer-events: none; }
  #engine-devtools { pointer-events: auto; background: #0a0a0a; border-radius: 16px; width: 450px; height: 550px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #000; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-header span { font-size: 11px; font-weight: 800; color: #7ec8e3; letter-spacing: 1px; }
  .dt-close { background: none; border: none; color: #444; cursor: pointer; font-size: 14px; }
  .dt-tabs { display: flex; background: #000; padding: 0 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .dt-tab { background: none; border: none; padding: 12px 14px; color: #555; font-size: 10px; font-weight: 800; cursor: pointer; border-bottom: 2px solid transparent; text-transform: uppercase; }
  .dt-tab.active { color: #7ec8e3; border-bottom-color: #7ec8e3; }
  .dt-body { flex: 1; overflow-y: auto; padding: 12px; }
  .dt-panel { display: none; }
  .dt-panel.active { display: block; }

  .dt-scroll-box { background: #000; border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px; margin-top: 10px; min-height: 50px; }
  .dt-recorder-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 4px 0; }
  .dt-record-btn { background: #ff5f56; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
  .dt-record-btn.active { background: #000; color: #ff5f56; border: 1px solid #ff5f56; animation: dt-blink 1s infinite; }
  .dt-record-btn i { width: 8px; height: 8px; background: currentColor; border-radius: 50%; }
  
  .dt-diff-btn { background: #222; border: 1px solid #333; color: #7ec8e3; font-size: 8px; padding: 2px 6px; border-radius: 3px; font-weight: 900; margin-left:10px; cursor:pointer; }
  .dt-diff-btn:hover { background: #333; }
  
  .dt-inline-diff { margin-top: 8px; border: 1px solid #222; border-radius: 6px; overflow: hidden; width: 100%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }

  .dt-suite { background: rgba(255,255,255,0.01); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.03); overflow: hidden; }
  .dt-suite-head { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
  .dt-suite-name { font-size: 11px; font-weight: 800; color: #eee; }
  .dt-run-btn { background: #4eca8b; border: none; color: #000; font-size: 9px; font-weight: 900; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  
  .dt-test-node { margin-top: 2px; }
  .dt-test-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: 12px; color: #777; border-bottom: 1px solid rgba(255,255,255,0.01); }
  .dt-test-status { width: 14px; text-align: center; font-size: 14px; }
  .dt-test-status.running { color: #7ec8e3; animation: dt-pulse 0.8s infinite alternate; }
  .dt-test-status.passed { color: #4eca8b; }
  .dt-test-status.failed { color: #ff5f56; }
  
  .dt-step-list { padding: 8px 0 10px 38px; display: flex; flex-direction: column; gap: 6px; border-left: 1px solid rgba(255,255,255,0.03); margin-left: 22px; }
  .dt-step-item { font-size: 11px; color: #444; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .dt-step-item.active { color: #7ec8e3 !important; font-weight: 800; transform: translateX(2px); transition: all 0.2s; }
  .dt-step-item.passed { color: #4eca8b; opacity: 0.8; }
  .dt-step-item.failed { color: #ff5f56; font-weight: 800; }
  .dt-step-dot { width: 5px; height: 5px; border-radius: 50%; background: #222; }
  
  @keyframes dt-blink { from { opacity: 1; } to { opacity: 0.5; } }
  @keyframes dt-pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
  .dt-row { display: flex; padding: 6px 0; font-size: 11px; }
  .dt-key { color: #7ec8e3; width: 110px; font-weight: 700; }
  .dt-val { color: #fff; font-family: monospace; opacity: 0.7; overflow: hidden; }
  .dt-file-header { font-size: 9px; color: #444; font-weight: 900; margin: 12px 0 4px 0; text-transform: uppercase; }
  .dt-empty { padding: 40px; text-align: center; color: #444; font-size: 12px; }
`;

export function toggleDevPanel() {
  if (wrapperEl) { wrapperEl.remove(); wrapperEl = null; return }
  const style = document.createElement('style'); style.textContent = panelStyles; document.head.appendChild(style)
  wrapperEl = document.createElement('div'); wrapperEl.id = 'engine-devtools-wrapper'
  const panel = document.createElement('div'); panel.id = 'engine-devtools'
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
      <div class="dt-panel" id="dt-tests">
         <div id="coverage-root" style="margin-bottom:20px"></div>
         <div class="dt-recorder-bar">
            <span style="font-size:10px; font-weight:900; color:#333">AUTO-RECORDER</span>
            <div style="display:flex; gap:8px">
              <button class="dt-record-btn" id="clear-snapshots-btn" style="background:#333; color:#aaa"><i></i> CLEAR SNAPSHOTS</button>
              <button class="dt-record-btn" id="record-btn"><i></i> RECORD</button>
            </div>
         </div>
         <div id="recorder-output" class="dt-scroll-box" style="display:none"><div style="color:#444; font-size:10px">Perform actions on the page to generate code...</div></div>
         <div id="tests-tree" style="margin-top:20px"></div>
      </div>
    </div>
  `
  uiCache.stateContainer = panel.querySelector('#dt-state'); uiCache.logContainer = panel.querySelector('#dt-logs')
  uiCache.testContainer = panel.querySelector('#tests-tree'); uiCache.recorderOutput = panel.querySelector('#recorder-output')
  uiCache.coverageContainer = panel.querySelector('#coverage-root')

  renderTestStructure(); syncStateUI(); syncLogUI(); syncCoverageUI()
  wrapperEl.appendChild(panel); document.body.appendChild(wrapperEl)

  panel.querySelector('.dt-close')?.addEventListener('click', toggleDevPanel)
  
  panel.querySelector('#clear-snapshots-btn')?.addEventListener('click', () => {
    if (confirm('Clear all visual snapshots?')) {
      clearSnapshots()
      alert('Snapshots cleared!')
    }
  })

  const recordBtn = panel.querySelector('#record-btn') as HTMLElement
  recordBtn.addEventListener('click', () => {
    isRecording = !isRecording
    if (isRecording) {
      recordedSteps = []; recordBtn.classList.add('active'); recordBtn.innerHTML = '<i></i> STOP RECORDING'
      uiCache.recorderOutput!.style.display = 'block'; updateRecorderUI()
    } else { recordBtn.classList.remove('active'); recordBtn.innerHTML = '<i></i> RECORD' }
  })
  panel.querySelectorAll('.dt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!; panel.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'))
      panel.querySelectorAll('.dt-panel').forEach(p => p.classList.remove('active')); tab.classList.add('active')
      panel.querySelector(`#dt-${activeTab}`)?.classList.add('active')
    })
  })
  uiCache.testContainer?.querySelectorAll('.dt-run-btn').forEach(btn => {
    btn.addEventListener('click', () => { play((btn as HTMLElement).dataset.suite!, undefined, { devToolsReporter: true }) })
  })
}

function renderTestStructure() {
  if (!uiCache.testContainer) return
  uiCache.testNodes.clear(); uiCache.stepNodes.clear()
  let html = ''
  suites.forEach(s => {
    html += `<div class="dt-suite"><div class="dt-suite-head"><span class="dt-suite-name">${s.name}</span><button class="dt-run-btn" data-suite="${s.name}">▶ RUN</button></div>`
    s.tests.forEach(t => {
      const key = `${s.name}:${t.name}`
      html += `<div class="dt-test-node" data-key="${key}"><div class="dt-test-item"><span class="dt-test-status">○</span><span class="dt-test-name">${t.name}</span></div>
          <div class="dt-step-list">${t.steps.map(step => `<div class="dt-step-item"><span class="dt-step-dot"></span>${describeStep(step)}</div>`).join('')}</div></div>`
    })
    html += `</div>`
  })
  uiCache.testContainer.innerHTML = html
  uiCache.testContainer.querySelectorAll('.dt-test-node').forEach(node => {
    const key = (node as HTMLElement).dataset.key!; uiCache.testNodes.set(key, node as HTMLElement)
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
      if (step.matcher === 'snapshot') return `expect snapshot of ${formatSelector((step as any).actual)}`
      return `expect ${step.matcher} ${val}`
    }
    case 'see':     return `see ${formatSelector(step.selector)} ${step.exists ? 'exists' : 'absent'}`
    case 'mock':    return `mock "${(step as any).url instanceof RegExp ? (step as any).url.source : (step as any).url}"`
    case 'viewport': return `viewport ${step.width}x${step.height}`
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
