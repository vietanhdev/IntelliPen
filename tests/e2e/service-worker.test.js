describe('Service Worker', () => {
  let browser, extensionId;

  beforeAll(async () => {
    ({ browser, extensionId } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  test('should have service worker running', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker',
      { timeout: 10000 }
    );
    
    expect(workerTarget).toBeTruthy();
  });

  test('should access service worker', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    
    const worker = await workerTarget.worker();
    expect(worker).toBeTruthy();
  });

  test('should have chrome APIs available in service worker', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const hasChromeAPI = await worker.evaluate(() => {
      return typeof chrome !== 'undefined';
    });
    
    expect(hasChromeAPI).toBe(true);
  });

  test('should have storage API available', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const hasStorageAPI = await worker.evaluate(() => {
      return typeof chrome.storage !== 'undefined';
    });
    
    expect(hasStorageAPI).toBe(true);
  });

  test('should have runtime API available', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const hasRuntimeAPI = await worker.evaluate(() => {
      return typeof chrome.runtime !== 'undefined';
    });
    
    expect(hasRuntimeAPI).toBe(true);
  });

  test('should be able to create context menus', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const canCreateContextMenu = await worker.evaluate(() => {
      return new Promise(resolve => {
        try {
          chrome.contextMenus.removeAll(() => {
            chrome.contextMenus.create({
              id: 'test-menu-item',
              title: 'Test Menu',
              contexts: ['selection']
            }, () => {
              if (chrome.runtime.lastError) {
                resolve(false);
              } else {
                resolve(true);
              }
            });
          });
        } catch (err) {
          resolve(false);
        }
      });
    });
    
    expect(canCreateContextMenu).toBe(true);
  });

  test('should handle message passing', async () => {
    const workerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker();
    
    const canHandleMessages = await worker.evaluate(() => {
      return typeof chrome.runtime.onMessage !== 'undefined';
    });
    
    expect(canHandleMessages).toBe(true);
  });
});
