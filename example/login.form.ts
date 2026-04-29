import { setError, touchAll, allValid } from '@engine/index'
import { whenever } from '@engine/index'
import type { Required, Email, MinLength } from '@engine/index'

export let email: Required & Email = 'some'
export let password: Required & MinLength<8> = ''
export let isValid = false
export let submitStatus = ''

whenever(() => [email.value, password.value], () => {
  isValid = allValid(email, password)
})

export async function submit() {
  touchAll(email, password)
  if (!isValid) return

  submitStatus = 'Submitting...'

  // mock network request
  await new Promise(r => setTimeout(r, 600))

  if (email.value === 'error@example.com') {
    setError(email, 'Email is already taken')
    submitStatus = 'Error occurred'
  } else {
    submitStatus = 'Successfully logged in!'
  }
}
