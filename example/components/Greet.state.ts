export let name = "";

export function updateName(val: string) {
  for (let i = 0; i < val.length; i++) {
    console.log(val[i]);
  }

  name = val[val.length - 1];
}
