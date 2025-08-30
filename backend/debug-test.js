#!/usr/bin/env node
import { spawn } from 'child_process';

console.log('Running debug test...');

const child = spawn('node', [
  '--experimental-vm-modules',
  'node_modules/jest/bin/jest.js',
  'tests/debug.test.js',
  '--verbose',
  '--no-cache'
], {
  stdio: 'inherit',
  cwd: process.cwd(),
  env: process.env
});

child.on('close', (code) => {
  console.log(`\nDebug test process exited with code ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Error running debug test:', error);
  process.exit(1);
});