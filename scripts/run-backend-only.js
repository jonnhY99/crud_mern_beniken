#!/usr/bin/env node
/**
 * Run only backend tests to verify they work
 * Frontend tests need more fixes for API mocking
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';

    const child = spawn(command, args, {
      cwd: options.cwd || projectRoot,
      stdio: 'inherit',
      env: process.env,
      shell: isWin ? true : false,
      windowsHide: true,
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('\n🧪 Running Backend Tests (Native Runner)...\n');
    await run('npm', ['test'], { cwd: path.join(projectRoot, 'backend') });

    console.log('\n✅ Backend tests completed successfully!');
    console.log('\n📝 Note: Frontend tests need API mocking fixes.');
    console.log('   - Fixed import paths from ../../api/api to ../../utils/api');
    console.log('   - Fixed HeroSection tests for duplicate text elements');
    console.log('   - Need to implement missing API functions in utils/api.js');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Backend tests failed:', err.message || err);
    process.exit(1);
  }
}

main();