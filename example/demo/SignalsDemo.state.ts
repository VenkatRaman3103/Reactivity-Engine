export let count = 0;
export let show = true;
export let inputValue = "";
export let name = "";

export function increment() {
  count++;
}

export function reset() {
  count = 0;
}

export function toggle() {
  show = !show;
}

export function setInputValue(value: string) {
  inputValue = value;
}

export function setName(value: string) {
  name = value;
}
