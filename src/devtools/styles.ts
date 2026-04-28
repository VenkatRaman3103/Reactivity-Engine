// src/devtools/styles.ts

export function injectStyles() {
  if (document.querySelector('#engine-devtools-styles')) return

  const style = document.createElement('style')
  style.id    = 'engine-devtools-styles'
  style.textContent = `

    /* ── Launcher ─────────────────────────────── */

    #engine-launcher {
      position:  fixed;
      bottom:    20px;
      right:     20px;
      z-index:   99990;
      display:   flex;
      flex-direction: column;
      align-items: flex-end;
      gap:       8px;
    }

    .launcher-btn {
      width:         40px;
      height:        40px;
      background:    #1a1a1a;
      border:        1px solid #333;
      border-radius: 50%;
      color:         #7ec8e3;
      font-size:     18px;
      cursor:        pointer;
      display:       flex;
      align-items:   center;
      justify-content: center;
      transition:    all 0.15s;
    }
    .launcher-btn:hover { background: #222; border-color: #4f8ef7 }

    .launcher-menu {
      display:        flex;
      flex-direction: column;
      gap:            4px;
      opacity:        0;
      pointer-events: none;
      transform:      translateY(8px);
      transition:     all 0.15s;
    }
    .launcher-menu.visible {
      opacity:        1;
      pointer-events: auto;
      transform:      translateY(0);
    }

    .launcher-item {
      background:    #1a1a1a;
      border:        1px solid #333;
      border-radius: 6px;
      color:         #e0e0e0;
      font-family:   monospace;
      font-size:     12px;
      padding:       8px 14px;
      cursor:        pointer;
      white-space:   nowrap;
      text-align:    left;
      transition:    all 0.15s;
    }
    .launcher-item:hover { background: #222; border-color: #4f8ef7 }

    /* ── Floating window ──────────────────────── */

    #engine-comp-window {
      position:      fixed;
      width:         760px;
      height:        520px;
      background:    #111;
      border:        1px solid #2a2a2a;
      border-radius: 8px;
      z-index:       99989;
      display:       flex;
      flex-direction: column;
      box-shadow:    0 8px 32px rgba(0,0,0,0.6);
      overflow:      hidden;
      font-family:   monospace;
      font-size:     12px;
    }

    .cw-container {
      display:       flex;
      height:        100%;
    }

    .cw-sidebar {
      display:        flex;
      flex-direction: column;
      background:     #0f0f0f;
      padding:        8px 0;
      border-right:    1px solid #1a1a1a;
      gap:            4px;
      flex-shrink:    0;
    }

    .cw-sidebar .cw-tab {
      background:    transparent;
      border:        none;
      padding:       12px 14px;
      color:         #666;
      font-size:     16px;
      cursor:        pointer;
      border-left:   2px solid transparent;
      display:       flex;
      align-items:   center;
      justify-content: center;
      transition:    all 0.15s;
    }
    .cw-sidebar .cw-tab:hover  { color: #aaa; background: rgba(255,255,255,0.03); }
    .cw-sidebar .cw-tab.active { color: #7ec8e3; border-left-color: #7ec8e3; background: rgba(126,200,227,0.05); }

    .cw-content {
      flex:       1;
      display:     flex;
      flex-direction: column;
      overflow:   hidden;
    }

    .cw-header {
      display:         flex;
      align-items:     center;
      justify-content: flex-end;
      padding:         0 12px;
      height:          40px;
      background:      #0f0f0f;
      border-bottom:   1px solid #1a1a1a;
      cursor:          grab;
      user-select:     none;
      flex-shrink:     0;
    }
    .cw-header:active { cursor: grabbing }

    .cw-header-actions { display: flex; gap: 8px; align-items: center }

    .cw-inspect-btn {
      padding:       4px 10px;
      background:    transparent;
      border:        1px solid #333;
      border-radius: 4px;
      color:         #888;
      font-family:   monospace;
      font-size:     11px;
      cursor:        pointer;
      transition:    all 0.15s;
    }
    .cw-inspect-btn:hover  { border-color: #4f8ef7; color: #7ec8e3 }
    .cw-inspect-btn.active { background: #0d2030; border-color: #4f8ef7; color: #7ec8e3 }

    .cw-close {
      background:  transparent;
      border:      none;
      color:       #555;
      cursor:      pointer;
      font-size:   14px;
      padding:     4px;
      line-height: 1;
    }
    .cw-close:hover { color: #aaa }

    .cw-body {
      flex:     1;
      overflow-y: auto;
    }

    /* ── Map view ─────────────────────────────── */

    .map-view {
      width:    100%;
      height:   100%;
      position: relative;
    }

    .map-legend {
      position:    absolute;
      bottom:      12px;
      left:        12px;
      display:     flex;
      gap:         16px;
    }

    .legend-item {
      display:     flex;
      align-items: center;
      gap:         6px;
      color:       #666;
      font-size:   11px;
    }

    .legend-dot {
      width:         8px;
      height:        8px;
      border-radius: 50%;
    }
    .legend-dot.component { background: #4f8ef7 }
    .legend-dot.state      { background: #4eca8b }

    .map-node { cursor: pointer }
    .map-node.highlighted rect { stroke-width: 2; filter: brightness(1.3) }
    .map-node.dimmed          { opacity: 0.2 }

    /* ── Tree view ────────────────────────────── */

    .tree-view {
      display:  flex;
      height:   100%;
      overflow: hidden;
    }

    .tree-panel {
      flex:           1;
      display:        flex;
      flex-direction: column;
      overflow:       hidden;
    }

    .tree-panel-header {
      padding:       8px 14px;
      color:         #555;
      font-size:     11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom:  1px solid #1a1a1a;
      flex-shrink:    0;
    }

    .tree-panel-body {
      flex:       1;
      overflow-y: auto;
      padding:    4px 0;
    }

    .tree-divider {
      width:      1px;
      background: #1a1a1a;
      flex-shrink: 0;
    }

    .tree-item {
      display:     flex;
      align-items: center;
      gap:         6px;
      padding:     5px 14px;
      color:       #888;
      cursor:      pointer;
      transition:  background 0.1s;
    }
    .tree-item:hover    { background: #161616 }
    .tree-item.highlighted {
      background:  #0d2030;
      color:       #7ec8e3;
    }
    .tree-item.dimmed   { opacity: 0.3 }

    .tree-item-icon  { color: #4f8ef7; font-size: 10px }
    .tree-item-icon.state { color: #4eca8b }
    .tree-item-name  { flex: 1; color: #ccc }
    .tree-item-file  { color: #444; font-size: 10px }
    .tree-item-dot   {
      width:         6px;
      height:        6px;
      border-radius: 50%;
      background:    #333;
    }
    .tree-item-dot.mounted { background: #4eca8b }

    .state-group { border-bottom: 1px solid #1a1a1a }
    .state-group.highlighted { background: #0d200d }
    .state-group.dimmed      { opacity: 0.3 }

    .state-group-header {
      display:     flex;
      align-items: center;
      gap:         6px;
      padding:     6px 14px;
      cursor:      pointer;
    }
    .state-group-header:hover { background: #161616 }

    .state-group-exports { padding: 0 14px 6px 32px }

    .state-export {
      display:     flex;
      align-items: center;
      gap:         8px;
      padding:     2px 0;
      color:       #555;
    }

    .export-name  { color: #777; min-width: 80px }
    .export-type.fn {
      background:    #1a1a1a;
      color:         #666;
      padding:       1px 5px;
      border-radius: 3px;
      font-size:     10px;
    }
    .export-value { color: #4f8ef7 }

    /* ── Inspector ────────────────────────────── */

    .inspector-empty {
      display:         flex;
      align-items:     center;
      justify-content: center;
      height:          100%;
      color:           #555;
      text-align:      center;
      padding:         40px;
    }

    .inspector-view {
      padding:    16px;
      overflow-y: auto;
      height:     100%;
    }

    .inspector-header {
      display:     flex;
      align-items: center;
      gap:         10px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom:  1px solid #1a1a1a;
    }

    .inspector-name { color: #7ec8e3; font-size: 14px; font-weight: bold }
    .inspector-file { color: #555; font-size: 11px; flex: 1 }

    .inspector-badge {
      padding:       2px 8px;
      border-radius: 4px;
      font-size:     10px;
      background:    #1a1a1a;
      color:         #555;
    }
    .inspector-badge.mounted {
      background: #1a3028;
      color:      #4eca8b;
    }

    .inspector-section {
      margin-bottom: 16px;
    }

    .inspector-section-title {
      color:          #555;
      font-size:      10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom:  8px;
    }

    .inspector-state-file {
      background:    #0f0f0f;
      border:        1px solid #1a1a1a;
      border-radius: 6px;
      margin-bottom: 8px;
      overflow:      hidden;
    }

    .inspector-state-name {
      padding:       6px 12px;
      color:         #4eca8b;
      border-bottom: 1px solid #1a1a1a;
      font-size:     11px;
    }

    .inspector-state-row {
      display:     flex;
      padding:     4px 12px;
      gap:         12px;
      color:       #666;
    }

    .inspector-state-key { min-width: 80px; color: #888 }
    .inspector-state-val { color: #4f8ef7 }

    .inspector-children {
      display:   flex;
      flex-wrap: wrap;
      gap:       6px;
    }

    .inspector-child {
      background:    #1a1a1a;
      border:        1px solid #2a2a2a;
      border-radius: 4px;
      padding:       3px 8px;
      color:         #7ec8e3;
      cursor:        pointer;
      font-size:     11px;
    }
    .inspector-child:hover { border-color: #4f8ef7 }

  `

  document.head.appendChild(style)
}
