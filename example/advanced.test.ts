
import { play, click, find, expect, see, pause } from '@engine'
import { theme, setTheme } from './kitchen-sink.state'

export function runAdvancedTest() {
  setTheme('light')
  
  play('Advanced Testing Features', [
    click(find.text('Venkat')),

    // 1. Interaction (Auto-waits for element)
    click(find.text('Switch to Dark Mode')),
    
    // 2. State Assertion (Auto-polls for value)
    expect(() => theme).is('dark'),

    // 3. Complex Selection
    click(find.text('Open DevTools-style Modal')),
    
    // 4. Visibility (Auto-polls until visible)
    expect('#modal-overlay').toBeVisible(),
    
    // 5. Native Roles
    click(find.role('button', 'Close')),
    
    // 6. Absence Check (Auto-waits for removal)
    see('#modal-overlay').absent(),

    // 7. Content check
    click(find.text('Add 111 Items')),
    expect('#items-count').contains('111'),
    
    pause(1000)
  ])
}
