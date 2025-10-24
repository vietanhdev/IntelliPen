# Testing Summary

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests with visible browser |
| `npm run test:headless` | Run all tests in headless mode |
| `npm run test:ci` | Simulate CI environment locally |
| `npm run lint` | Check code style |

## Test Coverage

### Test Suites (7 total)
- ✅ **basic.test.js** - Browser and navigation (3 tests)
- ✅ **ai-apis.test.js** - Chrome AI APIs integration (9 tests)
- ✅ **editor.test.js** - Editor features (7 tests)
- ✅ **translator.test.js** - Translation features (9 tests)
- ✅ **meeting.test.js** - Meeting dashboard (10 tests)
- ✅ **popup.test.js** - Extension popup (8 tests)
- ✅ **service-worker.test.js** - Service worker (5 tests)

**Total: 51 tests, all passing ✅**

## CI/CD Status

[![Tests](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml/badge.svg)](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml)

### GitHub Actions Workflow

**File**: `.github/workflows/test.yml`

**Triggers**:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual workflow dispatch

**Jobs**:
1. **Test** - Runs on Node.js 18.x and 20.x
2. **Lint** - Code style checking
3. **Build** - Extension build verification

**Execution Time**: ~30-40 seconds in headless mode

## Test Features

### Automatic Dialog Handling
Tests automatically accept browser confirmation dialogs (e.g., "Unsaved changes will be lost").

### Headless Mode Support
- Uses Chrome's new headless mode (`headless: 'new'`)
- Supports Chrome extensions (unlike old headless)
- Faster execution, lower resource usage
- CI/CD friendly

### Resource Management
- Single browser instance per test suite
- Page reuse where possible
- Automatic cleanup after tests
- Prevents `ERR_BLOCKED_BY_CLIENT` errors

## Local Testing

### Before Pushing Code

```bash
# Simulate CI environment
npm run test:ci
```

This will:
1. Clean install dependencies (`npm ci`)
2. Install Chrome for Testing
3. Build the extension
4. Verify build output
5. Run linter
6. Run all tests in headless mode

### Debugging Test Failures

```bash
# Run with visible browser to see what's happening
npm test

# Run specific test file
npm test -- tests/e2e/editor.test.js

# Run with verbose output
npm run test:e2e:verbose
```

## Requirements

- **Node.js**: 16+ (tested on 18.x and 20.x)
- **Chrome for Testing**: 138+ (auto-installed via `npm run test:install-chrome`)
- **Disk Space**: ~500 MB for Chrome + extension
- **Memory**: ~2 GB recommended for running tests

## Known Issues

- Jest may show "did not exit one second after test run" warning - this is harmless
- Some AI APIs may show as "unavailable" in tests - this is expected without Gemini Nano model
- Tests require ~25-40 seconds to complete depending on system

## Documentation

- **[TESTING.md](../TESTING.md)** - Comprehensive testing guide
- **[CI_CD.md](CI_CD.md)** - CI/CD pipeline documentation
- **[tests/README.md](../tests/README.md)** - Quick test reference

## Contributing

When contributing:
1. ✅ Run `npm run test:ci` before pushing
2. ✅ Ensure all tests pass in headless mode
3. ✅ Add tests for new features
4. ✅ Update documentation as needed

See [PULL_REQUEST_TEMPLATE.md](PULL_REQUEST_TEMPLATE.md) for the full checklist.
