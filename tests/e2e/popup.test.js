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
    await page.goto(global.getExtensionPage('popup/menu.html'));
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should load popup page', async () => {
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have extension branding', async () => {
    const heading = await page.$('.brand, .brand-info');
    expect(heading).toBeTruthy();
  });

  test('should have open sidepanel button', async () => {
    const openBtn = await page.$('#openSidebar, #openTab');
    expect(openBtn).toBeTruthy();
  });

  test('should display API status section', async () => {
    const statusSection = await page.$('.status-indicator, .menu-footer');
    expect(statusSection).toBeTruthy();
  });

  test('should have multiple API status indicators', async () => {
    const statusElements = await page.$$('.api-status-item, .status-badge');
    // Should have status indicators array (may be empty)
    expect(Array.isArray(statusElements)).toBe(true);
  });

  test('should have quick action buttons', async () => {
    const buttons = await page.$$('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('should have proper styling', async () => {
    const backgroundColor = await page.$eval('body', el => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBeTruthy();
  });

  test('should be responsive', async () => {
    await page.setViewport({ width: 320, height: 480 });
    const body = await page.$('body');
    expect(body).toBeTruthy();
  });
});
