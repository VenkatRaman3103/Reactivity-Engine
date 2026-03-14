import { pushOwner, popOwner } from "./effect";
import { engineError, engineWarn, engineInfo } from "./errors";
import { cleanupPortals } from "./portal";

export interface Instance {
  id: string;
  fn: () => Node;
  container: Element;
  el: Node | null;
  cleanups: (() => void)[];
  onError: ((e: Error) => Node) | null;
}

export const instances = new Map<string, Instance>();
let counter = 0;
let rendering: string | null = null;

export function getRenderingId() {
  return rendering;
}

export function mountComponent(
  fn: () => Node,
  container: Element,
  id?: string,
): string {
  // error — no container
  if (!container) {
    engineError({
      category: "Mount",
      what: "Cannot mount component — container element is null or undefined.",
      why: "The container element does not exist in the DOM.",
      fix:
        "Make sure the container element exists before mounting.\n" +
        '  const el = document.getElementById("app")\n' +
        '  if (!el) throw new Error("no #app element")\n' +
        "  mountComponent(App, el)",
    });
  }

  // error — no function
  if (typeof fn !== "function") {
    engineError({
      category: "Mount",
      what: "Cannot mount component — first argument is not a function.",
      why: `Received: ${typeof fn}`,
      fix:
        "Pass a component function as the first argument.\n" +
        "  mountComponent(App, container)   ← correct\n" +
        "  mountComponent(App(), container)  ← wrong, do not call it",
    });
  }

  // warn — container not in document
  if (!document.body.contains(container)) {
    engineWarn({
      category: "Mount",
      what: `Mounting into a container that is not attached to the document.`,
      why: "The container element exists but is not in the DOM tree.",
      fix:
        "Make sure the container is appended to document.body\n" +
        "before calling mountComponent.",
    });
  }

  const cid = id ?? `c-${counter++}`;

  if (instances.has(cid)) {
    return cid;
  }

  const inst: Instance = {
    id: cid,
    fn,
    container,
    el: null,
    cleanups: [],
    onError: null,
  };
  instances.set(cid, inst);

  render(inst);
  return cid;
}

function render(inst: Instance) {
  try {
    rendering = inst.id;
    pushOwner({ id: inst.id });

    const el = inst.fn();

    popOwner();
    rendering = null;

    // error — component returned nothing
    if (el === null || el === undefined) {
      engineError({
        category: "Component",
        file: inst.id,
        what: `Component '${inst.id}' returned null or undefined.`,
        why: "Every component must return a DOM element.",
        fix:
          "Check your return statement. Make sure it returns JSX.\n" +
          "  export default function MyComponent() {\n" +
          "    return <div>...</div>   ← must have this\n" +
          "  }",
      });
    }

    // error — component returned a non-element
    if (!(el instanceof Node)) {
      engineError({
        category: "Component",
        file: inst.id,
        what: `Component '${inst.id}' returned an invalid value.`,
        why: `Expected a DOM Node but received: ${typeof el}`,
        fix:
          "Components must return JSX. Plain objects, strings, and " +
          "numbers are not valid return values at the top level.",
      });
    }

    if (inst.el && inst.container.contains(inst.el)) {
      inst.container.replaceChild(el, inst.el);
    } else {
      inst.container.appendChild(el);
    }

    inst.el = el;
    engineInfo("Component", `'${inst.id}' rendered successfully`);
  } catch (e: any) {
    popOwner();
    rendering = null;

    if (inst.onError) {
      engineWarn({
        category: "Component",
        file: inst.id,
        what: `Component '${inst.id}' threw during render. Showing fallback.`,
        why: e.message,
        fix: "The onError handler caught this. Fix the underlying error\n" +
          "to remove this warning.",
      });
      const fallback = inst.onError(e as Error);
      if (inst.el && inst.container.contains(inst.el)) {
        inst.container.replaceChild(fallback, inst.el);
        inst.el = fallback;
      } else {
        inst.container.appendChild(fallback);
        inst.el = fallback;
      }
    } else {
      engineError({
        category: "Component",
        file: inst.id,
        what: `Component '${inst.id}' threw during render.`,
        why: e.message,
        fix: "Add an onError handler to show a fallback UI.\n" +
          "  onError(e => <div>Something went wrong: {e.message}</div>)\n" +
          "Or fix the error:\n" +
          `  ${e.stack?.split("\n")[1]?.trim() ?? "Check the component file"}`,
      });
    }
  }
}

export function updateComponent(id: string) {
  // Fine-grained updates are handled automatically by Signals/Effects.
  // We only re-render if the component was never rendered.
  const inst = instances.get(id);
  if (inst && !inst.el) {
    render(inst);
  }
}

export function unmountComponent(id: string) {
  const inst = instances.get(id);
  if (!inst) return;
  inst.cleanups.forEach((fn) => fn());
  cleanupPortals(id);
  if (inst.el && inst.container.contains(inst.el)) {
    inst.container.removeChild(inst.el);
  }
  instances.delete(id);
}

export function registerCleanup(id: string, fn: () => void) {
  const inst = instances.get(id);
  if (inst) inst.cleanups.push(fn);
}

export function registerErrorHandler(id: string, fn: (e: Error) => Node) {
  const inst = instances.get(id);
  if (inst) inst.onError = fn;
}
