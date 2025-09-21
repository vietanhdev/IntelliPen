/**
 * IntelliPen Google Docs Adapter
 * Specialized adapter for Google Docs integration
 */

class GoogleDocsAdapter extends UniversalAdapter {
  constructor() {
    super();
    this.platformName = 'google-docs';
  }

  /**
   * Get Google Docs-specific text fields
   * @returns {Element[]}
   */
  getTextFields() {
    const docsSelectors = [
      // Google Docs editor
      'div[contenteditable="true"][role="textbox"]',
      'div.kix-canvas-tile-content',
      
      // Comments
      'div[contenteditable="true"][data-initial-value]',
      
      // Suggestions
      'div[contenteditable="true"][aria-label*="suggestion"]',
      
      // Fallback to universal selectors
      ...this.getUniversalSelectors()
    ];

    const fields = [];
    docsSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        fields.push(...Array.from(elements));
      } catch (error) {
        // Ignore invalid selectors
      }
    });

    return fields.filter(field => this.isValidTextField(field));
  }

  /**
   * Get universal selectors as fallback
   * @returns {string[]}
   */
  getUniversalSelectors() {
    return [
      'textarea',
      'input[type="text"]',
      '[contenteditable="true"]'
    ];
  }

  /**
   * Get context for Google Docs fields
   * @param {Element} element
   * @returns {Object}
   */
  getFieldContext(element) {
    const context = super.getFieldContext(element);
    context.platform = 'google-docs';

    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    const className = element.className || '';

    if (ariaLabel.includes('document') || className.includes('kix-canvas')) {
      context.type = 'document';
      context.formality = 'formal';
      context.purpose = 'compose';
    } else if (ariaLabel.includes('comment') || element.getAttribute('data-initial-value')) {
      context.type = 'comment';
      context.formality = 'casual';
      context.purpose = 'reply';
    } else if (ariaLabel.includes('suggestion')) {
      context.type = 'suggestion';
      context.formality = 'formal';
      context.purpose = 'edit';
    }

    return context;
  }

  /**
   * Check if element is valid for Google Docs
   * @param {Element} element
   * @returns {boolean}
   */
  isValidTextField(element) {
    if (!super.isValidTextField(element)) return false;

    // Skip Google Docs internal elements that shouldn't be edited directly
    const className = element.className || '';
    if (className.includes('kix-') && !className.includes('kix-canvas-tile-content')) {
      return false;
    }

    return true;
  }

  /**
   * Special handling for Google Docs text manipulation
   * Note: Google Docs has complex internal structure, so text manipulation
   * should be done carefully to avoid breaking the document
   */
  setFieldText(element, text) {
    // For Google Docs, we need to be more careful about text manipulation
    // This is a basic implementation - full Google Docs integration would
    // require more sophisticated handling of their internal APIs
    
    if (element.className && element.className.includes('kix-canvas')) {
      // For the main document area, use selection-based insertion
      this.insertTextAtCursor(element, text);
    } else {
      // For other elements, use the standard approach
      super.setFieldText(element, text);
    }
  }
}

// Make GoogleDocsAdapter available globally
window.GoogleDocsAdapter = GoogleDocsAdapter;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GoogleDocsAdapter };
}