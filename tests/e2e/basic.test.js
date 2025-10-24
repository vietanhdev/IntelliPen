describe('Basic Browser Test', () => {
  let browser, page;

  beforeAll(async () => {
    const puppeteer = require('puppeteer');
    const path = require('path');
    
    const extensionPath = path.join(__dirname, '../../dist');
    
    browser = await puppeteer.launch({
      headless: false, // Run in headed mode for extension support
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
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
    await page.goto('https://www.google.com');
    const title = await page.title();
    expect(title).toBeTruthy();
    await page.close();
  });
});
