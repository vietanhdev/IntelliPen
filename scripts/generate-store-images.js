#!/usr/bin/env node

/**
 * Generate Chrome Web Store promotional images from screenshots
 * 
 * Requirements:
 * - Screenshots: 1280x800 or 640x400 (JPEG or 24-bit PNG, no alpha)
 * - Small promo tile: 440x280 (JPEG or 24-bit PNG, no alpha)
 * - Marquee promo tile: 1400x560 (JPEG or 24-bit PNG, no alpha)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = 'docs/screenshots';
const OUTPUT_DIR = 'store-images';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function generateScreenshots() {
    const screenshots = ['editor.png', 'meeting.png', 'translator.png'];

    console.log('Generating store screenshots (1280x800)...');

    for (const screenshot of screenshots) {
        const inputPath = path.join(INPUT_DIR, screenshot);
        const outputPath = path.join(OUTPUT_DIR, screenshot.replace('.png', '-1280x800.png'));

        await sharp(inputPath)
            .resize(1280, 800, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255 }
            })
            .flatten({ background: '#ffffff' }) // Remove alpha channel
            .png()
            .toFile(outputPath);

        console.log(`✓ Created ${outputPath}`);
    }
}

async function generateSmallPromoTile() {
    console.log('\nGenerating small promo tile (440x280)...');

    const outputPath = path.join(OUTPUT_DIR, 'small-promo-440x280.png');

    // Create a composite image with IntelliPen branding
    const width = 440;
    const height = 280;

    // Create base image from screenshot
    const baseImage = await sharp(path.join(INPUT_DIR, 'editor.png'))
        .resize(width, height, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255 }
        })
        .flatten({ background: '#ffffff' })
        .toBuffer();

    // Create overlay with text
    const overlay = await sharp(Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="80" fill="url(#grad)" />
      <text x="${width / 2}" y="50" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">IntelliPen</text>
    </svg>
  `))
        .png()
        .toBuffer();

    // Combine and flatten
    await sharp(baseImage)
        .composite([{ input: overlay, top: 0, left: 0 }])
        .flatten({ background: '#ffffff' })
        .png()
        .toFile(outputPath);

    console.log(`✓ Created ${outputPath}`);
}

async function generateMarqueePromoTile() {
    console.log('\nGenerating marquee promo tile (1400x560)...');

    const outputPath = path.join(OUTPUT_DIR, 'marquee-promo-1400x560.png');

    const width = 1400;
    const height = 560;
    const bannerHeight = 100;
    const contentHeight = height - bannerHeight;

    // Create a composite with three screenshots side by side
    const screenshots = ['editor.png', 'translator.png', 'meeting.png'];
    const screenshotWidth = Math.floor(width / 3);

    const composites = [];

    // Resize screenshots to fit in the content area (above the banner)
    for (let i = 0; i < screenshots.length; i++) {
        const resized = await sharp(path.join(INPUT_DIR, screenshots[i]))
            .resize(screenshotWidth, contentHeight, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255 }
            })
            .flatten({ background: '#ffffff' })
            .toBuffer();

        composites.push({
            input: resized,
            top: 0,
            left: i * screenshotWidth
        });
    }

    // Create gradient banner overlay
    const banner = await sharp(Buffer.from(`
    <svg width="${width}" height="${bannerHeight}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${bannerHeight}" fill="url(#grad)" />
      <text x="${width / 2}" y="45" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">IntelliPen</text>
      <text x="${width / 2}" y="75" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle">AI-Powered Writing, Translation and Meeting Intelligence</text>
    </svg>
  `))
        .png()
        .toBuffer();

    composites.push({
        input: banner,
        top: contentHeight,
        left: 0
    });

    // Create base canvas and composite everything
    await sharp({
        create: {
            width: width,
            height: height,
            channels: 3,
            background: { r: 255, g: 255, b: 255 }
        }
    })
        .composite(composites)
        .flatten({ background: '#ffffff' })
        .png()
        .toFile(outputPath);

    console.log(`✓ Created ${outputPath}`);
}

async function generateAlternativeScreenshots() {
    console.log('\nGenerating alternative 640x400 screenshots...');

    const screenshots = ['editor.png', 'meeting.png', 'translator.png'];

    for (const screenshot of screenshots) {
        const inputPath = path.join(INPUT_DIR, screenshot);
        const outputPath = path.join(OUTPUT_DIR, screenshot.replace('.png', '-640x400.png'));

        await sharp(inputPath)
            .resize(640, 400, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255 }
            })
            .flatten({ background: '#ffffff' })
            .png()
            .toFile(outputPath);

        console.log(`✓ Created ${outputPath}`);
    }
}

async function main() {
    try {
        console.log('🎨 Generating Chrome Web Store promotional images...\n');

        await generateScreenshots();
        await generateAlternativeScreenshots();
        await generateSmallPromoTile();
        await generateMarqueePromoTile();

        console.log('\n✅ All promotional images generated successfully!');
        console.log(`\nOutput directory: ${OUTPUT_DIR}/`);
        console.log('\nGenerated files:');
        console.log('  - editor-1280x800.png (screenshot)');
        console.log('  - meeting-1280x800.png (screenshot)');
        console.log('  - translator-1280x800.png (screenshot)');
        console.log('  - editor-640x400.png (screenshot alternative)');
        console.log('  - meeting-640x400.png (screenshot alternative)');
        console.log('  - translator-640x400.png (screenshot alternative)');
        console.log('  - small-promo-440x280.png (small promo tile)');
        console.log('  - marquee-promo-1400x560.png (marquee promo tile)');
    } catch (error) {
        console.error('❌ Error generating images:', error);
        process.exit(1);
    }
}

main();
