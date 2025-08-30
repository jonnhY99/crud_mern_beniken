// Simple file to verify Node.js execution
console.log('Node.js is working!');
console.log('Current directory:', process.cwd());

// Try to import a module
try {
  const path = require('path');
  console.log('Path module loaded successfully');
  console.log('__dirname:', __dirname);
} catch (error) {
  console.error('Error loading path module:', error);
}
