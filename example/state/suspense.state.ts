export let data: any = { status: "Awaiting load" };

export async function loadData() {
  data = { status: "Fetching..." };
  
  // Wait for 3 seconds to simulate an API request
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  data = {
    status: "Success",
    records: [
      { id: 1, title: "Reactivity Engine v2" },
      { id: 2, title: "HMR Working flawlessly" },
      { id: 3, title: "Slots fully operational" }
    ],
    timestamp: Date.now()
  };
}
