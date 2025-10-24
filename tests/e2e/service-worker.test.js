describe('Service Worker', () => {
  let browser, extensionId;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
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
    const page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    
    const hasChromeAPI = await page.evaluate(() => {
      return typeof chrome !== 'undefined';
    });
    
    await page.close();
    expect(hasChromeAPI).toBe(true);
  });

  test('should have storage API available', async () => {
    const page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    
    const hasStorageAPI = await page.evaluate(() => {
      return typeof chrome.storage !== 'undefined';
    });
    
    await page.close();
    expect(hasStorageAPI).toBe(true);
  });

  test('should have runtime API available', async () => {
    const page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    
    const hasRuntimeAPI = await page.evaluate(() => {
      return typeof chrome.runtime !== 'undefined';
    });
    
    await page.close();
    expect(hasRuntimeAPI).toBe(true);
  });
});
