/**
 * IntelliPen LinkedIn Adapter
 * Specialized adapter for LinkedIn post creation and messaging interfaces
 */

class LinkedInAdapter extends UniversalAdapter {
  constructor() {
    super();
    this.platformName = 'linkedin';
  }

  /**
   * Get LinkedIn-specific text fields
   * @returns {Element[]}
   */
  getTextFields() {
    const linkedinSelectors = [
      // Post creation
      'div[contenteditable="true"][data-placeholder*="Start a post"]',
      'div[contenteditable="true"][role="textbox"]',
      
      // Comments
      'div[contenteditable="true"][data-placeholder*="Add a comment"]',
      
      // Messaging
      'div[contenteditable="true"][data-placeholder*="Write a message"]',
      
      // Article writing
      'div[contenteditable="true"][data-editor="true"]',
      
      // Fallback to universal selectors
      ...this.getUniversalSelectors()
    ];

    const fields = [];
    linkedinSelectors.forEach(selector => {
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
   * Get context for LinkedIn fields
   * @param {Element} element
   * @returns {Object}
   */
  getFieldContext(element) {
    const context = super.getFieldContext(element);
    context.platform = 'linkedin';

    const placeholder = element.getAttribute('data-placeholder')?.toLowerCase() || '';
    const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';

    if (placeholder.includes('start a post') || placeholder.includes('share')) {
      context.type = 'social-post';
      context.formality = 'professional';
      context.purpose = 'compose';
    } else if (placeholder.includes('comment')) {
      context.type = 'comment';
      context.formality = 'professional';
      context.purpose = 'reply';
    } else if (placeholder.includes('message')) {
      context.type = 'message';
      context.formality = 'professional';
      context.purpose = 'compose';
    } else if (element.getAttribute('data-editor') === 'true') {
      context.type = 'article';
      context.formality = 'formal';
      context.purpose = 'compose';
    }

    return context;
  }
}

// Make LinkedInAdapter available globally
window.LinkedInAdapter = LinkedInAdapter;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LinkedInAdapter };
}