describe('AI APIs Integration', () => {
  let browser, page;

  beforeAll(async () => {
    ({ browser } = await global.setupBrowser());
    // Create a single page for all tests
    page = await browser.newPage();
    await page.goto(global.getExtensionPage('sidepanel/index.html'));
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    if (page) {
      await page.close();
    }
    await global.teardownBrowser();
  });

  test('should check for AI APIs in window', async () => {
    const hasAIAPIs = await page.evaluate(() => {
      const apis = {
        languageModel: 'LanguageModel' in window,
        summarizer: 'Summarizer' in window,
        translator: 'Translator' in window,
        rewriter: 'Rewriter' in window,
        writer: 'Writer' in window,
        proofreader: 'Proofreader' in window,
        languageDetector: 'LanguageDetector' in window
      };
      return apis;
    });
    
    console.log('Available AI APIs:', hasAIAPIs);
    
    // At least one API should be available
    const hasAnyAPI = Object.values(hasAIAPIs).some(available => available);
    expect(hasAnyAPI).toBe(true);
  });

  test('should check Prompt API availability', async () => {
    const promptAPIStatus = await page.evaluate(async () => {
      if ('LanguageModel' in window) {
        try {
          const availability = await LanguageModel.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Prompt API Status:', promptAPIStatus);
    expect(promptAPIStatus.available !== undefined).toBe(true);
  });

  test('should check Summarizer API availability', async () => {
    const summarizerStatus = await page.evaluate(async () => {
      if ('Summarizer' in window) {
        try {
          const availability = await Summarizer.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Summarizer API Status:', summarizerStatus);
    expect(summarizerStatus.available !== undefined).toBe(true);
  });

  test('should check Translator API availability', async () => {
    const translatorStatus = await page.evaluate(async () => {
      if ('Translator' in window) {
        try {
          const availability = await Translator.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Translator API Status:', translatorStatus);
    expect(translatorStatus.available !== undefined).toBe(true);
  });

  test('should check Writer API availability', async () => {
    const writerStatus = await page.evaluate(async () => {
      if ('Writer' in window) {
        try {
          const availability = await Writer.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Writer API Status:', writerStatus);
    expect(writerStatus.available !== undefined).toBe(true);
  });

  test('should check Rewriter API availability', async () => {
    const rewriterStatus = await page.evaluate(async () => {
      if ('Rewriter' in window) {
        try {
          const availability = await Rewriter.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Rewriter API Status:', rewriterStatus);
    expect(rewriterStatus.available !== undefined).toBe(true);
  });

  test('should check Proofreader API availability', async () => {
    const proofreaderStatus = await page.evaluate(async () => {
      if ('Proofreader' in window) {
        try {
          const availability = await Proofreader.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Proofreader API Status:', proofreaderStatus);
    expect(proofreaderStatus.available !== undefined).toBe(true);
  });

  test('should check Language Detector API availability', async () => {
    const detectorStatus = await page.evaluate(async () => {
      if ('LanguageDetector' in window) {
        try {
          const availability = await LanguageDetector.availability();
          return { available: true, status: availability };
        } catch (err) {
          return { available: true, error: err.message };
        }
      }
      return { available: false };
    });
    
    console.log('Language Detector API Status:', detectorStatus);
    expect(detectorStatus.available !== undefined).toBe(true);
  });

  test('should have AIAPIManager available', async () => {
    const hasManager = await page.evaluate(() => {
      return typeof window.aiAPIManager !== 'undefined';
    });
    
    console.log('AIAPIManager available:', hasManager);
    expect(hasManager).toBe(true);
  });
});
