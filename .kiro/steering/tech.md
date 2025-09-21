# Technology Stack

## Build System
- **Rollup**: Primary bundler for Chrome extensions
- **npm**: Package manager and script runner
- **Node.js**: Development environment

## Core Technologies
- **Chrome Extensions Manifest V3**: Extension platform
- **JavaScript ES6+**: Primary language
- **HTML5/CSS3**: UI components
- **Chrome Built-in AI APIs**: Gemini Nano integration

## Key Dependencies
- **@rollup/plugin-node-resolve**: Module resolution
- **@rollup/plugin-commonjs**: CommonJS support
- **rollup-plugin-copy**: Asset copying
- **dompurify**: HTML sanitization
- **marked**: Markdown parsing

## Chrome AI APIs
- **Prompt API**: `LanguageModel.create()`, streaming/batch prompting
- **Summarizer API**: `Summarizer.create()`, content summarization
- **Translator API**: Language detection and translation
- **Multimodal APIs**: Image and audio processing

## Common Commands
```bash
# Install dependencies
npm install

# Build extension for development
npm run build

# Load extension in Chrome
# Load the 'dist' directory as unpacked extension in chrome://extensions/
```

## Extension Structure
- **manifest.json**: Extension configuration (Manifest V3)
- **background.js**: Service worker for extension lifecycle
- **sidepanel/**: UI components for side panel extensions
- **dist/**: Build output directory
- **images/**: Extension icons (16, 32, 48, 128px)

## Hardware Requirements
- Chrome 138+ on desktop (Windows 10+, macOS 13+, Linux, ChromeOS)
- 22GB+ free storage for Gemini Nano model
- 4GB+ VRAM for AI processing
- Unmetered network connection for model download