---
title: "Changelog"
linkTitle: "Changelog"
weight: 8
description: >
  Version history and release notes for IntelliPen
---

All notable changes to IntelliPen will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned Features
- Universal text field detection for inline writing assistance
- Real-time grammar overlay on web pages
- Platform-specific adapters (Gmail, LinkedIn, Notion, Google Docs)
- Advanced speaker diarization for meetings
- Meeting templates and presets
- Collaborative editing features
- Cloud sync (optional, privacy-preserving)
- Advanced analytics dashboard
- Custom AI prompts and templates
- Keyboard shortcuts customization
- Dark mode support
- Multi-language UI

## [1.0.0] - 2025-01-XX (Target)

### Added - Initial Release

#### Core Features
- Chrome extension foundation (Manifest V3)
- Service worker for extension lifecycle management
- Dual-screen interface (Editor + Translator + Meeting Dashboard)
- Complete Chrome AI API integration (7 APIs)
- Privacy-first architecture with local processing

#### IntelliPen Editor
- Rich-text editor with AI-powered writing assistance
- Grammar checking using Proofreader API
- Writing improvement using Writer API
- Tone adjustment using Rewriter API
- Content generation using Prompt API
- Document management (new, open, save)
- Auto-save functionality
- Real-time statistics

#### Translator
- Multi-language translation (25+ languages)
- Auto-detection using Language Detector API
- Real-time translation
- Text-to-speech
- Context menu integration

#### Meeting Dashboard
- Audio recording with microphone management
- Live transcription using Web Speech API
- AI-powered meeting analysis
- Action item extraction
- Follow-up email generation

#### Documentation
- Hugo-based documentation site with Docsy theme
- Complete user guide
- Architecture documentation
- API reference
- Contributing guidelines

### Technical Details

#### Chrome AI APIs Integrated
- ✅ Prompt API (LanguageModel)
- ✅ Proofreader API
- ✅ Writer API
- ✅ Rewriter API
- ✅ Summarizer API
- ✅ Translator API
- ✅ Language Detector API

#### System Requirements
- Chrome 138+ (stable channel)
- Windows 10+, macOS 13+, Linux, or ChromeOS
- 22+ GB free storage for Gemini Nano model
- 4+ GB VRAM for AI processing

---

For the latest updates, visit the [GitHub repository](https://github.com/vietanhdev/IntelliPen).
