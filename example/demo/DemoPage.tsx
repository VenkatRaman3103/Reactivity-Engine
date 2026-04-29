import { h, onMount } from "../../src/index";
import {
  activeTab,
  setActiveTab,
  isSidebarOpen,
  toggleSidebar,
  theme,
  toggleTheme,
} from "./demo.state";
import "./DemoStyles.css";

import SignalsDemo from "./SignalsDemo";
import SharedDemo from "./SharedDemo";
import ListDemo from "./ListDemo";
import DerivedDemo from "./DerivedDemo";
import EffectDemo from "./EffectDemo";
import AsyncDemo from "./AsyncDemo";
import StateDemo from "./StateDemo";
import WhenDemo from "./WhenDemo";
import LayoutTest from "../LayoutTest";
import KitchenSink from "../KitchenSink";

import FormDemo from "./FormDemo";
import BindingDemo from "./BindingDemo";
import PersistDemo from "../PersistDemo";
import LazyLoadDemo from "./LazyLoadDemo";
import SVGDemo from "./SVGDemo";
import StylingDemo from "./StylingDemo";
import TestingDemo from "./TestingDemo";
import DevToolsDemo from "./DevToolsDemo";
import RoutingDemo from "./RoutingDemo";
import UtilitiesDemo from "./UtilitiesDemo";
import PortalDemo from "./PortalDemo";
import MemoDemo from "./MemoDemo";
import RefDemo from "./RefDemo";
import SlotDemo from "./SlotDemo";

const modules = [
  {
    id: "signals",
    title: "Signals",
    desc: "Atomic state primitives",
    component: SignalsDemo,
  },
  {
    id: "testing",
    title: "Testing Framework",
    desc: "Built-in test runner",
    component: TestingDemo,
  },
  {
    id: "list",
    title: "Collections",
    desc: "Reactive arrays & lists",
    component: ListDemo,
  },
  {
    id: "shared",
    title: "Shared State",
    desc: "Cross-component sync",
    component: SharedDemo,
  },
  {
    id: "derived",
    title: "Derived",
    desc: "Auto-computed values",
    component: DerivedDemo,
  },
  {
    id: "effects",
    title: "Effects",
    desc: "Side effects & Life-cycle",
    component: EffectDemo,
  },
  {
    id: "async",
    title: "Async/Suspense",
    desc: "Integrated async flow",
    component: AsyncDemo,
  },
  {
    id: "state",
    title: "State Guard",
    desc: "Mutation protection",
    component: StateDemo,
  },
  {
    id: "conditional",
    title: "When / Whenever",
    desc: "Lifecycle & Conditions",
    component: WhenDemo,
  },
  {
    id: "layout",
    title: "Layout System",
    desc: "Class-based reactivity",
    component: LayoutTest,
  },
  {
    id: "forms",
    title: "Form Handling",
    desc: "Validation & reactive fields",
    component: FormDemo,
  },
  {
    id: "binding",
    title: "Two-Way Binding",
    desc: "Compiler-powered bind:*",
    component: BindingDemo,
  },
  {
    id: "persist",
    title: "State Persistence",
    desc: "Zero-config localStorage",
    component: PersistDemo,
  },
  {
    id: "lazy",
    title: "Lazy Loading",
    desc: "Code-split components",
    component: LazyLoadDemo,
  },
  {
    id: "svg",
    title: "SVG Demo",
    desc: "SVG support & namespace",
    component: SVGDemo,
  },
  {
    id: "routing",
    title: "Routing",
    desc: "Client-side navigation",
    component: RoutingDemo,
  },
  {
    id: "styling",
    title: "Styling System",
    desc: "TS-to-CSS conversion",
    component: StylingDemo,
  },
  {
    id: "devtools",
    title: "DevTools",
    desc: "Built-in developer tools",
    component: DevToolsDemo,
  },
  {
    id: "utilities",
    title: "Utilities",
    desc: "DOM, format, device & more",
    component: UtilitiesDemo,
  },
  {
    id: "portal",
    title: "Portals",
    desc: "Render in external DOM",
    component: PortalDemo,
  },
  {
    id: "memo",
    title: "Memoization",
    desc: "Skip unnecessary re-renders",
    component: MemoDemo,
  },
  {
    id: "refs",
    title: "Ref System",
    desc: "DOM element references",
    component: RefDemo,
  },
  {
    id: "slots",
    title: "Slots",
    desc: "Content distribution",
    component: SlotDemo,
  },
];

export default function DemoPage() {
  onMount(() => {
    document.documentElement.setAttribute("data-theme", theme);
  });

  return (
    <div id="demo-layout">
      <div
        class={() => (isSidebarOpen ? "overlay active" : "overlay")}
        onClick={() => toggleSidebar()}
      ></div>

      <div id="demo-sidebar" class={() => (isSidebarOpen ? "open" : "")}>
        <div class="sidebar-header">
          <h1 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Reactivity
            <span
              class="demo-badge"
              style={{ verticalAlign: "middle", marginTop: "2px" }}
            >
              ENGINE v1.0
            </span>
          </h1>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-dim)",
              fontWeight: "bold",
              marginTop: "4px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            Engine Explorer
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {modules.map((m) => (
            <div
              class={() =>
                activeTab === m.id ? "sidebar-item active" : "sidebar-item"
              }
              onClick={() => setActiveTab(m.id)}
            >
              <span class="sidebar-item-title">{m.title}</span>
              <span class="sidebar-item-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div id="demo-main">
        <header id="demo-header">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button class="menu-toggle" onClick={toggleSidebar}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>

            <div class="demo-title-container">
              <h2
                style={{
                  fontSize: "15px",
                  color: "var(--text-main)",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                {() => modules.find((m) => m.id === activeTab)?.title}
              </h2>
              <div
                style={{
                  fontSize: "10px",
                  color: "var(--text-dim)",
                  fontWeight: "bold",
                  marginTop: "4px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                {() => modules.find((m) => m.id === activeTab)?.desc}
              </div>
            </div>
          </div>

          <div class="header-actions">
            <div style={{ display: "flex", gap: "16px" }}>
              <a
                href="https://venkatraman.in/"
                target="_blank"
                class="social-link"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                <span class="social-label">venkatraman.in</span>
              </a>
              <a
                href="https://github.com/VenkatRaman3103"
                target="_blank"
                class="social-link"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                <span class="social-label">GitHub</span>
              </a>
            </div>
            <button class="theme-toggle" onClick={toggleTheme}>
              {() =>
                theme === "dark" ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    style={{ width: "16px", height: "16px" }}
                  >
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    style={{ width: "16px", height: "16px" }}
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )
              }
              <span class="theme-label">
                {() => (theme === "dark" ? "Light Mode" : "Dark Mode")}
              </span>
            </button>
          </div>
        </header>

        <div id="demo-content-container">
          {() => {
            const module = modules.find((m) => m.id === activeTab);
            return module?.component ? module.component() : <div class="demo-module">Feature demo coming soon...</div>;
          }}
        </div>
      </div>
    </div>
  );
}
