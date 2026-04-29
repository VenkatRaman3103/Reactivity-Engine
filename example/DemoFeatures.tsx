import { h, Fragment } from '@engine/dom'
import { createEffect } from '@engine/index'
import { count, message, isVisible, items, increment, toggleVisibility, addItem, resetAll } from './demo-features.state'
import { demoBox, button, paragraph } from './docs.style'

export default function DemoFeatures() {
  createEffect(() => {
    console.log('Count changed:', count)
  })

  return (
    <div>
      <div class={demoBox}>
        <h3>Live State Demo</h3>
        <p class={paragraph}>Count: {count}</p>
        <button class={button} onClick={increment}>Increment</button>
      </div>

      <div class={demoBox}>
        <h3>Reactive Text</h3>
        <p class={paragraph}>{message}</p>
      </div>

      <div class={demoBox}>
        <h3>Conditional Rendering</h3>
        <button class={button} onClick={toggleVisibility}>
          {isVisible ? 'Hide' : 'Show'}
        </button>
        {isVisible && <p class={paragraph}>Now you see me!</p>}
      </div>

      <div class={demoBox}>
        <h3>Dynamic List</h3>
        <button class={button} onClick={addItem}>Add Item</button>
        <ul>
          {items.map(item => <li>{item}</li>)}
        </ul>
      </div>

      <div class={demoBox}>
        <button class={button} onClick={resetAll}>Reset All</button>
      </div>
    </div>
  )
}
