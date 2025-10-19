---
layout: default
title: Quick Reference
nav_order: 9
---

# Quick Reference

Quick reference for developers working with IntelliPen.

## Build Commands

```bash
# Install dependencies
npm install

# Development build with source maps
npm run dev

# Production build with minification
npm run build

# Watch mode for development
npm run build:watch

# Clean build directory
npm run clean

# Generate icons from SVG
npm run generate-icons

# Run linter
npm run lint

# Run tests
npm test
```

## Project Structure

```
IntelliPen/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── content-scripts/           # Content scripts
├── popup/                     # Extension popup
├── sidepanel/                 # Main application UI
├── src/                       # Core modules
│   ├── ai-apis/               # AI API management
│   ├── components/            # UI components
│   ├── editor/                # Editor features
│   ├── icons/                 # Icon library
│   └── meeting/               # Meeting features
├── styles/                    # Shared CSS
├── images/                    # Extension icons
└── dist/                      # Build output
```

## Chrome AI APIs

### Check Availability

```javascript
const status = await aiAPIManager.checkAvailability('Proofreader');
// Returns: 'available', 'downloading', or 'unavailable'
```

### Grammar Checking

```javascript
const corrections = await aiAPIManager.proofread(text);
corrections.forEach(c => {
  console.log(`${c.original} → ${c.suggestion}`);
});
```

### Writing Improvement

```javascript
const improved = await aiAPIManager.write(
  'Improve this: ' + text,
  { tone: 'professional', length: 'medium' }
);
```

### Tone Adjustment

```javascript
const formal = await aiAPIManager.rewrite(text, {
  tone: 'more-formal',
  length: 'as-is'
});
```

### Translation

```javascript
const translated = await aiAPIManager.translate(
  text,
  'en',  // source language
  'es'   // target language
);
```

### Language Detection

```javascript
const result = await aiAPIManager.detectLanguage(text);
console.log(result.detectedLanguage, result.confidence);
```

### Summarization

```javascript
const summary = await aiAPIManager.summarize(text, {
  type: 'key-points',
  length: 'medium'
});
```

### Streaming

```javascript
await aiAPIManager.writeStreaming(
  prompt,
  { tone: 'professional' },
  (chunk) => {
    console.log('Received:', chunk);
    updateUI(chunk);
  }
);
```

## UI Components

### Button

```javascript
import { createButton } from './src/components/ui-components.js';

const btn = createButton('Click Me', 'primary', () => {
  console.log('Clicked!');
});
document.body.appendChild(btn);
```

### Badge

```javascript
import { createBadge } from './src/components/ui-components.js';

const badge = createBadge('Available', 'success');
// Types: success, warning, error, info
```

### Toast Notification

```javascript
import { showToast } from './src/components/ui-components.js';

showToast('Operation successful!', 'success', 3000);
// Types: success, error, info, warning
```

### Loading Spinner

```javascript
import { createLoadingSpinner } from './src/components/ui-components.js';

const spinner = createLoadingSpinner('Loading...');
container.appendChild(spinner);
```

## Icons

### Get Icon

```javascript
import { getIcon } from './src/icons/icon-library.js';

const penIcon = getIcon('pen', {
  size: 24,
  gradient: true,
  animation: 'pulse'
});
```

### Available Icons

```
pen, sparkle, grammar, rewrite, translate, 
microphone, speaker, save, download, upload,
settings, help, close, check, arrow-left,
arrow-right, menu, search, plus, minus
```

### Icon Options

```javascript
{
  size: 24,              // Icon size in pixels
  gradient: true,        // Use gradient colors
  animation: 'pulse',    // Animation: pulse, spin, none
  color: '#667ba2'       // Custom color (overrides gradient)
}
```

## Message Passing

### Send Message to Background

```javascript
chrome.runtime.sendMessage({
  type: 'CHECK_API_AVAILABILITY',
  data: { apiName: 'Proofreader' }
}, (response) => {
  console.log('Response:', response);
});
```

### Listen for Messages

```javascript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'TRANSLATE_TEXT') {
    translateText(message.data.text).then(result => {
      sendResponse({ success: true, result });
    });
    return true; // Keep channel open for async response
  }
});
```

## Storage

### Save Data

```javascript
await chrome.storage.local.set({
  sourceLanguage: 'en',
  targetLanguage: 'es',
  editorContent: text
});
```

### Load Data

```javascript
const data = await chrome.storage.local.get([
  'sourceLanguage',
  'targetLanguage',
  'editorContent'
]);
console.log(data.sourceLanguage);
```

### Clear Data

```javascript
await chrome.storage.local.clear();
```

## Context Menus

### Create Context Menu

```javascript
chrome.contextMenus.create({
  id: 'translate',
  title: 'Translate with IntelliPen',
  contexts: ['selection']
});
```

### Handle Context Menu Click

```javascript
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate') {
    const selectedText = info.selectionText;
    // Handle translation
  }
});
```

## Side Panel

### Open Side Panel

```javascript
chrome.sidePanel.open({ windowId: windowId });
```

### Set Side Panel Options

```javascript
chrome.sidePanel.setOptions({
  path: 'sidepanel/index.html',
  enabled: true
});
```

## Error Handling

### Try-Catch Pattern

```javascript
try {
  const result = await aiAPIManager.proofread(text);
  return result;
} catch (error) {
  console.error('Proofread failed:', error);
  
  if (error.name === 'NotAvailableError') {
    showToast('API not available', 'error');
  } else if (error.name === 'QuotaExceededError') {
    showToast('Rate limit exceeded', 'warning');
  } else {
    showToast('An error occurred', 'error');
  }
  
  return null;
}
```

### Retry with Backoff

```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}

const result = await withRetry(() => 
  aiAPIManager.translate(text, 'en', 'es')
);
```

## Debugging

### Console Logging

```javascript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}
```

### Chrome DevTools

```javascript
// Inspect service worker
// chrome://extensions/ → Service worker → Inspect

// Inspect sidepanel
// Right-click sidepanel → Inspect

// View storage
// DevTools → Application → Storage → chrome.storage.local
```

### Network Monitoring

```javascript
// Monitor API calls (should be none!)
// DevTools → Network tab
// Use IntelliPen features
// Verify no external requests
```

## Testing

### Manual Testing Checklist

```
□ Grammar check works
□ Translation works
□ Meeting recording works
□ Context menu works
□ Auto-save works
□ Export works
□ No console errors
□ APIs show correct status
□ UI is responsive
□ Privacy indicators show
```

### Test with Different Inputs

```javascript
// Test edge cases
const testCases = [
  '',                    // Empty string
  'a',                   // Single character
  'A'.repeat(5000),      // Max length
  'Hello\nWorld',        // Newlines
  '🎉 Emoji test',       // Emoji
  '<script>alert(1)</script>' // XSS attempt
];

for (const test of testCases) {
  try {
    const result = await aiAPIManager.proofread(test);
    console.log('✓ Passed:', test.substring(0, 20));
  } catch (error) {
    console.error('✗ Failed:', test.substring(0, 20), error);
  }
}
```

## Performance Tips

### Debounce User Input

```javascript
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

const debouncedTranslate = debounce(async (text) => {
  const result = await aiAPIManager.translate(text, 'en', 'es');
  updateUI(result);
}, 500);
```

### Cache API Sessions

```javascript
const sessionCache = new Map();

async function getSession(apiName, options) {
  const key = `${apiName}-${JSON.stringify(options)}`;
  
  if (!sessionCache.has(key)) {
    const session = await createSession(apiName, options);
    sessionCache.set(key, session);
  }
  
  return sessionCache.get(key);
}
```

### Use Streaming for Long Content

```javascript
// Better UX with progressive rendering
await aiAPIManager.writeStreaming(
  longPrompt,
  { length: 'long' },
  (chunk) => {
    appendToEditor(chunk); // Update UI progressively
  }
);
```

## Common Patterns

### Check API Before Use

```javascript
async function safeProofread(text) {
  const status = await aiAPIManager.checkAvailability('Proofreader');
  
  if (status !== 'available') {
    showToast('Grammar check not available', 'warning');
    return null;
  }
  
  return await aiAPIManager.proofread(text);
}
```

### Validate Input

```javascript
function validateText(text, maxLength = 5000) {
  if (!text || typeof text !== 'string') {
    throw new Error('Invalid text input');
  }
  
  if (text.length > maxLength) {
    throw new Error(`Text too long (max ${maxLength} characters)`);
  }
  
  return text.trim();
}
```

### Show Loading State

```javascript
async function translateWithLoading(text) {
  const spinner = createLoadingSpinner('Translating...');
  container.appendChild(spinner);
  
  try {
    const result = await aiAPIManager.translate(text, 'en', 'es');
    return result;
  } finally {
    spinner.remove();
  }
}
```

## Keyboard Shortcuts

### Register Shortcuts

```javascript
// In manifest.json
{
  "commands": {
    "open-sidepanel": {
      "suggested_key": {
        "default": "Alt+I"
      },
      "description": "Open IntelliPen sidepanel"
    }
  }
}
```

### Handle Shortcuts

```javascript
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-sidepanel') {
    chrome.sidePanel.open();
  }
});
```

## CSS Variables

```css
:root {
  /* Colors */
  --primary-color: #667ba2;
  --secondary-color: #764ba2;
  --text-color: #333;
  --bg-color: #fff;
  --border-color: #ddd;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-sm: 12px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  
  /* Borders */
  --border-radius: 8px;
  --border-width: 1px;
}
```

## Useful Links

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Chrome AI APIs](https://developer.chrome.com/docs/ai/)
- [Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)

---

For complete documentation, visit [https://vietanhdev.github.io/IntelliPen/](https://vietanhdev.github.io/IntelliPen/)
