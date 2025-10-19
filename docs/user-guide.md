---
layout: default
title: User Guide
nav_order: 3
---

# IntelliPen User Guide

Complete guide to using all IntelliPen features.

## Table of Contents

- [IntelliPen Editor](#intellipen-editor)
- [Translator](#translator)
- [Meeting Dashboard](#meeting-dashboard)
- [Context Menu Integration](#context-menu-integration)
- [Tips and Best Practices](#tips-and-best-practices)

## IntelliPen Editor

The IntelliPen Editor provides comprehensive AI-powered writing assistance.

### Basic Editing

1. **Creating Documents**:
   - Click "New Document" to start fresh
   - Type or paste text into the editor
   - Auto-save keeps your work safe

2. **Document Management**:
   - "Save Document": Save current content as .txt file
   - "Open Document": Load previously saved documents
   - Auto-save: Content is automatically saved every 30 seconds

3. **Real-time Statistics**:
   - Word count
   - Character count
   - Estimated reading time

### Grammar Checking

Powered by Chrome's Proofreader API:

1. Type or paste text into the editor
2. Click "Check Grammar" button
3. Review detected issues:
   - Spelling errors
   - Grammar mistakes
   - Punctuation problems
4. Each issue includes:
   - Error description
   - Suggested correction
   - Explanation of the rule
5. Click suggestions to apply corrections

**Tips**:
- Grammar check works best with complete sentences
- Review suggestions carefully - AI isn't always perfect
- Use for emails, documents, and professional writing

### Writing Improvement

Powered by Chrome's Writer API:

1. Select text you want to improve (or check entire document)
2. Click "Improve Writing"
3. AI analyzes and suggests improvements for:
   - Clarity and conciseness
   - Readability
   - Professional tone
   - Sentence structure
4. Review suggestions and apply selectively

**Use Cases**:
- Simplifying complex sentences
- Making technical writing more accessible
- Improving email clarity
- Enhancing professional documents

### Tone Adjustment

Powered by Chrome's Rewriter API:

1. Select text to adjust
2. Click "Change Tone"
3. Choose from tone options:
   - **More Formal**: Professional, business-appropriate
   - **More Casual**: Friendly, conversational
   - **As-Is**: Maintain current tone with minor improvements
4. Preview the rewritten text
5. Apply or try different tones

**Examples**:
- Formal: "I would appreciate your assistance with this matter"
- Casual: "Could you help me out with this?"

### Content Generation

Create new content with AI assistance:

1. Click "Generate Content"
2. Enter a prompt describing what you need:
   - "Write an email requesting a meeting"
   - "Create a summary of quarterly results"
   - "Draft a thank you note"
3. AI generates content based on your prompt
4. Edit and refine as needed

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save document
- `Ctrl/Cmd + N`: New document
- `Ctrl/Cmd + O`: Open document
- `Ctrl/Cmd + G`: Check grammar

## Translator

Dedicated translation interface with privacy-first design.

### Basic Translation

1. **Select Languages**:
   - Source language: Choose language or use "Auto-detect"
   - Target language: Select from 25+ supported languages

2. **Enter Text**:
   - Type or paste text (up to 5000 characters)
   - Translation happens automatically as you type
   - Character counter shows remaining space

3. **View Translation**:
   - Translated text appears in real-time
   - Formatting is preserved
   - Copy translated text with one click

### Supported Languages

IntelliPen supports translation between these languages:

- English, Spanish, French, German, Italian
- Portuguese, Russian, Chinese (Simplified/Traditional)
- Japanese, Korean, Arabic, Hindi
- Dutch, Polish, Turkish, Swedish
- And 10+ more languages

### Auto-Detection

Let AI identify the source language:

1. Select "Auto-detect" as source language
2. Type or paste text
3. AI automatically detects the language
4. Translation proceeds automatically

**Best for**:
- Multilingual content
- Unknown language identification
- Quick translations without language selection

### Text-to-Speech

Listen to source and translated text:

1. Click speaker icon next to source text
2. Click speaker icon next to translated text
3. Adjust volume and speed in browser settings
4. Use for pronunciation practice

### Language Swap

Quickly reverse translation direction:

1. Click the swap icon between language selectors
2. Source and target languages switch
3. Text is automatically re-translated
4. Useful for back-translation verification

### Quick Translate (Context Menu)

Translate text on any webpage:

1. Select text on any website
2. Right-click and choose "Translate with IntelliPen"
3. Translation overlay appears instantly
4. Click outside to dismiss

**Privacy Note**: Unlike cloud-based translators, your text never leaves your device.

### Translation Tips

- Keep sentences under 5000 characters for best results
- Use proper punctuation for accurate translation
- Review translations for context-specific accuracy
- Back-translate to verify meaning preservation

## Meeting Dashboard

Record, transcribe, and analyze meetings with AI.

### Setting Up

1. **Grant Permissions**:
   - Allow microphone access when prompted
   - Required for recording functionality

2. **Select Devices**:
   - Choose microphone from dropdown
   - Select speaker for playback
   - Use test buttons to verify

3. **Choose Language**:
   - Select recognition language (15+ supported)
   - Must match the language spoken in meeting
   - Affects transcription accuracy

### Recording a Meeting

1. **Start Recording**:
   - Click "Start Recording" button
   - Red indicator shows recording is active
   - Timer displays recording duration

2. **Live Transcription**:
   - Transcript appears in real-time
   - Timestamps show when each segment was spoken
   - Scroll to review earlier parts

3. **Stop Recording**:
   - Click "Stop Recording" when meeting ends
   - AI analysis begins automatically
   - Wait for analysis to complete (30-60 seconds)

### Meeting Analysis

After recording stops, AI generates:

#### Executive Summary
- High-level overview of meeting
- Key topics discussed
- Main outcomes and conclusions
- Generated using Summarizer API

#### Action Items
- Specific tasks identified
- Assigned owners (when mentioned)
- Deadlines and priorities
- Extracted using Prompt API

#### Key Decisions
- Important decisions made
- Rationale and context
- Stakeholders involved
- Identified using Prompt API

#### Follow-up Email
- Professional email draft
- Meeting summary
- Action items listed
- Ready to send or customize
- Generated using Writer API

### Exporting

Save meeting data for later reference:

1. **Export Transcript**:
   - Click "Export Transcript"
   - Saves as .txt file with timestamps
   - Includes speaker labels (if detected)

2. **Export Analysis**:
   - Click "Export Analysis"
   - Saves summary, action items, decisions
   - Formatted for easy reading

### Advanced Features

#### Speaker Identification

AI attempts to identify different speakers:

- Labels speakers as "Speaker 1", "Speaker 2", etc.
- Based on voice characteristics
- Accuracy improves with distinct voices

#### Language Detection

Automatically detects meeting language:

- Uses Language Detector API
- Helps verify correct recognition language
- Useful for multilingual meetings

#### Transcript Translation

Translate entire transcript to another language:

1. Click "Translate Transcript"
2. Select target language
3. AI translates while preserving structure
4. Export translated version

### Meeting Tips

- Use a quality microphone for best transcription
- Speak clearly and avoid overlapping speech
- Test audio before important meetings
- Review transcript for accuracy
- Edit action items before sharing

## Context Menu Integration

Access IntelliPen features from any webpage.

### Edit with IntelliPen

1. Select text on any webpage
2. Right-click and choose "Edit with IntelliPen"
3. Sidepanel opens with text in editor
4. Use all editor features (grammar, improve, tone)
5. Copy improved text back to webpage

**Use Cases**:
- Improving email drafts in Gmail
- Editing social media posts
- Refining document text
- Checking grammar in forms

### Translate with IntelliPen

1. Select text on any webpage
2. Right-click and choose "Translate with IntelliPen"
3. Translation overlay appears instantly
4. View translation without leaving page
5. Click outside to dismiss

**Use Cases**:
- Reading foreign language websites
- Translating social media posts
- Understanding product descriptions
- Learning new languages

## Tips and Best Practices

### Writing Tips

- **Be Specific**: Provide context for better AI suggestions
- **Review Carefully**: AI suggestions aren't always perfect
- **Iterate**: Use multiple AI features in sequence
- **Save Often**: Use auto-save and manual saves
- **Experiment**: Try different tones and styles

### Translation Tips

- **Context Matters**: Provide full sentences for accuracy
- **Verify Important**: Back-translate critical content
- **Use Auto-detect**: When unsure of source language
- **Check Idioms**: Idioms may not translate literally
- **Privacy First**: Your text never leaves your device

### Meeting Tips

- **Test First**: Always test audio before important meetings
- **Good Microphone**: Quality input improves transcription
- **Clear Speech**: Speak clearly and avoid overlapping
- **Review Transcript**: Check for accuracy after recording
- **Edit Analysis**: Refine AI-generated action items

### Privacy Tips

- **Local Processing**: All AI runs on your device
- **No Cloud Sync**: Data stays on your computer
- **Encrypted Storage**: Local data is encrypted
- **Clear Data**: Delete old documents and transcripts
- **Permissions**: Only grant necessary permissions

### Performance Tips

- **Close Unused Tabs**: Free up system resources
- **Sufficient Storage**: Keep 22+ GB free for AI model
- **GPU Acceleration**: Ensure GPU is available
- **Update Chrome**: Use latest version for best performance
- **Restart Periodically**: Restart Chrome if performance degrades

## Keyboard Shortcuts

### Editor
- `Ctrl/Cmd + S`: Save document
- `Ctrl/Cmd + N`: New document
- `Ctrl/Cmd + O`: Open document
- `Ctrl/Cmd + G`: Check grammar

### Global
- `Alt + I`: Open IntelliPen sidepanel (configurable)
- `Esc`: Close overlays and popups

Configure custom shortcuts in `chrome://extensions/shortcuts`.

## Troubleshooting

### Common Issues

**Grammar check not working**:
- Ensure Proofreader API is available (check popup)
- Verify text is in a supported language
- Try with shorter text segments

**Translation fails**:
- Check character limit (5000 max)
- Verify languages are different
- Ensure Translator API is available

**Meeting recording silent**:
- Check microphone permissions
- Verify correct microphone selected
- Test microphone with test button
- Check system audio settings

**Slow performance**:
- Close unnecessary Chrome tabs
- Ensure sufficient free storage
- Verify GPU is available
- Restart Chrome

### Getting Help

- Check [GitHub Issues](https://github.com/vietanhdev/IntelliPen/issues)
- Join [GitHub Discussions](https://github.com/vietanhdev/IntelliPen/discussions)
- Review [Architecture](architecture.md) for technical details

---

Need technical details? Check out the [Architecture Guide](architecture.md).
