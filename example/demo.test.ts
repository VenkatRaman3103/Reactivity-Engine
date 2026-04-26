
import { play, click, expect, pause } from '@engine'
import { isDisabled, variant } from './button.state'

export function runDemoTest() {
  play('Theme & State Flow', [
    // Verify initial state
    expect(() => isDisabled).is(false),
    expect(() => variant).is('primary'),

    // Toggle disabled
    click('#toggle-btn'),
    expect(() => isDisabled).is(true),
    pause(500),

    // Cycle variant
    click('#cycle-btn'),
    expect(() => variant).is('secondary'),
    pause(500),

    // Reset
    click('#toggle-btn'),
    expect(() => isDisabled).is(false),
    pause(500),

    click('#cycle-btn'),
    expect(() => variant).is('primary'),
    
    pause(1000)
  ], { speed: 'normal' })
}
