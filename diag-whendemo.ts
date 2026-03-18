import { transformWhenConditions } from './compiler/transform-when';
import fs from 'fs';

const code = fs.readFileSync('./example/demo/WhenDemo.state.tsx', 'utf-8');
console.log('--- ORIGINAL ---');
console.log(code);

const out = transformWhenConditions(code);
console.log('\n--- TRANSFORMED ---');
console.log(out);

if (out.includes('whenever(() => count')) {
    console.log('\n✅ SUCCESS: whenever(count) transformed');
} else {
    console.log('\n❌ FAILURE: whenever(count) NOT transformed');
}

if (out.includes('whenever(() => items')) {
    console.log('✅ SUCCESS: whenever(items) transformed');
} else {
    console.log('❌ FAILURE: whenever(items) NOT transformed');
}
