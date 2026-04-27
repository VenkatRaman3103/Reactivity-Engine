import { test, suite, click, see, expect, pause, beforeEach, settle, engineResetAllLazyStates } from '@engine'
 
suite('Lazy Loading', () => {
 
  beforeEach(async () => {
    // 1. Physically purge any leftover nodes with our IDs
    document.querySelectorAll('[id^="lazy-"]').forEach(el => el.remove());
    
    // 2. Reset the state of all lazy components
    if (typeof engineResetAllLazyStates === 'function') {
      engineResetAllLazyStates();
    } else {
      console.warn('[Test] engineResetAllLazyStates not found');
    }
    
    // 3. Reset the demo state
    (document.querySelector('#btn-reset-lazy') as HTMLElement)?.click()
    
    // 4. Wait for the engine to settle
    await settle()
  })
 
  test('Basic lazy load', [
    click('#btn-basic'),
    see('#lazy-basic-loading').exists(),
    see('#lazy-basic-content').absent(),
    
    // auto-polling `expect` or `see` will wait for load
    see('#lazy-basic-loading').absent(),
    see('#lazy-basic-content').exists(),
  ])

  test('Error handling', [
    click('#btn-error'),
    see('#lazy-error-loading').exists(),
    see('#lazy-error-content').absent(),
    
    see('#lazy-error-loading').absent(),
    see('#lazy-error-content').exists(),
    expect('#lazy-error-content').contains('Network failure'),
  ])

  test('Preloading', [
    click('#btn-preload-action'),
    // wait for preload to finish
    pause(3500),
    
    click('#btn-preload-show'),
    // Should render instantly: no loading frame
    see('#lazy-preload-loading').absent(),
    see('#lazy-preload-content').exists(),
  ])

  test('With Suspense', [
    click('#btn-suspense'),
    see('#suspense-fallback').exists(),
    see('#lazy-suspense-content').absent(),
    
    see('#suspense-fallback').absent(),
    see('#lazy-suspense-content').exists(),
  ])
})
