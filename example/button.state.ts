
export let isDisabled = false
export let variant = 'primary'

export function toggleDisabled() {
  isDisabled = !isDisabled
}

export function cycleVariant() {
  variant = variant === 'primary' ? 'secondary' : 'primary'
}
//