import { createEffect } from "./effect";
import { engineError, engineWarn } from "./errors";

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
    const props_ = props ?? {};
    const result = tag(props_);

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

  const el = document.createElement(tag);
  if (props) applyProps(el, props);
  children.flat(Infinity).forEach((c) => applyChild(el, c));
  return el;
}

export const Fragment = "__fragment";

function applyProps(el: HTMLElement, props: Record<string, any>) {
  Object.entries(props).forEach(([key, val]) => {
    if (key === "children") return;

    if (key.startsWith("on") && typeof val === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), val);
      return;
    }
    
    if (typeof val === "function") {
      createEffect(() => {
        const v = val();
        if (key === "class") el.className = String(v);
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

    if (key === "class") el.className = String(val);
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

  parent.appendChild(document.createTextNode(String(child)));
}

function applyReactive(parent: Node, fn: () => Child) {
  let marker = document.createComment("");
  parent.appendChild(marker);

  let currentNodes: Node[] = [];

  createEffect(() => {
    // Cleanup previous nodes
    currentNodes.forEach(n => {
      n.parentNode?.removeChild(n);
    });
    currentNodes = [];

    const raw = fn();
    const children = Array.isArray(raw) ? raw : [raw];
    
    const fragment = document.createDocumentFragment();
    children.forEach(c => {
      if (c === null || c === undefined || c === false) return;
      const n = toNode(c);
      fragment.appendChild(n);
      currentNodes.push(n);
    });

    marker.parentNode?.insertBefore(fragment, marker);
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
  return document.createTextNode(String(child));
}

