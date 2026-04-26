
let cursorEl: HTMLElement | null = null

export function initCursor() {
  if (cursorEl) return

  cursorEl = document.createElement('div')
  cursorEl.id = 'engine-test-cursor'
  cursorEl.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 3L19 12L12 13.5L9 20L5 3Z"
        fill="#7ec8e3" stroke="#0f0f0f" stroke-width="1.5"/>
    </svg>
  `

  Object.assign(cursorEl.style, {
    position:   'fixed',
    zIndex:     '99998',
    pointerEvents: 'none',
    transition: 'top 0.3s ease, left 0.3s ease',
    top:        '0px',
    left:       '0px'
  })

  document.body.appendChild(cursorEl)
}

export function moveCursorTo(el: Element) {
  if (!cursorEl) initCursor()

  const rect = el.getBoundingClientRect()
  const x    = rect.left + rect.width / 2
  const y    = rect.top  + rect.height / 2

  cursorEl!.style.left = `${x}px`
  cursorEl!.style.top  = `${y}px`
}

export function removeCursor() {
  cursorEl?.remove()
  cursorEl = null
}
