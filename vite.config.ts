import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { engine } from "./compiler/plugin";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: "example",
  resolve: {
    alias: {
      "@engine": resolve(__dirname, "src"),
    },
  },
  server: {
    fs: {
      allow: [resolve(__dirname)],
    },
  },
  optimizeDeps: {
    exclude: ["@engine"],
  },
  plugins: [engine()],
});
