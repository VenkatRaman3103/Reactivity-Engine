// compiler/tree-sitter.ts
// runs at build time
// parses all .tsx files
// builds component tree
// pipes to browser as JSON

import * as fs   from 'fs'
import * as path from 'path'

export interface ComponentNode {
  name:       string
  file:       string
  renders:    string[]
  renderedBy: string[]
}

export interface StaticTree {
  components: ComponentNode[]
  generated:  number
}

// simple AST-free parser
// reads JSX tags from .tsx files
// good enough without full Tree-sitter setup
export function buildComponentTree(root: string): StaticTree {
  const files      = findTSXFiles(root)
  const components = new Map<string, ComponentNode>()

  files.forEach(file => {
    const name    = getComponentName(file)
    const source  = fs.readFileSync(file, 'utf-8')
    const renders = extractJSXComponents(source)
    const relFile = path.relative(root, file).replace(/\\/g, '/')

    components.set(name, {
      name,
      file:       relFile,
      renders,
      renderedBy: []
    })
  })

  // build renderedBy from renders
  components.forEach((comp, name) => {
    comp.renders.forEach(child => {
      const childComp = components.get(child)
      if (childComp && !childComp.renderedBy.includes(name)) {
        childComp.renderedBy.push(name)
      }
    })
  })

  return {
    components: [...components.values()],
    generated:  Date.now()
  }
}

function extractJSXComponents(source: string): string[] {
  // find all <ComponentName> tags
  // component names start with uppercase
  const regex   = /<([A-Z][a-zA-Z0-9]*)/g
  const results = new Set<string>()
  let   m: RegExpExecArray | null

  while ((m = regex.exec(source)) !== null) {
    results.add(m[1])
  }

  return [...results]
}

function getComponentName(file: string): string {
  return path.basename(file, '.tsx')
}

function findTSXFiles(root: string): string[] {
  const results: string[] = []

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') return
        if (entry.name === '.git')         return
        if (entry.name === 'types')        return
        walk(full)
      } else if (entry.name.endsWith('.tsx')) {
        results.push(full)
      }
    })
  }

  walk(root)
  return results
}
