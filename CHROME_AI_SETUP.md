# Chrome AI APIs Setup Guide

This guide will help you get Chrome's built-in AI APIs working for the IntelliPen extension.

## ✅ Status: Manifest Fixed

The manifest.json has been updated with the required permissions for Chrome AI APIs. Follow the steps below to complete the setup.

## 📋 Prerequisites Check

### 1. Chrome Version Requirements
- **Required**: Chrome 138+ (stable channel)
- **Check your version**: Go to `chrome://version/`
- **Update if needed**: Go to `chrome://settings/help`

### 2. Hardware Requirements
- **Operating System**: Windows 10+, macOS 13+, Linux, or ChromeOS (Chromebook Plus)
- **Storage**: At least 22GB free space for Gemini Nano model
- **GPU**: 4+ GB VRAM for AI processing
- **Network**: Unmetered connection for initial model download

### 3. Check Current Status
- Visit `chrome://on-device-internals` to see model download status
- Run the diagnostic tool: Open `chrome-ai-diagnostic.html` in Chrome

## 🔧 Step-by-Step Setup

### Step 1: Enable Chrome Flags

Some APIs require experimental flags to be enabled. Go to the following URLs and set them to **Enabled**:

```
chrome://flags/#prompt-api-for-gemini-nano
chrome://flags/#writer-api-for-gemini-nano
chrome://flags/#rewriter-api-for-gemini-nano
chrome://flags/#proofreader-api-for-gemini-nano
chrome://flags/#summarizer-api-for-gemini-nano
chrome://flags/#translator-api-for-gemini-nano
```

**After enabling flags, restart Chrome completely.**

### Step 2: Origin Trial Registration (if needed)

Some APIs are in origin trial. If you need origin trial tokens:

1. Visit the Chrome Origin Trials page
2. Register for the relevant APIs:
   - Writer API Origin Trial
   - Rewriter API Origin Trial
   - Proofreader API Origin Trial

3. Add tokens to your extension's `manifest.json`:
```json
{
  "trial_tokens": [
    "YOUR_WRITER_API_TOKEN",
    "YOUR_REWRITER_API_TOKEN",
    "YOUR_PROOFREADER_API_TOKEN"
  ]
}
```

### Step 3: Trigger Model Download

The Gemini Nano model needs to be downloaded before APIs work:

1. **Automatic Download**: APIs will trigger download on first use
2. **Manual Check**: Visit `chrome://on-device-internals`
3. **Force Download**: Use the diagnostic tool's "Download Models" button

**Note**: Model download requires:
- 22GB+ free storage space
- Unmetered network connection
- May take 30+ minutes depending on connection speed

### Step 4: Verify Setup

1. Open `chrome-ai-diagnostic.html` in Chrome
2. Click "Check API Availability"
3. All APIs should show as "Available" or "Downloadable"
4. Click "Download Models" if any show as "Downloadable"
5. Click "Test APIs" to verify functionality

## 🐛 Troubleshooting

### APIs Still Show as Unavailable

1. **Check Chrome Version**: Must be 138+
2. **Restart Chrome**: After enabling flags
3. **Check Storage**: Need 22GB+ free space
4. **Check Platform**: Desktop only (no mobile)
5. **Check Network**: Must be unmetered

### Model Download Issues

1. **Storage Space**: Ensure 22GB+ free space
2. **Network**: Use Wi-Fi, not cellular
3. **Time**: Download can take 30+ minutes
4. **Check Status**: Visit `chrome://on-device-internals`

### Extension Context Issues

✅ **FIXED**: The manifest.json has been updated with the required permissions:

```json
{
  "permissions": [
    "storage",
    "activeTab", 
    "scripting",
    "sidePanel",
    "tabs",
    "aiLanguageModelOriginTrial",
    "aiSummarizerOriginTrial", 
    "aiWriterOriginTrial",
    "aiRewriterOriginTrial",
    "aiProofreaderOriginTrial",
    "aiTranslatorOriginTrial"
  ]
}
```

If you still have issues:
1. **Reload Extension**: Go to chrome://extensions/ and reload the extension
2. **Origin Trial Tokens**: Tokens are included in manifest
3. **Content Security Policy**: May need updates for AI APIs

## 🔍 Diagnostic Commands

### Check API Availability in Console
```javascript
// Check if APIs exist
console.log('Prompt API:', !!window.ai?.languageModel);
console.log('Summarizer API:', !!window.ai?.summarizer);
console.log('Writer API:', !!window.ai?.writer);
console.log('Rewriter API:', !!window.ai?.rewriter);
console.log('Proofreader API:', !!window.ai?.proofreader);
console.log('Translator API:', !!window.ai?.translator);

// Check availability status
if (window.ai?.languageModel) {
  window.ai.languageModel.availability().then(console.log);
}
```

### Test Basic Functionality
```javascript
// Test Prompt API
async function testPromptAPI() {
  try {
    const session = await window.ai.languageModel.create();
    const result = await session.prompt('Say hello');
    console.log('Prompt API works:', result);
    session.destroy();
  } catch (error) {
    console.error('Prompt API failed:', error);
  }
}

testPromptAPI();
```

## 📚 Additional Resources

- **Chrome AI APIs Documentation**: [Chrome for Developers](https://developer.chrome.com/docs/ai/)
- **Origin Trials**: [Chrome Origin Trials](https://developer.chrome.com/origintrials/)
- **Model Status**: `chrome://on-device-internals`
- **Chrome Flags**: `chrome://flags/`

## 🆘 Getting Help

If you're still having issues:

1. **Run Diagnostic**: Use `chrome-ai-diagnostic.html`
2. **Check Console**: Look for error messages
3. **Verify Requirements**: All hardware/software requirements met
4. **Community**: Chrome AI APIs are experimental - check Chrome DevRel channels

## 📝 Notes

- **Experimental APIs**: These APIs are still in development
- **Hardware Dependent**: Requires significant local resources
- **Privacy First**: All processing happens locally
- **No Fallback**: If APIs unavailable, features won't work

---

**Next Steps**: After following this guide, the Chrome AI APIs should be available and the IntelliPen extension should work properly.