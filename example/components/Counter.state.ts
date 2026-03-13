export let count = 20;
export let step = 1;

export function increment() {
  count += step;
}

export function decrement() {
  count -= step;
}

export function setStep(s: number) {
  step = s;
}

export function reset() {
  count = 0;
  step = 1;
}
