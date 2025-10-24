describe('Basic Browser Test', () => {
  let browser, page;

  beforeAll(async () => {
    ({ browser } = await global.setupBrowser());
  });

  afterAll(async () => {
    await global.teardownBrowser();
  });

  test('should launch browser', async () => {
    expect(browser).toBeTruthy();
  });

  test('should create a new page', async () => {
    page = await browser.newPage();
    expect(page).toBeTruthy();
    await page.close();
  });

  test('should navigate to a URL', async () => {
    page = await browser.newPage();
    await page.goto('about:blank');
    expect(page).toBeTruthy();
    await page.close();
  });
});
