import { getRenderingId }   from './component'
import { engineWarn }       from './errors'

interface PortalEntry {
  id:        string
  wrapper:   HTMLElement
  container: Element
}

const activePortals   = new Map<string, PortalEntry>()
const portalsByOwner  = new Map<string, Set<string>>()
let   portalCounter   = 0

export function portal(
  node:      Node,
  container: Element = document.body
): Node {

  if (!(container instanceof Element)) {
    engineWarn({
      category: 'Portal',
      what:     'portal() received an invalid container.',
      why:      `Expected an Element but received: ${typeof container}`,
      fix:      'Pass a valid DOM element as the second argument.\n' +
                '  portal(<Modal />, document.body)            // correct\n' +
                '  portal(<Modal />, document.getElementById("modals")!)  // correct'
    })
    return node
  }

  const portalId  = `portal-${portalCounter++}`
  const ownerId   = getRenderingId()

  // create wrapper so we can cleanly remove the portal later
  const wrapper   = document.createElement('div')
  wrapper.setAttribute('data-engine-portal', portalId)
  wrapper.appendChild(node)
  container.appendChild(wrapper)

  // register portal
  activePortals.set(portalId, { id: portalId, wrapper, container })

  // track under owner so it cleans up when owner unmounts
  if (ownerId) {
    if (!portalsByOwner.has(ownerId)) {
      portalsByOwner.set(ownerId, new Set())
    }
    portalsByOwner.get(ownerId)!.add(portalId)
  }

  // return a comment placeholder in the original location
  // so the component tree stays intact
  const placeholder = document.createComment(`portal:${portalId}`)
  return placeholder
}

// called from component.ts when a component unmounts
export function cleanupPortals(componentId: string) {
  const portals = portalsByOwner.get(componentId)
  if (!portals) return

  portals.forEach(id => {
    const entry = activePortals.get(id)
    if (entry?.wrapper.parentNode) {
      entry.wrapper.parentNode.removeChild(entry.wrapper)
    }
    activePortals.delete(id)
  })

  portalsByOwner.delete(componentId)
}

// manually close a portal
export function closePortal(placeholder: Node) {
  const comment = placeholder as Comment
  const id      = comment.textContent?.replace('portal:', '')
  if (!id) return

  const entry = activePortals.get(id)
  if (entry?.wrapper.parentNode) {
    entry.wrapper.parentNode.removeChild(entry.wrapper)
  }
  activePortals.delete(id)
}
