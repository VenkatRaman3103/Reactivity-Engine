import { transformSync } from "@babel/core";

// Removed global stateMappings to prevent contamination between files

export function transformJSX(
  code: string,
  filename: string,
  stateMappings: Map<string, string> = new Map()
): string {
  const result = transformSync(code, {
    configFile: false,
    babelrc: false,
    presets: [
      ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    ],
    plugins: [
      [renameStateVarsPlugin, { stateMappings }],
      [reactiveExpressionsPlugin, { stateMappings }],
      transformKeyedJSXPlugin,
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
      Identifier(path: any, state: any) {
        const { stateMappings } = state.opts;
        const { name } = path.node;
        if (stateMappings.has(name)) {
          // ensure it's a reference to the module-level state variable, not a local one
          if (!path.scope.hasBinding(name) || path.scope.getBinding(name).kind === 'module') {
             // don't rename if it's a property of an object or a variable declaration
             if (t.isMemberExpression(path.parent) && path.parent.property === path.node) return;
             if (t.isVariableDeclarator(path.parent) && path.parent.id === path.node) return;
             if (t.isObjectProperty(path.parent) && path.parent.key === path.node) return;
             
             // CRITICAL: Don't rename identifiers in imports!
             if (t.isImportSpecifier(path.parent)) return;
             if (t.isImportDefaultSpecifier(path.parent)) return;
             if (t.isImportNamespaceSpecifier(path.parent)) return;

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
      JSXExpressionContainer(path: any, state: any) {
        const { stateMappings } = state.opts;
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

        // check if expressionreferences any state variables (now as MemberExpressions)
        if (referencesStateNamespace(expr, stateMappings)) {
          // Do not wrap Array.prototype methods like .map if they're root level in JSX
          // because it creates a coarse-grained thunk `() => array.map(...)` which 
          // reconstructs the array elements every time ANY referenced state changes.
          // BUT wait, if we don't wrap it, it won't be reactive at all if the array changes.
          // The issue is `items` is NOT state in the user's snippet.
          // "items" is a local variable: `const items = [...]`
          // So referencesStateNamespace(expr) should return FALSE.
          path.node.expression = t.arrowFunctionExpression([], expr);
        }
      },
    },
  };
}

function referencesStateNamespace(node: any, stateMappings: Map<string, string>): boolean {
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
        (c) => c && typeof c === "object" && referencesStateNamespace(c, stateMappings),
      );
    }
    if (child && typeof child === "object") {
      return referencesStateNamespace(child, stateMappings);
    }
    return false;
  });
}

// babel plugin that handles extracting the key prop from JSX elements
function transformKeyedJSXPlugin({ types: t }: any) {
  return {
    visitor: {
      JSXElement(path: any) {
        const openingEl  = path.node.openingElement
        const attributes = openingEl.attributes

        // find key prop
        const keyAttr = attributes.find(
          (a: any) => a.type === 'JSXAttribute' && a.name.name === 'key'
        )

        if (!keyAttr) return

        // remove key from props — never render to DOM
        openingEl.attributes = attributes.filter(
          (a: any) => !(a.type === 'JSXAttribute' && a.name.name === 'key')
        )

        // wrap element in { __key, __node } object
        // so reconcile can extract the key
        const keyValue = keyAttr.value
        path.replaceWith({
          type: 'ObjectExpression',
          properties: [
            {
              type:  'ObjectProperty',
              key:   { type: 'Identifier', name: '__key' },
              value: keyValue.type === 'JSXExpressionContainer'
                ? keyValue.expression
                : keyValue
            },
            {
              type:  'ObjectProperty',
              key:   { type: 'Identifier', name: '__node' },
              value: path.node
            }
          ]
        })
      }
    }
  }
}

