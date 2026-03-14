import type { Observer } from "./reactive";

const componentQueue = new Set<string>();
const scheduledEffects = new Set<Observer>();
export let isFlushing = false;
let flushRequested = false;
let onUpdate: (id: string) => void = () => {};

export function setUpdateHandler(fn: (id: string) => void) {
  onUpdate = fn;
}

export function scheduleUpdate(id: string) {
  componentQueue.add(id);
  requestFlush();
}

export function scheduleEffect(observer: Observer) {
  scheduledEffects.add(observer);
  requestFlush();
}

function requestFlush() {
  if (!isFlushing && !flushRequested) {
    flushRequested = true;
    queueMicrotask(flush);
  }
}

function flush() {
  isFlushing = true;
  flushRequested = false;

  try {
    // Keep draining both queues as long as either has items.
    // This ensures updates scheduled during flush (effects or component renders) are fully processed.
    while (scheduledEffects.size > 0 || componentQueue.size > 0) {
      
      // 1. Process all pending effects first (prioritize reactivity)
      if (scheduledEffects.size > 0) {
        // Snapshot and sort by depth. Lower depth (parents) first.
        const toRun = Array.from(scheduledEffects).sort((a, b) => a.depth - b.depth);
        scheduledEffects.clear();

        toRun.forEach((observer) => {
          try {
            observer.execute();
          } catch (e: any) {
            console.error(`[Scheduler] Error during effect execution: ${e.message}`, e);
          }
        });
        
        // After running effects, we might have new components or effects. 
        // We continue the while loop.
        continue;
      }

      // 2. Process pending component updates (rerenders)
      if (componentQueue.size > 0) {
        const components = Array.from(componentQueue);
        componentQueue.clear();
        
        components.forEach((id) => {
          try {
            onUpdate(id);
          } catch (e: any) {
            console.error(`[Scheduler] Error during component update: ${e.message}`, e);
          }
        });
      }
    }
  } finally {
    isFlushing = false;
  }
}
