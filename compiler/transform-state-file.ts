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
    let finalCode = result.code;
    const imports = [];
    if (finalCode.includes("__notifySignal(")) {
       imports.push("notifySignal as __notifySignal");
    }
    if (finalCode.includes("__trackState(")) {
       imports.push("trackState as __trackState");
    }

    if (imports.length > 0) {
      return `import { ${imports.join(", ")} } from '@engine/index';\n` + finalCode;
    }
    return finalCode;
  }
  return code;
}

function stateAssignmentsPlugin({ types: t }: any) {
  return {
    visitor: {
      Program: {
        enter(path: any, state: any) {
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
        }
      },
      AssignmentExpression(path: any, state: any) {
        const { left } = path.node;
        if (t.isIdentifier(left) && state.exportedVars.has(left.name)) {
          const filename = state.file.opts.filename;
          path.replaceWith(
            t.sequenceExpression([
              path.node,
              t.callExpression(t.identifier("__notifySignal"), [t.stringLiteral(filename), t.stringLiteral(left.name), left]),
              left
            ])
          );
          path.skip();
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
      },
      Identifier(path: any, state: any) {
        // Skip if not a reference to an exported var
        if (!state.exportedVars.has(path.node.name)) return;
        
        // Skip if it's a declaration or assignment left-side
        if (path.parentPath.isVariableDeclarator({ id: path.node })) return;
        if (path.parentPath.isAssignmentExpression({ left: path.node })) return;
        if (path.parentPath.isUpdateExpression({ argument: path.node })) return;
        if (path.parentPath.isMemberExpression({ property: path.node }) && !path.parentPath.node.computed) return;
        if (path.parentPath.isObjectProperty({ key: path.node }) && !path.parentPath.node.computed) return;
        if (path.parentPath.isFunctionDeclaration()) return;
        if (path.parentPath.isExportSpecifier()) return;
        
        // Ensure it's a read-only reference
        if (path.isReferencedIdentifier()) {
          const filename = state.file.opts.filename;
          path.replaceWith(
            t.callExpression(t.identifier("__trackState"), [
              t.stringLiteral(filename),
              t.stringLiteral(path.node.name),
              t.identifier(path.node.name)
            ])
          );
          path.skip();
        }
      }
    }
  };
}
