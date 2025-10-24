# Pre-Test Checklist

Before running tests, ensure:

## ✅ Environment Setup

- [ ] Node.js 16+ installed (`node --version`)
- [ ] Dependencies installed (`npm install`)
- [ ] Chrome for Testing 138+ installed (`npm run test:install-chrome`)

## ✅ Build Status

- [ ] Extension builds successfully (`npm run build`)
- [ ] `dist/` directory exists and contains:
  - [ ] `manifest.json`
  - [ ] `background.js`
  - [ ] `popup/` directory
  - [ ] `sidepanel/` directory
  - [ ] `content-scripts/` directory

## ✅ Test Configuration

- [ ] `jest.config.js` present
- [ ] `tests/e2e/setup.js` present
- [ ] All test files in `tests/e2e/` directory

## ✅ System Requirements (Optional for Full AI Testing)

- [ ] 22 GB+ free disk space
- [ ] 4GB+ GPU VRAM
- [ ] Unmetered network connection
- [ ] Supported OS (Windows 10+, macOS 13+, Linux, ChromeOS)

## Quick Verification

```bash
# Check Node version
node --version  # Should be 16+

# Check if Chrome for Testing is installed
ls ~/.cache/puppeteer/chrome/  # Should show chrome versions

# Check if extension is built
ls dist/manifest.json  # Should exist

# Run a quick test
npm test -- tests/e2e/basic.test.js
```

## If Tests Fail

1. **Check build output:**
   ```bash
   npm run build
   ```

2. **Verify Chrome installation:**
   ```bash
   npm run test:install-chrome
   ```

3. **Run with verbose output:**
   ```bash
   npm run test:e2e:verbose
   ```

4. **Check specific test:**
   ```bash
   npm test -- tests/e2e/basic.test.js
   ```

## Expected Test Behavior

- ✅ Browser window opens (headed mode)
- ✅ Extension loads automatically
- ✅ Tests run sequentially
- ✅ Browser closes after tests complete
- ⚠️ "Service worker not found" warning is normal
- ⚠️ Some AI APIs may show as unavailable (system dependent)

## Ready to Test?

```bash
npm test
```

Good luck! 🚀
