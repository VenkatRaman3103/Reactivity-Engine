import { effect } from "./src/effect";
import { Signal } from "./src/reactive";
import { wrapState } from "./src/state";
import { Layout } from "./src/layout";

export let stateRole = 'user';
export function setRole(r: string) { stateRole = r; notifyRole(); }
const roleSignal = new Signal('user');
function notifyRole() { roleSignal.value = stateRole; }

function whenever(cond: () => any, fn: () => void) {
  effect(() => {
    if (cond()) fn();
  });
}

class DashboardLayout extends Layout {
  role = 'user';
  constructor() {
    super();
    whenever(() => roleSignal.value, () => {
      this.role = roleSignal.value;
    });
  }
}

const layout = new DashboardLayout();

effect(() => {
  console.log("Layout UI Tracking layout.role. Value:", layout.role);
});

console.log("Setting role to admin");
setRole("admin");
