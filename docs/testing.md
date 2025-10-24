# Testing Guide

IntelliPen includes a comprehensive end-to-end testing infrastructure to ensure reliability and quality across all features.

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

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with visible browser |
| `npm run test:headless` | Run all tests in headless mode (no windows) |
| `npm run test:e2e:verbose` | Run with detailed output |
| `npm run test:e2e:watch` | Run in watch mode for development |
| `npm run test:install-chrome` | Install Chrome for Testing 138+ |
| `HEADLESS=true npm test -- <file>` | Run specific test file in headless mode |

## Test Suites

IntelliPen includes 7 comprehensive test suites covering all major features:

### Basic Tests (`basic.test.js`)
Tests fundamental browser functionality:

- Browser launch and initialization
- Page creation and navigation
- Extension loading verification

### AI APIs Tests (`ai-apis.test.js`)
Tests Chrome built-in AI APIs integration:

- API availability detection for all 7 APIs
- AIAPIManager initialization
- Individual API status checks (Prompt, Proofreader, Writer, Rewriter, Summarizer, Translator, Language Detector)
- Graceful handling of unavailable APIs

### Editor Tests (`editor.test.js`)
Tests the IntelliPen Editor features:

- Editor screen loading and initialization
- Text input and editing functionality
- Word and character counting
- Grammar check button presence
- Tone adjustment controls (formal, casual, professional, friendly)
- Writing improvement features
- Document management (new, save, open)

### Translator Tests (`translator.test.js`)
Tests translation functionality:

- Translator screen loading
- Source and target language selectors
- Text input and output areas
- Translation controls and buttons
- Language swap functionality
- Character counter
- Text-to-speech controls

### Meeting Tests (`meeting.test.js`)
Tests meeting recording and analysis:

- Meeting dashboard loading
- Device selection (microphone and speaker)
- Language selection for speech recognition
- Recording controls (start, stop, pause)
- Live transcript display
- AI analysis features (summaries, action items, decisions)
- Export functionality

### Popup Tests (`popup.test.js`)
Tests extension popup interface:

- Popup page loading
- Extension branding and logo
- API status indicators for all 7 APIs
- Quick action buttons
- Sidepanel opening functionality

### Service Worker Tests (`service-worker.test.js`)
Tests extension background functionality:

- Extension loading and initialization
- Chrome APIs availability (storage, runtime, tabs)
- Service worker registration
- Message passing infrastructure

## Testing Infrastructure

### Technology Stack

- **Jest 29.7.0**: Test framework with 60-second timeout support
- **Puppeteer Core**: Browser automation for end-to-end testing
- **@puppeteer/browsers**: Chrome for Testing installer
- **Chrome for Testing 138+**: Dedicated Chrome build for automated testing

### Test Configuration

**Jest Configuration** (`jest.config.js`):
```javascript
{
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  testTimeout: 60000,  // 60 seconds for AI operations
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js'],
  maxWorkers: 1  // Run serially to avoid browser conflicts
}
```

**Test Setup** (`tests/e2e/setup.js`):

- Launches Chrome with extension loaded
- Detects extension ID automatically
- Provides helper functions for tests
- Handles browser lifecycle management

### Headless vs Headed Mode

**Headed Mode (Default)**:

- Visible browser windows
- Useful for debugging and test development
- Slower execution but easier to troubleshoot

```bash
npm test
```

**Headless Mode**:

- No visible browser windows
- Faster execution
- CI/CD friendly
- Lower resource usage

```bash
npm run test:headless
# OR
HEADLESS=true npm test
```

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

- `global.setupBrowser()` - Launches Chrome with extension loaded
- `global.teardownBrowser()` - Closes browser and cleans up
- `global.getExtensionPage(path)` - Gets full extension URL for a page

### Best Practices

1. **Always close pages** in `afterEach` to prevent memory leaks
2. **Use specific selectors** (IDs, data attributes) for reliability
3. **Add timeouts** for elements that load asynchronously
4. **Test user flows** not just element presence
5. **Handle async operations** with proper await statements
6. **Mock AI APIs** if testing without full model download
7. **Use descriptive test names** that explain what's being tested

## System Requirements

### For Running Tests

- **Node.js**: 16+
- **Chrome for Testing**: 138+
- **Disk Space**: ~500 MB for Chrome + extension
- **Operating System**: Windows 10+, macOS 13+, Linux, or ChromeOS

### For AI API Testing

- **Storage**: 22 GB+ free space (for Gemini Nano model)
- **GPU**: 4GB+ VRAM
- **Network**: Unmetered connection for initial model download

!!! note
    Tests check for AI API availability but don't require full functionality. They will pass even if APIs are unavailable due to hardware limitations.

## Continuous Integration

IntelliPen uses GitHub Actions for automated testing on every push and pull request.

### GitHub Actions Workflow

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:install-chrome
      - run: npm run build
      - run: npm run test:headless  # Use headless mode in CI
```

### Local CI Testing

Test the CI workflow locally before pushing:

```bash
# Run the CI test script
bash scripts/test-ci-locally.sh
```

This script:

1. Cleans previous builds
2. Installs dependencies
3. Installs Chrome for Testing
4. Builds the extension
5. Runs tests in headless mode

## Troubleshooting

### Tests Won't Start

**Error: "Extension not built"**

```bash
npm run build
```

**Error: "Chrome for Testing 138+ not found"**

```bash
npm run test:install-chrome
```

### Tests Timeout

1. **Increase timeout** in `jest.config.js`:
```javascript
testTimeout: 120000  // 2 minutes
```

2. **Check extension build**:
```bash
npm run build
```

3. **Verify Chrome installation**:
```bash
ls ~/.cache/puppeteer/chrome/
```

### Extension Won't Load

1. Check `manifest.json` is valid
2. Verify all required files are in `dist/`
3. Look for build errors:
```bash
npm run build 2>&1 | grep -i error
```

### AI APIs Not Available

This is expected if:

- System doesn't meet hardware requirements (4GB+ VRAM, 22GB storage)
- Gemini Nano model not downloaded
- Chrome version < 138
- Running in headless mode (some APIs may not work)

!!! tip
    Tests check for API availability but don't require full functionality. They will pass with warnings if APIs are unavailable.

## Performance Tips

1. **Run tests serially** (already configured with `maxWorkers: 1`)
2. **Reuse browser instances** when possible
3. **Skip AI model downloads** in CI environments
4. **Use headless mode** for faster execution
5. **Use headed mode** only when debugging

## Test Coverage

Current test coverage includes:

- ✅ Extension loading and initialization
- ✅ All 7 Chrome AI APIs availability detection
- ✅ Editor features (grammar, writing, tone adjustment)
- ✅ Translation features (25+ languages, auto-detection)
- ✅ Meeting recording and analysis
- ✅ Popup menu and API status indicators
- ✅ Service worker and Chrome APIs
- ✅ UI components and navigation

## Additional Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Chrome Extensions Testing](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Chrome AI APIs](https://developer.chrome.com/docs/ai/)
- [GitHub Actions](https://docs.github.com/en/actions)

## Support

For testing issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review test output with `npm run test:e2e:verbose`
3. Check [TESTING.md](https://github.com/vietanhdev/IntelliPen/blob/main/TESTING.md) in the root directory
4. Open an issue on [GitHub](https://github.com/vietanhdev/IntelliPen/issues) with test logs

---

**Next Steps:**

- [Contributing Guide](contributing.md) - Learn how to contribute to IntelliPen
- [Architecture](architecture.md) - Understand the extension architecture
- [API Reference](api-reference.md) - Explore the API documentation
