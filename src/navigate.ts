import { mountComponent, unmountComponent } from "./component";
import { engineError, engineWarn, engineInfo } from "./errors";

interface Route {
  path: string;
  component: () => Node;
}

const routes: Route[] = [];
let current = window.location.pathname;
let container: Element | null = null;
const ROOT = "router-root";

export function setContainer(el: Element) {
  if (!el) {
    engineError({
      category: "Navigation",
      what: "setContainer() received null or undefined.",
      why: "The element does not exist in the DOM.",
      fix:
        "Make sure the element exists before calling setContainer.\n" +
        '  setContainer(document.getElementById("app")!)',
    });
  }
  container = el;
}

export function registerRoute(path: string, component: () => Node) {
  // warn — duplicate route
  if (routes.find((r) => r.path === path)) {
    engineWarn({
      category: "Navigation",
      what: `Route '${path}' is already registered.`,
      why: "registerRoute() was called twice with the same path.",
      fix: `Remove the duplicate registerRoute('${path}', ...) call.`,
    });
    return;
  }

  // warn — path does not start with /
  if (!path.startsWith("/") && path !== "*") {
    engineWarn({
      category: "Navigation",
      what: `Route path '${path}' does not start with '/'.`,
      why: "Route paths must be absolute.",
      fix: `Change '${path}' to '/${path}'.`,
    });
  }

  routes.push({ path, component });
  engineInfo("Navigation", `Route registered: ${path}`);
}

export function navigate(to: string | number) {
  if (typeof to === "number") {
    window.history.go(to);
    return;
  }

  // warn — no routes registered
  if (routes.length === 0) {
    engineWarn({
      category: "Navigation",
      what: `navigate('${to}') called but no routes are registered.`,
      fix:
        "Register routes before navigating.\n" +
        '  registerRoute("/", Home)\n' +
        '  registerRoute("/about", About)',
    });
    return;
  }

  // error — route does not exist
  const matched = match(to);
  if (!matched) {
    const registered = routes.map((r) => `  ${r.path}`).join("\n");
    engineWarn({
      category: "Navigation",
      what: `No route registered for '${to}'.`,
      why: "navigate() was called with a path that has not been registered.",
      fix:
        `Register the route or use an existing one.\n` +
        `Registered routes:\n${registered}\n` +
        `To add: registerRoute('${to}', YourComponent)`,
    });
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
  // error — no container
  if (!container) {
    engineError({
      category: "Navigation",
      what: "renderRoute() called but no container is set.",
      why: "setContainer() was never called.",
      fix:
        "Call setContainer() before renderRoute().\n" +
        '  setContainer(document.getElementById("app")!)\n' +
        "  renderRoute()",
    });
  }

  const matched = match(current);

  if (!matched) {
    const has404 = routes.find((r) => r.path === "*");
    if (!has404) {
      engineWarn({
        category: "Navigation",
        what: `No route matched '${current}' and no 404 route is registered.`,
        fix:
          `Register a wildcard route to handle unknown paths.\n` +
          `  registerRoute('*', NotFound)`,
      });
    }
    return;
  }

  unmountComponent(ROOT);
  mountComponent(matched.component, container, ROOT);
}

window.addEventListener("popstate", () => {
  current = window.location.pathname;
  renderRoute();
});
