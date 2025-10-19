---
layout: default
title: API Reference
nav_order: 5
---

# API Reference

Complete reference for Chrome Built-in AI APIs used in IntelliPen.

## Table of Contents

- [AIAPIManager](#aiapi manager)
- [Prompt API](#prompt-api)
- [Proofreader API](#proofreader-api)
- [Writer API](#writer-api)
- [Rewriter API](#rewriter-api)
- [Summarizer API](#summarizer-api)
- [Translator API](#translator-api)
- [Language Detector API](#language-detector-api)

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

#### writeStreaming(prompt, options, callback)

Generate content with streaming support.

**Parameters**:
- `prompt` (string): Writing prompt
- `options` (Object): Same as `write()`
- `callback` (Function): Called with each chunk of text

**Returns**: Promise<void>

**Example**:
```javascript
await aiAPIManager.writeStreaming(
  'Write a summary of...',
  { tone: 'professional' },
  (chunk) => {
    console.log('Received:', chunk);
    appendToUI(chunk);
  }
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

#### prompt(text, options)

General-purpose AI interaction.

**Parameters**:
- `text` (string): Prompt text
- `options` (Object):
  - `temperature` (number): 0-1, controls randomness
  - `topK` (number): Number of top tokens to consider
  - `outputLanguage` (string): Preferred output language

**Returns**: Promise<string>
- AI response

**Example**:
```javascript
const response = await aiAPIManager.prompt(
  'Extract action items from this meeting transcript: ...',
  { temperature: 0.3 }
);
```

## Prompt API

General-purpose language model for AI interactions.

### Availability Check

```javascript
if ('LanguageModel' in window) {
  const capabilities = await window.LanguageModel.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const session = await window.LanguageModel.create({
  temperature: 0.7,
  topK: 40,
  outputLanguage: 'en'
});
```

### Options

- `temperature` (number, 0-1): Controls randomness
  - 0: Deterministic, focused
  - 1: Creative, diverse
- `topK` (number): Number of top tokens to consider
- `outputLanguage` (string): Preferred output language

### Making Requests

```javascript
const response = await session.prompt('Your prompt here');
console.log(response);
```

### Streaming Responses

```javascript
const stream = await session.promptStreaming('Your prompt here');

for await (const chunk of stream) {
  console.log('Chunk:', chunk);
}
```

### Use Cases in IntelliPen

- Action item extraction from meetings
- Key decision identification
- Speaker identification
- Custom AI interactions

## Proofreader API

Grammar, spelling, and punctuation correction.

### Availability Check

```javascript
if ('Proofreader' in window) {
  const capabilities = await window.Proofreader.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const proofreader = await window.Proofreader.create({
  expectedInputLanguages: ['en', 'es']
});
```

### Options

- `expectedInputLanguages` (Array<string>): Expected input languages

### Proofreading Text

```javascript
const corrections = await proofreader.proofread('This are a test.');

corrections.forEach(correction => {
  console.log('Original:', correction.original);
  console.log('Suggestion:', correction.suggestion);
  console.log('Explanation:', correction.explanation);
  console.log('Type:', correction.type); // 'grammar', 'spelling', 'punctuation'
});
```

### Correction Object Structure

```javascript
{
  original: string,      // Original text with error
  suggestion: string,    // Suggested correction
  explanation: string,   // Why this is an error
  type: string,         // 'grammar', 'spelling', 'punctuation'
  startIndex: number,   // Start position in text
  endIndex: number      // End position in text
}
```

### Use Cases in IntelliPen

- Real-time grammar checking in editor
- Email proofreading
- Document correction before export

## Writer API

Content generation and writing improvement.

### Availability Check

```javascript
if ('Writer' in window) {
  const capabilities = await window.Writer.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const writer = await window.Writer.create({
  tone: 'professional',
  format: 'plain-text',
  length: 'medium',
  context: 'Business email'
});
```

### Options

- `tone` (string): 'formal', 'casual', 'professional', 'friendly'
- `format` (string): 'plain-text', 'markdown'
- `length` (string): 'short', 'medium', 'long'
- `context` (string): Additional context for generation

### Generating Content

```javascript
const content = await writer.write('Write an email requesting a meeting');
console.log(content);
```

### Streaming Generation

```javascript
const stream = await writer.writeStreaming('Write a summary of...');

for await (const chunk of stream) {
  appendToEditor(chunk);
}
```

### Use Cases in IntelliPen

- Writing improvement suggestions
- Content generation from prompts
- Follow-up email generation
- Document drafting

## Rewriter API

Tone adjustment and style transformation.

### Availability Check

```javascript
if ('Rewriter' in window) {
  const capabilities = await window.Rewriter.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const rewriter = await window.Rewriter.create({
  tone: 'more-formal',
  format: 'plain-text',
  length: 'as-is'
});
```

### Options

- `tone` (string): 'more-formal', 'more-casual', 'as-is'
- `format` (string): 'plain-text', 'markdown'
- `length` (string): 'shorter', 'longer', 'as-is'

### Rewriting Text

```javascript
const rewritten = await rewriter.rewrite('Hey, can you help me?');
// With 'more-formal': "I would appreciate your assistance."
```

### Streaming Rewriting

```javascript
const stream = await rewriter.rewriteStreaming('Your text here');

for await (const chunk of stream) {
  updatePreview(chunk);
}
```

### Tone Examples

**Original**: "Hey, can you help me with this?"

- **more-formal**: "I would appreciate your assistance with this matter."
- **more-casual**: "Could you give me a hand with this?"
- **as-is**: "Could you help me with this?" (minor improvements)

### Use Cases in IntelliPen

- Adjusting email tone
- Making text more professional
- Casual-izing formal content
- Style consistency

## Summarizer API

Text and meeting summarization.

### Availability Check

```javascript
if ('Summarizer' in window) {
  const capabilities = await window.Summarizer.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const summarizer = await window.Summarizer.create({
  type: 'key-points',
  format: 'markdown',
  length: 'medium'
});
```

### Options

- `type` (string): 'tldr', 'key-points', 'teaser', 'headline'
- `format` (string): 'plain-text', 'markdown'
- `length` (string): 'short', 'medium', 'long'

### Summarizing Text

```javascript
const summary = await summarizer.summarize(longText);
console.log(summary);
```

### Streaming Summarization

```javascript
const stream = await summarizer.summarizeStreaming(longText);

for await (const chunk of stream) {
  appendSummary(chunk);
}
```

### Summary Types

- **tldr**: Brief overview, 1-2 sentences
- **key-points**: Bullet points of main ideas
- **teaser**: Engaging preview to encourage reading
- **headline**: Short, attention-grabbing title

### Use Cases in IntelliPen

- Meeting executive summaries
- Document summarization
- Quick content overview
- Email thread summaries

## Translator API

Multi-language translation.

### Availability Check

```javascript
if ('Translator' in window) {
  const capabilities = await window.Translator.capabilities();
  console.log('Available:', capabilities.available);
  console.log('Supported languages:', capabilities.supportedLanguages);
}
```

### Creating a Session

```javascript
const translator = await window.Translator.create({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});
```

### Options

- `sourceLanguage` (string): Source language code
- `targetLanguage` (string): Target language code

### Translating Text

```javascript
const translated = await translator.translate('Hello, world!');
console.log(translated); // "¡Hola, mundo!"
```

### Streaming Translation

```javascript
const stream = await translator.translateStreaming('Long text to translate...');

for await (const chunk of stream) {
  appendTranslation(chunk);
}
```

### Supported Languages

Common language codes:
- `en`: English
- `es`: Spanish
- `fr`: French
- `de`: German
- `it`: Italian
- `pt`: Portuguese
- `ru`: Russian
- `zh`: Chinese (Simplified)
- `zh-TW`: Chinese (Traditional)
- `ja`: Japanese
- `ko`: Korean
- `ar`: Arabic
- `hi`: Hindi
- `nl`: Dutch
- `pl`: Polish
- `tr`: Turkish
- `sv`: Swedish

### Use Cases in IntelliPen

- Real-time translation in translator screen
- Quick translate context menu
- Meeting transcript translation
- Multi-language document support

## Language Detector API

Automatic language detection.

### Availability Check

```javascript
if ('LanguageDetector' in window) {
  const capabilities = await window.LanguageDetector.capabilities();
  console.log('Available:', capabilities.available);
}
```

### Creating a Session

```javascript
const detector = await window.LanguageDetector.create();
```

### Detecting Language

```javascript
const result = await detector.detect('Bonjour le monde');

console.log('Language:', result.detectedLanguage); // 'fr'
console.log('Confidence:', result.confidence);     // 0.95
```

### Result Object

```javascript
{
  detectedLanguage: string,  // ISO language code
  confidence: number         // 0-1, higher is more confident
}
```

### Confidence Levels

- `0.9-1.0`: Very confident
- `0.7-0.9`: Confident
- `0.5-0.7`: Somewhat confident
- `< 0.5`: Low confidence

### Use Cases in IntelliPen

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

### Best Practices

1. **Always check availability first**:
   ```javascript
   const status = await aiAPIManager.checkAvailability('Proofreader');
   if (status !== 'available') {
     showMessage('API not ready');
     return;
   }
   ```

2. **Implement fallbacks**:
   ```javascript
   try {
     return await aiAPIManager.proofread(text);
   } catch (error) {
     return fallbackProofread(text);
   }
   ```

3. **Handle rate limits gracefully**:
   ```javascript
   async function withRetry(apiCall, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await apiCall();
       } catch (error) {
         if (error.name === 'QuotaExceededError' && i < maxRetries - 1) {
           await sleep(1000 * (i + 1)); // Exponential backoff
           continue;
         }
         throw error;
       }
     }
   }
   ```

4. **Validate input**:
   ```javascript
   function validateText(text) {
     if (!text || typeof text !== 'string') {
       throw new Error('Invalid text input');
     }
     if (text.length > 5000) {
       throw new Error('Text too long (max 5000 characters)');
     }
     return text.trim();
   }
   ```

## Performance Tips

### Session Reuse

```javascript
class SessionCache {
  constructor() {
    this.cache = new Map();
  }

  async getSession(apiName, options) {
    const key = `${apiName}-${JSON.stringify(options)}`;
    
    if (!this.cache.has(key)) {
      const session = await this.createSession(apiName, options);
      this.cache.set(key, session);
    }
    
    return this.cache.get(key);
  }
}
```

### Debouncing

```javascript
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const debouncedTranslate = debounce(async (text) => {
  const result = await aiAPIManager.translate(text, 'en', 'es');
  updateUI(result);
}, 500);
```

### Streaming for Long Content

```javascript
// Use streaming for better UX with long content
async function generateLongContent(prompt) {
  let fullContent = '';
  
  await aiAPIManager.writeStreaming(
    prompt,
    { length: 'long' },
    (chunk) => {
      fullContent += chunk;
      updateUI(fullContent); // Progressive rendering
    }
  );
  
  return fullContent;
}
```

---

For usage examples, see the [User Guide](user-guide.md).
For architecture details, see the [Architecture Guide](architecture.md).
