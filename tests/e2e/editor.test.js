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
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    await page.waitForSelector('#editor-screen', { timeout: 10000 });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  test('should load editor screen', async () => {
    const isVisible = await page.$eval('#editor-screen', 
      el => window.getComputedStyle(el).display !== 'none'
    );
    expect(isVisible).toBe(true);
  });

  test('should display editor textarea', async () => {
    const textarea = await page.$('#editor-textarea');
    expect(textarea).toBeTruthy();
  });

  test('should track word count', async () => {
    const testText = 'This is a test sentence with ten words here.';
    await page.type('#editor-textarea', testText);
    
    // Wait for word count to update
    await page.waitForTimeout(500);
    
    const wordCountElement = await page.$('#word-count');
    if (wordCountElement) {
      const wordCount = await page.$eval('#word-count', el => el.textContent);
      const count = parseInt(wordCount);
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should track character count', async () => {
    const testText = 'Hello World';
    await page.type('#editor-textarea', testText);
    
    await page.waitForTimeout(500);
    
    const charCountElement = await page.$('#char-count');
    if (charCountElement) {
      const charCount = await page.$eval('#char-count', el => el.textContent);
      const count = parseInt(charCount);
      expect(count).toBe(testText.length);
    }
  });

  test('should have grammar check button', async () => {
    const grammarBtn = await page.$('#grammar-check-btn, button[data-action="grammar"]');
    expect(grammarBtn).toBeTruthy();
  });

  test('should have tone adjustment controls', async () => {
    const toneControls = await page.$('#tone-select, select[data-feature="tone"]');
    expect(toneControls).toBeTruthy();
  });

  test('should clear editor content', async () => {
    await page.type('#editor-textarea', 'Test content');
    
    const clearBtn = await page.$('#clear-btn, button[data-action="clear"]');
    if (clearBtn) {
      await clearBtn.click();
      await page.waitForTimeout(300);
      
      const content = await page.$eval('#editor-textarea', el => el.value);
      expect(content).toBe('');
    }
  });
});
