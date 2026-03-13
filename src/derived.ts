import { engineError, engineWarn } from "./errors";
import { pushObserver, popObserver, Observer, Signal } from "./reactive";

export function derive<T>(fn: () => T): { readonly value: T } {
  if (typeof fn !== "function") {
    engineError({
      category: "Derived",
      what: "derive() received a non-function argument.",
      why: `Received: ${typeof fn}`,
      fix:
        "Pass a function to derive().\n" +
        "  const total = derive(() => items.reduce(...))   ← correct\n" +
        "  const total = derive(items.reduce(...))          ← wrong",
    });
  }

  let computing = false;

  class Derived extends Signal<T> implements Observer {
    dependencies = new Set<Set<Observer>>();
    private dirty = true;

    constructor(private fn: () => T) {
      super(undefined as any);
    }

    get value(): T {
      if (this.dirty) {
        this.recompute();
      }
      return super.value;
    }

    // Called when a dependency changes
    execute() {
      if (this.dirty) return;
      this.dirty = true;
      this.notify();
    }

    private recompute() {
      // detect circular dependency
      if (computing) {
        engineError({
          category: "Derived",
           what: "Circular dependency detected in derive().",
          why: "This derived value depends on itself or on another " +
            "derived value that depends on it.",
          fix: "Check your derive() functions for circular references.\n" +
            "Derived values must only depend on state variables,\n" +
            "not on other derived values that depend on them.",
        });
      }

      computing = true;
      // Clear old dependencies
      this.dependencies.forEach((subs) => subs.delete(this));
      this.dependencies.clear();

      pushObserver(this);
      try {
        const nextValue = this.fn();
        if (nextValue !== (this as any)._value) {
          (this as any)._value = nextValue;
        }
        this.dirty = false;
      } catch (e: any) {
        engineWarn({
          category: "Derived",
          what: "derive() threw an error during computation.",
          why: e.message,
          fix: "Check your derive() function for errors.\n" +
            "Make sure all state variables it reads are initialised.",
        });
      } finally {
        popObserver();
        computing = false;
      }
    }
  }

  const d = new Derived(fn);

  // Initial computation to set up dependencies
  try {
    d.value;
  } catch (e: any) {
    engineWarn({
      category: "Derived",
      what: "derive() threw on initial computation.",
      why: e.message,
      fix: "Check that all state variables used in derive() " +
        "have initial values in their state file.",
    });
  }

  return {
    get value() {
      return d.value;
    },
  };
}
