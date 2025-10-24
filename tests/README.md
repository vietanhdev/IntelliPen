# IntelliPen Tests

End-to-end tests for the IntelliPen Chrome extension using Puppeteer and Jest.

## Running Tests

### With Visible Browser (Default)
```bash
npm test
```

### Headless Mode (No Visible Windows)
```bash
npm run test:headless
```

### Specific Test File
```bash
# With visible browser
npm test -- tests/e2e/translator.test.js

# Headless mode
HEADLESS=true npm test -- tests/e2e/translator.test.js
```

## Test Suites

- **basic.test.js** - Basic browser and navigation tests
- **ai-apis.test.js** - Chrome AI APIs availability and integration
- **editor.test.js** - Editor features and functionality
- **translator.test.js** - Translation features
- **meeting.test.js** - Meeting dashboard and recording
- **popup.test.js** - Extension popup menu
- **service-worker.test.js** - Extension service worker and Chrome APIs

## Environment Variables

- `HEADLESS=true` - Run tests in headless mode (no visible windows)

## Setup Files

- **setup.js** - Global test setup, browser launch, and extension loading
- **jest.config.js** - Jest configuration

## Requirements

- Node.js 16+
- Chrome for Testing 138+ (installed via `npm run test:install-chrome`)
- Built extension in `dist/` directory (run `npm run build`)

## Tips

- Use headless mode for CI/CD and faster execution
- Use headed mode (default) for debugging and test development
- Tests run serially to avoid browser conflicts
- Dialog handlers are set up to auto-accept confirmation prompts

For more details, see [TESTING.md](../TESTING.md) in the root directory.
