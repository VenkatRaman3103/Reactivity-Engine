export * from "./component";
export * from "./memo";
export * from "./dom";
export * from "./effect";
export * from "./navigate";
export * from "./reactive";
export * from "./ref";
export * from "./scheduler";
export * from "./state";
export * from "./layout";
export { whenever, when } from "./when";
export { Mount, Unmount, Err, type ErrObject } from "./lifecycle";
export {
  showOverlay,
  dismissOverlay,
  type OverlayError,
} from "./error-overlay";
export { derive } from "./derived";

export { h as __h } from "./dom";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends Node {}
  }
}

export { toggleDevPanel } from "./devtools";
export { Suspense, trackAsync, isPending } from "./suspense";
export { slot } from "./slot";
export { portal, closePortal } from "./portal";
export { log } from "./log";
export { play } from "./test/runner";
export { 
  click, type, wait, expect, see, pause, find,
  suite, test, beforeEach
} from "./test/index";
export * from "./utils/index";

if (import.meta.env.DEV) {
  Promise.all([
    import('./hmr').then(m      => m.initHMR()),
    import('./devtools').then(m => m.initDevTools())
  ])
}


// trigger vite reload
// trigger 2
// trigger 3
