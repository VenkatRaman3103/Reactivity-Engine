import { dashboardLayout } from "./layouts/dashboard.layout";
import { reportsLayout } from "./layouts/reports.layout";
import {
  user,
  role,
  loading,
  setRole,
  setLoading,
  login,
  logout,
} from "./state/layout-test.state";

export default function LayoutTest() {
  return (
    <div class="demo-module">
      <div class="demo-doc-pane">
        <div class="demo-section-label">Documentation</div>
        <div style={{ marginBottom: "40px" }}>
          <h3
            style={{
              color: "var(--text-main)",
              marginBottom: "16px",
              fontSize: "20px",
            }}
          >
            The Layout System
          </h3>
          <p
            style={{
              color: "var(--text-dim)",
              lineHeight: "1.7",
              marginBottom: "16px",
            }}
          >
            The layout system demonstrates a powerful integration of classes with
            reactivity. When defining a Layout class, you can create fully tracked
            properties that components can subscribe to. 
          </p>
          <div class="tip-card" style={{ marginBottom: "24px" }}>
            <strong>Reactivity Meets OOP:</strong> State transitions like changing
            roles updates the layout's bound properties, reflecting
            dynamically in your components!
          </div>
          
          <h4
            style={{
              color: "var(--text-main)",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          >
            Layout Class Definition
          </h4>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>dashboard.layout.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">import</span> {"{ BaseLayout }"} <span class="highlight-keyword">from</span> <span class="highlight-string">'./base.layout'</span>{"\n"}
              <span class="highlight-keyword">import</span> {"{ effect }"} <span class="highlight-keyword">from</span> <span class="highlight-string">'@engine/index'</span>{"\n"}
              <span class="highlight-keyword">import</span> {"{ role }"} <span class="highlight-keyword">from</span> <span class="highlight-string">'../state/layout-test.state'</span>{"\n\n"}
              <span class="highlight-keyword">export class</span> <span class="highlight-func">DashboardLayout</span> <span class="highlight-keyword">extends</span> BaseLayout {"{"} {"\n\n"}
              {'  '}sidebar = Sidebar{"\n"}
              {'  '}role = <span class="highlight-string">'user'</span>{"\n\n"}
              {'  '}Content() {"{"} {"\n"}
              {'    '}if (this.loading) <span class="highlight-keyword">return</span> this.LoadingOverlay(){"\n"}
              {'    '}if (!this.user) <span class="highlight-keyword">return</span> &lt;LoginPage /&gt;{"\n"}
              {'    '}if (this.role === <span class="highlight-string">'admin'</span>) <span class="highlight-keyword">return</span> &lt;AdminDashboard /&gt;{"\n"}
              {'    '} <span class="highlight-keyword">return</span> &lt;Dashboard user={this.user} /&gt;{"\n"}
              {"  }"} {"\n\n"}
              {'  '}constructor() {"{"} {"\n"}
              {'    '}super(){"\n\n"}
              {'    '}effect(() ={">"} {"{"} {"\n"}
              {'      '}this.role = role{"\n"}
              {'      '}if (role === <span class="highlight-string">'admin'</span>) {"{"} {"\n"}
              {'        '}this.header = AdminHeader{"\n"}
              {'        '}this.sidebar = AdminSidebar{"\n"}
              {'      '}&nbsp;{"}"} <span class="highlight-keyword">else</span> {"{"} {"\n"}
              {'        '}this.header = Header{"\n"}
              {'        '}this.sidebar = Sidebar{"\n"}
              {'      '}&nbsp;{"}"} {"\n"}
              {"    "}&nbsp;{"}"} {"\n"}
              {"  }"} {"\n"}
              {"}"} {"\n\n"}
              <span class="highlight-keyword">export const</span> dashboardLayout = <span class="highlight-keyword">new</span> DashboardLayout()
            </div>
          </div>

          <h4
            style={{
              color: "var(--text-main)",
              marginBottom: "12px",
              fontSize: "16px",
            }}
          >
            Using Layout in Components
          </h4>
          <div class="demo-code-block">
            <div class="demo-code-header">
              <span>LayoutTest.tsx</span>
            </div>
            <div class="demo-code-content">
              <span class="highlight-keyword">const</span> layout = dashboardLayout{"\n\n"}
              <span class="highlight-comment">// Access reactive layout components</span>{"\n"}
              {"\n"}
              <span class="highlight-comment">// Header and sidebar are reactive properties</span>{"\n"}
              layout.header  <span class="highlight-comment">// dynamic header component</span>{"\n"}
              layout.sidebar <span class="highlight-comment">// dynamic sidebar component</span>{"\n"}
              <span class="highlight-comment">// Content method returns conditional JSX</span>{"\n"}
              layout.Content()
            </div>
          </div>

          <div class="tip-card" style={{ marginTop: "24px" }}>
            <strong>Note:</strong> The Layout system extends from BaseLayout which provides 
            shared properties like <code>user</code>, <code>loading</code>, <code>header</code>, 
            <code>footer</code> that are tracked reactively across your entire application!
          </div>

          <div
            class="controls"
            style="margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;"
          >
            <h4 style={{ color: "var(--text-main)" }}>State Controls</h4>
            <div
              style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;"
            >
              <button class={() => `demo-btn ${role === 'user' ? 'primary' : ''}`} onClick={() => setRole("user")}>
                User Role
              </button>
              <button class={() => `demo-btn ${role === 'admin' ? 'primary' : ''}`} onClick={() => setRole("admin")}>
                Admin Role
              </button>
              <button class={() => `demo-btn ${loading ? 'primary' : ''}`} onClick={() => setLoading(true)}>
                Start Loading
              </button>
              <button class={() => `demo-btn ${!loading ? 'primary' : ''}`} onClick={() => setLoading(false)}>
                Stop Loading
              </button>
              <button class={() => `demo-btn ${user?.name === 'Jane' ? 'primary' : ''}`} onClick={() => login("Jane")}>
                Login as Jane
              </button>
              <button class={() => `demo-btn ${!user ? 'primary' : ''}`} onClick={logout}>
                Logout
              </button>
            </div>
            <div style="margin-top: 1rem; color: var(--text-dim); font-size: 14px;">
              Current User Role: <strong style="color: var(--text-main)">{() => role}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="demo-demo-pane">
        <div class="demo-section-label">Live Example</div>
        <div class="demo-interactive" style="display: flex; gap: 2rem; flex-wrap: wrap; align-items: flex-start; background: var(--bg-deep); padding: 1.5rem; border-radius: 8px;">
          <div
            class="layout-section"
            style="flex: 1; min-width: 300px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position: relative; background: var(--bg-surface);"
          >
            <h3
              style="background: var(--bg-main); color: var(--text-main); margin: 0; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border);"
            >
              Dashboard Layout
            </h3>
            {dashboardLayout.Greet()}
            <div
              class="layout-demo"
              style="display: flex; flex-direction: column; min-height: 400px;"
            >
              {() => { const H = dashboardLayout.header; return <H /> }}
              <div class="layout-body" style="display: flex; flex: 1;">
                {() => { const S = dashboardLayout.sidebar; return <S /> }}
                <main style="flex: 1; padding: 1rem; position: relative;">
                  {() => dashboardLayout.WelcomeMessage()}
                  {() => dashboardLayout.Content()}
                </main>
              </div>
              {() => { const F = dashboardLayout.footer; return <F /> }}
            </div>
          </div>

          <div
            class="layout-section"
            style="flex: 1; min-width: 300px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; position: relative; background: var(--bg-surface);"
          >
            <h3
              style="background: var(--bg-main); color: var(--text-main); margin: 0; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border);"
            >
              Reports Layout
            </h3>
            <div
              class="layout-demo"
              style="display: flex; flex-direction: column; min-height: 400px;"
            >
              {() => { const H = reportsLayout.header; return <H /> }}
              <div class="layout-body" style="display: flex; flex: 1;">
                {() => { const S = reportsLayout.sidebar; return <S /> }}
                <main style="flex: 1; padding: 1rem; position: relative;">
                  {() => reportsLayout.Filters()}
                  {() => reportsLayout.Content()}
                </main>
              </div>
              {() => { const F = reportsLayout.footer; return <F /> }}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
