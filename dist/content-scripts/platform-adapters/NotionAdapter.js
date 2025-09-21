/**
 * IntelliPen Notion Adapter
 * Specialized adapter for Notion page editing and comment fields
 */

class NotionAdapter extends UniversalAdapter {
  constructor() {
    super();
    this.platformName = 'notion';
  }

  /**
   * Get Notion-specific text fields
   * @returns {Element[]}
   */
  getTextFields() {
    const notionSelectors = [
      // Notion editor blocks
      'div[contenteditable="true"][data-content-editable-leaf="true"]',
      'div[contenteditable="true"][role="textbox"]',
      
      // Page titles
      'h1[contenteditable="true"]',
      'div[contenteditable="true"][data-content-editable-void="true"]',
      
      // Comments
      'div[contenteditable="true"][placeholder*="Add a comment"]',
      
      // Fallback to universal selectors
      ...this.getUniversalSelectors()
    ];

    const fields = [];
    notionSelectors.forEach(selector => {
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
   * Get context for Notion fields
   * @param {Element} element
   * @returns {Object}
   */
  getFieldContext(element) {
    const context = super.getFieldContext(element);
    context.platform = 'notion';

    const placeholder = element.getAttribute('placeholder')?.toLowerCase() || '';
    const tagName = element.tagName.toLowerCase();

    if (tagName === 'h1' || element.getAttribute('data-content-editable-void') === 'true') {
      context.type = 'title';
      context.formality = 'formal';
      context.purpose = 'compose';
    } else if (placeholder.includes('comment')) {
      context.type = 'comment';
      context.formality = 'casual';
      context.purpose = 'reply';
    } else if (element.getAttribute('data-content-editable-leaf') === 'true') {
      context.type = 'document';
      context.formality = 'formal';
      context.purpose = 'compose';
    }

    return context;
  }

  /**
   * Check if element is valid for Notion
   * @param {Element} element
   * @returns {boolean}
   */
  isValidTextField(element) {
    if (!super.isValidTextField(element)) return false;

    // Skip Notion's internal UI elements
    const className = element.className || '';
    if (className.includes('notion-') && className.includes('-button')) {
      return false;
    }

    return true;
  }
}

// Make NotionAdapter available globally
window.NotionAdapter = NotionAdapter;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NotionAdapter };
}