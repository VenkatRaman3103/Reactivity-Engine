
import { play, click, type, expect, see, pause, wait } from '@engine'
import { count, todos, inputValue, isModalOpen, theme } from './kitchen-sink.state'

export function runKitchenSinkTest() {
  play('Engine Kitchen Sink E2E', [
    // 1. Test Counter
    expect(() => count).is(0),
    click('#counter-inc'),
    click('#counter-inc'),
    expect(() => count).is(2),
    click('#counter-dec'),
    expect(() => count).is(1),
    
    // 2. Test Todo List
    expect(() => todos.length).is(3),
    type('#todo-input', 'Test our new runner'),
    expect(() => inputValue).is('Test our new runner'),
    click('#todo-add'),
    expect(() => todos.length).is(4),
    expect(() => todos[todos.length-1].text).is('Test our new runner'),
    
    // 3. Test Theme Toggle
    expect(() => theme).is('light'),
    click('#theme-toggle'),
    expect(() => theme).is('dark'),
    pause(500),
    click('#theme-toggle'),
    expect(() => theme).is('light'),
    
    // 4. Test Modal
    see('#modal-overlay').absent(),
    click('#modal-open'),
    see('#modal-overlay').exists(),
    pause(500),
    click('#modal-close'),
    see('#modal-overlay').absent(),

    pause(1000)
  ], { speed: 'normal' })
}
