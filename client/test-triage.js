import { runTriageUnitTests } from './src/utils/triageEngine.js';

console.log('====================================================');
console.log('🧪 RUNNING ON-DEVICE TRIAGE DECISION TABLE UNIT TESTS');
console.log('====================================================');

const results = runTriageUnitTests();
let allPassed = true;

results.forEach((r, idx) => {
  const icon = r.passed ? '✅' : '❌';
  console.log(`${icon} [${idx + 1}] ${r.name}`);
  console.log(`   Expected: ${r.expected} | Actual: ${r.actual} | Result: ${r.passed ? 'PASSED' : 'FAILED'}`);
  console.log(`   Reason: ${r.reason}\n`);
  if (!r.passed) allPassed = false;
});

if (allPassed) {
  console.log('🎉 ALL 6 TRIAGE DECISION TABLE UNIT TESTS PASSED PERFECTLY!');
} else {
  console.error('❌ SOME TESTS FAILED');
  process.exit(1);
}
