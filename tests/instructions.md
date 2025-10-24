# End-to-End Testing Implementation for IntelliPen Chrome Extension

## Overview

This guide provides instructions for implementing end-to-end testing for the IntelliPen Chrome Extension using Puppeteer, focusing on testing Chrome's built-in AI APIs integration.

## Setup

### 1. Install Dependencies

```bash
npm install --save-dev puppeteer jest @types/jest
```

### 2. Create Test Directory Structure

```
tests/
├── e2e/
│   ├── setup.js
│   ├── editor.test.js
│   ├── translator.test.js
│   ├── meeting.test.js
│   ├── popup.test.js
│   ├── service-worker.test.js
│   └── ai-apis.test.js
└── fixtures/
    └── test-extension/
```

### 3. Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/e2e/**/*.test.js'],
  testTimeout: 60000,
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.js']
};
```

## Test Setup Utilities

Create `tests/e2e/setup.js`:

```javascript
const puppeteer = require('puppeteer');
const path = require('path');

let browser;
let extensionId;

global.setupBrowser = async () => {
  const extensionPath = path.join(__dirname, '../../dist');
  
  browser = await puppeteer.launch({
    headless: 'new', // Use new headless mode that supports extensions
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  // Get extension ID
  const targets = await browser.targets();
  const extensionTarget = targets.find(
    target => target.type() === 'service_worker'
  );
  
  if (extensionTarget) {
    const url = extensionTarget.url();
    extensionId = url.split('/')[2];
  }

  return { browser, extensionId };
};

global.teardownBrowser = async () => {
  if (browser) {
    await browser.close();
  }
};

global.getExtensionPage = async (page) => {
  return `chrome-extension://${extensionId}/${page}`;
};
```

## Test Implementation Examples

### 1. Editor AI Features Test

Create `tests/e2e/editor.test.js`:

```javascript
describe('Editor AI Features', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(await global.getExtensionPage('sidepanel/index.html'));
  });

  afterEach(async () => {
    await page.close();
  });

  test('should load editor screen', async () => {
    await page.waitForSelector('#editor-screen');
    const isVisible = await page.$eval('#editor-screen', 
      el => el.style.display !== 'none'
    );
    expect(isVisible).toBe(true);
  });

  test('should perform grammar check', async () => {
    // Type text with grammar error
    await page.type('#editor-textarea', 'I has a error in grammer.');
    
    // Click grammar check button
    await page.click('#grammar-check-btn');
    
    // Wait for results
    await page.waitForSelector('.grammar-result', { timeout: 30000 });
    
    const hasCorrections = await page.$('.grammar-result');
    expect(hasCorrections).toBeTruthy();
  });

  test('should adjust tone to formal', async () => {
    await page.type('#editor-textarea', 'Hey, this is cool stuff!');
    
    // Select formal tone
    await page.select('#tone-select', 'more-formal');
    await page.click('#adjust-tone-btn');
    
    await page.waitForSelector('.tone-result', { timeout: 30000 });
    
    const result = await page.$eval('.tone-result', el => el.textContent);
    expect(result.length).toBeGreaterThan(0);
  });

  test('should track word count', async () => {
    const testText = 'This is a test sentence with ten words here.';
    await page.type('#editor-textarea', testText);
    
    const wordCount = await page.$eval('#word-count', el => el.textContent);
    expect(parseInt(wordCount)).toBeGreaterThan(0);
  });
});
```

### 2. Translator Test

Create `tests/e2e/translator.test.js`:

```javascript
describe('Translator Features', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(await global.getExtensionPage('sidepanel/index.html'));
    
    // Switch to translator screen
    await page.click('#translator-tab');
    await page.waitForSelector('#translator-screen');
  });

  afterEach(async () => {
    await page.close();
  });

  test('should translate text', async () => {
    // Select languages
    await page.select('#source-language', 'en');
    await page.select('#target-language', 'es');
    
    // Enter text
    await page.type('#source-text', 'Hello, how are you?');
    
    // Wait for translation
    await page.waitForFunction(
      () => document.querySelector('#translated-text').value.length > 0,
      { timeout: 30000 }
    );
    
    const translation = await page.$eval('#translated-text', el => el.value);
    expect(translation.length).toBeGreaterThan(0);
  });

  test('should auto-detect language', async () => {
    await page.type('#source-text', 'Bonjour, comment allez-vous?');
    
    await page.waitForFunction(
      () => document.querySelector('#detected-language').textContent !== '',
      { timeout: 10000 }
    );
    
    const detected = await page.$eval('#detected-language', el => el.textContent);
    expect(detected).toContain('fr');
  });
});
```

### 3. Meeting Dashboard Test

Create `tests/e2e/meeting.test.js`:

```javascript
describe('Meeting Dashboard', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    
    // Grant microphone permissions
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(
      await global.getExtensionPage(''),
      ['microphone']
    );
    
    await page.goto(await global.getExtensionPage('sidepanel/index.html'));
    await page.click('#meeting-tab');
    await page.waitForSelector('#meeting-screen');
  });

  afterEach(async () => {
    await page.close();
  });

  test('should display device selection', async () => {
    const micSelect = await page.$('#microphone-select');
    const speakerSelect = await page.$('#speaker-select');
    
    expect(micSelect).toBeTruthy();
    expect(speakerSelect).toBeTruthy();
  });

  test('should generate meeting summary', async () => {
    // Simulate transcript
    await page.evaluate(() => {
      window.meetingAI.transcript = 'This is a test meeting transcript about project updates.';
    });
    
    await page.click('#generate-summary-btn');
    
    await page.waitForSelector('.summary-result', { timeout: 30000 });
    
    const summary = await page.$eval('.summary-result', el => el.textContent);
    expect(summary.length).toBeGreaterThan(0);
  });
});
```

### 4. Popup Test

Create `tests/e2e/popup.test.js`:

```javascript
describe('Extension Popup', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    // Open popup in tab (since we can't open actual popup in tests)
    await page.goto(await global.getExtensionPage('popup/menu.html'));
  });

  afterEach(async () => {
    await page.close();
  });

  test('should display API status indicators', async () => {
    await page.waitForSelector('.api-status');
    
    const statusElements = await page.$$('.api-status');
    expect(statusElements.length).toBeGreaterThan(0);
  });

  test('should open sidepanel on button click', async () => {
    const openButton = await page.$('#open-sidepanel-btn');
    expect(openButton).toBeTruthy();
  });
});
```

### 5. Service Worker Test

Create `tests/e2e/service-worker.test.js`:

```javascript
describe('Service Worker', () => {
  let browser, extensionId;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  test('should access service worker', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    
    expect(workerTarget).toBeTruthy();
    
    const worker = await workerTarget.worker();
    expect(worker).toBeTruthy();
  });

  test('should handle context menu creation', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const contextMenus = await worker.evaluate(() => {
      return new Promise(resolve => {
        chrome.contextMenus.removeAll(() => {
          chrome.contextMenus.create({
            id: 'test-menu',
            title: 'Test',
            contexts: ['selection']
          }, () => resolve(true));
        });
      });
    });
    
    expect(contextMenus).toBe(true);
  });
});
```

### 6. AI APIs Test

Create `tests/e2e/ai-apis.test.js`:

```javascript
describe('AI APIs Integration', () => {
  let browser, page;

  beforeAll(async () => {
    ({ browser } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  test('should check API availability', async () => {
    page = await browser.newPage();
    await page.goto(await global.getExtensionPage('sidepanel/index.html'));
    
    const apiStatus = await page.evaluate(async () => {
      const apis = {};
      
      if ('LanguageModel' in window) {
        apis.prompt = await LanguageModel.availability();
      }
      if ('Summarizer' in window) {
        apis.summarizer = await Summarizer.availability();
      }
      if ('Translator' in window) {
        apis.translator = await Translator.availability();
      }
      
      return apis;
    });
    
    console.log('API Status:', apiStatus);
    expect(Object.keys(apiStatus).length).toBeGreaterThan(0);
  });
});
```

## Running Tests

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "jest --config jest.config.js",
    "test:e2e:watch": "jest --config jest.config.js --watch",
    "test:e2e:verbose": "jest --config jest.config.js --verbose"
  }
}
```

Run tests:

```bash
# Build extension first
npm run build

# Run all E2E tests
npm run test:e2e

# Run tests in watch mode
npm run test:e2e:watch

# Run with verbose output
npm run test:e2e:verbose
```

## Important Notes

- **Build First**: Always build the extension (`npm run build`) before running tests
- **Headless Mode**: Tests run in new headless mode (`--headless=new`) which supports extensions
- **Service Workers**: May not terminate automatically in test environment
- **Timeouts**: AI operations can be slow, adjust timeouts as needed
- **API Availability**: Tests may fail if Chrome AI APIs are not available on the test machine
- **Permissions**: Some tests require microphone permissions to be granted

## Troubleshooting

### Extension Not Loading
- Ensure `dist/` directory exists and contains built extension
- Check that `manifest.json` is present in `dist/`
- Verify extension ID is being captured correctly

### Tests Timing Out
- Increase `testTimeout` in `jest.config.js`
- Check if AI APIs are available on test machine
- Verify Chrome version supports the APIs (138+)

### Service Worker Issues
- Service workers may not terminate in test environment
- Use `browser.waitForTarget()` to access service worker
- Consider testing service worker functionality through extension pages

## Best Practices

1. **Avoid Internal State**: Test what users see, not internal implementation
2. **Use Page Evaluation**: Access extension APIs via `page.evaluate()`
3. **Mock When Possible**: Consider mocking AI responses for faster tests
4. **Test User Flows**: Focus on complete user journeys
5. **Handle Async**: Always await async operations properly
6. **Clean Up**: Close pages and browser in afterEach/afterAll hooks

## Additional Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Chrome Extensions Testing Guide](https://developer.chrome.com/docs/extensions/mv3/testing/)
- [Chrome Built-in AI APIs](https://developer.chrome.com/docs/ai/)
