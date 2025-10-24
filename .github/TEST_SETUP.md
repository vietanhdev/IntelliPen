# Test Setup Quick Reference

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Chrome for Testing 138+
npm run test:install-chrome

# 3. Build extension
npm run build

# 4. Run tests
npm test
```

## Daily Development

```bash
# Build and test
npm test

# Watch mode for development
npm run build:watch  # Terminal 1
npm run test:e2e:watch  # Terminal 2
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm test` | Build and run all tests |
| `npm run test:e2e` | Run tests without rebuilding |
| `npm run test:e2e:verbose` | Run with detailed output |
| `npm run test:e2e:watch` | Watch mode for TDD |
| `npm run test:install-chrome` | Install Chrome 138+ |
| `npm run build` | Build extension once |
| `npm run build:watch` | Build on file changes |

## Test Files

- `basic.test.js` - Browser basics
- `ai-apis.test.js` - AI API availability
- `editor.test.js` - Editor features
- `meeting.test.js` - Meeting dashboard
- `popup.test.js` - Extension popup
- `service-worker.test.js` - Background service
- `translator.test.js` - Translation features

## Requirements

✅ Node.js 16+
✅ Chrome for Testing 138+
✅ Built extension in `dist/`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Extension not built" | `npm run build` |
| "Chrome 138+ not found" | `npm run test:install-chrome` |
| Tests timeout | Check build errors, increase timeout |
| Service worker warning | Expected, tests still work |

## CI/CD Integration

```yaml
- run: npm install
- run: npm run test:install-chrome
- run: npm test
```

See [TESTING.md](../../TESTING.md) for full documentation.
