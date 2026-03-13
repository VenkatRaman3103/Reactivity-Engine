import { Signal, batch } from "./reactive";

const signalCache = new Map<string, Map<string, Signal<any>>>();

export function wrapState<T extends Record<string, any>>(
  file: string,
  mod: T,
): T {
  if (!signalCache.has(file)) {
    signalCache.set(file, new Map());
  }
  const fileSignals = signalCache.get(file)!;

  const wrapped: Record<string, any> = {};

  Object.keys(mod).forEach((key) => {
    const initialVal = mod[key];

    if (typeof initialVal === "function") {
      // Wrap functions in a batch to group state changes
      wrapped[key] = (...args: any[]) => {
        let result: any;
        batch(() => {
          result = initialVal(...args);
        });
        
        if (result instanceof Promise) {
          return result.finally(() => {
             // We could potentially batch here too if we had a way to wrap the resolution
          });
        }
        return result;
      };
    } else {
      // Create or get the signal for this property
      if (!fileSignals.has(key)) {
        fileSignals.set(key, new Signal(initialVal));
      }
      const signal = fileSignals.get(key)!;

      Object.defineProperty(wrapped, key, {
        get() {
          const val = signal.value;
          if (val && typeof val === "object") {
            return wrapObject(file, key, val);
          }
          return val;
        },
        set(v) {
          signal.value = v;
        },
        enumerable: true,
        configurable: true,
      });
    }
  });

  return wrapped as T;
}

function wrapObject(file: string, path: string, obj: any): any {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      
      if (Array.isArray(target) && typeof val === "function") {
        const mutating = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];
        if (mutating.includes(prop as string)) {
          return (...args: any[]) => {
            const result = val.apply(target, args);
            const fileSignals = signalCache.get(file);
            const parentKey = path.split('.')[0];
            const signal = fileSignals?.get(parentKey);
            if (signal) {
               signal.notify();
            }
            return result;
          };
        }
      }

      if (val && typeof val === "object") {
        return wrapObject(file, `${path}.${String(prop)}`, val);
      }
      return val;
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      const fileSignals = signalCache.get(file);
      const parentKey = path.split('.')[0];
      fileSignals?.get(parentKey)?.notify();
      return result;
    }
  });
}

export function notifySignal(file: string, key: string, newValue?: any) {
  const fileSignals = signalCache.get(file);
  const signal = fileSignals?.get(key);
  if (signal) {
    if (arguments.length > 2) {
      (signal as any)._value = newValue;
    }
    signal.notify();
  }
}
