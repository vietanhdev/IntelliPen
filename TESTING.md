# Testing Guide for IntelliPen

This guide explains how to set up and run tests for the IntelliPen Chrome extension.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Install Chrome for Testing 138+
npm run test:install-chrome

# 3. Build the extension
npm run build

# 4. Run tests (with visible browser)
npm test

# OR run tests in headless mode (no visible windows)
npm run test:headless
```

## Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with visible browser |
| `npm run test:headless` | Run all tests in headless mode (no windows) |
| `npm run test:e2e:verbose` | Run with detailed output |
| `npm run test:e2e:watch` | Run in watch mode for development |
| `HEADLESS=true npm test -- <file>` | Run specific test file in headless mode |

## Detailed Setup

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `puppeteer-core` - Browser automation
- `@puppeteer/browsers` - Chrome for Testing installer
- `jest` - Test framework

### Step 2: Install Chrome for Testing

The extension requires Chrome 138+ to support the Chrome AI APIs:

```bash
npm run test:install-chrome
```

This downloads Chrome for Testing to `~/.cache/puppeteer/chrome/`.

**Manual installation:**
```bash
npx @puppeteer/browsers install chrome@stable
```

### Step 3: Build the Extension

Tests require the built extension in the `dist/` directory:

```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run build:watch
```

### Step 4: Run Tests

```bash
# Run all tests (with visible browser windows)
npm test

# Run all tests in headless mode (no visible windows)
npm run test:headless

# Run specific test file
npm test -- tests/e2e/editor.test.js

# Run specific test file in headless mode
HEADLESS=true npm test -- tests/e2e/editor.test.js

# Run with verbose output
npm run test:e2e:verbose

# Run in watch mode (for development)
npm run test:e2e:watch
```

## Test Suites

### Basic Tests (`basic.test.js`)
- Browser launch
- Page creation
- Navigation

### AI APIs Tests (`ai-apis.test.js`)
- API availability detection
- AIAPIManager initialization
- Individual API status checks

### Editor Tests (`editor.test.js`)
- Editor screen loading
- Text input and editing
- Word/character counting
- Grammar check button
- Tone adjustment controls

### Meeting Tests (`meeting.test.js`)
- Meeting dashboard loading
- Device selection (microphone/speaker)
- Language selection
- Recording controls
- Transcript display
- Analysis features

### Popup Tests (`popup.test.js`)
- Popup page loading
- Extension branding
- API status indicators
- Quick action buttons

### Service Worker Tests (`service-worker.test.js`)
- Extension loading
- Chrome APIs availability
- Storage and runtime APIs

### Translator Tests (`translator.test.js`)
- Translator screen loading
- Language selectors
- Text input/output
- Translation controls

## System Requirements

### For Running Tests
- **Node.js:** 16+
- **Chrome for Testing:** 138+
- **Disk Space:** ~500 MB for Chrome + extension

### For AI API Testing
- **OS:** Windows 10+, macOS 13+, Linux, or ChromeOS
- **Storage:** 22 GB+ free space (for Gemini Nano model)
- **GPU:** 4GB+ VRAM
- **Network:** Unmetered connection

## Test Configuration

### Jest Configuration (`jest.config.js`)
```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  maxWorkers: 1  // Run serially to avoid conflicts
}
```

### Test Setup (`tests/e2e/setup.js`)
- Launches Chrome with extension loaded
- Detects extension ID
- Provides helper functions for tests

## Writing New Tests

### Basic Test Structure

```javascript
describe('Feature Name', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should do something', async () => {
    const element = await page.$('#some-element');
    expect(element).toBeTruthy();
  });
});
```

### Helper Functions

- `global.setupBrowser()` - Launches Chrome with extension
- `global.teardownBrowser()` - Closes browser
- `global.getExtensionPage(path)` - Gets extension URL

### Best Practices

1. **Always close pages** in `afterEach` to prevent memory leaks
2. **Use specific selectors** to make tests more reliable
3. **Add timeouts** for elements that load asynchronously
4. **Test user flows** not just element presence
5. **Mock AI APIs** if testing without full model download

## Troubleshooting

### Tests Won't Start

**Error:** "Extension not built"
```bash
npm run build
```

**Error:** "Chrome for Testing 138+ not found"
```bash
npm run test:install-chrome
```

### Tests Timeout

1. Increase timeout in `jest.config.js`:
```javascript
testTimeout: 120000  // 2 minutes
```

2. Check if extension builds successfully:
```bash
npm run build
```

3. Verify Chrome installation:
```bash
ls ~/.cache/puppeteer/chrome/
```

### Extension Won't Load

1. Check manifest.json is valid
2. Verify all required files are in dist/
3. Look for build errors:
```bash
npm run build 2>&1 | grep -i error
```

### AI APIs Not Available

This is expected if:
- System doesn't meet hardware requirements
- Gemini Nano model not downloaded
- Chrome version < 138

Tests check for API availability but don't require full functionality.

## Headless Mode

Tests can run in headless mode (without visible browser windows) for faster execution and CI/CD environments.

### Running in Headless Mode

```bash
# Using npm script
npm run test:headless

# Using environment variable
HEADLESS=true npm test

# Specific test file
HEADLESS=true npm test -- tests/e2e/translator.test.js
```

### Benefits of Headless Mode

- **Faster execution**: No GUI rendering overhead
- **CI/CD friendly**: Works in environments without display servers
- **Resource efficient**: Lower memory and CPU usage
- **Parallel execution**: Can run multiple test suites simultaneously

### When to Use Headed Mode

Use headed mode (default) when:
- Debugging test failures
- Developing new tests
- Verifying UI interactions visually
- Recording test execution

## Continuous Integration

### GitHub Actions

The project includes a complete GitHub Actions workflow at `.github/workflows/test.yml` that:

- ✅ Runs tests on Node.js 18.x and 20.x
- ✅ Executes tests in headless mode
- ✅ Runs linting checks
- ✅ Verifies build output
- ✅ Uploads test results and build artifacts
- ✅ Triggers on push, pull requests, and manual dispatch

**Workflow Status:** [![Tests](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml/badge.svg)](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml)

### Manual Workflow Trigger

You can manually trigger the test workflow from the GitHub Actions tab:
1. Go to the "Actions" tab in your repository
2. Select "Tests" workflow
3. Click "Run workflow"

### Local CI Simulation

To simulate the CI environment locally:

```bash
# Install dependencies (like CI does)
npm ci

# Install Chrome for Testing
npm run test:install-chrome

# Build extension
npm run build

# Run tests in headless mode
npm run test:headless
```

## Performance Tips

1. **Run tests serially** (already configured with `maxWorkers: 1`)
2. **Reuse browser instances** when possible
3. **Skip AI model downloads** in CI environments
4. **Use headless mode** for faster execution and CI/CD pipelines
5. **Use headed mode** only when debugging or developing tests

## Additional Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Chrome Extensions Testing](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Chrome AI APIs](https://developer.chrome.com/docs/ai/)

## Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review test output with `npm run test:e2e:verbose`
3. Open an issue on GitHub with test logs
