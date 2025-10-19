---
layout: default
title: Contributing
nav_order: 6
---

# Contributing to IntelliPen

Thank you for your interest in contributing to IntelliPen! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)

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

### 3. Build the Extension

```bash
# Development build with source maps
npm run dev

# Or use watch mode for automatic rebuilds
npm run build:watch
```

### 4. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder

### 5. Verify Setup

- Click the IntelliPen icon
- Check that APIs show availability status
- Test basic features (editor, translator, meeting)

## Project Structure

```
IntelliPen/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── content-scripts/           # Content scripts
│   ├── content-script.js      # API detection
│   └── quick-translate.js     # Quick translate overlay
├── popup/                     # Extension popup
│   ├── menu.html
│   ├── menu.js
│   └── menu.css
├── sidepanel/                 # Main application UI
│   ├── index.html
│   ├── index.js
│   └── index.css
├── src/                       # Core modules
│   ├── ai-apis/               # AI API management
│   ├── api-manager/           # API availability & sessions
│   ├── components/            # Reusable UI components
│   ├── editor/                # Editor AI features
│   ├── icons/                 # Icon library
│   ├── meeting/               # Meeting AI features
│   ├── privacy-manager/       # Privacy & encryption
│   └── writing-intelligence/  # Writing analysis
├── styles/                    # Shared CSS
├── images/                    # Extension icons
├── scripts/                   # Build scripts
├── docs/                      # Documentation
└── dist/                      # Build output (generated)
```

### Key Files to Know

- **AIAPIManager.js**: Central AI API management
- **EditorAIFeatures.js**: Editor functionality
- **MeetingAIFeatures.js**: Meeting features
- **ui-components.js**: Reusable UI components
- **icon-library.js**: SVG icon system

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

# Reload extension in Chrome
# Go to chrome://extensions/ and click reload

# Test thoroughly:
# - Test the specific feature you changed
# - Test related features
# - Test edge cases
# - Check console for errors
```

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
- Examples:
  - `Fix grammar check not working with long text (#123)`
  - `Add support for Portuguese translation`
  - `Improve meeting analysis performance`

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

### HTML/CSS Style

```html
<!-- Use semantic HTML -->
<section class="editor-container">
  <header class="editor-header">
    <h2>IntelliPen Editor</h2>
  </header>
  <main class="editor-content">
    <!-- Content -->
  </main>
</section>
```

```css
/* Use CSS variables for consistency */
:root {
  --primary-color: #667ba2;
  --secondary-color: #764ba2;
  --text-color: #333;
}

/* Use BEM naming convention */
.editor-container {
  /* Container styles */
}

.editor-container__header {
  /* Header styles */
}

.editor-container__header--active {
  /* Active state */
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

3. **Async/Await**:
   ```javascript
   // Prefer async/await over promises
   async function fetchData() {
     const data = await apiCall();
     return processData(data);
   }
   ```

4. **Modular Code**:
   ```javascript
   // Break down complex functions
   async function analyzeText(text) {
     const grammar = await checkGrammar(text);
     const style = await analyzeStyle(text);
     const tone = await detectTone(text);
     return { grammar, style, tone };
   }
   ```

## Testing

### Manual Testing

Before submitting a PR, test:

1. **Feature Functionality**:
   - Does your feature work as expected?
   - Test with various inputs
   - Test edge cases

2. **Integration**:
   - Does it work with existing features?
   - No conflicts with other components?
   - UI remains consistent?

3. **Performance**:
   - No significant slowdowns?
   - Memory usage reasonable?
   - Responsive UI?

4. **Browser Compatibility**:
   - Test in Chrome 138+
   - Check console for errors
   - Verify API availability

### Automated Testing

```bash
# Run tests (when available)
npm test

# Run linter
npm run lint
```

### Testing Checklist

- [ ] Feature works as intended
- [ ] No console errors
- [ ] UI is responsive
- [ ] Works with API unavailable (fallback)
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Code follows style guidelines

## Submitting Changes

### Pull Request Process

1. **Update Documentation**:
   - Update README.md if needed
   - Add/update JSDoc comments
   - Update relevant docs/ files

2. **Create Pull Request**:
   - Use descriptive title
   - Fill out PR template completely
   - Reference related issues
   - Add screenshots/videos if UI changes

3. **PR Template**:
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Performance improvement
   
   ## Testing
   - [ ] Tested manually
   - [ ] Added/updated tests
   - [ ] No console errors
   
   ## Screenshots
   (if applicable)
   
   ## Related Issues
   Fixes #123
   ```

4. **Code Review**:
   - Respond to feedback promptly
   - Make requested changes
   - Push updates to same branch
   - Be open to suggestions

5. **Merge**:
   - Maintainers will merge when approved
   - Delete your branch after merge

### What Makes a Good PR?

- **Focused**: One feature/fix per PR
- **Tested**: Thoroughly tested changes
- **Documented**: Clear description and comments
- **Clean**: No unrelated changes
- **Small**: Easier to review (when possible)

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

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `question`: Further information requested

## Development Tips

### Debugging

```javascript
// Use console.log for debugging
console.log('Debug:', variable);

// Use Chrome DevTools
// Right-click extension → Inspect
// Check Console, Network, Application tabs

// Debug service worker
// chrome://extensions/ → Service worker → Inspect
```

### Hot Reload

```bash
# Use watch mode for automatic rebuilds
npm run build:watch

# Reload extension in Chrome after changes
# chrome://extensions/ → Click reload icon
```

### Testing AI APIs

```javascript
// Check API availability
const status = await aiAPIManager.checkAvailability('Proofreader');
console.log('API Status:', status);

// Test with sample data
const result = await aiAPIManager.proofread('Test text here.');
console.log('Result:', result);
```

### Common Issues

**Extension not loading**:
- Check console for build errors
- Verify dist/ folder exists
- Ensure manifest.json is valid

**APIs not available**:
- Check Chrome version (138+)
- Verify system requirements
- Wait for model download

**Changes not reflecting**:
- Rebuild extension (npm run build)
- Reload extension in chrome://extensions/
- Hard refresh (Ctrl+Shift+R)

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

---

Thank you for contributing to IntelliPen! Your efforts help make AI-powered writing assistance accessible to everyone while respecting privacy.

Questions? Open a [GitHub Discussion](https://github.com/vietanhdev/IntelliPen/discussions).
