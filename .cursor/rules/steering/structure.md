# Project Structure

## Root Directory
- **.kiro/specs/intellipen/**: IntelliPen feature specification with requirements, design, and implementation tasks
- **chrome_ai_docs/**: Reference documentation for Chrome's built-in AI APIs (for development guidance)
- **examples/**: Reference Chrome extension examples demonstrating AI capabilities (for implementation patterns)
- **docs/**: Additional project documentation

## IntelliPen Extension Structure
The main IntelliPen extension follows Chrome Extension Manifest V3 standards:

### Core Files
- **manifest.json**: Extension configuration with Chrome AI API permissions
- **background.js**: Service worker handling extension lifecycle, API coordination, and cross-tab synchronization
- **package.json**: Build configuration and dependencies
- **rollup.config.mjs**: Build system configuration

### Content Scripts (`content-scripts/`)
- **universal-integration.js**: Main content script for text field detection across all websites
- **grammar-overlay.js**: Real-time writing assistance overlay system
- **meeting-interface.js**: Meeting transcription UI management
- **platform-adapters/**: Platform-specific integration adapters (Gmail, LinkedIn, Notion, Google Docs)

### User Interface Components
- **popup/**: Quick access controls and status indicators
  - `index.html`, `index.js`, `index.css`
- **sidepanel/**: Primary meeting interface and transcript display
  - `index.html`, `index.js`, `index.css`
- **options/**: Advanced settings and privacy controls
  - `index.html`, `index.js`, `index.css`

### Core Modules (`src/`)
- **writing-intelligence/**: Writing analysis and suggestion engine
- **meeting-intelligence/**: Audio processing and meeting analysis
- **privacy-manager/**: Encryption and local data management
- **api-manager/**: Chrome AI API integration and availability checking
- **platform-adapters/**: Website-specific integration logic

### Assets
- **images/**: Extension icons (16, 32, 48, 128px)
- **styles/**: Shared CSS for overlays and UI components
- **dist/**: Build output directory (generated)

## Reference Resources
- **chrome_ai_docs/**: Documentation for Chrome AI APIs (Prompt, Proofreader, Writer, Rewriter, Summarizer, Translator)
- **examples/**: Reference implementations showing AI API usage patterns in Chrome extensions

## Extension Conventions
- **Manifest V3** with service worker architecture
- **Local-first processing** using Chrome's built-in AI APIs
- **Privacy-by-design** with encrypted local storage
- **Universal compatibility** across all websites
- **Platform-specific optimizations** for major platforms (Gmail, LinkedIn, Notion, Google Docs)