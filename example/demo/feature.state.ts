export let count = 0;
export let user = { name: 'Demo User', settings: { theme: 'dark' } };

export function increment() {
  count++;
}

export function updateName(newName: string) {
  user.name = newName;
}
