import { resolve, dirname } from "path";
import { existsSync } from "fs";

export interface StateTransformResult {
  code: string;
  mappings: Map<string, string>; // varName -> namespaceAlias
}

export async function transformState(code: string, currentFilePath: string): Promise<StateTransformResult> {
  const regex =
    /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+\.state(?:\.ts|\.tsx)?)['"]/g;

  // regex for layout file imports — NEW
  const layoutRegex =
    /import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+\.layout(?:\.tsx)?)['"]/g;

  const matches: Array<{ full: string; names: string[]; path: string; type: 'state' | 'layout' }> = [];
  let m: RegExpExecArray | null;

  while ((m = regex.exec(code)) !== null) {
    matches.push({
      full: m[0],
      names: m[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      path: m[2],
      type: 'state'
    });
  }

  // collect layout imports
  while ((m = layoutRegex.exec(code)) !== null) {
    matches.push({
      full:  m[0],
      names: m[1].split(',').map(s => s.trim()).filter(Boolean),
      path:  m[2],
      type:  'layout'
    });
  }

  let result = code;
  const mappings = new Map<string, string>();
  let nsCounter = 0;
  const currentDir = dirname(currentFilePath);

  for (const { full, names, path } of matches) {
    // Resolve relative path to absolute path for consistent keying in reactivity system
    let absolutePath = path.startsWith(".") ? resolve(currentDir, path) : path;
    
    // Check for existing file to get correct extension
    if (!existsSync(absolutePath)) {
      if (existsSync(absolutePath + ".ts")) absolutePath += ".ts";
      else if (existsSync(absolutePath + ".tsx")) absolutePath += ".tsx";
      else absolutePath += ".ts"; // Fallback
    }
    
    const nsAlias = `__state_${nsCounter++}`;
    const wrap = `import * as ${nsAlias}_orig from '${path}';\nconst ${nsAlias} = __wrapState('${absolutePath}', ${nsAlias}_orig);`;
    
    result = result.replace(full, wrap);
    
    names.forEach((name) => {
      mappings.set(name, nsAlias);
    });
  }

  // also transform dynamic imports: import('...state')
  const dynRegex = /import\s*\(['"]([^'"]+\.state(?:\.ts|\.tsx)?)['"]\)/g;
  let dynMatch: RegExpExecArray | null;
  while ((dynMatch = dynRegex.exec(result)) !== null) {
    const full = dynMatch[0];
    const path = dynMatch[1];
    let absolutePath = path.startsWith(".") ? resolve(currentDir, path) : path;
    
    if (!existsSync(absolutePath)) {
      if (existsSync(absolutePath + ".ts")) absolutePath += ".ts";
      else if (existsSync(absolutePath + ".tsx")) absolutePath += ".tsx";
      else absolutePath += ".ts"; // Fallback
    }

    const wrap = `(import('${path}').then(m => __wrapState('${absolutePath}', m)))`;
    result = result.replace(full, wrap);
  }

  return { code: result, mappings };
}
