---
title: "API Reference"
linkTitle: "API Reference"
weight: 4
description: >
  Complete reference for Chrome Built-in AI APIs used in IntelliPen
---

Complete reference for Chrome Built-in AI APIs used in IntelliPen.

## AIAPIManager

Centralized manager for all Chrome built-in AI APIs.

### Constructor

```javascript
const aiAPIManager = new AIAPIManager();
```

### Methods

#### checkAvailability(apiName)

Check if an API is available.

**Parameters**:
- `apiName` (string): Name of the API ('LanguageModel', 'Proofreader', etc.)

**Returns**: Promise<string>
- `'available'`: API is ready to use
- `'downloading'`: Model is being downloaded
- `'unavailable'`: API is not available

**Example**:
```javascript
const status = await aiAPIManager.checkAvailability('Proofreader');
if (status === 'available') {
  // Use the API
}
```

#### proofread(text)

Check grammar, spelling, and punctuation.

**Parameters**:
- `text` (string): Text to proofread

**Returns**: Promise<Array<Object>>
- Array of correction suggestions

**Example**:
```javascript
const corrections = await aiAPIManager.proofread('This are a test.');
// Returns: [{ original: 'are', suggestion: 'is', explanation: '...' }]
```

#### write(prompt, options)

Generate or improve content.

**Parameters**:
- `prompt` (string): Writing prompt or instruction
- `options` (Object):
  - `tone` (string): 'formal', 'casual', 'professional', 'friendly'
  - `format` (string): 'plain-text', 'markdown'
  - `length` (string): 'short', 'medium', 'long'
  - `context` (string): Additional context for generation

**Returns**: Promise<string>
- Generated or improved text

**Example**:
```javascript
const improved = await aiAPIManager.write(
  'Improve this: The meeting was good.',
  { tone: 'professional', length: 'medium' }
);
```

#### rewrite(text, options)

Rewrite text with different tone or style.

**Parameters**:
- `text` (string): Text to rewrite
- `options` (Object):
  - `tone` (string): 'more-formal', 'more-casual', 'as-is'
  - `format` (string): 'plain-text', 'markdown'
  - `length` (string): 'shorter', 'longer', 'as-is'

**Returns**: Promise<string>
- Rewritten text

**Example**:
```javascript
const formal = await aiAPIManager.rewrite(
  'Hey, can you help me?',
  { tone: 'more-formal' }
);
// Returns: "I would appreciate your assistance."
```

#### summarize(text, options)

Summarize text or meetings.

**Parameters**:
- `text` (string): Text to summarize
- `options` (Object):
  - `type` (string): 'tldr', 'key-points', 'teaser', 'headline'
  - `format` (string): 'plain-text', 'markdown'
  - `length` (string): 'short', 'medium', 'long'

**Returns**: Promise<string>
- Summary text

**Example**:
```javascript
const summary = await aiAPIManager.summarize(
  longTranscript,
  { type: 'key-points', length: 'medium' }
);
```

#### translate(text, sourceLang, targetLang)

Translate text between languages.

**Parameters**:
- `text` (string): Text to translate
- `sourceLang` (string): Source language code ('en', 'es', 'fr', etc.)
- `targetLang` (string): Target language code

**Returns**: Promise<string>
- Translated text

**Example**:
```javascript
const translated = await aiAPIManager.translate(
  'Hello, world!',
  'en',
  'es'
);
// Returns: "¡Hola, mundo!"
```

#### detectLanguage(text)

Detect the language of text.

**Parameters**:
- `text` (string): Text to analyze

**Returns**: Promise<Object>
- `detectedLanguage` (string): Language code
- `confidence` (number): Confidence score (0-1)

**Example**:
```javascript
const result = await aiAPIManager.detectLanguage('Bonjour le monde');
// Returns: { detectedLanguage: 'fr', confidence: 0.95 }
```

## Chrome AI APIs

### Prompt API

General-purpose language model for AI interactions.

**Use Cases in IntelliPen**:
- Action item extraction from meetings
- Key decision identification
- Speaker identification
- Custom AI interactions

### Proofreader API

Grammar, spelling, and punctuation correction.

**Use Cases in IntelliPen**:
- Real-time grammar checking in editor
- Email proofreading
- Document correction before export

### Writer API

Content generation and writing improvement.

**Use Cases in IntelliPen**:
- Writing improvement suggestions
- Content generation from prompts
- Follow-up email generation
- Document drafting

### Rewriter API

Tone adjustment and style transformation.

**Use Cases in IntelliPen**:
- Adjusting email tone
- Making text more professional
- Casual-izing formal content
- Style consistency

### Summarizer API

Text and meeting summarization.

**Use Cases in IntelliPen**:
- Meeting executive summaries
- Document summarization
- Quick content overview
- Email thread summaries

### Translator API

Multi-language translation.

**Supported Languages**:
- English, Spanish, French, German, Italian
- Portuguese, Russian, Chinese (Simplified/Traditional)
- Japanese, Korean, Arabic, Hindi
- Dutch, Polish, Turkish, Swedish
- And 10+ more languages

**Use Cases in IntelliPen**:
- Real-time translation in translator screen
- Quick translate context menu
- Meeting transcript translation
- Multi-language document support

### Language Detector API

Automatic language detection.

**Use Cases in IntelliPen**:
- Auto-detect source language in translator
- Meeting language identification
- Multi-language content detection
- Language-specific feature activation

## Error Handling

### Common Errors

```javascript
try {
  const result = await aiAPIManager.proofread(text);
} catch (error) {
  if (error.name === 'NotAvailableError') {
    console.log('API not available');
  } else if (error.name === 'QuotaExceededError') {
    console.log('Rate limit exceeded');
  } else if (error.name === 'InvalidArgumentError') {
    console.log('Invalid input');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Error Types

- `NotAvailableError`: API is not available (model not downloaded)
- `QuotaExceededError`: Rate limit or quota exceeded
- `InvalidArgumentError`: Invalid parameters provided
- `NetworkError`: Network connectivity issue
- `TimeoutError`: Request timed out

## Performance Tips

### Session Reuse

Reuse API sessions when possible to improve performance.

### Debouncing

Debounce API calls during typing to reduce unnecessary requests.

### Streaming for Long Content

Use streaming for better UX with long content generation.
