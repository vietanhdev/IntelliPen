/**
 * Quick Translation Overlay
 * Shows translation results directly on the page
 */

class QuickTranslateOverlay {
  constructor() {
    this.overlay = null;
    this.isVisible = false;
    this.currentText = '';
    this.currentFromLang = '';
    this.currentToLang = '';
  }

  async show(text, translation, fromLang, toLang) {
    // Remove existing overlay if any
    this.hide();

    // Store current values
    this.currentText = text;
    this.currentFromLang = fromLang;
    this.currentToLang = toLang;

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'intellipen-translate-overlay';
    this.overlay.innerHTML = `
      <div class="intellipen-translate-header">
        <span class="intellipen-translate-title">🌐 Translation</span>
        <button class="intellipen-translate-close" title="Close">×</button>
      </div>
      <div class="intellipen-translate-body">
        <div class="intellipen-translate-original">
          <div class="intellipen-translate-label-row">
            <select class="intellipen-translate-lang-select" data-lang-type="from">
              ${this.getLanguageOptions(fromLang, true)}
            </select>
          </div>
          <div class="intellipen-translate-text">${this.escapeHtml(text)}</div>
        </div>
        <div class="intellipen-translate-arrow">→</div>
        <div class="intellipen-translate-result">
          <div class="intellipen-translate-label-row">
            <select class="intellipen-translate-lang-select" data-lang-type="to">
              ${this.getLanguageOptions(toLang, false)}
            </select>
          </div>
          <div class="intellipen-translate-text intellipen-translate-loading">Translating...</div>
        </div>
      </div>
      <div class="intellipen-translate-footer">
        <button class="intellipen-translate-btn copy" title="Copy translation">
          📋 Copy
        </button>
        <button class="intellipen-translate-btn speak" title="Read aloud">
          🔊 Speak
        </button>
        <button class="intellipen-translate-btn open" title="Open in translator">
          🌐 Open Translator
        </button>
      </div>
    `;

    // Add styles
    this.injectStyles();

    // Update translation text
    const resultText = this.overlay.querySelector('.intellipen-translate-result .intellipen-translate-text');
    resultText.textContent = translation;
    resultText.classList.remove('intellipen-translate-loading');

    // Add event listeners
    this.overlay.querySelector('.intellipen-translate-close').addEventListener('click', () => {
      this.hide();
    });

    this.overlay.querySelector('.copy').addEventListener('click', () => {
      const resultText = this.overlay.querySelector('.intellipen-translate-result .intellipen-translate-text');
      this.copyTranslation(resultText.textContent);
    });

    this.overlay.querySelector('.speak').addEventListener('click', () => {
      const resultText = this.overlay.querySelector('.intellipen-translate-result .intellipen-translate-text');
      this.speakTranslation(resultText.textContent, this.currentToLang);
    });

    this.overlay.querySelector('.open').addEventListener('click', () => {
      this.openInTranslator(this.currentText);
    });

    // Language selection change handlers
    const fromLangSelect = this.overlay.querySelector('[data-lang-type="from"]');
    const toLangSelect = this.overlay.querySelector('[data-lang-type="to"]');

    fromLangSelect.addEventListener('change', async (e) => {
      await this.handleLanguageChange('from', e.target.value);
    });

    toLangSelect.addEventListener('change', async (e) => {
      await this.handleLanguageChange('to', e.target.value);
    });

    // Close on escape key
    this.escapeHandler = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    document.addEventListener('keydown', this.escapeHandler);

    // Close when clicking outside
    this.clickHandler = (e) => {
      if (!this.overlay.contains(e.target)) {
        this.hide();
      }
    };
    setTimeout(() => {
      document.addEventListener('click', this.clickHandler);
    }, 100);

    // Add to page
    document.body.appendChild(this.overlay);
    this.isVisible = true;

    // Position near selection
    this.positionOverlay();
  }

  hide() {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
    this.isVisible = false;

    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener('keydown', this.escapeHandler);
      this.escapeHandler = null;
    }
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
  }

  positionOverlay() {
    if (!this.overlay) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position below selection
      let top = rect.bottom + window.scrollY + 10;
      let left = rect.left + window.scrollX;

      // Adjust if too close to bottom
      if (top + 300 > window.innerHeight + window.scrollY) {
        top = rect.top + window.scrollY - 310;
      }

      // Adjust if too close to right edge
      if (left + 400 > window.innerWidth) {
        left = window.innerWidth - 410;
      }

      // Ensure not off left edge
      if (left < 10) {
        left = 10;
      }

      this.overlay.style.top = `${top}px`;
      this.overlay.style.left = `${left}px`;
    } else {
      // Center on screen if no selection
      this.overlay.style.top = '50%';
      this.overlay.style.left = '50%';
      this.overlay.style.transform = 'translate(-50%, -50%)';
    }
  }

  copyTranslation(translation) {
    navigator.clipboard.writeText(translation).then(() => {
      this.showFeedback('Copied to clipboard!');
    }).catch(error => {
      console.error('Failed to copy:', error);
      this.showFeedback('Failed to copy', true);
    });
  }

  speakTranslation(translation, lang) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(translation);
      utterance.lang = this.getSpeechLang(lang);
      window.speechSynthesis.speak(utterance);
      this.showFeedback('Speaking...');
    } else {
      this.showFeedback('Speech not supported', true);
    }
  }

  openInTranslator(text) {
    chrome.runtime.sendMessage({
      type: 'LOAD_TEXT_IN_TRANSLATOR',
      data: { text }
    });
    this.hide();
  }

  showFeedback(message, isError = false) {
    const footer = this.overlay?.querySelector('.intellipen-translate-footer');
    if (!footer) return;

    const feedback = document.createElement('div');
    feedback.className = `intellipen-translate-feedback ${isError ? 'error' : ''}`;
    feedback.textContent = message;
    footer.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
    }, 2000);
  }

  injectStyles() {
    if (document.getElementById('intellipen-translate-styles')) return;

    const style = document.createElement('style');
    style.id = 'intellipen-translate-styles';
    style.textContent = `
      .intellipen-translate-overlay {
        position: absolute;
        z-index: 999999;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        width: 400px;
        max-width: calc(100vw - 20px);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        animation: intellipen-fade-in 0.2s ease-out;
      }

      @keyframes intellipen-fade-in {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .intellipen-translate-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
      }

      .intellipen-translate-title {
        font-weight: 600;
        color: #1e293b;
        font-size: 15px;
      }

      .intellipen-translate-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      }

      .intellipen-translate-close:hover {
        background: #f1f5f9;
        color: #1e293b;
      }

      .intellipen-translate-body {
        padding: 16px;
        max-height: 300px;
        overflow-y: auto;
      }

      .intellipen-translate-original,
      .intellipen-translate-result {
        margin-bottom: 12px;
      }

      .intellipen-translate-label-row {
        margin-bottom: 8px;
      }

      .intellipen-translate-lang-select {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: white;
        color: #1e293b;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .intellipen-translate-lang-select:hover {
        border-color: #cbd5e1;
        background: #f8fafc;
      }

      .intellipen-translate-lang-select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      .intellipen-translate-text {
        color: #1e293b;
        line-height: 1.6;
        padding: 10px;
        background: #f8fafc;
        border-radius: 6px;
        min-height: 40px;
      }

      .intellipen-translate-text.intellipen-translate-loading {
        color: #64748b;
        font-style: italic;
      }

      .intellipen-translate-arrow {
        text-align: center;
        color: #94a3b8;
        font-size: 18px;
        margin: 8px 0;
      }

      .intellipen-translate-footer {
        display: flex;
        gap: 8px;
        padding: 12px 16px;
        border-top: 1px solid #e2e8f0;
        position: relative;
      }

      .intellipen-translate-btn {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #e2e8f0;
        background: white;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
        color: #475569;
        font-weight: 500;
      }

      .intellipen-translate-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }

      .intellipen-translate-btn.copy:hover {
        background: #f0fdf4;
        border-color: #86efac;
        color: #166534;
      }

      .intellipen-translate-btn.speak:hover {
        background: #eff6ff;
        border-color: #93c5fd;
        color: #1e40af;
      }

      .intellipen-translate-btn.open:hover {
        background: #fef3c7;
        border-color: #fcd34d;
        color: #92400e;
      }

      .intellipen-translate-feedback {
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        background: #10b981;
        color: white;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
        animation: intellipen-fade-in 0.2s ease-out;
      }

      .intellipen-translate-feedback.error {
        background: #ef4444;
      }
    `;
    document.head.appendChild(style);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  getLanguages() {
    return {
      'auto': 'Auto-detect',
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'vi': 'Vietnamese',
      'th': 'Thai'
    };
  }

  getLanguageName(code) {
    const languages = this.getLanguages();
    return languages[code] || code.toUpperCase();
  }

  getLanguageOptions(selectedLang, includeAuto = false) {
    const languages = this.getLanguages();
    let options = '';
    
    for (const [code, name] of Object.entries(languages)) {
      // Skip 'auto' for target language
      if (code === 'auto' && !includeAuto) continue;
      
      const selected = code === selectedLang ? 'selected' : '';
      options += `<option value="${code}" ${selected}>${name}</option>`;
    }
    
    return options;
  }

  async handleLanguageChange(type, newLang) {
    // Save the new language preference
    const storageKey = type === 'from' ? 'translationFromLang' : 'translationToLang';
    await chrome.storage.local.set({ [storageKey]: newLang });

    // Update current language
    if (type === 'from') {
      this.currentFromLang = newLang;
    } else {
      this.currentToLang = newLang;
    }

    // Re-translate with new language pair
    await this.retranslate();
  }

  async retranslate() {
    const resultText = this.overlay.querySelector('.intellipen-translate-result .intellipen-translate-text');
    resultText.textContent = 'Translating...';
    resultText.classList.add('intellipen-translate-loading');

    try {
      // Detect source language if auto
      let sourceLanguage = this.currentFromLang;
      if (sourceLanguage === 'auto' && 'LanguageDetector' in self) {
        try {
          const detector = await LanguageDetector.create();
          const results = await detector.detect(this.currentText);
          if (results && results.length > 0) {
            sourceLanguage = results[0].detectedLanguage;
          }
        } catch (error) {
          console.warn('Language detection failed:', error);
          sourceLanguage = 'en';
        }
      } else if (sourceLanguage === 'auto') {
        sourceLanguage = 'en';
      }

      // Create translator
      const translator = await Translator.create({
        sourceLanguage: sourceLanguage,
        targetLanguage: this.currentToLang
      });

      // Translate
      const translation = await translator.translate(this.currentText);

      // Update result
      resultText.textContent = translation;
      resultText.classList.remove('intellipen-translate-loading');

      this.showFeedback('Translation updated');
    } catch (error) {
      console.error('Re-translation failed:', error);
      resultText.textContent = 'Translation failed. Please try again.';
      resultText.classList.remove('intellipen-translate-loading');
      this.showFeedback('Translation failed', true);
    }
  }

  getSpeechLang(code) {
    const speechLangs = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'zh': 'zh-CN',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'vi': 'vi-VN',
      'th': 'th-TH'
    };
    return speechLangs[code] || code;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = QuickTranslateOverlay;
}
