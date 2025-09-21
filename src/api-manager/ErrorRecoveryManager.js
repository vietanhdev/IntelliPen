/**
 * ErrorRecoveryManager - Handles error recovery, retries, and graceful degradation
 * for Chrome AI API operations
 */
class ErrorRecoveryManager {
  constructor() {
    this.retryAttempts = new Map();
    this.maxRetries = 3;
    this.backoffMultiplier = 2;
    this.baseDelay = 1000; // 1 second
    this.fallbackModeActive = new Set();
  }

  /**
   * Execute an operation with retry logic
   * @param {Function} operation - The operation to execute
   * @param {string} context - Context identifier for the operation
   * @param {Object} options - Retry options
   * @returns {Promise<any>}
   */
  async executeWithRetry(operation, context, options = {}) {
    const {
      maxRetries = this.maxRetries,
      backoffMultiplier = this.backoffMultiplier,
      baseDelay = this.baseDelay
    } = options;

    const key = `${operation.name || 'anonymous'}-${context}`;
    const attempts = this.retryAttempts.get(key) || 0;

    try {
      const result = await operation();
      // Reset retry count on success
      this.retryAttempts.delete(key);
      return result;
    } catch (error) {
      console.warn(`Operation failed (attempt ${attempts + 1}):`, error.message);

      if (attempts < maxRetries && this.isRetryableError(error)) {
        this.retryAttempts.set(key, attempts + 1);
        const delay = baseDelay * Math.pow(backoffMultiplier, attempts);
        
        console.log(`Retrying in ${delay}ms...`);
        await this.delay(delay);
        
        return this.executeWithRetry(operation, context, options);
      } else {
        // Max retries reached or non-retryable error
        this.retryAttempts.delete(key);
        await this.handleFinalFailure(error, context);
        throw error;
      }
    }
  }

  /**
   * Determine if an error is retryable
   * @param {Error} error - The error to check
   * @returns {boolean}
   */
  isRetryableError(error) {
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ServiceUnavailable',
      'InternalError',
      'TemporaryFailure'
    ];

    const nonRetryableErrors = [
      'NotSupportedError',
      'InvalidStateError',
      'SecurityError',
      'PermissionDeniedError'
    ];

    // Check error name
    if (nonRetryableErrors.includes(error.name)) {
      return false;
    }

    if (retryableErrors.includes(error.name)) {
      return true;
    }

    // Check error message for common patterns
    const message = error.message.toLowerCase();
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('temporary') ||
        message.includes('unavailable')) {
      return true;
    }

    if (message.includes('not supported') || 
        message.includes('permission') || 
        message.includes('security')) {
      return false;
    }

    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Handle final failure after all retries exhausted
   * @param {Error} error - The final error
   * @param {string} context - Context identifier
   */
  async handleFinalFailure(error, context) {
    console.error(`Operation failed after retries (${context}):`, error);
    
    // Show user-friendly error message
    this.showUserError(
      'IntelliPen encountered an issue. Some features may be temporarily unavailable.',
      context
    );
    
    // Attempt graceful degradation
    this.enableFallbackMode(context);
    
    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('Full error details:', error);
    }
  }

  /**
   * Show user-friendly error message
   * @param {string} message - Error message to show
   * @param {string} context - Context identifier
   */
  showUserError(message, context) {
    // Create or update error notification
    const errorId = `error-${context}`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'intellipen-error-notification';
      errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
      `;
      
      // Add animation keyframes if not already added
      if (!document.getElementById('intellipen-error-styles')) {
        const style = document.createElement('style');
        style.id = 'intellipen-error-styles';
        style.textContent = `
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, 5000);
  }

  /**
   * Enable fallback mode for a specific context
   * @param {string} context - Context identifier
   */
  enableFallbackMode(context) {
    this.fallbackModeActive.add(context);
    console.log(`Fallback mode enabled for: ${context}`);
    
    // Emit event for other components to handle fallback
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intellipen-fallback-mode', {
        detail: { context, active: true }
      }));
    }
  }

  /**
   * Disable fallback mode for a specific context
   * @param {string} context - Context identifier
   */
  disableFallbackMode(context) {
    this.fallbackModeActive.delete(context);
    console.log(`Fallback mode disabled for: ${context}`);
    
    // Emit event for other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intellipen-fallback-mode', {
        detail: { context, active: false }
      }));
    }
  }

  /**
   * Check if fallback mode is active for a context
   * @param {string} context - Context identifier
   * @returns {boolean}
   */
  isFallbackModeActive(context) {
    return this.fallbackModeActive.has(context);
  }

  /**
   * Create a delay promise
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Reset retry attempts for a specific operation
   * @param {string} context - Context identifier
   */
  resetRetryAttempts(context) {
    const keysToDelete = [];
    for (const key of this.retryAttempts.keys()) {
      if (key.includes(context)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.retryAttempts.delete(key));
  }

  /**
   * Get current retry statistics
   * @returns {Object}
   */
  getRetryStats() {
    return {
      activeRetries: this.retryAttempts.size,
      fallbackModeContexts: Array.from(this.fallbackModeActive),
      retryAttempts: Object.fromEntries(this.retryAttempts)
    };
  }

  /**
   * Clear all retry attempts and fallback modes
   */
  reset() {
    this.retryAttempts.clear();
    this.fallbackModeActive.clear();
    console.log('ErrorRecoveryManager reset');
  }
}

export default ErrorRecoveryManager;