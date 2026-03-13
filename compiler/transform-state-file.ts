import { transformSync } from "@babel/core";

export function transformStateFile(code: string, filename: string): string {
  const result = transformSync(code, {
    configFile: false,
    babelrc: false,
    presets: [
      ["@babel/preset-typescript", { allExtensions: true }]
    ],
    plugins: [
      stateAssignmentsPlugin
    ],
    filename,
    sourceMaps: false,
  });

  if (result?.code) {
    // Inject the notify import if we transformed anything
    if (result.code.includes("__notifySignal(")) {
       return `import { notifySignal as __notifySignal } from '@engine/index';\n` + result.code;
    }
    return result.code;
  }
  return code;
}

function stateAssignmentsPlugin({ types: t }: any) {
  return {
    visitor: {
      Program(path: any, state: any) {
        state.exportedVars = new Set<string>();
        
        // Find all exported variables
        path.traverse({
          ExportNamedDeclaration(exportPath: any) {
            const { declaration } = exportPath.node;
            if (t.isVariableDeclaration(declaration)) {
              declaration.declarations.forEach((decl: any) => {
                if (t.isIdentifier(decl.id)) {
                  state.exportedVars.add(decl.id.name);
                }
              });
            }
          }
        });
      },
      AssignmentExpression(path: any, state: any) {
        const { left } = path.node;
        if (t.isIdentifier(left) && state.exportedVars.has(left.name)) {
          // Wrap the assignment in a sequence expression: (var = val, __notify(id), var)
          // Actually, just append it if it's in a block, or wrap it.
          // Sequence expression is safest for expressions.
          
          // However, for simplicity and cross-module sync, it's better to 
          // wrap it like: ((() => { const res = (left = val); __notify('ID'); return res; })())
          // But that's heavy.
          
          // Let's use sequence expression: (count = 10, __notify('FILE'), count)
          // Note: FILENAME should be injected into the plugin options.
          
          const filename = state.file.opts.filename;
          path.replaceWith(
            t.sequenceExpression([
              path.node,
              t.callExpression(t.identifier("__notifySignal"), [t.stringLiteral(filename), t.stringLiteral(left.name), left]),
              left
            ])
          );
          path.skip(); // prevent infinite recursion
        }
      },
      UpdateExpression(path: any, state: any) {
        const { argument } = path.node;
        if (t.isIdentifier(argument) && state.exportedVars.has(argument.name)) {
          const filename = state.file.opts.filename;
          path.replaceWith(
            t.sequenceExpression([
              path.node,
              t.callExpression(t.identifier("__notifySignal"), [t.stringLiteral(filename), t.stringLiteral(argument.name), argument]),
              argument
            ])
          );
          path.skip();
        }
      }
    }
  };
}
