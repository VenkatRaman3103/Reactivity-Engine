import { engineWarn } from "./errors";

export interface Observer {
  dependencies: Set<Set<Observer>>;
  execute: () => void;
}

let activeObserver: Observer | null = null;
const observerStack: Observer[] = [];

let pendingNotifications = new Set<Signal<any>>();
let batchCount = 0;

export function pushObserver(observer: Observer | null) {
  if (activeObserver) observerStack.push(activeObserver);
  activeObserver = observer;
}

export function popObserver() {
  activeObserver = observerStack.pop() || null;
}

export function getActiveObserver() {
  return activeObserver;
}

export class Signal<T> {
  private subscribers = new Set<Observer>();
  public label?: string;

  constructor(private _value: T) {}

  get value(): T {
    if (activeObserver) {
      this.subscribers.add(activeObserver);
      activeObserver.dependencies.add(this.subscribers);
    }
    return this._value;
  }

  set value(next: T) {
    if (this._value === next) return;
    this._value = next;

    if (batchCount > 0) {
      pendingNotifications.add(this);
    } else {
      this.notify();
    }
  }

  notify() {
    if (this.subscribers.size === 0 && this.label) {
      engineWarn({
        category: "Reactivity",
        what: `State file '${this.label}' was updated but has no subscribers.`,
        why: "No component or effect has read from this state file yet.",
        fix:
          "This may be expected on first load. If state updates are\n" +
          "not reflecting in the UI, make sure the component that\n" +
          `imports from '${this.label}' has rendered at least once.`,
      });
    }

    // Clone to avoid concurrent modification issues during execution
    const subs = Array.from(this.subscribers);
    subs.forEach((sub) => sub.execute());
  }

  unsubscribe(observer: Observer) {
    this.subscribers.delete(observer);
  }
}

export function createSignal<T>(initialValue: T): [() => T, (v: T) => void] {
  const s = new Signal(initialValue);
  return [
    () => s.value,
    (v: T) => { s.value = v; }
  ];
}


export function batch(fn: () => void) {
  batchCount++;
  try {
    fn();
  } finally {
    batchCount--;
    if (batchCount === 0) {
      const signals = Array.from(pendingNotifications);
      pendingNotifications.clear();
      signals.forEach(s => s.notify());
    }
  }
}
