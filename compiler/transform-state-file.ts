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
  // Define helper for identifier transformation to use in both visitors
  const transformId = (path: any, state: any) => {
    if (!state.exportedVars.has(path.node.name)) return;
    if (path.parentPath.isVariableDeclarator({ id: path.node })) return;
    if (path.parentPath.isAssignmentExpression({ left: path.node })) return;
    if (path.parentPath.isUpdateExpression({ argument: path.node })) return;
    if (t.isMemberExpression(path.parent) && path.parent.property === path.node && !path.parent.computed) return;
    if (t.isObjectProperty(path.parent) && path.parent.key === path.node && !path.parent.computed) return;
    if (path.parentPath.isFunctionDeclaration()) return;
    if (path.parentPath.isExportSpecifier()) return;
    
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
  };

  return {
    visitor: {
      CallExpression(path: any, state: any) {
        if (t.isIdentifier(path.node.callee) && path.node.callee.name === 'persist') {
          const objExpr = path.node.arguments[1];
          if (t.isObjectExpression(objExpr)) {
             const props = objExpr.properties.map((p: any) => p.key.name || p.key.value);
             const filename = state.file.opts.filename;
             const assignments = props.map((prop: string) => {
                const left = t.identifier(prop);
                const right = t.memberExpression(t.identifier("__restored__"), t.identifier(prop));
                return t.ifStatement(
                    t.binaryExpression("in", t.stringLiteral(prop), t.identifier("__restored__")),
                    t.expressionStatement(
                        t.sequenceExpression([
                            t.assignmentExpression("=", left, right),
                            t.callExpression(t.identifier("__notifySignal"), [t.stringLiteral(filename), t.stringLiteral(prop), left]),
                            left
                        ])
                    )
                );
             });
             
             const restoreFn = t.arrowFunctionExpression(
                [t.identifier("__restored__")],
                t.blockStatement(assignments)
             );

             if (path.node.arguments.length === 2) {
                path.node.arguments.push(t.objectExpression([]));
             }
             path.node.arguments.push(t.stringLiteral(filename));
             path.node.arguments.push(restoreFn);
             
             // Mark ast to avoid infinite loop
             path.node.callee.name = 'persist';
          }
        }
      },
      Program: {
        enter(path: any, state: any) {
          state.exportedVars = new Set<string>();
          path.node.body.forEach((node: any) => {
            if (t.isExportNamedDeclaration(node)) {
              const { declaration } = node;
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
        const { left, right } = path.node;
        if (t.isIdentifier(left) && state.exportedVars.has(left.name)) {
          const filename = state.file.opts.filename;
          
          // Manually traverse the 'right' side to track variables used in the RHS
          path.get('right').traverse({
            Identifier(childPath) {
              transformId(childPath, state);
            }
          });
          
          path.replaceWith(
            t.sequenceExpression([
              t.assignmentExpression(path.node.operator, left, right),
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
              t.updateExpression(path.node.operator, argument, path.node.prefix),
              t.callExpression(t.identifier("__notifySignal"), [t.stringLiteral(filename), t.stringLiteral(argument.name), argument]),
              argument
            ])
          );
          path.skip();
        }
      },
      Identifier(path: any, state: any) {
        transformId(path, state);
      }
    }
  };
}
