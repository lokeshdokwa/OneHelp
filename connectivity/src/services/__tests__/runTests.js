import { runCommunicationLayerTests } from './communicationManager.test.js';

runCommunicationLayerTests()
  .then((results) => {
    console.log('\n--- Test Summary Table ---');
    console.table(results);
    process.exit(results.every(r => r.status === 'PASSED') ? 0 : 1);
  })
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  });
