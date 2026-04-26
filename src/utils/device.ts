
export const device = {
  get isMobile()     { return window.innerWidth < 768 },
  get isTablet()     { return window.innerWidth >= 768 && window.innerWidth < 1024 },
  get isDesktop()    { return window.innerWidth >= 1024 },
  get isTouch()      { return 'ontouchstart' in window },
  get isOnline()     { return navigator.onLine },
  get isDark()       {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  get isReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },
  get platform() {
    const ua = navigator.userAgent.toLowerCase()
    if (ua.includes('mac'))  return 'mac'
    if (ua.includes('win'))  return 'windows'
    if (ua.includes('linux')) return 'linux'
    return 'unknown'
  }
}
