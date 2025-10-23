# FAQ

Common questions about IntelliPen.

## General Questions

??? question "What is IntelliPen?"

    IntelliPen is a Chrome extension that provides AI-powered writing assistance, translation, and meeting intelligence. All processing happens locally on your device using Chrome's built-in AI APIs (Gemini Nano).

??? question "Is IntelliPen free?"

    Yes, IntelliPen is completely free and open source. There are no subscription fees, premium tiers, or hidden costs.

??? question "What makes IntelliPen different from other AI writing tools?"

    **Privacy**: Unlike cloud-based tools, IntelliPen processes everything locally on your device. Your data never leaves your computer.

    **No API Keys**: No need for OpenAI, Anthropic, or other API keys. Uses Chrome's built-in AI.

    **Offline Capable**: Once the AI model is downloaded, IntelliPen works without an internet connection.

    **Free**: No subscription fees or usage limits.

## System Requirements

??? question "What Chrome version do I need?"

    Chrome 138 or higher (stable channel). Check your version at `chrome://version/`.

??? question "What operating systems are supported?"

    - Windows 10 or later
    - macOS 13 (Ventura) or later
    - Linux (recent distributions)
    - ChromeOS (Chromebook Plus)

??? question "How much storage space do I need?"

    At least 22 GB of free space for the Gemini Nano AI model. This is a one-time download.

??? question "What are the GPU requirements?"

    4+ GB of VRAM is recommended for optimal AI processing performance.

## Features

??? question "What AI features does IntelliPen provide?"

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

??? question "How many languages does the translator support?"

    25+ languages including English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, and more.

??? question "Can I translate text on any webpage?"

    Yes! Select text, right-click, and choose "Translate with IntelliPen" for instant translation.

## Privacy & Security

??? question "Is my data private?"

    Yes, completely. All AI processing happens locally on your device. Your data never leaves your computer.

??? question "Does IntelliPen send data to external servers?"

    No. IntelliPen does not send any data to external servers. Everything is processed locally using Chrome's built-in AI.

??? question "Can IntelliPen see my browsing history?"

    No. IntelliPen only accesses text you explicitly select and choose to translate or edit.

??? question "What data does IntelliPen store?"

    Only local data you create:
    
    - Saved documents
    - User preferences (language settings, etc.)
    - Auto-saved editor content

    All stored data is encrypted.

## Troubleshooting

??? question "APIs show as 'unavailable' in the popup"

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

??? question "Grammar check isn't working"

    **Try**:
    
    1. Check that Proofreader API is available (green badge in popup)
    2. Ensure text is in a supported language
    3. Try with shorter text segments
    4. Restart Chrome

??? question "Translation fails or is incorrect"

    **Try**:
    
    1. Check that Translator API is available
    2. Verify text is under 5000 characters
    3. Ensure source and target languages are different
    4. Try using "Auto-detect" for source language
    5. Check that the language is supported

??? question "Meeting recording produces no transcript"

    **Check**:
    
    1. Microphone permission is granted
    2. Correct microphone is selected
    3. Microphone works in other applications
    4. Recognition language matches spoken language
    5. Speaking clearly and not too quietly

## Development

??? question "Can I contribute to IntelliPen?"

    Yes! IntelliPen is open source. See the [Contributing Guide](contributing.md) for details.

??? question "How do I report a bug?"

    1. Check [existing issues](https://github.com/vietanhdev/IntelliPen/issues)
    2. If not reported, create a new issue
    3. Include:
        - Chrome version
        - Operating system
        - Steps to reproduce
        - Expected vs actual behavior
        - Console errors (if any)

??? question "Where is the source code?"

    GitHub: [https://github.com/vietanhdev/IntelliPen](https://github.com/vietanhdev/IntelliPen)

## Still Have Questions?

- **Documentation**: Browse the full documentation
- **GitHub Issues**: [Search existing issues](https://github.com/vietanhdev/IntelliPen/issues)
- **GitHub Discussions**: [Ask the community](https://github.com/vietanhdev/IntelliPen/discussions)
- **Report Bug**: [Create an issue](https://github.com/vietanhdev/IntelliPen/issues/new)
