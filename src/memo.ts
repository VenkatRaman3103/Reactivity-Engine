import { pushObserver, popObserver, Observer, Signal, getActiveObserver } from "./reactive";

export class Memo<T> extends Signal<T> implements Observer {
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
    // Clear old dependencies
    this.dependencies.forEach(subs => subs.delete(this));
    this.dependencies.clear();

    pushObserver(this);
    try {
      const nextValue = this.fn();
      if (nextValue !== (this as any)._value) {
        (this as any)._value = nextValue;
        this.dirty = false;
        this.notify();
      } else {
        this.dirty = false;
      }
    } finally {
      popObserver();
    }
  }
}

export function createMemo<T>(fn: () => T): Memo<T> {
  return new Memo(fn);
}

export const derive = createMemo;
