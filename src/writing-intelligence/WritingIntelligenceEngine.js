/**
 * WritingIntelligenceEngine - Core writing analysis system using Chrome AI APIs
 * Provides real-time grammar detection, style suggestions, and context-aware analysis
 */
class WritingIntelligenceEngine {
  constructor() {
    this.proofreaderSession = null;
    this.writerSession = null;
    this.rewriterSession = null;
    this.activeElements = new Map();
    this.analysisCache = new Map();
    this.isInitialized = false;
    
    // Context-aware analysis settings
    this.platformContexts = {
      'gmail.com': { type: 'email', formality: 'professional' },
      'linkedin.com': { type: 'social', formality: 'professional' },
      'notion.so': { type: 'document', formality: 'neutral' },
      'docs.google.com': { type: 'document', formality: 'neutral' },
      'default': { type: 'general', formality: 'neutral' }
    };
  }

  /**
   * Initialize the writing intelligence engine with Chrome AI APIs
   */
  async initialize() {
    try {
      // Check API availability first
      const [proofreaderAvailable, writerAvailable, rewriterAvailable] = await Promise.all([
        this.checkAPIAvailability('Proofreader'),
        this.checkAPIAvailability('Writer'),
        this.checkAPIAvailability('Rewriter')
      ]);

      // Initialize available APIs
      const initPromises = [];
      
      if (proofreaderAvailable) {
        initPromises.push(this.initializeProofreader());
      }
      
      if (writerAvailable) {
        initPromises.push(this.initializeWriter());
      }
      
      if (rewriterAvailable) {
        initPromises.push(this.initializeRewriter());
      }

      await Promise.all(initPromises);
      this.isInitialized = true;
      
      console.log('WritingIntelligenceEngine initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize WritingIntelligenceEngine:', error);
      return false;
    }
  }

  /**
   * Check if a Chrome AI API is available
   */
  async checkAPIAvailability(apiName) {
    try {
      if (!window.chrome?.ai?.[apiName.toLowerCase()]) {
        return false;
      }
      
      const availability = await window.chrome.ai[apiName.toLowerCase()].availability();
      return availability === 'available' || availability === 'downloadable';
    } catch (error) {
      console.warn(`${apiName} API not available:`, error);
      return false;
    }
  }

  /**
   * Initialize Proofreader API session
   */
  async initializeProofreader() {
    try {
      this.proofreaderSession = await window.chrome.ai.proofreader.create({
        expectedInputLanguages: ['en'],
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Proofreader download progress: ${(e.loaded * 100).toFixed(1)}%`);
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize Proofreader:', error);
      throw error;
    }
  }

  /**
   * Initialize Writer API session
   */
  async initializeWriter() {
    try {
      this.writerSession = await window.chrome.ai.writer.create({
        tone: 'neutral',
        format: 'plain-text',
        length: 'medium',
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Writer download progress: ${(e.loaded * 100).toFixed(1)}%`);
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize Writer:', error);
      throw error;
    }
  }

  /**
   * Initialize Rewriter API session
   */
  async initializeRewriter() {
    try {
      this.rewriterSession = await window.chrome.ai.rewriter.create({
        tone: 'as-is',
        format: 'plain-text',
        length: 'as-is',
        monitor: (m) => {
          m.addEventListener('downloadprogress', (e) => {
            console.log(`Rewriter download progress: ${(e.loaded * 100).toFixed(1)}%`);
          });
        }
      });
    } catch (error) {
      console.error('Failed to initialize Rewriter:', error);
      throw error;
    }
  }

  /**
   * Analyze text for grammar, style, and contextual improvements
   */
  async analyzeText(text, context = {}) {
    if (!this.isInitialized) {
      throw new Error('WritingIntelligenceEngine not initialized');
    }

    if (!text || text.trim().length === 0) {
      return { suggestions: [], metadata: { processingTime: 0 } };
    }

    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(text, context);
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey);
    }

    try {
      // Get platform context
      const platformContext = this.getPlatformContext(context.platform);
      
      // Run analysis in parallel
      const analysisPromises = [];
      
      if (this.proofreaderSession) {
        analysisPromises.push(this.analyzeGrammar(text));
      }
      
      if (this.writerSession) {
        analysisPromises.push(this.analyzeStyle(text, platformContext));
      }

      const results = await Promise.allSettled(analysisPromises);
      
      // Merge and prioritize suggestions
      const allSuggestions = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          allSuggestions.push(...result.value);
        }
      });

      const mergedSuggestions = this.mergeSuggestions(allSuggestions);
      const prioritizedSuggestions = this.prioritizeSuggestions(mergedSuggestions, platformContext);

      const processingTime = performance.now() - startTime;
      
      const analysis = {
        originalText: text,
        suggestions: prioritizedSuggestions,
        metadata: {
          platform: context.platform,
          context: platformContext,
          timestamp: Date.now(),
          processingTime
        }
      };

      // Cache the result
      this.analysisCache.set(cacheKey, analysis);
      
      // Clean cache if it gets too large
      if (this.analysisCache.size > 100) {
        const firstKey = this.analysisCache.keys().next().value;
        this.analysisCache.delete(firstKey);
      }

      return analysis;
    } catch (error) {
      console.error('Text analysis failed:', error);
      return {
        originalText: text,
        suggestions: [],
        metadata: {
          platform: context.platform,
          timestamp: Date.now(),
          processingTime: performance.now() - startTime,
          error: error.message
        }
      };
    }
  }

  /**
   * Analyze text for grammar and spelling errors using Proofreader API
   */
  async analyzeGrammar(text) {
    if (!this.proofreaderSession) {
      return [];
    }

    try {
      const result = await this.proofreaderSession.proofread(text);
      
      return result.corrections?.map(correction => ({
        type: 'grammar',
        range: {
          start: correction.startIndex,
          end: correction.endIndex
        },
        original: text.substring(correction.startIndex, correction.endIndex),
        replacement: correction.replacement,
        confidence: 0.9, // Proofreader API typically has high confidence
        explanation: correction.explanation || 'Grammar or spelling correction',
        severity: 'error'
      })) || [];
    } catch (error) {
      console.error('Grammar analysis failed:', error);
      return [];
    }
  }

  /**
   * Analyze text for style improvements using Writer API
   */
  async analyzeStyle(text, platformContext) {
    if (!this.writerSession) {
      return [];
    }

    try {
      // Create context-aware prompt for style analysis
      const prompt = this.createStyleAnalysisPrompt(text, platformContext);
      
      const result = await this.writerSession.write(prompt, {
        context: `Analyzing ${platformContext.type} content for ${platformContext.formality} tone`
      });

      // Parse the style suggestions from the result
      return this.parseStyleSuggestions(result, text);
    } catch (error) {
      console.error('Style analysis failed:', error);
      return [];
    }
  }

  /**
   * Create a context-aware prompt for style analysis
   */
  createStyleAnalysisPrompt(text, platformContext) {
    const contextDescription = {
      'email': 'professional email communication',
      'social': 'social media post',
      'document': 'document or article',
      'general': 'general text'
    }[platformContext.type] || 'general text';

    const formalityLevel = {
      'professional': 'professional and formal',
      'neutral': 'clear and neutral',
      'casual': 'casual and friendly'
    }[platformContext.formality] || 'neutral';

    return `Analyze this ${contextDescription} for style improvements. The tone should be ${formalityLevel}. 
    
Text: "${text}"

Provide specific suggestions for:
1. Clarity and readability
2. Tone appropriateness
3. Conciseness
4. Word choice improvements

Format each suggestion as: [START_INDEX-END_INDEX] Original: "text" | Suggestion: "improved text" | Reason: "explanation"`;
  }

  /**
   * Parse style suggestions from Writer API response
   */
  parseStyleSuggestions(response, originalText) {
    const suggestions = [];
    
    // Simple regex pattern to extract suggestions
    // In a real implementation, this would be more sophisticated
    const suggestionPattern = /\[(\d+)-(\d+)\]\s*Original:\s*"([^"]+)"\s*\|\s*Suggestion:\s*"([^"]+)"\s*\|\s*Reason:\s*"([^"]+)"/g;
    
    let match;
    while ((match = suggestionPattern.exec(response)) !== null) {
      const [, startStr, endStr, original, replacement, reason] = match;
      const start = parseInt(startStr);
      const end = parseInt(endStr);
      
      if (start >= 0 && end <= originalText.length) {
        suggestions.push({
          type: 'style',
          range: { start, end },
          original,
          replacement,
          confidence: 0.7,
          explanation: reason,
          severity: 'suggestion'
        });
      }
    }

    return suggestions;
  }

  /**
   * Merge overlapping or duplicate suggestions
   */
  mergeSuggestions(suggestions) {
    if (suggestions.length <= 1) {
      return suggestions;
    }

    // Sort by start position
    const sorted = suggestions.sort((a, b) => a.range.start - b.range.start);
    const merged = [];
    
    for (const suggestion of sorted) {
      const lastMerged = merged[merged.length - 1];
      
      if (!lastMerged || !this.suggestionsOverlap(lastMerged, suggestion)) {
        merged.push(suggestion);
      } else {
        // Merge overlapping suggestions, prioritizing higher confidence
        if (suggestion.confidence > lastMerged.confidence) {
          merged[merged.length - 1] = suggestion;
        }
      }
    }

    return merged;
  }

  /**
   * Check if two suggestions overlap
   */
  suggestionsOverlap(a, b) {
    return !(a.range.end <= b.range.start || b.range.end <= a.range.start);
  }

  /**
   * Prioritize suggestions based on context and severity
   */
  prioritizeSuggestions(suggestions, platformContext) {
    return suggestions.sort((a, b) => {
      // Priority order: grammar errors > style suggestions > enhancements
      const severityWeight = {
        'error': 3,
        'warning': 2,
        'suggestion': 1
      };
      
      const typeWeight = {
        'grammar': 3,
        'style': 2,
        'enhancement': 1
      };

      const aScore = (severityWeight[a.severity] || 1) * (typeWeight[a.type] || 1) * a.confidence;
      const bScore = (severityWeight[b.severity] || 1) * (typeWeight[b.type] || 1) * b.confidence;
      
      return bScore - aScore;
    });
  }

  /**
   * Get platform-specific context
   */
  getPlatformContext(platform) {
    if (!platform) {
      return this.platformContexts.default;
    }
    
    const hostname = platform.includes('.') ? platform : `${platform}.com`;
    return this.platformContexts[hostname] || this.platformContexts.default;
  }

  /**
   * Generate cache key for analysis results
   */
  generateCacheKey(text, context) {
    const contextStr = JSON.stringify(context);
    return `${text.length}_${this.simpleHash(text + contextStr)}`;
  }

  /**
   * Simple hash function for cache keys
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
  }

  /**
   * Destroy the engine and clean up resources
   */
  destroy() {
    try {
      if (this.proofreaderSession) {
        this.proofreaderSession.destroy?.();
        this.proofreaderSession = null;
      }
      
      if (this.writerSession) {
        this.writerSession.destroy?.();
        this.writerSession = null;
      }
      
      if (this.rewriterSession) {
        this.rewriterSession.destroy?.();
        this.rewriterSession = null;
      }

      this.activeElements.clear();
      this.clearCache();
      this.isInitialized = false;
      
      console.log('WritingIntelligenceEngine destroyed');
    } catch (error) {
      console.error('Error destroying WritingIntelligenceEngine:', error);
    }
  }
}

export default WritingIntelligenceEngine;