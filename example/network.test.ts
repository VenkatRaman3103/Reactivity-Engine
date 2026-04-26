import { suite, test, mock, click, expect, find, wait, see, pause } from '@engine'

const API_URL = 'https://jsonplaceholder.typicode.com/todos/1'

suite('Network Mocking Suite', () => {
  
  test('Mocking JSONPlaceholder API', [
    // 1. Intercept the real URL
    mock(API_URL, {
      id: 1,
      title: 'Intercepted by Reactivity Engine!',
      completed: true
    }).delay(2000),

    // 2. Trigger the fetch
    click('#fetch-users'),
    
    // 3. Give 1 tick for the isFetching state to propagate to DOM
    pause(100),
    
    // 4. Watch the UI respond
    expect('#fetch-users').contains('Fetching...'),
    
    // 5. Wait for the data to be injected into the DOM
    wait(() => !!document.getElementById('ext-todo-status'), 4000),
    
    // 6. Verify the intercepted content actually rendered
    expect(find.text('Intercepted by Reactivity Engine!')).toBeVisible(),
    expect('#ext-todo-status').contains('Yes')
  ])

  test('Testing API Failure', [
    // Mock a 404 error
    mock(API_URL, { error: 'Not Found' }).status(404),
    
    click('#fetch-users'),
    pause(100),
    
    // Results should clear or stay empty on failure
    wait(() => !!document.getElementById('fetch-users'), 2000),
    expect('#fetch-users').contains('Fetch External Todo')
  ])
})
