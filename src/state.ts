import { Signal, batch } from "./reactive";
import { engineError, engineWarn } from "./errors";

const signalCache = new Map<string, Map<string, Signal<any>>>();

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

    if (typeof initialVal === "function") {
      // Wrap functions in a batch to group state changes
      wrapped[key] = (...args: any[]) => {
        try {
          let result: any;
          batch(() => {
            result = initialVal(...args);
          });

          if (result instanceof Promise) {
            return result
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
              });
          }
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
          // warn if value is undefined and probably not initialised
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
        set(v) {
          signal.value = v;
        },
        enumerable: true,
        configurable: true,
      });
    }
  });

  // proxy to catch direct mutation from outside the state file
  return new Proxy(wrapped as T, {
    set(target, prop, value) {
      engineWarn({
        category: "State",
        file,
        what: `Direct mutation of '${String(prop)}' from outside '${file}'.`,
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
