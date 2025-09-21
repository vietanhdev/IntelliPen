/**
 * APIAvailabilityManager - Manages Chrome AI API availability detection and session management
 * Handles Proofreader, Writer, Rewriter, Summarizer, and Prompt APIs
 */
class APIAvailabilityManager {
  constructor() {
    this.availableAPIs = new Set();
    this.sessions = new Map();
    this.fallbackStrategies = new Map();
    this.initializationPromises = new Map();
    
    // API configuration
    this.apiConfig = {
      'proofreader': {
        namespace: 'chrome.ai.proofreader',
        createMethod: 'create',
        fallback: 'basic-spell-check'
      },
      'writer': {
        namespace: 'chrome.ai.writer', 
        createMethod: 'create',
        fallback: 'disable-feature'
      },
      'rewriter': {
        namespace: 'chrome.ai.rewriter',
        createMethod: 'create', 
        fallback: 'disable-feature'
      },
      'summarizer': {
        namespace: 'chrome.ai.summarizer',
        createMethod: 'create',
        fallback: 'extract-key-sentences'
      },
      'prompt': {
        namespace: 'chrome.ai.languageModel',
        createMethod: 'create',
        fallback: 'disable-feature'
      }
    };
  }

  /**
   * Initialize the API availability manager
   * @returns {Promise<void>}
   */
  async initialize() {
    console.log('Initializing API Availability Manager...');
    await this.checkAllAPIAvailability();
    this.setupFallbackStrategies();
  }

  /**
   * Check availability of all Chrome AI APIs
   * @returns {Promise<void>}
   */
  async checkAllAPIAvailability() {
    const checkPromises = Object.keys(this.apiConfig).map(apiName => 
      this.checkSingleAPIAvailability(apiName)
    );
    
    await Promise.allSettled(checkPromises);
    
    console.log('Available APIs:', Array.from(this.availableAPIs));
    console.log('Fallback strategies:', Object.fromEntries(this.fallbackStrategies));
  }

  /**
   * Check availability of a single API
   * @param {string} apiName - Name of the API to check
   * @returns {Promise<boolean>}
   */
  async checkSingleAPIAvailability(apiName) {
    try {
      const config = this.apiConfig[apiName];
      const apiObject = this.getAPIObject(config.namespace);
      
      if (!apiObject) {
        throw new Error(`API ${apiName} not found in browser`);
      }

      // Check if availability method exists
      if (typeof apiObject.availability === 'function') {
        const availability = await apiObject.availability();
        if (availability === 'available' || availability === 'downloadable') {
          this.availableAPIs.add(apiName);
          console.log(`✓ ${apiName} API is ${availability}`);
          return true;
        }
      } else if (typeof apiObject[config.createMethod] === 'function') {
        // If no availability method, assume available if create method exists
        this.availableAPIs.add(apiName);
        console.log(`✓ ${apiName} API is available (no availability check)`);
        return true;
      }
      
      throw new Error(`API ${apiName} is not available`);
    } catch (error) {
      console.warn(`✗ API ${apiName} not available:`, error.message);
      this.setupFallback(apiName);
      return false;
    }
  }

  /**
   * Get API object from namespace string
   * @param {string} namespace - API namespace (e.g., 'chrome.ai.proofreader')
   * @returns {Object|null}
   */
  getAPIObject(namespace) {
    const parts = namespace.split('.');
    let obj = window;
    
    for (const part of parts) {
      if (obj && typeof obj === 'object' && part in obj) {
        obj = obj[part];
      } else {
        return null;
      }
    }
    
    return obj;
  }

  /**
   * Setup fallback strategies for unavailable APIs
   */
  setupFallbackStrategies() {
    Object.keys(this.apiConfig).forEach(apiName => {
      if (!this.availableAPIs.has(apiName)) {
        this.setupFallback(apiName);
      }
    });
  }

  /**
   * Setup fallback strategy for a specific API
   * @param {string} apiName - Name of the API
   */
  setupFallback(apiName) {
    const config = this.apiConfig[apiName];
    this.fallbackStrategies.set(apiName, config.fallback);
    console.log(`Setting up fallback for ${apiName}: ${config.fallback}`);
  }

  /**
   * Create a session for a specific API
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options
   * @returns {Promise<Object>}
   */
  async createSession(apiName, options = {}) {
    if (!this.availableAPIs.has(apiName)) {
      throw new Error(`API ${apiName} is not available. Fallback: ${this.fallbackStrategies.get(apiName)}`);
    }

    // Check if we already have an initialization promise for this API
    const initKey = `${apiName}-${JSON.stringify(options)}`;
    if (this.initializationPromises.has(initKey)) {
      return await this.initializationPromises.get(initKey);
    }

    // Create initialization promise
    const initPromise = this._createSessionInternal(apiName, options);
    this.initializationPromises.set(initKey, initPromise);

    try {
      const session = await initPromise;
      this.sessions.set(initKey, session);
      return session;
    } catch (error) {
      this.initializationPromises.delete(initKey);
      throw error;
    }
  }

  /**
   * Internal session creation method
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options
   * @returns {Promise<Object>}
   */
  async _createSessionInternal(apiName, options) {
    const config = this.apiConfig[apiName];
    const apiObject = this.getAPIObject(config.namespace);
    
    if (!apiObject || typeof apiObject[config.createMethod] !== 'function') {
      throw new Error(`Cannot create session for ${apiName}: API not properly available`);
    }

    // Add download progress monitoring if supported
    const sessionOptions = {
      ...options,
      monitor: options.monitor || ((m) => {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`${apiName} download progress: ${Math.round(e.loaded * 100)}%`);
        });
      })
    };

    console.log(`Creating ${apiName} session...`);
    const session = await apiObject[config.createMethod](sessionOptions);
    console.log(`✓ ${apiName} session created successfully`);
    
    return session;
  }

  /**
   * Get existing session or create new one
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options
   * @returns {Promise<Object>}
   */
  async getSession(apiName, options = {}) {
    const sessionKey = `${apiName}-${JSON.stringify(options)}`;
    
    if (this.sessions.has(sessionKey)) {
      return this.sessions.get(sessionKey);
    }
    
    return await this.createSession(apiName, options);
  }

  /**
   * Check if a specific API is available
   * @param {string} apiName - Name of the API to check
   * @returns {boolean}
   */
  isAPIAvailable(apiName) {
    return this.availableAPIs.has(apiName);
  }

  /**
   * Get fallback strategy for an API
   * @param {string} apiName - Name of the API
   * @returns {string|null}
   */
  getFallbackStrategy(apiName) {
    return this.fallbackStrategies.get(apiName) || null;
  }

  /**
   * Get list of all available APIs
   * @returns {Array<string>}
   */
  getAvailableAPIs() {
    return Array.from(this.availableAPIs);
  }

  /**
   * Destroy a session
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options used to create the session
   */
  destroySession(apiName, options = {}) {
    const sessionKey = `${apiName}-${JSON.stringify(options)}`;
    const session = this.sessions.get(sessionKey);
    
    if (session && typeof session.destroy === 'function') {
      session.destroy();
    }
    
    this.sessions.delete(sessionKey);
    this.initializationPromises.delete(sessionKey);
    console.log(`Session destroyed for ${apiName}`);
  }

  /**
   * Destroy all sessions
   */
  destroyAllSessions() {
    for (const [sessionKey, session] of this.sessions.entries()) {
      if (session && typeof session.destroy === 'function') {
        session.destroy();
      }
    }
    
    this.sessions.clear();
    this.initializationPromises.clear();
    console.log('All sessions destroyed');
  }

  /**
   * Get session statistics
   * @returns {Object}
   */
  getSessionStats() {
    return {
      availableAPIs: this.getAvailableAPIs(),
      activeSessions: this.sessions.size,
      fallbackStrategies: Object.fromEntries(this.fallbackStrategies)
    };
  }
}

export default APIAvailabilityManager;