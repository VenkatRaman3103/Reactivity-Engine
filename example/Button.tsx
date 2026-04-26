
import { button } from './button.style'
import { toggleDisabled, cycleVariant } from './button.state'

export default function Button(props: { children?: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <div>
        <button 
          class={button}
          onClick={() => console.log('Clicked!')}
        >
          {props.children || 'Reactive Button'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={toggleDisabled}>
          Toggle Disabled
        </button>
        <button onClick={cycleVariant}>
          Cycle Variant
        </button>
      </div>
    </div>
  )
}
