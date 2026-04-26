
import { log } from '../log'

let viewportContainer: HTMLElement | null = null
let originalStyle: string = ''

export function setViewport(width: number, height: number) {
  // Target only the actual #app or a direct child of body that ISN'T our tools
  let root = document.querySelector('#app') as HTMLElement
  
  if (!root) {
    const candidates = Array.from(document.body.children)
    root = candidates.find(el => 
        !el.id.includes('engine-devtools') && 
        !el.id.includes('engine-test-overlay')
    ) as HTMLElement
  }

  if (!root) {
    log.error('[Viewport] Could not find a valid application root to wrap.')
    return
  }

  if (!viewportContainer) {
    // Save state before wrapping
    originalStyle = root.style.cssText
    viewportContainer = document.createElement('div')
    viewportContainer.id = 'engine-viewport-container'
    
    // Style the container (THE VIRTUAL DEVICE)
    Object.assign(viewportContainer.style, {
      width: `${width}px`,
      height: `${height}px`,
      margin: '40px auto',
      boxShadow: '0 30px 60px rgba(0,0,0,0.5), 0 0 0 10px #222',
      borderRadius: '20px',
      overflow: 'auto',
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      background: '#fff',
      position: 'relative',
      zIndex: '1', // Keep under devtools
      pointerEvents: 'auto'
    })

    // Perform the "The Wrap"
    root.parentNode?.insertBefore(viewportContainer, root)
    viewportContainer.appendChild(root)
  }

  // Update dimensions
  viewportContainer.style.width = `${width}px`
  viewportContainer.style.height = `${height}px`

  // Background and UI adjustments
  document.body.style.background = '#0a0a0a'
  document.body.style.overflow = 'auto'
  
  log.test_debug(`[Viewport] Set to ${width}x${height}`)
}

export function resetViewport() {
  if (!viewportContainer) return
  
  const root = viewportContainer.firstElementChild as HTMLElement
  if (root) {
    viewportContainer.parentNode?.insertBefore(root, viewportContainer)
    root.style.cssText = originalStyle
  }
  
  viewportContainer.remove()
  viewportContainer = null
  
  document.body.style.background = ''
  document.body.style.overflow = ''
}
