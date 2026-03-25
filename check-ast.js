import { transformSync } from '@babel/core';
import fs from 'fs';
import { transformState } from './compiler/transform-state.js';
import { transformJSX } from './compiler/transform-jsx.js';
import { resolve } from 'path';

async function run() {
  const code = fs.readFileSync('example/LayoutTest.tsx', 'utf8');
  // First run transformState (like Vite does)
  // But wait, transformState is async?
  // Let me just look at the compiled output from Vite!
}
