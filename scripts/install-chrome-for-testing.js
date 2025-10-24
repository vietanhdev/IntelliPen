#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing Chrome for Testing 138+...');

try {
  // Install Chrome for Testing using @puppeteer/browsers
  execSync('npx @puppeteer/browsers install chrome@stable', {
    stdio: 'inherit'
  });
  
  console.log('\n✓ Chrome for Testing installed successfully!');
  console.log('You can now run tests with: npm test');
} catch (error) {
  console.error('\n✗ Failed to install Chrome for Testing');
  console.error('Error:', error.message);
  console.error('\nPlease install manually with:');
  console.error('  npx @puppeteer/browsers install chrome@stable');
  process.exit(1);
}
