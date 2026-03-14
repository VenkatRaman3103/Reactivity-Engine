export let count = 0;
export let show = true;

export function increment() {
  count++;
}

export function reset() {
  count = 0;
}

export function toggle() {
  show = !show;
}
