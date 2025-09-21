/**
 * API Manager Module - Chrome AI API integration layer
 * Provides availability checking, session management, and error recovery
 */

import APIAvailabilityManager from './APIAvailabilityManager.js';
import ErrorRecoveryManager from './ErrorRecoveryManager.js';
import SessionManager from './SessionManager.js';

// Create singleton instances
const sessionManager = new SessionManager();

/**
 * Initialize the API management system
 * @returns {Promise<void>}
 */
export async function initializeAPIManager() {
  await sessionManager.initialize();
}

/**
 * Get a session for a specific Chrome AI API
 * @param {string} apiName - Name of the API (proofreader, writer, rewriter, summarizer, prompt)
 * @param {Object} options - Session configuration options
 * @returns {Promise<Object>}
 */
export async function getSession(apiName, options = {}) {
  return await sessionManager.getSession(apiName, options);
}

/**
 * Check if a specific API is available
 * @param {string} apiName - Name of the API to check
 * @returns {boolean}
 */
export function isAPIAvailable(apiName) {
  return sessionManager.isAPIAvailable(apiName);
}

/**
 * Get list of all available APIs
 * @returns {Array<string>}
 */
export function getAvailableAPIs() {
  return sessionManager.getAvailableAPIs();
}

/**
 * Get comprehensive statistics about API sessions
 * @returns {Object}
 */
export function getAPIStats() {
  return sessionManager.getSessionStats();
}

/**
 * Clean up stale sessions
 */
export function cleanupSessions() {
  sessionManager.cleanupStaleSessions();
}

/**
 * Destroy all sessions and cleanup resources
 */
export function destroyAPIManager() {
  sessionManager.destroy();
}

// Export individual classes for advanced usage
export {
  APIAvailabilityManager,
  ErrorRecoveryManager,
  SessionManager
};

// Export singleton instance
export { sessionManager };

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    destroyAPIManager();
  });
  
  // Periodic cleanup of stale sessions (every 5 minutes)
  setInterval(() => {
    cleanupSessions();
  }, 5 * 60 * 1000);
}