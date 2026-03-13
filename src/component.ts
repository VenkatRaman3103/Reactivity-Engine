import { pushOwner, popOwner } from "./effect";

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

    if (inst.el && inst.container.contains(inst.el)) {
      inst.container.replaceChild(el, inst.el);
    } else {
      inst.container.appendChild(el);
    }

    inst.el = el;
  } catch (e) {
    popOwner();
    rendering = null;

    if (inst.onError) {
      const fallback = inst.onError(e as Error);
      if (inst.el && inst.container.contains(inst.el)) {
        inst.container.replaceChild(fallback, inst.el);
        inst.el = fallback;
      } else {
        inst.container.appendChild(fallback);
        inst.el = fallback;
      }
    } else {
      throw e;
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
