---
title: "Contributing"
linkTitle: "Contributing"
weight: 5
description: >
  How to contribute to IntelliPen development
---

Thank you for your interest in contributing to IntelliPen! This guide will help you get started.

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and considerate
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Respect differing viewpoints and experiences
- Accept responsibility and apologize for mistakes

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js 16+** installed
- **npm** package manager
- **Chrome 138+** for testing
- **Git** for version control
- Basic knowledge of JavaScript, Chrome Extensions, and AI APIs

### Finding Issues to Work On

1. Check [GitHub Issues](https://github.com/vietanhdev/IntelliPen/issues)
2. Look for issues labeled:
   - `good first issue`: Great for newcomers
   - `help wanted`: We need assistance
   - `bug`: Something isn't working
   - `enhancement`: New feature or improvement
3. Comment on the issue to express interest
4. Wait for maintainer approval before starting work

## Development Setup

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/IntelliPen.git
cd IntelliPen

# Add upstream remote
git remote add upstream https://github.com/vietanhdev/IntelliPen.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Install Chrome for Testing (for automated tests)

```bash
npm run test:install-chrome
```

### 4. Build the Extension

```bash
# Development build with source maps
npm run dev

# Or use watch mode for automatic rebuilds
npm run build:watch
```

### 5. Run Tests

```bash
# Run all tests with visible browser
npm test

# Run tests in headless mode (faster)
npm run test:headless
```

See the [Testing Guide](testing.md) for more details.

### 6. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

## Development Workflow

### 1. Create a Branch

```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create a feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Rebuild the extension
npm run build

# Run automated tests
npm test

# Or run in headless mode (faster)
npm run test:headless

# Run specific test suite
npm test -- tests/e2e/editor.test.js

# Reload extension in Chrome
# Go to chrome://extensions/ and click reload

# Test thoroughly:
# - Test the specific feature you changed
# - Test related features
# - Test edge cases
# - Check console for errors
```

!!! tip "Automated Testing"
    IntelliPen includes comprehensive end-to-end tests. See the [Testing Guide](testing.md) for detailed information about running and writing tests.

### 4. Commit Changes

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add feature: description of what you did"
```

**Commit Message Guidelines**:
- Use present tense ("Add feature" not "Added feature")
- Be descriptive but concise
- Reference issue numbers when applicable

### 5. Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then:
1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template
4. Submit the pull request

## Coding Standards

### JavaScript Style

```javascript
// Use ES6+ features
const myFunction = async (param) => {
  // Use const/let, not var
  const result = await someAsyncOperation();
  return result;
};

// Use descriptive names
const userInputText = document.getElementById('input').value;

// Add JSDoc comments for functions
/**
 * Checks grammar in the provided text
 * @param {string} text - Text to check
 * @returns {Promise<Array>} Array of corrections
 */
async function checkGrammar(text) {
  // Implementation
}
```

### Best Practices

1. **Error Handling**:
   ```javascript
   try {
     const result = await aiAPIManager.proofread(text);
     return result;
   } catch (error) {
     console.error('Proofread failed:', error);
     showErrorMessage('Grammar check unavailable');
     return null;
   }
   ```

2. **Input Validation**:
   ```javascript
   function validateInput(text) {
     if (!text || typeof text !== 'string') {
       throw new Error('Invalid input');
     }
     if (text.length > 5000) {
       throw new Error('Text too long');
     }
     return text.trim();
   }
   ```

## Submitting Changes

### Pull Request Process

1. **Run Tests**:
   ```bash
   # Ensure all tests pass
   npm run test:headless
   
   # Or test locally like CI does
   bash scripts/test-ci-locally.sh
   ```

2. **Update Documentation**:
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update relevant docs/ files
   - Add tests for new features

3. **Create Pull Request**:
   - Use descriptive title
   - Fill out PR template completely
   - Reference related issues
   - Add screenshots/videos if UI changes
   - Ensure CI tests pass

4. **Code Review**:
   - Respond to feedback promptly
   - Make requested changes
   - Push updates to same branch
   - Be open to suggestions

!!! note "Continuous Integration"
    All pull requests automatically run tests via GitHub Actions. Ensure tests pass before requesting review.

## Reporting Issues

### Before Reporting

1. Search existing issues
2. Check if it's already fixed in main branch
3. Verify it's reproducible
4. Gather relevant information

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Chrome Version: 138.x
- OS: Windows/Mac/Linux
- IntelliPen Version: 1.0.0

## Screenshots
(if applicable)

## Console Errors
(if any)
```

## Community

### Getting Help

- **GitHub Discussions**: Ask questions, share ideas
- **GitHub Issues**: Report bugs, request features
- **Code Review**: Learn from PR feedback

### Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
