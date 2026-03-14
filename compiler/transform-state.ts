import { resolve, dirname } from "path";

export interface StateTransformResult {
  code: string;
  mappings: Map<string, string>; // varName -> namespaceAlias
}

export function transformState(code: string, currentFilePath: string): StateTransformResult {
  const regex =
    /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+\.state(?:\.ts)?)['"]/g;

  const matches: Array<{ full: string; names: string[]; path: string }> = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(code)) !== null) {
    matches.push({
      full: m[0],
      names: m[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      path: m[2],
    });
  }

  let result = code;
  const mappings = new Map<string, string>();
  let nsCounter = 0;
  const currentDir = dirname(currentFilePath);

  matches.forEach(({ full, names, path }) => {
    // Resolve relative path to absolute path for consistent keying in reactivity system
    let absolutePath = path.startsWith(".") ? resolve(currentDir, path) : path;
    if (!absolutePath.endsWith(".ts")) absolutePath += ".ts";
    
    const nsAlias = `__state_${nsCounter++}`;
    const wrap = `import * as ${nsAlias}_orig from '${path}';\nconst ${nsAlias} = __wrapState('${absolutePath}', ${nsAlias}_orig);`;
    
    result = result.replace(full, wrap);
    
    names.forEach((name) => {
      mappings.set(name, nsAlias);
    });
  });

  // also transform dynamic imports: import('...state')
  const dynRegex = /import\s*\(['"]([^'"]+\.state(?:\.ts)?)['"]\)/g;
  let dynMatch: RegExpExecArray | null;
  while ((dynMatch = dynRegex.exec(result)) !== null) {
    const full = dynMatch[0];
    const path = dynMatch[1];
    let absolutePath = path.startsWith(".") ? resolve(currentDir, path) : path;
    if (!absolutePath.endsWith(".ts")) absolutePath += ".ts";

    const wrap = `(import('${path}').then(m => __wrapState('${absolutePath}', m)))`;
    result = result.replace(full, wrap);
  }

  return { code: result, mappings };
}
