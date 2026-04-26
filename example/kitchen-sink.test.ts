
import { suite, test, beforeEach, play, click, type, expect, see, pause } from '@engine'
import { count, todos, inputValue, theme, resetState } from './kitchen-sink.state'

suite('Engine Kitchen Sink Suite', () => {

  beforeEach(() => {
    resetState()
  })

  test('Counter interactions', [
    expect(() => count).is(0),
    click('#counter-inc'),
    click('#counter-inc'),
    expect(() => count).is(2),
    click('#counter-dec'),
    expect(() => count).is(1),
  ])

  test('Todo list management', [
    expect(() => todos.length).is(3),
    type('#todo-input', 'Test our new runner'),
    click('#todo-add'),
    expect(() => todos.length).is(4),
    expect(() => todos[todos.length-1].text).is('Test our new runner'),
  ])

  test('Theme and Modal behavior', [
    expect(() => theme).is('light'),
    click('#theme-toggle'),
    expect(() => theme).is('dark'),
    
    see('#modal-overlay').absent(),
    click('#modal-open'),
    expect('#modal-overlay').toBeVisible(),
    
    click('#modal-close'),
    see('#modal-overlay').absent(),
  ])
})

export function runKitchenSinkSuite() {
  play('Engine Kitchen Sink Suite')
}
