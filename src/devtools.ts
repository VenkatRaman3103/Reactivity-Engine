import { suites, Step, clearSnapshots, setViewport, resetViewport }      from './test/index'
import { play }             from './test/runner'
import { computeSideBySideDiff, renderSideBySide } from './test/diff'
import { startNetworkSpy, stopNetworkSpy, CapturedRequest } from './test/network'
import { getPersistedKeys, clearPersisted, clearAllPersisted, PersistEntry } from './persist'
import { componentRegistry } from './reactive'
import { instances }       from './component'
import { stateModules }    from './memo'
import { renderMap }       from './devtools/views/Map'
import { renderTree }      from './devtools/views/Tree'
import { renderInspector,
         enableInspect,
         disableInspect,
         isInspecting }  from './devtools/views/Inspector'

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
let capturedNetworkCalls: CapturedRequest[] = []
let lastTypedElement: HTMLElement | null = null

const uiCache = {
  testNodes: new Map<string, HTMLElement>(),
  stepNodes: new Map<string, HTMLElement[]>(),
  stateContainer: null as HTMLElement | null,
  logContainer: null as HTMLElement | null,
  testContainer: null as HTMLElement | null,
  coverageContainer: null as HTMLElement | null,
  recorderOutput: null as HTMLElement | null,
  networkBadge: null as HTMLElement | null,
  storageContainer: null as HTMLElement | null,
  componentsContainer: null as HTMLElement | null
}

let wrapperEl: HTMLElement | null = null
let activeTab: string = 'state'
let compActiveTab: string = 'map'
let isDragging: boolean = false
let dragOffsetX: number = 0
let dragOffsetY: number = 0
let winX: number = 40
let winY: number = 40

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

  // Update live network badge
  if (uiCache.networkBadge) {
    const n = capturedNetworkCalls.length
    uiCache.networkBadge.textContent = `🌐 ${n} call${n === 1 ? '' : 's'}`
    uiCache.networkBadge.style.opacity = n > 0 ? '1' : '0.35'
  }

  const mockLines = capturedNetworkCalls.map(c => {
    const urlStr = c.url.length > 60 ? c.url.slice(0, 60) + '…' : c.url
    const body   = JSON.stringify(c.response, null, 2)
      .split('\n').map((l, i) => i === 0 ? l : '      ' + l).join('\n')
    return `    mock('${urlStr}', ${body}),`
  })

  const stepLines = recordedSteps.map(s => {
    const selector = s.selector.includes('find.text') ? s.selector : `'${s.selector}'`
    return `    ${s.type}(${selector}${s.text ? `, '${s.text}'` : ''}),`
  })

  const allLines = [...mockLines, ...stepLines]
  const code     = allLines.join('\n')
  const fullText = `test('Recorded Test', [\n${code}\n])`
  const hasMocks = mockLines.length > 0

  // Build the syntax-highlighted inner HTML for the <pre>
  const innerHtml = hasMocks
    ? `<span style="color:#f0a030">${escHtml(mockLines.join('\n'))}</span>\n${escHtml(stepLines.join('\n'))}`
    : escHtml(allLines.join('\n'))

  uiCache.recorderOutput.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">
      <span style="font-size:9px; color:#444; font-weight:900">GENERATED CODE</span>
      <button id="copy-btn" style="background:#222; border:none; color:#7ec8e3; font-size:9px; padding:3px 8px; border-radius:4px; cursor:pointer">COPY</button>
    </div>
    ${hasMocks ? `<div style="font-size:8px; font-weight:900; color:#f0a030; letter-spacing:0.5px; margin-bottom:4px">⚡ AUTO-MOCKED — ${mockLines.length} network call${mockLines.length === 1 ? '' : 's'} captured</div>` : ''}
    <pre style="color:#7ec8e3; margin:0; font-size:10px; white-space:pre-wrap; word-break:break-all">test('Recorded Test', [\n${innerHtml}\n])</pre>`

  uiCache.recorderOutput.querySelector('#copy-btn')
    ?.addEventListener('click', (e) => {
      navigator.clipboard.writeText(fullText)
      ;(e.target as HTMLButtonElement).textContent = 'COPIED!'
      setTimeout(() => { (e.target as HTMLButtonElement).textContent = 'COPY' }, 1500)
    })
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
  :root {
    --dt-font: 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace;
    --dt-xs: 9px;
    --dt-sm: 10px;
    --dt-md: 11px;
    --dt-lg: 12px;
    --dt-xl: 14px;
    --dt-color-text: #ccc;
    --dt-color-muted: #666;
    --dt-color-accent: #7ec8e3;
    --dt-color-success: #4eca8b;
    --dt-color-error: #ff5f56;
    --dt-color-bg: #0a0a0a;
    --dt-color-bg-alt: #111;
  }

  #engine-devtools { -ms-overflow-style: none; scrollbar-width: none; }
  #engine-devtools::-webkit-scrollbar { display: none; }
  #engine-devtools * { -ms-overflow-style: none; scrollbar-width: none; }
  #engine-devtools *::-webkit-scrollbar { display: none; }
  #engine-devtools-wrapper { position: fixed; bottom: 20px; right: 20px; z-index: 100005; font-family: var(--dt-font); pointer-events: none; }
  #engine-devtools { pointer-events: auto; background: var(--dt-color-bg); border-radius: 16px; width: 450px; height: 550px; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.08); overflow: hidden; font-family: var(--dt-font); }
  #engine-devtools:active { cursor: grabbing; }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; padding-top: 24px; background: #000; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: grab; }
  .dt-header:active { cursor: grabbing; }
  .dt-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; padding-top: 24px; background: #000; border-bottom: 1px solid rgba(255,255,255,0.05); }
  .dt-header span { font-size: var(--dt-md); font-weight: 800; color: var(--dt-color-accent); letter-spacing: 1px; }
  .dt-close { background: none; border: none; color: var(--dt-color-muted); cursor: pointer; font-size: var(--dt-xl); }
  .dt-close:hover { color: #666; }
  .dt-tabs { display: flex; background: #000; padding: 0 10px; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .dt-tab { background: none; border: none; padding: 12px 14px; color: var(--dt-color-muted); font-size: var(--dt-sm); font-weight: 800; cursor: pointer; border-bottom: 2px solid transparent; text-transform: uppercase; letter-spacing: 0.5px; }
  .dt-tab:hover { color: #777; }
  .dt-tab.active { color: var(--dt-color-accent); border-bottom-color: var(--dt-color-accent); }
  .dt-body { flex: 1; overflow-y: auto; padding: 12px; }
  .dt-panel { display: none; }
  .dt-panel.active { display: block; }

  .dt-scroll-box { background: var(--dt-color-bg-alt); border: 1px solid #1a1a1a; border-radius: 8px; padding: 12px; margin-top: 10px; min-height: 50px; }
  .dt-recorder-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; padding: 4px 0; }
  .dt-record-btn { background: var(--dt-color-error); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: var(--dt-sm); font-weight: 900; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
  .dt-record-btn:hover { background: #ff7061; }
  .dt-record-btn.active { background: var(--dt-color-bg-alt); color: var(--dt-color-error); border: 1px solid var(--dt-color-error); animation: dt-blink 1s infinite; }
  .dt-record-btn i { width: 8px; height: 8px; background: currentColor; border-radius: 50%; }
    
  .dt-diff-btn { background: #222; border: 1px solid #333; color: var(--dt-color-accent); font-size: var(--dt-xs); padding: 2px 6px; border-radius: 3px; font-weight: 900; margin-left:10px; cursor:pointer; }
  .dt-diff-btn:hover { background: #333; }
    
  .dt-inline-diff { margin-top: 8px; border: 1px solid #222; border-radius: 6px; overflow: hidden; width: 100%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5); }

  .dt-suite { background: rgba(255,255,255,0.01); border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.03); overflow: hidden; }
  .dt-suite-head { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); }
  .dt-suite-name { font-size: var(--dt-md); font-weight: 800; color: var(--dt-color-text); }
  .dt-run-btn { background: var(--dt-color-success); border: none; color: #000; font-size: var(--dt-sm); font-weight: 900; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
  .dt-run-btn:hover { background: #5fdc9b; }
    
  .dt-test-node { margin-top: 2px; }
  .dt-test-item { display: flex; align-items: center; gap: 10px; padding: 8px 16px; font-size: var(--dt-lg); color: var(--dt-color-muted); border-bottom: 1px solid rgba(255,255,255,0.01); }
  .dt-test-status { width: 14px; text-align: center; font-size: var(--dt-xl); }
  .dt-test-status.running { color: var(--dt-color-accent); animation: dt-pulse 0.8s infinite alternate; }
  .dt-test-status.passed { color: var(--dt-color-success); }
  .dt-test-status.failed { color: var(--dt-color-error); }
    
  .dt-step-list { padding: 8px 0 10px 38px; display: flex; flex-direction: column; gap: 6px; border-left: 1px solid rgba(255,255,255,0.03); margin-left: 22px; }
  .dt-step-item { font-size: var(--dt-md); color: var(--dt-color-muted); display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
  .dt-step-item.active { color: var(--dt-color-accent) !important; font-weight: 800; transform: translateX(2px); transition: all 0.2s; }
  .dt-step-item.passed { color: var(--dt-color-success); opacity: 0.8; }
  .dt-step-item.failed { color: var(--dt-color-error); font-weight: 800; }
  .dt-step-dot { width: 5px; height: 5px; border-radius: 50%; background: #222; }
    
  @keyframes dt-blink { from { opacity: 1; } to { opacity: 0.5; } }
  @keyframes dt-pulse { from { opacity: 0.2; transform: scale(0.8); } to { opacity: 1; transform: scale(1.1); } }
  .dt-row { display: flex; padding: 6px 0; font-size: var(--dt-md); }
  .dt-key { color: var(--dt-color-accent); width: 110px; font-weight: 700; }
  .dt-val { color: var(--dt-color-text); opacity: 0.7; overflow: hidden; }
  .dt-file-header { font-size: var(--dt-xs); color: var(--dt-color-muted); font-weight: 900; margin: 12px 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px; }
  .dt-empty { padding: 40px; text-align: center; color: var(--dt-color-muted); font-size: var(--dt-md); }
  .dt-meta { opacity: 0.5; font-size: var(--dt-sm); }
  .dt-clear { background: #222; border: none; color: var(--dt-color-error); font-size: var(--dt-xs); padding: 2px 6px; border-radius: 3px; cursor: pointer; }
  .dt-clear:hover { background: #333; }
  .dt-panel-title { font-size: var(--dt-sm); font-weight: 900; color: var(--dt-color-muted); margin-bottom: 12px; }

  /* Components tab */
  #dt-components { display: none; flex-direction: column; height: 100%; }
  #dt-components.active { display: flex; }
  #dt-components .dt-comp-header { display: none; }
  #dt-components.active .dt-comp-header { display: flex; gap: 4px; padding: 0 8px; margin-bottom: 8px; border-bottom: 1px solid #1a1a1a; align-items: center; }
  #dt-components .dt-comp-tab { background: none; border: none; padding: 8px 12px; color: var(--dt-color-muted); font-size: var(--dt-sm); font-weight: 800; cursor: pointer; border-bottom: 2px solid transparent; }
  #dt-components .dt-comp-tab:hover { color: #777; }
  #dt-components.active .dt-comp-tab.active { color: var(--dt-color-accent); border-bottom-color: var(--dt-color-accent); }
  #dt-components .dt-comp-inspect-btn { margin-left: auto; background: transparent; border: 1px solid #333; border-radius: 4px; color: var(--dt-color-muted); font-size: var(--dt-sm); padding: 4px 8px; cursor: pointer; }
  #dt-components .dt-comp-inspect-btn:hover { border-color: #4f8ef7; color: var(--dt-color-accent); }
  #dt-components .dt-comp-body { display: none; flex: 1; overflow: hidden; position: relative; }
  #dt-components.active .dt-comp-body { display: block; }
#dt-components.active .dt-comp-body .map-view { width: 100%; height: 100%; }
  #dt-components.active .dt-comp-body .tree-view { width: 100%; height: 100%; }

  /* Map/Legend */
  .map-legend { position: absolute; bottom: 12px; left: 12px; display: flex; gap: 16px; }
  .legend-item { display: flex; align-items: center; gap: 6px; color: var(--dt-color-muted); font-size: var(--dt-sm); }
  .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
  .legend-dot.component { background: #4f8ef7; }
  .legend-dot.state { background: var(--dt-color-success); }

  /* Tree */
  .tree-view { display: flex; height: 100%; overflow: hidden; }
  .tree-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
  .tree-panel-header { padding: 8px 14px; color: var(--dt-color-muted); font-size: var(--dt-sm); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #1a1a1a; }
  .tree-panel-body { flex: 1; overflow-y: auto; padding: 4px 0; }
  .tree-divider { width: 1px; background: #1a1a1a; flex-shrink: 0; }
  .tree-item { display: flex; align-items: center; gap: 6px; padding: 5px 14px; color: var(--dt-color-muted); cursor: pointer; transition: all 0.1s; font-size: var(--dt-lg); }
  .tree-item:hover { background: #161616; }
  .tree-item.highlighted { background: #0d2030; color: var(--dt-color-accent); }
  .tree-item.dimmed { opacity: 0.25; }
  .tree-item-icon { color: #4f8ef7; font-size: var(--dt-sm); }
  .tree-item-icon.state { color: var(--dt-color-success); }
  .tree-item-name { flex: 1; color: var(--dt-color-text); }
  .tree-item-file { color: var(--dt-color-muted); font-size: var(--dt-sm); }
  .tree-item-dot { width: 6px; height: 6px; border-radius: 50%; background: #333; }
  .tree-item-dot.mounted { background: var(--dt-color-success); }
  .state-group { border-bottom: 1px solid #1a1a1a; font-size: var(--dt-lg); }
  .state-group.highlighted { background: #0d200d; }
  .state-group.dimmed { opacity: 0.25; }
  .state-group-header { display: flex; align-items: center; gap: 6px; padding: 6px 14px; cursor: pointer; font-size: var(--dt-lg); }
  .state-group-header:hover { background: #161616; }
  .state-group-exports { padding: 0 14px 6px 32px; font-size: var(--dt-md); }
  .state-export { display: flex; align-items: center; gap: 8px; padding: 2px 0; color: var(--dt-color-muted); font-size: var(--dt-md); }
  .export-name { color: var(--dt-color-muted); min-width: 80px; font-size: var(--dt-md); }
  .export-type { background: #1a1a1a; color: var(--dt-color-muted); padding: 1px 5px; border-radius: 3px; font-size: var(--dt-xs); }
  .export-value { color: #4f8ef7; font-size: var(--dt-md); }

  /* Inspector */
  .inspector-empty { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--dt-color-muted); text-align: center; padding: 40px; font-size: var(--dt-sm); }
  .inspector-view { padding: 16px; overflow-y: auto; height: 100%; }
  .inspector-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #1a1a1a; }
  .inspector-name { color: var(--dt-color-accent); font-size: var(--dt-lg); font-weight: bold; }
  .inspector-file { color: var(--dt-color-muted); font-size: var(--dt-sm); flex: 1; }
  .inspector-badge { padding: 2px 8px; border-radius: 4px; font-size: var(--dt-xs); background: #1a1a1a; color: var(--dt-color-muted); }
  .inspector-badge.mounted { background: #1a3028; color: var(--dt-color-success); }
  .inspector-section { margin-bottom: 16px; }
  .inspector-section-title { color: var(--dt-color-muted); font-size: var(--dt-xs); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .inspector-state-file { background: var(--dt-color-bg-alt); border: 1px solid #1a1a1a; border-radius: 6px; margin-bottom: 8px; overflow: hidden; }
  .inspector-state-name { padding: 6px 12px; color: var(--dt-color-success); border-bottom: 1px solid #1a1a1a; font-size: var(--dt-sm); }
  .inspector-state-row { display: flex; padding: 4px 12px; gap: 12px; color: var(--dt-color-muted); font-size: var(--dt-sm); }
  .inspector-state-key { min-width: 80px; color: var(--dt-color-muted); }
  .inspector-state-val { color: #4f8ef7; }
  .inspector-children { display: flex; flex-wrap: wrap; gap: 6px; }
  .inspector-child { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 4px; padding: 3px 8px; color: var(--dt-color-accent); cursor: pointer; font-size: var(--dt-sm); }
  .inspector-child:hover { border-color: #4f8ef7; }
 `;

export function toggleDevPanel() {
  if (wrapperEl) { wrapperEl.remove(); wrapperEl = null; return }
  const style = document.createElement('style'); style.textContent = panelStyles; document.head.appendChild(style)
  wrapperEl = document.createElement('div'); wrapperEl.id = 'engine-devtools-wrapper'
  const panel = document.createElement('div'); panel.id = 'engine-devtools'
  panel.innerHTML = `
    <div class="dt-drag-handle" id="dt-drag-handle"></div>
    <div class="dt-header"><span>⚡ ENGINE DEVTOOLS</span><button class="dt-close">✕</button></div>
    <div class="dt-tabs">
      <button class="dt-tab active" data-tab="state">State</button>
      <button class="dt-tab" data-tab="storage">Storage</button>
      <button class="dt-tab" data-tab="logs">Logs</button>
      <button class="dt-tab" data-tab="components">Components</button>
      <button class="dt-tab" data-tab="tests">Tests</button>
    </div>
    <div class="dt-body">
      <div class="dt-panel active" id="dt-state"></div>
      <div class="dt-panel" id="dt-storage"></div>
      <div class="dt-panel" id="dt-logs"></div>
      <div class="dt-panel" id="dt-components">
        <div class="dt-comp-header" id="dt-comp-tabs">
          <button class="dt-comp-tab active" data-subtab="map">Map</button>
          <button class="dt-comp-tab" data-subtab="tree">Tree</button>
          <button class="dt-comp-tab" data-subtab="inspector">Inspector</button>
          <button class="dt-comp-inspect-btn" id="dt-toggle-inspect">◎ Inspect</button>
        </div>
        <div class="dt-comp-body" id="dt-comp-body"></div>
      </div>
      <div class="dt-panel" id="dt-tests">
         <div id="coverage-root" class="dt-panel-title"></div>
         <div class="dt-recorder-bar">
            <span class="dt-panel-title">AUTO-RECORDER</span>
            <div style="display:flex; gap:8px; align-items:center">
              <span id="network-badge" style="font-size:var(--dt-xs); font-weight:900; color:#f0a030; opacity:0.35; transition:opacity 0.2s">🌐 0 calls</span>
              <button class="dt-record-btn" id="clear-snapshots-btn" style="background:#333; color:#aaa">CLEAR SNAPSHOTS</button>
              <button class="dt-record-btn" id="record-btn">RECORD</button>
            </div>
         </div>
         <div id="recorder-output" class="dt-scroll-box" style="display:none"><div style="color:var(--dt-color-muted); font-size:var(--dt-sm)">Perform actions on the page to generate code...</div></div>
         <div id="tests-tree" style="margin-top:20px"></div>
      </div>
    </div>
  `
  uiCache.stateContainer = panel.querySelector('#dt-state'); uiCache.logContainer = panel.querySelector('#dt-logs')
  uiCache.storageContainer = panel.querySelector('#dt-storage');
  uiCache.testContainer = panel.querySelector('#tests-tree'); uiCache.recorderOutput = panel.querySelector('#recorder-output')
  uiCache.coverageContainer = panel.querySelector('#coverage-root')
  uiCache.networkBadge = panel.querySelector('#network-badge')
  uiCache.componentsContainer = panel.querySelector('#dt-comp-body')

  const store = buildDevStore()
  if (uiCache.componentsContainer) {
    uiCache.componentsContainer.innerHTML = renderComponentsTab(store)
  }

  renderTestStructure(); syncStateUI(); syncStorageUI(); syncLogUI(); syncCoverageUI()
  wrapperEl.appendChild(panel); document.body.appendChild(wrapperEl)

  panel.querySelector('.dt-close')?.addEventListener('click', toggleDevPanel)
  
  // Auto-refresh storage tab
  window.addEventListener('engine:storage-updated', syncStorageUI)

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
      recordedSteps = []
      capturedNetworkCalls = []
      startNetworkSpy()
      recordBtn.classList.add('active')
      recordBtn.innerHTML = '<i></i> STOP RECORDING'
      uiCache.recorderOutput!.style.display = 'block'
      updateRecorderUI()
    } else {
      capturedNetworkCalls = stopNetworkSpy()
      updateRecorderUI()
      recordBtn.classList.remove('active')
      recordBtn.innerHTML = '<i></i> RECORD'
    }
  })
  panel.querySelectorAll('.dt-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!; panel.querySelectorAll('.dt-tab').forEach(t => t.classList.remove('active'))
      panel.querySelectorAll('.dt-panel').forEach(p => p.classList.remove('active')); tab.classList.add('active')
      panel.querySelector(`#dt-${activeTab}`)?.classList.add('active')
    })
  })

  // Components tab sub-tabs
  const compTabs = panel.querySelector('#dt-comp-tabs')
  const compBody = panel.querySelector('#dt-comp-body')
  compTabs?.querySelectorAll('.dt-comp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      compActiveTab = (tab as HTMLElement).dataset.subtab!
      compTabs.querySelectorAll('.dt-comp-tab').forEach(t => t.classList.remove('active'))
      tab.classList.add('active')
      const store = buildDevStore()
      if (compBody) compBody.innerHTML = renderComponentsTab(store)
      if (compActiveTab === 'tree' && compBody) {
        setTimeout(() => setupTreeHoverListeners(compBody as HTMLElement), 50)
      }
    })
  })

  const inspectBtn = compTabs?.querySelector('#dt-toggle-inspect') as HTMLElement | null
  inspectBtn?.addEventListener('click', () => {
    if (isInspecting()) {
      disableInspect()
      inspectBtn.textContent = '◎ Inspect'
      const store = buildDevStore()
      if (compBody) compBody.innerHTML = renderComponentsTab(store)
    } else {
      enableInspect((comp) => {
        compActiveTab = 'inspector'
        compTabs?.querySelectorAll('.dt-comp-tab').forEach(t => {
          t.classList.toggle('active', (t as HTMLElement).dataset.subtab === 'inspector')
        })
        const store = buildDevStore()
        if (compBody) compBody.innerHTML = renderComponentsTab(store, comp)
      })
      inspectBtn.textContent = '◎ Inspecting'
    }
  })
  uiCache.testContainer?.querySelectorAll('.dt-run-btn').forEach(btn => {
    btn.addEventListener('click', () => { play((btn as HTMLElement).dataset.suite!, undefined, { devToolsReporter: true }) })
  })

  // Drag by header
  const header = panel.querySelector('.dt-header') as HTMLElement

  let isDragging = false
  let isResizing = false
  let dragOffsetX = 0
  let dragOffsetY = 0
  let startX = 0
  let startY = 0
  let startWidth = 0
  let startHeight = 0
  let resizeDir = ''

  header?.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.dt-close')) return
    isDragging = true
    dragOffsetX = e.clientX - (wrapperEl?.offsetLeft ?? 0)
    dragOffsetY = e.clientY - (wrapperEl?.offsetTop ?? 0)
    document.body.style.userSelect = 'none'
  })

  panel.addEventListener('mousedown', (e) => {
    if ((e.target as HTMLElement).closest('.dt-header')) return
    
    const rect = panel.getBoundingClientRect()
    const edgeX = e.clientX - rect.left
    const edgeY = e.clientY - rect.top
    const w = rect.width
    const h = rect.height
    const edge = 20
    
    if (edgeX <= edge && edgeY <= edge) {
      isResizing = true
      resizeDir = 'nw'
    } else if (edgeX >= w - edge && edgeY <= edge) {
      isResizing = true
      resizeDir = 'ne'
    } else if (edgeX <= edge && edgeY >= h - edge) {
      isResizing = true
      resizeDir = 'sw'
    } else if (edgeX >= w - edge && edgeY >= h - edge) {
      isResizing = true
      resizeDir = 'se'
    } else if (edgeX <= edge) {
      isResizing = true
      resizeDir = 'w'
    } else if (edgeX >= w - edge) {
      isResizing = true
      resizeDir = 'e'
    } else if (edgeY <= edge) {
      isResizing = true
      resizeDir = 'n'
    } else if (edgeY >= h - edge) {
      isResizing = true
      resizeDir = 's'
    } else {
      return
    }
    
    startX = e.clientX
    startY = e.clientY
    startWidth = panel.offsetWidth
    startHeight = panel.offsetHeight
    panel.style.left = `${wrapperEl?.offsetLeft ?? 0}px`
    panel.style.top = `${wrapperEl?.offsetTop ?? 0}px`
    document.body.style.userSelect = 'none'
  })

  document.addEventListener('mousemove', (e) => {
    if (isDragging && wrapperEl) {
      wrapperEl.style.left = `${e.clientX - dragOffsetX}px`
      wrapperEl.style.top = `${e.clientY - dragOffsetY}px`
    }
    if (isResizing && panel && wrapperEl) {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      let newWidth = startWidth
      let newHeight = startHeight
      let newLeft = wrapperEl.offsetLeft
      let newTop = wrapperEl.offsetTop
      
      if (resizeDir.includes('e')) {
        newWidth = Math.max(320, startWidth + dx)
      }
      if (resizeDir.includes('w')) {
        newWidth = Math.max(320, startWidth - dx)
        newLeft = (wrapperEl.offsetLeft + startWidth - newWidth)
      }
      if (resizeDir.includes('s')) {
        newHeight = Math.max(300, startHeight + dy)
      }
      if (resizeDir.includes('n')) {
        newHeight = Math.max(300, startHeight - dy)
        newTop = (wrapperEl.offsetTop + startHeight - newHeight)
      }
      
      panel.style.width = `${newWidth}px`
      panel.style.height = `${newHeight}px`
      wrapperEl.style.left = `${newLeft}px`
      wrapperEl.style.top = `${newTop}px`
    }
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    isResizing = false
    document.body.style.userSelect = ''
  })
}

function syncStorageUI() {
  if (!uiCache.storageContainer) return
  const persistedKeys = getPersistedKeys()
  const storageRows: string[] = []

  persistedKeys.forEach(key => {
    const raw  = localStorage.getItem(`engine:${key}`)
    if (!raw) return
    const entry: PersistEntry = JSON.parse(raw)

    storageRows.push(
      `<div class="dt-file-header">${key}</div>`
    )

    Object.entries(entry.value).forEach(([k, v]) => {
      const display = JSON.stringify(v)
      const short   = display.length > 40
        ? display.slice(0, 40) + '…'
        : display

      storageRows.push(
        `<div class="dt-row">` +
        `<span class="dt-key">${k}</span>` +
        `<span class="dt-val">${short}</span>` +
        `</div>`
      )
    })

    // show age
    const age = Math.floor((Date.now() - entry.timestamp) / 1000)
    storageRows.push(
      `<div class="dt-row">` +
      `<span class="dt-key dt-meta">saved ${age}s ago</span>` +
      `<button class="dt-clear" data-key="${key}" style="background:#222; border:none; color:#ff5f56; font-size:9px; padding:2px 6px; border-radius:3px; cursor:pointer; margin-left:10px;">Clear</button>` +
      `</div>`
    )
  })

  const header = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 15px">
      <span style="font-size:10px; font-weight:800; color:#555">PERSISTED DATA</span>
      <button id="clear-all-storage" style="background:#ff5f56; color:#111; font-size:9px; font-weight:900; padding:4px 10px; border:none; border-radius:4px; cursor:pointer">RESET ALL</button>
    </div>
  `

  uiCache.storageContainer.innerHTML = header + (storageRows.join('') || '<div class="dt-empty">Nothing persisted yet</div>')

  uiCache.storageContainer.querySelector('#clear-all-storage')?.addEventListener('click', () => {
    if (confirm('Clear all persisted storage and reload?')) {
      clearAllPersisted()
      window.location.reload()
    }
  })

  uiCache.storageContainer.querySelectorAll('.dt-clear').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = (btn as HTMLElement).dataset.key!
      clearPersisted(key)
      syncStorageUI()
    })
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

function buildDevStore() {
  const staticTree = (window as any).__engineStaticTree

  const components: any[] = (staticTree?.components ?? [])
    .map((comp: any) => {
      const reads: string[] = []
      componentRegistry.forEach((comps, stateFile) => {
        if (comps.has(comp.name)) reads.push(stateFile)
      })

      const stateValues: Record<string, Record<string, any>> = {}
      reads.forEach(file => {
        const mod = stateModules.get(file)
        if (!mod) return
        stateValues[file] = {}
        Object.keys(mod).forEach(k => {
          if (typeof mod[k] !== 'function') {
            stateValues[file][k] = mod[k]
          }
        })
      })

      return {
        name:        comp.name,
        file:        comp.file,
        renders:     comp.renders,
        renderedBy:  comp.renderedBy,
        reads,
        mounted:     instances.has(comp.name),
        stateValues
      }
    })

  const state: any[] = []
  stateModules.forEach((mod, file) => {
    const shortName = file.split('/').pop()?.replace('.state.ts', '') ?? file
    const usedBy: string[] = []

    componentRegistry.get(file)?.forEach(comp => {
      if (!usedBy.includes(comp)) usedBy.push(comp)
    })

    const exports = Object.keys(mod).map(name => ({
      name,
      value:      typeof mod[name] === 'function' ? null : mod[name],
      isFunction: typeof mod[name] === 'function'
    }))

    state.push({ file, shortName, exports, usedBy })
  })

  return { components, state }
}

function renderComponentsTab(store: any, selected?: string): string {
  switch (compActiveTab) {
    case 'map':       return renderMap(store, { onHover: () => {} })
    case 'tree':      return renderTree(store, {})
    case 'inspector': return renderInspector(store, selected)
    default:          return ''
  }
}

function highlightTreeItem(name: string, type: 'component' | 'state', store: any) {
  document.querySelectorAll('.tree-item.highlighted, .tree-item.dimmed, .state-group.highlighted, .state-group.dimmed').forEach(el => {
    el.classList.remove('highlighted', 'dimmed')
  })
  if (!name || !store) return
  
  if (type === 'component') {
    const comp = store.components.find((c: any) => c.name === name)
    if (!comp) return
    document.querySelectorAll('.tree-item[data-component]').forEach(el => {
      const n = (el as HTMLElement).dataset.component!
      el.classList.toggle('dimmed', n !== name)
    })
    comp.reads.forEach((stateFile: string) => {
      const stateEl = document.querySelector(`.state-group[data-state="${stateFile}"]`)
      if (stateEl) stateEl.classList.add('highlighted')
    })
  } else {
    const state = store.state.find((s: any) => s.file === name)
    if (!state) return
    document.querySelectorAll('.state-group[data-state]').forEach(el => {
      const f = (el as HTMLElement).dataset.state!
      el.classList.toggle('dimmed', f !== name)
    })
    state.usedBy.forEach((compName: string) => {
      const compEl = document.querySelector(`.tree-item[data-component="${compName}"]`)
      if (compEl) compEl.classList.add('highlighted')
    })
  }
}

function setupTreeHoverListeners(container: HTMLElement) {
  const store = buildDevStore()
  container.querySelectorAll('.tree-item[data-component]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const name = (el as HTMLElement).dataset.component!
      highlightTreeItem(name, 'component', store)
    })
    el.addEventListener('mouseleave', () => {
      highlightTreeItem('', 'component', store)
    })
  })
  container.querySelectorAll('.state-group[data-state]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const file = (el as HTMLElement).dataset.state!
      highlightTreeItem(file, 'state', store)
    })
    el.addEventListener('mouseleave', () => {
      highlightTreeItem('', 'state', store)
    })
  })
}

// @ts-ignore
if (import.meta.env.DEV) {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') toggleDevPanel()
  })
}

