/**
 * KeyboardNavigationManager - Provides keyboard navigation support for accessibility
 * Handles keyboard shortcuts and navigation for suggestion overlays
 */
class KeyboardNavigationManager {
  constructor(suggestionOverlay) {
    this.overlay = suggestionOverlay;
    this.isEnabled = true;
    this.currentFocusIndex = -1;
    this.focusableElements = [];
    this.shortcuts = new Map();
    
    this.setupKeyboardShortcuts();
    this.setupEventListeners();
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    // Navigation shortcuts
    this.shortcuts.set('Tab', this.navigateNext.bind(this));
    this.shortcuts.set('Shift+Tab', this.navigatePrevious.bind(this));
    this.shortcuts.set('ArrowDown', this.navigateNext.bind(this));
    this.shortcuts.set('ArrowUp', this.navigatePrevious.bind(this));
    this.shortcuts.set('ArrowRight', this.navigateNext.bind(this));
    this.shortcuts.set('ArrowLeft', this.navigatePrevious.bind(this));
    
    // Action shortcuts
    this.shortcuts.set('Enter', this.activateCurrentSuggestion.bind(this));
    this.shortcuts.set(' ', this.activateCurrentSuggestion.bind(this)); // Space
    this.shortcuts.set('Escape', this.exitNavigation.bind(this));
    
    // Quick action shortcuts
    this.shortcuts.set('a', this.applyCurrentSuggestion.bind(this)); // Apply
    this.shortcuts.set('i', this.ignoreCurrentSuggestion.bind(this)); // Ignore
    this.shortcuts.set('n', this.navigateToNextError.bind(this)); // Next error
    this.shortcuts.set('p', this.navigateToPreviousError.bind(this)); // Previous error
    
    // Panel shortcuts
    this.shortcuts.set('h', this.toggleHelp.bind(this)); // Help
    this.shortcuts.set('s', this.toggleStats.bind(this)); // Stats
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('focusin', this.handleFocusIn.bind(this));
    document.addEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Listen for overlay changes
    document.addEventListener('intellipen:overlay-created', this.updateFocusableElements.bind(this));
    document.addEventListener('intellipen:overlay-removed', this.updateFocusableElements.bind(this));
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(event) {
    if (!this.isEnabled) return;
    
    // Check if we're in an IntelliPen context
    if (!this.isInIntelliPenContext(event.target)) return;
    
    const shortcutKey = this.getShortcutKey(event);
    const handler = this.shortcuts.get(shortcutKey);
    
    if (handler) {
      event.preventDefault();
      event.stopPropagation();
      handler(event);
    }
  }

  /**
   * Handle focus in events
   */
  handleFocusIn(event) {
    if (this.isIntelliPenElement(event.target)) {
      this.updateCurrentFocusIndex(event.target);
      this.announceCurrentSuggestion();
    }
  }

  /**
   * Handle focus out events
   */
  handleFocusOut(event) {
    // Add slight delay to handle focus transitions
    setTimeout(() => {
      if (!this.isIntelliPenElement(document.activeElement)) {
        this.currentFocusIndex = -1;
      }
    }, 10);
  }

  /**
   * Check if we're in an IntelliPen context
   */
  isInIntelliPenContext(element) {
    return this.isIntelliPenElement(element) || 
           this.overlay.overlays.has(element) ||
           element.closest('[data-intellipen-active]');
  }

  /**
   * Check if element is an IntelliPen element
   */
  isIntelliPenElement(element) {
    return element && (
      element.classList.contains('intellipen-suggestion-highlight') ||
      element.classList.contains('intellipen-tooltip') ||
      element.classList.contains('intellipen-control-panel') ||
      element.closest('.intellipen-suggestion-highlight') ||
      element.closest('.intellipen-tooltip') ||
      element.closest('.intellipen-control-panel')
    );
  }

  /**
   * Get shortcut key string from event
   */
  getShortcutKey(event) {
    const parts = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push('Meta');
    
    // Handle special keys
    if (event.key === ' ') {
      parts.push('Space');
    } else if (event.key.length === 1) {
      parts.push(event.key.toLowerCase());
    } else {
      parts.push(event.key);
    }
    
    return parts.join('+');
  }

  /**
   * Update focusable elements list
   */
  updateFocusableElements() {
    this.focusableElements = Array.from(document.querySelectorAll(
      '.intellipen-suggestion-highlight[tabindex="0"], ' +
      '.intellipen-tooltip button, ' +
      '.intellipen-control-panel button'
    ));
    
    // Sort by DOM order and position
    this.focusableElements.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      
      // Sort by vertical position first, then horizontal
      if (Math.abs(aRect.top - bRect.top) > 5) {
        return aRect.top - bRect.top;
      }
      return aRect.left - bRect.left;
    });
  }

  /**
   * Update current focus index based on element
   */
  updateCurrentFocusIndex(element) {
    this.currentFocusIndex = this.focusableElements.indexOf(element);
  }

  /**
   * Navigate to next focusable element
   */
  navigateNext(event) {
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
    this.focusElement(this.focusableElements[this.currentFocusIndex]);
  }

  /**
   * Navigate to previous focusable element
   */
  navigatePrevious(event) {
    this.updateFocusableElements();
    
    if (this.focusableElements.length === 0) return;
    
    this.currentFocusIndex = this.currentFocusIndex <= 0 
      ? this.focusableElements.length - 1 
      : this.currentFocusIndex - 1;
    
    this.focusElement(this.focusableElements[this.currentFocusIndex]);
  }

  /**
   * Navigate to next error (high priority suggestion)
   */
  navigateToNextError(event) {
    const errorElements = this.focusableElements.filter(el => 
      el.classList.contains('intellipen-suggestion-highlight') &&
      this.getSuggestionFromElement(el)?.severity === 'error'
    );
    
    if (errorElements.length === 0) {
      this.announceMessage('No errors found');
      return;
    }
    
    const currentErrorIndex = errorElements.findIndex(el => el === document.activeElement);
    const nextIndex = (currentErrorIndex + 1) % errorElements.length;
    
    this.focusElement(errorElements[nextIndex]);
    this.announceMessage(`Error ${nextIndex + 1} of ${errorElements.length}`);
  }

  /**
   * Navigate to previous error
   */
  navigateToPreviousError(event) {
    const errorElements = this.focusableElements.filter(el => 
      el.classList.contains('intellipen-suggestion-highlight') &&
      this.getSuggestionFromElement(el)?.severity === 'error'
    );
    
    if (errorElements.length === 0) {
      this.announceMessage('No errors found');
      return;
    }
    
    const currentErrorIndex = errorElements.findIndex(el => el === document.activeElement);
    const prevIndex = currentErrorIndex <= 0 
      ? errorElements.length - 1 
      : currentErrorIndex - 1;
    
    this.focusElement(errorElements[prevIndex]);
    this.announceMessage(`Error ${prevIndex + 1} of ${errorElements.length}`);
  }

  /**
   * Activate current suggestion (show tooltip)
   */
  activateCurrentSuggestion(event) {
    const currentElement = document.activeElement;
    
    if (currentElement && currentElement.classList.contains('intellipen-suggestion-highlight')) {
      currentElement.click();
    }
  }

  /**
   * Apply current suggestion
   */
  applyCurrentSuggestion(event) {
    const currentElement = document.activeElement;
    
    if (currentElement && currentElement.classList.contains('intellipen-suggestion-highlight')) {
      const suggestion = this.getSuggestionFromElement(currentElement);
      if (suggestion) {
        const textElement = this.getTextElementForSuggestion(currentElement);
        if (textElement) {
          this.overlay.applySuggestion(suggestion, textElement);
          this.announceMessage('Suggestion applied');
          this.navigateNext(event);
        }
      }
    }
  }

  /**
   * Ignore current suggestion
   */
  ignoreCurrentSuggestion(event) {
    const currentElement = document.activeElement;
    
    if (currentElement && currentElement.classList.contains('intellipen-suggestion-highlight')) {
      const suggestion = this.getSuggestionFromElement(currentElement);
      if (suggestion) {
        this.overlay.ignoreSuggestion(suggestion);
        this.announceMessage('Suggestion ignored');
        this.navigateNext(event);
      }
    }
  }

  /**
   * Exit navigation mode
   */
  exitNavigation(event) {
    this.overlay.hideAllTooltips();
    this.overlay.hideControlPanel();
    
    // Return focus to the original text element
    const activeTextElement = this.overlay.activeElement;
    if (activeTextElement) {
      activeTextElement.focus();
    }
    
    this.currentFocusIndex = -1;
    this.announceMessage('Exited IntelliPen navigation');
  }

  /**
   * Toggle help panel
   */
  toggleHelp(event) {
    const existingHelp = document.getElementById('intellipen-help-panel');
    
    if (existingHelp) {
      this.hideHelp();
    } else {
      this.showHelp();
    }
  }

  /**
   * Show help panel
   */
  showHelp() {
    const helpPanel = document.createElement('div');
    helpPanel.id = 'intellipen-help-panel';
    helpPanel.className = 'intellipen-control-panel';
    helpPanel.style.top = '80px';
    helpPanel.style.maxHeight = '400px';
    helpPanel.style.overflowY = 'auto';
    
    helpPanel.innerHTML = `
      <div class="intellipen-panel-header">
        <div class="intellipen-logo">?</div>
        <div class="intellipen-panel-title">Keyboard Shortcuts</div>
      </div>
      <div style="font-size: 12px; line-height: 1.4;">
        <div style="margin-bottom: 12px;">
          <strong>Navigation:</strong><br>
          <kbd>Tab</kbd> / <kbd>↓</kbd> Next suggestion<br>
          <kbd>Shift+Tab</kbd> / <kbd>↑</kbd> Previous suggestion<br>
          <kbd>N</kbd> Next error<br>
          <kbd>P</kbd> Previous error
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Actions:</strong><br>
          <kbd>Enter</kbd> / <kbd>Space</kbd> Show details<br>
          <kbd>A</kbd> Apply suggestion<br>
          <kbd>I</kbd> Ignore suggestion<br>
          <kbd>Esc</kbd> Exit navigation
        </div>
        <div>
          <strong>Panels:</strong><br>
          <kbd>H</kbd> Toggle help<br>
          <kbd>S</kbd> Toggle stats
        </div>
      </div>
    `;
    
    document.body.appendChild(helpPanel);
    
    // Show with animation
    requestAnimationFrame(() => {
      helpPanel.classList.add('show');
    });
    
    this.announceMessage('Help panel opened');
  }

  /**
   * Hide help panel
   */
  hideHelp() {
    const helpPanel = document.getElementById('intellipen-help-panel');
    if (helpPanel) {
      helpPanel.classList.remove('show');
      setTimeout(() => {
        if (helpPanel.parentNode) {
          helpPanel.parentNode.removeChild(helpPanel);
        }
      }, 300);
      this.announceMessage('Help panel closed');
    }
  }

  /**
   * Toggle stats panel
   */
  toggleStats(event) {
    if (this.overlay.currentPanel) {
      this.overlay.hideControlPanel();
    } else if (this.overlay.activeElement) {
      const overlayData = this.overlay.overlays.get(this.overlay.activeElement);
      if (overlayData) {
        this.overlay.showControlPanel(overlayData.suggestions);
      }
    }
  }

  /**
   * Focus an element with proper handling
   */
  focusElement(element) {
    if (!element) return;
    
    element.focus();
    
    // Scroll into view if needed
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
    
    // Add visual focus indicator
    element.classList.add('intellipen-keyboard-focus');
    setTimeout(() => {
      element.classList.remove('intellipen-keyboard-focus');
    }, 2000);
  }

  /**
   * Get suggestion object from DOM element
   */
  getSuggestionFromElement(element) {
    const suggestionId = element.getAttribute('data-suggestion-id');
    if (!suggestionId) return null;
    
    // Find suggestion in overlay data
    for (const [textElement, overlayData] of this.overlay.overlays) {
      const suggestion = overlayData.suggestions.find(s => s.id === suggestionId);
      if (suggestion) return suggestion;
    }
    
    return null;
  }

  /**
   * Get text element associated with a suggestion element
   */
  getTextElementForSuggestion(suggestionElement) {
    // Find the text element that contains this suggestion
    for (const [textElement, overlayData] of this.overlay.overlays) {
      if (overlayData.elements.includes(suggestionElement)) {
        return textElement;
      }
    }
    return null;
  }

  /**
   * Announce current suggestion for screen readers
   */
  announceCurrentSuggestion() {
    const currentElement = document.activeElement;
    
    if (currentElement && currentElement.classList.contains('intellipen-suggestion-highlight')) {
      const suggestion = this.getSuggestionFromElement(currentElement);
      if (suggestion) {
        const message = `${suggestion.type} ${suggestion.severity}: ${suggestion.explanation}. Press Enter for options, A to apply, I to ignore.`;
        this.announceMessage(message);
      }
    }
  }

  /**
   * Announce message to screen readers
   */
  announceMessage(message) {
    // Create or update live region for announcements
    let liveRegion = document.getElementById('intellipen-live-region');
    
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'intellipen-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-10000px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    
    // Clear and set new message
    liveRegion.textContent = '';
    setTimeout(() => {
      liveRegion.textContent = message;
    }, 100);
  }

  /**
   * Enable keyboard navigation
   */
  enable() {
    this.isEnabled = true;
    this.announceMessage('IntelliPen keyboard navigation enabled');
  }

  /**
   * Disable keyboard navigation
   */
  disable() {
    this.isEnabled = false;
    this.currentFocusIndex = -1;
  }

  /**
   * Get navigation status
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      currentFocusIndex: this.currentFocusIndex,
      focusableElementsCount: this.focusableElements.length
    };
  }

  /**
   * Destroy keyboard navigation manager
   */
  destroy() {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('focusin', this.handleFocusIn.bind(this));
    document.removeEventListener('focusout', this.handleFocusOut.bind(this));
    
    // Remove live region
    const liveRegion = document.getElementById('intellipen-live-region');
    if (liveRegion) {
      liveRegion.remove();
    }
    
    // Remove help panel
    this.hideHelp();
    
    // Clear references
    this.focusableElements = [];
    this.shortcuts.clear();
    this.currentFocusIndex = -1;
    this.isEnabled = false;
    
    console.log('KeyboardNavigationManager destroyed');
  }
}

export default KeyboardNavigationManager;