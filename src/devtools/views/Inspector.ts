// src/devtools/views/Inspector.ts

let _isInspecting  = false
let _onSelect: ((name: string) => void) | null = null
let _onDisable: (() => void) | null = null
let _selectedComp: string | null = null

export function isInspecting() { return _isInspecting }

export function enableInspect(onSelect: (name: string) => void, onDisable?: () => void) {
  _isInspecting = true
  _onSelect     = onSelect
  _onDisable    = onDisable ?? null
  document.body.style.cursor = 'crosshair'

  document.addEventListener('click', handleInspectClick, true)
  document.addEventListener('mouseover', handleInspectHover, true)
}

export function disableInspect() {
  _isInspecting = false
  _onSelect     = null
  _onDisable?.()
  _onDisable    = null
  document.body.style.cursor = ''

  document.removeEventListener('click', handleInspectClick, true)
  document.removeEventListener('mouseover', handleInspectHover, true)
  removeInspectHighlight()
}

function handleInspectClick(e: MouseEvent) {
  if (!_isInspecting) return

  // do not intercept clicks on the devtools window
  const target = e.target as HTMLElement
  if (target.closest('#engine-devtools-wrapper')) return
  if (target.closest('#engine-launcher'))    return

  e.preventDefault()
  e.stopPropagation()

  // find which component owns this element
  const comp = findComponentForElement(target)
  if (comp) {
    _selectedComp = comp
    _onSelect?.(comp)
    disableInspect()
  }
}

function handleInspectHover(e: MouseEvent) {
  if (!_isInspecting) return

  const target = e.target as HTMLElement
  if (target.closest('#engine-devtools-wrapper')) return
  if (target.closest('#engine-launcher'))    return

  removeInspectHighlight()

  // highlight the hovered element
  target.style.outline      = '2px solid #4f8ef7'
  target.style.outlineOffset = '2px'
  target.dataset.engineHighlight = 'true'
}

function removeInspectHighlight() {
  document.querySelectorAll('[data-engine-highlight]').forEach(el => {
    ;(el as HTMLElement).style.outline      = ''
    ;(el as HTMLElement).style.outlineOffset = ''
    delete (el as HTMLElement).dataset.engineHighlight
  })
}

function findComponentForElement(el: HTMLElement): string | null {
  // walk up the DOM looking for data-component attribute
  // components set this during render
  let current: HTMLElement | null = el
  while (current) {
    if (current.dataset.engineComponent) {
      return current.dataset.engineComponent
    }
    current = current.parentElement
  }
  return null
}

export function renderInspector(store: any, selected?: string): string {
  const comp = selected
    ? store.components.find((c: any) => c.name === selected)
    : null

  if (!comp) {
    return `
      <div class="inspector-empty">
        <p>Click ◎ Inspect then click any component on the page</p>
      </div>
    `
  }

  return `
    <div class="inspector-view">

      <div class="inspector-header">
        <span class="inspector-name">⬡ ${comp.name}</span>
        <span class="inspector-file">${comp.file}</span>
        ${comp.mounted
          ? '<span class="inspector-badge mounted">mounted</span>'
          : '<span class="inspector-badge">not mounted</span>'
        }
      </div>

      ${comp.reads.length > 0 ? `
        <div class="inspector-section">
          <div class="inspector-section-title">Reads state from</div>
          ${comp.reads.map((file: string) => {
            const stateData = store.state.find((s: any) => s.file === file)
            const values    = comp.stateValues[file] ?? {}
            return `
              <div class="inspector-state-file">
                <div class="inspector-state-name">◈ ${file.split('/').pop()}</div>
                ${stateData?.exports
                  .filter((e: any) => !e.isFunction)
                  .map((e: any) => `
                    <div class="inspector-state-row">
                      <span class="inspector-state-key">${e.name}</span>
                      <span class="inspector-state-val">
                        ${formatInspectorValue(values[e.name])}
                      </span>
                    </div>
                  `).join('') ?? ''
                }
              </div>
            `
          }).join('')}
        </div>
      ` : ''}

      ${comp.renders.length > 0 ? `
        <div class="inspector-section">
          <div class="inspector-section-title">Renders</div>
          <div class="inspector-children">
            ${comp.renders.map((name: string) => `
              <span class="inspector-child" data-component="${name}">
                ⬡ ${name}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${comp.renderedBy.length > 0 ? `
        <div class="inspector-section">
          <div class="inspector-section-title">Rendered by</div>
          <div class="inspector-children">
            ${comp.renderedBy.map((name: string) => `
              <span class="inspector-child" data-component="${name}">
                ⬡ ${name}
              </span>
            `).join('')}
          </div>
        </div>
      ` : ''}

    </div>
  `
}

function formatInspectorValue(value: any): string {
  if (value === null)       return 'null'
  if (value === undefined)  return 'undefined'
  if (Array.isArray(value)) return `Array(${value.length})`
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    return `{${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '…' : ''}}`
  }
  const str = String(value)
  return str.length > 30 ? str.slice(0, 30) + '…' : str
}
