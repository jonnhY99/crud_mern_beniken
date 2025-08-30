#!/usr/bin/env node
/*
 Cross-platform test runner for Beniken project.
 Runs backend (Jest), frontend (RTL), and E2E (Playwright) tests sequentially
 without relying on shell operators like && or cd.
 Now uses shell=true on Windows to avoid spawn EINVAL issues.
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
      shell: isWin ? true : false, // Use shell on Windows to resolve npm/npx
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
    console.log('\n=== 1/3: Backend tests (Jest) ===');
    await run('npm', ['test'], { cwd: path.join(projectRoot, 'backend') });

    console.log('\n=== 2/3: Frontend tests (React Testing Library) ===');
    // Ensure frontend tests do not start interactive watch mode
    await run('npm', ['test', '--', '--watchAll=false'], { cwd: path.join(projectRoot, 'frontend') });

    console.log('\n=== 3/3: E2E tests (Playwright) ===');
    await run('npx', ['playwright', 'test'], { cwd: projectRoot });

    console.log('\n✅ All test suites completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test sequence failed:', err.message || err);
    process.exit(1);
  }
}

main();
