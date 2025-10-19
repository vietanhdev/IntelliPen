---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started with IntelliPen

This guide will help you install and set up IntelliPen for the first time.

## Prerequisites

Before installing IntelliPen, ensure your system meets these requirements:

### System Requirements

- **Chrome Version**: 138+ (stable channel)
- **Operating System**: 
  - Windows 10 or later
  - macOS 13 (Ventura) or later
  - Linux (recent distributions)
  - ChromeOS (Chromebook Plus)
- **Storage**: At least 22 GB free space for Gemini Nano model
- **GPU**: 4+ GB VRAM for AI processing
- **Network**: Unmetered connection for initial model download

### Checking Chrome Version

1. Open Chrome
2. Navigate to `chrome://version/`
3. Check that your version is 138 or higher
4. If not, update Chrome to the latest stable version

## Installation

### Option 1: Development Installation (Current)

Since IntelliPen is currently in development, you'll need to install it as an unpacked extension:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vietanhdev/IntelliPen.git
   cd IntelliPen
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build
   ```

4. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from the IntelliPen directory

5. **Verify installation**:
   - You should see the IntelliPen icon in your Chrome toolbar
   - Click the icon to open the popup menu
   - Check that API status indicators show availability

### Option 2: Chrome Web Store (Coming Soon)

IntelliPen will be available on the Chrome Web Store once development is complete.

## Initial Setup

### 1. Grant Permissions

When you first use IntelliPen, you'll need to grant certain permissions:

- **Storage**: For saving documents and preferences
- **Active Tab**: For context menu integration
- **Microphone** (optional): For meeting recording features

### 2. Download Gemini Nano Model

Chrome will automatically download the Gemini Nano model when you first use AI features:

1. Click the IntelliPen icon to open the sidepanel
2. Try using any AI feature (grammar check, translation, etc.)
3. Chrome will prompt to download the model (approximately 22 GB)
4. Wait for the download to complete (may take 10-30 minutes depending on connection)
5. Once complete, all AI features will be available

### 3. Check API Availability

To verify all APIs are working:

1. Click the IntelliPen icon in the toolbar
2. The popup shows real-time status for each API:
   - 🟢 Green badge: API is available
   - 🟡 Yellow badge: API is downloading/initializing
   - 🔴 Red badge: API is unavailable

## First Steps

### Opening IntelliPen

There are three ways to access IntelliPen:

1. **Extension Icon**: Click the IntelliPen icon in the toolbar to open the sidepanel
2. **Right-click Menu**: Select text on any webpage, right-click, and choose:
   - "Edit with IntelliPen" - Opens editor with selected text
   - "Translate with IntelliPen" - Shows quick translate overlay
3. **Keyboard Shortcut** (optional): Configure in `chrome://extensions/shortcuts`

### Exploring the Interface

IntelliPen has three main screens:

1. **Editor Screen**: 
   - Rich text editor with AI writing assistance
   - Grammar checking, writing improvement, tone adjustment
   - Document management and export

2. **Translator Screen**:
   - Multi-language translation with auto-detection
   - Text-to-speech for source and target languages
   - Character counter and language swap

3. **Meeting Screen**:
   - Audio recording with device selection
   - Live transcription with timestamps
   - AI-powered meeting analysis

Switch between screens using the navigation buttons at the top.

## Quick Start Tutorials

### Writing with IntelliPen Editor

1. Click the IntelliPen icon to open the sidepanel
2. Ensure "Editor" screen is selected
3. Type or paste some text
4. Click "Check Grammar" to see corrections
5. Try "Improve Writing" for AI suggestions
6. Use "Change Tone" to adjust formality

### Translating Text

1. Open the sidepanel and switch to "Translator" screen
2. Select source language (or use "Auto-detect")
3. Select target language
4. Type or paste text to translate
5. Translation appears automatically
6. Click speaker icons to hear text-to-speech

### Recording a Meeting

1. Open the sidepanel and switch to "Meeting" screen
2. Grant microphone permission when prompted
3. Select your microphone from the dropdown
4. Choose recognition language
5. Click "Start Recording"
6. Speak naturally - transcript appears in real-time
7. Click "Stop Recording" to end and trigger AI analysis
8. Review summary, action items, and key decisions

## Troubleshooting

### APIs Not Available

If APIs show as unavailable:

1. Ensure Chrome version is 138+
2. Check that you have sufficient storage (22+ GB free)
3. Verify GPU meets requirements (4+ GB VRAM)
4. Wait for Gemini Nano model download to complete
5. Restart Chrome and try again

### Extension Not Loading

If the extension doesn't load:

1. Check that you selected the `dist` folder (not the root folder)
2. Ensure the build completed successfully (`npm run build`)
3. Check Chrome DevTools console for errors
4. Try removing and re-adding the extension

### Microphone Not Working

If meeting recording doesn't work:

1. Grant microphone permission when prompted
2. Check Chrome site settings: `chrome://settings/content/microphone`
3. Verify microphone works in other applications
4. Try selecting a different microphone from the dropdown
5. Use the "Test Microphone" button to verify

### Translation Not Working

If translation fails:

1. Check that Translator API is available (green badge in popup)
2. Verify text length is under 5000 characters
3. Ensure source and target languages are different
4. Try using "Auto-detect" for source language
5. Check internet connection for initial model download

## Next Steps

Now that you have IntelliPen installed and set up:

- Read the [User Guide](user-guide.md) for detailed feature documentation
- Explore the [Architecture](architecture.md) to understand how it works
- Check out [API Reference](api-reference.md) for technical details
- Join our community and [contribute](contributing.md) to development

## Getting Help

If you encounter issues:

- Check the [User Guide](user-guide.md) for detailed instructions
- Search [GitHub Issues](https://github.com/vietanhdev/IntelliPen/issues)
- Join [GitHub Discussions](https://github.com/vietanhdev/IntelliPen/discussions)
- Report bugs with detailed reproduction steps

---

Ready to dive deeper? Continue to the [User Guide](user-guide.md).
