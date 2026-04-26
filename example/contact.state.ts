// example/contact.state.ts
// State for the Two-Way Binding Demo

export let firstName  = ''
export let lastName   = ''
export let email      = ''
export let phone      = ''
export let role       = 'user'
export let newsletter = false
export let bio        = ''
export let agreeTerms = false
export let loading    = false
export let submitted  = false
export let error: string | null = null

export function setFirstName(v: string)    { firstName  = v }
export function setLastName(v: string)     { lastName   = v }
export function setEmail(v: string)        { email      = v }
export function setPhone(v: string)        { phone      = v }
export function setRole(v: string)         { role       = v }
export function setNewsletter(v: boolean)  { newsletter = v }
export function setBio(v: string)          { bio        = v }
export function setAgreeTerms(v: boolean)  { agreeTerms = v }

export function resetForm() {
  firstName  = ''
  lastName   = ''
  email      = ''
  phone      = ''
  role       = 'user'
  newsletter = false
  bio        = ''
  agreeTerms = false
  submitted  = false
  error      = null
}

export async function submitForm(e: Event) {
  e.preventDefault()
  if (!firstName || !lastName || !email) {
    error = 'First name, last name and email are required.'
    return
  }
  if (!agreeTerms) {
    error = 'You must agree to the terms.'
    return
  }
  error   = null
  loading = true
  try {
    // Simulate a POST — engine will auto-mock this in tests
    await fetch('/api/contacts', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ firstName, lastName, email, phone, role, newsletter, bio })
    })
    submitted = true
  } catch (e: any) {
    error = e.message
  } finally {
    loading = false
  }
}
