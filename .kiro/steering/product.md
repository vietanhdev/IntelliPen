# Product Overview

IntelliPen is an intelligent Chrome extension that provides AI-powered writing assistance and meeting intelligence. Built on Chrome's built-in AI APIs (Gemini Nano), it offers a dual-screen interface with an IntelliPen Editor for writing tasks, a Translator for multi-language support, and a Meeting Dashboard for audio recording and analysis.

## Core Features

### IntelliPen Editor
- **Grammar Checking**: Real-time grammar, spelling, and punctuation correction using Proofreader API
- **Writing Improvement**: AI-powered content enhancement for clarity and readability using Writer API
- **Tone Adjustment**: Transform text tone (formal, casual, professional, friendly) using Rewriter API
- **Document Management**: New, open, save documents with auto-save functionality
- **Real-time Stats**: Word count, character count, and reading time tracking

### Translator
- **Multi-language Support**: Translate between 25+ languages using Translator API
- **Auto-detection**: Automatic source language identification using Language Detector API
- **Real-time Translation**: Instant translation as you type
- **Text-to-Speech**: Listen to source and translated text
- **Context Menu Integration**: Right-click to translate selected text on any webpage

### Meeting Dashboard
- **Audio Recording**: Professional recording with microphone permission management
- **Device Selection**: Choose microphone and speaker with test functionality
- **Language Selection**: Support for 15+ recognition languages
- **Live Transcription**: Real-time transcript display using Web Speech API
- **AI Analysis**: Executive summaries, action items, key decisions, and follow-up emails
- **Export Options**: Save transcripts and analysis as text files

### Modern UI
- **Icon System**: Consistent SVG icon library with 20+ icons and gradient support
- **Reusable Components**: Buttons, badges, cards, toggles, toasts, and context menus
- **Responsive Design**: Optimized for sidepanel and popup interfaces

### Privacy-First Architecture
- **Local Processing**: All AI processing happens locally using Chrome's built-in AI APIs (Gemini Nano)
- **No External Servers**: Your data never leaves your device
- **Encrypted Storage**: Local data is encrypted and stored securely
- **Transparent Privacy**: Clear indicators showing local processing status

## Target Users

- Knowledge workers and professionals who need writing assistance
- Meeting participants who need automatic transcription and analysis
- Students and anyone who writes or attends meetings regularly
- Privacy-conscious users who want AI-powered productivity tools without data sharing
- Multilingual users who need quick translation capabilities

## Technical Foundation

IntelliPen leverages Chrome's built-in AI APIs:
- **Prompt API** (LanguageModel): General AI interactions, action items, decisions
- **Proofreader API**: Grammar, spelling, and punctuation correction
- **Writer API**: Content generation and writing improvement
- **Rewriter API**: Tone adjustment and style transformation
- **Summarizer API**: Meeting summaries and text summarization
- **Translator API**: Multi-language translation
- **Language Detector API**: Automatic language detection

All processing happens client-side with Chrome 138+ requirements (22GB storage, 4GB+ VRAM, desktop platforms).