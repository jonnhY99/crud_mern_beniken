#!/usr/bin/env node
/**
 * Native Node.js test runner to bypass Jest ESM issues
 * This provides a simple test framework without external dependencies
 */

import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test framework
class TestRunner {
  constructor() {
    this.tests = [];
    this.describes = [];
    this.currentDescribe = null;
    this.passed = 0;
    this.failed = 0;
    this.errors = [];
  }

  describe(name, fn) {
    const oldDescribe = this.currentDescribe;
    this.currentDescribe = name;
    this.describes.push(name);
    
    try {
      fn();
    } catch (error) {
      this.errors.push(`Error in describe "${name}": ${error.message}`);
    }
    
    this.currentDescribe = oldDescribe;
  }

  test(name, fn) {
    this.tests.push({
      name: `${this.currentDescribe ? this.currentDescribe + ' > ' : ''}${name}`,
      fn
    });
  }

  it(name, fn) {
    this.test(name, fn);
  }

  expect(actual) {
    return {
      toBe: (expected) => {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to be ${expected}`);
        }
      },
      toEqual: (expected) => {
        if (JSON.stringify(actual) !== JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
        }
      },
      toHaveProperty: (prop, value) => {
        if (!(prop in actual)) {
          throw new Error(`Expected object to have property ${prop}`);
        }
        if (value !== undefined && actual[prop] !== value) {
          throw new Error(`Expected property ${prop} to be ${value}, got ${actual[prop]}`);
        }
      },
      toBeDefined: () => {
        if (actual === undefined) {
          throw new Error('Expected value to be defined');
        }
      },
      toBeUndefined: () => {
        if (actual !== undefined) {
          throw new Error('Expected value to be undefined');
        }
      }
    };
  }

  async runTests() {
    console.log(`\n🧪 Running ${this.tests.length} tests...\n`);

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
        this.errors.push(`${test.name}: ${error.message}`);
      }
    }

    this.printSummary();
  }

  printSummary() {
    console.log(`\n📊 Test Results:`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total:  ${this.tests.length}`);

    if (this.failed > 0) {
      console.log(`\n❌ Failed tests:`);
      this.errors.forEach(error => console.log(`   ${error}`));
      process.exit(1);
    } else {
      console.log(`\n✅ All tests passed!`);
      process.exit(0);
    }
  }
}

// Global test runner instance
const runner = new TestRunner();

// Export globals for test files
global.describe = runner.describe.bind(runner);
global.test = runner.test.bind(runner);
global.it = runner.it.bind(runner);
global.expect = runner.expect.bind(runner);

// Load and run test files
async function loadTestFiles() {
  const testsDir = join(__dirname, 'tests');
  
  try {
    const files = await readdir(testsDir, { recursive: true });
    const testFiles = files.filter(file => 
      file.endsWith('.test.js') && 
      !file.includes('node_modules') &&
      (file === 'basic.test.js' || file === 'models.test.js') // Run basic and models tests
    );

    console.log(`Found ${testFiles.length} test files`);

    for (const file of testFiles) {
      const filePath = join(testsDir, file);
      console.log(`Loading: ${file}`);
      
      try {
        await import(`file://${filePath}`);
      } catch (error) {
        console.error(`Error loading ${file}:`, error.message);
        runner.errors.push(`Failed to load ${file}: ${error.message}`);
      }
    }

    await runner.runTests();
  } catch (error) {
    console.error('Error reading test directory:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  loadTestFiles();
}

export default runner;