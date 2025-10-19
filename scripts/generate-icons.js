#!/usr/bin/env node

/**
 * Generate PNG icons from SVG source
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('Error: sharp is not installed.');
  console.error('Please run: npm install sharp');
  process.exit(1);
}

const sizes = [16, 32, 48, 128];
const svgPath = path.join(__dirname, '../images/icon.svg');
const outputDir = path.join(__dirname, '../images');

async function generateIcons() {
  console.log('Generating icons from SVG...\n');

  if (!fs.existsSync(svgPath)) {
    console.error(`Error: SVG file not found at ${svgPath}`);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Generated icon${size}.png (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Failed to generate icon${size}.png:`, error.message);
    }
  }

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(error => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
