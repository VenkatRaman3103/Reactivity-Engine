import { h, Fragment } from "./index";

declare global {
  const __h: typeof h;
  const __Fragment: typeof Fragment;
}

interface ImportMeta {
  readonly env: {
    readonly [key: string]: any;
    readonly DEV: boolean;
    readonly PROD: boolean;
  };
  readonly hot?: {
    on(event: string, cb: (data: any) => void): void;
    off(event: string, cb: (data: any) => void): void;
    send(event: string, data?: any): void;
    accept(cb?: (mod: any) => void): void;
    dispose(cb: (data: any) => void): void;
    invalidate(): void;
  };
}
