/**
 * PrivacyManager - Handles local data encryption and privacy indicators
 * Implements AES-256-GCM encryption for secure local storage
 */
class PrivacyManager {
  constructor() {
    this.encryptionKey = null;
    this.storageQuota = 50 * 1024 * 1024; // 50MB limit
    this.keyStorageKey = 'intellipen-encryption-key';
    this.dataPrefix = 'intellipen-encrypted-';
    this.initialized = false;
    this.privacyIndicators = new Map();
  }

  /**
   * Initialize the privacy manager
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    console.log('Initializing PrivacyManager...');
    
    try {
      await this.initializeEncryptionKey();
      this.setupPrivacyIndicators();
      this.initialized = true;
      console.log('✓ PrivacyManager initialized with AES-256-GCM encryption');
    } catch (error) {
      console.error('Failed to initialize PrivacyManager:', error);
      throw error;
    }
  }

  /**
   * Initialize or retrieve the encryption key
   * @returns {Promise<void>}
   */
  async initializeEncryptionKey() {
    try {
      // Try to retrieve existing key from secure storage
      const storedKey = await this.getStoredEncryptionKey();
      
      if (storedKey) {
        this.encryptionKey = storedKey;
        console.log('✓ Retrieved existing encryption key');
      } else {
        // Generate new key
        this.encryptionKey = await this.generateEncryptionKey();
        await this.storeEncryptionKey(this.encryptionKey);
        console.log('✓ Generated new encryption key');
      }
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw error;
    }
  }

  /**
   * Generate a new AES-256-GCM encryption key
   * @returns {Promise<CryptoKey>}
   */
  async generateEncryptionKey() {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Store the encryption key securely
   * @param {CryptoKey} key - The encryption key to store
   * @returns {Promise<void>}
   */
  async storeEncryptionKey(key) {
    try {
      const exportedKey = await crypto.subtle.exportKey('jwk', key);
      
      // Store in Chrome extension storage (more secure than localStorage)
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          [this.keyStorageKey]: exportedKey
        });
      } else {
        // Fallback to localStorage (less secure)
        localStorage.setItem(this.keyStorageKey, JSON.stringify(exportedKey));
      }
    } catch (error) {
      console.error('Failed to store encryption key:', error);
      throw error;
    }
  }

  /**
   * Retrieve the stored encryption key
   * @returns {Promise<CryptoKey|null>}
   */
  async getStoredEncryptionKey() {
    try {
      let exportedKey;
      
      // Try Chrome extension storage first
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([this.keyStorageKey]);
        exportedKey = result[this.keyStorageKey];
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem(this.keyStorageKey);
        exportedKey = stored ? JSON.parse(stored) : null;
      }
      
      if (!exportedKey) {
        return null;
      }
      
      return await crypto.subtle.importKey(
        'jwk',
        exportedKey,
        { name: 'AES-GCM' },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      console.warn('Failed to retrieve stored encryption key:', error);
      return null;
    }
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {any} data - Data to encrypt
   * @returns {Promise<Object>}
   */
  async encryptData(data) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      // Generate random IV (12 bytes for GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Convert data to string and then to bytes
      const dataString = JSON.stringify(data);
      const encodedData = new TextEncoder().encode(dataString);
      
      // Encrypt the data
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.encryptionKey,
        encodedData
      );

      return {
        encryptedData: Array.from(new Uint8Array(encryptedData)),
        iv: Array.from(iv),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to encrypt data:', error);
      throw error;
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {Object} encryptedPackage - Encrypted data package
   * @returns {Promise<any>}
   */
  async decryptData(encryptedPackage) {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized');
    }

    try {
      const { encryptedData, iv } = encryptedPackage;
      
      // Convert arrays back to Uint8Array
      const encryptedBuffer = new Uint8Array(encryptedData);
      const ivBuffer = new Uint8Array(iv);
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: ivBuffer
        },
        this.encryptionKey,
        encryptedBuffer
      );

      // Convert back to string and parse JSON
      const dataString = new TextDecoder().decode(decryptedData);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      throw error;
    }
  }

  /**
   * Store data securely with encryption
   * @param {string} key - Storage key
   * @param {any} data - Data to store
   * @returns {Promise<void>}
   */
  async storeSecurely(key, data) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const encrypted = await this.encryptData(data);
      const storageKey = this.dataPrefix + key;
      
      // Check storage quota
      await this.checkStorageQuota();
      
      // Store encrypted data
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({
          [storageKey]: encrypted
        });
      } else {
        localStorage.setItem(storageKey, JSON.stringify(encrypted));
      }
      
      console.log(`✓ Data stored securely: ${key}`);
    } catch (error) {
      console.error(`Failed to store data securely (${key}):`, error);
      throw error;
    }
  }

  /**
   * Retrieve and decrypt stored data
   * @param {string} key - Storage key
   * @returns {Promise<any|null>}
   */
  async retrieveSecurely(key) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const storageKey = this.dataPrefix + key;
      let encryptedPackage;
      
      // Retrieve encrypted data
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get([storageKey]);
        encryptedPackage = result[storageKey];
      } else {
        const stored = localStorage.getItem(storageKey);
        encryptedPackage = stored ? JSON.parse(stored) : null;
      }
      
      if (!encryptedPackage) {
        return null;
      }
      
      const decryptedData = await this.decryptData(encryptedPackage);
      console.log(`✓ Data retrieved securely: ${key}`);
      return decryptedData;
    } catch (error) {
      console.error(`Failed to retrieve data securely (${key}):`, error);
      return null;
    }
  }

  /**
   * Delete stored data
   * @param {string} key - Storage key
   * @returns {Promise<void>}
   */
  async deleteSecurely(key) {
    try {
      const storageKey = this.dataPrefix + key;
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove([storageKey]);
      } else {
        localStorage.removeItem(storageKey);
      }
      
      console.log(`✓ Data deleted securely: ${key}`);
    } catch (error) {
      console.error(`Failed to delete data securely (${key}):`, error);
      throw error;
    }
  }

  /**
   * Check storage quota and clean up if necessary
   * @returns {Promise<void>}
   */
  async checkStorageQuota() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const usage = await chrome.storage.local.getBytesInUse();
        const quota = chrome.storage.local.QUOTA_BYTES || this.storageQuota;
        
        if (usage > quota * 0.9) { // 90% of quota
          console.warn(`Storage usage high: ${usage}/${quota} bytes`);
          await this.cleanupOldData();
        }
      }
    } catch (error) {
      console.warn('Failed to check storage quota:', error);
    }
  }

  /**
   * Clean up old encrypted data
   * @returns {Promise<void>}
   */
  async cleanupOldData() {
    try {
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      let keysToDelete = [];
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const allData = await chrome.storage.local.get();
        
        for (const [key, value] of Object.entries(allData)) {
          if (key.startsWith(this.dataPrefix) && 
              value.timestamp && 
              value.timestamp < cutoffTime) {
            keysToDelete.push(key);
          }
        }
        
        if (keysToDelete.length > 0) {
          await chrome.storage.local.remove(keysToDelete);
          console.log(`✓ Cleaned up ${keysToDelete.length} old encrypted entries`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  /**
   * Setup privacy indicators system
   */
  setupPrivacyIndicators() {
    // Add CSS for privacy indicators
    this.injectPrivacyIndicatorStyles();
    
    // Listen for privacy indicator requests
    if (typeof window !== 'undefined') {
      window.addEventListener('intellipen-show-privacy-indicator', (event) => {
        this.showPrivacyIndicator(event.detail.element, event.detail.status);
      });
    }
  }

  /**
   * Inject CSS styles for privacy indicators
   */
  injectPrivacyIndicatorStyles() {
    if (document.getElementById('intellipen-privacy-styles')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'intellipen-privacy-styles';
    style.textContent = `
      .intellipen-privacy-indicator {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 12px;
        font-size: 11px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        color: #059669;
        position: absolute;
        z-index: 10000;
        pointer-events: none;
        animation: fadeIn 0.3s ease-out;
      }
      
      .intellipen-privacy-indicator.processing {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        color: #2563eb;
      }
      
      .intellipen-privacy-indicator.error {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #dc2626;
      }
      
      .intellipen-privacy-indicator::before {
        content: '🔒';
        font-size: 10px;
      }
      
      .intellipen-privacy-indicator.processing::before {
        content: '⚡';
      }
      
      .intellipen-privacy-indicator.error::before {
        content: '⚠️';
      }
      
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Show privacy indicator on an element
   * @param {HTMLElement} element - Element to show indicator on
   * @param {string} status - Status: 'secure', 'processing', 'error'
   * @param {Object} options - Display options
   */
  showPrivacyIndicator(element, status = 'secure', options = {}) {
    if (!element) {
      return;
    }

    const {
      duration = 3000,
      position = 'top-right',
      message = this.getStatusMessage(status)
    } = options;

    // Remove existing indicator
    this.hidePrivacyIndicator(element);

    // Create indicator
    const indicator = document.createElement('div');
    indicator.className = `intellipen-privacy-indicator ${status}`;
    indicator.textContent = message;
    indicator.setAttribute('data-intellipen-indicator', 'true');

    // Position indicator
    this.positionIndicator(indicator, element, position);

    // Add to DOM
    document.body.appendChild(indicator);
    
    // Store reference
    this.privacyIndicators.set(element, indicator);

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        this.hidePrivacyIndicator(element);
      }, duration);
    }
  }

  /**
   * Position privacy indicator relative to element
   * @param {HTMLElement} indicator - Indicator element
   * @param {HTMLElement} target - Target element
   * @param {string} position - Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left'
   */
  positionIndicator(indicator, target, position) {
    const rect = target.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    let left, top;

    switch (position) {
      case 'top-left':
        left = rect.left + scrollX;
        top = rect.top + scrollY - 30;
        break;
      case 'top-right':
        left = rect.right + scrollX - 100;
        top = rect.top + scrollY - 30;
        break;
      case 'bottom-left':
        left = rect.left + scrollX;
        top = rect.bottom + scrollY + 5;
        break;
      case 'bottom-right':
      default:
        left = rect.right + scrollX - 100;
        top = rect.bottom + scrollY + 5;
        break;
    }

    indicator.style.left = `${Math.max(0, left)}px`;
    indicator.style.top = `${Math.max(0, top)}px`;
  }

  /**
   * Hide privacy indicator for an element
   * @param {HTMLElement} element - Element to hide indicator for
   */
  hidePrivacyIndicator(element) {
    const indicator = this.privacyIndicators.get(element);
    if (indicator && indicator.parentNode) {
      indicator.remove();
      this.privacyIndicators.delete(element);
    }
  }

  /**
   * Get status message for privacy indicator
   * @param {string} status - Status type
   * @returns {string}
   */
  getStatusMessage(status) {
    const messages = {
      secure: 'Local Processing',
      processing: 'AI Processing',
      error: 'Processing Error'
    };
    return messages[status] || 'Unknown Status';
  }

  /**
   * Export all encrypted data (for backup)
   * @returns {Promise<Object>}
   */
  async exportEncryptedData() {
    try {
      const exportData = {};
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const allData = await chrome.storage.local.get();
        
        for (const [key, value] of Object.entries(allData)) {
          if (key.startsWith(this.dataPrefix)) {
            exportData[key] = value;
          }
        }
      }
      
      return {
        data: exportData,
        exportedAt: Date.now(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Failed to export encrypted data:', error);
      throw error;
    }
  }

  /**
   * Delete all encrypted data
   * @returns {Promise<void>}
   */
  async deleteAllData() {
    try {
      const keysToDelete = [];
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const allData = await chrome.storage.local.get();
        
        for (const key of Object.keys(allData)) {
          if (key.startsWith(this.dataPrefix)) {
            keysToDelete.push(key);
          }
        }
        
        if (keysToDelete.length > 0) {
          await chrome.storage.local.remove(keysToDelete);
        }
      }
      
      console.log(`✓ Deleted ${keysToDelete.length} encrypted data entries`);
    } catch (error) {
      console.error('Failed to delete all data:', error);
      throw error;
    }
  }

  /**
   * Get privacy manager statistics
   * @returns {Promise<Object>}
   */
  async getPrivacyStats() {
    try {
      let encryptedEntries = 0;
      let totalSize = 0;
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const allData = await chrome.storage.local.get();
        
        for (const [key, value] of Object.entries(allData)) {
          if (key.startsWith(this.dataPrefix)) {
            encryptedEntries++;
            totalSize += JSON.stringify(value).length;
          }
        }
      }
      
      return {
        encryptedEntries,
        totalSize,
        storageQuota: this.storageQuota,
        activeIndicators: this.privacyIndicators.size,
        initialized: this.initialized
      };
    } catch (error) {
      console.error('Failed to get privacy stats:', error);
      return {
        encryptedEntries: 0,
        totalSize: 0,
        storageQuota: this.storageQuota,
        activeIndicators: this.privacyIndicators.size,
        initialized: this.initialized
      };
    }
  }
}

export default PrivacyManager;