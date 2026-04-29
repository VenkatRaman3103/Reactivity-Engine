import { readFileSync } from 'fs'
import { transformStateFile } from './compiler/transform-state-file'
import { transformForm } from './compiler/transform-form'

const code = readFileSync('./example/login.form.ts', 'utf-8')
const t1 = transformForm(code, '/home/venkat/Code/Projects/Reactivity-Engine/example/login.form.ts')
const t2 = transformStateFile(t1, '/home/venkat/Code/Projects/Reactivity-Engine/example/login.form.ts')

console.log("---- T1 ----")
console.log(t1)
console.log("---- T2 ----")
console.log(t2)
