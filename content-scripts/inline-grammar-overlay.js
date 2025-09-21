/**
 * IntelliPen Inline Grammar Overlay System
 * Provides Grammarly-like inline writing assistance
 */

class InlineGrammarOverlay {
    constructor() {
        this.activeElements = new Map();
        this.suggestions = new Map();
        this.isEnabled = true;
        this.currentPopup = null;
        this.overlayContainer = null;
    }

    initialize() {
        console.log('IntelliPen: Initializing inline grammar overlay...');

        // Create overlay container
        this.createOverlayContainer();

        // Load styles
        this.loadStyles();

        // Set up global event listeners
        this.setupGlobalEventListeners();

        // Start observing text fields
        this.startObserving();

        console.log('IntelliPen: Inline grammar overlay initialized');
    }

    createOverlayContainer() {
        if (this.overlayContainer) return;

        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = 'intellipen-inline-overlay';
        this.overlayContainer.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      pointer-events: none !important;
      z-index: 999999 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    `;

        document.body.appendChild(this.overlayContainer);
    }

    loadStyles() {
        if (document.getElementById('intellipen-inline-styles')) return;

        const style = document.createElement('style');
        style.id = 'intellipen-inline-styles';
        style.textContent = `
      /* Inline underlines for grammar errors */
      .intellipen-error {
        background: linear-gradient(to bottom, transparent 0%, transparent 85%, #ef4444 85%, #ef4444 100%) !important;
        background-size: 2px 2px !important;
        background-repeat: repeat-x !important;
        cursor: pointer !important;
        position: relative !important;
      }
      
      .intellipen-error-grammar {
        background: linear-gradient(to bottom, transparent 0%, transparent 85%, #ef4444 85%, #ef4444 100%) !important;
      }
      
      .intellipen-error-style {
        background: linear-gradient(to bottom, transparent 0%, transparent 85%, #3b82f6 85%, #3b82f6 100%) !important;
      }
      
      .intellipen-error-clarity {
        background: linear-gradient(to bottom, transparent 0%, transparent 85%, #f59e0b 85%, #f59e0b 100%) !important;
      }
      
      /* Suggestion popup */
      .intellipen-suggestion-popup {
        position: absolute !important;
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        padding: 0 !important;
        min-width: 280px !important;
        max-width: 400px !important;
        pointer-events: auto !important;
        z-index: 1000000 !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        animation: intellipen-fade-in 0.2s ease-out !important;
      }
      
      @keyframes intellipen-fade-in {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .intellipen-popup-header {
        padding: 12px 16px !important;
        border-bottom: 1px solid #f3f4f6 !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        background: #f9fafb !important;
        border-radius: 8px 8px 0 0 !important;
      }
      
      .intellipen-popup-icon {
        width: 16px !important;
        height: 16px !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 10px !important;
        font-weight: bold !important;
        color: white !important;
      }
      
      .intellipen-popup-icon.grammar { background: #ef4444 !important; }
      .intellipen-popup-icon.style { background: #3b82f6 !important; }
      .intellipen-popup-icon.clarity { background: #f59e0b !important; }
      
      .intellipen-popup-title {
        font-weight: 600 !important;
        color: #374151 !important;
        flex: 1 !important;
      }
      
      .intellipen-popup-close {
        background: none !important;
        border: none !important;
        color: #6b7280 !important;
        cursor: pointer !important;
        padding: 4px !important;
        border-radius: 4px !important;
        font-size: 16px !important;
        line-height: 1 !important;
      }
      
      .intellipen-popup-close:hover {
        background: #f3f4f6 !important;
        color: #374151 !important;
      }
      
      .intellipen-popup-content {
        padding: 16px !important;
      }
      
      .intellipen-original-text {
        background: #fef2f2 !important;
        color: #991b1b !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        margin-bottom: 12px !important;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
        font-size: 13px !important;
        border: 1px solid #fecaca !important;
      }
      
      .intellipen-suggestion-text {
        background: #f0fdf4 !important;
        color: #166534 !important;
        padding: 8px 12px !important;
        border-radius: 6px !important;
        margin-bottom: 12px !important;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace !important;
        font-size: 13px !important;
        border: 1px solid #bbf7d0 !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
      }
      
      .intellipen-suggestion-text:hover {
        background: #dcfce7 !important;
        border-color: #86efac !important;
      }
      
      .intellipen-explanation {
        color: #6b7280 !important;
        font-size: 13px !important;
        line-height: 1.5 !important;
        margin-bottom: 16px !important;
      }
      
      .intellipen-actions {
        display: flex !important;
        gap: 8px !important;
        justify-content: flex-end !important;
      }
      
      .intellipen-btn {
        padding: 8px 16px !important;
        border-radius: 6px !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        cursor: pointer !important;
        border: 1px solid transparent !important;
        transition: all 0.2s ease !important;
      }
      
      .intellipen-btn-primary {
        background: #3b82f6 !important;
        color: white !important;
      }
      
      .intellipen-btn-primary:hover {
        background: #2563eb !important;
      }
      
      .intellipen-btn-secondary {
        background: white !important;
        color: #6b7280 !important;
        border-color: #d1d5db !important;
      }
      
      .intellipen-btn-secondary:hover {
        background: #f9fafb !important;
        color: #374151 !important;
      }
      
      /* Text field indicators */
      .intellipen-field-indicator {
        position: absolute !important;
        bottom: 4px !important;
        right: 4px !important;
        width: 20px !important;
        height: 20px !important;
        background: rgba(59, 130, 246, 0.1) !important;
        border: 1px solid rgba(59, 130, 246, 0.3) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 10px !important;
        color: #3b82f6 !important;
        pointer-events: none !important;
        opacity: 0 !important;
        transition: opacity 0.2s ease !important;
      }
      
      .intellipen-active .intellipen-field-indicator {
        opacity: 1 !important;
      }
    `;
        document.head.appendChild(style);
    }

    setupGlobalEventListeners() {
        // Hide popup when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.intellipen-suggestion-popup')) {
                this.hidePopup();
            }
        });

        // Hide popup on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePopup();
            }
        });
    }

    startObserving() {
        // Observe existing text fields
        this.scanForTextFields();

        // Set up mutation observer for dynamically added content
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.scanElementForTextFields(node);
                    }
                });
            });
        });

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    scanForTextFields() {
        const selectors = [
            'textarea',
            'input[type="text"]',
            'input[type="email"]',
            '[contenteditable="true"]',
            '[contenteditable=""]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => this.observeTextField(element));
        });
    }

    scanElementForTextFields(element) {
        const selectors = [
            'textarea',
            'input[type="text"]',
            'input[type="email"]',
            '[contenteditable="true"]',
            '[contenteditable=""]'
        ];

        selectors.forEach(selector => {
            const elements = element.querySelectorAll ? element.querySelectorAll(selector) : [];
            elements.forEach(el => this.observeTextField(el));
        });

        // Check if the element itself is a text field
        if (this.isValidTextField(element)) {
            this.observeTextField(element);
        }
    }

    isValidTextField(element) {
        if (!element || element.disabled || element.readOnly) return false;

        const tagName = element.tagName.toLowerCase();
        const type = element.type?.toLowerCase();
        const contentEditable = element.contentEditable;

        // Skip hidden elements
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') return false;

        // Skip very small fields
        const rect = element.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 20) return false;

        return (
            tagName === 'textarea' ||
            (tagName === 'input' && ['text', 'email', 'search'].includes(type)) ||
            contentEditable === 'true' || contentEditable === ''
        );
    }

    observeTextField(element) {
        if (this.activeElements.has(element)) return;

        console.log('IntelliPen: Observing text field for inline grammar:', element);

        const fieldData = {
            element,
            lastValue: element.value || element.textContent || '',
            suggestions: [],
            errorSpans: []
        };

        this.activeElements.set(element, fieldData);

        // Add event listeners
        this.addFieldEventListeners(element, fieldData);

        // Add visual indicator
        this.addFieldIndicator(element);

        // Mark as active
        element.classList.add('intellipen-active');
    }

    addFieldEventListeners(element, fieldData) {
        const handleInput = (event) => {
            this.handleTextInput(element, fieldData, event);
        };

        const handleFocus = (event) => {
            this.handleFieldFocus(element, fieldData, event);
        };

        const handleBlur = (event) => {
            this.handleFieldBlur(element, fieldData, event);
        };

        element.addEventListener('input', handleInput);
        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);

        // Store event listeners for cleanup
        fieldData.eventListeners = { handleInput, handleFocus, handleBlur };
    }

    handleTextInput(element, fieldData, event) {
        const currentValue = element.value || element.textContent || '';

        if (currentValue !== fieldData.lastValue) {
            fieldData.lastValue = currentValue;

            // Clear existing error highlights
            this.clearErrorHighlights(element, fieldData);

            // Debounce analysis
            clearTimeout(fieldData.analysisTimeout);
            fieldData.analysisTimeout = setTimeout(() => {
                this.analyzeText(element, fieldData, currentValue);
            }, 500);
        }
    }

    handleFieldFocus(element, fieldData, event) {
        console.log('IntelliPen: Text field focused');
        element.classList.add('intellipen-focused');
    }

    handleFieldBlur(element, fieldData, event) {
        console.log('IntelliPen: Text field blurred');
        element.classList.remove('intellipen-focused');
        // Keep error highlights visible even when not focused
    }

    analyzeText(element, fieldData, text) {
        if (!text.trim() || text.length < 3) return;

        console.log('IntelliPen: Analyzing text for grammar errors:', text.substring(0, 50) + '...');

        // Demo grammar analysis (replace with real AI API calls)
        const errors = this.findGrammarErrors(text);

        if (errors.length > 0) {
            this.highlightErrors(element, fieldData, errors);
        }
    }

    findGrammarErrors(text) {
        const errors = [];

        // Simple demo error detection
        const patterns = [
            { regex: /\bi\s/gi, type: 'grammar', message: 'Capitalize the pronoun "I"', replacement: 'I ' },
            { regex: /\balot\b/gi, type: 'grammar', message: '"A lot" should be two words', replacement: 'a lot' },
            { regex: /\bthere\s+is\b/gi, type: 'style', message: 'Consider using contraction', replacement: "there's" },
            { regex: /\bvery\s+good\b/gi, type: 'style', message: 'More precise word choice', replacement: 'excellent' },
            { regex: /\bthe\s+thing\s+is\s+that\b/gi, type: 'clarity', message: 'More specific language', replacement: 'the issue is that' }
        ];

        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.regex.exec(text)) !== null) {
                errors.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    type: pattern.type,
                    message: pattern.message,
                    replacement: pattern.replacement
                });
            }
        });

        return errors;
    }

    highlightErrors(element, fieldData, errors) {
        // For contentEditable elements, we can add spans directly
        if (element.contentEditable === 'true' || element.contentEditable === '') {
            this.highlightErrorsInContentEditable(element, fieldData, errors);
        } else {
            // For input/textarea, we'll show indicators and handle clicks
            this.addErrorIndicators(element, fieldData, errors);
        }
    }

    highlightErrorsInContentEditable(element, fieldData, errors) {
        const text = element.textContent;
        let html = '';
        let lastIndex = 0;

        // Sort errors by position
        errors.sort((a, b) => a.start - b.start);

        errors.forEach((error, index) => {
            // Add text before error
            html += this.escapeHtml(text.substring(lastIndex, error.start));

            // Add error span
            html += `<span class="intellipen-error intellipen-error-${error.type}" data-error-id="${index}">${this.escapeHtml(error.text)}</span>`;

            lastIndex = error.end;
        });

        // Add remaining text
        html += this.escapeHtml(text.substring(lastIndex));

        // Update element content
        element.innerHTML = html;

        // Store errors for popup handling
        fieldData.errors = errors;

        // Add click handlers to error spans
        element.querySelectorAll('.intellipen-error').forEach(span => {
            span.addEventListener('click', (e) => {
                e.preventDefault();
                const errorId = parseInt(span.dataset.errorId);
                const error = errors[errorId];
                this.showErrorPopup(span, error, element, fieldData);
            });
        });
    }

    addErrorIndicators(element, fieldData, errors) {
        // For input/textarea, we can't modify the content directly
        // Instead, we'll store the errors and show popup on click
        fieldData.errors = errors;

        // Add click handler to show errors
        const clickHandler = (e) => {
            if (errors.length > 0) {
                // Show popup with first error for demo
                const rect = element.getBoundingClientRect();
                this.showErrorPopup(element, errors[0], element, fieldData, {
                    x: rect.left + 10,
                    y: rect.bottom + 5
                });
            }
        };

        element.addEventListener('click', clickHandler);
        fieldData.clickHandler = clickHandler;

        // Update field indicator to show error count
        const indicator = element.querySelector('.intellipen-field-indicator');
        if (indicator) {
            indicator.textContent = errors.length;
            indicator.style.background = 'rgba(239, 68, 68, 0.1)';
            indicator.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            indicator.style.color = '#ef4444';
        }
    }

    showErrorPopup(triggerElement, error, textElement, fieldData, customPosition = null) {
        this.hidePopup();

        const popup = document.createElement('div');
        popup.className = 'intellipen-suggestion-popup';

        // Position popup
        let position;
        if (customPosition) {
            position = customPosition;
        } else {
            const rect = triggerElement.getBoundingClientRect();
            position = {
                x: rect.left,
                y: rect.bottom + 5
            };
        }

        popup.style.left = `${position.x}px`;
        popup.style.top = `${position.y}px`;

        // Create popup content
        popup.innerHTML = `
      <div class="intellipen-popup-header">
        <div class="intellipen-popup-icon ${error.type}">${error.type[0].toUpperCase()}</div>
        <div class="intellipen-popup-title">${this.getErrorTypeTitle(error.type)}</div>
        <button class="intellipen-popup-close">×</button>
      </div>
      <div class="intellipen-popup-content">
        <div class="intellipen-original-text">${this.escapeHtml(error.text)}</div>
        <div class="intellipen-suggestion-text" data-replacement="${this.escapeHtml(error.replacement)}">${this.escapeHtml(error.replacement)}</div>
        <div class="intellipen-explanation">${this.escapeHtml(error.message)}</div>
        <div class="intellipen-actions">
          <button class="intellipen-btn intellipen-btn-secondary" data-action="ignore">Ignore</button>
          <button class="intellipen-btn intellipen-btn-primary" data-action="apply">Apply</button>
        </div>
      </div>
    `;

        // Add event listeners
        popup.querySelector('.intellipen-popup-close').addEventListener('click', () => {
            this.hidePopup();
        });

        popup.querySelector('[data-action="ignore"]').addEventListener('click', () => {
            this.hidePopup();
        });

        popup.querySelector('[data-action="apply"]').addEventListener('click', () => {
            this.applySuggestion(textElement, error);
            this.hidePopup();
        });

        popup.querySelector('.intellipen-suggestion-text').addEventListener('click', () => {
            this.applySuggestion(textElement, error);
            this.hidePopup();
        });

        // Position popup to stay within viewport
        this.positionPopup(popup, position);

        // Add to overlay
        this.overlayContainer.appendChild(popup);
        this.currentPopup = popup;
    }

    applySuggestion(element, error) {
        console.log('Applying suggestion:', error);

        if (element.contentEditable === 'true' || element.contentEditable === '') {
            // For contentEditable, replace the error span
            const errorSpan = element.querySelector(`[data-error-id]`);
            if (errorSpan) {
                errorSpan.outerHTML = this.escapeHtml(error.replacement);
            }
        } else {
            // For input/textarea, replace text
            const text = element.value;
            const newText = text.substring(0, error.start) + error.replacement + text.substring(error.end);
            element.value = newText;

            // Trigger input event
            element.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Show success feedback
        this.showSuccessFeedback();
    }

    getErrorTypeTitle(type) {
        const titles = {
            grammar: 'Grammar',
            style: 'Style',
            clarity: 'Clarity'
        };
        return titles[type] || 'Suggestion';
    }

    positionPopup(popup, position) {
        const rect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = position.x;
        let y = position.y;

        // Adjust horizontal position
        if (x + rect.width > viewportWidth - 20) {
            x = viewportWidth - rect.width - 20;
        }
        if (x < 20) {
            x = 20;
        }

        // Adjust vertical position
        if (y + rect.height > viewportHeight - 20) {
            y = position.y - rect.height - 10;
        }
        if (y < 20) {
            y = 20;
        }

        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
    }

    hidePopup() {
        if (this.currentPopup) {
            this.currentPopup.remove();
            this.currentPopup = null;
        }
    }

    clearErrorHighlights(element, fieldData) {
        if (element.contentEditable === 'true' || element.contentEditable === '') {
            // Remove error spans but preserve text
            const errorSpans = element.querySelectorAll('.intellipen-error');
            errorSpans.forEach(span => {
                span.outerHTML = span.textContent;
            });
        }

        // Clear stored errors
        fieldData.errors = [];

        // Reset field indicator
        const indicator = element.querySelector('.intellipen-field-indicator');
        if (indicator) {
            indicator.textContent = '✓';
            indicator.style.background = 'rgba(34, 197, 94, 0.1)';
            indicator.style.borderColor = 'rgba(34, 197, 94, 0.3)';
            indicator.style.color = '#22c55e';
        }
    }

    addFieldIndicator(element) {
        // Don't add indicator if element is too small or already has one
        if (element.querySelector('.intellipen-field-indicator')) return;

        const rect = element.getBoundingClientRect();
        if (rect.width < 100 || rect.height < 30) return;

        const indicator = document.createElement('div');
        indicator.className = 'intellipen-field-indicator';
        indicator.textContent = '✓';

        // Make element relative if it's not already positioned
        const style = window.getComputedStyle(element);
        if (style.position === 'static') {
            element.style.position = 'relative';
        }

        element.appendChild(indicator);
    }

    showSuccessFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #10b981 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      z-index: 1000001 !important;
      pointer-events: none !important;
      animation: intellipen-fade-in 0.3s ease-out !important;
    `;
        feedback.textContent = '✓ Suggestion applied';

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Public API methods
    enable() {
        this.isEnabled = true;
        console.log('IntelliPen: Inline grammar overlay enabled');
    }

    disable() {
        this.isEnabled = false;
        this.hidePopup();
        console.log('IntelliPen: Inline grammar overlay disabled');
    }

    cleanup() {
        this.hidePopup();

        // Clean up all observed elements
        this.activeElements.forEach((fieldData, element) => {
            if (fieldData.eventListeners) {
                element.removeEventListener('input', fieldData.eventListeners.handleInput);
                element.removeEventListener('focus', fieldData.eventListeners.handleFocus);
                element.removeEventListener('blur', fieldData.eventListeners.handleBlur);
            }

            if (fieldData.clickHandler) {
                element.removeEventListener('click', fieldData.clickHandler);
            }

            element.classList.remove('intellipen-active', 'intellipen-focused');

            // Remove indicator
            const indicator = element.querySelector('.intellipen-field-indicator');
            if (indicator) {
                indicator.remove();
            }
        });

        this.activeElements.clear();

        if (this.overlayContainer) {
            this.overlayContainer.remove();
            this.overlayContainer = null;
        }

        console.log('IntelliPen: Inline grammar overlay cleaned up');
    }
}

// Initialize inline grammar overlay
let inlineGrammarOverlay = null;

function initializeInlineGrammarOverlay() {
    if (!inlineGrammarOverlay) {
        inlineGrammarOverlay = new InlineGrammarOverlay();
        inlineGrammarOverlay.initialize();

        // Export for use by other scripts
        window.IntelliPenInlineGrammarOverlay = inlineGrammarOverlay;
    }
    return inlineGrammarOverlay;
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInlineGrammarOverlay);
} else {
    initializeInlineGrammarOverlay();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { InlineGrammarOverlay };
}