
let cursorEl: HTMLElement | null = null

export function initCursor() {
  if (cursorEl) return

  injectCursorStyles()

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

export function clickRipple() {
  if (!cursorEl) return
  
  const ripple = document.createElement('div')
  ripple.className = 'engine-test-ripple'
  cursorEl.appendChild(ripple)
  
  setTimeout(() => ripple.remove(), 600)
}

export function removeCursor() {
  cursorEl?.remove()
  cursorEl = null
}

function injectCursorStyles() {
  if (document.querySelector('#engine-cursor-styles')) return
  const style = document.createElement('style')
  style.id = 'engine-cursor-styles'
  style.textContent = `
    #engine-test-cursor {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .engine-test-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: rgba(126, 200, 227, 0.4);
      border: 2px solid #7ec8e3;
      border-radius: 50%;
      transform: translate(-50%, -50%) scale(0);
      animation: engine-ripple 0.6s ease-out forwards;
      pointer-events: none;
    }
    @keyframes engine-ripple {
      to { transform: translate(-50%, -50%) scale(2); opacity: 0; }
    }
    .engine-test-highlight {
      outline: 4px solid #7ec8e3 !important;
      outline-offset: 4px !important;
      transition: all 0.2s ease !important;
      border-radius: 4px !important;
    }
  `
  document.head.appendChild(style)
}
