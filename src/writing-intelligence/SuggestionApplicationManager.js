/**
 * SuggestionApplicationManager - Handles suggestion application with undo/redo functionality
 * Integrates with Rewriter API for tone and style adjustments
 */
class SuggestionApplicationManager {
  constructor(writingEngine) {
    this.writingEngine = writingEngine;
    this.history = new Map(); // element -> history stack
    this.maxHistorySize = 50;
    this.rewriterSessions = new Map(); // context -> rewriter session
    this.userPreferences = new Map(); // suggestion type -> acceptance rate
    this.batchOperations = new Map(); // element -> pending operations
    
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for text changes
   */
  setupEventListeners() {
    // Listen for suggestion applications
    document.addEventListener('intellipen:suggestion-applied', (event) => {
      this.recordSuggestionApplication(event.detail.suggestion, event.target);
    });
    
    // Listen for text changes to maintain history
    document.addEventListener('input', (event) => {
      if (this.isTrackedElement(event.target)) {
        this.recordTextChange(event.target, 'user-input');
      }
    });
  }

  /**
   * Apply a single suggestion to text element
   */
  async applySuggestion(suggestion, textElement, options = {}) {
    try {
      // Record current state for undo
      this.recordTextState(textElement, 'before-suggestion');
      
      // Get current text
      const currentText = this.getElementText(textElement);
      
      // Apply the suggestion
      let newText;
      if (suggestion.type === 'tone' || suggestion.type === 'style') {
        // Use Rewriter API for tone/style adjustments
        newText = await this.applyRewriterSuggestion(suggestion, currentText, textElement);
      } else {
        // Direct text replacement
        newText = suggestion.applyToText(currentText);
      }
      
      // Update element text
      this.setElementText(textElement, newText);
      
      // Record the change
      this.recordTextState(textElement, 'after-suggestion', {
        suggestion,
        originalText: currentText,
        newText
      });
      
      // Update user preferences
      this.updateUserPreferences(suggestion, 'applied');
      
      // Mark suggestion as applied
      suggestion.markAsApplied();
      
      // Dispatch success event
      textElement.dispatchEvent(new CustomEvent('intellipen:suggestion-applied', {
        detail: { suggestion, originalText: currentText, newText }
      }));
      
      return { success: true, originalText: currentText, newText };
      
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
      
      // Dispatch error event
      textElement.dispatchEvent(new CustomEvent('intellipen:suggestion-error', {
        detail: { suggestion, error: error.message }
      }));
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply suggestion using Rewriter API
   */
  async applyRewriterSuggestion(suggestion, text, textElement) {
    const context = this.getElementContext(textElement);
    const rewriterSession = await this.getRewriterSession(context);
    
    if (!rewriterSession) {
      // Fallback to direct replacement
      return suggestion.applyToText(text);
    }
    
    try {
      // Extract the text segment to rewrite
      const segmentText = text.substring(suggestion.range.start, suggestion.range.end);
      
      // Prepare rewriter options based on suggestion
      const rewriterOptions = this.getRewriterOptions(suggestion, context);
      
      // Rewrite the segment
      const rewrittenSegment = await rewriterSession.rewrite(segmentText, rewriterOptions);
      
      // Replace the segment in the full text
      const before = text.substring(0, suggestion.range.start);
      const after = text.substring(suggestion.range.end);
      
      return before + rewrittenSegment + after;
      
    } catch (error) {
      console.warn('Rewriter API failed, using fallback:', error);
      return suggestion.applyToText(text);
    }
  }

  /**
   * Get or create Rewriter session for context
   */
  async getRewriterSession(context) {
    const contextKey = `${context.platform}_${context.formality}`;
    
    if (this.rewriterSessions.has(contextKey)) {
      return this.rewriterSessions.get(contextKey);
    }
    
    try {
      if (!window.chrome?.ai?.rewriter) {
        return null;
      }
      
      const session = await window.chrome.ai.rewriter.create({
        tone: this.mapFormalityToTone(context.formality),
        format: 'plain-text',
        length: 'as-is',
        sharedContext: `This is ${context.type} content for ${context.platform}`
      });
      
      this.rewriterSessions.set(contextKey, session);
      return session;
      
    } catch (error) {
      console.warn('Failed to create Rewriter session:', error);
      return null;
    }
  }

  /**
   * Get rewriter options based on suggestion
   */
  getRewriterOptions(suggestion, context) {
    const options = {
      context: suggestion.explanation
    };
    
    // Map suggestion type to rewriter parameters
    switch (suggestion.type) {
      case 'tone':
        if (suggestion.replacement.includes('formal')) {
          options.tone = 'more-formal';
        } else if (suggestion.replacement.includes('casual')) {
          options.tone = 'more-casual';
        }
        break;
        
      case 'style':
        if (suggestion.explanation.includes('concise') || suggestion.explanation.includes('shorter')) {
          options.length = 'shorter';
        } else if (suggestion.explanation.includes('expand') || suggestion.explanation.includes('longer')) {
          options.length = 'longer';
        }
        break;
    }
    
    return options;
  }

  /**
   * Apply multiple suggestions in batch
   */
  async applyBatchSuggestions(suggestions, textElement, options = {}) {
    if (suggestions.length === 0) {
      return { success: true, results: [] };
    }
    
    // Record initial state
    this.recordTextState(textElement, 'before-batch');
    
    // Sort suggestions by position (reverse order to maintain indices)
    const sortedSuggestions = [...suggestions].sort((a, b) => b.range.start - a.range.start);
    
    const results = [];
    let currentText = this.getElementText(textElement);
    let hasErrors = false;
    
    // Apply suggestions one by one
    for (const suggestion of sortedSuggestions) {
      try {
        // Update suggestion range based on previous changes
        const adjustedSuggestion = this.adjustSuggestionRange(suggestion, results);
        
        // Apply suggestion to current text
        let newText;
        if (adjustedSuggestion.type === 'tone' || adjustedSuggestion.type === 'style') {
          newText = await this.applyRewriterSuggestion(adjustedSuggestion, currentText, textElement);
        } else {
          newText = adjustedSuggestion.applyToText(currentText);
        }
        
        results.push({
          suggestion: adjustedSuggestion,
          success: true,
          originalText: currentText,
          newText
        });
        
        currentText = newText;
        adjustedSuggestion.markAsApplied();
        
      } catch (error) {
        console.error('Failed to apply suggestion in batch:', error);
        results.push({
          suggestion,
          success: false,
          error: error.message
        });
        hasErrors = true;
      }
    }
    
    // Update element with final text
    this.setElementText(textElement, currentText);
    
    // Record final state
    this.recordTextState(textElement, 'after-batch', {
      suggestions: sortedSuggestions,
      results
    });
    
    // Update user preferences for all applied suggestions
    results.forEach(result => {
      if (result.success) {
        this.updateUserPreferences(result.suggestion, 'applied');
      }
    });
    
    // Dispatch batch completion event
    textElement.dispatchEvent(new CustomEvent('intellipen:batch-applied', {
      detail: { suggestions: sortedSuggestions, results, hasErrors }
    }));
    
    return { success: !hasErrors, results };
  }

  /**
   * Adjust suggestion range based on previous changes
   */
  adjustSuggestionRange(suggestion, previousResults) {
    let offset = 0;
    
    // Calculate offset from previous changes
    for (const result of previousResults) {
      if (result.success && result.suggestion.range.end <= suggestion.range.start) {
        const lengthDiff = result.newText.length - result.originalText.length;
        offset += lengthDiff;
      }
    }
    
    // Create adjusted suggestion
    return {
      ...suggestion,
      range: {
        start: suggestion.range.start + offset,
        end: suggestion.range.end + offset
      }
    };
  }

  /**
   * Undo last change
   */
  undo(textElement) {
    const history = this.getHistory(textElement);
    
    if (history.currentIndex <= 0) {
      return { success: false, message: 'Nothing to undo' };
    }
    
    try {
      history.currentIndex--;
      const previousState = history.states[history.currentIndex];
      
      this.setElementText(textElement, previousState.text);
      
      // Dispatch undo event
      textElement.dispatchEvent(new CustomEvent('intellipen:undo', {
        detail: { state: previousState }
      }));
      
      return { success: true, state: previousState };
      
    } catch (error) {
      console.error('Undo failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Redo last undone change
   */
  redo(textElement) {
    const history = this.getHistory(textElement);
    
    if (history.currentIndex >= history.states.length - 1) {
      return { success: false, message: 'Nothing to redo' };
    }
    
    try {
      history.currentIndex++;
      const nextState = history.states[history.currentIndex];
      
      this.setElementText(textElement, nextState.text);
      
      // Dispatch redo event
      textElement.dispatchEvent(new CustomEvent('intellipen:redo', {
        detail: { state: nextState }
      }));
      
      return { success: true, state: nextState };
      
    } catch (error) {
      console.error('Redo failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get history for element
   */
  getHistory(textElement) {
    if (!this.history.has(textElement)) {
      this.history.set(textElement, {
        states: [],
        currentIndex: -1
      });
    }
    return this.history.get(textElement);
  }

  /**
   * Record text state in history
   */
  recordTextState(textElement, action, metadata = {}) {
    const history = this.getHistory(textElement);
    const currentText = this.getElementText(textElement);
    
    const state = {
      text: currentText,
      timestamp: Date.now(),
      action,
      metadata
    };
    
    // Remove any states after current index (for branching history)
    history.states = history.states.slice(0, history.currentIndex + 1);
    
    // Add new state
    history.states.push(state);
    history.currentIndex = history.states.length - 1;
    
    // Limit history size
    if (history.states.length > this.maxHistorySize) {
      history.states.shift();
      history.currentIndex--;
    }
  }

  /**
   * Record text change from user input
   */
  recordTextChange(textElement, action) {
    // Debounce rapid changes
    if (this.textChangeTimeout) {
      clearTimeout(this.textChangeTimeout);
    }
    
    this.textChangeTimeout = setTimeout(() => {
      this.recordTextState(textElement, action);
    }, 500);
  }

  /**
   * Record suggestion application for learning
   */
  recordSuggestionApplication(suggestion, textElement) {
    // This could be used for analytics or learning user preferences
    console.log('Suggestion applied:', {
      type: suggestion.type,
      severity: suggestion.severity,
      confidence: suggestion.confidence,
      element: textElement.tagName
    });
  }

  /**
   * Update user preferences based on suggestion acceptance
   */
  updateUserPreferences(suggestion, action) {
    const key = `${suggestion.type}_${suggestion.severity}`;
    
    if (!this.userPreferences.has(key)) {
      this.userPreferences.set(key, {
        total: 0,
        applied: 0,
        ignored: 0
      });
    }
    
    const prefs = this.userPreferences.get(key);
    prefs.total++;
    
    if (action === 'applied') {
      prefs.applied++;
    } else if (action === 'ignored') {
      prefs.ignored++;
    }
    
    // Store in localStorage for persistence
    try {
      localStorage.setItem('intellipen-preferences', JSON.stringify(
        Array.from(this.userPreferences.entries())
      ));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  /**
   * Load user preferences from storage
   */
  loadUserPreferences() {
    try {
      const stored = localStorage.getItem('intellipen-preferences');
      if (stored) {
        const entries = JSON.parse(stored);
        this.userPreferences = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  /**
   * Get suggestion acceptance rate for learning
   */
  getSuggestionAcceptanceRate(suggestionType, severity) {
    const key = `${suggestionType}_${severity}`;
    const prefs = this.userPreferences.get(key);
    
    if (!prefs || prefs.total === 0) {
      return 0.5; // Default neutral rate
    }
    
    return prefs.applied / prefs.total;
  }

  /**
   * Get personalized suggestion priority
   */
  getPersonalizedPriority(suggestion) {
    const acceptanceRate = this.getSuggestionAcceptanceRate(suggestion.type, suggestion.severity);
    
    // Boost priority for suggestions user typically accepts
    const personalizedConfidence = suggestion.confidence * (0.5 + acceptanceRate);
    
    return Math.min(1.0, personalizedConfidence);
  }

  /**
   * Get element text (handles different element types)
   */
  getElementText(element) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return element.value;
    } else if (element.isContentEditable) {
      return element.textContent || element.innerText || '';
    }
    return '';
  }

  /**
   * Set element text (handles different element types)
   */
  setElementText(element, text) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (element.isContentEditable) {
      element.textContent = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /**
   * Get element context for rewriter
   */
  getElementContext(element) {
    const platform = window.location.hostname;
    
    // Determine context based on element attributes and platform
    let type = 'general';
    let formality = 'neutral';
    
    if (platform.includes('gmail')) {
      type = 'email';
      formality = 'professional';
    } else if (platform.includes('linkedin')) {
      type = 'social';
      formality = 'professional';
    } else if (platform.includes('notion') || platform.includes('docs.google')) {
      type = 'document';
      formality = 'neutral';
    }
    
    return { platform, type, formality };
  }

  /**
   * Map formality to rewriter tone
   */
  mapFormalityToTone(formality) {
    switch (formality) {
      case 'professional':
        return 'more-formal';
      case 'casual':
        return 'more-casual';
      default:
        return 'as-is';
    }
  }

  /**
   * Check if element is being tracked
   */
  isTrackedElement(element) {
    return this.history.has(element);
  }

  /**
   * Start tracking element
   */
  startTracking(element) {
    if (!this.isTrackedElement(element)) {
      this.recordTextState(element, 'start-tracking');
    }
  }

  /**
   * Stop tracking element
   */
  stopTracking(element) {
    this.history.delete(element);
    
    if (this.textChangeTimeout) {
      clearTimeout(this.textChangeTimeout);
    }
  }

  /**
   * Get history summary for element
   */
  getHistorySummary(element) {
    const history = this.getHistory(element);
    
    return {
      totalStates: history.states.length,
      currentIndex: history.currentIndex,
      canUndo: history.currentIndex > 0,
      canRedo: history.currentIndex < history.states.length - 1,
      lastAction: history.states[history.currentIndex]?.action || 'none'
    };
  }

  /**
   * Clear history for element
   */
  clearHistory(element) {
    this.history.delete(element);
  }

  /**
   * Get user preferences summary
   */
  getUserPreferencesSummary() {
    const summary = {};
    
    for (const [key, prefs] of this.userPreferences) {
      const [type, severity] = key.split('_');
      
      if (!summary[type]) {
        summary[type] = {};
      }
      
      summary[type][severity] = {
        acceptanceRate: prefs.total > 0 ? (prefs.applied / prefs.total) : 0,
        totalSeen: prefs.total,
        applied: prefs.applied,
        ignored: prefs.ignored
      };
    }
    
    return summary;
  }

  /**
   * Destroy suggestion application manager
   */
  destroy() {
    // Clear all histories
    this.history.clear();
    
    // Destroy rewriter sessions
    for (const session of this.rewriterSessions.values()) {
      try {
        session.destroy?.();
      } catch (error) {
        console.warn('Error destroying rewriter session:', error);
      }
    }
    this.rewriterSessions.clear();
    
    // Clear timeouts
    if (this.textChangeTimeout) {
      clearTimeout(this.textChangeTimeout);
    }
    
    // Clear preferences
    this.userPreferences.clear();
    this.batchOperations.clear();
    
    console.log('SuggestionApplicationManager destroyed');
  }
}

export default SuggestionApplicationManager;