import { mountComponent, unmountComponent } from "./component";

interface Route {
  path: string;
  component: () => Node;
}

const routes: Route[] = [];
let current = window.location.pathname;
let container: Element | null = null;
const ROOT = "router-root";

export function setContainer(el: Element) {
  container = el;
}

export function registerRoute(path: string, component: () => Node) {
  routes.push({ path, component });
}

export function navigate(to: string | number) {
  if (typeof to === "number") {
    window.history.go(to);
    return;
  }
  if (to === current) return;
  window.history.pushState({}, "", to);
  current = to;
  renderRoute();
}

export function route() {
  return current;
}

export function params(): Record<string, string> {
  const matched = match(current);
  if (!matched) return {};
  const rp = matched.path.split("/");
  const pp = current.split("/");
  const result: Record<string, string> = {};
  rp.forEach((seg, i) => {
    if (seg.startsWith(":")) result[seg.slice(1)] = pp[i];
  });
  return result;
}

export function query(): Record<string, string> {
  const result: Record<string, string> = {};
  new URLSearchParams(window.location.search).forEach(
    (v, k) => (result[k] = v),
  );
  return result;
}

function match(path: string): Route | null {
  const clean = path.split("?")[0];
  return (
    routes.find((r) => r.path === clean) ??
    routes.find((r) => {
      const rp = r.path.split("/");
      const pp = clean.split("/");
      return (
        rp.length === pp.length &&
        rp.every((s, i) => s.startsWith(":") || s === pp[i])
      );
    }) ??
    routes.find((r) => r.path === "*") ??
    null
  );
}

export function renderRoute() {
  if (!container) return;
  const matched = match(current);
  if (!matched) return;
  unmountComponent(ROOT);
  mountComponent(matched.component, container, ROOT);
}

window.addEventListener("popstate", () => {
  current = window.location.pathname;
  renderRoute();
});
