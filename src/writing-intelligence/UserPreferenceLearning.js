/**
 * UserPreferenceLearning - Learns and adapts to user suggestion acceptance patterns
 * Provides personalized suggestion ranking and filtering
 */
class UserPreferenceLearning {
  constructor() {
    this.preferences = new Map(); // suggestion pattern -> preference data
    this.contextualPreferences = new Map(); // context -> preferences
    this.sessionData = new Map(); // current session tracking
    this.learningEnabled = true;
    this.minSampleSize = 5; // Minimum samples before making predictions
    this.decayFactor = 0.95; // Decay factor for older preferences
    
    this.loadPreferences();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for learning
   */
  setupEventListeners() {
    // Listen for suggestion applications
    document.addEventListener('intellipen:suggestion-applied', (event) => {
      this.recordSuggestionAction(event.detail.suggestion, 'applied', event.target);
    });
    
    // Listen for suggestion ignores
    document.addEventListener('intellipen:suggestion-ignored', (event) => {
      this.recordSuggestionAction(event.detail.suggestion, 'ignored', event.target);
    });
    
    // Listen for suggestion dismissals
    document.addEventListener('intellipen:suggestion-dismissed', (event) => {
      this.recordSuggestionAction(event.detail.suggestion, 'dismissed', event.target);
    });
    
    // Save preferences periodically
    setInterval(() => {
      this.savePreferences();
    }, 30000); // Every 30 seconds
  }

  /**
   * Record user action on suggestion
   */
  recordSuggestionAction(suggestion, action, element) {
    if (!this.learningEnabled) return;
    
    const pattern = this.extractSuggestionPattern(suggestion);
    const context = this.extractContext(element, suggestion);
    
    // Update global preferences
    this.updatePreferences(pattern, action);
    
    // Update contextual preferences
    this.updateContextualPreferences(context, pattern, action);
    
    // Update session data
    this.updateSessionData(suggestion, action, context);
    
    // Trigger learning update
    this.updateLearningModel();
  }

  /**
   * Extract suggestion pattern for learning
   */
  extractSuggestionPattern(suggestion) {
    return {
      type: suggestion.type,
      severity: suggestion.severity,
      confidence: Math.round(suggestion.confidence * 10) / 10, // Round to 1 decimal
      lengthCategory: this.categorizeSuggestionLength(suggestion),
      hasReplacement: !!suggestion.replacement,
      explanationCategory: this.categorizeExplanation(suggestion.explanation)
    };
  }

  /**
   * Extract context information
   */
  extractContext(element, suggestion) {
    const platform = window.location.hostname;
    const elementType = element.tagName.toLowerCase();
    const textLength = this.getElementText(element).length;
    
    return {
      platform: this.normalizePlatform(platform),
      elementType,
      textLengthCategory: this.categorizeTextLength(textLength),
      timeOfDay: this.getTimeOfDayCategory(),
      suggestionPosition: this.categorizeSuggestionPosition(suggestion, element)
    };
  }

  /**
   * Update global preferences
   */
  updatePreferences(pattern, action) {
    const key = this.patternToKey(pattern);
    
    if (!this.preferences.has(key)) {
      this.preferences.set(key, {
        pattern,
        actions: { applied: 0, ignored: 0, dismissed: 0 },
        total: 0,
        lastUpdated: Date.now(),
        confidence: 0.5
      });
    }
    
    const pref = this.preferences.get(key);
    pref.actions[action]++;
    pref.total++;
    pref.lastUpdated = Date.now();
    
    // Calculate confidence based on acceptance rate
    pref.confidence = pref.actions.applied / pref.total;
    
    // Apply decay to older preferences
    this.applyDecay(pref);
  }

  /**
   * Update contextual preferences
   */
  updateContextualPreferences(context, pattern, action) {
    const contextKey = this.contextToKey(context);
    
    if (!this.contextualPreferences.has(contextKey)) {
      this.contextualPreferences.set(contextKey, new Map());
    }
    
    const contextPrefs = this.contextualPreferences.get(contextKey);
    const patternKey = this.patternToKey(pattern);
    
    if (!contextPrefs.has(patternKey)) {
      contextPrefs.set(patternKey, {
        actions: { applied: 0, ignored: 0, dismissed: 0 },
        total: 0,
        confidence: 0.5
      });
    }
    
    const pref = contextPrefs.get(patternKey);
    pref.actions[action]++;
    pref.total++;
    pref.confidence = pref.actions.applied / pref.total;
  }

  /**
   * Update session data for real-time learning
   */
  updateSessionData(suggestion, action, context) {
    const sessionKey = `${Date.now()}_${Math.random()}`;
    
    this.sessionData.set(sessionKey, {
      suggestion,
      action,
      context,
      timestamp: Date.now()
    });
    
    // Keep only recent session data (last hour)
    const oneHourAgo = Date.now() - 3600000;
    for (const [key, data] of this.sessionData) {
      if (data.timestamp < oneHourAgo) {
        this.sessionData.delete(key);
      }
    }
  }

  /**
   * Get personalized suggestion score
   */
  getPersonalizedScore(suggestion, element) {
    if (!this.learningEnabled) {
      return suggestion.confidence;
    }
    
    const pattern = this.extractSuggestionPattern(suggestion);
    const context = this.extractContext(element, suggestion);
    
    // Get global preference score
    const globalScore = this.getGlobalPreferenceScore(pattern);
    
    // Get contextual preference score
    const contextualScore = this.getContextualPreferenceScore(context, pattern);
    
    // Get session-based score
    const sessionScore = this.getSessionScore(pattern, context);
    
    // Combine scores with weights
    const weights = {
      original: 0.4,
      global: 0.3,
      contextual: 0.2,
      session: 0.1
    };
    
    const personalizedScore = 
      weights.original * suggestion.confidence +
      weights.global * globalScore +
      weights.contextual * contextualScore +
      weights.session * sessionScore;
    
    return Math.min(1.0, Math.max(0.0, personalizedScore));
  }

  /**
   * Get global preference score for pattern
   */
  getGlobalPreferenceScore(pattern) {
    const key = this.patternToKey(pattern);
    const pref = this.preferences.get(key);
    
    if (!pref || pref.total < this.minSampleSize) {
      return 0.5; // Neutral score for insufficient data
    }
    
    return pref.confidence;
  }

  /**
   * Get contextual preference score
   */
  getContextualPreferenceScore(context, pattern) {
    const contextKey = this.contextToKey(context);
    const contextPrefs = this.contextualPreferences.get(contextKey);
    
    if (!contextPrefs) {
      return 0.5;
    }
    
    const patternKey = this.patternToKey(pattern);
    const pref = contextPrefs.get(patternKey);
    
    if (!pref || pref.total < this.minSampleSize) {
      return 0.5;
    }
    
    return pref.confidence;
  }

  /**
   * Get session-based score
   */
  getSessionScore(pattern, context) {
    const recentActions = Array.from(this.sessionData.values())
      .filter(data => {
        const patternMatch = this.patternsMatch(pattern, this.extractSuggestionPattern(data.suggestion));
        const contextMatch = this.contextsMatch(context, data.context);
        return patternMatch && contextMatch;
      });
    
    if (recentActions.length === 0) {
      return 0.5;
    }
    
    const appliedCount = recentActions.filter(data => data.action === 'applied').length;
    return appliedCount / recentActions.length;
  }

  /**
   * Filter suggestions based on user preferences
   */
  filterSuggestions(suggestions, element, options = {}) {
    const threshold = options.threshold || 0.3;
    const maxSuggestions = options.maxSuggestions || 10;
    
    // Score and sort suggestions
    const scoredSuggestions = suggestions.map(suggestion => ({
      suggestion,
      score: this.getPersonalizedScore(suggestion, element)
    }));
    
    // Filter by threshold
    const filteredSuggestions = scoredSuggestions
      .filter(item => item.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxSuggestions)
      .map(item => ({
        ...item.suggestion,
        personalizedScore: item.score
      }));
    
    return filteredSuggestions;
  }

  /**
   * Get learning insights for user
   */
  getLearningInsights() {
    const insights = {
      totalSuggestions: 0,
      appliedSuggestions: 0,
      preferredTypes: [],
      preferredContexts: [],
      learningProgress: this.calculateLearningProgress()
    };
    
    // Analyze global preferences
    for (const pref of this.preferences.values()) {
      insights.totalSuggestions += pref.total;
      insights.appliedSuggestions += pref.actions.applied;
    }
    
    // Find preferred suggestion types
    const typePreferences = new Map();
    for (const [key, pref] of this.preferences) {
      const pattern = pref.pattern;
      if (!typePreferences.has(pattern.type)) {
        typePreferences.set(pattern.type, { total: 0, applied: 0 });
      }
      const typePref = typePreferences.get(pattern.type);
      typePref.total += pref.total;
      typePref.applied += pref.actions.applied;
    }
    
    insights.preferredTypes = Array.from(typePreferences.entries())
      .map(([type, data]) => ({
        type,
        acceptanceRate: data.total > 0 ? data.applied / data.total : 0,
        totalSeen: data.total
      }))
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    
    // Find preferred contexts
    const contextPreferences = new Map();
    for (const [contextKey, contextPrefs] of this.contextualPreferences) {
      let totalActions = 0;
      let appliedActions = 0;
      
      for (const pref of contextPrefs.values()) {
        totalActions += pref.total;
        appliedActions += pref.actions.applied;
      }
      
      if (totalActions > 0) {
        contextPreferences.set(contextKey, {
          acceptanceRate: appliedActions / totalActions,
          totalSeen: totalActions
        });
      }
    }
    
    insights.preferredContexts = Array.from(contextPreferences.entries())
      .map(([context, data]) => ({
        context: this.keyToContext(context),
        acceptanceRate: data.acceptanceRate,
        totalSeen: data.totalSeen
      }))
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);
    
    return insights;
  }

  /**
   * Calculate learning progress
   */
  calculateLearningProgress() {
    const totalPreferences = this.preferences.size;
    const maturePreferences = Array.from(this.preferences.values())
      .filter(pref => pref.total >= this.minSampleSize).length;
    
    return {
      totalPatterns: totalPreferences,
      maturePatterns: maturePreferences,
      maturityRate: totalPreferences > 0 ? maturePreferences / totalPreferences : 0,
      isLearning: this.learningEnabled,
      dataQuality: this.assessDataQuality()
    };
  }

  /**
   * Assess data quality for learning
   */
  assessDataQuality() {
    const preferences = Array.from(this.preferences.values());
    
    if (preferences.length === 0) {
      return 'insufficient';
    }
    
    const avgSampleSize = preferences.reduce((sum, pref) => sum + pref.total, 0) / preferences.length;
    const recentPreferences = preferences.filter(pref => 
      Date.now() - pref.lastUpdated < 7 * 24 * 60 * 60 * 1000 // Last week
    ).length;
    
    if (avgSampleSize >= this.minSampleSize && recentPreferences > preferences.length * 0.5) {
      return 'good';
    } else if (avgSampleSize >= this.minSampleSize * 0.5) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Update learning model (placeholder for ML integration)
   */
  updateLearningModel() {
    // This could integrate with a more sophisticated ML model
    // For now, we just ensure preferences are up to date
    
    // Apply decay to old preferences
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    
    for (const pref of this.preferences.values()) {
      if (pref.lastUpdated < oneWeekAgo) {
        this.applyDecay(pref);
      }
    }
  }

  /**
   * Apply decay to preference data
   */
  applyDecay(preference) {
    const timeSinceUpdate = Date.now() - preference.lastUpdated;
    const daysSinceUpdate = timeSinceUpdate / (24 * 60 * 60 * 1000);
    
    if (daysSinceUpdate > 1) {
      const decayAmount = Math.pow(this.decayFactor, daysSinceUpdate);
      
      preference.actions.applied *= decayAmount;
      preference.actions.ignored *= decayAmount;
      preference.actions.dismissed *= decayAmount;
      preference.total *= decayAmount;
      
      // Recalculate confidence
      preference.confidence = preference.total > 0 ? 
        preference.actions.applied / preference.total : 0.5;
    }
  }

  /**
   * Helper methods for categorization
   */
  categorizeSuggestionLength(suggestion) {
    const length = suggestion.replacement ? suggestion.replacement.length : 0;
    if (length <= 10) return 'short';
    if (length <= 50) return 'medium';
    return 'long';
  }

  categorizeExplanation(explanation) {
    if (explanation.toLowerCase().includes('grammar')) return 'grammar';
    if (explanation.toLowerCase().includes('style')) return 'style';
    if (explanation.toLowerCase().includes('tone')) return 'tone';
    if (explanation.toLowerCase().includes('clarity')) return 'clarity';
    return 'other';
  }

  categorizeTextLength(length) {
    if (length <= 100) return 'short';
    if (length <= 500) return 'medium';
    if (length <= 2000) return 'long';
    return 'very-long';
  }

  getTimeOfDayCategory() {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  categorizeSuggestionPosition(suggestion, element) {
    const text = this.getElementText(element);
    const position = suggestion.range.start / text.length;
    
    if (position < 0.25) return 'beginning';
    if (position < 0.75) return 'middle';
    return 'end';
  }

  normalizePlatform(platform) {
    return platform.replace(/^www\./, '').toLowerCase();
  }

  /**
   * Helper methods for key generation and comparison
   */
  patternToKey(pattern) {
    return JSON.stringify(pattern);
  }

  contextToKey(context) {
    return JSON.stringify(context);
  }

  keyToContext(key) {
    try {
      return JSON.parse(key);
    } catch {
      return {};
    }
  }

  patternsMatch(pattern1, pattern2) {
    return this.patternToKey(pattern1) === this.patternToKey(pattern2);
  }

  contextsMatch(context1, context2) {
    return this.contextToKey(context1) === this.contextToKey(context2);
  }

  getElementText(element) {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return element.value;
    } else if (element.isContentEditable) {
      return element.textContent || element.innerText || '';
    }
    return '';
  }

  /**
   * Persistence methods
   */
  savePreferences() {
    try {
      const data = {
        preferences: Array.from(this.preferences.entries()),
        contextualPreferences: Array.from(this.contextualPreferences.entries()).map(
          ([key, value]) => [key, Array.from(value.entries())]
        ),
        lastSaved: Date.now()
      };
      
      localStorage.setItem('intellipen-learning-data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save learning preferences:', error);
    }
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem('intellipen-learning-data');
      if (stored) {
        const data = JSON.parse(stored);
        
        this.preferences = new Map(data.preferences || []);
        
        if (data.contextualPreferences) {
          this.contextualPreferences = new Map(
            data.contextualPreferences.map(([key, value]) => [key, new Map(value)])
          );
        }
      }
    } catch (error) {
      console.warn('Failed to load learning preferences:', error);
    }
  }

  /**
   * Control methods
   */
  enableLearning() {
    this.learningEnabled = true;
  }

  disableLearning() {
    this.learningEnabled = false;
  }

  clearLearningData() {
    this.preferences.clear();
    this.contextualPreferences.clear();
    this.sessionData.clear();
    
    try {
      localStorage.removeItem('intellipen-learning-data');
    } catch (error) {
      console.warn('Failed to clear learning data from storage:', error);
    }
  }

  /**
   * Export learning data for analysis
   */
  exportLearningData() {
    return {
      preferences: Array.from(this.preferences.entries()),
      contextualPreferences: Array.from(this.contextualPreferences.entries()).map(
        ([key, value]) => [key, Array.from(value.entries())]
      ),
      insights: this.getLearningInsights(),
      exportedAt: Date.now()
    };
  }

  /**
   * Destroy learning system
   */
  destroy() {
    this.savePreferences();
    this.preferences.clear();
    this.contextualPreferences.clear();
    this.sessionData.clear();
    this.learningEnabled = false;
    
    console.log('UserPreferenceLearning destroyed');
  }
}

export default UserPreferenceLearning;