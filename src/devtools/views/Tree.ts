// src/devtools/views/Tree.ts

let hoveredItem: string | null = null
let hoveredType: 'component' | 'state' | null = null
let _store: any = null
let _onHighlight: ((name: string, type: 'component' | 'state') => void) | null = null

export function renderTree(store: any, opts: any): string {
  _store = store
  _onHighlight = opts.onHighlight ?? null
  
  const allComps  = store.components
  const roots     = allComps.filter((c: any) => c.renderedBy.length === 0)

  const leftHTML  = renderComponentTree(roots, allComps, 0)
  const rightHTML = renderStateTree(store.state)

  return `
    <div class="tree-view">
      <div class="tree-panel">
        <div class="tree-panel-header">Components</div>
        <div class="tree-panel-body" id="tree-comps-body">
          ${leftHTML || '<div class="dt-empty">No components found</div>'}
        </div>
      </div>
      <div class="tree-divider"></div>
      <div class="tree-panel">
        <div class="tree-panel-header">State</div>
        <div class="tree-panel-body" id="tree-state-body">
          ${rightHTML || '<div class="dt-empty">No state files found</div>'}
        </div>
      </div>
    </div>
  `
}

export function setupTreeHover(onHighlight: (name: string, type: 'component' | 'state') => void) {
  _onHighlight = onHighlight
  
  document.querySelectorAll('.tree-item[data-component]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const name = (el as HTMLElement).dataset.component!
      hoveredItem = name
      hoveredType = 'component'
      onHighlight(name, 'component')
    })
    el.addEventListener('mouseleave', () => {
      hoveredItem = null
      hoveredType = null
      clearHighlights()
    })
  })

  document.querySelectorAll('.state-group[data-state]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      const file = (el as HTMLElement).dataset.state!
      hoveredItem = file
      hoveredType = 'state'
      onHighlight(file, 'state')
    })
    el.addEventListener('mouseleave', () => {
      hoveredItem = null
      hoveredType = null
      clearHighlights()
    })
  })
}

function clearHighlights() {
  document.querySelectorAll('.tree-item.highlighted, .tree-item.dimmed, .state-group.highlighted, .state-group.dimmed').forEach(el => {
    el.classList.remove('highlighted', 'dimmed')
  })
}

export function highlightTreeConnections(name: string, type: 'component' | 'state') {
  if (!_store) return
  
  clearHighlights()
  
  if (type === 'component') {
    const comp = _store.components.find((c: any) => c.name === name)
    if (!comp) return
    
    // dim all components except the hovered one
    document.querySelectorAll('.tree-item[data-component]').forEach(el => {
      const n = (el as HTMLElement).dataset.component!
      el.classList.toggle('dimmed', n !== name)
    })
    
    // highlight all state files that this component reads
    comp.reads.forEach((stateFile: string) => {
      const stateEl = document.querySelector(`.state-group[data-state="${stateFile}"]`)
      if (stateEl) stateEl.classList.add('highlighted')
    })
  } else {
    const state = _store.state.find((s: any) => s.file === name)
    if (!state) return
    
    // dim all state except the hovered one
    document.querySelectorAll('.state-group[data-state]').forEach(el => {
      const f = (el as HTMLElement).dataset.state!
      el.classList.toggle('dimmed', f !== name)
    })
    
    // highlight all components that read this state
    state.usedBy.forEach((compName: string) => {
      const compEl = document.querySelector(`.tree-item[data-component="${compName}"]`)
      if (compEl) compEl.classList.add('highlighted')
    })
  }
}

function buildTree(components: any[]): any[] {
  // find root components — not rendered by anyone
  const roots = components.filter(c => c.renderedBy.length === 0)
  return roots
}

function renderComponentTree(
  nodes:    any[],
  allComps: any[],
  depth:    number
): string {
  return nodes.map(comp => {
    const indent   = depth * 16
    // Find children of this comp among ALL components
    const children = allComps.filter(c => c.renderedBy.includes(comp.name))

    return `
      <div class="tree-item" style="padding-left: ${indent + 14}px"
        data-component="${comp.name}">
        <span class="tree-item-icon">⬡</span>
        <span class="tree-item-name">${comp.name}</span>
        <span class="tree-item-file">${comp.file.split('/').pop()}</span>
        ${comp.mounted
          ? '<span class="tree-item-dot mounted"></span>'
          : '<span class="tree-item-dot"></span>'
        }
      </div>
      ${children.length > 0
        ? renderComponentTree(children, allComps, depth + 1)
        : ''
      }
    `
  }).join('')
}

function renderStateTree(state: any[]): string {
  return state.map(s => `
    <div class="state-group" data-state="${s.file}">
      <div class="state-group-header">
        <span class="tree-item-icon state">◈</span>
        <span class="tree-item-name">${s.shortName}</span>
        <span class="tree-item-file">${s.file.split('/').pop()}</span>
      </div>
      <div class="state-group-exports">
        ${s.exports.map((exp: any) => `
          <div class="state-export">
            <span class="export-name">${exp.name}</span>
            ${exp.isFunction
              ? '<span class="export-type fn">fn</span>'
              : `<span class="export-value">
                   ${formatValue(exp.value)}
                 </span>`
            }
          </div>
        `).join('')}
      </div>
    </div>
  `).join('')
}

function formatValue(value: any): string {
  if (value === null)      return 'null'
  if (value === undefined) return 'undefined'
  if (Array.isArray(value)) return `[${value.length}]`
  if (typeof value === 'object') return '{...}'
  const str = String(value)
  return str.length > 20 ? str.slice(0, 20) + '…' : str
}
