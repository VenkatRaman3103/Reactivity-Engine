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
}
