var IntelliPenUniversalIntegration = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var universalIntegration$1 = {exports: {}};

	/**
	 * IntelliPen Universal Integration Content Script
	 * Handles text field detection and platform-specific integrations
	 */

	(function (module) {
		class UniversalTextIntegration {
		  constructor() {
		    this.isInitialized = false;
		    this.activeElements = new Map();
		    this.observers = new Map();
		    this.currentAdapter = null;
		    this.extensionReady = false;
		    this.adapterLoader = null;

		    // Platform-specific adapters will be loaded dynamically
		    this.platformAdapters = {
		      'gmail.com': 'GmailAdapter',
		      'linkedin.com': 'LinkedInAdapter',
		      'notion.so': 'NotionAdapter',
		      'notion.site': 'NotionAdapter',
		      'docs.google.com': 'GoogleDocsAdapter'
		    };
		  }

		  async initialize() {
		    if (this.isInitialized) return;

		    console.log('IntelliPen: Initializing universal text integration...');

		    try {
		      // Mark as injected to prevent duplicate injection
		      window.intelliPenInjected = true;

		      // Check Chrome AI API availability first
		      await this.checkChromeAIAPIs();

		      // Initialize adapter loader
		      this.adapterLoader = new (window.AdapterLoader || class {
		        async loadAdaptersForCurrentSite() { return { loaded: [], failed: [] }; }
		        getAdapterForSite() { return 'UniversalAdapter'; }
		      })();

		      // Load platform-specific adapters
		      await this.loadPlatformAdapters();

		      // Wait for extension to be ready
		      await this.waitForExtensionReady();

		      // Detect current platform and create adapter
		      this.detectPlatform();

		      // Set up text field observers
		      this.setupTextFieldObservers();

		      // Set up message listeners
		      this.setupMessageListeners();

		      // Initialize suggestion overlay system
		      this.initializeSuggestionOverlay();

		      this.isInitialized = true;
		      console.log('IntelliPen: Universal text integration initialized');

		    } catch (error) {
		      console.error('IntelliPen: Failed to initialize universal text integration:', error);
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
		      { name: 'Translator', object: 'Translator', key: 'ai.translator' }
		    ];

		    const availability = {};

		    for (const api of apis) {
		      try {
		        // Check if the API object exists in the global scope
		        if (api.object in window) {
		          const apiObject = window[api.object];

		          if (typeof apiObject.availability === 'function') {
		            try {
		              let status;

		              // Handle special cases for different APIs
		              if (api.object === 'LanguageModel') {
		                // Language Model requires output language specification
		                status = await apiObject.availability({ outputLanguage: 'en' });
		              } else if (api.object === 'Translator') {
		                // Translator requires source and target language parameters
		                status = await apiObject.availability({
		                  sourceLanguage: 'en',
		                  targetLanguage: 'es'
		                });
		              } else {
		                // Other APIs can be called without parameters
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

		  getNestedProperty(obj, path) {
		    return path.reduce((current, key) => current && current[key], obj);
		  }

		  async waitForExtensionReady() {
		    return new Promise((resolve) => {
		      const checkReady = () => {
		        chrome.runtime.sendMessage({ type: 'GET_EXTENSION_STATUS' }, (response) => {
		          if (chrome.runtime.lastError) {
		            setTimeout(checkReady, 100);
		            return;
		          }

		          if (response?.success && response.data?.initialized) {
		            this.extensionReady = true;
		            resolve();
		          } else {
		            setTimeout(checkReady, 100);
		          }
		        });
		      };

		      checkReady();
		    });
		  }

		  async loadPlatformAdapters() {
		    try {
		      if (this.adapterLoader.loadAdaptersForCurrentSite) {
		        const result = await this.adapterLoader.loadAdaptersForCurrentSite();
		        console.log('IntelliPen: Loaded adapters:', result.loaded);
		        if (result.failed.length > 0) {
		          console.warn('IntelliPen: Failed to load adapters:', result.failed);
		        }
		      }
		    } catch (error) {
		      console.error('IntelliPen: Failed to load platform adapters:', error);
		    }
		  }

		  detectPlatform() {
		    const hostname = window.location.hostname;
		    const adapterName = this.adapterLoader ?
		      this.adapterLoader.getAdapterForSite(hostname) :
		      this.platformAdapters[hostname] || 'UniversalAdapter';

		    console.log(`IntelliPen: Detected platform: ${hostname} (${adapterName})`);
		    this.currentAdapter = this.createAdapter(adapterName);
		  }

		  createAdapter(adapterName) {
		    // Create platform-specific adapters
		    try {
		      switch (adapterName) {
		        case 'GmailAdapter':
		          if (window.GmailAdapter) {
		            return new window.GmailAdapter();
		          }
		          break;
		        case 'LinkedInAdapter':
		          if (window.LinkedInAdapter) {
		            return new window.LinkedInAdapter();
		          }
		          break;
		        case 'NotionAdapter':
		          if (window.NotionAdapter) {
		            return new window.NotionAdapter();
		          }
		          break;
		        case 'GoogleDocsAdapter':
		          if (window.GoogleDocsAdapter) {
		            return new window.GoogleDocsAdapter();
		          }
		          break;
		        case 'UniversalAdapter':
		          if (window.UniversalAdapter) {
		            return new window.UniversalAdapter();
		          }
		          break;
		      }

		      // Fallback to built-in UniversalAdapter
		      console.log(`IntelliPen: Using fallback adapter for ${adapterName}`);
		      return new UniversalAdapter();

		    } catch (error) {
		      console.error(`IntelliPen: Failed to create adapter ${adapterName}:`, error);
		      return new UniversalAdapter();
		    }
		  }

		  setupTextFieldObservers() {
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

		    this.observers.set('mutation', mutationObserver);
		    console.log('IntelliPen: Text field observers set up');
		  }

		  scanForTextFields() {
		    const textFields = this.currentAdapter.getTextFields();
		    textFields.forEach(field => this.observeTextField(field));
		    console.log(`IntelliPen: Found ${textFields.length} text fields`);
		  }

		  scanElementForTextFields(element) {
		    const textFields = this.currentAdapter.getTextFieldsInElement(element);
		    textFields.forEach(field => this.observeTextField(field));
		  }

		  observeTextField(element) {
		    if (this.activeElements.has(element)) return;

		    console.log('IntelliPen: Observing text field:', element);

		    const fieldData = {
		      element,
		      platform: this.currentAdapter.getPlatformName(),
		      context: this.currentAdapter.getFieldContext(element),
		      lastValue: element.value || element.textContent || '',
		      suggestions: [],
		      sessionId: null
		    };

		    this.activeElements.set(element, fieldData);

		    // Add event listeners
		    this.addFieldEventListeners(element, fieldData);

		    // Add visual indicator
		    this.addIntelliPenIndicator(element);
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

		      // Debounce text analysis
		      clearTimeout(fieldData.analysisTimeout);
		      fieldData.analysisTimeout = setTimeout(async () => {
		        await this.analyzeText(element, fieldData, currentValue);
		      }, 300);
		    }
		  }

		  async handleFieldFocus(element, fieldData, event) {
		    console.log('IntelliPen: Text field focused');

		    // Initialize writing session if not already active
		    if (!fieldData.sessionId) {
		      try {
		        const response = await chrome.runtime.sendMessage({
		          type: 'INITIALIZE_WRITING_SESSION',
		          data: {
		            tabId: await this.getCurrentTabId(),
		            platform: fieldData.platform,
		            context: fieldData.context
		          }
		        });

		        if (response?.success) {
		          fieldData.sessionId = response.data.id;
		          console.log(`IntelliPen: Writing session ${fieldData.sessionId} initialized`);
		        }
		      } catch (error) {
		        console.error('IntelliPen: Failed to initialize writing session:', error);
		      }
		    }
		  }

		  async handleFieldBlur(element, fieldData, event) {
		    console.log('IntelliPen: Text field blurred');
		    // Could save session state or cleanup temporary data
		  }

		  async analyzeText(element, fieldData, text) {
		    if (!text.trim() || text.length < 3) return;

		    console.log('IntelliPen: Analyzing text:', text.substring(0, 50) + '...');

		    // This will be implemented in later tasks with actual AI API calls
		    // For now, just log the analysis request
		    fieldData.lastAnalysis = {
		      text,
		      timestamp: Date.now(),
		      suggestions: [] // Will be populated by AI APIs
		    };
		  }

		  addIntelliPenIndicator(element) {
		    // Add a subtle visual indicator that IntelliPen is active
		    const indicator = document.createElement('div');
		    indicator.className = 'intellipen-indicator';
		    indicator.innerHTML = '🖋️';
		    indicator.style.cssText = `
      position: absolute;
      top: 2px;
      right: 2px;
      width: 16px;
      height: 16px;
      font-size: 12px;
      opacity: 0.6;
      pointer-events: none;
      z-index: 10000;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

		    // Position relative to the text field
		    const rect = element.getBoundingClientRect();
		    if (rect.width > 50 && rect.height > 20) {
		      element.style.position = element.style.position || 'relative';
		      element.appendChild(indicator);
		    }
		  }

		  initializeSuggestionOverlay() {
		    // Create overlay container for suggestions
		    const overlay = document.createElement('div');
		    overlay.id = 'intellipen-suggestion-overlay';
		    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
    `;

		    document.body.appendChild(overlay);
		    this.suggestionOverlay = overlay;

		    console.log('IntelliPen: Suggestion overlay initialized');
		  }

		  setupMessageListeners() {
		    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		      this.handleMessage(message, sender, sendResponse);
		      return true;
		    });
		  }

		  handleMessage(message, sender, sendResponse) {
		    switch (message.type) {
		      case 'EXTENSION_READY':
		        this.extensionReady = true;
		        console.log('IntelliPen: Extension ready signal received');
		        sendResponse({ success: true });
		        break;

		      case 'GET_ACTIVE_FIELDS':
		        sendResponse({
		          success: true,
		          data: {
		            count: this.activeElements.size,
		            platform: this.currentAdapter?.getPlatformName() || 'unknown'
		          }
		        });
		        break;

		      case 'WRITING_INTELLIGENCE_TOGGLED':
		        this.handleWritingIntelligenceToggle(message.data.enabled);
		        sendResponse({ success: true });
		        break;

		      case 'MEETING_INTELLIGENCE_TOGGLED':
		        this.handleMeetingIntelligenceToggle(message.data.enabled);
		        sendResponse({ success: true });
		        break;

		      case 'CHECK_CHROME_AI_APIS':
		        // Re-check Chrome AI APIs and send update to background
		        this.checkChromeAIAPIs().then(() => {
		          sendResponse({ success: true });
		        }).catch(error => {
		          console.error('Failed to check Chrome AI APIs:', error);
		          sendResponse({ success: false, error: error.message });
		        });
		        return true; // Keep message channel open for async response

		      case 'SHOW_GRAMMAR_OVERLAY':
		        this.handleShowGrammarOverlay(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'SHOW_WRITING_SUGGESTIONS':
		        this.handleShowWritingSuggestions(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'REWRITE_WITH_TONE':
		        this.handleRewriteWithTone(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'SHOW_SUMMARY':
		        this.handleShowSummary(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'SHOW_TRANSLATION':
		        this.handleShowTranslation(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'SHOW_WRITING_OVERLAY':
		        this.handleShowWritingOverlay(message.data);
		        sendResponse({ success: true });
		        break;

		      default:
		        sendResponse({ success: false, error: 'Unknown message type' });
		    }
		  }

		  async getCurrentTabId() {
		    return new Promise((resolve) => {
		      chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB_ID' }, (response) => {
		        resolve(response?.tabId || null);
		      });
		    });
		  }

		  handleWritingIntelligenceToggle(enabled) {
		    console.log(`IntelliPen: Writing intelligence ${enabled ? 'enabled' : 'disabled'}`);

		    if (enabled) {
		      // Re-enable writing intelligence features
		      this.setupTextFieldObservers();

		      // Reactivate existing elements
		      this.activeElements.forEach((elementData, element) => {
		        if (elementData.type === 'writing') {
		          this.activateElement(element);
		        }
		      });
		    } else {
		      // Disable writing intelligence features
		      this.activeElements.forEach((elementData, element) => {
		        if (elementData.type === 'writing') {
		          this.deactivateElement(element);
		        }
		      });
		    }
		  }

		  handleMeetingIntelligenceToggle(enabled) {
		    console.log(`IntelliPen: Meeting intelligence ${enabled ? 'enabled' : 'disabled'}`);
		  }

		  activateElement(element) {
		    // Add visual indicators or event listeners for active elements
		    if (element && !element.classList.contains('intellipen-active')) {
		      element.classList.add('intellipen-active');
		      console.log('IntelliPen: Element activated for writing intelligence');
		    }
		  }

		  deactivateElement(element) {
		    // Remove visual indicators and event listeners
		    if (element && element.classList.contains('intellipen-active')) {
		      element.classList.remove('intellipen-active');
		      console.log('IntelliPen: Element deactivated from writing intelligence');
		    }
		  }

		  async handleShowGrammarOverlay(data) {
		    console.log('IntelliPen: Showing grammar overlay for:', data.text);

		    // Load grammar overlay if not already loaded
		    await this.loadGrammarOverlay();

		    // Create demo suggestions for now (will be replaced with real AI analysis)
		    const suggestions = this.createDemoGrammarSuggestions(data.text);

		    console.log('IntelliPen: Created suggestions:', suggestions);
		    console.log('IntelliPen: Position:', data.position);

		    // Show overlay
		    if (window.IntelliPenGrammarOverlay) {
		      console.log('IntelliPen: Grammar overlay found, calling showSuggestions...');

		      // Use a more reliable element or create a dummy one
		      const targetElement = this.findBestTargetElement() || document.body;

		      window.IntelliPenGrammarOverlay.showSuggestions({
		        element: targetElement,
		        suggestions: suggestions,
		        position: data.position || { x: 100, y: 100 }
		      });

		      console.log('IntelliPen: showSuggestions called');
		    } else {
		      console.error('IntelliPen: Grammar overlay not available');
		    }
		  }

		  findBestTargetElement() {
		    // Try to find the best element to attach the overlay to
		    const activeElement = document.activeElement;

		    // Check if active element is a text field
		    if (this.isValidTextField(activeElement)) {
		      return activeElement;
		    }

		    // Look for focused text fields
		    const focusedFields = document.querySelectorAll('input:focus, textarea:focus, [contenteditable="true"]:focus');
		    if (focusedFields.length > 0) {
		      return focusedFields[0];
		    }

		    // Look for any text field that was recently active
		    const textFields = document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]');
		    if (textFields.length > 0) {
		      return textFields[0];
		    }

		    // Fallback to body
		    return document.body;
		  }

		  async handleShowWritingSuggestions(data) {
		    console.log('IntelliPen: Showing writing suggestions for:', data.text);

		    await this.loadGrammarOverlay();

		    const suggestions = this.createDemoWritingSuggestions(data.text);

		    if (window.IntelliPenGrammarOverlay) {
		      const targetElement = this.findBestTargetElement() || document.body;

		      window.IntelliPenGrammarOverlay.showSuggestions({
		        element: targetElement,
		        suggestions: suggestions,
		        position: data.position || { x: 100, y: 100 }
		      });
		    }
		  }

		  async handleRewriteWithTone(data) {
		    console.log('IntelliPen: Rewriting with tone:', data.tone);

		    await this.loadGrammarOverlay();

		    const suggestions = this.createToneRewriteSuggestions(data.text, data.tone);

		    if (window.IntelliPenGrammarOverlay) {
		      const targetElement = this.findBestTargetElement() || document.body;

		      window.IntelliPenGrammarOverlay.showSuggestions({
		        element: targetElement,
		        suggestions: suggestions,
		        position: data.position || { x: 100, y: 100 }
		      });
		    }
		  }

		  async handleShowSummary(data) {
		    console.log('IntelliPen: Showing summary for:', data.text);

		    await this.loadGrammarOverlay();

		    const suggestions = [{
		      type: 'summary',
		      text: this.createDemoSummary(data.text),
		      explanation: 'AI-generated summary of selected text'
		    }];

		    if (window.IntelliPenGrammarOverlay) {
		      window.IntelliPenGrammarOverlay.showSuggestions({
		        element: document.activeElement,
		        suggestions: suggestions,
		        position: data.position
		      });
		    }
		  }

		  async handleShowTranslation(data) {
		    console.log('IntelliPen: Showing translation for:', data.text);

		    await this.loadGrammarOverlay();

		    const suggestions = [{
		      type: 'translation',
		      text: `[Translation of: "${data.text.substring(0, 50)}..."]`,
		      explanation: 'Translation feature coming soon'
		    }];

		    if (window.IntelliPenGrammarOverlay) {
		      window.IntelliPenGrammarOverlay.showSuggestions({
		        element: document.activeElement,
		        suggestions: suggestions,
		        position: data.position
		      });
		    }
		  }

		  async handleShowWritingOverlay(data) {
		    console.log('IntelliPen: Showing writing overlay');

		    await this.loadGrammarOverlay();

		    // Find the currently focused text element
		    const activeElement = document.activeElement;
		    if (this.isValidTextField(activeElement)) {
		      const text = activeElement.value || activeElement.textContent || '';
		      if (text.trim()) {
		        const suggestions = this.createDemoGrammarSuggestions(text);
		        const rect = activeElement.getBoundingClientRect();

		        if (window.IntelliPenGrammarOverlay) {
		          window.IntelliPenGrammarOverlay.showSuggestions({
		            element: activeElement,
		            suggestions: suggestions,
		            position: { x: rect.left + rect.width / 2, y: rect.bottom + 10 }
		          });
		        }
		      } else {
		        this.showTemporaryMessage('No text found to analyze');
		      }
		    } else {
		      this.showTemporaryMessage('Please click on a text field first');
		    }
		  }

		  async loadGrammarOverlay() {
		    if (window.IntelliPenGrammarOverlay) {
		      console.log('IntelliPen: Grammar overlay already loaded');
		      return;
		    }

		    console.log('IntelliPen: Loading grammar overlay...');

		    try {
		      // Check if Chrome extension APIs are available
		      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
		        const script = document.createElement('script');
		        script.src = chrome.runtime.getURL('content-scripts/grammar-overlay.js');

		        await new Promise((resolve, reject) => {
		          script.onload = () => {
		            console.log('IntelliPen: Grammar overlay script loaded');
		            resolve();
		          };
		          script.onerror = (error) => {
		            console.error('IntelliPen: Failed to load grammar overlay script:', error);
		            reject(error);
		          };
		          (document.head || document.documentElement).appendChild(script);
		        });

		        // Wait for the overlay to initialize with retries
		        let retries = 0;
		        const maxRetries = 10;

		        while (!window.IntelliPenGrammarOverlay && retries < maxRetries) {
		          await new Promise(resolve => setTimeout(resolve, 100));
		          retries++;
		          console.log(`IntelliPen: Waiting for grammar overlay... attempt ${retries}`);
		        }

		        if (window.IntelliPenGrammarOverlay) {
		          console.log('IntelliPen: Grammar overlay initialized successfully');
		        } else {
		          console.error('IntelliPen: Grammar overlay not found after loading and waiting');
		        }
		      } else {
		        console.warn('IntelliPen: Chrome extension APIs not available, cannot load grammar overlay');
		      }
		    } catch (error) {
		      console.error('IntelliPen: Failed to load grammar overlay:', error);
		    }
		  }

		  createDemoGrammarSuggestions(text) {
		    const suggestions = [];

		    // Simple grammar checks (demo purposes)
		    if (text.includes('i ')) {
		      suggestions.push({
		        type: 'grammar',
		        original: 'i ',
		        replacement: 'I ',
		        explanation: 'Capitalize the pronoun "I"'
		      });
		    }

		    if (text.includes('alot')) {
		      suggestions.push({
		        type: 'grammar',
		        original: 'alot',
		        replacement: 'a lot',
		        explanation: '"A lot" should be two words'
		      });
		    }

		    if (text.includes('there is')) {
		      suggestions.push({
		        type: 'style',
		        original: 'there is',
		        replacement: 'there\'s',
		        explanation: 'Consider using contraction for casual tone'
		      });
		    }

		    // Add a general improvement suggestion
		    if (text.length > 20) {
		      suggestions.push({
		        type: 'clarity',
		        text: 'Consider breaking this into shorter sentences for better readability',
		        explanation: 'Shorter sentences are easier to read and understand'
		      });
		    }

		    return suggestions.length > 0 ? suggestions : [{
		      type: 'grammar',
		      text: 'No grammar issues detected! ✓',
		      explanation: 'Your text looks good'
		    }];
		  }

		  createDemoWritingSuggestions(text) {
		    return [
		      {
		        type: 'style',
		        text: 'Consider using more specific verbs',
		        explanation: 'Strong verbs make writing more engaging'
		      },
		      {
		        type: 'clarity',
		        text: 'Add transition words to improve flow',
		        explanation: 'Words like "however", "therefore", "meanwhile" help connect ideas'
		      },
		      {
		        type: 'tone',
		        text: 'Vary sentence length for better rhythm',
		        explanation: 'Mix short and long sentences to keep readers engaged'
		      }
		    ];
		  }

		  createToneRewriteSuggestions(text, tone) {
		    const toneMap = {
		      formal: 'More formal version: Consider using professional language and complete sentences',
		      casual: 'More casual version: Use contractions and conversational language',
		      professional: 'Professional version: Use industry-appropriate terminology and clear structure'
		    };

		    return [{
		      type: 'tone',
		      text: toneMap[tone] || 'Tone adjustment suggestion',
		      explanation: `Rewriting text to be more ${tone}`
		    }];
		  }

		  createDemoSummary(text) {
		    if (text.length < 50) {
		      return 'Text is already concise';
		    }

		    const words = text.split(' ');
		    const summaryLength = Math.max(10, Math.floor(words.length / 3));
		    return `Summary: ${words.slice(0, summaryLength).join(' ')}...`;
		  }

		  showTemporaryMessage(message) {
		    const notification = document.createElement('div');
		    notification.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #3b82f6 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      z-index: 1000001 !important;
      animation: intellipen-slide-in 0.3s ease-out !important;
      pointer-events: none !important;
    `;
		    notification.textContent = message;

		    document.body.appendChild(notification);

		    setTimeout(() => {
		      notification.remove();
		    }, 3000);
		  }

		  isValidTextField(element) {
		    if (!element || element.disabled || element.readOnly) return false;

		    // Skip IntelliPen overlay containers
		    if (element.id && element.id.includes('intellipen')) return false;
		    if (element.className && element.className.includes('intellipen')) return false;

		    const tagName = element.tagName.toLowerCase();
		    const type = element.type?.toLowerCase();
		    const contentEditable = element.contentEditable;

		    return (
		      tagName === 'textarea' ||
		      (tagName === 'input' && ['text', 'email', 'search'].includes(type)) ||
		      contentEditable === 'true' || contentEditable === ''
		    );
		  }

		  cleanup() {
		    // Clean up observers and event listeners
		    this.observers.forEach(observer => observer.disconnect());
		    this.activeElements.forEach((fieldData, element) => {
		      if (fieldData.eventListeners) {
		        element.removeEventListener('input', fieldData.eventListeners.handleInput);
		        element.removeEventListener('focus', fieldData.eventListeners.handleFocus);
		        element.removeEventListener('blur', fieldData.eventListeners.handleBlur);
		      }
		    });

		    this.activeElements.clear();
		    this.observers.clear();

		    console.log('IntelliPen: Universal text integration cleaned up');
		  }
		}

		/**
		 * Universal Adapter - Basic implementation for all websites
		 */
		class UniversalAdapter {
		  getPlatformName() {
		    return 'universal';
		  }

		  getTextFields() {
		    const selectors = [
		      'textarea',
		      'input[type="text"]',
		      'input[type="email"]',
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

		  getTextFieldsInElement(element) {
		    const selectors = [
		      'textarea',
		      'input[type="text"]',
		      'input[type="email"]',
		      '[contenteditable="true"]',
		      '[contenteditable=""]'
		    ];

		    const fields = [];
		    selectors.forEach(selector => {
		      const elements = element.querySelectorAll ? element.querySelectorAll(selector) : [];
		      fields.push(...Array.from(elements));
		    });

		    // Also check if the element itself is a text field
		    if (this.isValidTextField(element)) {
		      fields.push(element);
		    }

		    return fields.filter(field => this.isValidTextField(field));
		  }

		  isValidTextField(element) {
		    if (!element || element.disabled || element.readOnly) return false;

		    // Skip IntelliPen overlay containers
		    if (element.id && element.id.includes('intellipen')) return false;
		    if (element.className && element.className.includes('intellipen')) return false;

		    // Skip hidden elements
		    const style = window.getComputedStyle(element);
		    if (style.display === 'none' || style.visibility === 'hidden') return false;

		    // Skip very small fields (likely not for user input)
		    const rect = element.getBoundingClientRect();
		    if (rect.width < 50 || rect.height < 20) return false;

		    return true;
		  }

		  getFieldContext(element) {
		    // Analyze surrounding context to determine field purpose
		    const context = {
		      type: 'general',
		      purpose: 'unknown',
		      formality: 'neutral'
		    };

		    // Check for common patterns
		    const placeholder = element.placeholder?.toLowerCase() || '';
		    const label = this.getFieldLabel(element)?.toLowerCase() || '';
		    const className = element.className?.toLowerCase() || '';
		    const id = element.id?.toLowerCase() || '';

		    const contextText = `${placeholder} ${label} ${className} ${id}`;

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
		  }

		  getFieldLabel(element) {
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
		  }
		}

		// Load AdapterLoader first, then initialize
		async function loadAdapterLoaderAndInitialize() {
		  try {
		    // Load AdapterLoader if not already available
		    if (!window.AdapterLoader) {
		      const script = document.createElement('script');
		      script.src = chrome.runtime.getURL('content-scripts/platform-adapters/AdapterLoader.js');

		      await new Promise((resolve, reject) => {
		        script.onload = resolve;
		        script.onerror = reject;
		        (document.head || document.documentElement).appendChild(script);
		      });
		    }

		    // Initialize the integration
		    const integration = new UniversalTextIntegration();
		    await integration.initialize();

		  } catch (error) {
		    console.error('IntelliPen: Failed to load AdapterLoader:', error);

		    // Fallback: initialize without AdapterLoader
		    const integration = new UniversalTextIntegration();
		    await integration.initialize();
		  }
		}

		// Initialize when DOM is ready
		if (document.readyState === 'loading') {
		  document.addEventListener('DOMContentLoaded', loadAdapterLoaderAndInitialize);
		} else {
		  loadAdapterLoaderAndInitialize();
		}

		// Export for testing
		if (module.exports) {
		  module.exports = { UniversalTextIntegration, UniversalAdapter };
		} 
	} (universalIntegration$1));

	var universalIntegrationExports = universalIntegration$1.exports;
	var universalIntegration = /*@__PURE__*/getDefaultExportFromCjs(universalIntegrationExports);

	return universalIntegration;

})();
