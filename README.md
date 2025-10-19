# IntelliPen Chrome Extension

IntelliPen is an intelligent Chrome extension that serves as a comprehensive writing and meeting companion. It provides real-time grammar correction, style improvements, and intelligent writing assistance across all web platforms, while also offering advanced meeting transcription and analysis capabilities.

## Features

### ✍️ IntelliPen Editor
A powerful rich-text editor with AI-powered writing assistance:

- **Grammar Checking** (Proofreader API): Real-time grammar, spelling, and punctuation correction with detailed explanations
- **Writing Improvement** (Writer API): AI-powered content enhancement for clarity, conciseness, and readability
- **Tone Adjustment** (Rewriter API): Transform text tone (formal, casual, professional, friendly)
- **Text Summarization** (Summarizer API): Generate TL;DR, key points, teasers, or headlines
- **Translation** (Translator API): Translate text to/from multiple languages with auto-detection
- **Content Generation** (Writer API): Create content from prompts with customizable style
- **Document Management**: New, open, save documents with auto-save functionality
- **Real-time Stats**: Word count, character count, and reading time tracking
- **Export Options**: Save as .txt or .md files

### 🎙️ Meeting Dashboard
Comprehensive meeting transcription and analysis:

- **Audio Recording**: Professional recording with microphone permission management
- **Live Transcription**: Real-time transcript display (ready for API integration)
- **Speaker Identification** (Prompt API): Automatic speaker detection and labeling
- **Executive Summaries** (Summarizer API): AI-generated meeting overviews
- **Action Item Extraction** (Prompt API): Automatic task identification with owner assignment
- **Key Decisions** (Prompt API): Identification of important decisions made
- **Follow-up Email Generation** (Writer API): Professional email drafts with meeting summary
- **Language Detection** (Language Detector API): Automatic meeting language identification
- **Transcript Translation** (Translator API): Translate entire transcripts to other languages
- **Export Options**: Save transcripts and analysis as text files

### 🔒 Privacy-First Architecture
- **Local Processing**: All AI processing happens locally using Chrome's built-in AI APIs (Gemini Nano)
- **No External Servers**: Your data never leaves your device
- **Encrypted Storage**: Local data is encrypted and stored securely
- **Transparent Privacy**: Clear indicators showing local processing status on all screens

## Requirements

### System Requirements
- **Chrome Version**: 138+ (stable)
- **Operating System**: Windows 10+, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage**: At least 22 GB free space for Gemini Nano model
- **GPU**: 4+ GB VRAM for AI processing
- **Network**: Unmetered connection for initial model download

### Chrome AI APIs
IntelliPen leverages all 7 Chrome built-in AI APIs:
- ✅ **Prompt API** (Gemini Nano) - General AI interactions, action items, decisions
- ✅ **Proofreader API** - Grammar, spelling, and punctuation correction
- ✅ **Writer API** - Content generation and writing improvement
- ✅ **Rewriter API** - Tone adjustment and style transformation
- ✅ **Summarizer API** - Meeting summaries and text summarization
- ✅ **Translator API** - Multi-language translation
- ✅ **Language Detector API** - Automatic language detection

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
│   ├── universal-integration.js
│   ├── grammar-overlay.js
│   └── platform-adapters/
├── popup/                     # Extension popup interface
│   ├── index.html
│   ├── index.css
│   └── index.js
├── sidepanel/                 # Dual-screen interface (Editor + Meeting)
│   ├── index.html
│   ├── index.css
│   └── index.js
├── src/                       # AI feature modules
│   ├── ai-apis/
│   │   └── AIAPIManager.js    # Central AI API management
│   ├── editor/
│   │   └── EditorAIFeatures.js # Editor AI features
│   └── meeting/
│       └── MeetingAIFeatures.js # Meeting AI features
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

### ✅ Version 1.0 (COMPLETE)
- ✅ Chrome extension foundation and architecture
- ✅ Dual-screen interface (Editor + Meeting Dashboard)
- ✅ Complete Chrome AI API integration (all 7 APIs)
- ✅ Universal text field detection system
- ✅ Real-time writing intelligence engine
- ✅ Meeting intelligence and audio processing
- ✅ Grammar checking with Proofreader API
- ✅ Writing improvement with Writer API
- ✅ Tone adjustment with Rewriter API
- ✅ Text summarization with Summarizer API
- ✅ Translation with Translator API
- ✅ Language detection with Language Detector API
- ✅ Meeting analysis with Prompt API
- ✅ Action item extraction
- ✅ Key decision identification
- ✅ Follow-up email generation
- ✅ Speaker identification
- ✅ Document management and export
- ✅ Auto-save functionality
- ✅ Privacy-first architecture

### Future Enhancements
- Real-time audio transcription API integration
- Multi-modal support (images, video)
- Collaborative editing features
- Advanced speaker diarization
- Meeting templates and presets
- Custom AI model fine-tuning
- Cloud sync (optional, privacy-preserving)
- Mobile support
- Advanced analytics dashboard

## Acknowledgments

- Chrome team for the built-in AI APIs
- Open source community for tools and libraries
- Beta testers and early adopters for feedback

---

**IntelliPen** - Intelligent writing and meeting companion, powered by local AI processing.