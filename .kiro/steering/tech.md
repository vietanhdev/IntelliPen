# Technology Stack

## Build System
- **Rollup 4.9.6**: Primary bundler for Chrome extensions with ES module support
- **npm**: Package manager and script runner
- **Node.js 16+**: Development environment

## Core Technologies
- **Chrome Extensions Manifest V3**: Extension platform with service worker architecture
- **JavaScript ES6+**: Primary language with async/await, classes, modules
- **HTML5/CSS3**: UI components with modern CSS features (Grid, Flexbox, CSS Variables)
- **Chrome Built-in AI APIs**: Gemini Nano integration for local AI processing
- **Web Speech API**: Real-time audio transcription for meeting recording

## Key Dependencies

### Build Tools
- **@rollup/plugin-node-resolve 15.2.3**: Module resolution for npm packages
- **@rollup/plugin-commonjs 25.0.7**: CommonJS to ES module conversion
- **@rollup/plugin-terser 0.4.4**: JavaScript minification for production builds
- **rollup-plugin-copy 3.5.0**: Asset copying to dist directory

### Runtime Dependencies
- **dompurify 3.0.8**: HTML sanitization for user-generated content

### Development Tools
- **sharp 0.33.5**: Image processing for icon generation
- **eslint 8.56.0**: Code linting
- **jest 29.7.0**: Testing framework

## Chrome AI APIs

### Available APIs
- **Prompt API** (`LanguageModel`): General AI interactions, action items, decisions
  - Methods: `create()`, `prompt()`, `promptStreaming()`
  - Options: temperature, topK, outputLanguage
- **Proofreader API** (`Proofreader`): Grammar, spelling, and punctuation correction
  - Methods: `create()`, `proofread()`
  - Options: expectedInputLanguages
- **Writer API** (`Writer`): Content generation and writing improvement
  - Methods: `create()`, `write()`, `writeStreaming()`
  - Options: tone, format, length, context
- **Rewriter API** (`Rewriter`): Tone adjustment and style transformation
  - Methods: `create()`, `rewrite()`, `rewriteStreaming()`
  - Options: tone (more-formal, more-casual, as-is), format, length
- **Summarizer API** (`Summarizer`): Meeting summaries and text summarization
  - Methods: `create()`, `summarize()`, `summarizeStreaming()`
  - Options: type (tldr, key-points, teaser, headline), format, length
- **Translator API** (`Translator`): Multi-language translation
  - Methods: `create()`, `translate()`, `translateStreaming()`
  - Options: sourceLanguage, targetLanguage
- **Language Detector API** (`LanguageDetector`): Automatic language detection
  - Methods: `create()`, `detect()`
  - Returns: detectedLanguage, confidence

### API Access Pattern
```javascript
// APIs are accessed via window object in content scripts
if ('LanguageModel' in window) {
  const model = await LanguageModel.create({ temperature: 0.7 });
  const result = await model.prompt('Your prompt here');
}

// Centralized access via AIAPIManager
const result = await aiAPIManager.proofread(text);
const summary = await aiAPIManager.summarize(text, { type: 'tldr' });
const translated = await aiAPIManager.translate(text, 'en', 'es');
```

## Common Commands
```bash
# Install dependencies
npm install

# Build extension for production
npm run build

# Build with watch mode for development
npm run build:watch

# Development build
npm run dev

# Clean build directory
npm run clean

# Generate icons from SVG
npm run generate-icons

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the 'dist' directory
```

## Extension Structure

### Core Files
- **manifest.json**: Extension configuration with trial tokens for Chrome AI APIs
- **background.js**: Service worker handling lifecycle, context menus, and message routing
- **rollup.config.mjs**: Build configuration with plugin setup

### UI Components
- **popup/**: Quick access menu with API status indicators
- **sidepanel/**: Dual-screen interface (Editor + Translator + Meeting Dashboard)
- **content-scripts/**: API detection and quick translate overlay

### Source Modules
- **src/ai-apis/**: AIAPIManager for centralized API access
- **src/components/**: Reusable UI components (buttons, badges, cards, etc.)
- **src/icons/**: SVG icon library with 20+ icons
- **src/editor/**: EditorAIFeatures for writing assistance
- **src/meeting/**: MeetingAIFeatures for meeting analysis
- **src/privacy-manager/**: Privacy and encryption management

### Assets
- **images/**: Extension icons (SVG source + PNG exports)
- **styles/**: Shared CSS with component styles and icon animations
- **dist/**: Build output directory (generated)

## Hardware Requirements
- **Chrome Version**: 138+ on desktop (Windows 10+, macOS 13+, Linux, ChromeOS)
- **Storage**: 22GB+ free space for Gemini Nano model download
- **GPU**: 4GB+ VRAM for AI processing
- **Network**: Unmetered connection for initial model download

## Development Patterns

### Module System
- ES6 modules with `import`/`export`
- Rollup bundles modules for browser compatibility
- Global exports for extension context (`self.aiAPIManager`)

### Async/Await
- All AI API calls are asynchronous
- Streaming support with async iterators
- Error handling with try/catch blocks

### Component Architecture
- Reusable UI components in `src/components/`
- Icon system with SVG templates
- Consistent styling with CSS variables

### State Management
- Chrome storage API for persistence
- In-memory state for active sessions
- Message passing between components