/**
 * Editor AI Features
 * Implements AI-powered writing assistance for the editor
 */

class EditorAIFeatures {
  constructor(aiAPIManager) {
    this.aiManager = aiAPIManager;
    this.activeProofreader = null;
    this.activeWriter = null;
    this.activeRewriter = null;
  }

  // ===== Grammar Checking =====

  async checkGrammar(text) {
    try {
      console.log('Checking grammar for text:', text.substring(0, 50) + '...');
      
      // Check if Proofreader API is available
      if (!this.aiManager.isAPIAvailable('proofreader')) {
        throw new Error('Proofreader API is not available. Please ensure Chrome 141+ and enable the API.');
      }

      const result = await this.aiManager.proofread(text);
      
      return {
        success: true,
        corrected: result.corrected,
        corrections: result.corrections,
        hasErrors: result.hasErrors
      };
    } catch (error) {
      console.error('Grammar check failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackGrammarSuggestions(text)
      };
    }
  }

  getFallbackGrammarSuggestions(text) {
    // Basic fallback suggestions when API is not available
    const suggestions = [];
    
    // Check for common issues
    if (text.match(/\bi\b/)) {
      suggestions.push({
        type: 'Capitalization',
        text: 'Consider capitalizing "I" when used as a pronoun'
      });
    }
    
    if (text.match(/\s{2,}/)) {
      suggestions.push({
        type: 'Spacing',
        text: 'Multiple spaces detected - consider using single spaces'
      });
    }
    
    if (!text.match(/[.!?]$/)) {
      suggestions.push({
        type: 'Punctuation',
        text: 'Consider ending sentences with proper punctuation'
      });
    }
    
    return suggestions;
  }

  // ===== Writing Improvement =====

  async improveWriting(text, options = {}) {
    try {
      console.log('Improving writing for text:', text.substring(0, 50) + '...');
      
      // Check if Writer API is available
      if (!this.aiManager.isAPIAvailable('writer')) {
        throw new Error('Writer API is not available. Please ensure you have the required Chrome version.');
      }

      const prompt = `Improve the following text while maintaining its core message:\n\n${text}`;
      
      const improved = await this.aiManager.write(prompt, {
        tone: options.tone || 'neutral',
        format: 'plain-text',
        length: 'as-is',
        context: 'This is for general writing improvement, focusing on clarity, conciseness, and readability.'
      });
      
      return {
        success: true,
        original: text,
        improved: improved,
        suggestions: this.generateImprovementSuggestions(text, improved)
      };
    } catch (error) {
      console.error('Writing improvement failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackWritingSuggestions(text)
      };
    }
  }

  generateImprovementSuggestions(original, improved) {
    const suggestions = [];
    
    const originalWords = original.split(/\s+/).length;
    const improvedWords = improved.split(/\s+/).length;
    
    if (improvedWords < originalWords) {
      suggestions.push({
        type: 'Conciseness',
        text: `Reduced from ${originalWords} to ${improvedWords} words`
      });
    }
    
    return suggestions;
  }

  getFallbackWritingSuggestions(text) {
    const suggestions = [];
    
    // Check for passive voice
    if (text.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/)) {
      suggestions.push({
        type: 'Voice',
        text: 'Consider using active voice for more direct writing'
      });
    }
    
    // Check for word repetition
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};
    words.forEach(word => {
      if (word.length > 4) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
    
    const repeated = Object.entries(wordCounts).filter(([_, count]) => count > 2);
    if (repeated.length > 0) {
      suggestions.push({
        type: 'Variety',
        text: `Consider varying word choice - "${repeated[0][0]}" appears ${repeated[0][1]} times`
      });
    }
    
    return suggestions;
  }

  // ===== Tone Adjustment =====

  async changeTone(text, targetTone) {
    try {
      console.log(`Changing tone to ${targetTone} for text:`, text.substring(0, 50) + '...');
      
      // Check if Rewriter API is available
      if (!this.aiManager.isAPIAvailable('rewriter')) {
        throw new Error('Rewriter API is not available. Please ensure you have the required Chrome version.');
      }

      const toneMap = {
        'formal': 'more-formal',
        'casual': 'more-casual',
        'professional': 'more-formal',
        'friendly': 'more-casual',
        'neutral': 'as-is'
      };
      
      const rewriterTone = toneMap[targetTone] || 'as-is';
      
      const rewritten = await this.aiManager.rewrite(text, {
        tone: rewriterTone,
        format: 'plain-text',
        length: 'as-is',
        context: `Adjust the tone to be ${targetTone} while preserving the core message.`
      });
      
      return {
        success: true,
        original: text,
        rewritten: rewritten,
        tone: targetTone
      };
    } catch (error) {
      console.error('Tone change failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackToneSuggestions(text, targetTone)
      };
    }
  }

  getFallbackToneSuggestions(text, targetTone) {
    const suggestions = [];
    
    if (targetTone === 'formal') {
      suggestions.push({
        type: 'Tone',
        text: 'For formal tone: Avoid contractions, use complete sentences, and choose precise vocabulary'
      });
    } else if (targetTone === 'casual') {
      suggestions.push({
        type: 'Tone',
        text: 'For casual tone: Use contractions, shorter sentences, and conversational language'
      });
    }
    
    return suggestions;
  }

  // ===== Text Summarization =====

  async summarizeText(text, options = {}) {
    try {
      console.log('Summarizing text:', text.substring(0, 50) + '...');
      
      // Check if Summarizer API is available
      if (!this.aiManager.isAPIAvailable('summarizer')) {
        throw new Error('Summarizer API is not available.');
      }

      const summary = await this.aiManager.summarize(text, {
        type: options.type || 'tldr',
        format: 'plain-text',
        length: options.length || 'short',
        context: options.context
      });
      
      return {
        success: true,
        original: text,
        summary: summary
      };
    } catch (error) {
      console.error('Summarization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== Text Translation =====

  async translateText(text, targetLanguage, sourceLanguage = 'auto') {
    try {
      console.log(`Translating text to ${targetLanguage}:`, text.substring(0, 50) + '...');
      
      // Detect source language if auto
      if (sourceLanguage === 'auto') {
        const detection = await this.aiManager.detectLanguage(text);
        sourceLanguage = detection?.language || 'en';
      }
      
      // Check if Translator API is available
      if (!this.aiManager.isAPIAvailable('translator')) {
        throw new Error('Translator API is not available.');
      }

      const translated = await this.aiManager.translate(text, sourceLanguage, targetLanguage);
      
      return {
        success: true,
        original: text,
        translated: translated,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage
      };
    } catch (error) {
      console.error('Translation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== Content Generation =====

  async generateContent(prompt, options = {}) {
    try {
      console.log('Generating content for prompt:', prompt.substring(0, 50) + '...');
      
      // Check if Writer API is available
      if (!this.aiManager.isAPIAvailable('writer')) {
        throw new Error('Writer API is not available.');
      }

      const content = await this.aiManager.write(prompt, {
        tone: options.tone || 'neutral',
        format: options.format || 'markdown',
        length: options.length || 'medium',
        context: options.context
      });
      
      return {
        success: true,
        prompt: prompt,
        content: content
      };
    } catch (error) {
      console.error('Content generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== Streaming Support =====

  async improveWritingStreaming(text, options = {}, onChunk) {
    try {
      const prompt = `Improve the following text while maintaining its core message:\n\n${text}`;
      
      const improved = await this.aiManager.writeStreaming(prompt, {
        tone: options.tone || 'neutral',
        format: 'plain-text',
        length: 'as-is',
        context: 'This is for general writing improvement.'
      }, onChunk);
      
      return {
        success: true,
        original: text,
        improved: improved
      };
    } catch (error) {
      console.error('Streaming writing improvement failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async changeToneStreaming(text, targetTone, onChunk) {
    try {
      const toneMap = {
        'formal': 'more-formal',
        'casual': 'more-casual',
        'professional': 'more-formal',
        'friendly': 'more-casual',
        'neutral': 'as-is'
      };
      
      const rewriterTone = toneMap[targetTone] || 'as-is';
      
      const rewritten = await this.aiManager.rewriteStreaming(text, {
        tone: rewriterTone,
        format: 'plain-text',
        length: 'as-is'
      }, onChunk);
      
      return {
        success: true,
        original: text,
        rewritten: rewritten,
        tone: targetTone
      };
    } catch (error) {
      console.error('Streaming tone change failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EditorAIFeatures };
}

// Make available globally
if (typeof self !== 'undefined') {
  self.EditorAIFeatures = EditorAIFeatures;
}
