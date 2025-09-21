import { WritingAnalysis, Suggestion } from './models/WritingAnalysis.js';

/**
 * TextAnalysisPipeline - Orchestrates text analysis through multiple stages
 */
class TextAnalysisPipeline {
  constructor(writingEngine) {
    this.writingEngine = writingEngine;
    this.analysisQueue = [];
    this.isProcessing = false;
    this.maxQueueSize = 10;
    this.debounceTimeout = null;
    this.debounceDelay = 300; // 300ms debounce
  }

  /**
   * Analyze text with debouncing to avoid excessive API calls
   */
  async analyzeTextDebounced(text, context = {}) {
    return new Promise((resolve, reject) => {
      // Clear existing timeout
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Set new timeout
      this.debounceTimeout = setTimeout(async () => {
        try {
          const result = await this.analyzeText(text, context);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, this.debounceDelay);
    });
  }

  /**
   * Analyze text immediately
   */
  async analyzeText(text, context = {}) {
    if (!text || text.trim().length === 0) {
      return new WritingAnalysis(text, [], { processingTime: 0 });
    }

    // Add to queue if not processing
    if (this.isProcessing) {
      return this.queueAnalysis(text, context);
    }

    this.isProcessing = true;

    try {
      const startTime = performance.now();
      
      // Pre-process text
      const processedText = this.preprocessText(text);
      
      // Run analysis through writing engine
      const analysis = await this.writingEngine.analyzeText(processedText, context);
      
      // Post-process results
      const enhancedAnalysis = this.postprocessAnalysis(analysis, text);
      
      const processingTime = performance.now() - startTime;
      enhancedAnalysis.metadata.totalProcessingTime = processingTime;

      return enhancedAnalysis;
    } catch (error) {
      console.error('Text analysis pipeline failed:', error);
      return new WritingAnalysis(text, [], {
        processingTime: 0,
        error: error.message
      });
    } finally {
      this.isProcessing = false;
      this.processQueue();
    }
  }

  /**
   * Queue analysis request when pipeline is busy
   */
  async queueAnalysis(text, context) {
    return new Promise((resolve, reject) => {
      if (this.analysisQueue.length >= this.maxQueueSize) {
        // Remove oldest item if queue is full
        this.analysisQueue.shift();
      }

      this.analysisQueue.push({
        text,
        context,
        resolve,
        reject,
        timestamp: Date.now()
      });
    });
  }

  /**
   * Process queued analysis requests
   */
  async processQueue() {
    if (this.analysisQueue.length === 0 || this.isProcessing) {
      return;
    }

    const request = this.analysisQueue.shift();
    
    try {
      const result = await this.analyzeText(request.text, request.context);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }
  }

  /**
   * Pre-process text before analysis
   */
  preprocessText(text) {
    // Remove excessive whitespace
    let processed = text.replace(/\s+/g, ' ').trim();
    
    // Handle common text artifacts
    processed = processed.replace(/\u00A0/g, ' '); // Non-breaking spaces
    processed = processed.replace(/[\u2018\u2019]/g, "'"); // Smart quotes
    processed = processed.replace(/[\u201C\u201D]/g, '"'); // Smart double quotes
    processed = processed.replace(/\u2013/g, '-'); // En dash
    processed = processed.replace(/\u2014/g, '--'); // Em dash
    
    return processed;
  }

  /**
   * Post-process analysis results
   */
  postprocessAnalysis(analysis, originalText) {
    if (!analysis.suggestions || analysis.suggestions.length === 0) {
      return analysis;
    }

    // Filter out suggestions that don't make sense
    const validSuggestions = analysis.suggestions.filter(suggestion => 
      this.isValidSuggestion(suggestion, originalText)
    );

    // Add enhancement suggestions based on context
    const enhancementSuggestions = this.generateEnhancementSuggestions(originalText, analysis.metadata.context);
    
    // Combine and re-prioritize
    const allSuggestions = [...validSuggestions, ...enhancementSuggestions];
    const prioritizedSuggestions = this.prioritizeSuggestions(allSuggestions);

    return new WritingAnalysis(originalText, prioritizedSuggestions, analysis.metadata);
  }

  /**
   * Validate suggestion against original text
   */
  isValidSuggestion(suggestion, originalText) {
    // Check range validity
    if (suggestion.range.start < 0 || suggestion.range.end > originalText.length) {
      return false;
    }

    // Check if original text matches
    const actualText = originalText.substring(suggestion.range.start, suggestion.range.end);
    if (actualText !== suggestion.original) {
      return false;
    }

    // Check if replacement is different
    if (suggestion.replacement === suggestion.original) {
      return false;
    }

    // Check minimum confidence threshold
    if (suggestion.confidence < 0.3) {
      return false;
    }

    return true;
  }

  /**
   * Generate enhancement suggestions based on context
   */
  generateEnhancementSuggestions(text, context) {
    const suggestions = [];
    
    // Check for common enhancement opportunities
    if (context.type === 'email' && !text.includes('please') && !text.includes('thank')) {
      // Suggest politeness for emails
      suggestions.push(new Suggestion(
        'enhancement',
        { start: text.length, end: text.length },
        '',
        ' Please let me know if you have any questions.',
        0.6,
        'Consider adding a polite closing to your email',
        'suggestion'
      ));
    }

    // Check for readability improvements
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const longSentences = sentences.filter(s => s.split(' ').length > 25);
    
    if (longSentences.length > 0) {
      // Find the first long sentence
      const longSentence = longSentences[0];
      const startIndex = text.indexOf(longSentence);
      
      if (startIndex !== -1) {
        suggestions.push(new Suggestion(
          'enhancement',
          { start: startIndex, end: startIndex + longSentence.length },
          longSentence,
          longSentence, // Same text, just flagged for review
          0.5,
          'This sentence is quite long. Consider breaking it into shorter sentences for better readability.',
          'suggestion'
        ));
      }
    }

    return suggestions;
  }

  /**
   * Prioritize suggestions based on multiple factors
   */
  prioritizeSuggestions(suggestions) {
    return suggestions.sort((a, b) => {
      // Primary sort: severity (error > warning > suggestion)
      const severityOrder = { 'error': 3, 'warning': 2, 'suggestion': 1 };
      const severityDiff = (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1);
      
      if (severityDiff !== 0) {
        return severityDiff;
      }

      // Secondary sort: type (grammar > style > enhancement)
      const typeOrder = { 'grammar': 3, 'style': 2, 'enhancement': 1 };
      const typeDiff = (typeOrder[b.type] || 1) - (typeOrder[a.type] || 1);
      
      if (typeDiff !== 0) {
        return typeDiff;
      }

      // Tertiary sort: confidence
      return b.confidence - a.confidence;
    });
  }

  /**
   * Batch analyze multiple texts
   */
  async batchAnalyze(texts, context = {}) {
    const results = [];
    
    for (const text of texts) {
      try {
        const analysis = await this.analyzeText(text, context);
        results.push(analysis);
      } catch (error) {
        results.push(new WritingAnalysis(text, [], {
          processingTime: 0,
          error: error.message
        }));
      }
    }

    return results;
  }

  /**
   * Clear analysis queue
   */
  clearQueue() {
    // Reject all pending requests
    this.analysisQueue.forEach(request => {
      request.reject(new Error('Analysis queue cleared'));
    });
    
    this.analysisQueue = [];
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.analysisQueue.length,
      maxQueueSize: this.maxQueueSize
    };
  }

  /**
   * Set debounce delay
   */
  setDebounceDelay(delay) {
    this.debounceDelay = Math.max(100, Math.min(2000, delay)); // Clamp between 100ms and 2s
  }

  /**
   * Destroy pipeline and clean up
   */
  destroy() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    
    this.clearQueue();
    this.isProcessing = false;
  }
}

export default TextAnalysisPipeline;