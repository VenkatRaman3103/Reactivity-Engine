import type { Plugin } from "vite";
import { transformState } from "./transform-state";
import { transformJSX } from "./transform-jsx";
import { transformStateFile } from "./transform-state-file";
import { transformWhenConditions } from "./transform-when";
import { resolve, isAbsolute } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function engine(): Plugin {
  return {
    name: "engine",
    enforce: "pre",

    handleHotUpdate({ file, server }: any) {
      if (file.endsWith('.state.ts')) {
        let relative = file.replace(process.cwd(), '').replace(/\\/g, '/')
        // if the file is inside the vite root (example directory), we need to strip it
        if (relative.startsWith('/example/')) relative = relative.replace('/example/', '/')

        server.ws.send({
          type:  'custom',
          event: 'engine:state-update',
          data:  {
            file: relative
          }
        })
        return []
      }

      if (file.endsWith('.tsx')) {
        let relative = file.replace(process.cwd(), '').replace(/\\/g, '/')
        if (relative.startsWith('/example/')) relative = relative.replace('/example/', '/')

        server.ws.send({
          type:  'custom',
          event: 'engine:component-update',
          data:  {
            file: relative
          }
        })
        return
      }
    },

    resolveId(source: string) {
      if (source === "@engine/index" || source === "@engine") {
        return resolve(__dirname, "../src/index.ts");
      }
      if (source.startsWith("@engine/")) {
        const subpath = source.replace("@engine/", "");
        const target = subpath.endsWith(".ts") ? subpath : subpath + ".ts";
        return resolve(__dirname, "../src", target);
      }
      return null;
    },

    config(): any {
      return {
        esbuild: { jsx: "preserve" },
      };
    },

    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith("/__engine-ls")) {
          const url = new URL(req.url, `http://${req.headers.host}`);
          const relPath = url.searchParams.get("path");
          if (!relPath) return next();

          try {
            const { readdirSync, statSync, existsSync } = await import("fs");
            let fullPath = relPath;
            
            // Handle /@fs/ paths from Vite
            if (fullPath.startsWith('/@fs/')) {
              fullPath = fullPath.substring(4);
            } else if (fullPath.startsWith('@fs/')) {
              fullPath = fullPath.substring(3);
            }

            if (!isAbsolute(fullPath)) {
              fullPath = resolve(process.cwd(), fullPath);
              // If it doesn't exist at root, try in example/ directory (Vite root)
              if (!existsSync(fullPath)) {
                fullPath = resolve(process.cwd(), 'example', relPath);
              }
            }

            if (!existsSync(fullPath)) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "Not found" }));
              return;
            }

            const parent = statSync(fullPath).isDirectory() ? fullPath : resolve(fullPath, "..");
            const files = readdirSync(parent).map(f => {
              const s = statSync(resolve(parent, f));
              return { name: f, isDir: s.isDirectory() };
            });
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ files }));
          } catch (e) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(e) }));
          }
          return;
        }
        next();
      });
    },

    async transform(code: string, id: string) {
      const cleanId = id.split("?")[0];
      const isTSX = cleanId.endsWith(".tsx");
      const isTS = cleanId.endsWith(".ts");
      const isState = cleanId.includes(".state.");
      if (!isTSX && !isTS) return null;

      try {
        let transformedCode = code;
        let anyChanges = false;

        // step 0 — transform whenever/when conditions (DO THIS FIRST)
        if (!cleanId.includes('src/when.ts')) {
          const step0Code = transformWhenConditions(transformedCode);
          if (step0Code !== transformedCode) {
            transformedCode = step0Code;
            anyChanges = true;
          }
        }

        // step 1 — for .state.ts files, inject auto-notifications
        if (isState) {
          transformedCode = transformStateFile(transformedCode, cleanId);
          anyChanges = true;
        }

        // step 2 — transform state imports and get mappings
        const { code: step2Code, mappings } = await transformState(transformedCode, cleanId);
        if (step2Code !== transformedCode) {
          transformedCode = step2Code;
          anyChanges = true;
        }

        // step 3 — transform JSX (and rename variables)
        if (isTSX || (isTS && anyChanges)) {
          transformedCode = transformJSX(transformedCode, cleanId, mappings);
          anyChanges = true;
        }

        if (!anyChanges) return null;

        // step 3 — inject necessary engine imports
        const finalCode = injectEngineImports(transformedCode);
        
        console.log(`[engine] Transformed: ${cleanId}`);
        return { code: finalCode, map: null };
      } catch (e) {
        console.error(`[engine] Error transforming ${id}:`, e);
        throw e;
      }
    },
  };
}

function injectEngineImports(code: string): string {
  const imports: string[] = [];
  if (code.includes("__h")) imports.push("h as __h");
  if (code.includes("__Fragment")) imports.push("Fragment as __Fragment");
  if (code.includes("__wrapState")) imports.push("wrapState as __wrapState");

  if (imports.length === 0) return code;

  return `import { ${imports.join(", ")} } from '@engine/index';\n` + code;
}

