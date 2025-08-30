// Simple test runner to verify Jest setup
console.log('Starting test runner...');
console.log('Current directory:', process.cwd());

try {
  console.log('Importing Jest...');
  const { run } = await import('jest');
  
  console.log('Starting tests...');
  const result = await run([
    '--config=jest.config.js',
    '--verbose',
    '--detectOpenHandles',
    '--forceExit'
  ]);
  
  console.log('Tests completed with result:', result);
  process.exit(result.results.success ? 0 : 1);
} catch (error) {
  console.error('Error running tests:', error);
  process.exit(1);
}
