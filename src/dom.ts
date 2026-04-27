import { createEffect, pushComponentName, popComponentName } from "./effect";
import { pushObserver, popObserver } from "./reactive";
import { engineError, engineWarn } from "./errors";
import { reconcile, getKey, KeyedNode } from "./keyed";

export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | Element
  | Node
  | (() => Child)
  | any[];

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

const SVG_TAGS = new Set([
  'svg', 'circle', 'ellipse', 'line', 'path', 'polygon',
  'polyline', 'rect', 'text', 'tspan', 'g', 'defs', 'use',
  'symbol', 'clipPath', 'mask', 'pattern', 'image', 'foreignObject',
  'linearGradient', 'radialGradient', 'stop', 'filter', 'feBlend',
  'feColorMatrix', 'feComposite', 'feFlood', 'feGaussianBlur',
  'feMerge', 'feMergeNode', 'feOffset', 'title', 'desc',
  'animate', 'animateTransform', 'animateMotion', 'marker', 'textPath'
])

const XLINK_ATTRS = new Set([
  'xlink:href', 'xlink:arcrole', 'xlink:role',
  'xlink:title', 'xlink:type', 'xlink:show', 'xlink:actuate'
])

const SVG_ATTR_MAP: Record<string, string> = {
  clipPath:          'clip-path',
  clipRule:          'clip-rule',
  colorInterpolation: 'color-interpolation',
  colorRendering:    'color-rendering',
  dominantBaseline:  'dominant-baseline',
  fillOpacity:       'fill-opacity',
  fillRule:          'fill-rule',
  floodColor:        'flood-color',
  floodOpacity:      'flood-opacity',
  fontFamily:        'font-family',
  fontSize:          'font-size',
  fontStyle:         'font-style',
  fontWeight:        'font-weight',
  imageRendering:    'image-rendering',
  letterSpacing:     'letter-spacing',
  lightingColor:     'lighting-color',
  markerEnd:         'marker-end',
  markerMid:         'marker-mid',
  markerStart:       'marker-start',
  shapeRendering:    'shape-rendering',
  stopColor:         'stop-color',
  stopOpacity:       'stop-opacity',
  strokeDasharray:   'stroke-dasharray',
  strokeDashoffset:  'stroke-dashoffset',
  strokeLinecap:     'stroke-linecap',
  strokeLinejoin:    'stroke-linejoin',
  strokeMiterlimit:  'stroke-miterlimit',
  strokeOpacity:     'stroke-opacity',
  strokeWidth:       'stroke-width',
  textAnchor:        'text-anchor',
  textDecoration:    'text-decoration',
  textRendering:     'text-rendering',
  transformOrigin:   'transform-origin',
  unicodeBidi:       'unicode-bidi',
  vectorEffect:      'vector-effect',
  wordSpacing:       'word-spacing',
  writingMode:       'writing-mode',
}

let svgDepth = 0

export function h(
  tag: string | Function,
  props: Record<string, any> | null,
  ...children: Child[]
): Node {
  if (typeof tag === "function") {
    const props_ = props ? { ...props } : {};
    
    // Mount varargs into props so functional components can access their inner JSX
    if (children.length > 0) {
      props_.children = children.length === 1 ? children[0] : children;
    }

    // Component Isolation: Ensure the component function call itself
    // does not subscribe to the parent's reactive context.
    // Also track the rendering component name for componentRegistry.
    pushObserver(null);
    pushComponentName(tag.name || null);
    let result: any;
    try {
      result = tag(props_);
    } finally {
      popComponentName();
      popObserver();
    }

    // error — component returned nothing
    if (result === null || result === undefined) {
      engineWarn({
        category: "DOM",
        what: `A component function returned ${result}.`,
        why: "Component functions must return a DOM node.",
        fix: "Make sure your component returns JSX.",
      });
      return document.createTextNode("");
    }

    // error — component returned a non-element
    if (!(result instanceof Node)) {
      engineError({
        category: "DOM",
        what: `A component function returned an invalid value.`,
        why: `Expected a DOM Node but received: ${typeof result}`,
        fix:
          "Components must return JSX. Plain objects, strings, and " +
          "numbers are not valid return values at the top level.",
      });
    }

    if (result instanceof HTMLElement) {
      result.dataset.engineComponent = tag.name;
    }

    return result;
  }

  if (tag === "__fragment") {
    const f = document.createDocumentFragment();
    children.flat(Infinity).forEach((c) => applyChild(f, c));
    return f;
  }

  // error — empty tag
  if (!tag || typeof tag !== "string") {
    engineError({
      category: "DOM",
      what: `Invalid element tag: '${tag}'.`,
      why: "h() received an empty or non-string tag name.",
      fix:
        "Make sure your JSX uses valid HTML tag names.\n" +
        "  <div>...</div>   ← correct\n" +
        '  <"">...</"">     ← wrong',
    });
  }

  const isSVG = SVG_TAGS.has(tag) || svgDepth > 0;
  const el = isSVG 
    ? document.createElementNS(SVG_NAMESPACE, tag) as any as HTMLElement
    : document.createElement(tag);

  if (tag === 'svg') svgDepth++;

  if (props) applyProps(el, props, isSVG);
  children.flat(Infinity).forEach((c) => applyChild(el, c));

  if (tag === 'svg') svgDepth--;

  return el;
}

export const Fragment = "__fragment";

function applyProps(el: Element, props: Record<string, any>, isSVG = false) {
  Object.entries(props).forEach(([key, val]) => {
    if (key === "children") return;
    if (key === "key") return;
    if (key === "__key") return;

    if (key.startsWith("on") && typeof val === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), val);
      return;
    }
    
    if (typeof val === "function") {
      createEffect(() => {
        const v = val();
        if (XLINK_ATTRS.has(key)) {
          el.setAttributeNS(XLINK_NAMESPACE, key, String(v));
        } else if (isSVG && key in SVG_ATTR_MAP) {
          el.setAttribute(SVG_ATTR_MAP[key], String(v));
        } else if (key === "class" || key === "className") {
          el.setAttribute("class", String(v));
        } else if (key === "style" && typeof v === "object") {
          Object.assign((el as HTMLElement).style, v);
        } else if (!isSVG && typeof v === "boolean") {
          if (v) el.setAttribute(key, "");
          else el.removeAttribute(key);
        } else {
          el.setAttribute(key, String(v));
        }
      });
      return;
    }

    if (key === "bind" && val?.set) {
      val.set(el);
      return;
    }

    if (XLINK_ATTRS.has(key)) {
      el.setAttributeNS(XLINK_NAMESPACE, key, String(val));
      return;
    }

    if (isSVG && key in SVG_ATTR_MAP) {
      el.setAttribute(SVG_ATTR_MAP[key], String(val));
      return;
    }

    if (key === "class" || key === "className") {
      el.setAttribute("class", String(val));
      return;
    }
    
    if (key === "style" && typeof val === "object") {
      Object.assign((el as HTMLElement).style, val);
      return;
    }
    
    if (!isSVG && typeof val === "boolean") {
      if (val) el.setAttribute(key, "");
      else el.removeAttribute(key);
      return;
    }

    el.setAttribute(key, String(val));
  });
}

function applyChild(parent: Node, child: Child) {
  if (child === null || child === undefined || child === false) return;

  if (typeof child === "function") {
    applyReactive(parent, child as () => Child);
    return;
  }

  if (Array.isArray(child)) {
    child.forEach((c) => applyChild(parent, c));
    return;
  }

  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }

  if (child && typeof child === "object" && "__node" in child) {
    applyChild(parent, (child as Record<string, any>).__node);
    return;
  }

  parent.appendChild(document.createTextNode(String(child)));
}

function applyReactive(parent: Node, fn: () => Child) {
  const startMarker = document.createComment("reactive-start");
  const endMarker = document.createComment("reactive-end");
  parent.appendChild(startMarker);
  parent.appendChild(endMarker);

  let keyedNodes: KeyedNode[] = [];
  let isKeyed = false;
  let firstRun = true;

  createEffect(() => {
    const raw = fn();
    const children = Array.isArray(raw) ? raw : [raw];
    const currentParent = endMarker.parentNode || parent;

    if (firstRun) {
      firstRun = false;
      isKeyed = children.length > 0 && getKey(children[0]) !== null;
    }

    if (isKeyed) {
      keyedNodes = reconcile(
        currentParent,
        endMarker,
        keyedNodes,
        children,
        (item) => {
          return item.__node instanceof Node
            ? item.__node
            : toNode(item.__node);
        },
        (item) => item.__key
      );
    } else {
      // Robust cleanup: remove all nodes between start and end markers.
      // This correctly handles cases where nested effects may have inserted 
      // multiple sibling nodes that are not tracked in a simple array.
      while (startMarker.nextSibling && startMarker.nextSibling !== endMarker) {
        currentParent.removeChild(startMarker.nextSibling);
      }

      const fragment = document.createDocumentFragment();
      children.forEach(c => {
        if (c === null || c === undefined || c === false) return;
        
        const n = toNode(c);
        fragment.appendChild(n);
      });

      currentParent.insertBefore(fragment, endMarker);
    }
  });
}

function toNode(child: Child): Node {
  if (child === null || child === undefined || child === false) {
    return document.createTextNode("");
  }
  if (child instanceof Node) return child;
  if (Array.isArray(child)) {
    const f = document.createDocumentFragment();
    child.forEach((c) => f.appendChild(toNode(c)));
    return f;
  }
  if (typeof child === "function") {
    const fn = child as () => Child;
    const f = document.createDocumentFragment();
    applyReactive(f, fn);
    return f;
  }
  if (child && typeof child === "object" && "__node" in child) {
    return toNode((child as Record<string, any>).__node);
  }
  return document.createTextNode(String(child));
}

