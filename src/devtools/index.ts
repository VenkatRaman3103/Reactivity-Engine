// src/devtools/index.ts
// the floating window shell + bottom right button

import { renderMap }       from './views/Map'
import { renderTree }      from './views/Tree'
import { renderInspector,
         enableInspect,
         disableInspect,
         isInspecting }    from './views/Inspector'
import { buildDevStore }   from './store'
import { injectStyles }    from './styles'

let windowEl:   HTMLElement | null = null
let activeTab   = 'map'
let isDragging  = false
let dragOffsetX = 0
let dragOffsetY = 0
let winX        = 40
let winY        = 40

export function initDevTools() {
  if (!import.meta.env.DEV) return

  injectStyles()
  createLauncherButton()

  // listen for HMR tree updates — refresh if window is open
  if (import.meta.hot) {
    import.meta.hot.on('engine:tree-update', () => {
      if (windowEl) refreshWindow()
    })
  }
}

// ─── Launcher button ──────────────────────────────────

function createLauncherButton() {
  const launcher = document.createElement('div')
  launcher.id    = 'engine-launcher'

  launcher.innerHTML = `
    <div class="launcher-menu" id="engine-launcher-menu">
      <button class="launcher-item" id="engine-open-devtools">
        ⚡ DevTools
      </button>
      <button class="launcher-item" id="engine-open-components">
        🔗 Components
      </button>
    </div>
    <button class="launcher-btn" id="engine-launcher-btn">
      ◈
    </button>
  `

  document.body.appendChild(launcher)

  // toggle menu on hover
  const btn  = launcher.querySelector('#engine-launcher-btn')!
  const menu = launcher.querySelector('#engine-launcher-menu')!

  launcher.addEventListener('mouseenter', () => {
    menu.classList.add('visible')
  })
  launcher.addEventListener('mouseleave', () => {
    menu.classList.remove('visible')
  })

  // open existing devtools panel
  launcher
    .querySelector('#engine-open-devtools')
    ?.addEventListener('click', () => {
      // existing Ctrl+Shift+E panel
      ;(window as any).__engine?.togglePanel?.()
    })

  // open component window
  launcher
    .querySelector('#engine-open-components')
    ?.addEventListener('click', () => {
      toggleWindow()
    })
}

// ─── Floating window ──────────────────────────────────

function toggleWindow() {
  if (windowEl) {
    windowEl.remove()
    windowEl = null
    return
  }
  createWindow()
}

function createWindow() {
  windowEl     = document.createElement('div')
  windowEl.id  = 'engine-comp-window'

  Object.assign(windowEl.style, {
    left: `${winX}px`,
    top:  `${winY}px`
  })

  renderWindow()
  document.body.appendChild(windowEl)
  makeDraggable(windowEl)
}

function renderWindow() {
  if (!windowEl) return

  const store = buildDevStore()

  windowEl.innerHTML = `
    <div class="cw-container">
      <div class="cw-sidebar">
        <button class="cw-tab ${activeTab === 'map'      ? 'active' : ''}"
          data-tab="map" title="Map">◈</button>
        <button class="cw-tab ${activeTab === 'tree'     ? 'active' : ''}"
          data-tab="tree" title="Tree">⬡</button>
        <button class="cw-tab ${activeTab === 'inspector'? 'active' : ''}"
          data-tab="inspector" title="Inspector">🔍</button>
      </div>
      <div class="cw-content">
        <div class="cw-header" id="cw-drag-handle">
          <div class="cw-header-actions">
            ${activeTab === 'inspector'
              ? `<button class="cw-inspect-btn ${isInspecting() ? 'active' : ''}"
                   id="cw-toggle-inspect">
                   ${isInspecting() ? '◎ Inspecting' : '◎ Inspect'}
                 </button>`
              : ''
            }
            <button class="cw-close" id="cw-close">✕</button>
          </div>
        </div>
        <div class="cw-body" id="cw-body">
          ${renderTabContent(store)}
        </div>
      </div>
    </div>
  `

  // tab switching
  windowEl.querySelectorAll('.cw-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = (tab as HTMLElement).dataset.tab!
      refreshWindow()
    })
  })

  // close
  windowEl
    .querySelector('#cw-close')
    ?.addEventListener('click', () => {
      windowEl?.remove()
      windowEl = null
      disableInspect()
    })

  // inspect toggle
  windowEl
    .querySelector('#cw-toggle-inspect')
    ?.addEventListener('click', () => {
      if (isInspecting()) {
        disableInspect()
      } else {
        enableInspect((comp) => {
          activeTab = 'inspector'
          refreshWindow(comp)
        }, () => {
          refreshWindow()
        })
      }
      refreshWindow()
    })
}

function refreshWindow(selectedComponent?: string) {
  if (!windowEl) return
  const store = buildDevStore()
  const body  = windowEl.querySelector('#cw-body')
  if (body) {
    body.innerHTML = renderTabContent(store, selectedComponent)
  }

  // re-render header to update inspect button state
  const tabs = windowEl.querySelector('.cw-header')
  if (tabs) {
    const inspectBtn = windowEl.querySelector('#cw-toggle-inspect')
    if (inspectBtn) {
      inspectBtn.textContent = isInspecting() ? '◎ Inspecting' : '◎ Inspect'
      inspectBtn.classList.toggle('active', isInspecting())
    }
  }
}

function renderTabContent(store: any, selected?: string): string {
  switch (activeTab) {
    case 'map':       return renderMap(store, { onHover: setupHoverListeners })
    case 'tree':      return renderTree(store, { onHover: setupHoverListeners })
    case 'inspector': return renderInspector(store, selected)
    default:          return ''
  }
}

// ─── Hover connections ────────────────────────────────

function setupHoverListeners() {
  if (!windowEl) return

  // component hover → highlight connected state
  windowEl.querySelectorAll('[data-component]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const name = (el as HTMLElement).dataset.component!
      highlightConnections(name, 'component')
    })
    el.addEventListener('mouseleave', clearHighlights)
  })

  // state hover → highlight connected components
  windowEl.querySelectorAll('[data-state]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const file = (el as HTMLElement).dataset.state!
      highlightConnections(file, 'state')
    })
    el.addEventListener('mouseleave', clearHighlights)
  })
}

function highlightConnections(name: string, type: 'component' | 'state') {
  if (!windowEl) return
  const store = buildDevStore()

  // find connections
  let connected: string[] = []

  if (type === 'component') {
    const comp = store.components.find(c => c.name === name)
    connected  = comp?.reads ?? []

    // highlight connected state nodes
    windowEl.querySelectorAll('[data-state]').forEach(el => {
      const file = (el as HTMLElement).dataset.state!
      el.classList.toggle('highlighted', connected.includes(file))
    })

    // dim unconnected
    windowEl.querySelectorAll('[data-component]').forEach(el => {
      const n = (el as HTMLElement).dataset.component!
      el.classList.toggle('dimmed', n !== name)
    })

  } else {
    const state = store.state.find(s => s.file === name)
    connected   = state?.usedBy ?? []

    // highlight connected component nodes
    windowEl.querySelectorAll('[data-component]').forEach(el => {
      const n = (el as HTMLElement).dataset.component!
      el.classList.toggle('highlighted', connected.includes(n))
    })

    // dim unconnected state
    windowEl.querySelectorAll('[data-state]').forEach(el => {
      const file = (el as HTMLElement).dataset.state!
      el.classList.toggle('dimmed', file !== name)
    })
  }
}

function clearHighlights() {
  if (!windowEl) return
  windowEl.querySelectorAll('.highlighted, .dimmed').forEach(el => {
    el.classList.remove('highlighted', 'dimmed')
  })
}

// ─── Draggable ────────────────────────────────────────

function makeDraggable(el: HTMLElement) {
  const handle = el.querySelector('#cw-drag-handle') as HTMLElement
  if (!handle) return

  handle.addEventListener('mousedown', (e) => {
    isDragging  = true
    dragOffsetX = e.clientX - el.offsetLeft
    dragOffsetY = e.clientY - el.offsetTop
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    winX = e.clientX - dragOffsetX
    winY = e.clientY - dragOffsetY
    el.style.left = `${winX}px`
    el.style.top  = `${winY}px`
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
  })
}
