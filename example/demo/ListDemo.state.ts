import { untrack } from "@engine/index";

export let items = [
  { id: 1, text: 'Learn Reactivity Core' },
  { id: 2, text: 'Master Suspense Boundaries' }
];

export function addItem(text: string) {
  untrack(() => {
    items = [...items, { id: Date.now(), text }];
  });
}

export function removeItem(id: number) {
  items = items.filter(i => i.id !== id);
}

export function clearItems() {
  items = [];
}
