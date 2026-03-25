import { readFileSync } from 'fs';
import { transformState } from './compiler/transform-state.js';
import { transformJSX } from './compiler/transform-jsx.js';
import { transformWhenConditions } from './compiler/transform-when.js';

async function run() {
  let code = readFileSync('example/layouts/dashboard.layout.tsx', 'utf8');
  code = transformWhenConditions(code);
  const stateRes = await transformState(code, 'example/layouts/dashboard.layout.tsx');
  code = transformJSX(stateRes.code, 'example/layouts/dashboard.layout.tsx', stateRes.mappings);
  console.log(code.split('\n').filter(line => line.includes('whenever')).join('\n'));
}
run();
