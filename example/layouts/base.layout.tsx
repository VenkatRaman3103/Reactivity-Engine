import { Layout }         from '@engine/index'
import { effect }         from '@engine/index'
import { user, loading }  from '../state/layout-test.state'
import Header             from '../components/Header'
import Footer             from '../components/Footer'
import Spinner            from '../components/Spinner'

export class BaseLayout extends Layout {

  // properties
  header  = Header
  footer  = Footer
  loading = false
  user: any = null

  // methods
  Spinner() {
    return <Spinner />
  }

  LoadingOverlay() {
    if (!this.loading) return null
    return (
      <div class="loading-overlay" style="position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white;">
        <this.Spinner />
      </div>
    )
  }

  constructor() {
    super()

    effect(() => { this.loading = loading })
    effect(() => { this.user    = user    })
  }
}
