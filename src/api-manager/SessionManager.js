/**
 * SessionManager - Manages AI API sessions with lifecycle management
 * Integrates with APIAvailabilityManager and ErrorRecoveryManager
 */
import APIAvailabilityManager from './APIAvailabilityManager.js';
import ErrorRecoveryManager from './ErrorRecoveryManager.js';

class SessionManager {
  constructor() {
    this.apiManager = new APIAvailabilityManager();
    this.errorManager = new ErrorRecoveryManager();
    this.activeSessions = new Map();
    this.sessionConfigs = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the session manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Initializing SessionManager...');
    
    try {
      await this.apiManager.initialize();
      this.initialized = true;
      console.log('✓ SessionManager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SessionManager:', error);
      throw error;
    }
  }

  /**
   * Create or get a session for a specific API
   * @param {string} apiName - Name of the API (proofreader, writer, rewriter, summarizer, prompt)
   * @param {Object} options - Session configuration options
   * @returns {Promise<Object>}
   */
  async getSession(apiName, options = {}) {
    if (!this.initialized) {
      await this.initialize();
    }

    const sessionKey = this.generateSessionKey(apiName, options);
    
    // Return existing session if available
    if (this.activeSessions.has(sessionKey)) {
      const session = this.activeSessions.get(sessionKey);
      if (this.isSessionValid(session)) {
        return session;
      } else {
        // Clean up invalid session
        this.destroySession(sessionKey);
      }
    }

    // Create new session with error recovery
    return await this.errorManager.executeWithRetry(
      async () => {
        const session = await this.createNewSession(apiName, options);
        this.activeSessions.set(sessionKey, session);
        this.sessionConfigs.set(sessionKey, { apiName, options, createdAt: Date.now() });
        return session;
      },
      `create-session-${apiName}`,
      { maxRetries: 2 }
    );
  }

  /**
   * Create a new session for the specified API
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options
   * @returns {Promise<Object>}
   */
  async createNewSession(apiName, options) {
    if (!this.apiManager.isAPIAvailable(apiName)) {
      const fallback = this.apiManager.getFallbackStrategy(apiName);
      throw new Error(`API ${apiName} is not available. Fallback strategy: ${fallback}`);
    }

    console.log(`Creating new ${apiName} session...`);
    
    // API-specific session configuration
    const sessionOptions = this.prepareSessionOptions(apiName, options);
    
    try {
      const session = await this.apiManager.createSession(apiName, sessionOptions);
      
      // Add session metadata
      session._intellipen = {
        apiName,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        usageCount: 0
      };
      
      // Wrap session methods to track usage
      this.wrapSessionMethods(session);
      
      console.log(`✓ ${apiName} session created successfully`);
      return session;
    } catch (error) {
      console.error(`Failed to create ${apiName} session:`, error);
      throw error;
    }
  }

  /**
   * Prepare session options based on API type
   * @param {string} apiName - Name of the API
   * @param {Object} options - User-provided options
   * @returns {Object}
   */
  prepareSessionOptions(apiName, options) {
    const baseOptions = {
      monitor: (m) => {
        m.addEventListener('downloadprogress', (e) => {
          console.log(`${apiName} download: ${Math.round(e.loaded * 100)}%`);
          
          // Emit progress event for UI updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('intellipen-download-progress', {
              detail: { apiName, progress: e.loaded }
            }));
          }
        });
      }
    };

    // API-specific default options
    switch (apiName) {
      case 'proofreader':
        return {
          ...baseOptions,
          expectedInputLanguages: ['en'],
          ...options
        };
        
      case 'writer':
        return {
          ...baseOptions,
          tone: 'neutral',
          format: 'markdown',
          length: 'medium',
          ...options
        };
        
      case 'rewriter':
        return {
          ...baseOptions,
          tone: 'as-is',
          format: 'as-is',
          length: 'as-is',
          ...options
        };
        
      case 'summarizer':
        return {
          ...baseOptions,
          type: 'key-points',
          format: 'markdown',
          length: 'medium',
          ...options
        };
        
      case 'prompt':
        return {
          ...baseOptions,
          temperature: 0.7,
          topK: 3,
          ...options
        };
        
      default:
        return { ...baseOptions, ...options };
    }
  }

  /**
   * Wrap session methods to track usage and handle errors
   * @param {Object} session - The session object to wrap
   */
  wrapSessionMethods(session) {
    const methodsToWrap = ['prompt', 'promptStreaming', 'proofread', 'write', 'writeStreaming', 
                          'rewrite', 'rewriteStreaming', 'summarize', 'summarizeStreaming'];
    
    methodsToWrap.forEach(methodName => {
      if (typeof session[methodName] === 'function') {
        const originalMethod = session[methodName].bind(session);
        
        session[methodName] = async (...args) => {
          session._intellipen.lastUsed = Date.now();
          session._intellipen.usageCount++;
          
          return await this.errorManager.executeWithRetry(
            () => originalMethod(...args),
            `${session._intellipen.apiName}-${methodName}`,
            { maxRetries: 1 } // Lower retry count for individual operations
          );
        };
      }
    });
  }

  /**
   * Generate a unique session key
   * @param {string} apiName - Name of the API
   * @param {Object} options - Session options
   * @returns {string}
   */
  generateSessionKey(apiName, options) {
    // Create a hash of the options for the key
    const optionsHash = this.hashObject(options);
    return `${apiName}-${optionsHash}`;
  }

  /**
   * Create a simple hash of an object
   * @param {Object} obj - Object to hash
   * @returns {string}
   */
  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if a session is still valid
   * @param {Object} session - Session to validate
   * @returns {boolean}
   */
  isSessionValid(session) {
    if (!session || !session._intellipen) {
      return false;
    }

    // Check if session has been destroyed
    if (session._destroyed) {
      return false;
    }

    // Check session age (sessions older than 1 hour are considered stale)
    const maxAge = 60 * 60 * 1000; // 1 hour
    const age = Date.now() - session._intellipen.createdAt;
    if (age > maxAge) {
      console.log(`Session for ${session._intellipen.apiName} is stale (${Math.round(age / 1000)}s old)`);
      return false;
    }

    return true;
  }

  /**
   * Destroy a specific session
   * @param {string} sessionKey - Key of the session to destroy
   */
  destroySession(sessionKey) {
    const session = this.activeSessions.get(sessionKey);
    if (session) {
      if (typeof session.destroy === 'function') {
        session.destroy();
      }
      session._destroyed = true;
      
      const config = this.sessionConfigs.get(sessionKey);
      if (config) {
        console.log(`Session destroyed: ${config.apiName}`);
      }
    }
    
    this.activeSessions.delete(sessionKey);
    this.sessionConfigs.delete(sessionKey);
  }

  /**
   * Clean up stale sessions
   */
  cleanupStaleSessions() {
    const staleKeys = [];
    
    for (const [key, session] of this.activeSessions.entries()) {
      if (!this.isSessionValid(session)) {
        staleKeys.push(key);
      }
    }
    
    staleKeys.forEach(key => this.destroySession(key));
    
    if (staleKeys.length > 0) {
      console.log(`Cleaned up ${staleKeys.length} stale sessions`);
    }
  }

  /**
   * Get session statistics
   * @returns {Object}
   */
  getSessionStats() {
    const stats = {
      totalSessions: this.activeSessions.size,
      apiStats: this.apiManager.getSessionStats(),
      errorStats: this.errorManager.getRetryStats(),
      sessionsByAPI: {},
      sessionUsage: {}
    };

    // Count sessions by API
    for (const [key, config] of this.sessionConfigs.entries()) {
      const apiName = config.apiName;
      stats.sessionsByAPI[apiName] = (stats.sessionsByAPI[apiName] || 0) + 1;
      
      const session = this.activeSessions.get(key);
      if (session && session._intellipen) {
        stats.sessionUsage[key] = {
          apiName,
          usageCount: session._intellipen.usageCount,
          lastUsed: session._intellipen.lastUsed,
          age: Date.now() - session._intellipen.createdAt
        };
      }
    }

    return stats;
  }

  /**
   * Check if a specific API is available
   * @param {string} apiName - Name of the API to check
   * @returns {boolean}
   */
  isAPIAvailable(apiName) {
    return this.apiManager.isAPIAvailable(apiName);
  }

  /**
   * Get list of available APIs
   * @returns {Array<string>}
   */
  getAvailableAPIs() {
    return this.apiManager.getAvailableAPIs();
  }

  /**
   * Destroy all sessions and cleanup
   */
  destroy() {
    console.log('Destroying SessionManager...');
    
    // Destroy all active sessions
    for (const sessionKey of this.activeSessions.keys()) {
      this.destroySession(sessionKey);
    }
    
    // Cleanup managers
    this.apiManager.destroyAllSessions();
    this.errorManager.reset();
    
    this.initialized = false;
    console.log('✓ SessionManager destroyed');
  }
}

export default SessionManager;