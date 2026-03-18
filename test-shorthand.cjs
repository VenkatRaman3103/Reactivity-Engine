const { transformWhenConditions } = require('./compiler/transform-when');

const code = `
export let count = 0;
whenever(count, () => {
  total = count * 2;
});

whenever(items, () => {
  discount = 20;
});
`;

console.log('--- TEST SHORTHAND ---');
const out = transformWhenConditions(code);
console.log(out);

if (out.includes('() => count') && out.includes('() => items')) {
    console.log('✅ BOTH TRANSFORMED');
} else {
    console.log('❌ FAILED');
    if (!out.includes('() => count')) console.log('   - count failed');
    if (!out.includes('() => items')) console.log('   - items failed');
}
