---
layout: default
title: Architecture
nav_order: 4
---

# IntelliPen Architecture

Technical architecture and design decisions for IntelliPen.

## Table of Contents

- [Overview](#overview)
- [Extension Architecture](#extension-architecture)
- [Core Components](#core-components)
- [Data Flow](#data-flow)
- [Chrome AI APIs Integration](#chrome-ai-apis-integration)
- [Build System](#build-system)
- [Security and Privacy](#security-and-privacy)

## Overview

IntelliPen is a Chrome Extension built on Manifest V3 that leverages Chrome's built-in AI APIs (Gemini Nano) for local AI processing. The architecture prioritizes privacy, performance, and user experience.

### Design Principles

1. **Privacy-First**: All AI processing happens locally on the user's device
2. **Modular Design**: Reusable components and clear separation of concerns
3. **Progressive Enhancement**: Graceful degradation when APIs are unavailable
4. **Performance**: Efficient resource usage and streaming support
5. **User Experience**: Intuitive interface with real-time feedback

## Extension Architecture

### Manifest V3 Structure

IntelliPen follows Chrome Extension Manifest V3 standards:

```
IntelliPen/
├── manifest.json              # Extension configuration
├── background.js              # Service worker (background script)
├── content-scripts/           # Scripts injected into web pages
├── popup/                     # Extension popup UI
├── sidepanel/                 # Main application UI
├── src/                       # Core modules and features
├── styles/                    # Shared CSS
├── images/                    # Extension icons
└── dist/                      # Build output
```

### Key Architectural Components

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Browser                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │   Popup UI   │    │  Sidepanel   │   │  Content   │ │
│  │   (menu)     │    │  (main app)  │   │  Scripts   │ │
│  └──────┬───────┘    └──────┬───────┘   └─────┬──────┘ │
│         │                   │                  │         │
│         └───────────────────┼──────────────────┘         │
│                             │                            │
│                    ┌────────▼────────┐                   │
│                    │  Service Worker │                   │
│                    │  (background.js)│                   │
│                    └────────┬────────┘                   │
│                             │                            │
│         ┌───────────────────┼───────────────────┐       │
│         │                   │                   │        │
│  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼─────┐ │
│  │ AIAPIManager│   │  Chrome Storage │  │  Context   │ │
│  │             │   │                 │  │   Menus    │ │
│  └──────┬──────┘   └─────────────────┘  └────────────┘ │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Chrome Built-in AI APIs                  │   │
│  │  (Gemini Nano - Local Processing)               │   │
│  │                                                   │   │
│  │  • Prompt API      • Proofreader API            │   │
│  │  • Writer API      • Rewriter API               │   │
│  │  • Summarizer API  • Translator API             │   │
│  │  • Language Detector API                        │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Service Worker (background.js)

The service worker manages extension lifecycle and coordinates between components.

**Responsibilities**:
- Extension installation and updates
- Context menu creation and handling
- Message routing between components
- API availability monitoring
- Sidepanel management

**Key Features**:
```javascript
// Context menu integration
chrome.contextMenus.create({
  id: 'translate',
  title: 'Translate with IntelliPen',
  contexts: ['selection']
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Route messages between components
});

// Sidepanel management
chrome.sidePanel.setOptions({
  path: 'sidepanel/index.html',
  enabled: true
});
```

### 2. AIAPIManager

Centralized management for all Chrome built-in AI APIs.

**Location**: `src/ai-apis/AIAPIManager.js`

**Responsibilities**:
- API availability checking
- Session creation and management
- Streaming support
- Error handling and recovery
- Fallback mechanisms

**Architecture**:
```javascript
class AIAPIManager {
  constructor() {
    this.sessions = new Map();
    this.availability = new Map();
  }

  // Check API availability
  async checkAvailability(apiName) {
    // Returns: 'available', 'downloading', 'unavailable'
  }

  // Create API session
  async createSession(apiName, options) {
    // Creates and caches session
  }

  // API-specific methods
  async proofread(text) { /* ... */ }
  async write(prompt, options) { /* ... */ }
  async rewrite(text, options) { /* ... */ }
  async summarize(text, options) { /* ... */ }
  async translate(text, sourceLang, targetLang) { /* ... */ }
  async detectLanguage(text) { /* ... */ }
  async prompt(text, options) { /* ... */ }

  // Streaming support
  async writeStreaming(prompt, options, callback) { /* ... */ }
}
```

### 3. EditorAIFeatures

AI-powered writing assistance for the editor.

**Location**: `src/editor/EditorAIFeatures.js`

**Features**:
- Grammar checking with Proofreader API
- Writing improvement with Writer API
- Tone adjustment with Rewriter API
- Content generation with Prompt API
- Real-time statistics

**Integration**:
```javascript
class EditorAIFeatures {
  constructor(aiAPIManager, editorElement) {
    this.aiAPIManager = aiAPIManager;
    this.editor = editorElement;
  }

  async checkGrammar() {
    const text = this.editor.value;
    const result = await this.aiAPIManager.proofread(text);
    this.displayGrammarSuggestions(result);
  }

  async improveWriting() {
    const text = this.getSelectedText() || this.editor.value;
    const improved = await this.aiAPIManager.write(
      `Improve this text: ${text}`,
      { tone: 'professional', length: 'as-is' }
    );
    this.showSuggestion(improved);
  }
}
```

### 4. MeetingAIFeatures

Meeting recording, transcription, and analysis.

**Location**: `src/meeting/MeetingAIFeatures.js`

**Features**:
- Audio recording with Web Speech API
- Live transcription
- Speaker identification with Prompt API
- Meeting summarization with Summarizer API
- Action item extraction with Prompt API
- Follow-up email generation with Writer API

**Architecture**:
```javascript
class MeetingAIFeatures {
  constructor(aiAPIManager) {
    this.aiAPIManager = aiAPIManager;
    this.recognition = new webkitSpeechRecognition();
    this.transcript = [];
  }

  startRecording() {
    this.recognition.start();
    this.recognition.onresult = (event) => {
      // Process speech recognition results
    };
  }

  async analyzeMeeting() {
    const fullTranscript = this.transcript.join(' ');
    
    // Parallel analysis
    const [summary, actionItems, decisions] = await Promise.all([
      this.aiAPIManager.summarize(fullTranscript, { type: 'tldr' }),
      this.extractActionItems(fullTranscript),
      this.extractDecisions(fullTranscript)
    ]);

    return { summary, actionItems, decisions };
  }
}
```

### 5. UI Components

Reusable UI components for consistent design.

**Location**: `src/components/ui-components.js`

**Components**:
- Buttons (primary, secondary, icon)
- Badges (status indicators)
- Cards (content containers)
- Toggles (switches)
- Toasts (notifications)
- Context menus
- Loading spinners

**Example**:
```javascript
export function createButton(text, type = 'primary', onClick) {
  const button = document.createElement('button');
  button.className = `btn btn-${type}`;
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

export function createBadge(text, status = 'success') {
  const badge = document.createElement('span');
  badge.className = `badge badge-${status}`;
  badge.textContent = text;
  return badge;
}
```

### 6. Icon Library

SVG-based icon system with gradient support.

**Location**: `src/icons/icon-library.js`

**Features**:
- 20+ custom SVG icons
- Gradient effects
- Animations (spin, pulse)
- Consistent sizing
- Accessibility support

**Usage**:
```javascript
import { getIcon } from './src/icons/icon-library.js';

const penIcon = getIcon('pen', { size: 24, gradient: true });
const sparkleIcon = getIcon('sparkle', { size: 20, animation: 'pulse' });
```

## Data Flow

### Editor Workflow

```
User Input → Editor → AIAPIManager → Chrome AI API → Response
                ↓                                        ↓
         Auto-save to                            Display Result
         Chrome Storage                          Update UI
```

### Translation Workflow

```
User Input → Translator UI → Language Detector API → Detect Language
                ↓                                           ↓
         Translator API ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                ↓
         Display Translation
         Text-to-Speech (optional)
```

### Meeting Workflow

```
Audio Input → Web Speech API → Live Transcript → Display
                                      ↓
                              Store in Memory
                                      ↓
                          Stop Recording Trigger
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                 ↓                 ↓
            Summarizer API    Prompt API         Writer API
                    ↓                 ↓                 ↓
              Summary         Action Items      Follow-up Email
                    └─────────────────┬─────────────────┘
                                      ↓
                              Display Analysis
                              Export Options
```

### Context Menu Workflow

```
User Selection → Right-click → Context Menu
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                                   ↓
         "Edit with IntelliPen"          "Translate with IntelliPen"
                    ↓                                   ↓
         Open Sidepanel                    Show Overlay
         Load text in Editor               Quick Translation
```

## Chrome AI APIs Integration

### API Availability Checking

```javascript
async function checkAPIAvailability() {
  const apis = [
    'LanguageModel',
    'Proofreader',
    'Writer',
    'Rewriter',
    'Summarizer',
    'Translator',
    'LanguageDetector'
  ];

  const availability = {};
  
  for (const api of apis) {
    if (api in window) {
      const status = await window[api].capabilities();
      availability[api] = status.available;
    } else {
      availability[api] = 'unavailable';
    }
  }

  return availability;
}
```

### Session Management

```javascript
class SessionManager {
  constructor() {
    this.sessions = new Map();
  }

  async getOrCreateSession(apiName, options) {
    const key = `${apiName}-${JSON.stringify(options)}`;
    
    if (this.sessions.has(key)) {
      return this.sessions.get(key);
    }

    const session = await this.createSession(apiName, options);
    this.sessions.set(key, session);
    return session;
  }

  async createSession(apiName, options) {
    const API = window[apiName];
    return await API.create(options);
  }

  destroySession(key) {
    const session = this.sessions.get(key);
    if (session && session.destroy) {
      session.destroy();
    }
    this.sessions.delete(key);
  }
}
```

### Streaming Support

```javascript
async function streamingExample(prompt) {
  const writer = await window.Writer.create({
    tone: 'professional',
    length: 'medium'
  });

  const stream = await writer.writeStreaming(prompt);
  
  for await (const chunk of stream) {
    // Update UI progressively
    appendToEditor(chunk);
  }
}
```

### Error Handling

```javascript
async function safeAPICall(apiCall, fallback) {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    
    if (error.name === 'NotAvailableError') {
      return fallback || 'API not available';
    }
    
    if (error.name === 'QuotaExceededError') {
      return 'Rate limit exceeded. Please try again later.';
    }
    
    throw error;
  }
}
```

## Build System

### Rollup Configuration

IntelliPen uses Rollup for bundling with the following plugins:

```javascript
// rollup.config.mjs
export default {
  input: {
    background: 'background.js',
    'sidepanel/index': 'sidepanel/index.js',
    'popup/menu': 'popup/menu.js',
    'content-scripts/content-script': 'content-scripts/content-script.js'
  },
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: process.env.NODE_ENV === 'development'
  },
  plugins: [
    resolve(),      // Resolve node_modules
    commonjs(),     // Convert CommonJS to ES modules
    terser(),       // Minify for production
    copy({          // Copy static assets
      targets: [
        { src: 'manifest.json', dest: 'dist' },
        { src: 'images/**/*', dest: 'dist/images' },
        { src: 'styles/**/*', dest: 'dist/styles' },
        { src: 'popup/*.html', dest: 'dist/popup' },
        { src: 'sidepanel/*.html', dest: 'dist/sidepanel' }
      ]
    })
  ]
};
```

### Build Process

```bash
# Development build with source maps
npm run dev

# Production build with minification
npm run build

# Watch mode for development
npm run build:watch

# Clean build directory
npm run clean
```

### Icon Generation

```bash
# Generate PNG icons from SVG source
npm run generate-icons

# Uses Sharp library to create:
# - icon16.png (16x16)
# - icon32.png (32x32)
# - icon48.png (48x48)
# - icon128.png (128x128)
```

## Security and Privacy

### Privacy Architecture

1. **Local Processing**:
   - All AI operations use Chrome's built-in APIs
   - Gemini Nano model runs entirely on device
   - No data sent to external servers

2. **Encrypted Storage**:
   ```javascript
   class PrivacyManager {
     async encryptData(data) {
       const key = await this.getEncryptionKey();
       return await crypto.subtle.encrypt(
         { name: 'AES-GCM', iv: this.generateIV() },
         key,
         new TextEncoder().encode(data)
       );
     }

     async decryptData(encryptedData) {
       const key = await this.getEncryptionKey();
       const decrypted = await crypto.subtle.decrypt(
         { name: 'AES-GCM', iv: encryptedData.iv },
         key,
         encryptedData.data
       );
       return new TextDecoder().decode(decrypted);
     }
   }
   ```

3. **Minimal Permissions**:
   - Only request necessary permissions
   - No broad host permissions
   - User consent for microphone access

4. **Transparent Operations**:
   - Privacy indicators show local processing
   - Clear data retention policies
   - User control over data deletion

### Security Best Practices

1. **Content Security Policy**:
   ```json
   {
     "content_security_policy": {
       "extension_pages": "script-src 'self'; object-src 'self'"
     }
   }
   ```

2. **Input Sanitization**:
   ```javascript
   import DOMPurify from 'dompurify';

   function sanitizeInput(userInput) {
     return DOMPurify.sanitize(userInput, {
       ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
       ALLOWED_ATTR: []
     });
   }
   ```

3. **Message Validation**:
   ```javascript
   chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
     // Validate message source
     if (!sender.id || sender.id !== chrome.runtime.id) {
       return;
     }

     // Validate message structure
     if (!message.type || !message.data) {
       return;
     }

     // Process message
     handleMessage(message);
   });
   ```

## Performance Optimization

### Resource Management

1. **Session Caching**: Reuse AI API sessions when possible
2. **Lazy Loading**: Load modules only when needed
3. **Debouncing**: Limit API calls during typing
4. **Streaming**: Progressive rendering for long responses

### Memory Management

```javascript
class ResourceManager {
  constructor() {
    this.sessions = new Map();
    this.maxSessions = 5;
  }

  async getSession(apiName, options) {
    // Implement LRU cache
    if (this.sessions.size >= this.maxSessions) {
      const oldestKey = this.sessions.keys().next().value;
      this.destroySession(oldestKey);
    }

    return await this.createSession(apiName, options);
  }

  destroySession(key) {
    const session = this.sessions.get(key);
    if (session?.destroy) {
      session.destroy();
    }
    this.sessions.delete(key);
  }
}
```

## Testing Strategy

### Unit Tests

```javascript
// Example: AIAPIManager tests
describe('AIAPIManager', () => {
  let manager;

  beforeEach(() => {
    manager = new AIAPIManager();
  });

  test('checks API availability', async () => {
    const availability = await manager.checkAvailability('Proofreader');
    expect(['available', 'downloading', 'unavailable']).toContain(availability);
  });

  test('creates sessions correctly', async () => {
    const session = await manager.createSession('Writer', { tone: 'casual' });
    expect(session).toBeDefined();
  });
});
```

### Integration Tests

```javascript
// Example: End-to-end editor test
describe('Editor Integration', () => {
  test('grammar check workflow', async () => {
    const editor = new EditorAIFeatures(aiAPIManager, editorElement);
    editorElement.value = 'This are a test.';
    
    await editor.checkGrammar();
    
    expect(editor.suggestions).toHaveLength(1);
    expect(editor.suggestions[0]).toContain('This is a test');
  });
});
```

## Future Architecture Considerations

### Planned Enhancements

1. **Universal Text Field Detection**:
   - Detect editable fields on web pages
   - Inject AI assistance inline
   - Platform-specific adapters

2. **Advanced Caching**:
   - Cache common translations
   - Store frequently used prompts
   - Optimize session reuse

3. **Collaborative Features**:
   - Shared documents (privacy-preserving)
   - Team meeting analysis
   - Collaborative editing

4. **Analytics Dashboard**:
   - Usage statistics
   - Writing improvement metrics
   - Meeting insights over time

---

For implementation details, see the [API Reference](api-reference.md).
