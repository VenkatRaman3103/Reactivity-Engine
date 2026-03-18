import { engineWarn } from "./errors";
import { scheduleEffect, isFlushing } from "./scheduler";

export interface Observer {
  dependencies: Set<Set<Observer>>;
  depth: number;
  execute: () => void;
}

let activeObserver: Observer | null = null;
const observerStack: (Observer | null)[] = [];

let pendingNotifications = new Set<Signal<any>>();
let batchCount = 0;

export function pushObserver(observer: Observer | null) {
  observerStack.push(activeObserver!);
  activeObserver = observer;
}

export function popObserver() {
  activeObserver = observerStack.pop() ?? null;
}

export function getActiveObserver() {
  return activeObserver;
}

export class Signal<T> {
  private subscribers = new Set<Observer>();
  public label?: string;
  private _notifying = false;

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

  private _warned = false;
  
  notify() {
    if (this.subscribers.size === 0 && !isFlushing && !this._warned) {
      const isInternal = this.label?.startsWith('engine:') || this.label?.startsWith('internal:');
      const isState = this.label?.includes('.state.');
      
      if (!isInternal && !isState) {
        this._warned = true; // only warn once per signal
        engineWarn({
          category: "Reactivity",
          file: this.label,
          what: `Signal '${this.label || "anonymous"}' was updated but has no subscribers.`,
          why: "No component or effect has read from this signal yet.",
          fix: "If this signal is meant to be reactive, make sure something is reading its .value.",
        });
      }
    }

    // Loop protection - check for excessive re-scheduling
    if (this._notifying) {
       console.warn(`[Engine] Circular update detected for signal: ${this.label || 'unknown'}`);
       return;
    }

    this._notifying = true;
    try {
      // Batch all subscriber executions via the scheduler
      this.subscribers.forEach((sub) => {
        scheduleEffect(sub);
      });
    } finally {
      this._notifying = false;
    }
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

export function untrack<T>(fn: () => T): T {
  pushObserver(null);
  try {
    return fn();
  } finally {
    popObserver();
  }
}
