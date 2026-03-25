// src/layout.ts

import { Signal } from './reactive'

let instanceCounter = 0

export class Layout {
  private __id: string;

  constructor() {
    this.__id = `layout-${instanceCounter++}`;
    const signals = new Map<string | symbol, Signal<any>>();
    
    const proxy = new Proxy(this, {
      get(target: any, prop: string | symbol, receiver: any) {
        if (prop === '__layoutId') return target.__id;

        const val = Reflect.get(target, prop, receiver);

        // skip private, internal
        if (typeof prop === 'symbol' || prop.startsWith('__') || prop === 'constructor') {
          return val;
        }

        if (typeof val === 'function') {
           // Cache bound methods on the target to preserve identity across Proxy accesses
           if (!target.__boundCache) {
             Object.defineProperty(target, '__boundCache', {
               value: new Map(),
               enumerable: false,
               configurable: true
             });
           }
           if (!target.__boundCache.has(prop)) {
             target.__boundCache.set(prop, val.bind(receiver));
           }
           return target.__boundCache.get(prop);
        }

        // track property access
        if (!signals.has(prop)) {
          const s = new Signal(val);
          s.label = `${target.__id}.${prop}`;
          signals.set(prop, s);
        }
        return signals.get(prop)!.value;
      },

      set(target: any, prop: string | symbol, value: any, receiver: any) {
        const result = Reflect.set(target, prop, value, receiver);
        
        if (typeof prop === 'string' && !prop.startsWith('__') && prop !== 'constructor' && typeof value !== 'function') {
          if (!signals.has(prop)) {
            const s = new Signal(value);
            s.label = `${target.__id}.${prop}`;
            signals.set(prop, s);
          } else {
            signals.get(prop)!.value = value;
          }
        }
        
        return result;
      }
    });

    return proxy;
  }

  get __layoutId() {
    return this.__id;
  }
}
