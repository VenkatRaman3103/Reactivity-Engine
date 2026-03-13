import { transformSync } from "@babel/core";

// state variable mappings: varName -> namespaceAlias
let stateMappings = new Map<string, string>();

export function setStateMappings(mappings: Map<string, string>) {
  stateMappings = mappings;
}

export function transformJSX(code: string, filename: string): string {
  const result = transformSync(code, {
    configFile: false,
    babelrc: false,
    presets: [
      ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    ],
    plugins: [
      renameStateVarsPlugin,
      reactiveExpressionsPlugin,
      [
        "@babel/plugin-transform-react-jsx",
        {
          runtime: "classic",
          pragma: "__h",
          pragmaFrag: "__Fragment",
          throwIfNamespace: false,
        },
      ],
    ],
    filename,
    sourceMaps: false,
  });

  return result?.code ?? code;
}

// babel plugin that renames state variables to property accesses
function renameStateVarsPlugin({ types: t }: any) {
  return {
    visitor: {
      Identifier(path: any) {
        const { name } = path.node;
        if (stateMappings.has(name)) {
          // ensure it's a reference to the module-level state variable, not a local one
          if (!path.scope.hasBinding(name) || path.scope.getBinding(name).kind === 'module') {
             // don't rename if it's a property of an object or a variable declaration
             if (t.isMemberExpression(path.parent) && path.parent.property === path.node) return;
             if (t.isVariableDeclarator(path.parent) && path.parent.id === path.node) return;
             if (t.isObjectProperty(path.parent) && path.parent.key === path.node) return;

             const nsAlias = stateMappings.get(name)!;
             path.replaceWith(t.memberExpression(t.identifier(nsAlias), t.identifier(name)));
          }
        }
      },
    },
  };
}

// babel plugin that wraps JSX expressions referencing state vars in () =>
function reactiveExpressionsPlugin({ types: t }: any) {
  return {
    visitor: {
      JSXExpressionContainer(path: any) {
        const expr = path.node.expression;
        if (!expr || expr.type === "JSXEmptyExpression") return;

        // 1. Don't wrap if it's already a function
        if (t.isFunction(expr)) return;

        // 2. Don't wrap if it's an event handler attribute (e.g. onClick)
        if (t.isJSXAttribute(path.parent)) {
          const name = path.parent.name.name;
          if (typeof name === "string" && name.startsWith("on")) {
            return;
          }
        }

        // check if expression references any state variables (now as MemberExpressions)
        if (referencesStateNamespace(expr)) {
          path.node.expression = t.arrowFunctionExpression([], expr);
        }
      },
    },
  };
}

function referencesStateNamespace(node: any): boolean {
  if (!node) return false;

  // 1. check if it's a .value access (likely a derive or ref)
  if (node.type === "MemberExpression") {
    if (node.property.type === "Identifier" && node.property.name === "value") {
      return true;
    }
  }

  // 2. check if it's a renamed state variable (MemberExpression like __state_0.count)
  if (node.type === "MemberExpression") {
    if (node.object.type === "Identifier" && node.object.name.startsWith("__state_")) {
      return true;
    }
  }

  // 3. check if it's an original state variable (Identifier like count)
  if (node.type === "Identifier") {
    if (stateMappings.has(node.name)) {
      return true;
    }
  }

  // walk child nodes
  return Object.values(node).some((child) => {
    if (Array.isArray(child)) {
      return child.some(
        (c) => c && typeof c === "object" && referencesStateNamespace(c),
      );
    }
    if (child && typeof child === "object") {
      return referencesStateNamespace(child);
    }
    return false;
  });
}
