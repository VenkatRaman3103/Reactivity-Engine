import { untrack } from "@engine/index";

export let count = 0;
export let logs: string[] = [];

export function increment() {
  count++;
}

export function addLog(msg: string) {
  untrack(() => {
    logs = [`${new Date().toLocaleTimeString()} - ${msg}`, ...logs].slice(0, 5);
  });
}
export function reset() {
  count = 0;
  logs = [];
}
