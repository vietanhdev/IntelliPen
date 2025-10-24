# CI/CD Documentation

This document describes the continuous integration and deployment setup for IntelliPen.

## GitHub Actions Workflows

### Test Workflow (`.github/workflows/test.yml`)

Automatically runs on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual trigger via workflow_dispatch

#### Jobs

**1. Test Job**
- Runs on: Ubuntu Latest
- Node versions: 18.x, 20.x (matrix)
- Steps:
  1. Checkout code
  2. Setup Node.js with npm cache
  3. Install dependencies (`npm ci`)
  4. Install Chrome for Testing 138+
  5. Build extension
  6. Run tests in headless mode
  7. Upload test results (on failure)
  8. Upload extension build (on success)

**2. Lint Job**
- Runs on: Ubuntu Latest
- Node version: 20.x
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Run ESLint

**3. Build Job**
- Runs on: Ubuntu Latest
- Node version: 20.x
- Steps:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Build extension
  5. Verify build output
  6. Upload build artifact (30 days retention)

### Documentation Workflow (`.github/workflows/mkdocs.yml`)

Builds and deploys documentation to GitHub Pages.

## Environment Variables

The following environment variables are used in CI:

- `CI=true` - Indicates running in CI environment
- `HEADLESS=true` - Runs tests in headless mode (set by npm script)

## Artifacts

### Test Results
- **Name**: `test-results-{node-version}`
- **Retention**: 7 days
- **Contents**: Coverage reports, test results
- **Available**: Only on test failure

### Extension Build (from Test Job)
- **Name**: `extension-build-{node-version}`
- **Retention**: 7 days
- **Contents**: Built extension in `dist/` directory
- **Available**: Only on test success

### Extension Build (from Build Job)
- **Name**: `extension-build`
- **Retention**: 30 days
- **Contents**: Built extension in `dist/` directory
- **Available**: Always

## Running Tests Locally Like CI

To replicate the CI environment locally:

```bash
# Use npm ci instead of npm install (like CI)
npm ci

# Install Chrome for Testing
npm run test:install-chrome

# Build the extension
npm run build

# Run tests in headless mode
npm run test:headless
```

## Troubleshooting CI Failures

### Test Failures

1. **Check test logs**: Click on the failed job to see detailed logs
2. **Download artifacts**: Download test results artifact for detailed reports
3. **Reproduce locally**: Run `npm run test:headless` to reproduce
4. **Check Chrome version**: Ensure Chrome for Testing 138+ is installed

### Build Failures

1. **Check build logs**: Look for compilation errors
2. **Verify dependencies**: Ensure all dependencies are in package.json
3. **Test locally**: Run `npm run build` to reproduce
4. **Check file paths**: Ensure all imports use correct relative paths

### Lint Failures

1. **Run locally**: Execute `npm run lint` to see all issues
2. **Auto-fix**: Run `npm run lint -- --fix` to auto-fix issues
3. **Check rules**: Review `.eslintrc` configuration

## Manual Workflow Triggers

### Via GitHub UI

1. Go to repository → Actions tab
2. Select "Tests" workflow
3. Click "Run workflow" button
4. Select branch
5. Click "Run workflow"

### Via GitHub CLI

```bash
# Trigger test workflow
gh workflow run test.yml

# Trigger on specific branch
gh workflow run test.yml --ref develop
```

## Status Badges

Add these badges to your README:

```markdown
[![Tests](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml/badge.svg)](https://github.com/vietanhdev/IntelliPen/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

## Best Practices

1. **Always run tests locally** before pushing
2. **Use `npm ci`** in CI for reproducible builds
3. **Keep dependencies updated** to avoid security issues
4. **Monitor test execution time** and optimize slow tests
5. **Review failed test artifacts** for debugging
6. **Use headless mode** in CI for faster execution
7. **Cache npm dependencies** to speed up workflows

## Future Enhancements

Potential improvements for the CI/CD pipeline:

- [ ] Add code coverage reporting
- [ ] Integrate with code quality tools (SonarQube, CodeClimate)
- [ ] Add performance benchmarking
- [ ] Implement automatic releases on tag push
- [ ] Add browser compatibility testing (multiple Chrome versions)
- [ ] Implement staging environment deployment
- [ ] Add security scanning (npm audit, Snyk)
- [ ] Create release notes automation
- [ ] Add visual regression testing
- [ ] Implement automatic version bumping

## Support

For CI/CD issues:
1. Check workflow logs in GitHub Actions
2. Review this documentation
3. Check [TESTING.md](../TESTING.md) for test setup
4. Open an issue with CI logs attached
