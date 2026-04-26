import { Signal, batch } from "./reactive";
import { engineError, engineWarn } from "./errors";
import { stateModules, snapshotRegistry } from "./memo";
import { registerStateFile, recordStateChange } from "./devtools";
import { trackAsync } from "./suspense";

const signalCache = new Map<string, Map<string, Signal<any>>>();

export function getSignalCache() {
  return signalCache;
}

export function wrapState<T extends Record<string, any>>(
  file: string,
  mod: T,
): T {
  // error — empty state file
  if (!mod || Object.keys(mod).length === 0) {
    engineWarn({
      category: "State",
      file,
      what: `State file '${file}' has no exports.`,
      why: "The file exists but exports nothing.",
      fix:
        `Add exported variables and functions.\n` +
        `  export let count = 0\n` +
        `  export function increment() { count++ }`,
    });
  }

  stateModules.set(file, mod);
  snapshotRegistry.set(file, mod);
  registerStateFile(file, mod);

  if (!signalCache.has(file)) {
    signalCache.set(file, new Map());
  }
  const fileSignals = signalCache.get(file)!;

  const wrapped: Record<string, any> = {};
  const exportedFunctions = Object.keys(mod).filter(
    (k) => typeof mod[k] === "function",
  );

  Object.keys(mod).forEach((key) => {
    const initialVal = mod[key];

    const isClass = typeof initialVal === "function" && /^\s*class[\s{]/.test(initialVal.toString());

    if (typeof initialVal === "function" && !isClass) {
      // Wrap functions in a batch to group state changes
      wrapped[key] = (...args: any[]) => {
        const before: Record<string, any> = {};
        Object.keys(mod).forEach(k => {
          if (typeof mod[k] !== 'function') before[k] = mod[k];
        });

        try {
          let result: any;
          batch(() => {
            result = mod[key](...args); // use original array or object func, wait, initialVal
          });

          const finish = () => {
             Object.keys(mod).forEach(k => {
               if (typeof mod[k] !== 'function' && mod[k] !== before[k]) {
                 recordStateChange(file, k, before[k], mod[k]);
                 
                 // Sync back to signal so observers are notified
                 const signal = fileSignals.get(k);
                 if (signal) {
                   signal.value = mod[k];
                 }
               }
             });
          }

          if (result instanceof Promise) {
            return trackAsync(
              result
                .finally(finish)
                .catch((err) => {
                  engineWarn({
                    category: "State",
                    file,
                    what: `Async function '${key}' in '${file}' threw an error.`,
                    why: err.message,
                    fix:
                      `Handle the error inside '${key}' with try/catch.\n` +
                      `  export async function ${key}() {\n` +
                      `    try { ... }\n` +
                      `    catch(e) { error = e.message }\n` +
                      `  }`,
                  });
                  throw err;
                })
            );
          }
          
          finish();
          return result;
        } catch (e: any) {
          engineError({
            category: "State",
            file,
            what: `Function '${key}' in '${file}' threw an error.`,
            why: e.message,
            fix: `Check the implementation of '${key}' in '${file}'.`,
          });
        }
      };
    } else {
      // Create or get the signal for this property
      if (!fileSignals.has(key)) {
        const s = new Signal(initialVal);
        s.label = file;
        fileSignals.set(key, s);
      }
      const signal = fileSignals.get(key)!;

      Object.defineProperty(wrapped, key, {
        get() {
          if (signal.value === undefined) {
            engineWarn({
              category: "State",
              file,
              what: `State variable '${key}' in '${file}' is undefined.`,
              why: "Variable was declared but not given an initial value.",
              fix:
                `Give '${key}' an initial value.\n` +
                `  export let ${key} = []    ← for arrays\n` +
                `  export let ${key} = null  ← for nullable\n` +
                `  export let ${key} = ''    ← for strings`,
            });
          }

          const val = signal.value;
          if (val && typeof val === "object") {
            return wrapObject(file, key, val);
          }
          return val;
        },
        enumerable: true,
        configurable: true,
      });
    }
  });

  // proxy to catch direct mutation from outside the state file
  return new Proxy(wrapped as T, {
    set(target, prop, value) {
      const stateFile = file.split('/').pop() || file;
      engineWarn({
        category: "State",
        what: `Direct mutation of '${String(prop)}' belonging to '${stateFile}'.`,
        why:
          "State variables should only be updated through exported functions.",
        fix: `Call the exported function instead.\n` +
          `  Available functions: ${exportedFunctions.join(", ")}`,
      });
      return Reflect.set(target, prop, value);
    },
  });
}

function wrapObject(file: string, path: string, obj: any): any {
  // Don't wrap if not an object or if already a proxy
  if (!obj || typeof obj !== 'object' || obj.__isProxy) return obj;

  // Only wrap plain objects and arrays
  const proto = Object.getPrototypeOf(obj);
  const isPlain = proto === Object.prototype || proto === Array.prototype;
  if (!isPlain) return obj;

  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === '__isProxy') return true;
      const val = Reflect.get(target, prop, receiver);
      
      if (Array.isArray(target) && typeof val === "function") {
        const mutating = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"];
        if (mutating.includes(prop as string)) {
          return (...args: any[]) => {
            const result = val.apply(target, args);
            // Array mutation: trigger notify on parent signal to update mappings
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

      if (val && typeof val === "object" && !val.__isProxy) {
        return wrapObject(file, `${path}.${String(prop)}`, val);
      }
      return val;
    },
    set(target, prop, value, receiver) {
      if (Reflect.get(target, prop, receiver) === value) return true;
      const result = Reflect.set(target, prop, value, receiver);
      const fileSignals = signalCache.get(file);
      const parentKey = path.split('.')[0];
      fileSignals?.get(parentKey)?.notify();
      return result;
    }
  });
}

export function trackState(file: string, key: string, value: any) {
  if (!signalCache.has(file)) {
    signalCache.set(file, new Map());
  }
  const fileSignals = signalCache.get(file)!;
  if (!fileSignals.has(key)) {
    const s = new Signal(value);
    s.label = file;
    fileSignals.set(key, s);
  }
  return fileSignals.get(key)!.value;
}

export function notifySignal(file: string, key: string, newValue?: any) {
  const fileSignals = signalCache.get(file);
  const signal = fileSignals?.get(key);
  if (signal) {
    if (arguments.length > 2) {
      signal.value = newValue;
    } else {
      signal.notify();
    }
  }
}

export function notifyAllInFile(file: string) {
  const fileSignals = signalCache.get(file);
  if (fileSignals) {
    fileSignals.forEach(signal => signal.notify());
  }
}

