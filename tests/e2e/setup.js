const puppeteer = require('puppeteer-core');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

let browser;
let extensionId;
let chromePath;

// Generate extension ID from path (Chrome's algorithm)
function generateExtensionId(extensionPath) {
  const absolutePath = path.resolve(extensionPath);
  const hash = crypto.createHash('sha256').update(absolutePath).digest();
  
  // Convert to base32-like encoding (a-p)
  let id = '';
  for (let i = 0; i < 16; i++) {
    id += String.fromCharCode(97 + (hash[i] % 16));
  }
  return id;
}

// Get Chrome for Testing path
function getChromePath() {
  // Check project chrome directory first (installed by our script)
  const projectChromeDir = path.join(__dirname, '../../chrome');
  if (fs.existsSync(projectChromeDir)) {
    const entries = fs.readdirSync(projectChromeDir).filter(v => {
      // Filter out .metadata and other non-version directories
      if (v.startsWith('.')) return false;
      // Extract version number from formats like "linux-141.0.7390.122" or "141.0.7390.122"
      const versionMatch = v.match(/(\d+)\.\d+\.\d+\.\d+/);
      if (!versionMatch) return false;
      const majorVersion = parseInt(versionMatch[1]);
      return !isNaN(majorVersion) && majorVersion >= 138;
    }).sort().reverse();
    
    if (entries.length > 0) {
      const platform = process.platform === 'darwin' ? 'mac-arm64' : 
                      process.platform === 'win32' ? 'win64' : 'linux64';
      const chromeDir = path.join(projectChromeDir, entries[0], `chrome-${platform}`);
      
      if (process.platform === 'darwin') {
        const chromePath = path.join(chromeDir, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
        if (fs.existsSync(chromePath)) return chromePath;
      } else if (process.platform === 'win32') {
        const chromePath = path.join(chromeDir, 'chrome.exe');
        if (fs.existsSync(chromePath)) return chromePath;
      } else {
        const chromePath = path.join(chromeDir, 'chrome');
        if (fs.existsSync(chromePath)) return chromePath;
      }
    }
  }
  
  // Try home cache directory
  const homeDir = require('os').homedir();
  const cacheDir = path.join(homeDir, '.cache', 'puppeteer', 'chrome');
  
  if (fs.existsSync(cacheDir)) {
    const versions = fs.readdirSync(cacheDir).filter(v => {
      const versionNum = parseInt(v.split('-')[1]);
      return !isNaN(versionNum) && versionNum >= 138;
    }).sort().reverse();
    
    if (versions.length > 0) {
      const platform = process.platform === 'darwin' ? 'mac' : 
                      process.platform === 'win32' ? 'win64' : 'linux';
      const chromeDir = path.join(cacheDir, versions[0], platform);
      
      if (process.platform === 'darwin') {
        return path.join(chromeDir, 'Google Chrome for Testing.app', 'Contents', 'MacOS', 'Google Chrome for Testing');
      } else if (process.platform === 'win32') {
        return path.join(chromeDir, 'chrome.exe');
      } else {
        return path.join(chromeDir, 'chrome');
      }
    }
  }
  
  // Fallback to system Chrome (may not support AI APIs)
  console.warn('Chrome for Testing 138+ not found. Tests may fail. Install with: npx @puppeteer/browsers install chrome@stable');
  return null;
}

global.setupBrowser = async () => {
  const extensionPath = path.join(__dirname, '../../dist');
  
  // Check if extension is built
  if (!fs.existsSync(extensionPath)) {
    throw new Error('Extension not built. Run "npm run build" first.');
  }
  
  chromePath = getChromePath();
  
  const launchOptions = {
    headless: false, // Extensions require headed mode
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled',
      '--enable-features=Vulkan',
      '--disable-extensions-file-access-check',
      '--disable-features=IsolateOrigins,site-per-process',
      '--allow-insecure-localhost',
      '--ignore-certificate-errors'
    ],
    dumpio: false // Set to true for debugging Chrome output
  };
  
  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }
  
  browser = await puppeteer.launch(launchOptions);

  // Wait for extension to load and get extension ID
  // Use waitForTarget to wait for service worker
  try {
    const serviceWorkerTarget = await browser.waitForTarget(
      target => target.type() === 'service_worker',
      { timeout: 10000 }
    );
    
    const url = serviceWorkerTarget.url();
    extensionId = url.split('/')[2];
    console.log('Extension ID (from service worker):', extensionId);
  } catch (error) {
    console.warn('Service worker not found, trying alternative method...');
    
    // Fallback: try to find any extension target
    await new Promise(resolve => setTimeout(resolve, 3000));
    let targets = await browser.targets();
    
    console.log('Available targets:', targets.map(t => ({ type: t.type(), url: t.url() })));
    
    // Look for any chrome-extension:// URL
    for (const target of targets) {
      const url = target.url();
      if (url.startsWith('chrome-extension://')) {
        extensionId = url.split('/')[2];
        console.log('Extension ID (from target):', extensionId);
        break;
      }
    }
    
    // Last resort: manually construct extension ID from manifest
    // This is a workaround for when Chrome doesn't expose the extension properly
    if (!extensionId) {
      console.warn('Could not auto-detect extension ID. Attempting manual detection...');
      
      // Try opening a page and checking for extension resources
      const page = await browser.newPage();
      
      // Enable CDP session for more control
      const client = await page.target().createCDPSession();
      
      try {
        // Try to get extension info via CDP
        await new Promise(resolve => setTimeout(resolve, 2000));
        targets = await browser.targets();
        console.log('Targets after wait:', targets.map(t => ({ type: t.type(), url: t.url() })));
        
        for (const target of targets) {
          const url = target.url();
          if (url.startsWith('chrome-extension://')) {
            extensionId = url.split('/')[2];
            console.log('Extension ID (delayed detection):', extensionId);
            break;
          }
        }
      } catch (cdpError) {
        console.error('CDP error:', cdpError.message);
      }
      
      await page.close();
    }
  }
  
  if (!extensionId) {
    console.warn('Could not auto-detect extension ID. Using generated ID as fallback...');
    extensionId = generateExtensionId(extensionPath);
    console.log('Generated extension ID:', extensionId);
    
    // Verify the extension is accessible
    try {
      const testPage = await browser.newPage();
      const testUrl = `chrome-extension://${extensionId}/manifest.json`;
      console.log('Testing extension URL:', testUrl);
      
      const response = await testPage.goto(testUrl, { waitUntil: 'networkidle0', timeout: 5000 });
      if (response && response.ok()) {
        console.log('Extension is accessible with generated ID');
      } else {
        console.warn('Extension may not be accessible. Tests may fail.');
      }
      await testPage.close();
    } catch (testError) {
      console.error('Extension verification failed:', testError.message);
      console.error('This likely means the extension did not load properly.');
      console.error('Possible causes:');
      console.error('1. Extension failed to load');
      console.error('2. Chrome version incompatibility');
      console.error('3. Missing extension files in dist/');
      console.error('4. Manifest.json errors');
      // Don't throw - let tests try to run and fail with better error messages
    }
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
