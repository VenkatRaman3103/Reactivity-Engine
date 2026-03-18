const { transformWhenConditions } = require('./compiler/transform-when');
const { transformStateFile } = require('./compiler/transform-state-file');

const code = `
export let count = 0;
export let total = 0;

whenever(count, () => {
  total = count * 2;
});
`;

console.log('--- TEST ---');
try {
    const step0 = transformWhenConditions(code);
    console.log('Step 0 (transformWhenConditions):\n', step0);

    const step1 = transformStateFile(step0, 'test.state.ts');
    console.log('\nStep 1 (transformStateFile):\n', step1);
} catch (e) {
    console.error(e);
}
