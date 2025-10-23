---
title: "Architecture"
linkTitle: "Architecture"
weight: 3
description: >
  Technical architecture and design decisions for IntelliPen
---

Technical architecture and design decisions for IntelliPen.

## Overview

IntelliPen is a Chrome Extension built on Manifest V3 that leverages Chrome's built-in AI APIs (Gemini Nano) for local AI processing. The architecture prioritizes privacy, performance, and user experience.

### Design Principles

1. **Privacy-First**: All AI processing happens locally on the user's device
2. **Modular Design**: Reusable components and clear separation of concerns
3. **Progressive Enhancement**: Graceful degradation when APIs are unavailable
4. **Performance**: Efficient resource usage and streaming support
5. **User Experience**: Intuitive interface with real-time feedback

## Extension Architecture

### Manifest V3 Structure

IntelliPen follows Chrome Extension Manifest V3 standards:

```
IntelliPen/
├── manifest.json              # Extension configuration
├── background.js              # Service worker (background script)
├── content-scripts/           # Scripts injected into web pages
├── popup/                     # Extension popup UI
├── sidepanel/                 # Main application UI
├── src/                       # Core modules and features
├── styles/                    # Shared CSS
├── images/                    # Extension icons
└── dist/                      # Build output
```

### Key Architectural Components

```
┌─────────────────────────────────────────────────────────┐
│                     Chrome Browser                       │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐   ┌────────────┐ │
│  │   Popup UI   │    │  Sidepanel   │   │  Content   │ │
│  │   (menu)     │    │  (main app)  │   │  Scripts   │ │
│  └──────┬───────┘    └──────┬───────┘   └─────┬──────┘ │
│         │                   │                  │         │
│         └───────────────────┼──────────────────┘         │
│                             │                            │
│                    ┌────────▼────────┐                   │
│                    │  Service Worker │                   │
│                    │  (background.js)│                   │
│                    └────────┬────────┘                   │
│                             │                            │
│         ┌───────────────────┼───────────────────┐       │
│         │                   │                   │        │
│  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼─────┐ │
│  │ AIAPIManager│   │  Chrome Storage │  │  Context   │ │
│  │             │   │                 │  │   Menus    │ │
│  └──────┬──────┘   └─────────────────┘  └────────────┘ │
│         │                                                │
│  ┌──────▼──────────────────────────────────────────┐   │
│  │         Chrome Built-in AI APIs                  │   │
│  │  (Gemini Nano - Local Processing)               │   │
│  │                                                   │   │
│  │  • Prompt API      • Proofreader API            │   │
│  │  • Writer API      • Rewriter API               │   │
│  │  • Summarizer API  • Translator API             │   │
│  │  • Language Detector API                        │   │
│  └───────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Service Worker (background.js)

The service worker manages extension lifecycle and coordinates between components.

**Responsibilities**:
- Extension installation and updates
- Context menu creation and handling
- Message routing between components
- API availability monitoring
- Sidepanel management

### 2. AIAPIManager

Centralized management for all Chrome built-in AI APIs.

**Location**: `src/ai-apis/AIAPIManager.js`

**Responsibilities**:
- API availability checking
- Session creation and management
- Streaming support
- Error handling and recovery
- Fallback mechanisms

### 3. EditorAIFeatures

AI-powered writing assistance for the editor.

**Location**: `src/editor/EditorAIFeatures.js`

**Features**:
- Grammar checking with Proofreader API
- Writing improvement with Writer API
- Tone adjustment with Rewriter API
- Content generation with Prompt API
- Real-time statistics

### 4. MeetingAIFeatures

Meeting recording, transcription, and analysis.

**Location**: `src/meeting/MeetingAIFeatures.js`

**Features**:
- Audio recording with Web Speech API
- Live transcription
- Speaker identification with Prompt API
- Meeting summarization with Summarizer API
- Action item extraction with Prompt API
- Follow-up email generation with Writer API

### 5. UI Components

Reusable UI components for consistent design.

**Location**: `src/components/ui-components.js`

**Components**:
- Buttons (primary, secondary, icon)
- Badges (status indicators)
- Cards (content containers)
- Toggles (switches)
- Toasts (notifications)
- Context menus
- Loading spinners

## Data Flow

### Editor Workflow

```
User Input → Editor → AIAPIManager → Chrome AI API → Response
                ↓                                        ↓
         Auto-save to                            Display Result
         Chrome Storage                          Update UI
```

### Translation Workflow

```
User Input → Translator UI → Language Detector API → Detect Language
                ↓                                           ↓
         Translator API ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
                ↓
         Display Translation
         Text-to-Speech (optional)
```

### Meeting Workflow

```
Audio Input → Web Speech API → Live Transcript → Display
                                      ↓
                              Store in Memory
                                      ↓
                          Stop Recording Trigger
                                      ↓
                    ┌─────────────────┴─────────────────┐
                    ↓                 ↓                 ↓
            Summarizer API    Prompt API         Writer API
                    ↓                 ↓                 ↓
              Summary         Action Items      Follow-up Email
                    └─────────────────┬─────────────────┘
                                      ↓
                              Display Analysis
                              Export Options
```

## Chrome AI APIs Integration

### API Availability Checking

All APIs are checked for availability before use. The system gracefully handles unavailable APIs with fallback mechanisms.

### Session Management

Sessions are cached and reused when possible to improve performance and reduce resource usage.

### Streaming Support

Long-running operations use streaming to provide progressive feedback to users.

### Error Handling

Comprehensive error handling ensures graceful degradation when APIs fail or are unavailable.

## Build System

### Rollup Configuration

IntelliPen uses Rollup for bundling with the following plugins:

- **resolve**: Resolve node_modules
- **commonjs**: Convert CommonJS to ES modules
- **terser**: Minify for production
- **copy**: Copy static assets

### Build Process

```bash
# Development build with source maps
npm run dev

# Production build with minification
npm run build

# Watch mode for development
npm run build:watch

# Clean build directory
npm run clean
```

## Security and Privacy

### Privacy Architecture

1. **Local Processing**: All AI operations use Chrome's built-in APIs
2. **Encrypted Storage**: Local data is encrypted with industry-standard encryption
3. **Minimal Permissions**: Only request necessary permissions
4. **Transparent Operations**: Privacy indicators show local processing status

### Security Best Practices

1. **Content Security Policy**: Strict CSP for extension pages
2. **Input Sanitization**: All user input is sanitized using DOMPurify
3. **Message Validation**: All messages are validated before processing

## Performance Optimization

### Resource Management

1. **Session Caching**: Reuse AI API sessions when possible
2. **Lazy Loading**: Load modules only when needed
3. **Debouncing**: Limit API calls during typing
4. **Streaming**: Progressive rendering for long responses

### Memory Management

Implement LRU cache for sessions with automatic cleanup of old sessions.
