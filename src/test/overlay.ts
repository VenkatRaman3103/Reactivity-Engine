
import { Step } from './index'

export function showTestOverlay(name: string, steps: Step[]) {
  const el    = document.createElement('div')
  el.id       = 'engine-test-overlay'

  el.innerHTML = `
    <div class="test-header">
      <span class="test-name">▶ ${name}</span>
      <span class="test-status running">Running</span>
    </div>
    <div class="test-steps">
      ${steps.map((step, i) => `
        <div class="test-step" data-index="${i}">
          <span class="step-indicator">○</span>
          <span class="step-label">${describeStep(step)}</span>
          <span class="step-time"></span>
        </div>
      `).join('')}
    </div>
    <div class="test-footer"></div>
  `

  injectTestStyles()
  document.body.appendChild(el)

  return {
    setActive(i: number) {
      el.querySelectorAll('.test-step')
        .forEach((s, j) => s.classList.toggle('active', j === i))
    },

    setResult(i: number, passed: boolean, error?: string) {
      const step = el.querySelector(`.test-step[data-index="${i}"]`)
      if (!step) return
      step.classList.add(passed ? 'passed' : 'failed')
      const indicator = step.querySelector('.step-indicator')!
      indicator.textContent = passed ? '✓' : '✗'
      if (error) {
        const label = step.querySelector('.step-label')!
        label.textContent += ` — ${error}`
      }
    },

    setComplete(passed: boolean, time: number) {
      const status = el.querySelector('.test-status')!
      status.textContent = passed ? 'Passed' : 'Failed'
      status.className   = `test-status ${passed ? 'passed' : 'failed'}`

      const footer = el.querySelector('.test-footer')!
      footer.textContent = `${time.toFixed(0)}ms`

      // auto dismiss after 3 seconds on pass
      if (passed) {
        setTimeout(() => el.remove(), 3000)
      }
    }
  }
}

function describeStep(step: Step): string {
  switch (step.type) {
    case 'click':   return `click ${step.selector}`
    case 'type':    return `type "${step.text}" in ${step.selector}`
    case 'wait':    return `wait for condition`
    case 'expect':  return `expect value ${step.matcher} ${JSON.stringify(step.expected)}`
    case 'see':     return `see ${step.selector} ${step.exists ? 'exists' : 'absent'}`
    case 'pause':   return `pause ${step.ms}ms`
    case 'log':     return `log to ${step.channel}`
    default:        return 'unknown step'
  }
}

function injectTestStyles() {
  if (document.querySelector('#engine-test-styles')) return

  const style = document.createElement('style')
  style.id    = 'engine-test-styles'
  style.textContent = `
    #engine-test-overlay {
      position:   fixed;
      bottom:     20px;
      right:      20px;
      background: #1a1a1a;
      border:     1px solid #333;
      border-radius: 8px;
      width:      320px;
      z-index:    99997;
      font-family: monospace;
      font-size:  12px;
      overflow:   hidden;
    }
    .test-header {
      display:     flex;
      justify-content: space-between;
      padding:     10px 14px;
      background:  #111;
      border-bottom: 1px solid #222;
    }
    .test-name    { color: #e0e0e0; font-weight: bold }
    .test-status  { font-size: 11px; padding: 2px 8px; border-radius: 4px }
    .test-status.running { background: #1a2d4a; color: #7ec8e3 }
    .test-status.passed  { background: #1a3028; color: #4eca8b }
    .test-status.failed  { background: #2d1515; color: #e54d4d }
    .test-steps   { padding: 8px 0; max-height: 240px; overflow-y: auto }
    .test-step    {
      display:    flex;
      align-items: center;
      gap:        8px;
      padding:    5px 14px;
      color:      #666;
      transition: background 0.15s;
    }
    .test-step.active  { background: #0d2030; color: #e0e0e0 }
    .test-step.passed  { color: #4eca8b }
    .test-step.failed  { color: #e54d4d; background: #1a0a0a }
    .step-indicator    { min-width: 14px; text-align: center }
    .step-label        { flex: 1 }
    .step-time         { color: #444; font-size: 10px }
    .test-footer       { padding: 6px 14px; color: #444; border-top: 1px solid #222 }
  `

  document.head.appendChild(style)
}
