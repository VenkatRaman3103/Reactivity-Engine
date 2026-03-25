import { DashboardLayout }   from './dashboard.layout'
import ReportsSidebar        from '../components/ReportsSidebar'
import ReportsContent        from '../components/ReportsContent'
import LoginPage             from '../components/LoginPage'

export class ReportsLayout extends DashboardLayout {

  // override sidebar
  sidebar = ReportsSidebar

  // override content
  Content() {
    if (this.loading) return this.LoadingOverlay()
    if (!this.user)   return <LoginPage />
    return <ReportsContent />
  }

  // new method — only in reports
  Filters() {
    return <div class="filters" style="background: #f8fafc; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #e2e8f0;">Report Filters</div>
  }

  // inherits everything else from DashboardLayout and BaseLayout
}

export const reportsLayout = new ReportsLayout()
