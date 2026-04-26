import { test, suite, click, see, expect, pause } from '@engine'

suite('Lazy Loading', () => {

  test('Basic lazy load', [
    click('#btn-basic'),
    see('#basic-loading').exists(),
    see('#basic-content').absent(),
    
    // auto-polling `expect` or `see` will wait for load
    see('#basic-loading').absent(),
    see('#basic-content').exists(),
  ])

  test('Error handling', [
    click('#btn-error'),
    see('#error-loading').exists(),
    see('#error-content').absent(),
    
    see('#error-loading').absent(),
    see('#error-content').exists(),
    expect('#error-content').contains('Network failure'),
  ])

  test('Preloading', [
    click('#btn-preload-action'),
    // wait for preload to finish
    pause(600),
    
    click('#btn-preload-show'),
    // Should render instantly: no loading frame
    see('#preload-loading').absent(),
    see('#preload-content').exists(),
  ])

  test('With Suspense', [
    click('#btn-suspense'),
    see('#suspense-fallback').exists(),
    see('#suspense-content').absent(),
    
    see('#suspense-fallback').absent(),
    see('#suspense-content').exists(),
  ])
})
