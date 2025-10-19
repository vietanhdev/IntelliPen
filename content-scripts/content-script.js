/**
 * IntelliPen Content Script
 * Handles Quick Translate feature and Chrome AI API detection
 */

class IntelliPenContentScript {
  constructor() {
    this.isInitialized = false;
    this.quickTranslateLoaded = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('IntelliPen: Initializing content script...');

    try {
      // Check Chrome AI API availability
      await this.checkChromeAIAPIs();

      // Set up message listeners
      this.setupMessageListeners();

      this.isInitialized = true;
      console.log('IntelliPen: Content script initialized');

    } catch (error) {
      console.error('IntelliPen: Failed to initialize content script:', error);
    }
  }

  async checkChromeAIAPIs() {
    console.log('IntelliPen: Checking Chrome AI API availability...');

    const apis = [
      { name: 'Language Model', object: 'LanguageModel', key: 'ai.languageModel' },
      { name: 'Summarizer', object: 'Summarizer', key: 'ai.summarizer' },
      { name: 'Writer', object: 'Writer', key: 'ai.writer' },
      { name: 'Rewriter', object: 'Rewriter', key: 'ai.rewriter' },
      { name: 'Proofreader', object: 'Proofreader', key: 'ai.proofreader' },
      { name: 'Translator', object: 'Translator', key: 'ai.translator' },
      { name: 'Language Detector', object: 'LanguageDetector', key: 'ai.languageDetector' }
    ];

    const availability = {};

    for (const api of apis) {
      try {
        if (api.object in window) {
          const apiObject = window[api.object];

          if (typeof apiObject.availability === 'function') {
            try {
              let status;

              if (api.object === 'LanguageModel') {
                status = await apiObject.availability({ outputLanguage: 'en' });
              } else if (api.object === 'Translator') {
                status = await apiObject.availability({
                  sourceLanguage: 'en',
                  targetLanguage: 'es'
                });
              } else {
                status = await apiObject.availability();
              }

              availability[api.key] = status;
              console.log(`IntelliPen: ${api.name} - ${status}`);
            } catch (error) {
              availability[api.key] = 'unavailable';
              console.warn(`IntelliPen: ${api.name} - availability check failed:`, error.message);
            }
          } else if (typeof apiObject.create === 'function') {
            availability[api.key] = 'available';
            console.log(`IntelliPen: ${api.name} - available (no availability check)`);
          } else {
            availability[api.key] = 'unavailable';
            console.warn(`IntelliPen: ${api.name} - incomplete API`);
          }
        } else {
          availability[api.key] = 'unavailable';
          console.warn(`IntelliPen: ${api.name} - not found in window`);
        }
      } catch (error) {
        availability[api.key] = 'unavailable';
        console.warn(`IntelliPen: ${api.name} - error:`, error.message);
      }
    }

    // Send availability info to background script
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_API_AVAILABILITY',
        data: availability
      });
    } catch (error) {
      console.warn('IntelliPen: Failed to update API availability in background:', error);
    }

    return availability;
  }

  setupMessageListeners() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async responses
    });
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'CHECK_CHROME_AI_APIS':
        try {
          await this.checkChromeAIAPIs();
          sendResponse({ success: true });
        } catch (error) {
          console.error('Failed to check Chrome AI APIs:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;

      case 'QUICK_TRANSLATE':
        try {
          await this.handleQuickTranslate(message.data);
          sendResponse({ success: true });
        } catch (error) {
          console.error('Quick translate failed:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  async handleQuickTranslate(data) {
    console.log('IntelliPen: Quick translating:', data.text.substring(0, 50) + '...');

    try {
      // Load quick translate overlay if not already loaded
      await this.loadQuickTranslateOverlay();

      // Check if Translator API is available
      if (!('Translator' in self)) {
        throw new Error('Translator API not available');
      }

      // Detect source language if auto
      let sourceLanguage = data.fromLang;
      if (sourceLanguage === 'auto' && 'LanguageDetector' in self) {
        try {
          const detector = await LanguageDetector.create();
          const results = await detector.detect(data.text);
          if (results && results.length > 0) {
            sourceLanguage = results[0].detectedLanguage;
          }
        } catch (error) {
          console.warn('Language detection failed:', error);
          sourceLanguage = 'en'; // Default to English
        }
      } else if (sourceLanguage === 'auto') {
        sourceLanguage = 'en'; // Default to English
      }

      // Create translator
      const translator = await Translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: data.toLang
      });

      // Translate
      const translation = await translator.translate(data.text);

      // Show overlay with translation
      if (window.QuickTranslateOverlay) {
        const overlay = new window.QuickTranslateOverlay();
        overlay.show(data.text, translation, sourceLanguage, data.toLang);
      }

      console.log('IntelliPen: Translation complete');
    } catch (error) {
      console.error('IntelliPen: Quick translation failed:', error);
      this.showTranslationError(error.message);
      throw error;
    }
  }

  async loadQuickTranslateOverlay() {
    if (this.quickTranslateLoaded && window.QuickTranslateOverlay) {
      return; // Already loaded
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('content-scripts/quick-translate.js');
      script.onload = () => {
        console.log('IntelliPen: Quick translate overlay loaded');
        this.quickTranslateLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.error('IntelliPen: Failed to load quick translate overlay');
        reject(new Error('Failed to load quick translate overlay'));
      };
      document.head.appendChild(script);
    });
  }

  showTranslationError(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: #fee;
      color: #c00;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    notification.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 4px;">Translation Failed</div>
      <div style="font-size: 13px;">${this.escapeHtml(message)}</div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Mark as injected
window.intelliPenInjected = true;

// Initialize content script
const intelliPenContentScript = new IntelliPenContentScript();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    intelliPenContentScript.initialize();
  });
} else {
  intelliPenContentScript.initialize();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntelliPenContentScript };
}
