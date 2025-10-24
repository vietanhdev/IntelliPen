describe('Service Worker', () => {
  let browser, extensionId, page;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
    // Create a single page for all tests
    page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
  });

  afterAll(async () => {
    if (page) {
      await page.close();
    }
    await global.teardownBrowser();
  });

  test('should have extension loaded', async () => {
    expect(extensionId).toBeTruthy();
  });

  test('should find service worker or extension target', async () => {
    const targets = await browser.targets();
    const extensionTargets = targets.filter(
      target => target.type() === 'service_worker' || 
                target.url().includes('chrome-extension://')
    );
    
    expect(extensionTargets.length).toBeGreaterThan(0);
  });

  test('should have chrome APIs available via extension page', async () => {
    const hasChromeAPI = await page.evaluate(() => {
      return typeof chrome !== 'undefined';
    });
    
    expect(hasChromeAPI).toBe(true);
  });

  test('should have storage API available', async () => {
    const hasStorageAPI = await page.evaluate(() => {
      return typeof chrome.storage !== 'undefined';
    });
    
    expect(hasStorageAPI).toBe(true);
  });

  test('should have runtime API available', async () => {
    const hasRuntimeAPI = await page.evaluate(() => {
      return typeof chrome.runtime !== 'undefined';
    });
    
    expect(hasRuntimeAPI).toBe(true);
  });
});
