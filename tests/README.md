# IntelliPen E2E Tests

End-to-end tests for the IntelliPen Chrome Extension using Puppeteer and Jest.

## Prerequisites

1. **Node.js 16+** installed
2. **Chrome 138+** installed (for AI APIs support)
3. **Built extension** in `dist/` directory

## Installation

Install test dependencies:

```bash
npm install
```

This will install:
- `puppeteer` - Browser automation
- `jest` - Test framework
- `@types/jest` - TypeScript definitions for Jest

## Running Tests

### Build the Extension First

Always build the extension before running tests:

```bash
npm run build
```

### Run All Tests

```bash
npm run test:e2e
```

### Run Tests in Watch Mode

```bash
npm run test:e2e:watch
```

### Run Tests with Verbose Output

```bash
npm run test:e2e:verbose
```

### Run Specific Test File

```bash
npx jest tests/e2e/editor.test.js
```

## Test Structure

```
tests/
├── e2e/
│   ├── setup.js              # Global test setup
│   ├── editor.test.js        # Editor feature tests
│   ├── translator.test.js    # Translator feature tests
│   ├── meeting.test.js       # Meeting dashboard tests
│   ├── popup.test.js         # Popup menu tests
│   ├── service-worker.test.js # Service worker tests
│   └── ai-apis.test.js       # AI APIs integration tests
├── fixtures/                  # Test fixtures (if needed)
├── instructions.md            # Detailed testing guide
└── README.md                  # This file
```

## Test Coverage

### Editor Tests (`editor.test.js`)
- ✅ Editor screen loading
- ✅ Textarea display
- ✅ Word count tracking
- ✅ Character count tracking
- ✅ Grammar check button
- ✅ Tone adjustment controls
- ✅ Clear editor content

### Translator Tests (`translator.test.js`)
- ✅ Translator screen loading
- ✅ Source language selector
- ✅ Target language selector
- ✅ Text input/output
- ✅ Swap languages button
- ✅ Language detection

### Meeting Tests (`meeting.test.js`)
- ✅ Meeting screen loading
- ✅ Device selection (microphone/speaker)
- ✅ Language selector
- ✅ Record/stop controls
- ✅ Transcript display
- ✅ Analysis buttons
- ✅ Export functionality

### Popup Tests (`popup.test.js`)
- ✅ Popup page loading
- ✅ Extension branding
- ✅ Open sidepanel button
- ✅ API status indicators
- ✅ Quick action buttons
- ✅ Responsive design

### Service Worker Tests (`service-worker.test.js`)
- ✅ Service worker running
- ✅ Chrome APIs availability
- ✅ Storage API access
- ✅ Runtime API access
- ✅ Context menu creation
- ✅ Message passing

### AI APIs Tests (`ai-apis.test.js`)
- ✅ Prompt API availability
- ✅ Summarizer API availability
- ✅ Translator API availability
- ✅ Writer API availability
- ✅ Rewriter API availability
- ✅ Proofreader API availability
- ✅ Language Detector API availability
- ✅ AIAPIManager availability

## Important Notes

### Chrome AI APIs Availability

The AI APIs tests check for API availability but may show different statuses depending on:
- Chrome version (requires 138+)
- Hardware requirements (22GB storage, 4GB+ VRAM)
- Model download status
- Operating system support

Expected statuses:
- `available` - API is ready to use
- `downloadable` - Model needs to be downloaded
- `unavailable` - API not supported on this system

### Headless Mode

Tests run in Chrome's new headless mode (`--headless=new`) which supports extensions. The old headless mode does not support extensions.

### Service Worker Behavior

Service workers may not terminate automatically in test environments due to the debugger attachment. This is expected behavior when using Puppeteer.

### Timeouts

Default test timeout is 60 seconds. AI operations can be slow, especially on first run when models are downloading.

## Troubleshooting

### Extension Not Loading

**Problem**: Tests fail with "Extension ID not found"

**Solution**:
1. Ensure `dist/` directory exists: `ls dist/`
2. Check manifest.json is present: `ls dist/manifest.json`
3. Rebuild extension: `npm run build`

### Tests Timing Out

**Problem**: Tests timeout after 60 seconds

**Solution**:
1. Increase timeout in `jest.config.js`
2. Check if AI APIs are available on your system
3. Verify Chrome version: `chrome://version`

### API Not Available

**Problem**: AI API tests show "unavailable" status

**Solution**:
1. Check Chrome version (requires 138+)
2. Verify hardware requirements
3. Check `chrome://on-device-internals` for model status
4. Ensure sufficient storage space (22GB+)

### Permission Errors

**Problem**: Tests fail with permission errors

**Solution**:
1. Run with `--no-sandbox` flag (already included)
2. Check file permissions on `dist/` directory
3. Try running with sudo (not recommended)

## Writing New Tests

### Basic Test Template

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
    // Your test code here
    const element = await page.$('#some-element');
    expect(element).toBeTruthy();
  });
});
```

### Best Practices

1. **Always close pages**: Use `afterEach` to close pages
2. **Use proper selectors**: Prefer IDs over classes
3. **Wait for elements**: Use `waitForSelector` for dynamic content
4. **Handle async**: Always await async operations
5. **Test user flows**: Focus on complete user journeys
6. **Avoid internal state**: Test what users see

## CI/CD Integration

To run tests in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm ci

- name: Build extension
  run: npm run build

- name: Run E2E tests
  run: npm run test:e2e
```

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Chrome Extensions Testing](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/)

## Support

For issues or questions:
1. Check the [instructions.md](./instructions.md) for detailed guidance
2. Review test output for specific error messages
3. Check Chrome DevTools console for runtime errors
4. Open an issue on GitHub with test logs
