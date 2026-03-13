export * from "./component";
export * from "./memo";
export * from "./dom";
export * from "./effect";
export * from "./navigate";
export * from "./reactive";
export * from "./ref";
export * from "./scheduler";
export * from "./state";

export { h as __h } from "./dom";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends Node {}
  }
}
