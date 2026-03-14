import { showOverlay, parseStack } from "./error-overlay";

// @ts-ignore
const isDev = import.meta.env.DEV;

export type ErrorCategory =
  | "State"
  | "Component"
  | "Compiler"
  | "Reactivity"
  | "Navigation"
  | "Derived"
  | "Effect"
  | "DOM"
  | "Mount";

export interface EngineError {
  category: ErrorCategory;
  what: string;
  why?: string;
  fix?: string;
  file?: string;
  line?: number;
}

export function engineError(opts: EngineError): never {
  const err = new Error(`[Engine] ${opts.category}: ${opts.what}`);

  if (isDev) {
    const parsed = parseStack(err.stack ?? "");

    showOverlay({
      category: opts.category,
      severity: "error",
      what: opts.what,
      why: opts.why,
      fix: opts.fix,
      file: opts.file ?? parsed.file ?? undefined,
      line: opts.line ?? parsed.line ?? undefined,
      stack: err.stack,
    });

    console.error(
      `\n[Engine] ${opts.category} Error` +
        `\nWhat: ${opts.what}` +
        (opts.why ? `\nWhy:  ${opts.why}` : "") +
        (opts.fix ? `\nFix:  ${opts.fix}` : "") +
        "\n",
    );
  }

  throw err;
}

export function engineWarn(opts: EngineError) {
  if (!isDev) return;

  const err = new Error();
  const parsed = parseStack(err.stack ?? "");

  showOverlay({
    category: opts.category,
    severity: "warning",
    what: opts.what,
    why: opts.why,
    fix: opts.fix,
    file: opts.file ?? parsed.file ?? undefined,
    line: opts.line ?? parsed.line ?? undefined,
    stack: err.stack,
  });

  console.warn(
    `\n[Engine] ${opts.category} Warning` +
      `\nWhat: ${opts.what}` +
      (opts.why ? `\nWhy:  ${opts.why}` : "") +
      (opts.fix ? `\nFix:  ${opts.fix}` : "") +
      "\n",
  );
}

export function engineInfo(category: ErrorCategory, message: string) {
  if (!isDev) return;
  console.log(
    `%c[Engine] ${category}: ${message}`,
    "color: #3498db; font-weight: bold;",
  );
}
