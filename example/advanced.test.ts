
import { play, click, find, expect, see, pause, wait } from '@engine'
import { isModalOpen, theme, setTheme } from './kitchen-sink.state'

export function runAdvancedTest() {
  setTheme('light')
  play('Advanced Testing Features', [
    // 1. Hover & Focus test
    click(find.text('Switch to Dark Mode')),
    wait(() => theme === 'dark', 2000),
    pause(500),

    // 2. Test text-based selection
    click(find.text('Open DevTools-style Modal')),
    
    // 3. Wait for DOM to catch up then check visibility
    wait(() => !!document.getElementById('modal-overlay'), 3000),
    expect('#modal-overlay').toBeVisible(),
    
    // 4. Role-based selection
    click(find.role('button', 'Close')),
    see('#modal-overlay').absent(),

    // 5. Text selection for bulk add
    click(find.text('Add 111 Items')),
    expect('#items-count').contains('111'),
    
    pause(1000)
  ])
}
