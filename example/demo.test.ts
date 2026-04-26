
import { test, play, click, expect, pause } from '@engine'
import { isDisabled, variant } from './button.state'

test('Theme & State Flow', [
  // Verify initial state
  expect(() => isDisabled).is(false),
  expect(() => variant).is('primary'),

  // Toggle disabled
  click('#toggle-btn'),
  expect(() => isDisabled).is(true),

  // Cycle variant
  click('#cycle-btn'),
  expect(() => variant).is('secondary'),

  // Reset
  click('#toggle-btn'),
  expect(() => isDisabled).is(false),

  click('#cycle-btn'),
  expect(() => variant).is('primary'),
])

export function runDemoTest() {
  play('Global Tests')
}
