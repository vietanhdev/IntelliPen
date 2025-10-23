/**
 * Chrome AI API Manager
 * Centralized management for all Chrome built-in AI APIs
 */

class AIAPIManager {
  constructor() {
    this.apis = {
      languageModel: null,
      proofreader: null,
      writer: null,
      rewriter: null,
      summarizer: null,
      translator: null,
      languageDetector: null
    };
    
    this.availability = {};
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('AIAPIManager: Initializing...');
    
    try {
      await this.checkAllAPIs();
      this.isInitialized = true;
      console.log('AIAPIManager: Initialized successfully');
    } catch (error) {
      console.error('AIAPIManager: Failed to initialize:', error);
      throw error;
    }
  }

  async checkAllAPIs() {
    const apiChecks = [
      { name: 'languageModel', check: () => 'LanguageModel' in self },
      { name: 'proofreader', check: () => 'Proofreader' in self },
      { name: 'writer', check: () => 'Writer' in self },
      { name: 'rewriter', check: () => 'Rewriter' in self },
      { name: 'summarizer', check: () => 'Summarizer' in self },
      { name: 'translator', check: () => 'Translator' in self },
      { name: 'languageDetector', check: () => 'LanguageDetector' in self }
    ];

    for (const { name, check } of apiChecks) {
      try {
        if (check()) {
          // Check availability
          const ApiClass = self[name === 'languageModel' ? 'LanguageModel' : 
                               name === 'proofreader' ? 'Proofreader' :
                               name === 'writer' ? 'Writer' :
                               name === 'rewriter' ? 'Rewriter' :
                               name === 'summarizer' ? 'Summarizer' :
                               name === 'translator' ? 'Translator' :
                               'LanguageDetector'];
          
          if (ApiClass && ApiClass.availability) {
            const availability = await ApiClass.availability();
            this.availability[name] = availability;
            console.log(`${name} API availability:`, availability);
          } else {
            this.availability[name] = 'unknown';
          }
        } else {
          this.availability[name] = 'unavailable';
        }
      } catch (error) {
        console.warn(`Failed to check ${name} API:`, error);
        this.availability[name] = 'error';
      }
    }
  }

  // ===== Proofreader API =====

  async createProofreader(options = {}) {
    try {
      if (!('Proofreader' in self)) {
        throw new Error('Proofreader API not available');
      }

      const defaultOptions = {
        expectedInputLanguages: ['en'],
        ...options
      };

      const proofreader = await Proofreader.create(defaultOptions);
      console.log('Proofreader created successfully');
      return proofreader;
    } catch (error) {
      console.error('Failed to create proofreader:', error);
      throw error;
    }
  }

  async proofread(text, options = {}) {
    try {
      const proofreader = await this.createProofreader(options);
      const result = await proofreader.proofread(text);
      
      // Format corrections
      const corrections = result.corrections || [];
      const formattedCorrections = corrections.map(correction => ({
        type: correction.type || 'Grammar',
        startIndex: correction.startIndex,
        endIndex: correction.endIndex,
        original: text.substring(correction.startIndex, correction.endIndex),
        suggestion: correction.suggestion || '',
        explanation: correction.explanation || ''
      }));

      return {
        corrected: result.corrected || text,
        corrections: formattedCorrections,
        hasErrors: corrections.length > 0
      };
    } catch (error) {
      console.error('Proofreading failed:', error);
      throw error;
    }
  }

  // ===== Writer API =====

  async createWriter(options = {}) {
    try {
      if (!('Writer' in self)) {
        throw new Error('Writer API not available in window context');
      }

      console.log('Writer API found in window, checking availability...');
      
      // Check availability before creating
      if (Writer.availability) {
        const availability = await Writer.availability();
        console.log('Writer availability check result:', availability);
      }

      const defaultOptions = {
        tone: 'neutral',
        format: 'markdown',
        length: 'medium',
        ...options
      };

      console.log('Creating Writer with options:', defaultOptions);
      const writer = await Writer.create(defaultOptions);
      console.log('Writer created successfully:', writer);
      return writer;
    } catch (error) {
      console.error('Failed to create writer:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async write(prompt, options = {}) {
    try {
      console.log('Creating writer with options:', options);
      const writer = await this.createWriter(options);
      console.log('Writer created, calling write() with prompt length:', prompt.length);
      
      const result = await writer.write(prompt, { context: options.context });
      
      console.log('Write result received:', {
        type: typeof result,
        length: result?.length,
        preview: typeof result === 'string' ? result.substring(0, 100) : result
      });
      
      return result;
    } catch (error) {
      console.error('Writing failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async writeStreaming(prompt, options = {}, onChunk) {
    try {
      const writer = await this.createWriter(options);
      const stream = writer.writeStreaming(prompt, { context: options.context });
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText = chunk;
        if (onChunk) onChunk(chunk);
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming write failed:', error);
      throw error;
    }
  }

  // ===== Rewriter API =====

  async createRewriter(options = {}) {
    try {
      if (!('Rewriter' in self)) {
        throw new Error('Rewriter API not available');
      }

      const defaultOptions = {
        tone: 'as-is',
        format: 'as-is',
        length: 'as-is',
        ...options
      };

      const rewriter = await Rewriter.create(defaultOptions);
      console.log('Rewriter created successfully');
      return rewriter;
    } catch (error) {
      console.error('Failed to create rewriter:', error);
      throw error;
    }
  }

  async rewrite(text, options = {}) {
    try {
      const rewriter = await this.createRewriter(options);
      const result = await rewriter.rewrite(text, { context: options.context });
      return result;
    } catch (error) {
      console.error('Rewriting failed:', error);
      throw error;
    }
  }

  async rewriteStreaming(text, options = {}, onChunk) {
    try {
      const rewriter = await this.createRewriter(options);
      const stream = rewriter.rewriteStreaming(text, { context: options.context });
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText = chunk;
        if (onChunk) onChunk(chunk);
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming rewrite failed:', error);
      throw error;
    }
  }

  // ===== Summarizer API =====

  async createSummarizer(options = {}) {
    try {
      if (!('Summarizer' in self)) {
        throw new Error('Summarizer API not available');
      }

      const defaultOptions = {
        type: 'key-points',
        format: 'markdown',
        length: 'medium',
        ...options
      };

      const summarizer = await Summarizer.create(defaultOptions);
      console.log('Summarizer created successfully');
      return summarizer;
    } catch (error) {
      console.error('Failed to create summarizer:', error);
      throw error;
    }
  }

  async summarize(text, options = {}) {
    try {
      const summarizer = await this.createSummarizer(options);
      const result = await summarizer.summarize(text, { context: options.context });
      return result;
    } catch (error) {
      console.error('Summarization failed:', error);
      throw error;
    }
  }

  async summarizeStreaming(text, options = {}, onChunk) {
    try {
      const summarizer = await this.createSummarizer(options);
      const stream = summarizer.summarizeStreaming(text, { context: options.context });
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText = chunk;
        if (onChunk) onChunk(chunk);
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming summarization failed:', error);
      throw error;
    }
  }

  // ===== Translator API =====

  async createTranslator(sourceLanguage, targetLanguage, options = {}) {
    try {
      if (!('Translator' in self)) {
        throw new Error('Translator API not available');
      }

      const translator = await Translator.create({
        sourceLanguage,
        targetLanguage,
        ...options
      });
      
      console.log(`Translator created: ${sourceLanguage} -> ${targetLanguage}`);
      return translator;
    } catch (error) {
      console.error('Failed to create translator:', error);
      throw error;
    }
  }

  async translate(text, sourceLanguage, targetLanguage) {
    try {
      const translator = await this.createTranslator(sourceLanguage, targetLanguage);
      const result = await translator.translate(text);
      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      throw error;
    }
  }

  async translateStreaming(text, sourceLanguage, targetLanguage, onChunk) {
    try {
      const translator = await this.createTranslator(sourceLanguage, targetLanguage);
      const stream = translator.translateStreaming(text);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText = chunk;
        if (onChunk) onChunk(chunk);
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming translation failed:', error);
      throw error;
    }
  }

  // ===== Language Detector API =====

  async createLanguageDetector(options = {}) {
    try {
      if (!('LanguageDetector' in self)) {
        throw new Error('LanguageDetector API not available');
      }

      const detector = await LanguageDetector.create(options);
      console.log('LanguageDetector created successfully');
      return detector;
    } catch (error) {
      console.error('Failed to create language detector:', error);
      throw error;
    }
  }

  async detectLanguage(text) {
    try {
      const detector = await this.createLanguageDetector();
      const results = await detector.detect(text);
      
      // Return top result
      if (results && results.length > 0) {
        return {
          language: results[0].detectedLanguage,
          confidence: results[0].confidence,
          allResults: results
        };
      }
      
      return null;
    } catch (error) {
      console.error('Language detection failed:', error);
      throw error;
    }
  }

  // ===== Prompt API (Language Model) =====

  async createLanguageModel(options = {}) {
    try {
      if (!('LanguageModel' in self)) {
        throw new Error('LanguageModel API not available');
      }

      const defaultOptions = {
        temperature: 0.7,
        topK: 40,
        ...options
      };

      const model = await LanguageModel.create(defaultOptions);
      console.log('LanguageModel created successfully');
      return model;
    } catch (error) {
      console.error('Failed to create language model:', error);
      throw error;
    }
  }

  async prompt(text, options = {}) {
    try {
      const model = await this.createLanguageModel(options);
      const result = await model.prompt(text);
      return result;
    } catch (error) {
      console.error('Prompt failed:', error);
      throw error;
    }
  }

  async promptStreaming(text, options = {}, onChunk) {
    try {
      const model = await this.createLanguageModel(options);
      const stream = model.promptStreaming(text);
      
      let fullText = '';
      for await (const chunk of stream) {
        fullText = chunk;
        if (onChunk) onChunk(chunk);
      }
      
      return fullText;
    } catch (error) {
      console.error('Streaming prompt failed:', error);
      throw error;
    }
  }

  // ===== Utility Methods =====

  getAvailability(apiName) {
    return this.availability[apiName] || 'unknown';
  }

  getAllAvailability() {
    return { ...this.availability };
  }

  isAPIAvailable(apiName) {
    const availability = this.availability[apiName];
    // API is available if it's in any of these states:
    // - 'readily': Ready to use immediately
    // - 'after-download': Model needs download but API is enabled
    // - 'available': Generic available state (some Chrome versions)
    const availableStates = ['readily', 'after-download', 'available'];
    return availableStates.includes(availability);
  }

  async waitForDownload(apiName, onProgress) {
    // This would monitor download progress for an API
    // Implementation depends on specific API
    console.log(`Waiting for ${apiName} download...`);
  }
}

// Export singleton instance
const aiAPIManager = new AIAPIManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AIAPIManager, aiAPIManager };
}

// Make available globally in extension context
if (typeof self !== 'undefined') {
  self.aiAPIManager = aiAPIManager;
}
