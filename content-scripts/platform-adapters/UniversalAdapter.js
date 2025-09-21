/**
 * IntelliPen Universal Adapter
 * Basic implementation for all websites - fallback adapter
 */

class UniversalAdapter {
  constructor() {
    this.platformName = 'universal';
  }

  /**
   * Get the platform name
   * @returns {string}
   */
  getPlatformName() {
    return this.platformName;
  }

  /**
   * Get all text fields on the page
   * @returns {Element[]}
   */
  getTextFields() {
    const selectors = [
      'textarea',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="search"]',
      '[contenteditable="true"]',
      '[contenteditable=""]'
    ];

    const fields = [];
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      fields.push(...Array.from(elements));
    });

    return fields.filter(field => this.isValidTextField(field));
  }

  /**
   * Get text fields within a specific element
   * @param {Element} element - The element to search within
   * @returns {Element[]}
   */
  getTextFieldsInElement(element) {
    if (!element || !element.querySelectorAll) return [];

    const selectors = [
      'textarea',
      'input[type="text"]', 
      'input[type="email"]',
      'input[type="search"]',
      '[contenteditable="true"]',
      '[contenteditable=""]'
    ];

    const fields = [];
    selectors.forEach(selector => {
      const elements = element.querySelectorAll(selector);
      fields.push(...Array.from(elements));
    });

    // Also check if the element itself is a text field
    if (this.isValidTextField(element)) {
      fields.push(element);
    }

    return fields.filter(field => this.isValidTextField(field));
  }

  /**
   * Check if an element is a valid text field for IntelliPen
   * @param {Element} element - The element to check
   * @returns {boolean}
   */
  isValidTextField(element) {
    if (!element || element.disabled || element.readOnly) return false;
    
    // Skip hidden elements
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    
    // Skip very small fields (likely not for user input)
    const rect = element.getBoundingClientRect();
    if (rect.width < 50 || rect.height < 20) return false;
    
    // Skip password fields for security
    if (element.type === 'password') return false;
    
    return true;
  }

  /**
   * Get context information for a text field
   * @param {Element} element - The text field element
   * @returns {Object} Context information
   */
  getFieldContext(element) {
    const context = {
      type: 'general',
      purpose: 'unknown',
      formality: 'neutral',
      platform: this.platformName
    };

    // Analyze surrounding context to determine field purpose
    const placeholder = element.placeholder?.toLowerCase() || '';
    const label = this.getFieldLabel(element)?.toLowerCase() || '';
    const className = element.className?.toLowerCase() || '';
    const id = element.id?.toLowerCase() || '';
    const name = element.name?.toLowerCase() || '';

    const contextText = `${placeholder} ${label} ${className} ${id} ${name}`;

    // Determine field type based on context
    if (this.containsAny(contextText, ['email', 'mail'])) {
      context.type = 'email';
      context.formality = 'formal';
    } else if (this.containsAny(contextText, ['comment', 'reply', 'feedback'])) {
      context.type = 'comment';
      context.formality = 'casual';
    } else if (this.containsAny(contextText, ['message', 'chat', 'conversation'])) {
      context.type = 'message';
      context.formality = 'casual';
    } else if (this.containsAny(contextText, ['post', 'status', 'update', 'share'])) {
      context.type = 'social';
      context.formality = 'casual';
    } else if (this.containsAny(contextText, ['document', 'note', 'article', 'content'])) {
      context.type = 'document';
      context.formality = 'formal';
    } else if (this.containsAny(contextText, ['search', 'query', 'find'])) {
      context.type = 'search';
      context.formality = 'neutral';
    } else if (this.containsAny(contextText, ['title', 'subject', 'heading'])) {
      context.type = 'title';
      context.formality = 'formal';
    }

    // Determine purpose
    if (this.containsAny(contextText, ['compose', 'write', 'create'])) {
      context.purpose = 'compose';
    } else if (this.containsAny(contextText, ['edit', 'modify', 'update'])) {
      context.purpose = 'edit';
    } else if (this.containsAny(contextText, ['reply', 'respond', 'answer'])) {
      context.purpose = 'reply';
    }

    return context;
  }

  /**
   * Helper method to check if text contains any of the given keywords
   * @param {string} text - Text to search in
   * @param {string[]} keywords - Keywords to search for
   * @returns {boolean}
   */
  containsAny(text, keywords) {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Get the label associated with a text field
   * @param {Element} element - The text field element
   * @returns {string|null}
   */
  getFieldLabel(element) {
    // Try to find associated label by ID
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent?.trim();
    }

    // Check for parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent?.trim();

    // Check for aria-label
    if (element.getAttribute('aria-label')) {
      return element.getAttribute('aria-label');
    }

    // Check for aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent?.trim();
    }

    // Look for nearby text nodes or elements
    const parent = element.parentElement;
    if (parent) {
      // Check for preceding text or elements
      const prevSibling = element.previousElementSibling;
      if (prevSibling && prevSibling.textContent?.trim()) {
        return prevSibling.textContent.trim();
      }

      // Check for text nodes in parent
      const textNodes = Array.from(parent.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE)
        .map(node => node.textContent?.trim())
        .filter(text => text && text.length > 0);
      
      if (textNodes.length > 0) {
        return textNodes[0];
      }
    }

    return null;
  }

  /**
   * Get the current text content of a field
   * @param {Element} element - The text field element
   * @returns {string}
   */
  getFieldText(element) {
    if (element.tagName.toLowerCase() === 'input') {
      return element.value || '';
    } else if (element.tagName.toLowerCase() === 'textarea') {
      return element.value || '';
    } else if (element.contentEditable === 'true' || element.contentEditable === '') {
      return element.textContent || element.innerText || '';
    }
    return '';
  }

  /**
   * Set the text content of a field
   * @param {Element} element - The text field element
   * @param {string} text - The text to set
   */
  setFieldText(element, text) {
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
      element.value = text;
      // Trigger input event to notify other scripts
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true' || element.contentEditable === '') {
      element.textContent = text;
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Insert text at the current cursor position
   * @param {Element} element - The text field element
   * @param {string} text - The text to insert
   */
  insertTextAtCursor(element, text) {
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      const currentText = element.value;
      
      element.value = currentText.substring(0, start) + text + currentText.substring(end);
      element.selectionStart = element.selectionEnd = start + text.length;
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.contentEditable === 'true' || element.contentEditable === '') {
      // For contenteditable, use document.execCommand or Selection API
      if (document.execCommand) {
        document.execCommand('insertText', false, text);
      } else {
        // Fallback for newer browsers
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      
      // Trigger input event
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Replace selected text in a field
   * @param {Element} element - The text field element
   * @param {string} newText - The replacement text
   */
  replaceSelectedText(element, newText) {
    if (element.tagName.toLowerCase() === 'input' || element.tagName.toLowerCase() === 'textarea') {
      const start = element.selectionStart;
      const end = element.selectionEnd;
      
      if (start !== end) {
        const currentText = element.value;
        element.value = currentText.substring(0, start) + newText + currentText.substring(end);
        element.selectionStart = element.selectionEnd = start + newText.length;
        
        // Trigger input event
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } else if (element.contentEditable === 'true' || element.contentEditable === '') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Trigger input event
        element.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }
}

// Make UniversalAdapter available globally
window.UniversalAdapter = UniversalAdapter;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UniversalAdapter };
}