import { engineWarn } from './errors'
import { createEffect } from './effect'

// default slot — renders un-slotted children
// named slot   — renders child with slot="name" OR props['slot:name']
export function slot(
  propsOrChildren: any = {},
  name:  string = 'default',
  fallback?: any
): Node {
  
  // extract an array of actual DOM nodes to search through
  const getChildrenArray = (source: any): any[] => {
    if (Array.isArray(source)) return source;
    if (source instanceof Node) return [source];
    if (typeof source === 'function') return [source]; // Include reactive thunks
    if (source && Array.isArray(source.children)) return source.children;
    if (source && source.children) return [source.children];
    return [];
  };

  const childrenNodes = getChildrenArray(propsOrChildren);

  if (name === 'default') {
    // defaults are nodes WITHOUT a slot attribute
    const defaults = childrenNodes.filter(c => {
      if (c instanceof Element) return !c.hasAttribute('slot');
      return true;
    });
    
    return defaults.length > 0 
      ? resolveChildren(defaults)
      : resolveChildren(fallback)
  }

  // 1. Check for child nodes with slot="name" attributes (Vue-style)
  const namedChild = childrenNodes.find(c => {
    return c instanceof Element && c.getAttribute('slot') === name;
  });

  if (namedChild) {
    return resolveChildren(namedChild)
  }

  // 2. Fallback to prop-based slots (React-style `<Card slot:header={...}>`)
  const isPropsObj = propsOrChildren && typeof propsOrChildren === 'object' 
    && !Array.isArray(propsOrChildren) && !(propsOrChildren instanceof Node);
    
  if (isPropsObj) {
    const key = `slot:${name}`
    if (propsOrChildren[key] !== undefined) {
      return resolveChildren(propsOrChildren[key])
    }
  }

  // 3. Render Fallback
  if (fallback !== undefined) return resolveChildren(fallback)
  
  engineWarn({
    category: 'Component',
    what:     `Named slot '${name}' was not provided.`,
    why:      `The parent component did not pass a slot content and no fallback was provided.`,
    fix:      `Pass the slot content from the parent:\n` +
              `  <Card>\n` +
              `    <div slot="${name}">Content</div>\n` +
              `  </Card>\n` +
              `Or provide a fallback as the third argument:\n` +
              `  slot(props, '${name}', <span>Default</span>)`,
    example:  `slot(children, '${name}')`
  })
  
  return document.createTextNode('')
}

function resolveChildren(children: any): Node {
  if (children === null || children === undefined) {
    return document.createTextNode('')
  }

  if (children instanceof Node) {
    return children
  }

  if (typeof children === 'function') {
    // It's a reactive thunk!
    const node = document.createTextNode('');
    createEffect(() => {
      const val = children();
      node.textContent = String(val instanceof Node ? '[Object Node]' : val);
    });
    return node;
  }

  if (Array.isArray(children)) {
    const fragment = document.createDocumentFragment()
    children.forEach(child => {
      fragment.appendChild(resolveChildren(child))
    })
    return fragment
  }

  return document.createTextNode(String(children))
}
