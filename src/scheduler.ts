const componentQueue = new Set<string>();
const effectQueue = new Set<() => void>();
let pending = false;
let onUpdate: (id: string) => void = () => {};

export function setUpdateHandler(fn: (id: string) => void) {
  onUpdate = fn;
}

export function scheduleUpdate(id: string) {
  componentQueue.add(id);
  if (!pending) {
    pending = true;
    Promise.resolve().then(flush);
  }
}

export function scheduleEffect(fn: () => void) {
  effectQueue.add(fn);
  if (!pending) {
    pending = true;
    Promise.resolve().then(flush);
  }
}

function flush() {
  pending = false;

  const effects = new Set(effectQueue);
  effectQueue.clear();
  effects.forEach((fn) => fn());

  const components = new Set(componentQueue);
  componentQueue.clear();
  components.forEach((id) => onUpdate(id));
}
