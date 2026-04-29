import { Layout } from '@engine/layout'
import { h } from '@engine/dom'
import { currentPage } from './docs.state'

export class DocsLayout extends Layout {
  title = 'Reactivity Engine Docs'

  header() {
    return (
      <header style="padding: 16px 32px; border-bottom: 1px solid #252525; background: #151515;">
        <h1 style="font-size: 24px; font-weight: 700; color: #4f8ef7; margin: 0;">
          {this.title}
        </h1>
        <p style="color: #888; margin: 4px 0 0 0; font-size: 14px;">
          Documentation for the Reactivity Engine
        </p>
      </header>
    )
  }

  sidebar() {
    return (
      <aside style="width: 260px; background: #151515; border-right: 1px solid #252525; padding: 16px; min-height: 100vh; position: fixed; left: 0; top: 0;">
        {this.slot('sidebar')}
      </aside>
    )
  }

  content() {
    return (
      <main style="margin-left: 260px; padding: 32px; max-width: 900px;">
        {this.slot()}
      </main>
    )
  }

  footer() {
    return (
      <footer style="padding: 16px 32px; border-top: 1px solid #252525; text-align: center; color: #666; font-size: 13px;">
        Built with Reactivity Engine | Ctrl+Shift+E for DevTools
      </footer>
    )
  }
}
