import { pushObserver, popObserver, Observer } from "./reactive";
import {
  registerCleanup,
  registerErrorHandler,
} from "./component";

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
    } finally {
      popOwner();
      popObserver();
    }
  }

  cleanup() {
    // 1. Recursive cleanup children
    this.children.forEach(child => child.cleanup());
    this.children.clear();

    // 2. Run user-provided cleanup
    if (this.cleanupFn) {
      this.cleanupFn();
      this.cleanupFn = undefined;
    }

    // 3. Unsubscribe from all signals
    this.dependencies.forEach(subs => subs.delete(this));
    this.dependencies.clear();
  }
}

export function createEffect(fn: () => void | (() => void)) {
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
  if (currentOwner?.id) {
    registerCleanup(currentOwner.id, fn);
  }
}

export function onError(fn: (e: Error) => Node) {
  if (currentOwner?.id) {
    registerErrorHandler(currentOwner.id, fn);
  }
}

