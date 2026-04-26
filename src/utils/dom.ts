
export const dom = {
  get:        (sel: string)    => document.querySelector(sel),
  getAll:     (sel: string)    => [...document.querySelectorAll(sel)],
  id:         (id: string)     => document.getElementById(id),
  addClass:   (el: Element, c: string) => el.classList.add(c),
  removeClass:(el: Element, c: string) => el.classList.remove(c),
  toggleClass:(el: Element, c: string) => el.classList.toggle(c),
  hasClass:   (el: Element, c: string) => el.classList.contains(c),
  attr:       (el: Element, k: string, v?: string) =>
                v !== undefined ? el.setAttribute(k, v) : el.getAttribute(k),
  on: (el: Element, event: string, fn: EventListener) =>
        el.addEventListener(event, fn),
  off:(el: Element, event: string, fn: EventListener) =>
        el.removeEventListener(event, fn),
  scrollTo: (el: Element) =>
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
