---
title: "Privacy Policy"
linkTitle: "Privacy"
weight: 7
description: >
  IntelliPen's privacy policy and data handling practices
---

Last Updated: October 19, 2025

## Overview

IntelliPen is built with privacy as a core principle. This privacy policy explains how IntelliPen handles your data and protects your privacy.

## Our Privacy Commitment

**IntelliPen processes all data locally on your device. We do not collect, store, or transmit your personal data to external servers.**

## Data Processing

### Local Processing Only

All AI operations in IntelliPen use Chrome's built-in AI APIs (Gemini Nano), which run entirely on your device:

- **Grammar checking**: Processed locally
- **Writing improvement**: Processed locally
- **Translation**: Processed locally
- **Meeting transcription**: Processed locally
- **Meeting analysis**: Processed locally

**Your text, documents, translations, and meeting transcripts never leave your device.**

### What We Don't Collect

IntelliPen does NOT collect:

- ❌ Personal information (name, email, etc.)
- ❌ Text you write or edit
- ❌ Documents you create
- ❌ Translations you perform
- ❌ Meeting transcripts or recordings
- ❌ Audio recordings
- ❌ Usage analytics
- ❌ Browsing history
- ❌ IP addresses
- ❌ Device identifiers

### What We Store Locally

IntelliPen stores the following data on your device only:

- ✅ **User preferences**: Language settings, UI preferences
- ✅ **Saved documents**: Documents you explicitly save
- ✅ **Auto-saved content**: Editor content (auto-save feature)
- ✅ **Meeting transcripts**: Transcripts you choose to save

**All local data is encrypted using industry-standard encryption.**

## Data Storage

### Chrome Storage API

IntelliPen uses Chrome's Storage API to store data locally.

### Encryption

All sensitive data stored locally is encrypted:

- **Algorithm**: AES-GCM (256-bit)
- **Key Management**: Keys stored securely in Chrome's storage
- **Scope**: All user content is encrypted at rest

### Data Deletion

You can delete your data at any time:

1. **Clear editor content**: Click "New Document" in editor
2. **Delete saved documents**: Remove files from your downloads
3. **Clear preferences**: Reset settings in extension options
4. **Complete removal**: Uninstall the extension

## Permissions

### Required Permissions

IntelliPen requests only necessary permissions:

#### Storage
- **Purpose**: Save preferences and documents locally
- **Scope**: Extension storage only
- **Data**: Preferences, saved content

#### Active Tab
- **Purpose**: Context menu integration (translate/edit selected text)
- **Scope**: Only when you explicitly use context menu
- **Data**: Selected text only when you choose to translate/edit

#### Microphone (Optional)
- **Purpose**: Meeting recording and transcription
- **Scope**: Only when you start recording
- **Data**: Audio processed locally, not transmitted
- **Control**: You can revoke at any time in Chrome settings

## Third-Party Services

### Chrome Built-in AI APIs

IntelliPen uses Chrome's built-in AI APIs:

- **Provider**: Google Chrome (Gemini Nano)
- **Processing**: Entirely local on your device
- **Data Transmission**: None - all processing is offline
- **Privacy**: Subject to Chrome's privacy policy for local AI processing

**Important**: The Gemini Nano model runs completely offline on your device. No data is sent to Google servers.

### No External Services

IntelliPen does NOT use:

- ❌ External AI APIs (OpenAI, Anthropic, etc.)
- ❌ Analytics services (Google Analytics, etc.)
- ❌ Crash reporting services
- ❌ Cloud storage services
- ❌ Advertising networks
- ❌ Social media integrations

## Data Security

### Security Measures

1. **Local Processing**: All AI operations on-device
2. **Encryption**: AES-GCM encryption for stored data
3. **No Network Transmission**: No data sent to external servers
4. **Secure Storage**: Chrome's secure storage APIs
5. **Content Security Policy**: Strict CSP to prevent XSS attacks
6. **Input Sanitization**: All user input is sanitized

## Your Rights

### Data Control

You have complete control over your data:

- **Access**: View all stored data in Chrome DevTools
- **Modify**: Edit or update your preferences
- **Delete**: Remove data at any time
- **Export**: Save documents and transcripts locally

## Compliance

### GDPR Compliance

IntelliPen complies with GDPR principles:

- **Data Minimization**: We collect no personal data
- **Purpose Limitation**: Local processing only
- **Storage Limitation**: User-controlled retention
- **Integrity and Confidentiality**: Encrypted storage
- **Accountability**: Open source and auditable

### CCPA Compliance

IntelliPen complies with CCPA:

- **No Sale of Data**: We don't collect or sell data
- **No Sharing**: No data shared with third parties
- **User Control**: Complete control over local data

## Contact

### Privacy Questions

For privacy-related questions:

- **GitHub Issues**: [Report privacy concerns](https://github.com/vietanhdev/IntelliPen/issues)
- **GitHub Discussions**: [Ask privacy questions](https://github.com/vietanhdev/IntelliPen/discussions)

## Summary

**IntelliPen's Privacy Promise**:

✅ All processing happens locally on your device  
✅ No data collection or transmission  
✅ No external AI services  
✅ Encrypted local storage  
✅ Complete user control  
✅ Open source and auditable  
✅ Minimal permissions  
✅ Privacy by design  

**Your data is yours. It stays on your device. Always.**
