/**
 * IntelliPen Gmail Adapter
 * Specialized adapter for Gmail compose windows and reply fields
 */

class GmailAdapter extends UniversalAdapter {
  constructor() {
    super();
    this.platformName = 'gmail';
  }

  /**
   * Get Gmail-specific text fields
   * @returns {Element[]}
   */
  getTextFields() {
    const gmailSelectors = [
      // Gmail compose window
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][aria-label*="Message Body"]',
      'div[contenteditable="true"][aria-label*="compose"]',
      
      // Subject line
      'input[name="subjectbox"]',
      'input[placeholder*="Subject"]',
      
      // Reply fields
      'div[contenteditable="true"][dir="ltr"]',
      
      // Fallback to universal selectors
      ...this.getUniversalSelectors()
    ];

    const fields = [];
    gmailSelectors.forEach(selector => {
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
      'input[type="email"]',
      '[contenteditable="true"]'
    ];
  }

  /**
   * Get context for Gmail fields
   * @param {Element} element
   * @returns {Object}
   */
  getFieldContext(element) {
    const context = super.getFieldContext(element);
    context.platform = 'gmail';

    // Gmail-specific context detection
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';

    if (ariaLabel.includes('subject') || element.name === 'subjectbox') {
      context.type = 'email-subject';
      context.formality = 'formal';
      context.purpose = 'compose';
    } else if (ariaLabel.includes('message') || ariaLabel.includes('compose')) {
      context.type = 'email-body';
      context.formality = 'formal';
      context.purpose = 'compose';
    } else if (className.includes('reply') || ariaLabel.includes('reply')) {
      context.type = 'email-body';
      context.formality = 'formal';
      context.purpose = 'reply';
    }

    return context;
  }

  /**
   * Check if element is valid for Gmail
   * @param {Element} element
   * @returns {boolean}
   */
  isValidTextField(element) {
    if (!super.isValidTextField(element)) return false;

    // Skip Gmail's internal elements that shouldn't be edited
    const className = element.className || '';
    if (className.includes('gmail-quote') || className.includes('gmail-signature')) {
      return false;
    }

    return true;
  }
}

// Make GmailAdapter available globally
window.GmailAdapter = GmailAdapter;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GmailAdapter };
}