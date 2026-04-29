// src/error-overlay.ts

// @ts-ignore - import.meta.env is provided by Vite
// @ts-ignore - Always enable for demo (even in production)
const isDev = true;

// -----------------------------------------------
// styles
// -----------------------------------------------

const styles = `
  #engine-overlay {
    position:        fixed;
    inset:           0;
    pointer-events:  none;
    z-index:         99999;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     var(--dt-font, 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace);
    padding:         30px;
  }

  #engine-overlay * {
    box-sizing: border-box;
  }

  #engine-overlay-box {
    pointer-events: auto;
    background:    var(--dt-color-bg, #0a0a0a);
    border-radius: 16px;
    width:         min(1100px, 100vw - 40px);
    max-height:    min(80vh, 100vh - 40px);
    height:        min(80vh, 100vh - 40px);
    display:       flex;
    flex-direction: row;
    box-shadow:    0 20px 50px rgba(0,0,0,0.8);
    border:        1px solid rgba(255,255,255,0.08);
    overflow:      hidden;
    font-family:   var(--dt-font, 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace);
  }

  #engine-overlay-sidebar {
    width:         260px;
    min-width:     260px;
    background:    #000;
    border-right:  1px solid rgba(255,255,255,0.05);
    display:       flex;
    flex-direction: column;
    overflow-y:    auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  #engine-overlay-sidebar::-webkit-scrollbar { display: none; }

  .engine-sidebar-item {
    padding:       12px 16px;
    cursor:        pointer;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    border-left:   2px solid transparent;
    transition:    all 0.2s;
    display:       flex;
    flex-direction: column;
    gap:           6px;
  }

  .engine-sidebar-item:hover {
    background:    rgba(255,255,255,0.03);
  }

  .engine-sidebar-item.active {
    background:    rgba(126,200,227,0.05);
    border-left:   2px solid var(--dt-color-accent, #7ec8e3);
  }

  .engine-warning.engine-sidebar-item.active {
    border-left-color: #f0a030;
    background: rgba(240,160,48,0.05);
  }

  .engine-sidebar-title {
    font-size:   12px;
    font-weight: 600;
    color:       #ccc;
    display:     -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow:    hidden;
    line-height: 1.4;
    word-break:  break-word;
  }

  .engine-sidebar-meta {
    font-size:   10px;
    color:       var(--dt-color-muted, #666);
    display:     flex;
    justify-content: space-between;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  #engine-overlay-main {
    flex:          1;
    display:       flex;
    flex-direction: column;
    overflow:      hidden;
    background:    var(--dt-color-bg, #0a0a0a);
    min-width:     0;
    min-height:    0;
  }

  @media (max-width: 768px) {
    #engine-overlay-box {
      flex-direction: column;
    }
    #engine-overlay-sidebar {
      width:        100%;
      min-width:    auto;
      max-height:   30vh;
      border-right: none;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
  }

  #engine-overlay-header {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         14px 20px;
    background:      #000;
    border-bottom:   1px solid rgba(255,255,255,0.05);
    flex-shrink:     0;
  }

  #engine-overlay-title {
    font-size:   14px;
    font-weight: 800;
    display:     flex;
    align-items: center;
    gap:         12px;
    color:       var(--dt-color-accent, #7ec8e3);
    flex-shrink: 0;
    flex-wrap:   wrap;
    letter-spacing: 1px;
  }

  #engine-overlay-category {
    background:    rgba(255,68,68,0.15);
    color:         #ff6b6b;
    padding:       3px 8px;
    border-radius: 4px;
    font-size:     10px;
    font-weight:   900;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space:   nowrap;
  }

  .engine-warning #engine-overlay-category {
    background: rgba(240,160,48,0.15);
    color:      #f0a030;
  }

  #engine-overlay-severity {
    color:         var(--dt-color-muted, #666);
    font-size:     11px;
    font-weight:   700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  #engine-overlay-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 0;
    min-width: 0;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  #engine-overlay-scroll::-webkit-scrollbar { display: none; }

  .engine-section {
    margin-bottom: 28px;
  }

  .engine-section:last-child {
    margin-bottom: 0;
  }

  .engine-section-label {
    color:          var(--dt-color-muted, #666);
    font-size:      10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom:  12px;
    font-weight:    900;
  }

  .engine-what {
    font-size:      18px;
    color:          #ededec;
    font-weight:    800;
    line-height:    1.4;
  }

  .engine-why {
    color:          var(--dt-color-text, #ccc);
    font-size:      13px;
    line-height:    1.7;
  }

  .engine-tree {
    font-family:    var(--dt-font, 'SF Mono', Menlo, Monaco, monospace);
    font-size:      11px;
    line-height:    1.6;
    color:          var(--dt-color-muted, #666);
  }

  .engine-tree-item {
    display:       flex;
    align-items:   center;
    gap:           8px;
    white-space:   pre;
    padding:       2px 0;
  }

  .engine-tree-item.active {
    color:         var(--dt-color-accent, #7ec8e3);
    font-weight:   700;
  }

  .engine-tree-item.sibling {
    opacity: 0.5;
  }

  .engine-tree-item .marker {
    color:         #333;
    user-select:   none;
    width:         12px;
  }

  .engine-code-block {
    background:    var(--dt-color-bg-alt, #111);
    border-radius: 8px;
    overflow-x:    auto;
    margin-top:    10px;
    font-family:   var(--dt-font, 'SF Mono', Menlo, Monaco, 'Cascadia Code', monospace);
    border:        1px solid #1a1a1a;
    display:       flex;
    flex-direction: column;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .engine-code-block::-webkit-scrollbar { display: none; }

  .engine-code-header {
    background:    rgba(255,255,255,0.02);
    padding:       8px 20px;
    border-bottom: 1px solid #1a1a1a;
    font-size:     10px;
    color:         var(--dt-color-muted, #666);
    display:       flex;
    justify-content: space-between;
    font-family:   var(--dt-font, 'SF Mono', Menlo, Monaco, monospace);
    font-weight:   700;
    letter-spacing: 0.5px;
  }

  .engine-code-header .file-path {
    font-family: var(--dt-font, 'SF Mono', Menlo, Monaco, monospace);
    color:       var(--dt-color-muted, #666);
  }

  .engine-code-line {
    display:     flex;
    font-size:   11px;
    line-height: 1.8;
    padding:     0 20px;
    gap:         20px;
    color:       #444;
    min-width:   max-content;
  }

  .engine-code-line.error-line {
    background: rgba(255,68,68,0.08);
    color:      #ededec;
  }

  .engine-code-line .line-num {
    min-width:   35px;
    text-align:  right;
    color:       #333;
    user-select: none;
  }

  .engine-code-line.error-line .line-num {
    color: #ff4444;
  }

  .engine-code-line .line-code {
    flex: 1;
    white-space: pre;
  }

  .engine-error-marker {
    color:       #ff4444;
    margin-left: 12px;
    font-weight: 700;
    font-style:  italic;
    font-size:   10px;
  }

  .engine-fix-block {
    background:    rgba(78,202,139,0.05);
    border:        1px solid rgba(78,202,139,0.1);
    border-radius: 8px;
    padding:       14px 20px;
    color:         #4eca8b;
    font-size:     12px;
    line-height:   1.6;
    white-space:   pre-wrap;
  }

  .engine-stack-block {
    color:       var(--dt-color-muted, #666);
    font-size:   11px;
    line-height: 1.8;
    font-family: var(--dt-font, 'SF Mono', Menlo, Monaco, monospace);
    white-space: pre-wrap;
  }

  .engine-stack-block .stack-highlight {
    color: var(--dt-color-text, #ccc);
  }

  #engine-overlay-footer {
    display:         flex;
    justify-content: flex-end;
    gap:             8px;
    padding:         10px 20px;
    border-top:      1px solid rgba(255,255,255,0.05);
    background:      #000;
    flex-shrink:     0;
  }

  .engine-btn {
    padding:       6px 16px;
    border-radius: 6px;
    border:        none;
    font-size:     11px;
    font-weight:   700;
    cursor:        pointer;
    transition:    all 0.15s;
    font-family:   var(--dt-font, 'SF Mono', Menlo, Monaco, monospace);
    letter-spacing: 0.5px;
  }

  .engine-btn-dismiss {
    background: rgba(255,255,255,0.05);
    color:      var(--dt-color-muted, #666);
  }

  .engine-btn-dismiss:hover {
    background: rgba(255,255,255,0.1);
    color:      #aaa;
  }

  .engine-btn-copy {
    background: #ff5f56;
    color:      #fff;
  }

  .engine-btn-copy:hover {
    background: #ff7061;
    transform: translateY(-1px);
  }

  .engine-warning #engine-overlay-box {
    border-color: rgba(240,160,48,0.2);
  }

  .engine-warning .engine-code-line.error-line {
    background: rgba(240,160,48,0.08);
  }

  .engine-warning .engine-code-line.error-line .line-num {
    color: #f0a030;
  }

  .engine-warning .engine-error-marker {
    color: #f0a030;
  }

  .engine-warning .engine-btn-copy {
    background: #f0a030;
  }
`;

// -----------------------------------------------
// types
// -----------------------------------------------

export type Severity = "error" | "warning";

export interface OverlayError {
  category: string;
  severity: Severity;
  what: string;
  why?: string;
  file?: string;
  line?: number;
  col?: number;
  source?: string; // full source of the file
  fix?: string;
  stack?: string;
}

// -----------------------------------------------
// overlay state
// -----------------------------------------------

let overlayEl: HTMLElement | null = null;
let styleEl: HTMLStyleElement | null = null;
const errors: OverlayError[] = [];
let current = 0;

// -----------------------------------------------
// inject styles once
// -----------------------------------------------

function injectStyles() {
  if (styleEl) return;
  styleEl = document.createElement("style");
  styleEl.id = "engine-overlay-styles";
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

// -----------------------------------------------
// parse stack trace to get file and line
// -----------------------------------------------

export function parseStack(stack: string): {
  file: string | null;
  line: number | null;
  col: number | null;
} {
  const lines = stack.split("\n");

  for (const line of lines) {
    // skip engine internal files and node_modules
    if (
      line.includes("error-overlay") ||
      line.includes("errors.ts") ||
      line.includes("node_modules") ||
      // Skip anything in the engine's src directory to find user code
      line.includes("/src/dom.ts") ||
      line.includes("/src/component.ts") ||
      line.includes("/src/reactive.ts") ||
      line.includes("/src/navigate.ts") ||
      line.includes("/src/state.ts") ||
      line.includes("/src/derived.ts") ||
      line.includes("/src/effect.ts") ||
      line.includes("/src/scheduler.ts")
    ) {
      continue;
    }

    // match: at file:///path/to/file.ts:10:5
    // or:    at ComponentName (path/to/file.ts:10:5)
    // or:    at path/to/file.ts:10:5
    const match = line.match(/(?:at\s+)?(?:\S+\s+\()?([^()]+):(\d+):(\d+)\)?/);
    if (match) {
      const raw = match[1];
      let file = raw
        .trim()
        .replace(/^at\s+/, "")
        .replace(/^file:\/\//, "")
        .replace(window.location.origin, "")
        .replace(/^\//, "");

      // Strip query parameters that Vite adds for cache busting
      if (file.includes("?")) {
        file = file.split("?")[0];
      }

      // If it's a full path but we're in a dev environment,
      // let's try to keep it relative to the root for fetching
      if (file.includes(window.location.host)) {
        file = file.split(window.location.host).pop() || file;
      }

      // Remove Vite /@fs/ prefix which breaks physical file locating
      // BUT keep it if it's part of an absolute path we want to fetch safely
      if (file.startsWith("@fs/")) {
        file = "/" + file;
      }

      file = file.replace(/^\/\//, "/");

      return {
        file: file || null,
        line: parseInt(match[2]),
        col: parseInt(match[3]),
      };
    }
  }

  return { file: null, line: null, col: null };
}

// -----------------------------------------------
// fetch directory siblings
// -----------------------------------------------

async function fetchSiblings(
  file: string,
): Promise<{ name: string; isDir: boolean }[]> {
  try {
    const res = await fetch(`/__engine-ls?path=${encodeURIComponent(file)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch {
    return [];
  }
}

// -----------------------------------------------
// fetch source file for code preview
// -----------------------------------------------

async function fetchSource(file: string): Promise<string | null> {
  try {
    // If it's already an absolute path or has /@fs/, use it as is
    // Otherwise, ensure it starts with a /
    const url = file.startsWith("/") ? file : `/${file}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

// -----------------------------------------------
// render code block with highlighted error line
// -----------------------------------------------

function renderCodeBlock(
  source: string,
  errorLine: number,
  context: number = 4,
): string {
  const lines = source.split("\n");
  const start = Math.max(0, errorLine - context - 1);
  const end = Math.min(lines.length, errorLine + context);

  return lines
    .slice(start, end)
    .map((code, i) => {
      const num = start + i + 1;
      const isError = num === errorLine;
      const marker = isError
        ? '<span class="engine-error-marker">← target</span>'
        : "";
      const cls = isError ? "engine-code-line error-line" : "engine-code-line";
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      return (
        `<div class="${cls}">` +
        `<span class="line-num">${num}</span>` +
        `<span class="line-code">${escaped}${marker}</span>` +
        `</div>`
      );
    })
    .join("");
}

// -----------------------------------------------
// render the overlay HTML
// -----------------------------------------------

async function renderOverlay(err: OverlayError) {
  injectStyles();

  let file = err.file;
  let line = err.line;
  let source = err.source;

  // parse from stack if not provided
  if (err.stack && (!file || !line)) {
    const parsed = parseStack(err.stack);
    file = file ?? parsed.file ?? undefined;
    line = line ?? parsed.line ?? undefined;
  }

  // fetch source if we have a file but no source
  if (file && !source) {
    source = (await fetchSource(file)) ?? undefined;
  }

  const isWarning = err.severity === "warning";
  const severityClass = isWarning ? "engine-warning" : "";
  const severityLabel = isWarning ? "Warning" : "Error";

  // Clean file path (strip query params)
  // Clean file path (strip query params and relativize)
  let cleanFile = file ? file.split("?")[0] : "";

  // Relativize: strip common prefixes if absolute
  const projectRoot = "Reactivity-Engine";
  if (cleanFile.includes(projectRoot)) {
    cleanFile =
      cleanFile.split(projectRoot).pop()?.replace(/^\//, "") || cleanFile;
  }

  const fileParts = cleanFile.split("/");
  const fileName = fileParts.pop() || "";
  const dirParts = fileParts.filter(Boolean);

  // Generate Tree View HTML
  let treeItemsHtml = `<div class="engine-tree-item">.</div>`;

  // Show base directories with indentation
  dirParts.forEach((part, i) => {
    const indent = "&nbsp;".repeat((i + 1) * 2);
    treeItemsHtml += `<div class="engine-tree-item">${indent}${part}/</div>`;
  });

  // fetch siblings for the file level with further indentation
  const levelIndent = "&nbsp;".repeat((dirParts.length + 1) * 2);
  const siblings = file && file !== "unknown" ? await fetchSiblings(file) : [];

  if (siblings.length > 0) {
    const targetIdx = siblings.findIndex((s) => s.name === fileName);
    if (targetIdx !== -1) {
      const start = Math.max(0, targetIdx - 3);
      const end = Math.min(siblings.length, targetIdx + 4);

      siblings.slice(start, end).forEach((s) => {
        const isActive = s.name === fileName;
        const cls = isActive
          ? "engine-tree-item active"
          : "engine-tree-item sibling";
        const label = s.name + (isActive && line ? `:${line}` : "");
        treeItemsHtml += `<div class="${cls}">${levelIndent}${label}</div>`;
      });
    } else {
      treeItemsHtml += `<div class="engine-tree-item active">${levelIndent}${fileName}${line ? `:${line}` : ""}</div>`;
    }
  } else if (fileName) {
    treeItemsHtml += `<div class="engine-tree-item active">${levelIndent}${fileName}${line ? `:${line}` : ""}</div>`;
  }

  const codeBlock =
    source && line
      ? `<div class="engine-section">
         <div class="engine-section-label">Source</div>
         <div class="engine-code-block">
           <div class="engine-code-header">
             <span class="file-path">${cleanFile}:${line}</span>
             <span>preview</span>
           </div>
           ${renderCodeBlock(source, line)}
         </div>
       </div>`
      : "";

  const fileBlock = cleanFile
    ? `<div class="engine-section">
         <div class="engine-section-label">Location (Context)</div>
         <div class="engine-tree">${treeItemsHtml}</div>
       </div>`
    : "";

  const whyBlock = err.why
    ? `<div class="engine-section">
         <div class="engine-section-label">Why</div>
         <div class="engine-why">${err.why}</div>
       </div>`
    : "";

  const fixBlock = err.fix
    ? `<div class="engine-section">
         <div class="engine-section-label">How to fix</div>
         <div class="engine-fix-block">${err.fix}</div>
       </div>`
    : "";

  const stackLines = err.stack
    ?.split("\n")
    .filter((l) => !l.includes("error-overlay") && !l.includes("errors.ts"))
    .map((l) => {
      const isUserCode = !l.includes("node_modules");
      return isUserCode ? `<span class="stack-highlight">${l}</span>` : l;
    })
    .join("\n");

  const stackBlock = stackLines
    ? `<div class="engine-section">
         <div class="engine-section-label">Stack Trace</div>
         <div class="engine-stack-block">${stackLines}</div>
       </div>`
    : "";

  const sidebarHtml =
    errors.length > 1
      ? `
    <div id="engine-overlay-sidebar">
      ${errors
        .map((e, idx) => {
          const isActive = idx === current ? "active" : "";
          const severityClass =
            e.severity === "warning" ? "engine-warning" : "";
          const title = e.what || "Unknown Error";
          return `
          <div class="engine-sidebar-item ${isActive} ${severityClass}" data-index="${idx}">
            <div class="engine-sidebar-meta">
              <span>${e.category}</span>
              <span style="opacity: 0.7">${e.severity}</span>
            </div>
            <div class="engine-sidebar-title">${title}</div>
          </div>
        `;
        })
        .join("")}
    </div>
  `
      : "";

  const html = `
    <div id="engine-overlay" class="${severityClass}">
      <div id="engine-overlay-box">
        
        ${sidebarHtml}

        <div id="engine-overlay-main">
          <div id="engine-overlay-header">
            <div id="engine-overlay-title">
              <span id="engine-overlay-category">${err.category}</span>
              <span id="engine-overlay-severity">${severityLabel}</span>
            </div>
          </div>

          <div id="engine-overlay-scroll">
            <div class="engine-section">
              <div class="engine-what">${err.what}</div>
            </div>

            ${whyBlock}
            ${fileBlock}
            ${codeBlock}
            ${fixBlock}
            ${stackBlock}
          </div>

          <div id="engine-overlay-footer">
            <button class="engine-btn engine-btn-dismiss" id="engine-btn-dismiss">Dismiss</button>
            <button class="engine-btn engine-btn-copy"    id="engine-btn-copy">Copy stack</button>
          </div>
        </div>

      </div>
    </div>
  `;

  return html;
}

// -----------------------------------------------
// Add nav styles
// -----------------------------------------------

const navStyles = `
  #engine-overlay-nav {
    display:       flex;
    align-items:   center;
    gap:           8px;
  }

  .nav-btn {
    background:      transparent;
    border:          none;
    color:           #aaa;
    cursor:          pointer;
    padding:         6px 12px;
    border-radius:   16px;
    font-size:       14px;
    font-weight:     600;
    transition:      all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    display:         flex;
    align-items:     center;
    justify-content: center;
  }

  .nav-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.1);
    color:       #fff;
    transform:   scale(1.05);
  }

  .nav-btn:active:not(:disabled) {
    transform: scale(0.95);
  }

  .nav-btn:disabled {
    opacity: 0.2;
    cursor:  not-allowed;
  }

  #engine-nav-count {
    font-size:   12px;
    font-weight: 500;
    color:       #777;
    min-width:   48px;
    text-align:  center;
    letter-spacing: 0.5px;
    font-variant-numeric: tabular-nums;
  }
`;

// -----------------------------------------------
// show the overlay
// -----------------------------------------------

export async function showOverlay(err: OverlayError) {
  if (!isDev) return;

  // Add navigation styles if not already there
  if (!document.getElementById("engine-nav-styles")) {
    const s = document.createElement("style");
    s.id = "engine-nav-styles";
    s.textContent = navStyles;
    document.head.appendChild(s);
  }

  errors.push(err);
  current = errors.length - 1;

  await updateUI();
}

let isUpdating = false;
let pendingUpdate = false;

async function updateUI() {
  if (isUpdating) {
    pendingUpdate = true;
    return;
  }
  isUpdating = true;

  const err = errors[current];
  if (!err) {
    isUpdating = false;
    return;
  }

  const html = await renderOverlay(err);

  // Remove existing overlay *after* await to avoid race conditions
  // where multiple instances get appended to the DOM.
  if (overlayEl) {
    overlayEl.remove();
  }

  overlayEl = document.createElement("div");
  overlayEl.innerHTML = html;
  document.body.appendChild(overlayEl);

  // sidebar functionality
  const sidebarItems = overlayEl.querySelectorAll(".engine-sidebar-item");
  sidebarItems.forEach((el) => {
    el.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLElement;
      const idx = parseInt(target.dataset.index || "0", 10);
      if (idx !== current) {
        current = idx;
        updateUI();
      }
    });
  });

  // dismiss button
  overlayEl
    .querySelector("#engine-btn-dismiss")
    ?.addEventListener("click", dismissOverlay);

  // copy button
  overlayEl.querySelector("#engine-btn-copy")?.addEventListener("click", () => {
    const text = [
      `[Engine] ${err.category} ${err.severity}`,
      `What: ${err.what}`,
      err.why ? `Why:  ${err.why}` : "",
      err.file ? `File: ${err.file}` : "",
      err.line ? `Line: ${err.line}` : "",
      err.fix ? `Fix:\n${err.fix}` : "",
      err.stack ? `\nStack:\n${err.stack}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    navigator.clipboard.writeText(text).then(() => {
      const btn = overlayEl?.querySelector(
        "#engine-btn-copy",
      ) as HTMLButtonElement;
      if (btn) {
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 2000);
      }
    });
  });

  // click outside to dismiss
  overlayEl.querySelector("#engine-overlay")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "engine-overlay") dismissOverlay();
  });

  // escape to dismiss
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      dismissOverlay();
      window.removeEventListener("keydown", onKey);
    }
  };
  window.addEventListener("keydown", onKey);

  isUpdating = false;
  if (pendingUpdate) {
    pendingUpdate = false;
    updateUI();
  }
}

export function dismissOverlay() {
  overlayEl?.remove();
  overlayEl = null;
  // Clear errors when dismissed
  errors.length = 0;
  current = 0;
}
