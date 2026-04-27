// src/devtools/views/Tree.ts

export function renderTree(store: any, opts: any): string {
  const allComps  = store.components
  const roots     = allComps.filter((c: any) => c.renderedBy.length === 0)

  const leftHTML  = renderComponentTree(roots, allComps, 0)
  const rightHTML = renderStateTree(store.state)

  setTimeout(() => opts.onHover?.(), 0)

  return `
    <div class="tree-view">
      <div class="tree-panel">
        <div class="tree-panel-header">Components</div>
        <div class="tree-panel-body">
          ${leftHTML || '<div style="color:#444;padding:16px;font-size:11px">No components found</div>'}
        </div>
      </div>
      <div class="tree-divider"></div>
      <div class="tree-panel">
        <div class="tree-panel-header">State</div>
        <div class="tree-panel-body">
          ${rightHTML || '<div style="color:#444;padding:16px;font-size:11px">No state files found</div>'}
        </div>
      </div>
    </div>
  `
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
