import { trackAsync } from "../../src/index";

export let userId = 1;
export let userData: any = null;

export async function setUserId(id: number) {
  userId = id;
  userData = null; 
  
  // Use trackAsync so Suspense knows we are loading
  userData = await trackAsync((async () => {
    await new Promise(r => setTimeout(r, 800)); // Sim delay
    const res = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
    return res.json();
  })());
}

// Initialize
setUserId(1);
