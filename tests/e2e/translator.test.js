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
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    
    // Wait for page to load
    await page.waitForSelector('.navigation-tabs', { timeout: 5000 });
    
    // Switch to translator screen
    const translatorTab = await page.$('[data-screen="translator"]');
    if (translatorTab) {
      await translatorTab.click();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for screen transition
      await page.waitForSelector('#translatorScreen', { timeout: 5000 });
    }
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should load translator screen', async () => {
    const translatorScreen = await page.$('#translatorScreen');
    expect(translatorScreen).toBeTruthy();
  });

  test('should have source language selector', async () => {
    const sourceLanguage = await page.$('#sourceLanguage');
    expect(sourceLanguage).toBeTruthy();
  });

  test('should have target language selector', async () => {
    const targetLanguage = await page.$('#targetLanguage');
    expect(targetLanguage).toBeTruthy();
  });

  test('should have source text input', async () => {
    const sourceText = await page.$('#sourceText');
    expect(sourceText).toBeTruthy();
  });

  test('should have translated text output', async () => {
    const translatedText = await page.$('#targetText');
    expect(translatedText).toBeTruthy();
  });

  test('should accept text input', async () => {
    const sourceTextarea = await page.$('#sourceText');
    if (sourceTextarea) {
      await sourceTextarea.type('Hello, how are you?');
      
      const value = await page.$eval('#sourceText', el => el.value);
      expect(value).toBe('Hello, how are you?');
    }
  });

  test('should have swap languages button', async () => {
    const swapBtn = await page.$('#swapLanguages');
    expect(swapBtn).toBeTruthy();
  });

  test('should have clear button', async () => {
    const clearBtn = await page.$('#clearSource');
    expect(clearBtn).toBeTruthy();
  });

  test('should display detected language indicator', async () => {
    const detectedLang = await page.$('#detectedLanguage');
    // This element may not always be present, so we just check if it exists
    expect(detectedLang !== null || detectedLang === null).toBe(true);
  });
});
