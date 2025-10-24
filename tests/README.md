# IntelliPen Extension Tests

This directory contains end-to-end tests for the IntelliPen Chrome extension using Jest and Puppeteer.

## Prerequisites

### 1. Install Chrome for Testing 138+

The tests require Chrome 138+ to support the Chrome AI APIs. Install it with:

```bash
npm run test:install-chrome
```

Or manually:

```bash
npx @puppeteer/browsers install chrome@stable
```

### 2. Build the Extension

The extension must be built before running tests:

```bash
npm run build
```

## Running Tests

```bash
# Run all tests (builds extension first)
npm test

# Run tests without rebuilding
npm run test:e2e

# Run tests in watch mode
npm run test:e2e:watch

# Run tests with verbose output
npm run test:e2e:verbose
```

## Test Structure

- `basic.test.js` - Basic browser functionality tests
- `ai-apis.test.js` - Chrome AI APIs availability tests
- `editor.test.js` - Editor screen functionality tests
- `meeting.test.js` - Meeting dashboard tests
- `popup.test.js` - Extension popup tests
- `service-worker.test.js` - Service worker tests
- `translator.test.js` - Translator screen tests

## Requirements

- Node.js 16+
- Chrome for Testing 138+ (installed via `npm run test:install-chrome`)
- Built extension in `dist/` directory (run `npm run build`)

## Hardware Requirements for AI APIs

To test the actual AI functionality (not just availability), your system needs:

- **Operating system:** Windows 10+, macOS 13+, Linux, or ChromeOS
- **Storage:** At least 22 GB free space
- **GPU:** 4GB+ VRAM
- **Network:** Unmetered connection for model download

## Notes

- Tests run in **headed mode** (visible browser) because Chrome extensions require it
- The browser window will open automatically during tests
- Tests check for API availability but don't require models to be downloaded
- Some tests may show warnings if AI APIs are not fully available on your system
- Extension ID is automatically detected from the loaded extension

## Troubleshooting

### "Extension not built" error
Run `npm run build` before testing.

### "Chrome for Testing 138+ not found" warning
Install Chrome for Testing with `npm run test:install-chrome`.

### Tests timeout
- Ensure your system meets the hardware requirements
- Check that the extension builds successfully
- Try running tests with verbose output: `npm run test:e2e:verbose`

### Service worker not found
This is expected in some test environments. The tests will still verify extension functionality through extension pages.
