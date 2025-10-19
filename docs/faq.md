---
layout: default
title: FAQ
nav_order: 8
---

# Frequently Asked Questions

Common questions about IntelliPen.

## General Questions

### What is IntelliPen?

IntelliPen is a Chrome extension that provides AI-powered writing assistance, translation, and meeting intelligence. All processing happens locally on your device using Chrome's built-in AI APIs (Gemini Nano).

### Is IntelliPen free?

Yes, IntelliPen is completely free and open source. There are no subscription fees, premium tiers, or hidden costs.

### What makes IntelliPen different from other AI writing tools?

**Privacy**: Unlike cloud-based tools, IntelliPen processes everything locally on your device. Your data never leaves your computer.

**No API Keys**: No need for OpenAI, Anthropic, or other API keys. Uses Chrome's built-in AI.

**Offline Capable**: Once the AI model is downloaded, IntelliPen works without an internet connection.

**Free**: No subscription fees or usage limits.

## System Requirements

### What Chrome version do I need?

Chrome 138 or higher (stable channel). Check your version at `chrome://version/`.

### What operating systems are supported?

- Windows 10 or later
- macOS 13 (Ventura) or later
- Linux (recent distributions)
- ChromeOS (Chromebook Plus)

### How much storage space do I need?

At least 22 GB of free space for the Gemini Nano AI model. This is a one-time download.

### What are the GPU requirements?

4+ GB of VRAM is recommended for optimal AI processing performance.

### Will IntelliPen work on my Chromebook?

Yes, but only on Chromebook Plus models that meet the system requirements (Chrome 138+, sufficient storage and GPU).

## Installation & Setup

### How do I install IntelliPen?

See the [Getting Started Guide](getting-started.md) for detailed installation instructions.

Currently, install as an unpacked extension:
1. Clone the repository
2. Run `npm install` and `npm run build`
3. Load the `dist` folder in `chrome://extensions/`

### Why isn't IntelliPen on the Chrome Web Store yet?

IntelliPen is currently in development. It will be published to the Chrome Web Store once development is complete and thoroughly tested.

### How long does the initial setup take?

The Gemini Nano model download takes 10-30 minutes depending on your internet connection. This is a one-time process.

### Can I use IntelliPen while the model is downloading?

No, you need to wait for the model download to complete before using AI features. The popup will show download progress.

## Features

### What AI features does IntelliPen provide?

**Editor**:
- Grammar checking
- Writing improvement
- Tone adjustment
- Content generation

**Translator**:
- Multi-language translation (25+ languages)
- Auto-detection
- Text-to-speech

**Meeting Dashboard**:
- Audio recording
- Live transcription
- Meeting summaries
- Action item extraction
- Follow-up email generation

### How many languages does the translator support?

25+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and more.

### Can I translate text on any webpage?

Yes! Select text, right-click, and choose "Translate with IntelliPen" for instant translation.

### Does the meeting recorder work with video calls?

Yes, but you need to select the correct audio input device. For video calls, you may need to use system audio capture or a virtual audio device.

### Can I export my documents and transcripts?

Yes, you can export:
- Editor documents as .txt files
- Translations as .txt files
- Meeting transcripts with timestamps
- Meeting analysis (summaries, action items, etc.)

## Privacy & Security

### Is my data private?

Yes, completely. All AI processing happens locally on your device. Your data never leaves your computer.

### Does IntelliPen send data to external servers?

No. IntelliPen does not send any data to external servers. Everything is processed locally using Chrome's built-in AI.

### Can IntelliPen see my browsing history?

No. IntelliPen only accesses text you explicitly select and choose to translate or edit.

### What data does IntelliPen store?

Only local data you create:
- Saved documents
- User preferences (language settings, etc.)
- Auto-saved editor content

All stored data is encrypted.

### How do I delete my data?

- Clear editor content: Click "New Document"
- Delete saved files: Remove from your downloads
- Uninstall extension: Removes all local data

See the [Privacy Policy](privacy.md) for complete details.

## Performance

### Why is IntelliPen slow on my computer?

AI processing requires significant computational resources. Ensure:
- Your GPU meets requirements (4+ GB VRAM)
- Sufficient free RAM (8+ GB recommended)
- Chrome is up to date
- Other resource-intensive tabs are closed

### Can I use IntelliPen offline?

Yes! Once the Gemini Nano model is downloaded, all features work offline except:
- Initial model download
- Extension updates

### How much RAM does IntelliPen use?

Typically 200-500 MB depending on active features. AI processing may temporarily use more.

### Does IntelliPen slow down my browser?

IntelliPen is designed to be lightweight. However, AI processing is resource-intensive. Close unused tabs for best performance.

## Troubleshooting

### APIs show as "unavailable" in the popup

**Possible causes**:
1. Chrome version is below 138
2. Gemini Nano model not downloaded yet
3. Insufficient storage space
4. GPU doesn't meet requirements

**Solutions**:
- Update Chrome to 138+
- Wait for model download to complete
- Free up storage space (22+ GB needed)
- Check GPU specifications

### Grammar check isn't working

**Try**:
1. Check that Proofreader API is available (green badge in popup)
2. Ensure text is in a supported language
3. Try with shorter text segments
4. Restart Chrome

### Translation fails or is incorrect

**Try**:
1. Check that Translator API is available
2. Verify text is under 5000 characters
3. Ensure source and target languages are different
4. Try using "Auto-detect" for source language
5. Check that the language is supported

### Meeting recording produces no transcript

**Check**:
1. Microphone permission is granted
2. Correct microphone is selected
3. Microphone works in other applications
4. Recognition language matches spoken language
5. Speaking clearly and not too quietly

### Extension won't load

**Try**:
1. Ensure you selected the `dist` folder (not root)
2. Verify build completed: `npm run build`
3. Check console for errors
4. Remove and re-add the extension
5. Restart Chrome

### Changes aren't showing up

**Try**:
1. Rebuild: `npm run build`
2. Reload extension in `chrome://extensions/`
3. Hard refresh: Ctrl+Shift+R
4. Clear Chrome cache

## Usage

### How do I check grammar in my text?

1. Open IntelliPen sidepanel
2. Go to Editor screen
3. Type or paste text
4. Click "Check Grammar"
5. Review and apply suggestions

### How do I translate selected text on a webpage?

1. Select text on any webpage
2. Right-click
3. Choose "Translate with IntelliPen"
4. View translation in overlay

### How do I record a meeting?

1. Open IntelliPen sidepanel
2. Go to Meeting screen
3. Grant microphone permission
4. Select microphone and language
5. Click "Start Recording"
6. Click "Stop Recording" when done
7. Review AI-generated analysis

### Can I change the tone of my writing?

Yes! In the Editor:
1. Select text (or use entire document)
2. Click "Change Tone"
3. Choose: More Formal, More Casual, or As-Is
4. Review and apply the rewritten text

### How do I save my work?

**Editor**:
- Auto-save: Enabled by default (every 30 seconds)
- Manual save: Click "Save Document"

**Translator**:
- Click "Export Translation"

**Meeting**:
- Click "Export Transcript" or "Export Analysis"

## Development

### Can I contribute to IntelliPen?

Yes! IntelliPen is open source. See the [Contributing Guide](contributing.md) for details.

### How do I report a bug?

1. Check [existing issues](https://github.com/vietanhdev/IntelliPen/issues)
2. If not reported, create a new issue
3. Include:
   - Chrome version
   - Operating system
   - Steps to reproduce
   - Expected vs actual behavior
   - Console errors (if any)

### How do I request a feature?

1. Check [existing feature requests](https://github.com/vietanhdev/IntelliPen/issues?q=is%3Aissue+label%3Aenhancement)
2. If not requested, create a new issue
3. Label it as "enhancement"
4. Describe the feature and use case

### Where is the source code?

GitHub: [https://github.com/vietanhdev/IntelliPen](https://github.com/vietanhdev/IntelliPen)

### What license is IntelliPen under?

MIT License - free to use, modify, and distribute.

## Chrome AI APIs

### What are Chrome's built-in AI APIs?

Chrome's built-in AI APIs provide local AI processing using the Gemini Nano model. They include:
- Prompt API (general AI)
- Proofreader API (grammar)
- Writer API (content generation)
- Rewriter API (tone adjustment)
- Summarizer API (summarization)
- Translator API (translation)
- Language Detector API (language detection)

### Are these APIs stable?

The APIs are currently in trial/preview. They may change before final release. IntelliPen will be updated to match any API changes.

### Do I need an API key?

No! Chrome's built-in AI APIs don't require API keys. They work out of the box once the model is downloaded.

### Can I use these APIs in my own projects?

Yes! Chrome's built-in AI APIs are available to all Chrome extensions and web applications. See Chrome's documentation for details.

## Comparison

### IntelliPen vs Grammarly?

**IntelliPen**:
- ✅ Completely free
- ✅ Privacy-first (local processing)
- ✅ No account required
- ✅ Open source
- ❌ Fewer advanced features

**Grammarly**:
- ❌ Requires subscription for advanced features
- ❌ Cloud-based (data sent to servers)
- ❌ Requires account
- ✅ More advanced grammar checking
- ✅ More writing suggestions

### IntelliPen vs Google Translate?

**IntelliPen**:
- ✅ Privacy-first (local processing)
- ✅ Works offline
- ✅ Integrated with writing tools
- ✅ Context menu integration
- ❌ Fewer languages

**Google Translate**:
- ❌ Cloud-based (data sent to servers)
- ❌ Requires internet
- ✅ More languages (100+)
- ✅ More translation features

### IntelliPen vs Otter.ai?

**IntelliPen**:
- ✅ Completely free
- ✅ Privacy-first (local processing)
- ✅ No account required
- ✅ Integrated AI analysis
- ❌ No cloud sync
- ❌ No collaboration features

**Otter.ai**:
- ❌ Limited free tier
- ❌ Cloud-based
- ❌ Requires account
- ✅ Cloud sync
- ✅ Collaboration features
- ✅ More advanced transcription

## Future Plans

### What features are planned?

See the [README](https://github.com/vietanhdev/IntelliPen#future-enhancements) for planned features:
- Universal text field detection
- Platform-specific adapters (Gmail, LinkedIn, etc.)
- Advanced speaker diarization
- Meeting templates
- And more!

### When will IntelliPen be on the Chrome Web Store?

We're working towards a Chrome Web Store release. Follow the [GitHub repository](https://github.com/vietanhdev/IntelliPen) for updates.

### Will there be a mobile version?

Currently, IntelliPen is Chrome-only. Mobile support depends on Chrome's built-in AI APIs becoming available on mobile platforms.

### Will IntelliPen support other browsers?

IntelliPen depends on Chrome's built-in AI APIs, which are Chrome-specific. Support for other browsers would require different AI backends.

## Still Have Questions?

- **Documentation**: Browse the [full documentation](index.md)
- **GitHub Issues**: [Search existing issues](https://github.com/vietanhdev/IntelliPen/issues)
- **GitHub Discussions**: [Ask the community](https://github.com/vietanhdev/IntelliPen/discussions)
- **Report Bug**: [Create an issue](https://github.com/vietanhdev/IntelliPen/issues/new)

---

Can't find your answer? [Ask a question on GitHub Discussions](https://github.com/vietanhdev/IntelliPen/discussions).
