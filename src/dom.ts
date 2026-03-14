import { createEffect } from "./effect";
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
    pushObserver(null);
    let result: any;
    try {
      result = tag(props_);
    } finally {
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

  const svgTags = new Set([
    "svg", "path", "line", "circle", "rect", "ellipse", "polyline", "polygon", 
    "text", "tspan", "defs", "g", "symbol", "use", "image", "clippath", "mask", "pattern"
  ]);

  const isSVG = svgTags.has(tag) || (parent instanceof Element && parent.namespaceURI === "http://www.w3.org/2000/svg");
  const el = isSVG 
    ? (document.createElementNS("http://www.w3.org/2000/svg", tag) as any) as HTMLElement
    : document.createElement(tag);

  if (props) applyProps(el, props, isSVG);
  children.flat(Infinity).forEach((c) => applyChild(el, c));
  return el;
}

export const Fragment = "__fragment";

function applyProps(el: HTMLElement, props: Record<string, any>, isSVG = false) {
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
        if (key === "class") {
          if (isSVG) el.setAttribute("class", String(v));
          else el.className = String(v);
        }
        else if (key === "style" && typeof v === "object") Object.assign(el.style, v);
        else if (typeof v === "boolean") {
          if (v) el.setAttribute(key, "");
          else el.removeAttribute(key);
        } else el.setAttribute(key, String(v));
      });
      return;
    }

    if (key === "bind" && val?.set) {
      val.set(el);
      return;
    }

    if (key === "class") {
      if (isSVG) el.setAttribute("class", String(val));
      else el.className = String(val);
    }
    else if (key === "style" && typeof val === "object") Object.assign(el.style, val);
    else if (typeof val === "boolean") {
      if (val) el.setAttribute(key, "");
      else el.removeAttribute(key);
    } else el.setAttribute(key, String(val));
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
  let marker = document.createComment("");
  parent.appendChild(marker);

  let currentNodes: Node[] = [];
  let keyedNodes: KeyedNode[] = [];
  let isKeyed = false;
  let firstRun = true;

  createEffect(() => {
    const raw = fn();
    const children = Array.isArray(raw) ? raw : [raw];

    if (firstRun) {
      firstRun = false;
      isKeyed = children.length > 0 && getKey(children[0]) !== null;
    }

    if (isKeyed) {
      keyedNodes = reconcile(
        parent,
        marker,
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
      // Cleanup previous nodes
      currentNodes.forEach(n => {
        if (n.parentNode) {
          n.parentNode.removeChild(n);
        }
      });
      currentNodes = [];

      const fragment = document.createDocumentFragment();
      children.forEach(c => {
        if (c === null || c === undefined || c === false) return;
        
        const n = toNode(c);
        if (n instanceof DocumentFragment) {
          // Track all individual nodes from the fragment
          const fragNodes = Array.from(n.childNodes);
          fragment.appendChild(n);
          currentNodes.push(...fragNodes);
        } else {
          fragment.appendChild(n);
          currentNodes.push(n);
        }
      });

      marker.parentNode?.insertBefore(fragment, marker);
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
    const n = document.createTextNode("");
    createEffect(() => {
       n.textContent = String(child());
    });
    return n;
  }
  if (child && typeof child === "object" && "__node" in child) {
    return toNode((child as Record<string, any>).__node);
  }
  return document.createTextNode(String(child));
}

