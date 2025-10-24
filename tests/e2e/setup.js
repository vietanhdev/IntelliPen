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
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
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
    console.log('Extension ID:', extensionId);
  } else {
    console.warn('Service worker not found. Extension may not have loaded.');
  }

  return { browser, extensionId };
};

global.teardownBrowser = async () => {
  if (browser) {
    await browser.close();
  }
};

global.getExtensionPage = (page) => {
  if (!extensionId) {
    throw new Error('Extension ID not found. Browser may not be set up correctly.');
  }
  return `chrome-extension://${extensionId}/${page}`;
};
