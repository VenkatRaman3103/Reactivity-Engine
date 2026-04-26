import { instances }         from './component'

// In a typical dev env, importing signalCache exposes internal structure
import { getSignalCache }    from './state'
import { getLogChannels }   from './log'

// @ts-ignore - env provided by Vite
const isDev = import.meta.env.DEV

// registry of all state modules
const stateRegistry = new Map<string, Record<string, any>>()

// history of state changes for time travel
interface StateChange {
  file:      string
  key:       string
  oldValue:  any
  newValue:  any
  timestamp: number
}

const history: StateChange[] = []
const MAX_HISTORY = 50

export function registerStateFile(
  file: string,
  mod:  Record<string, any>
) {
  if (!isDev) return
  stateRegistry.set(file, mod)
}

export function recordStateChange(
  file:     string,
  key:      string,
  oldValue: any,
  newValue: any
) {
  if (!isDev) return

  history.push({
    file,
    key,
    oldValue,
    newValue,
    timestamp: Date.now()
  })

  // keep history bounded
  if (history.length > MAX_HISTORY) history.shift()

  // refresh panel if open
  if (typeof wrapperEl !== 'undefined' && wrapperEl) renderPanel()
}

// window API
export function initDevTools() {
  if (!isDev) return

  ;(window as any).__engine = {

    // inspect all state
    state() {
      const result: Record<string, any> = {}
      stateRegistry.forEach((mod, file) => {
        result[file] = {}
        Object.keys(mod).forEach(k => {
          if (typeof mod[k] !== 'function') {
            result[file][k] = mod[k]
          }
        })
      })
      console.table(result)
      return result
    },

    // inspect one state file
    inspect(file: string) {
      const mod = stateRegistry.get(file)
      if (!mod) {
        console.warn(`[Engine DevTools] No state file found: ${file}`)
        console.log('Available files:', [...stateRegistry.keys()])
        return
      }
      const result: Record<string, any> = {}
      Object.keys(mod).forEach(k => {
        if (typeof mod[k] !== 'function') result[k] = mod[k]
      })
      console.table(result)
      return result
    },

    // show all mounted components
    components() {
      const result: string[] = []
      instances.forEach((_, id) => result.push(id))
      console.log('[Engine DevTools] Mounted components:', result)
      return result
    },

    // show subscription map
    subscriptions() {
      const result: Record<string, string> = {}
      const curCache = getSignalCache()
      curCache.forEach((signals, file) => {
        let count = 0;
        signals.forEach(s => count += (s as any).subscribers?.size || 0);
        result[file] = count + ' active signals listeners'
      })
      console.table(result)
      return result
    },

    // show state change history
    history() {
      console.table(
        history.map(h => ({
          time:  new Date(h.timestamp).toISOString(),
          file:  h.file,
          key:   h.key,
          from:  JSON.stringify(h.oldValue),
          to:    JSON.stringify(h.newValue)
        }))
      )
      return history
    },

    refreshLogPanel() {
      if (wrapperEl) renderPanel()
    },

    registerLogChannel() {
      if (wrapperEl) renderPanel()
    }
  }

  console.info(
    '%c[Engine DevTools]%c ready\n' +
    '  __engine.state()          inspect all state\n' +
    '  __engine.inspect(file)    inspect one file\n' +
    '  __engine.components()     mounted components\n' +
    '  __engine.subscriptions()  subscription map\n' +
    '  __engine.history()        state change history\n' +
    '  Ctrl+Shift+E              toggle visual panel',
    'color: #7ec8e3; font-weight: bold',
    'color: inherit'
  )
}

// visual panel styles
const panelStyles = `
  #engine-devtools-wrapper {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99998;
    font-family: system-ui, -apple-system, sans-serif;
    color: #efefef;
    pointer-events: none;
  }
  
  #engine-devtools-wrapper * {
    box-sizing: border-box;
  }

  #engine-devtools {
    pointer-events: auto;
    background: #121212;
    border-radius: 16px;
    width: 450px;
    max-height: 60vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .dt-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    background: #0a0a0a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .dt-header span {
    font-size: 14px;
    font-weight: 600;
    color: #efefef;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dt-close {
    background: rgba(255, 255, 255, 0.05);
    border: none;
    color: #aaa;
    border-radius: 8px;
    width: 28px;
    height: 28px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dt-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .dt-tabs {
    display: flex;
    background: #0a0a0a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0 10px;
  }

  .dt-tab {
    background: transparent;
    border: none;
    padding: 12px 16px;
    color: #888;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
  }

  .dt-tab:hover {
    color: #bbb;
  }

  .dt-tab.active {
    color: #7ec8e3;
    border-bottom-color: #7ec8e3;
  }

  .dt-body {
    flex: 1;
    overflow-y: auto;
    background: #121212;
    position: relative;
    min-height: 200px;
  }

  .dt-body::-webkit-scrollbar {
    width: 6px;
  }
  .dt-body::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }

  .dt-panel {
    display: none;
    padding: 16px;
  }

  .dt-panel.active {
    display: block;
  }

  .dt-file {
    font-size: 11px;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    margin: 16px 0 8px 0;
  }
  
  .dt-file:first-child {
    margin-top: 0;
  }

  .dt-row {
    display: flex;
    align-items: flex-start;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 8px;
    margin-bottom: 4px;
    border: 1px solid rgba(255, 255, 255, 0.02);
    font-family: inherit;
    font-size: 13px;
    word-break: break-all;
  }

  .dt-key {
    color: #7ec8e3;
    font-weight: 600;
    min-width: 100px;
    margin-right: 12px;
  }

  .dt-val {
    color: #efefef;
    font-family: monospace;
    font-size: 12px;
    flex: 1;
  }

  .dt-empty {
    padding: 30px;
    text-align: center;
    color: #666;
    font-size: 13px;
    font-weight: 500;
  }
`;

// visual panel
let wrapperEl: HTMLElement | null = null
let styleEl:   HTMLStyleElement | null = null

export function toggleDevPanel() {
  if (!isDev) return
  if (wrapperEl) {
    wrapperEl.remove()
    wrapperEl = null
    return
  }
  renderPanel()
}

function renderPanel() {
  if (wrapperEl) wrapperEl.remove()

  if (!styleEl) {
    styleEl = document.createElement('style')
    styleEl.textContent = panelStyles
    document.head.appendChild(styleEl)
  }

  wrapperEl    = document.createElement('div')
  wrapperEl.id = 'engine-devtools-wrapper'

  const panelEl = document.createElement('div')
  panelEl.id    = 'engine-devtools'

  // state section
  const stateRows: string[] = []
  stateRegistry.forEach((mod, file) => {
    stateRows.push(
      `<div class="dt-file">${file.split('/').pop()}</div>`
    )
    Object.keys(mod).forEach(k => {
      if (typeof mod[k] === 'function') return
      const raw     = JSON.stringify(mod[k])
      const display = raw && raw.length > 40
        ? raw.slice(0, 40) + '…'
        : raw
      stateRows.push(
        `<div class="dt-row">` +
        `<span class="dt-key">${k}</span>` +
        `<span class="dt-val">${display}</span>` +
        `</div>`
      )
    })
  })

  // component section
  const compRows: string[] = []
  instances.forEach((_, id) => {
    compRows.push(
      `<div class="dt-row"><span class="dt-key">${id}</span></div>`
    )
  })

  // subscription section
  const subRows: string[] = []
  getSignalCache().forEach((signals, file) => {
    let subCount = 0;
    signals.forEach(s => subCount += (s as any).subscribers?.size || 0);
    subRows.push(
      `<div class="dt-row">` +
      `<span class="dt-key">${file.split('/').pop()}</span>` +
      `<span class="dt-val">${subCount} granular listeners</span>` +
      `</div>`
    )
  })

  // history section
  const histRows = history
    .slice(-10)
    .reverse()
    .map(h =>
      `<div class="dt-row">` +
      `<span class="dt-key">${h.key}</span>` +
      `<span class="dt-val">${JSON.stringify(h.oldValue)} → ${JSON.stringify(h.newValue)}</span>` +
      `</div>`
    )

  // log section
  const logRows: string[] = []
  getLogChannels().forEach((entries, name) => {
    logRows.push(
      `<div class="dt-file">${name} (${entries.length})</div>`
    )
    entries.slice(-5).reverse().forEach(entry => {
      logRows.push(
        `<div class="dt-row">` +
        `<span class="dt-key">${entry.time}</span>` +
        `<span class="dt-val">${JSON.stringify(entry.value)}</span>` +
        `</div>`
      )
    })
  })

  panelEl.innerHTML = `
    <div class="dt-header">
      <span>⚡ Engine DevTools</span>
      <button class="dt-close">✕</button>
    </div>
    <div class="dt-tabs">
      <button class="dt-tab active" data-tab="state">State</button>
      <button class="dt-tab" data-tab="components">Components</button>
      <button class="dt-tab" data-tab="subscriptions">Subscriptions</button>
      <button class="dt-tab" data-tab="history">History</button>
      <button class="dt-tab" data-tab="logs">Logs</button>
    </div>
    <div class="dt-body">
      <div class="dt-panel active" id="dt-state">
        ${stateRows.join('') || '<div class="dt-empty">No state registered</div>'}
      </div>
      <div class="dt-panel" id="dt-components">
        ${compRows.join('') || '<div class="dt-empty">No components mounted</div>'}
      </div>
      <div class="dt-panel" id="dt-subscriptions">
        ${subRows.join('') || '<div class="dt-empty">No subscriptions</div>'}
      </div>
      <div class="dt-panel" id="dt-history">
        ${histRows.join('') || '<div class="dt-empty">No state changes yet</div>'}
      </div>
      <div class="dt-panel" id="dt-logs">
        ${logRows.join('') || '<div class="dt-empty">No logs yet</div>'}
      </div>
    </div>
  `

  wrapperEl.appendChild(panelEl)
  document.body.appendChild(wrapperEl)

  // close button
  panelEl
    .querySelector('.dt-close')
    ?.addEventListener('click', () => {
      wrapperEl?.remove()
      wrapperEl = null
    })

  // tabs
  panelEl
    .querySelectorAll('.dt-tab')
    .forEach(tab => {
      tab.addEventListener('click', () => {
        const target = (tab as HTMLElement).dataset.tab!

        panelEl!.querySelectorAll('.dt-tab')
          .forEach(t => t.classList.remove('active'))
        panelEl!.querySelectorAll('.dt-panel')
          .forEach(p => p.classList.remove('active'))

        tab.classList.add('active')
        panelEl!.querySelector(`#dt-${target}`)
          ?.classList.add('active')
      })
    })
}

// keyboard shortcut ctrl+shift+e
// @ts-ignore - env provided by Vite
if (import.meta.env.DEV) {
  window.addEventListener('keydown', e => {
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      toggleDevPanel()
    }
  })
}
