import type { Plugin } from "vite";
import { transformState } from "./transform-state";
import { transformJSX, setStateMappings } from "./transform-jsx";
import { transformStateFile } from "./transform-state-file";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export function engine(): Plugin {
  return {
    name: "engine",
    enforce: "pre",

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

    transform(code: string, id: string) {
      const cleanId = id.split("?")[0];
      const isTSX = cleanId.endsWith(".tsx");
      const isTS = cleanId.endsWith(".ts");
      const isState = cleanId.includes(".state.");
      if (!isTSX && !isTS) return null;

      try {
        let transformedCode = code;
        let anyChanges = false;

        // step 0 — for .state.ts files, inject auto-notifications
        if (isState) {
          transformedCode = transformStateFile(transformedCode, cleanId);
          anyChanges = true;
        }

        // step 1 — transform state imports and get mappings
        const { code: step1Code, mappings } = transformState(transformedCode, cleanId);
        if (step1Code !== transformedCode) {
          transformedCode = step1Code;
          anyChanges = true;
          setStateMappings(mappings);
        }

        // step 2 — transform JSX (and rename variables)
        if (isTSX || (isTS && anyChanges)) {
          transformedCode = transformJSX(transformedCode, cleanId);
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

