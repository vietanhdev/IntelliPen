/**
 * Privacy Manager Module - Local encryption and privacy indicators
 * Provides AES-256 encryption for local storage and privacy status UI
 */

import PrivacyManager from './PrivacyManager.js';
import PrivacyIndicatorUI from './PrivacyIndicatorUI.js';

// Create singleton instances
const privacyManager = new PrivacyManager();
const privacyIndicatorUI = new PrivacyIndicatorUI(privacyManager);

/**
 * Initialize the privacy management system
 * @returns {Promise<void>}
 */
export async function initializePrivacyManager() {
  await privacyManager.initialize();
}

/**
 * Store data securely with encryption
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {Promise<void>}
 */
export async function storeSecurely(key, data) {
  return await privacyManager.storeSecurely(key, data);
}

/**
 * Retrieve and decrypt stored data
 * @param {string} key - Storage key
 * @returns {Promise<any|null>}
 */
export async function retrieveSecurely(key) {
  return await privacyManager.retrieveSecurely(key);
}

/**
 * Delete stored data securely
 * @param {string} key - Storage key
 * @returns {Promise<void>}
 */
export async function deleteSecurely(key) {
  return await privacyManager.deleteSecurely(key);
}

/**
 * Show privacy indicator on an element
 * @param {HTMLElement} element - Element to show indicator on
 * @param {string} status - Status: 'secure', 'processing', 'error'
 * @param {Object} options - Display options
 */
export function showPrivacyIndicator(element, status = 'secure', options = {}) {
  privacyManager.showPrivacyIndicator(element, status, options);
}

/**
 * Hide privacy indicator for an element
 * @param {HTMLElement} element - Element to hide indicator for
 */
export function hidePrivacyIndicator(element) {
  privacyManager.hidePrivacyIndicator(element);
}

/**
 * Show global privacy status indicator
 * @param {HTMLElement} container - Container element
 */
export function showGlobalPrivacyIndicator(container) {
  privacyIndicatorUI.showGlobalIndicator(container);
}

/**
 * Update global privacy status
 * @param {string} status - Status: 'secure', 'processing', 'fallback', 'error'
 */
export function updateGlobalPrivacyStatus(status) {
  privacyIndicatorUI.updateGlobalPrivacyStatus(status);
}

/**
 * Create privacy badge for input elements
 * @param {HTMLElement} inputElement - Input element to attach badge to
 * @returns {HTMLElement}
 */
export function createPrivacyBadge(inputElement) {
  return privacyIndicatorUI.createPrivacyBadge(inputElement);
}

/**
 * Show privacy tooltip
 * @param {HTMLElement} element - Element to show tooltip for
 * @param {string} message - Tooltip message
 */
export function showPrivacyTooltip(element, message) {
  privacyIndicatorUI.showPrivacyTooltip(element, message);
}

/**
 * Export all encrypted data for backup
 * @returns {Promise<Object>}
 */
export async function exportEncryptedData() {
  return await privacyManager.exportEncryptedData();
}

/**
 * Delete all encrypted data
 * @returns {Promise<void>}
 */
export async function deleteAllData() {
  return await privacyManager.deleteAllData();
}

/**
 * Get privacy manager statistics
 * @returns {Promise<Object>}
 */
export async function getPrivacyStats() {
  const privacyStats = await privacyManager.getPrivacyStats();
  const indicatorStats = privacyIndicatorUI.getIndicatorStats();
  
  return {
    ...privacyStats,
    ...indicatorStats
  };
}

/**
 * Cleanup privacy manager resources
 */
export function cleanupPrivacyManager() {
  privacyIndicatorUI.cleanup();
}

// Export individual classes for advanced usage
export {
  PrivacyManager,
  PrivacyIndicatorUI
};

// Export singleton instances
export { privacyManager, privacyIndicatorUI };

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cleanupPrivacyManager();
  });
}