import { pushObserver, popObserver, Observer } from "./reactive";
import {
  registerCleanup,
  registerErrorHandler,
} from "./component";
import { engineWarn } from "./errors";

interface Owner {
  id?: string; // for components
  children?: Set<Effect>;
  parent?: Owner | null;
}

let currentOwner: Owner | null = null;
const ownerStack: Owner[] = [];

export function pushOwner(owner: Owner | null) {
  if (currentOwner) ownerStack.push(currentOwner);
  currentOwner = owner;
}

export function popOwner() {
  currentOwner = ownerStack.pop() || null;
}

export class Effect implements Observer {
  dependencies = new Set<Set<Observer>>();
  children = new Set<Effect>();
  private cleanupFn?: () => void;

  constructor(private fn: () => void | (() => void)) {}

  execute() {
    this.cleanup();

    pushObserver(this);
    pushOwner(this);
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
      popOwner();
      popObserver();
    }
  }

  cleanup() {
    // 1. Recursive cleanup children
    this.children.forEach((child) => child.cleanup());
    this.children.clear();

    // 2. Run user-provided cleanup
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = undefined;
    }

    // 3. Unsubscribe from all signals
    this.dependencies.forEach((subs) => subs.delete(this));
    this.dependencies.clear();
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
      registerCleanup(currentOwner.id, () => e.cleanup());
    } else {
      // Effect owner
      (currentOwner as Effect).children.add(e);
    }
  }

  e.execute();
  return () => e.cleanup();
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
      what: "onMount() was called outside of a component.",
      why: "onMount() must be called inside a component function body.",
      fix:
        "Move onMount() inside your component function.\n" +
        "  export default function MyComponent() {\n" +
        "    onMount(() => { ... })   ← correct\n" +
        "  }",
    });
    return;
  }

  const owner = currentOwner;
  Promise.resolve().then(() => {
    pushOwner(owner);
    const stop = fn();
    if (owner && owner.id && typeof stop === "function") {
      registerCleanup(owner.id, stop);
    }
    popOwner();
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
      what: "onUnmount() was called outside of a component.",
      fix: "Move onUnmount() inside your component function body.",
    });
    return;
  }

  if (currentOwner?.id) {
    registerCleanup(currentOwner.id, fn);
  }
}

export function onError(fn: (e: Error) => Node) {
  if (currentOwner?.id) {
    registerErrorHandler(currentOwner.id, fn);
  }
}

