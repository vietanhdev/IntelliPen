var IntelliPenGrammarOverlay = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var grammarOverlay$1 = {exports: {}};

	/**
	 * IntelliPen Grammar Overlay System
	 * Provides real-time writing assistance with visual overlays
	 */

	(function (module) {
		class GrammarOverlay {
		  constructor() {
		    this.overlayContainer = null;
		    this.activePopup = null;
		    this.suggestions = new Map();
		    this.isEnabled = true;
		    this.currentElement = null;
		  }

		  initialize() {
		    console.log('IntelliPen: Initializing grammar overlay...');
		    
		    // Create overlay container
		    this.createOverlayContainer();
		    
		    // Set up event listeners
		    this.setupEventListeners();
		    
		    // Load CSS styles
		    this.loadStyles();
		    
		    console.log('IntelliPen: Grammar overlay initialized');
		  }

		  createOverlayContainer() {
		    if (this.overlayContainer && this.overlayContainer.parentElement) {
		      console.log('Overlay container already exists');
		      return;
		    }

		    console.log('Creating overlay container...');
		    
		    this.overlayContainer = document.createElement('div');
		    this.overlayContainer.id = 'intellipen-grammar-overlay';
		    
		    // Set styles individually to ensure they work
		    this.overlayContainer.style.position = 'fixed';
		    this.overlayContainer.style.top = '0';
		    this.overlayContainer.style.left = '0';
		    this.overlayContainer.style.width = '100%';
		    this.overlayContainer.style.height = '100%';
		    this.overlayContainer.style.pointerEvents = 'none';
		    this.overlayContainer.style.zIndex = '999999';
		    this.overlayContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		    
		    document.body.appendChild(this.overlayContainer);
		    
		    console.log('Overlay container created and added to body');
		    console.log('Container parent:', this.overlayContainer.parentElement);
		    console.log('Container style:', this.overlayContainer.style.cssText);
		  }

		  loadStyles() {
		    // Check if styles are already loaded
		    if (document.getElementById('intellipen-overlay-styles')) return;

		    // Only load external styles if Chrome extension APIs are available
		    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
		      const link = document.createElement('link');
		      link.id = 'intellipen-overlay-styles';
		      link.rel = 'stylesheet';
		      link.href = chrome.runtime.getURL('styles/overlay.css');
		      document.head.appendChild(link);
		    } else {
		      // Fallback: inject basic styles directly
		      this.injectBasicStyles();
		    }
		  }

		  injectBasicStyles() {
		    const style = document.createElement('style');
		    style.id = 'intellipen-overlay-styles';
		    style.textContent = `
      @keyframes intellipen-fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes intellipen-slide-in {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      
      .intellipen-suggestion-popup {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
      }
      
      .intellipen-suggestion-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        padding: 12px 16px !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        font-weight: 600 !important;
        border-radius: 8px 8px 0 0 !important;
      }
      
      .intellipen-suggestion-list {
        max-height: 300px !important;
        overflow-y: auto !important;
      }
      
      .intellipen-suggestion-item {
        display: flex !important;
        align-items: flex-start !important;
        gap: 12px !important;
        padding: 12px 16px !important;
        border-bottom: 1px solid #f1f5f9 !important;
        cursor: pointer !important;
        transition: background-color 0.2s ease !important;
      }
      
      .intellipen-suggestion-item:hover,
      .intellipen-suggestion-item.selected {
        background-color: #f8fafc !important;
      }
      
      .intellipen-suggestion-item:last-child {
        border-bottom: none !important;
        border-radius: 0 0 8px 8px !important;
      }
      
      .intellipen-suggestion-type {
        background: #e2e8f0 !important;
        color: #475569 !important;
        padding: 4px 8px !important;
        border-radius: 4px !important;
        font-size: 11px !important;
        font-weight: 600 !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
        min-width: 60px !important;
        text-align: center !important;
      }
      
      .intellipen-suggestion-type.grammar {
        background: #fef3c7 !important;
        color: #92400e !important;
      }
      
      .intellipen-suggestion-type.style {
        background: #ddd6fe !important;
        color: #5b21b6 !important;
      }
      
      .intellipen-suggestion-type.clarity {
        background: #bfdbfe !important;
        color: #1e40af !important;
      }
      
      .intellipen-suggestion-original {
        color: #64748b !important;
        font-size: 12px !important;
        margin-bottom: 4px !important;
      }
      
      .intellipen-suggestion-replacement {
        color: #1e293b !important;
        font-weight: 500 !important;
        margin-bottom: 4px !important;
      }
      
      .intellipen-suggestion-explanation {
        color: #64748b !important;
        font-size: 12px !important;
        font-style: italic !important;
      }
    `;
		    document.head.appendChild(style);
		  }

		  setupEventListeners() {
		    // Listen for clicks to hide popup
		    document.addEventListener('click', (e) => {
		      if (!e.target.closest('.intellipen-suggestion-popup')) {
		        this.hidePopup();
		      }
		    });

		    // Listen for escape key
		    document.addEventListener('keydown', (e) => {
		      if (e.key === 'Escape') {
		        this.hidePopup();
		      }
		    });

		    // Listen for messages from background script (only if Chrome extension APIs are available)
		    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
		      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		        this.handleMessage(message, sender, sendResponse);
		        return true;
		      });
		    } else {
		      console.warn('IntelliPen: Chrome extension APIs not available, running in standalone mode');
		    }
		  }

		  handleMessage(message, sender, sendResponse) {
		    switch (message.type) {
		      case 'SHOW_GRAMMAR_SUGGESTIONS':
		        this.showSuggestions(message.data);
		        sendResponse({ success: true });
		        break;
		      
		      case 'HIDE_GRAMMAR_OVERLAY':
		        this.hidePopup();
		        sendResponse({ success: true });
		        break;
		      
		      case 'TOGGLE_GRAMMAR_OVERLAY':
		        this.isEnabled = message.data.enabled;
		        if (!this.isEnabled) {
		          this.hidePopup();
		        }
		        sendResponse({ success: true });
		        break;
		      
		      default:
		        sendResponse({ success: false, error: 'Unknown message type' });
		    }
		  }

		  showSuggestions(data) {
		    if (!this.isEnabled) return;

		    const { element, suggestions, position } = data;
		    
		    // Store suggestions
		    this.suggestions.set(element, suggestions);
		    this.currentElement = element;

		    // Create and show popup
		    this.createSuggestionPopup(suggestions, position);
		  }

		  createSuggestionPopup(suggestions, position) {
		    console.log('createSuggestionPopup called with:', { suggestions, position });
		    
		    // Remove existing popup
		    this.hidePopup();

		    if (!suggestions || suggestions.length === 0) {
		      console.log('No suggestions provided, not creating popup');
		      return;
		    }

		    console.log('Creating popup with', suggestions.length, 'suggestions');

		    // Ensure overlay container exists
		    if (!this.overlayContainer) {
		      console.error('Overlay container not found, creating it...');
		      this.createOverlayContainer();
		    }

		    // Create popup element
		    const popup = document.createElement('div');
		    popup.className = 'intellipen-suggestion-popup';
		    
		    // Use inline styles to ensure they work
		    popup.style.position = 'absolute';
		    popup.style.background = 'white';
		    popup.style.border = '1px solid #e2e8f0';
		    popup.style.borderRadius = '8px';
		    popup.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
		    popup.style.padding = '0';
		    popup.style.minWidth = '250px';
		    popup.style.maxWidth = '350px';
		    popup.style.pointerEvents = 'auto';
		    popup.style.zIndex = '1000000';
		    popup.style.left = (position.x || 100) + 'px';
		    popup.style.top = (position.y || 100) + 'px';
		    popup.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		    popup.style.fontSize = '14px';

		    // Create header with inline styles
		    const header = document.createElement('div');
		    header.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
		    header.style.color = 'white';
		    header.style.padding = '12px 16px';
		    header.style.display = 'flex';
		    header.style.alignItems = 'center';
		    header.style.gap = '8px';
		    header.style.fontWeight = '600';
		    header.style.borderRadius = '8px 8px 0 0';
		    
		    header.innerHTML = `
      <span>🖋️</span>
      <span style="flex: 1;">IntelliPen Suggestions</span>
      <button class="close-btn" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer; font-size: 16px;">×</button>
    `;
		    
		    // Add close button functionality
		    const closeBtn = header.querySelector('.close-btn');
		    if (closeBtn) {
		      closeBtn.addEventListener('click', () => {
		        this.hidePopup();
		      });
		    }

		    popup.appendChild(header);

		    // Create suggestion list
		    const list = document.createElement('div');
		    list.style.padding = '8px 0';
		    
		    suggestions.forEach((suggestion, index) => {
		      const item = this.createSuggestionItem(suggestion, index);
		      list.appendChild(item);
		    });

		    popup.appendChild(list);

		    // Position popup to stay within viewport
		    this.positionPopup(popup, position);

		    console.log('Adding popup to overlay container:', this.overlayContainer);
		    console.log('Overlay container parent:', this.overlayContainer.parentElement);
		    
		    // Add to overlay container
		    this.overlayContainer.appendChild(popup);
		    this.activePopup = popup;

		    console.log('Popup created and added to DOM');
		    console.log('Popup parent:', popup.parentElement);
		    console.log('Popup style:', popup.style.cssText);
		    console.log('Container children count:', this.overlayContainer.children.length);

		    // Force a repaint
		    popup.offsetHeight;

		    // Add keyboard navigation
		    this.setupKeyboardNavigation(popup);
		  }

		  createSuggestionItem(suggestion, index) {
		    const item = document.createElement('div');
		    item.dataset.index = index;
		    
		    // Style the item with inline styles
		    item.style.display = 'flex';
		    item.style.alignItems = 'flex-start';
		    item.style.gap = '12px';
		    item.style.padding = '12px 16px';
		    item.style.borderBottom = '1px solid #f1f5f9';
		    item.style.cursor = 'pointer';
		    item.style.transition = 'background-color 0.2s ease';

		    // Create type indicator
		    const typeSpan = document.createElement('span');
		    typeSpan.textContent = (suggestion.type || 'grammar').toUpperCase();
		    typeSpan.style.background = suggestion.type === 'style' ? '#ddd6fe' : suggestion.type === 'clarity' ? '#bfdbfe' : '#fef3c7';
		    typeSpan.style.color = suggestion.type === 'style' ? '#5b21b6' : suggestion.type === 'clarity' ? '#1e40af' : '#92400e';
		    typeSpan.style.padding = '4px 8px';
		    typeSpan.style.borderRadius = '4px';
		    typeSpan.style.fontSize = '11px';
		    typeSpan.style.fontWeight = '600';
		    typeSpan.style.minWidth = '60px';
		    typeSpan.style.textAlign = 'center';

		    // Create main content
		    const content = document.createElement('div');
		    content.style.flex = '1';

		    // Original text (if available)
		    if (suggestion.original) {
		      const original = document.createElement('div');
		      original.textContent = `Original: "${suggestion.original}"`;
		      original.style.color = '#64748b';
		      original.style.fontSize = '12px';
		      original.style.marginBottom = '4px';
		      content.appendChild(original);
		    }

		    // Replacement text
		    const replacement = document.createElement('div');
		    replacement.textContent = suggestion.text || suggestion.replacement || 'Apply suggestion';
		    replacement.style.color = '#1e293b';
		    replacement.style.fontWeight = '500';
		    replacement.style.marginBottom = '4px';
		    content.appendChild(replacement);

		    // Explanation (if available)
		    if (suggestion.explanation) {
		      const explanation = document.createElement('div');
		      explanation.textContent = suggestion.explanation;
		      explanation.style.color = '#64748b';
		      explanation.style.fontSize = '12px';
		      explanation.style.fontStyle = 'italic';
		      content.appendChild(explanation);
		    }

		    item.appendChild(typeSpan);
		    item.appendChild(content);

		    // Add click handler
		    item.addEventListener('click', () => {
		      console.log('Suggestion clicked:', suggestion);
		      this.applySuggestion(suggestion);
		    });

		    // Add hover effects
		    item.addEventListener('mouseenter', () => {
		      item.style.backgroundColor = '#f8fafc';
		    });

		    item.addEventListener('mouseleave', () => {
		      item.style.backgroundColor = '';
		    });

		    return item;
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

		  setupKeyboardNavigation(popup) {
		    const items = popup.querySelectorAll('.intellipen-suggestion-item');
		    let selectedIndex = 0;

		    // Highlight first item
		    if (items.length > 0) {
		      items[0].classList.add('selected');
		    }

		    const keyHandler = (e) => {
		      switch (e.key) {
		        case 'ArrowDown':
		          e.preventDefault();
		          items[selectedIndex].classList.remove('selected');
		          selectedIndex = (selectedIndex + 1) % items.length;
		          items[selectedIndex].classList.add('selected');
		          break;

		        case 'ArrowUp':
		          e.preventDefault();
		          items[selectedIndex].classList.remove('selected');
		          selectedIndex = selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
		          items[selectedIndex].classList.add('selected');
		          break;

		        case 'Enter':
		          e.preventDefault();
		          if (items[selectedIndex]) {
		            items[selectedIndex].click();
		          }
		          break;

		        case 'Escape':
		          e.preventDefault();
		          this.hidePopup();
		          break;
		      }
		    };

		    document.addEventListener('keydown', keyHandler);

		    // Store handler for cleanup
		    popup._keyHandler = keyHandler;
		  }

		  async applySuggestion(suggestion) {
		    console.log('Applying suggestion:', suggestion);

		    try {
		      // If Chrome extension APIs are available, send message to background script
		      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
		        const response = await chrome.runtime.sendMessage({
		          type: 'APPLY_SUGGESTION',
		          data: {
		            element: this.currentElement,
		            suggestion: suggestion
		          }
		        });

		        if (response?.success) {
		          console.log('Suggestion applied successfully');
		          
		          // Show success feedback
		          this.showSuccessFeedback();
		          
		          // Hide popup
		          this.hidePopup();
		          
		          // Trigger re-analysis after a short delay
		          setTimeout(() => {
		            this.triggerReanalysis();
		          }, 500);
		        } else {
		          throw new Error('Failed to apply suggestion');
		        }
		      } else {
		        // Fallback: apply suggestion directly (for standalone mode)
		        this.applySuggestionDirectly(suggestion);
		        
		        // Show success feedback
		        this.showSuccessFeedback();
		        
		        // Hide popup
		        this.hidePopup();
		      }
		    } catch (error) {
		      console.error('Failed to apply suggestion:', error);
		      this.showErrorFeedback('Failed to apply suggestion');
		    }
		  }

		  applySuggestionDirectly(suggestion) {
		    // Direct application for standalone mode
		    if (this.currentElement && suggestion.replacement) {
		      const element = this.currentElement;
		      
		      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
		        // For input/textarea elements
		        const start = element.selectionStart || 0;
		        const end = element.selectionEnd || element.value.length;
		        const value = element.value;
		        
		        // Replace selected text or append
		        const newValue = value.substring(0, start) + suggestion.replacement + value.substring(end);
		        element.value = newValue;
		        
		        // Set cursor position after replacement
		        const newPosition = start + suggestion.replacement.length;
		        element.setSelectionRange(newPosition, newPosition);
		        
		        // Trigger input event
		        element.dispatchEvent(new Event('input', { bubbles: true }));
		      } else if (element.contentEditable === 'true') {
		        // For contentEditable elements
		        const selection = window.getSelection();
		        if (selection.rangeCount > 0) {
		          const range = selection.getRangeAt(0);
		          range.deleteContents();
		          range.insertNode(document.createTextNode(suggestion.replacement));
		          range.collapse(false);
		          selection.removeAllRanges();
		          selection.addRange(range);
		        }
		        
		        // Trigger input event
		        element.dispatchEvent(new Event('input', { bubbles: true }));
		      }
		    }
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
      animation: intellipen-slide-in 0.3s ease-out !important;
      pointer-events: none !important;
    `;
		    feedback.textContent = '✓ Suggestion applied';
		    
		    document.body.appendChild(feedback);
		    
		    setTimeout(() => {
		      feedback.remove();
		    }, 2000);
		  }

		  showErrorFeedback(message) {
		    const feedback = document.createElement('div');
		    feedback.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: #ef4444 !important;
      color: white !important;
      padding: 12px 16px !important;
      border-radius: 8px !important;
      font-size: 14px !important;
      font-weight: 500 !important;
      z-index: 1000001 !important;
      animation: intellipen-slide-in 0.3s ease-out !important;
      pointer-events: none !important;
    `;
		    feedback.textContent = `✗ ${message}`;
		    
		    document.body.appendChild(feedback);
		    
		    setTimeout(() => {
		      feedback.remove();
		    }, 3000);
		  }

		  triggerReanalysis() {
		    if (this.currentElement) {
		      // Trigger input event to re-analyze text
		      const event = new Event('input', { bubbles: true });
		      this.currentElement.dispatchEvent(event);
		    }
		  }

		  hidePopup() {
		    if (this.activePopup) {
		      // Remove keyboard handler
		      if (this.activePopup._keyHandler) {
		        document.removeEventListener('keydown', this.activePopup._keyHandler);
		      }
		      
		      this.activePopup.remove();
		      this.activePopup = null;
		    }
		  }

		  // Public method to show suggestions for a specific element
		  showSuggestionsForElement(element, suggestions) {
		    console.log('showSuggestionsForElement called with:', { element, suggestions });
		    
		    const rect = element.getBoundingClientRect();
		    const position = {
		      x: rect.left + rect.width / 2,
		      y: rect.bottom + 10
		    };

		    console.log('Element position:', rect, 'Popup position:', position);

		    this.showSuggestions({
		      element: element,
		      suggestions: suggestions,
		      position: position
		    });
		  }

		  // Public method to create demo suggestions for testing
		  createDemoSuggestions() {
		    return [
		      {
		        type: 'grammar',
		        original: 'I seen him yesterday',
		        replacement: 'I saw him yesterday',
		        explanation: 'Use past tense "saw" instead of "seen"'
		      },
		      {
		        type: 'style',
		        original: 'very good',
		        replacement: 'excellent',
		        explanation: 'More precise and impactful word choice'
		      },
		      {
		        type: 'clarity',
		        original: 'The thing is that',
		        replacement: 'The issue is that',
		        explanation: 'More specific and clear language'
		      }
		    ];
		  }

		  // Test method to force show overlay with demo suggestions
		  testOverlay() {
		    console.log('Testing overlay with demo suggestions...');
		    const suggestions = this.createDemoSuggestions();
		    
		    // Show overlay at center of screen with a dummy element
		    const dummyElement = document.createElement('div');
		    this.showSuggestions({
		      element: dummyElement,
		      suggestions: suggestions,
		      position: { x: 400, y: 200 }
		    });
		  }

		  cleanup() {
		    this.hidePopup();
		    if (this.overlayContainer) {
		      this.overlayContainer.remove();
		      this.overlayContainer = null;
		    }
		  }
		}

		// Initialize grammar overlay
		let grammarOverlay = null;

		function initializeGrammarOverlay() {
		  console.log('initializeGrammarOverlay called, current grammarOverlay:', grammarOverlay);
		  
		  if (!grammarOverlay) {
		    console.log('Creating new GrammarOverlay instance...');
		    grammarOverlay = new GrammarOverlay();
		    grammarOverlay.initialize();
		    console.log('GrammarOverlay instance created and initialized');
		  }
		  
		  // Always export for use by other scripts
		  window.IntelliPenGrammarOverlay = grammarOverlay;
		  console.log('window.IntelliPenGrammarOverlay set to:', window.IntelliPenGrammarOverlay);
		  
		  return grammarOverlay;
		}

		// Auto-initialize when script loads
		console.log('IntelliPen: Grammar overlay script executing, document.readyState:', document.readyState);
		if (document.readyState === 'loading') {
		  console.log('IntelliPen: Document still loading, adding DOMContentLoaded listener');
		  document.addEventListener('DOMContentLoaded', initializeGrammarOverlay);
		} else {
		  console.log('IntelliPen: Document ready, initializing immediately');
		  initializeGrammarOverlay();
		}

		// Export for testing
		if (module.exports) {
		  module.exports = { GrammarOverlay };
		} 
	} (grammarOverlay$1));

	var grammarOverlayExports = grammarOverlay$1.exports;
	var grammarOverlay = /*@__PURE__*/getDefaultExportFromCjs(grammarOverlayExports);

	return grammarOverlay;

})();
