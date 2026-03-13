export interface Ref<T extends Element = Element> {
  set: (el: T) => void;
  current: T | null;
}

export function ref<T extends Element = Element>(): Ref<T> {
  let el: T | null = null;
  return {
    set(node: T) {
      el = node;
    },
    get current() {
      return el;
    },
  };
}
