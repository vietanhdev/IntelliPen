/**
 * WritingAnalysis - Data model for text analysis results
 */
class WritingAnalysis {
  constructor(text, suggestions, metadata) {
    this.originalText = text;
    this.suggestions = suggestions || []; // Array of Suggestion objects
    this.metadata = {
      platform: metadata?.platform || 'unknown',
      context: metadata?.context || {},
      timestamp: metadata?.timestamp || Date.now(),
      processingTime: metadata?.processingTime || 0,
      ...metadata
    };
  }

  /**
   * Get suggestions by type
   */
  getSuggestionsByType(type) {
    return this.suggestions.filter(suggestion => suggestion.type === type);
  }

  /**
   * Get suggestions by severity
   */
  getSuggestionsBySeverity(severity) {
    return this.suggestions.filter(suggestion => suggestion.severity === severity);
  }

  /**
   * Get high-confidence suggestions
   */
  getHighConfidenceSuggestions(threshold = 0.8) {
    return this.suggestions.filter(suggestion => suggestion.confidence >= threshold);
  }

  /**
   * Check if analysis has any errors
   */
  hasErrors() {
    return this.suggestions.some(suggestion => suggestion.severity === 'error');
  }

  /**
   * Check if analysis has any suggestions
   */
  hasSuggestions() {
    return this.suggestions.length > 0;
  }

  /**
   * Get total number of issues found
   */
  getTotalIssues() {
    return this.suggestions.length;
  }

  /**
   * Convert to JSON for storage or transmission
   */
  toJSON() {
    return {
      originalText: this.originalText,
      suggestions: this.suggestions.map(s => s.toJSON ? s.toJSON() : s),
      metadata: this.metadata
    };
  }

  /**
   * Create WritingAnalysis from JSON
   */
  static fromJSON(json) {
    const suggestions = json.suggestions.map(s => 
      s instanceof Suggestion ? s : Suggestion.fromJSON(s)
    );
    return new WritingAnalysis(json.originalText, suggestions, json.metadata);
  }
}

/**
 * Suggestion - Data model for individual writing suggestions
 */
class Suggestion {
  constructor(type, range, original, replacement, confidence, explanation, severity = 'suggestion') {
    this.type = type; // 'grammar', 'style', 'tone', 'clarity', 'enhancement'
    this.range = range; // { start: number, end: number }
    this.original = original;
    this.replacement = replacement;
    this.confidence = confidence; // 0-1
    this.explanation = explanation;
    this.severity = severity; // 'error', 'warning', 'suggestion'
    this.applied = false;
    this.id = this.generateId();
  }

  /**
   * Generate unique ID for the suggestion
   */
  generateId() {
    return `${this.type}_${this.range.start}_${this.range.end}_${Date.now()}`;
  }

  /**
   * Apply this suggestion to text
   */
  applyToText(text) {
    if (this.range.start < 0 || this.range.end > text.length) {
      throw new Error('Invalid range for text application');
    }
    
    const before = text.substring(0, this.range.start);
    const after = text.substring(this.range.end);
    return before + this.replacement + after;
  }

  /**
   * Check if this suggestion overlaps with another
   */
  overlapsWith(other) {
    return !(this.range.end <= other.range.start || other.range.end <= this.range.start);
  }

  /**
   * Get visual indicator color based on type and severity
   */
  getIndicatorColor() {
    if (this.severity === 'error') {
      return '#dc3545'; // Red for errors
    } else if (this.type === 'style') {
      return '#ffc107'; // Amber for style suggestions
    } else {
      return '#007bff'; // Blue for enhancements
    }
  }

  /**
   * Get CSS class for styling
   */
  getCSSClass() {
    return `intellipen-suggestion intellipen-${this.type} intellipen-${this.severity}`;
  }

  /**
   * Mark suggestion as applied
   */
  markAsApplied() {
    this.applied = true;
  }

  /**
   * Convert to JSON for storage or transmission
   */
  toJSON() {
    return {
      type: this.type,
      range: this.range,
      original: this.original,
      replacement: this.replacement,
      confidence: this.confidence,
      explanation: this.explanation,
      severity: this.severity,
      applied: this.applied,
      id: this.id
    };
  }

  /**
   * Create Suggestion from JSON
   */
  static fromJSON(json) {
    const suggestion = new Suggestion(
      json.type,
      json.range,
      json.original,
      json.replacement,
      json.confidence,
      json.explanation,
      json.severity
    );
    suggestion.applied = json.applied || false;
    suggestion.id = json.id || suggestion.generateId();
    return suggestion;
  }
}

export { WritingAnalysis, Suggestion };