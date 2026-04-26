
import { transformSync } from "@babel/core";

export function transformStyle(code: string): string {
  // collect state imports
  const stateVars = collectStateVars(code)
  if (stateVars.size === 0) return code

  const result = transformSync(code, {
    configFile: false,
    babelrc: false,
    presets: [
      ["@babel/preset-typescript", { allExtensions: true }]
    ],
    plugins: [
      ({ types: t }) => ({
        visitor: {
          CallExpression(path) {
            if (t.isIdentifier(path.node.callee, { name: 'style' })) {
              const arg = path.node.arguments[0];
              if (t.isObjectExpression(arg)) {
                transformStyleObject(arg, stateVars, t);
              }
            }
          }
        }
      })
    ],
    filename: 'transform.ts',
    sourceMaps: false,
  });

  return result?.code ?? code;
}

function transformStyleObject(obj: any, stateVars: Set<string>, t: any) {
  obj.properties.forEach((prop: any) => {
    if (t.isObjectProperty(prop)) {
      const key = prop.key.name || prop.key.value;
      const val = prop.value;

      // Skip nested objects (pseudo selectors, media queries)
      if (t.isObjectExpression(val)) {
        return;
      }

      // Skip if already a function
      if (t.isFunction(val)) {
        return;
      }

      // Check if expression references any state variables
      if (referencesState(val, stateVars, t)) {
        prop.value = t.arrowFunctionExpression([], val);
      }
    }
  });
}

function referencesState(node: any, stateVars: Set<string>, t: any): boolean {
  let found = false;
  // Use a simple traversal for the expression
  const traverse = (n: any) => {
    if (found) return;
    if (t.isIdentifier(n) && stateVars.has(n.name)) {
      found = true;
      return;
    }
    for (const key in n) {
      if (n[key] && typeof n[key] === 'object') {
        if (Array.isArray(n[key])) {
          n[key].forEach(traverse);
        } else {
          traverse(n[key]);
        }
      }
    }
  };
  traverse(node);
  return found;
}

function collectStateVars(code: string): Set<string> {
  const vars = new Set<string>();
  
  transformSync(code, {
    configFile: false,
    babelrc: false,
    presets: [["@babel/preset-typescript", { allExtensions: true }]],
    plugins: [
      ({ types: t }) => ({
        visitor: {
          ImportDeclaration(path) {
            const source = path.node.source.value;
            if (source.includes('.state')) {
              path.node.specifiers.forEach(spec => {
                if (t.isImportSpecifier(spec)) {
                  vars.add(spec.local.name);
                }
              });
            }
          }
        }
      })
    ],
    filename: 'imports.ts',
    sourceMaps: false,
  });

  return vars;
}
