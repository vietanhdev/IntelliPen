# IntelliPen Chrome Extension

IntelliPen is an intelligent Chrome extension that serves as a comprehensive writing and meeting companion. It provides real-time grammar correction, style improvements, and intelligent writing assistance across all web platforms, while also offering advanced meeting transcription and analysis capabilities.

## Features

### 🖋️ Universal Writing Intelligence
- **Real-time Grammar Correction**: Instant grammar and spelling corrections across all websites
- **Style Improvements**: Intelligent suggestions for tone, clarity, and consistency
- **Cross-Platform Integration**: Works seamlessly on Gmail, LinkedIn, Notion, Google Docs, and any text area
- **Context-Aware Analysis**: Adapts suggestions based on platform and writing context

### 🎙️ Meeting Intelligence
- **Real-time Transcription**: Automatic audio transcription with speaker identification
- **Executive Summaries**: AI-generated meeting summaries highlighting key points
- **Action Item Extraction**: Automatic identification and formatting of action items
- **Follow-up Email Generation**: Professional email drafts based on meeting content

### 🔒 Privacy-First Architecture
- **Local Processing**: All AI processing happens locally using Chrome's built-in AI APIs
- **No External Servers**: Your data never leaves your device
- **Encrypted Storage**: Local data is encrypted with AES-256 encryption
- **Transparent Privacy**: Clear indicators showing local processing status

## Requirements

### System Requirements
- **Chrome Version**: 138+ (stable)
- **Operating System**: Windows 10+, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage**: At least 22 GB free space for Gemini Nano model
- **GPU**: 4+ GB VRAM for AI processing
- **Network**: Unmetered connection for initial model download

### Chrome AI APIs
IntelliPen leverages Chrome's built-in AI APIs:
- Prompt API (Gemini Nano)
- Proofreader API
- Writer API
- Rewriter API
- Summarizer API
- Translator API

> **⚠️ APIs Currently Unavailable?** If Chrome AI APIs show as unavailable, see the [Chrome AI Setup Guide](CHROME_AI_SETUP.md) for step-by-step fix instructions.

## Installation

### Quick Fix for Chrome AI APIs
If Chrome AI APIs are showing as unavailable:

1. **Run Diagnostic**: Open `chrome-ai-diagnostic.html` in Chrome
2. **Enable Flags**: Go to `chrome://flags/` and enable AI API flags
3. **Restart Chrome**: Completely restart Chrome after enabling flags
4. **Download Models**: APIs will trigger Gemini Nano download on first use

See [CHROME_AI_SETUP.md](CHROME_AI_SETUP.md) for detailed instructions.

### Development Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/vietanhdev/intellipen-extension.git
   cd intellipen-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. **Fix Chrome AI APIs** (if needed):
   - Open `chrome-ai-diagnostic.html` in Chrome
   - Follow the setup instructions in [CHROME_AI_SETUP.md](CHROME_AI_SETUP.md)

5. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### Production Installation
IntelliPen will be available on the Chrome Web Store once development is complete.

## Usage

### 🔧 Fixing "Active Fields: 0" Issue

If you see "Active Fields: 0" and "Suggestions: 0", the text field detection isn't working. Here's how to fix it:

#### Quick Fix
1. **Open test page**: Load `test-text-field-detection.html` in Chrome
2. **Load enhanced integration**: Click "🚀 Load Enhanced Integration"
3. **Check status panel**: Look for IntelliPen status in top-right corner
4. **Test fields**: Click "🧪 Test All Fields" to generate sample suggestions

#### Manual Fix
1. **Load the fix script**: Include `fix-text-field-detection.js` in your page
2. **Check console**: Look for IntelliPen initialization messages
3. **Use keyboard shortcuts**: Press `Ctrl+Shift+I` to open suggestion menu

### Writing Intelligence
1. **Automatic Activation**: IntelliPen automatically detects text fields on any website
2. **Real-time Suggestions**: See grammar and style suggestions as you type
3. **Visual Indicators**: Color-coded highlights show different types of improvements
4. **One-click Application**: Click suggestions to apply improvements instantly
5. **Status Panel**: Monitor active fields and suggestions in real-time

### Meeting Intelligence
1. **Start Recording**: Click the record button in the sidepanel or popup
2. **Live Transcript**: View real-time transcription with speaker identification
3. **Automatic Analysis**: Get executive summaries and action items when recording stops
4. **Export Options**: Save transcripts and analysis in multiple formats

### Privacy Controls
- **Status Indicators**: Always see when local processing is active
- **Data Management**: One-click data deletion and export options
- **Encryption Settings**: Configure local data encryption preferences

## Development

### Project Structure
```
intellipen/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Service worker for extension lifecycle
├── content-scripts/           # Content scripts for web page integration
│   └── universal-integration.js
├── popup/                     # Extension popup interface
│   ├── index.html
│   ├── index.css
│   └── index.js
├── sidepanel/                 # Meeting dashboard interface
│   ├── index.html
│   ├── index.css
│   └── index.js
├── styles/                    # Shared CSS for overlays
│   └── overlay.css
├── images/                    # Extension icons
└── dist/                      # Build output (generated)
```

### Build Commands
```bash
# Development build
npm run dev

# Production build
npm run build

# Watch mode for development
npm run build:watch

# Clean build directory
npm run clean

# Run linting
npm run lint

# Run tests
npm run test
```

### Chrome AI API Integration
IntelliPen uses Chrome's built-in AI APIs for all processing:

```javascript
// Example: Grammar checking with Proofreader API
const proofreader = await chrome.ai.proofreader.create();
const result = await proofreader.proofread(text);

// Example: Meeting summarization with Summarizer API
const summarizer = await chrome.ai.summarizer.create();
const summary = await summarizer.summarize(transcript);
```

## Architecture

### Core Components
- **Service Worker**: Manages extension lifecycle and API coordination
- **Content Scripts**: Handle text field detection and platform integration
- **Writing Intelligence Engine**: Provides real-time grammar and style analysis
- **Meeting Intelligence System**: Manages audio processing and transcription
- **Privacy Manager**: Handles encryption and local data management

### Platform Adapters
- **Gmail Adapter**: Optimized integration for Gmail compose windows
- **LinkedIn Adapter**: Enhanced support for LinkedIn posts and messages
- **Notion Adapter**: Seamless integration with Notion pages and comments
- **Google Docs Adapter**: Native-feeling integration with Google Docs
- **Universal Adapter**: Fallback support for any website with text fields

## Contributing

We welcome contributions to IntelliPen! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Privacy Policy

IntelliPen is built with privacy as a core principle:

- **Local Processing**: All AI operations happen on your device using Chrome's built-in APIs
- **No Data Collection**: We don't collect, store, or transmit your personal data
- **Encrypted Storage**: Any local data is encrypted with industry-standard encryption
- **Transparent Operations**: Clear indicators show when and how your data is processed

For full details, see our [Privacy Policy](PRIVACY.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/intellipen/intellipen-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/intellipen/intellipen-extension/discussions)

## Roadmap

### Current Phase (v1.0)
- ✅ Chrome extension foundation and architecture
- 🔄 Chrome AI API integration layer
- 🔄 Universal text field detection system
- 🔄 Real-time writing intelligence engine
- 🔄 Meeting intelligence and audio processing

### Future Phases
- Multi-language support expansion
- Advanced accessibility features
- Performance optimizations
- Additional platform integrations
- Enhanced meeting analysis capabilities

## Acknowledgments

- Chrome team for the built-in AI APIs
- Open source community for tools and libraries
- Beta testers and early adopters for feedback

---

**IntelliPen** - Intelligent writing and meeting companion, powered by local AI processing.