import { suite, test, expect, pause, run } from '../src/test/index'
import { field } from '../src/form/field'
import { required, email, minLength } from '../src/form/rules'
import { setError, clearError, touchAll, allValid } from '../src/form/helpers'
import { whenever } from '../src/when'

suite('Form Field', () => {

  let f: any;

  test('initial value set correctly', [
    run(() => { f = field('initial') }),
    expect(() => f.value).is('initial')
  ])

  test('error null before touch', [
    run(() => { f = field('', required('req')) }),
    expect(() => f.error).is(null)
  ])

  test('error shows after touch', [
    run(() => { 
      f = field('', required('req'))
      f.touch()
    }),
    pause(10),
    expect(() => f.error).is('req')
  ])

  test('ok true when no rule errors', [
    run(() => { f = field('valid', required('req')) }),
    pause(10),
    expect(() => f.ok).is(true)
  ])

  test('ok false when rule error exists', [
    run(() => { f = field('', required('req')) }),
    pause(10),
    expect(() => f.ok).is(false)
  ])

  test('reset restores initial value', [
    run(() => {
      f = field('initial', required('req'))
      f.value = 'changed'
      f.touch()
    }),
    pause(10),
    expect(() => f.value).is('changed'),
    run(() => { f.reset() }),
    pause(10),
    expect(() => f.value).is('initial'),
    expect(() => f.touched).is(false),
    expect(() => f.error).is(null)
  ])

})

suite('Form Rules', () => {
  let f: any;

  test('required — empty string fails', [
    run(() => { f = field('', required('req')); f.touch() }),
    pause(10),
    expect(() => f.error).is('req')
  ])

  test('required — whitespace fails', [
    run(() => { f = field('   ', required('req')); f.touch() }),
    pause(10),
    expect(() => f.error).is('req')
  ])

  test('required — null fails', [
    run(() => { f = field(null, required('req')); f.touch() }),
    pause(10),
    expect(() => f.error).is('req')
  ])

  test('email — invalid format fails', [
    run(() => { f = field('invalid', email('bad email')); f.touch() }),
    pause(10),
    expect(() => f.error).is('bad email')
  ])

  test('email — valid format passes', [
    run(() => { f = field('test@example.com', email('bad email')); f.touch() }),
    pause(10),
    expect(() => f.error).is(null)
  ])

  test('minLength — short value fails', [
    run(() => { f = field('ab', minLength(3, 'too short')); f.touch() }),
    pause(10),
    expect(() => f.error).is('too short')
  ])

  test('minLength — exact length passes', [
    run(() => { f = field('abc', minLength(3, 'too short')); f.touch() }),
    pause(10),
    expect(() => f.error).is(null)
  ])

  test('async custom rule works', [
    run(() => {
      const customAsyncRule = async (val: any) => {
        await new Promise(r => setTimeout(r, 10))
        return val === 'async' ? null : 'async failed'
      }
      f = field('test', customAsyncRule)
      f.touch()
    }),
    pause(20),
    expect(() => f.error).is('async failed')
  ])

})

suite('Form Helpers', () => {
  let f1: any, f2: any;

  test('setError — sets custom error immediately', [
    run(() => {
      f1 = field('initial')
      setError(f1, 'Custom Error')
    }),
    expect(() => f1.error).is('Custom Error')
  ])

  test('clearError — removes custom error', [
    run(() => {
      f1 = field('initial')
      setError(f1, 'Custom Error')
      clearError(f1)
    }),
    expect(() => f1.error).is(null)
  ])

  test('touchAll — touches all fields', [
    run(() => {
      f1 = field('', required('req'))
      f2 = field('', required('req'))
      touchAll(f1, f2)
    }),
    pause(10),
    expect(() => f1.touched).is(true),
    expect(() => f2.touched).is(true),
    expect(() => f1.error).is('req'),
    expect(() => f2.error).is('req')
  ])

  test('allValid — false if any field invalid', [
    run(() => {
      f1 = field('valid', required('req'))
      f2 = field('', required('req'))
    }),
    pause(10),
    expect(() => allValid(f1, f2)).is(false)
  ])

})

suite('Form Cross Field', () => {

  let f1: any, f2: any;

  test('whenever reads other field value', [
    run(() => {
      f1 = field('initial')
      f2 = field('dependent')
      whenever(() => [f1.value], () => {
        f2.value = f1.value + ' updated'
      })
      f1.value = 'changed'
    }),
    pause(10),
    expect(() => f2.value).is('changed updated')
  ])

  test('validation reruns when dependency changes', [
    run(() => {
      // In a real environment dependency would be state
      // Here just to test the validation trigger works
      const testState = { val: 5 }
      f1 = field('test', () => testState.val > 10 ? 'dep failed' : null)
      f1.testState = testState
      f1.touch()
    }),
    pause(10),
    expect(() => f1.error).is(null),
    run(() => {
      f1.testState.val = 15
      f1.touch()
    }),
    pause(10),
    expect(() => f1.error).is('dep failed')
  ])

})
