import { Child } from './dom'

export interface KeyedNode {
  key:  string | number
  node: Node
}

export function reconcile(
  parent:   Node,
  marker:   Comment,
  oldNodes: KeyedNode[],
  newItems: any[],
  render:   (item: any) => Node,
  getKey:   (item: any) => string | number
): KeyedNode[] {

  // build lookup of old nodes by key
  const oldMap = new Map<string | number, KeyedNode>()
  oldNodes.forEach(n => oldMap.set(n.key, n))

  const newNodes:  KeyedNode[]          = []
  const usedKeys:  Set<string | number> = new Set()

  newItems.forEach(item => {
    const key = getKey(item)
    usedKeys.add(key)

    if (oldMap.has(key)) {
      // key exists — reuse the existing DOM node
      const existing = oldMap.get(key)!
      newNodes.push(existing)
      
      // We must sync attributes from the freshly rendered item.__node
      // over to the existing DOM node so it reflects the latest state/props.
      const freshNode = item.__node instanceof Node ? item.__node : null
      if (freshNode instanceof Element && existing.node instanceof Element) {
        // add/update new attributes
        Array.from(freshNode.attributes).forEach(attr => {
          if (existing.node.getAttribute(attr.name) !== attr.value) {
            existing.node.setAttribute(attr.name, attr.value)
          }
        })
        // remove old attributes
        Array.from((existing.node as Element).attributes).forEach(attr => {
          if (!freshNode.hasAttribute(attr.name)) {
            existing.node.removeAttribute(attr.name)
          }
        })
        // sync child text nodes directly if applicable
        if (freshNode.childNodes.length > 0 && freshNode.childNodes[0].nodeType === Node.TEXT_NODE) {
          existing.node.textContent = freshNode.textContent
        }
      }

      // move to correct position before the marker
      marker.parentNode!.insertBefore(existing.node, marker)
    } else {
      // key is new — create a fresh node
      const node = render(item)
      newNodes.push({ key, node })
      marker.parentNode!.insertBefore(node, marker)
    }
  })

  // remove nodes whose keys no longer exist
  oldNodes.forEach(n => {
    if (!usedKeys.has(n.key)) {
      n.node.parentNode?.removeChild(n.node)
    }
  })

  return newNodes
}

// extract key from a JSX element
// compiler sets __key on elements that have a key prop
export function getKey(item: any): string | number | null {
  if (item && typeof item === 'object' && '__key' in item) {
    return item.__key
  }
  return null
}
