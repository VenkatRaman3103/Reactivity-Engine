import { BaseLayout }     from './base.layout'
import { effect }         from '@engine/index'
import { role }           from '../state/layout-test.state'
import AdminHeader        from '../components/AdminHeader'
import Header             from '../components/Header'
import Sidebar            from '../components/Sidebar'
import AdminSidebar       from '../components/AdminSidebar'
import Dashboard          from '../components/Dashboard'
import AdminDashboard     from '../components/AdminDashboard'
import LoginPage          from '../components/LoginPage'

export class DashboardLayout extends BaseLayout {

  // new properties
  sidebar = Sidebar
  role    = 'user'

  // override — dashboard has its own content
  Content() {
    if (this.loading)            return this.LoadingOverlay()
    if (!this.user)              return <LoginPage />
    if (this.role === 'admin')   return <AdminDashboard />
    return                              <Dashboard user={this.user} />
  }

  // new method
  WelcomeMessage() {
    if (!this.user) return null
    return <p class="welcome" style="margin-bottom: 1rem; color: #475569;">Welcome back {this.user.name}</p>
  }

  Greet(){
    return (
      <div>Hello world</div>
    )
  }

  constructor() {
    super()  // inherits header, footer, user, loading from BaseLayout

    // unconditionally track role and apply downstream layout modifications
    effect(() => {
      this.role = role
      
      if (role === 'admin') {
        this.header  = AdminHeader
        this.sidebar = AdminSidebar
      } else {
        this.header  = Header
        this.sidebar = Sidebar
      }
    })
  }
}

export const dashboardLayout = new DashboardLayout()
