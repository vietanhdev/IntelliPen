/**
 * ContextAnalyzer - Provides context-aware analysis based on platform and text type
 */
class ContextAnalyzer {
  constructor() {
    this.platformRules = this.initializePlatformRules();
    this.textTypePatterns = this.initializeTextTypePatterns();
    this.contextCache = new Map();
  }

  /**
   * Initialize platform-specific rules
   */
  initializePlatformRules() {
    return {
      'gmail.com': {
        type: 'email',
        formality: 'professional',
        suggestedTone: 'formal',
        commonPatterns: {
          greeting: /^(hi|hello|dear)/i,
          closing: /(best regards|sincerely|thank you)/i,
          signature: /--\s*$/m
        },
        recommendations: {
          includeGreeting: true,
          includeClosing: true,
          usePoliteLanguage: true,
          avoidSlang: true
        }
      },
      'linkedin.com': {
        type: 'social',
        formality: 'professional',
        suggestedTone: 'neutral',
        commonPatterns: {
          hashtag: /#\w+/g,
          mention: /@\w+/g,
          link: /https?:\/\/[^\s]+/g
        },
        recommendations: {
          useHashtags: true,
          keepConcise: true,
          useActiveVoice: true,
          includeCallToAction: true
        }
      },
      'notion.so': {
        type: 'document',
        formality: 'neutral',
        suggestedTone: 'neutral',
        commonPatterns: {
          heading: /^#+\s/m,
          bullet: /^[\*\-\+]\s/m,
          checkbox: /^- \[[ x]\]/m
        },
        recommendations: {
          useHeadings: true,
          structureContent: true,
          useBulletPoints: true,
          maintainConsistency: true
        }
      },
      'docs.google.com': {
        type: 'document',
        formality: 'neutral',
        suggestedTone: 'neutral',
        commonPatterns: {
          heading: /^.{1,100}$/m,
          paragraph: /^.{100,}$/m
        },
        recommendations: {
          useProperFormatting: true,
          maintainStructure: true,
          checkReadability: true,
          useTransitions: true
        }
      }
    };
  }

  /**
   * Initialize text type detection patterns
   */
  initializeTextTypePatterns() {
    return {
      email: {
        patterns: [
          /^(dear|hi|hello)/i,
          /(best regards|sincerely|thank you|cheers)/i,
          /@\w+\.\w+/,
          /subject:/i
        ],
        weight: 0.8
      },
      socialPost: {
        patterns: [
          /#\w+/,
          /@\w+/,
          /https?:\/\/[^\s]+/,
          /^.{1,280}$/
        ],
        weight: 0.7
      },
      article: {
        patterns: [
          /^#+\s/m,
          /\n\n/,
          /^.{500,}$/s,
          /\b(introduction|conclusion|furthermore|however|therefore)\b/i
        ],
        weight: 0.6
      },
      message: {
        patterns: [
          /^.{1,160}$/,
          /[!?]{2,}/,
          /\b(lol|omg|btw|fyi)\b/i
        ],
        weight: 0.5
      }
    };
  }

  /**
   * Analyze context for given text and platform
   */
  analyzeContext(text, platform, element = null) {
    const cacheKey = this.generateCacheKey(text, platform);
    
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    const context = {
      platform: this.normalizePlatform(platform),
      textType: this.detectTextType(text),
      formality: 'neutral',
      suggestedTone: 'neutral',
      recommendations: [],
      metadata: {
        textLength: text.length,
        wordCount: this.countWords(text),
        sentenceCount: this.countSentences(text),
        readabilityScore: this.calculateReadabilityScore(text)
      }
    };

    // Apply platform-specific rules
    const platformRules = this.getPlatformRules(context.platform);
    if (platformRules) {
      context.formality = platformRules.formality;
      context.suggestedTone = platformRules.suggestedTone;
      context.recommendations = this.generateRecommendations(text, platformRules);
    }

    // Analyze element context if provided
    if (element) {
      const elementContext = this.analyzeElementContext(element);
      context.elementType = elementContext.type;
      context.elementAttributes = elementContext.attributes;
    }

    // Cache the result
    this.contextCache.set(cacheKey, context);
    
    return context;
  }

  /**
   * Normalize platform identifier
   */
  normalizePlatform(platform) {
    if (!platform) return 'unknown';
    
    // Extract hostname if full URL is provided
    if (platform.includes('://')) {
      try {
        platform = new URL(platform).hostname;
      } catch (e) {
        // Fallback to original if URL parsing fails
      }
    }

    // Remove www. prefix
    platform = platform.replace(/^www\./, '');
    
    return platform.toLowerCase();
  }

  /**
   * Detect text type based on patterns
   */
  detectTextType(text) {
    let bestMatch = 'general';
    let highestScore = 0;

    for (const [type, config] of Object.entries(this.textTypePatterns)) {
      let score = 0;
      let matchCount = 0;

      for (const pattern of config.patterns) {
        if (pattern.test(text)) {
          matchCount++;
        }
      }

      score = (matchCount / config.patterns.length) * config.weight;

      if (score > highestScore) {
        highestScore = score;
        bestMatch = type;
      }
    }

    return bestMatch;
  }

  /**
   * Get platform-specific rules
   */
  getPlatformRules(platform) {
    return this.platformRules[platform] || null;
  }

  /**
   * Generate context-aware recommendations
   */
  generateRecommendations(text, platformRules) {
    const recommendations = [];

    // Check platform-specific patterns
    for (const [patternName, pattern] of Object.entries(platformRules.commonPatterns || {})) {
      if (!pattern.test(text)) {
        switch (patternName) {
          case 'greeting':
            if (platformRules.recommendations.includeGreeting) {
              recommendations.push({
                type: 'structure',
                message: 'Consider adding a greeting to make your message more personal',
                priority: 'low'
              });
            }
            break;
          case 'closing':
            if (platformRules.recommendations.includeClosing) {
              recommendations.push({
                type: 'structure',
                message: 'Consider adding a polite closing to your message',
                priority: 'low'
              });
            }
            break;
        }
      }
    }

    // Check readability
    const readabilityScore = this.calculateReadabilityScore(text);
    if (readabilityScore < 60) {
      recommendations.push({
        type: 'readability',
        message: 'Consider simplifying your language for better readability',
        priority: 'medium'
      });
    }

    // Check sentence length
    const sentences = this.getSentences(text);
    const longSentences = sentences.filter(s => this.countWords(s) > 25);
    if (longSentences.length > 0) {
      recommendations.push({
        type: 'clarity',
        message: 'Some sentences are quite long. Consider breaking them up for clarity',
        priority: 'medium'
      });
    }

    // Platform-specific recommendations
    if (platformRules.recommendations.keepConcise && text.length > 280) {
      recommendations.push({
        type: 'length',
        message: 'Consider keeping your message more concise for this platform',
        priority: 'high'
      });
    }

    return recommendations;
  }

  /**
   * Analyze element context (input field, textarea, etc.)
   */
  analyzeElementContext(element) {
    const context = {
      type: element.tagName.toLowerCase(),
      attributes: {}
    };

    // Analyze common attributes
    const relevantAttributes = ['placeholder', 'name', 'id', 'class', 'aria-label'];
    relevantAttributes.forEach(attr => {
      const value = element.getAttribute(attr);
      if (value) {
        context.attributes[attr] = value;
      }
    });

    // Detect purpose from attributes
    const allText = Object.values(context.attributes).join(' ').toLowerCase();
    
    if (allText.includes('email') || allText.includes('mail')) {
      context.purpose = 'email';
    } else if (allText.includes('comment') || allText.includes('reply')) {
      context.purpose = 'comment';
    } else if (allText.includes('post') || allText.includes('status')) {
      context.purpose = 'post';
    } else if (allText.includes('message') || allText.includes('chat')) {
      context.purpose = 'message';
    }

    return context;
  }

  /**
   * Count words in text
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count sentences in text
   */
  countSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  }

  /**
   * Get sentences from text
   */
  getSentences(text) {
    return text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
  }

  /**
   * Calculate simple readability score (Flesch-like)
   */
  calculateReadabilityScore(text) {
    const words = this.countWords(text);
    const sentences = this.countSentences(text);
    
    if (sentences === 0 || words === 0) return 100;

    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = this.estimateAverageSyllables(text);

    // Simplified Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate average syllables per word
   */
  estimateAverageSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    if (words.length === 0) return 1;

    let totalSyllables = 0;
    
    for (const word of words) {
      // Simple syllable counting heuristic
      let syllables = word.match(/[aeiouy]+/g)?.length || 1;
      if (word.endsWith('e')) syllables--;
      if (syllables === 0) syllables = 1;
      totalSyllables += syllables;
    }

    return totalSyllables / words.length;
  }

  /**
   * Generate cache key
   */
  generateCacheKey(text, platform) {
    const textHash = this.simpleHash(text.substring(0, 100)); // Use first 100 chars
    return `${platform}_${textHash}_${text.length}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  /**
   * Clear context cache
   */
  clearCache() {
    this.contextCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.contextCache.size,
      keys: Array.from(this.contextCache.keys())
    };
  }
}

export default ContextAnalyzer;