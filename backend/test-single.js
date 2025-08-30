#!/usr/bin/env node
import { spawn } from 'child_process';

const child = spawn('node', [
  '--experimental-vm-modules',
  'node_modules/jest/bin/jest.js',
  'tests/simple.test.js',
  '--verbose'
], {
  stdio: 'inherit',
  cwd: process.cwd()
});

child.on('close', (code) => {
  console.log(`Test process exited with code ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error('Error running test:', error);
  process.exit(1);
});