
import { 
  count, todos, inputValue, isModalOpen, theme, items, externalTodo, isFetching,
  increment, decrement, addTodo, toggleTodo, removeTodo, setInput, toggleModal, toggleTheme,
  bulkAdd, clearItems, fetchUsers
} from './kitchen-sink.state'
import { log, format } from '@engine'
import { style } from '@engine/style'

const cardStyle = style({
  background: theme === 'light' ? '#fff' : '#1e1e1e',
  color: theme === 'light' ? '#000' : '#fff',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  marginBottom: '20px'
})

const buttonStyle = style({
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  background: '#7ec8e3',
  color: '#000',
  cursor: 'pointer',
  fontWeight: 'bold',
  hover: { background: '#9eddf5' }
})

const inputStyle = style({
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ccc',
  marginRight: '10px',
  width: '200px'
})

export default function KitchenSink() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <h1>Engine Kitchen Sink</h1>
      <h1>Venkat</h1>
      
      {/* Counter Section */}
      <div id="counter-card" class={cardStyle}>
        <h2>Counter</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button id="counter-dec" class={buttonStyle} onClick={decrement}>-</button>
          <span id="counter-val" style={{ fontSize: '24px', fontWeight: 'bold' }}>{count}</span>
          <button id="counter-inc" class={buttonStyle} onClick={increment}>+</button>
        </div>
      </div>

      {/* Todo Section */}
      <div class={cardStyle}>
        <h2>Todo List ({todos.length})</h2>
        <div style={{ marginBottom: '16px' }}>
          <input 
            id="todo-input"
            class={inputStyle} 
            value={inputValue} 
            onInput={(e: any) => {
              setInput(e.target.value)
              log.input(e.target.value)
            }}
            placeholder="What to do?"
          />
          <button id="todo-add" class={buttonStyle} onClick={() => addTodo(inputValue)}>Add Todo</button>
        </div>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {todos.map(todo => (
            <li id={`todo-${todo.id}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <input 
                type="checkbox" 
                checked={todo.completed} 
                onChange={() => toggleTodo(todo.id)} 
              />
              <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', flex: 1 }}>
                {todo.text}
              </span>
              <button 
                class={buttonStyle} 
                style={{ background: '#ff6b6b', padding: '4px 8px' }}
                onClick={() => removeTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Theme Section */}
      <div class={cardStyle}>
        <h2>Theme & Utils</h2>
        <p>Current Theme: <strong>{theme}</strong></p>
        <p>System Time: {format.time(new Date())}</p>
        <button id="theme-toggle" class={buttonStyle} onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
      </div>

      {/* Stress Test Section */}
      <div class={cardStyle}>
        <h2>Performance Stress Test</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button id="stress-bulk-add" class={buttonStyle} onClick={() => bulkAdd(111)}>
            Add 111 Items
          </button>
          <button id="bulk-clear" class={buttonStyle} style={{ background: '#eee' }} onClick={clearItems}>
            Clear
          </button>
          <span id="items-count" style={{ fontSize: '18px' }}>
            {items.length} items tracked
          </span>
        </div>
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
          {items.map(i => (
            <div style={{ width: '4px', height: '4px', background: '#7ec8e3' }} />
          ))}
        </div>
      </div>

      {/* Network Test Section */}
      <div class={cardStyle}>
        <h2>Network & Async</h2>
        <button id="fetch-users" class={buttonStyle} onClick={fetchUsers} disabled={isFetching}>
          {isFetching ? 'Fetching...' : 'Fetch External Todo'}
        </button>
        <div id="external-todo-result" style={{ marginTop: '16px' }}>
          {externalTodo && (
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '8px', borderLeft: '4px solid #7ec8e3' }}>
              <strong>Title:</strong> {externalTodo.title}<br/>
              <strong>Completed:</strong> <span id="ext-todo-status">{externalTodo.completed ? '✅ Yes' : '❌ No'}</span>
            </div>
          )}
          {!externalTodo && !isFetching && <p style={{ color: '#888' }}>No data loaded.</p>}
        </div>
      </div>

      {/* Modal Trigger */}
      <div class={cardStyle}>
        <h2>Modal & Portals</h2>
        <button id="modal-open" class={buttonStyle} onClick={toggleModal}>
          Open DevTools-style Modal
        </button>
      </div>

      {isModalOpen && (
        <div id="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={toggleModal}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '16px', color: '#000' }} onClick={e => e.stopPropagation()}>
            <h3>Modal Content</h3>
            <p>This is rendered only when isModalOpen is true.</p>
            <button id="modal-close" class={buttonStyle} onClick={toggleModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
