// src/error-overlay.ts

// @ts-ignore - import.meta.env is provided by Vite
// @ts-ignore
const isDev = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.DEV : true;

// -----------------------------------------------
// styles
// -----------------------------------------------

const styles = `
  #engine-overlay {
    position:        fixed;
    inset:           0;
    pointer-events:  none;    /* Let clicks pass through the invisible backdrop */
    z-index:         99999;
    display:         flex;
    align-items:     center;
    justify-content: center;
    font-family:     system-ui, -apple-system, sans-serif;
    padding:         30px;
  }

  #engine-overlay * {
    box-sizing: border-box;
  }

  #engine-overlay-box {
    pointer-events: auto;     /* Re-enable clicks on the popup component itself */
    background:    #121212;
    border-radius: 16px;
    width:         min(1100px, 100vw - 40px);
    max-height:    min(80vh, 100vh - 40px);
    height:        min(80vh, 100vh - 40px);
    display:       flex;
    flex-direction: row;
    box-shadow:    0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1);
    // border:        1px solid rgba(255, 255, 255, 0.05);
    overflow:      hidden;
  }

  #engine-overlay-sidebar {
    width:         300px;
    min-width:     300px;
    background:    #0a0a0a;
    border-right:  1px solid rgba(255, 255, 255, 0.05);
    display:       flex;
    flex-direction: column;
    overflow-y:    auto;
  }

  .engine-sidebar-item {
    padding:       16px;
    cursor:        pointer;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    transition:    background 0.1s;
    display:       flex;
    flex-direction: column;
    gap:           6px;
  }

  .engine-sidebar-item:hover {
    background:    rgba(255, 255, 255, 0.05);
  }

  .engine-sidebar-item.active {
    background:    rgba(255, 255, 255, 0.08);
    border-left:   3px solid #ff4a4a;
  }

  .engine-warning.engine-sidebar-item.active {
    border-left-color: #f1c40f;
  }

  .engine-sidebar-title {
    font-size:   13px;
    font-weight: 500;
    color:       #efefef;
    display:     -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow:    hidden;
    line-height: 1.4;
    word-break:  break-word;
  }

  .engine-sidebar-meta {
    font-size:   11px;
    color:       #888;
    display:     flex;
    justify-content: space-between;
    font-weight: 600;
  }

  #engine-overlay-main {
    flex:          1;
    display:       flex;
    flex-direction: column;
    overflow:      hidden;
    background:    #121212;
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
  }


  #engine-overlay-header {
    display:         flex;
    align-items:     center;
    justify-content: space-between;
    padding:         20px 24px;
    border-bottom:   1px solid rgba(255, 255, 255, 0.05);
    flex-shrink:     0;
  }

  #engine-overlay-title {
    font-size:   16px;
    font-weight: 600;
    display:     flex;
    align-items: center;
    gap:         12px;
    color:       #efefef;
    flex-shrink: 0;
    flex-wrap:   wrap;
  }

  #engine-overlay-category {
    background:    rgba(255, 68, 68, 0.15);
    color:         #ff6b6b;
    padding:       4px 10px;
    border-radius: 6px;
    font-size:     12px;
    font-weight:   700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    white-space:   nowrap;
  }

  /* Warning Variant Adjustment */
  .engine-warning #engine-overlay-category {
    background: rgba(255, 170, 68, 0.15);
    color:      #ffaa44;
  }

  #engine-overlay-severity {
    color:         #888;
    font-size:     12px;
    font-weight:   400;
  }

  #engine-overlay-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 24px;
    min-height: 0;
    min-width: 0;
  }

  .engine-section {
    margin-bottom: 32px;
  }

  .engine-section:last-child {
    margin-bottom: 0;
  }

  .engine-section-label {
    color:          #555;
    font-size:      11px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom:  12px;
    font-weight:    700;
  }

  .engine-what {
    font-size:      20px;
    color:          #fff;
    font-weight:    600;
    line-height:    1.4;
  }

  .engine-why {
    color:          #aaa;
    font-size:      15px;
    line-height:    1.6;
  }

  .engine-tree {
    font-family:    monospace;
    font-size:      13px;
    line-height:    1.6;
    color:          #555;
  }

  .engine-tree-item {
    display:       flex;
    align-items:   center;
    gap:           8px;
    white-space:   pre;
    padding:       2px 0;
  }

  .engine-tree-item.active {
    color:         #7ec8e3;
    font-weight:   600;
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
    background:    #0a0a0a;
    border-radius: 12px;
    overflow-x:    auto;
    margin-top:    12px;
    font-family:   'JetBrains Mono', 'Fira Code', monospace;
    border:        1px solid rgba(255, 255, 255, 0.05);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
    display:       flex;
    flex-direction: column;
  }

  .engine-code-header {
    background:    rgba(255, 255, 255, 0.02);
    padding:       8px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size:     11px;
    color:         #555;
    display:       flex;
    justify-content: space-between;
    font-family:   system-ui, sans-serif;
  }

  .engine-code-header .file-path {
    font-family: monospace;
    color:       #888;
  }

  .engine-code-line {
    display:     flex;
    font-size:   13px;
    line-height: 2;
    padding:     0 20px;
    gap:         20px;
    color:       #444;
    min-width:   max-content;
  }

  .engine-code-line.error-line {
    background: rgba(255, 68, 68, 0.08);
    color:      #eee;
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
    font-weight: bold;
    font-style:  italic;
  }

  .engine-fix-block {
    background:    rgba(126, 200, 126, 0.05);
    border:        1px solid rgba(126, 200, 126, 0.1);
    border-radius: 12px;
    padding:       16px 20px;
    color:         #a8e6a8;
    font-size:     14px;
    line-height:   1.6;
    white-space:   pre-wrap;
  }

  .engine-stack-block {
    color:       #666;
    font-size:   12px;
    line-height: 1.8;
    font-family: monospace;
    white-space: pre-wrap;
  }

  .engine-stack-block .stack-highlight {
    color: #999;
  }

  /* Custom subtle scrollbars */
  #engine-overlay-scroll::-webkit-scrollbar,
  .engine-code-block::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  #engine-overlay-scroll::-webkit-scrollbar-thumb,
  .engine-code-block::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  #engine-overlay-scroll::-webkit-scrollbar-thumb:hover,
  .engine-code-block::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  #engine-overlay-footer {
    display:         flex;
    justify-content: flex-end;
    gap:             12px;
    padding:         18px 24px;
    border-top:      1px solid rgba(255, 255, 255, 0.05);
    background:      rgba(255, 255, 255, 0.02);
    flex-shrink:     0;
  }

  .engine-btn {
    padding:       10px 20px;
    border-radius: 10px;
    border:        none;
    font-size:     13px;
    font-weight:   600;
    cursor:        pointer;
    transition:    all 0.15s;
  }

  .engine-btn-dismiss {
    background: rgba(255, 255, 255, 0.05);
    color:      #aaa;
  }

  .engine-btn-dismiss:hover {
    background: rgba(255, 255, 255, 0.1);
    color:      #fff;
  }

  .engine-btn-copy {
    background: #ff4444;
    color:      white;
  }

  .engine-btn-copy:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  /* Warning Variant */
  .engine-warning #engine-overlay-box {
    border-color: rgba(255, 170, 68, 0.2);
  }

  .engine-warning #engine-overlay-category {
    background: rgba(255, 170, 68, 0.15);
    color:      #ffaa44;
  }

  .engine-warning .engine-code-line.error-line {
    background: rgba(255, 170, 68, 0.08);
  }

  .engine-warning .engine-code-line.error-line .line-num {
    color: #ffaa44;
  }

  .engine-warning .engine-error-marker {
    color: #ffaa44;
  }

  .engine-warning .engine-btn-copy {
    background: #ffaa44;
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
