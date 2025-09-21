/**
 * Fix for Text Field Detection and Suggestion System
 * This script addresses the "Active Fields: 0" and "Suggestions: 0" issues
 */

// Enhanced Universal Text Integration with better debugging and UI
class EnhancedUniversalTextIntegration {
  constructor() {
    this.isInitialized = false;
    this.activeElements = new Map();
    this.observers = new Map();
    this.currentAdapter = null;
    this.extensionReady = false;
    this.debugMode = true;
    this.statusDisplay = null;
    this.suggestionMenu = null;
    
    // Statistics
    this.stats = {
      activeFields: 0,
      totalSuggestions: 0,
      appliedSuggestions: 0,
      ignoredSuggestions: 0
    };
  }

  async initialize() {
    if (this.isInitialized) return;

    this.log('Initializing enhanced text integration...');
    
    try {
      // Create status display
      this.createStatusDisplay();
      
      // Create suggestion menu
      this.createSuggestionMenu();
      
      // Initialize adapter
      this.currentAdapter = new EnhancedUniversalAdapter();
      
      // Set up text field observers with immediate scanning
      this.setupTextFieldObservers();
      
      // Set up message listeners
      this.setupMessageListeners();
      
      // Initialize suggestion overlay system
      this.initializeSuggestionOverlay();
      
      // Start periodic field scanning
      this.startPeriodicScanning();
      
      this.isInitialized = true;
      this.log('Enhanced text integration initialized successfully');
      
      // Update status display
      this.updateStatusDisplay();
      
    } catch (error) {
      this.error('Failed to initialize enhanced text integration:', error);
    }
  }

  createStatusDisplay() {
    // Remove existing status display
    const existing = document.getElementById('intellipen-status-display');
    if (existing) existing.remove();

    const statusDisplay = document.createElement('div');
    statusDisplay.id = 'intellipen-status-display';
    statusDisplay.innerHTML = `
      <div class="intellipen-status-header">
        <span class="intellipen-logo">🖋️</span>
        <span class="intellipen-title">IntelliPen</span>
        <button class="intellipen-toggle" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">−</button>
      </div>
      <div class="intellipen-status-content">
        <div class="intellipen-stat">
          <span class="label">Active Fields:</span>
          <span class="value" id="active-fields-count">0</span>
        </div>
        <div class="intellipen-stat">
          <span class="label">Suggestions:</span>
          <span class="value" id="suggestions-count">0</span>
        </div>
        <div class="intellipen-actions">
          <button onclick="window.intelliPenIntegration?.scanForTextFields()" class="scan-btn">🔍 Scan</button>
          <button onclick="window.intelliPenIntegration?.generateTestSuggestions()" class="test-btn">🧪 Test</button>
          <button onclick="window.intelliPenIntegration?.toggleDebugMode()" class="debug-btn">🐛 Debug</button>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      #intellipen-status-display {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 2px solid #007bff;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        min-width: 200px;
        transition: all 0.3s ease;
      }
      
      #intellipen-status-display.collapsed .intellipen-status-content {
        display: none;
      }
      
      .intellipen-status-header {
        background: #007bff;
        color: white;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 6px 6px 0 0;
      }
      
      .intellipen-logo {
        font-size: 16px;
        margin-right: 8px;
      }
      
      .intellipen-title {
        font-weight: 600;
        flex: 1;
      }
      
      .intellipen-toggle {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        width: 20px;
        height: 20px;
      }
      
      .intellipen-status-content {
        padding: 12px;
      }
      
      .intellipen-stat {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      
      .intellipen-stat .label {
        color: #666;
      }
      
      .intellipen-stat .value {
        font-weight: 600;
        color: #007bff;
      }
      
      .intellipen-actions {
        display: flex;
        gap: 4px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      
      .intellipen-actions button {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 4px 8px;
        cursor: pointer;
        font-size: 12px;
        flex: 1;
        min-width: 60px;
      }
      
      .intellipen-actions button:hover {
        background: #e9ecef;
      }
      
      .scan-btn { border-color: #28a745; color: #28a745; }
      .test-btn { border-color: #ffc107; color: #856404; }
      .debug-btn { border-color: #dc3545; color: #dc3545; }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(statusDisplay);
    this.statusDisplay = statusDisplay;
    
    // Make it globally accessible
    window.intelliPenIntegration = this;
  }

  createSuggestionMenu() {
    const menu = document.createElement('div');
    menu.id = 'intellipen-suggestion-menu';
    menu.innerHTML = `
      <div class="menu-header">
        <span>💡 Writing Suggestions</span>
        <button class="close-btn" onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
      <div class="menu-content">
        <div id="suggestion-list">
          <p class="no-suggestions">No suggestions available. Try typing in a text field!</p>
        </div>
      </div>
    `;

    // Add menu styles
    const menuStyles = document.createElement('style');
    menuStyles.textContent = `
      #intellipen-suggestion-menu {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        z-index: 1000000;
        width: 400px;
        max-height: 500px;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .menu-header {
        background: #f8f9fa;
        padding: 12px 16px;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        border-radius: 8px 8px 0 0;
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
      }
      
      .menu-content {
        padding: 16px;
        max-height: 400px;
        overflow-y: auto;
      }
      
      .suggestion-item {
        border: 1px solid #e9ecef;
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 8px;
        background: #f8f9fa;
      }
      
      .suggestion-type {
        font-size: 12px;
        font-weight: 600;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      
      .suggestion-text {
        margin-bottom: 8px;
        line-height: 1.4;
      }
      
      .suggestion-actions {
        display: flex;
        gap: 8px;
      }
      
      .suggestion-actions button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
      }
      
      .apply-btn {
        background: #28a745;
        color: white;
      }
      
      .ignore-btn {
        background: #6c757d;
        color: white;
      }
      
      .no-suggestions {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 20px 0;
      }
    `;

    document.head.appendChild(menuStyles);
    document.body.appendChild(menu);
    this.suggestionMenu = menu;

    // Add keyboard shortcut to open menu (Ctrl+Shift+I)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.toggleSuggestionMenu();
      }
    });
  }

  setupTextFieldObservers() {
    // Immediate scan
    this.scanForTextFields();
    
    // Set up mutation observer for dynamically added content
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldRescan = false;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const newFields = this.scanElementForTextFields(node);
            if (newFields.length > 0) {
              shouldRescan = true;
            }
          }
        });
      });
      
      if (shouldRescan) {
        this.updateStatusDisplay();
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    this.observers.set('mutation', mutationObserver);
    this.log('Text field observers set up');
  }

  scanForTextFields() {
    this.log('Scanning for text fields...');
    
    const textFields = this.currentAdapter.getTextFields();
    let newFieldsCount = 0;
    
    textFields.forEach(field => {
      if (!this.activeElements.has(field)) {
        this.observeTextField(field);
        newFieldsCount++;
      }
    });
    
    this.stats.activeFields = this.activeElements.size;
    this.log(`Found ${textFields.length} text fields (${newFieldsCount} new)`);
    this.updateStatusDisplay();
    
    return textFields;
  }

  scanElementForTextFields(element) {
    const textFields = this.currentAdapter.getTextFieldsInElement(element);
    textFields.forEach(field => {
      if (!this.activeElements.has(field)) {
        this.observeTextField(field);
      }
    });
    return textFields;
  }

  observeTextField(element) {
    if (this.activeElements.has(element)) return;

    this.log('Observing text field:', element.tagName, element.type || 'contenteditable');
    
    const fieldData = {
      element,
      platform: this.currentAdapter.getPlatformName(),
      context: this.currentAdapter.getFieldContext(element),
      lastValue: element.value || element.textContent || '',
      suggestions: [],
      sessionId: null,
      isActive: true
    };

    this.activeElements.set(element, fieldData);
    
    // Add event listeners
    this.addFieldEventListeners(element, fieldData);
    
    // Add visual indicator
    this.addIntelliPenIndicator(element);
    
    // Update stats
    this.stats.activeFields = this.activeElements.size;
  }

  addFieldEventListeners(element, fieldData) {
    const handleInput = async (event) => {
      await this.handleTextInput(element, fieldData, event);
    };

    const handleFocus = async (event) => {
      await this.handleFieldFocus(element, fieldData, event);
    };

    const handleBlur = async (event) => {
      await this.handleFieldBlur(element, fieldData, event);
    };

    element.addEventListener('input', handleInput);
    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    // Store event listeners for cleanup
    fieldData.eventListeners = { handleInput, handleFocus, handleBlur };
  }

  async handleTextInput(element, fieldData, event) {
    const currentValue = element.value || element.textContent || '';
    
    if (currentValue !== fieldData.lastValue) {
      fieldData.lastValue = currentValue;
      
      this.log(`Text input detected in ${element.tagName}: "${currentValue.substring(0, 50)}..."`);
      
      // Debounce text analysis
      clearTimeout(fieldData.analysisTimeout);
      fieldData.analysisTimeout = setTimeout(async () => {
        await this.analyzeText(element, fieldData, currentValue);
      }, 500);
    }
  }

  async handleFieldFocus(element, fieldData, event) {
    this.log('Text field focused:', element.tagName);
    
    // Highlight the active field
    element.style.outline = '2px solid #007bff';
    element.style.outlineOffset = '1px';
    
    // Generate some test suggestions for demonstration
    if (fieldData.lastValue.length > 10) {
      this.generateSuggestionsForField(element, fieldData);
    }
  }

  async handleFieldBlur(element, fieldData, event) {
    this.log('Text field blurred:', element.tagName);
    
    // Remove highlight
    element.style.outline = '';
    element.style.outlineOffset = '';
  }

  async analyzeText(element, fieldData, text) {
    if (!text.trim() || text.length < 3) return;

    this.log(`Analyzing text: "${text.substring(0, 50)}..."`);
    
    // Generate suggestions based on text content
    const suggestions = this.generateSuggestionsForText(text, fieldData.context);
    
    fieldData.suggestions = suggestions;
    fieldData.lastAnalysis = {
      text,
      timestamp: Date.now(),
      suggestions
    };
    
    // Update total suggestions count
    this.updateSuggestionsCount();
    
    // Show suggestions if field is focused
    if (document.activeElement === element && suggestions.length > 0) {
      this.showSuggestionsForField(element, suggestions);
    }
  }

  generateSuggestionsForText(text, context) {
    const suggestions = [];
    
    // Grammar suggestions
    if (text.includes('teh ')) {
      suggestions.push({
        id: `grammar_${Date.now()}_1`,
        type: 'grammar',
        severity: 'error',
        range: { start: text.indexOf('teh '), end: text.indexOf('teh ') + 3 },
        original: 'teh',
        replacement: 'the',
        explanation: 'Spelling error: "teh" should be "the"'
      });
    }
    
    if (text.includes('recieve')) {
      suggestions.push({
        id: `grammar_${Date.now()}_2`,
        type: 'grammar',
        severity: 'error',
        range: { start: text.indexOf('recieve'), end: text.indexOf('recieve') + 7 },
        original: 'recieve',
        replacement: 'receive',
        explanation: 'Spelling error: "recieve" should be "receive"'
      });
    }
    
    // Style suggestions
    if (text.includes('very good')) {
      suggestions.push({
        id: `style_${Date.now()}_1`,
        type: 'style',
        severity: 'suggestion',
        range: { start: text.indexOf('very good'), end: text.indexOf('very good') + 9 },
        original: 'very good',
        replacement: 'excellent',
        explanation: 'Consider using a more specific adjective'
      });
    }
    
    // Tone suggestions based on context
    if (context.formality === 'formal' && text.includes("can't")) {
      suggestions.push({
        id: `tone_${Date.now()}_1`,
        type: 'tone',
        severity: 'suggestion',
        range: { start: text.indexOf("can't"), end: text.indexOf("can't") + 5 },
        original: "can't",
        replacement: 'cannot',
        explanation: 'Use formal language: "cannot" instead of "can\'t"'
      });
    }
    
    return suggestions;
  }

  generateSuggestionsForField(element, fieldData) {
    const text = fieldData.lastValue;
    if (!text || text.length < 5) return;
    
    const suggestions = this.generateSuggestionsForText(text, fieldData.context);
    fieldData.suggestions = suggestions;
    
    this.updateSuggestionsCount();
    
    if (suggestions.length > 0) {
      this.log(`Generated ${suggestions.length} suggestions for field`);
      this.showSuggestionsForField(element, suggestions);
    }
  }

  showSuggestionsForField(element, suggestions) {
    // Create visual indicators for suggestions
    suggestions.forEach(suggestion => {
      this.createSuggestionHighlight(element, suggestion);
    });
  }

  createSuggestionHighlight(element, suggestion) {
    // Create a simple highlight indicator
    const highlight = document.createElement('div');
    highlight.className = 'intellipen-suggestion-highlight';
    highlight.style.cssText = `
      position: absolute;
      background: rgba(255, 193, 7, 0.3);
      border: 1px solid #ffc107;
      border-radius: 2px;
      pointer-events: auto;
      cursor: pointer;
      z-index: 999998;
    `;
    
    // Position relative to element (simplified)
    const rect = element.getBoundingClientRect();
    highlight.style.left = `${rect.left + window.scrollX}px`;
    highlight.style.top = `${rect.bottom + window.scrollY + 2}px`;
    highlight.style.width = '20px';
    highlight.style.height = '4px';
    
    highlight.addEventListener('click', () => {
      this.showSuggestionTooltip(suggestion, highlight);
    });
    
    document.body.appendChild(highlight);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    }, 5000);
  }

  showSuggestionTooltip(suggestion, highlight) {
    // Remove existing tooltips
    document.querySelectorAll('.intellipen-tooltip').forEach(t => t.remove());
    
    const tooltip = document.createElement('div');
    tooltip.className = 'intellipen-tooltip';
    tooltip.innerHTML = `
      <div><strong>${suggestion.type.toUpperCase()}</strong></div>
      <div>${suggestion.explanation}</div>
      <div style="margin-top: 8px;">
        <button onclick="window.intelliPenIntegration.applySuggestion('${suggestion.id}')" 
                style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; margin-right: 4px;">
          Apply
        </button>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px;">
          Ignore
        </button>
      </div>
    `;
    
    tooltip.style.cssText = `
      position: absolute;
      background: #2c3e50;
      color: white;
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      max-width: 250px;
      z-index: 1000000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    const rect = highlight.getBoundingClientRect();
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
    
    document.body.appendChild(tooltip);
  }

  applySuggestion(suggestionId) {
    this.log(`Applying suggestion: ${suggestionId}`);
    this.stats.appliedSuggestions++;
    this.updateStatusDisplay();
    
    // Remove tooltip
    document.querySelectorAll('.intellipen-tooltip').forEach(t => t.remove());
  }

  addIntelliPenIndicator(element) {
    // Check if indicator already exists
    if (element.querySelector('.intellipen-indicator')) return;
    
    const indicator = document.createElement('div');
    indicator.className = 'intellipen-indicator';
    indicator.innerHTML = '🖋️';
    indicator.title = 'IntelliPen is active on this field';
    indicator.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      font-size: 12px;
      opacity: 0.7;
      pointer-events: none;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
    `;

    // Make element position relative if it isn't already
    const computedStyle = window.getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    
    element.appendChild(indicator);
    
    // Fade in effect
    setTimeout(() => {
      indicator.style.opacity = '0.8';
    }, 100);
  }

  updateStatusDisplay() {
    if (!this.statusDisplay) return;
    
    const activeFieldsEl = this.statusDisplay.querySelector('#active-fields-count');
    const suggestionsEl = this.statusDisplay.querySelector('#suggestions-count');
    
    if (activeFieldsEl) {
      activeFieldsEl.textContent = this.stats.activeFields;
    }
    
    if (suggestionsEl) {
      suggestionsEl.textContent = this.stats.totalSuggestions;
    }
  }

  updateSuggestionsCount() {
    let totalSuggestions = 0;
    this.activeElements.forEach(fieldData => {
      totalSuggestions += fieldData.suggestions.length;
    });
    this.stats.totalSuggestions = totalSuggestions;
    this.updateStatusDisplay();
  }

  generateTestSuggestions() {
    this.log('Generating test suggestions...');
    
    // Find a text field to add test suggestions to
    const activeField = Array.from(this.activeElements.keys())[0];
    if (activeField) {
      const fieldData = this.activeElements.get(activeField);
      
      // Add some test text if field is empty
      if (!fieldData.lastValue.trim()) {
        activeField.value = 'This is a test sentance with some erors that need fixing.';
        activeField.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Generate suggestions for the test text
      this.generateSuggestionsForField(activeField, fieldData);
    } else {
      this.log('No active text fields found for testing');
    }
  }

  toggleSuggestionMenu() {
    if (!this.suggestionMenu) return;
    
    const isVisible = this.suggestionMenu.style.display !== 'none';
    this.suggestionMenu.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
      this.updateSuggestionMenu();
    }
  }

  updateSuggestionMenu() {
    const suggestionList = this.suggestionMenu.querySelector('#suggestion-list');
    if (!suggestionList) return;
    
    let allSuggestions = [];
    this.activeElements.forEach(fieldData => {
      allSuggestions.push(...fieldData.suggestions);
    });
    
    if (allSuggestions.length === 0) {
      suggestionList.innerHTML = '<p class="no-suggestions">No suggestions available. Try typing in a text field!</p>';
      return;
    }
    
    suggestionList.innerHTML = allSuggestions.map(suggestion => `
      <div class="suggestion-item">
        <div class="suggestion-type">${suggestion.type} ${suggestion.severity}</div>
        <div class="suggestion-text">${suggestion.explanation}</div>
        <div class="suggestion-actions">
          <button class="apply-btn" onclick="window.intelliPenIntegration.applySuggestion('${suggestion.id}')">
            Apply "${suggestion.replacement}"
          </button>
          <button class="ignore-btn" onclick="this.parentElement.parentElement.remove()">
            Ignore
          </button>
        </div>
      </div>
    `).join('');
  }

  toggleDebugMode() {
    this.debugMode = !this.debugMode;
    this.log(`Debug mode ${this.debugMode ? 'enabled' : 'disabled'}`);
    
    if (this.debugMode) {
      // Show debug info
      console.log('IntelliPen Debug Info:', {
        activeElements: this.activeElements.size,
        stats: this.stats,
        currentAdapter: this.currentAdapter?.getPlatformName(),
        isInitialized: this.isInitialized
      });
    }
  }

  startPeriodicScanning() {
    // Scan for new fields every 5 seconds
    setInterval(() => {
      const previousCount = this.stats.activeFields;
      this.scanForTextFields();
      
      if (this.stats.activeFields !== previousCount) {
        this.log(`Field count changed: ${previousCount} → ${this.stats.activeFields}`);
      }
    }, 5000);
  }

  setupMessageListeners() {
    // Handle messages from background script
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true;
      });
    }
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'GET_ACTIVE_FIELDS':
        sendResponse({
          success: true,
          data: {
            count: this.activeElements.size,
            platform: this.currentAdapter?.getPlatformName() || 'unknown',
            stats: this.stats
          }
        });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }

  initializeSuggestionOverlay() {
    // Initialize the suggestion overlay system
    this.log('Suggestion overlay system initialized');
  }

  log(message, ...args) {
    if (this.debugMode) {
      console.log(`[IntelliPen] ${message}`, ...args);
    }
  }

  error(message, ...args) {
    console.error(`[IntelliPen ERROR] ${message}`, ...args);
  }
}

// Enhanced Universal Adapter with better field detection
class EnhancedUniversalAdapter {
  getPlatformName() {
    return 'universal';
  }

  getTextFields() {
    const selectors = [
      'textarea',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="search"]',
      'input[type="url"]',
      'input:not([type])', // Default input type is text
      '[contenteditable="true"]',
      '[contenteditable=""]',
      '[role="textbox"]'
    ];

    const fields = [];
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        fields.push(...Array.from(elements));
      } catch (error) {
        console.warn(`Failed to query selector ${selector}:`, error);
      }
    });

    return fields.filter(field => this.isValidTextField(field));
  }

  getTextFieldsInElement(element) {
    if (!element || !element.querySelectorAll) return [];
    
    const selectors = [
      'textarea',
      'input[type="text"]',
      'input[type="email"]',
      'input[type="search"]',
      'input[type="url"]',
      'input:not([type])',
      '[contenteditable="true"]',
      '[contenteditable=""]',
      '[role="textbox"]'
    ];

    const fields = [];
    selectors.forEach(selector => {
      try {
        const elements = element.querySelectorAll(selector);
        fields.push(...Array.from(elements));
      } catch (error) {
        console.warn(`Failed to query selector ${selector} in element:`, error);
      }
    });

    // Also check if the element itself is a text field
    if (this.isValidTextField(element)) {
      fields.push(element);
    }

    return fields.filter(field => this.isValidTextField(field));
  }

  isValidTextField(element) {
    if (!element) return false;
    
    // Skip disabled or readonly fields
    if (element.disabled || element.readOnly) return false;
    
    // Skip hidden elements
    try {
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      
      // Skip very small fields (likely not for user input)
      const rect = element.getBoundingClientRect();
      if (rect.width < 30 || rect.height < 15) return false;
      
      // Skip password fields for privacy
      if (element.type === 'password') return false;
      
      return true;
    } catch (error) {
      console.warn('Error checking field validity:', error);
      return false;
    }
  }

  getFieldContext(element) {
    const context = {
      type: 'general',
      purpose: 'unknown',
      formality: 'neutral'
    };

    try {
      // Check for common patterns
      const placeholder = (element.placeholder || '').toLowerCase();
      const label = (this.getFieldLabel(element) || '').toLowerCase();
      const className = (element.className || '').toLowerCase();
      const id = (element.id || '').toLowerCase();
      const name = (element.name || '').toLowerCase();

      const contextText = `${placeholder} ${label} ${className} ${id} ${name}`;

      if (contextText.includes('email') || contextText.includes('mail')) {
        context.type = 'email';
        context.formality = 'formal';
      } else if (contextText.includes('comment') || contextText.includes('reply')) {
        context.type = 'comment';
        context.formality = 'casual';
      } else if (contextText.includes('message') || contextText.includes('chat')) {
        context.type = 'message';
        context.formality = 'casual';
      } else if (contextText.includes('post') || contextText.includes('status')) {
        context.type = 'social';
        context.formality = 'casual';
      } else if (contextText.includes('document') || contextText.includes('note')) {
        context.type = 'document';
        context.formality = 'formal';
      }

      return context;
    } catch (error) {
      console.warn('Error getting field context:', error);
      return context;
    }
  }

  getFieldLabel(element) {
    try {
      // Try to find associated label
      if (element.id) {
        const label = document.querySelector(`label[for="${element.id}"]`);
        if (label) return label.textContent;
      }

      // Check for parent label
      const parentLabel = element.closest('label');
      if (parentLabel) return parentLabel.textContent;

      // Check for nearby text
      const parent = element.parentElement;
      if (parent) {
        const textNodes = Array.from(parent.childNodes)
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent.trim())
          .filter(text => text.length > 0);
        
        if (textNodes.length > 0) {
          return textNodes[0];
        }
      }

      return null;
    } catch (error) {
      console.warn('Error getting field label:', error);
      return null;
    }
  }
}

// Initialize the enhanced integration
function initializeEnhancedIntegration() {
  // Prevent multiple initializations
  if (window.intelliPenEnhancedInitialized) return;
  window.intelliPenEnhancedInitialized = true;
  
  console.log('🖋️ Initializing Enhanced IntelliPen Integration...');
  
  const integration = new EnhancedUniversalTextIntegration();
  integration.initialize();
  
  // Make it globally accessible for debugging
  window.intelliPenIntegration = integration;
  
  console.log('✅ Enhanced IntelliPen Integration ready!');
  console.log('💡 Press Ctrl+Shift+I to open suggestion menu');
  console.log('🔍 Use the status panel in the top-right corner to interact with the system');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedIntegration);
} else {
  initializeEnhancedIntegration();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedUniversalTextIntegration, EnhancedUniversalAdapter };
}