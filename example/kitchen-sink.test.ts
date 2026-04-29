import { suite, test, beforeEach, play, click, type, expect, see, pause, mock } from '@engine'
import { count, todos, inputValue, theme, items, isFetching, externalTodo, resetState } from './kitchen-sink.state'

suite('Comprehensive Tests', () => {

  beforeEach(() => {
    resetState()
  })

  test('Counter section', [
    expect(() => count).is(0),
    click('#counter-inc'),
    expect(() => count).is(1),
    click('#counter-dec'),
    expect(() => count).is(0),
  ])

  test('Todo List section', [
    expect(() => todos.length).is(3),
    type('#todo-input', 'New task'),
    click('#todo-add'),
    pause(500),
    expect(() => todos.length).is(4),
  ])

  test('Theme section', [
    expect(() => theme).is('light'),
    click('#theme-toggle'),
    expect(() => theme).is('dark'),
  ])

  test('Modal section', [
    see('#modal-overlay').absent(),
    click('#modal-open'),
    see('#modal-overlay').exists(),
    click('#modal-close'),
    see('#modal-overlay').absent(),
  ])

  test('Integration', [
    click('#counter-inc'),
    type('#todo-input', 'Integration task'),
    click('#todo-add'),
    click('#theme-toggle'),
    expect(() => theme).is('dark'),
  ])
})

export function runKitchenSinkTests() {
  play('Comprehensive Tests')
}
