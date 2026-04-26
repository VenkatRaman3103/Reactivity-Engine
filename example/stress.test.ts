
import { play, click, type, expect, pause, wait } from '@engine'
import { count, items, todos } from './kitchen-sink.state'

export function runStressTest() {
  play('Engine Performance Stress Test', [
    // 1. Moderate increments
    ...Array.from({ length: 10 }, () => click('#counter-inc')),
    wait(() => count === 10, 3000),
    
    // 2. Bulk items test (555 items total)
    click('#stress-bulk-add'), pause(200),
    click('#stress-bulk-add'), pause(200),
    click('#stress-bulk-add'), pause(200),
    click('#stress-bulk-add'), pause(200),
    click('#stress-bulk-add'), pause(200),
    wait(() => items.length === 555, 5000),
    
    // 3. Mixed interactions
    click('#theme-toggle'),
    click('#counter-dec'),
    click('#theme-toggle'),
    click('#counter-dec'),
    
    // 4. Todo manipulation - NOW WITH TEXT
    type('#todo-input', 'Stress testing todos'),
    click('#todo-add'),
    wait(() => todos.length === 4, 3000),

    // 5. Cleanup
    click('#bulk-clear'),
    wait(() => items.length === 0, 3000),
    
    pause(1000)
  ], { speed: 'normal' })
}
