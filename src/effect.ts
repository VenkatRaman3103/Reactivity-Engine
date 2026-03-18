import { pushObserver, popObserver, Observer } from "./reactive";
import { setCurrentOwnerId } from "./lifecycle";
import {
  registerCleanup,
  registerErrorHandler,
  isComponentMounted,
  markComponentMounted,
  instances,
} from "./component";
import { engineWarn } from "./errors";

interface Owner {
  id?: string; // for components
  children?: Set<Effect>;
  cleanups?: Set<() => void>;
  mountedHooks?: Set<any>;
  parent?: Owner | null;
  depth?: number;
}

let currentOwner: Owner | null = null;
const ownerStack: (Owner | null)[] = [];

export function pushOwner(owner: Owner | null) {
  ownerStack.push(currentOwner);
  currentOwner = owner;
}

export function popOwner() {
  currentOwner = ownerStack.pop() ?? null;
}

export class Effect implements Observer {
  dependencies = new Set<Set<Observer>>();
  children = new Set<Effect>();
  cleanups = new Set<() => void>();
  mountedHooks = new Set<any>();
  private cleanupFn?: () => void;
  public ownerId: string | null = null;
  public disposed = false;
  public depth: number;

  constructor(private fn: () => void | (() => void)) {
    this.depth = currentOwner ? ((currentOwner as any).depth || 0) + 1 : 0;
    this.ownerId = currentOwner ? ((currentOwner as any).id || (currentOwner as any).ownerId || null) : null;
  }

  execute() {
    if (this.disposed) return;
    this.unsubscribe();
    this.mountedHooks.clear();

    pushObserver(this);
    pushOwner(this);
    if (this.ownerId) setCurrentOwnerId(this.ownerId);
    try {
      const result = this.fn();
      if (typeof result === "function") {
        this.cleanupFn = result;
      }
    } catch (e: any) {
      engineWarn({
        category: "Effect",
        what: "An effect threw an error and has been stopped.",
        why: e.message,
        fix:
          "Check your effect function for errors.\n" +
          "Wrap the contents in try/catch if the error is expected.\n" +
          `  effect(() => {\n` +
          `    try { ... }\n` +
          `    catch(e) { console.error(e) }\n` +
          `  })`,
      });
    } finally {
      if (this.ownerId) setCurrentOwnerId(null);
      popOwner();
      popObserver();
    }
  }

  unsubscribe() {
    // 1. Recursive dispose children
    this.children.forEach((child) => child.dispose());
    this.children.clear();

    // 2. Run cleanups registered via onUnmount or sub-components
    this.cleanups.forEach((fn) => fn());
    this.cleanups.clear();

    // 3. Run user-provided cleanup from the effect itself
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = undefined;
    }

    // 4. Unsubscribe from all signals
    this.dependencies.forEach((subs) => subs.delete(this));
    this.dependencies.clear();
  }

  dispose() {
    this.disposed = true;
    this.unsubscribe();
  }

  // Alias for backward compatibility if needed, though internal usage should move to dispose()
  cleanup() {
    this.dispose();
  }
}

export function createEffect(fn: () => void | (() => void)) {
  if (typeof fn !== "function") {
    engineWarn({
      category: "Effect",
      what: "effect() received a non-function argument.",
      why: `Received: ${typeof fn}`,
      fix:
        "Pass a function to effect().\n" +
        "  effect(() => { document.title = count })   ← correct\n" +
        "  effect(count)                               ← wrong",
    });
    return () => {};
  }

  const e = new Effect(fn);

  if (currentOwner) {
    if (currentOwner.id) {
      // Component owner
      registerCleanup(currentOwner.id, () => e.dispose());
    } else {
      // Effect owner
      (currentOwner as Effect).children.add(e);
    }
  }

  e.execute();
  return () => e.dispose();
}

export const effect = createEffect;

export function onMount(fn: () => void | (() => void)) {
  if (typeof fn !== "function") {
    engineWarn({
      category: "Effect",
      what: "onMount() received a non-function argument.",
      why: `Received: ${typeof fn}`,
      fix: 'Pass a function to onMount().\n  onMount(() => { fetchData() })   ← correct',
    });
    return;
  }

  if (!currentOwner) {
    engineWarn({
      category: "Effect",
      what: "onMount() was called outside of a component or reactive effect.",
      why: "onMount() must be called inside a component function body or an effect.",
      fix:
        "Move onMount() inside your component function.\n" +
        "  export default function MyComponent() {\n" +
        "    onMount(() => { ... })   ← correct\n" +
        "  }",
    });
    return;
  }

  // Use the owner's mountedHooks to ensure idempotency within this specific execution cycle
  // (e.g. if the component function is re-called by a re-render)
  const owner = currentOwner as any;
  if (owner.mountedHooks && owner.mountedHooks.has(fn)) return;
  if (owner.mountedHooks) owner.mountedHooks.add(fn);

  Promise.resolve().then(() => {
    // Ghost mount check: if the owner was disposed/unmounted before the promise ran
    if (owner.disposed === true) return;
    if (owner.id && !instances.has(owner.id)) return;

    pushOwner(owner);
    try {
      const stop = fn();
      if (stop && typeof stop === "function") {
        if (owner.cleanups) owner.cleanups.add(stop);
        else if (owner.id) registerCleanup(owner.id, stop);
      }
    } finally {
      popOwner();
    }
  });
}

export function onUnmount(fn: () => void) {
  if (typeof fn !== "function") {
    engineWarn({
      category: "Effect",
      what: "onUnmount() received a non-function argument.",
      why: `Received: ${typeof fn}`,
      fix: 'Pass a function to onUnmount().\n  onUnmount(() => { cleanup() })   ← correct',
    });
    return;
  }

  if (!currentOwner) {
    engineWarn({
      category: "Effect",
      what: "onUnmount() was called outside of a component or effect.",
      fix: "Move onUnmount() inside your component function body.",
    });
    return;
  }

  const owner = currentOwner as any;
  if (owner.cleanups) {
    owner.cleanups.add(fn);
  } else if (owner.id) {
    registerCleanup(owner.id, fn);
  }
}

export function onError(fn: (e: Error) => Node) {
  if (!currentOwner) return;

  // Walk up the owner tree to find a component that can handle the error
  let owner: any = currentOwner;
  while (owner) {
    if (owner.id) {
      registerErrorHandler(owner.id, fn);
      return;
    }
    owner = owner.parent;
  }
}

