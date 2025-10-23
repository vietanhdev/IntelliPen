# IntelliPen Publishing Guide

## Build Status ✅
- **Version**: 1.0.0
- **Package Size**: 82KB (313KB uncompressed)
- **Files**: 39 files
- **Build Output**: `dist/` directory
- **Distribution Package**: `intellipen-v1.0.0.zip`

## Quick Build Commands

```bash
# Clean build for production
npm run package

# Or step by step:
npm run clean              # Remove old build
NODE_ENV=production npm run build  # Build for production
```

## Chrome Web Store Submission Checklist

### 1. Pre-Submission Requirements
- [x] Extension built and tested locally
- [x] Production build created (`dist/` folder)
- [x] ZIP package created (`intellipen-v1.0.0.zip`)
- [ ] Extension tested in Chrome 138+ (load unpacked from `dist/`)
- [ ] All features working (Editor, Translator, Meeting Dashboard)
- [ ] Chrome AI APIs tested (requires Chrome 138+ with Gemini Nano)
- [ ] Privacy policy prepared (see `docs/privacy.md`)

### 2. Store Listing Assets Needed
- [ ] **Icon**: 128x128px (already in `images/icon128.png`)
- [ ] **Screenshots**: 1280x800px or 640x400px (5 recommended)
  - Editor interface with grammar checking
  - Translator with multi-language support
  - Meeting Dashboard with transcription
  - Context menu integration
  - API status popup
- [ ] **Promotional Images** (optional):
  - Small tile: 440x280px
  - Marquee: 1400x560px
- [ ] **Video** (optional): YouTube demo link

### 3. Store Listing Information

**Name**: IntelliPen

**Summary** (132 chars max):
Intelligent writing companion with AI-powered grammar checking, translation, and meeting transcription—all processed locally.

**Description** (detailed):
```
IntelliPen brings professional writing assistance, real-time translation, and meeting intelligence directly to your browser—all processed locally on your device with zero data sharing.

🎯 KEY FEATURES

✍️ IntelliPen Editor
• Real-time grammar, spelling, and punctuation correction
• AI-powered writing improvement for clarity and readability
• Tone adjustment (formal, casual, professional, friendly)
• Document management with auto-save
• Word count, character count, and reading time tracking

🌍 Translator
• Translate between 25+ languages instantly
• Automatic source language detection
• Real-time translation as you type
• Text-to-speech for source and translated text
• Right-click to translate selected text on any webpage

📝 Meeting Dashboard
• Professional audio recording with device selection
• Live transcription using Web Speech API
• AI-powered analysis: summaries, action items, key decisions
• Follow-up email generation
• Export transcripts and analysis

🔒 Privacy-First Architecture
• All AI processing happens locally using Chrome's built-in AI APIs (Gemini Nano)
• Your data never leaves your device
• No external servers, no data collection
• Encrypted local storage

⚙️ REQUIREMENTS
• Chrome 138+ on desktop (Windows 10+, macOS 13+, Linux, ChromeOS)
• 22GB+ free storage for Gemini Nano model
• 4GB+ VRAM for AI processing
• Unmetered network connection for initial model download

🎓 PERFECT FOR
• Knowledge workers and professionals
• Students and researchers
• Meeting participants
• Multilingual users
• Privacy-conscious users

Built with Chrome's built-in AI APIs for the Google Chrome Built-in AI Challenge 2025.
```

**Category**: Productivity

**Language**: English

**Privacy Policy**: https://[your-domain]/privacy (or use GitHub Pages URL)

### 4. Permissions Justification

Prepare explanations for each permission:

- **storage**: Save user documents, preferences, and meeting transcripts locally
- **activeTab**: Access current tab for context menu translation feature
- **scripting**: Inject quick translate overlay on webpages
- **sidePanel**: Display IntelliPen Editor and Meeting Dashboard in side panel
- **tabs**: Manage sidepanel opening and tab interactions
- **contextMenus**: Add "Translate with IntelliPen" to right-click menu
- **host_permissions**: Enable translation and editing features on all websites

### 5. Chrome Web Store Developer Dashboard

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click "New Item"
3. Upload `intellipen-v1.0.0.zip`
4. Fill in store listing information
5. Upload screenshots and promotional images
6. Set pricing (Free)
7. Select distribution (Public)
8. Submit for review

### 6. Post-Submission

- Review time: Typically 1-3 business days
- Monitor developer dashboard for review status
- Respond to any review feedback promptly
- Once approved, extension will be live on Chrome Web Store

## Testing Before Submission

### Load Unpacked Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist/` directory
5. Test all features thoroughly

### Test Checklist
- [ ] Extension icon appears in toolbar
- [ ] Popup menu opens and shows API status
- [ ] Sidepanel opens with Editor, Translator, and Meeting screens
- [ ] Grammar checking works in Editor
- [ ] Translation works between multiple languages
- [ ] Meeting recording and transcription works
- [ ] Context menu "Translate with IntelliPen" appears
- [ ] Quick translate overlay works on webpages
- [ ] All Chrome AI APIs are detected correctly

## Version Updates

To release a new version:

1. Update version in `manifest.json` and `package.json`
2. Run `npm run package` to create new ZIP
3. Upload new ZIP to Chrome Web Store Developer Dashboard
4. Update "What's new" section with changelog
5. Submit for review

## Support & Documentation

- **Documentation**: https://[your-domain]/docs
- **GitHub**: https://github.com/intellipen/intellipen-extension
- **Issues**: https://github.com/intellipen/intellipen-extension/issues

## Notes

- Extension uses Chrome's built-in AI APIs (experimental)
- Requires Chrome 138+ with Gemini Nano enabled
- Trial tokens included in manifest for API access
- All processing is local—no external API calls
- Participating in Google Chrome Built-in AI Challenge 2025
