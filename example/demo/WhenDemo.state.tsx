// example/demo/WhenDemo.state.tsx (force fresh compile v4)
import { whenever, when, untrack } from "@engine/index";

// --- Part 1: whenever (Counter) ---
export let count = 0;
export let total = 0;

whenever(count, () => {
  total = count * 2;
});

export function increment() { count++; }
export function decrement() { count--; }
export function resetCount() { count = 0; }

// --- Part 2: when (Login) ---
export let user: { name: string } | null = null;
export let welcomed = false;

when(user, () => {
  welcomed = true;
  // runs once — no matter how many times user changes
});

export function login()  { user = { name: 'John' }; }
export function logout() { user = null; }

// --- Part 3: whenever with switch (Cart) ---
export let items: any[] = [];
export let discount = 0;
export let message = 'Add items to get a discount';

whenever(items, () => {
  switch (true) {
    case items.length >= 15:
      discount = 30;
      message = '30% bulk discount applied';
      break;
    case items.length >= 10:
      discount = 20;
      message = '20% discount applied';
      break;
    case items.length >= 5:
      discount = 10;
      message = '10% discount applied';
      break;
    default:
      discount = 0;
      message = 'Add items to get a discount';
  }
});

export function addItem()    { untrack(() => { items = [...items, {}]; }); }
export function removeItem() { items = items.slice(0, -1); }
export function clearCart()  { items = []; }

// --- Part 4: Lifecycle Log ---
export let lifecycleLogs: string[] = [];
export let showLiveComponent = false;

export function addLifecycleLog(msg: string) {
  untrack(() => {
    lifecycleLogs = [`● ${msg}`, ...lifecycleLogs].slice(0, 10);
  });
}

export function toggleLiveComponent() {
  showLiveComponent = !showLiveComponent;
}
