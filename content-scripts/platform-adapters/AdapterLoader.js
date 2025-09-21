/**
 * IntelliPen Platform Adapter Loader
 * Dynamically loads platform-specific adapters based on current website
 */

class AdapterLoader {
  constructor() {
    this.loadedAdapters = new Set();
    this.availableAdapters = {
      'gmail.com': 'GmailAdapter',
      'mail.google.com': 'GmailAdapter',
      'linkedin.com': 'LinkedInAdapter',
      'www.linkedin.com': 'LinkedInAdapter',
      'notion.so': 'NotionAdapter',
      'www.notion.so': 'NotionAdapter',
      'notion.site': 'NotionAdapter',
      'docs.google.com': 'GoogleDocsAdapter'
    };
  }

  /**
   * Load adapters for the current site
   * @returns {Promise<{loaded: string[], failed: string[]}>}
   */
  async loadAdaptersForCurrentSite() {
    const hostname = window.location.hostname;
    const adapterName = this.getAdapterForSite(hostname);

    const results = {
      loaded: [],
      failed: []
    };

    if (adapterName && adapterName !== 'UniversalAdapter') {
      try {
        await this.loadAdapter(adapterName);
        results.loaded.push(adapterName);
      } catch (error) {
        console.warn(`Failed to load adapter ${adapterName}:`, error);
        results.failed.push(adapterName);
      }
    }

    // Always ensure UniversalAdapter is available
    if (!window.UniversalAdapter) {
      try {
        await this.loadAdapter('UniversalAdapter');
        results.loaded.push('UniversalAdapter');
      } catch (error) {
        console.warn('Failed to load UniversalAdapter:', error);
        results.failed.push('UniversalAdapter');
      }
    }

    return results;
  }

  /**
   * Get the appropriate adapter name for a given site
   * @param {string} hostname - The hostname to check
   * @returns {string} - The adapter name
   */
  getAdapterForSite(hostname) {
    // Check for exact matches first
    if (this.availableAdapters[hostname]) {
      return this.availableAdapters[hostname];
    }

    // Check for partial matches (e.g., subdomain.linkedin.com)
    for (const [domain, adapter] of Object.entries(this.availableAdapters)) {
      if (hostname.includes(domain)) {
        return adapter;
      }
    }

    // Default to universal adapter
    return 'UniversalAdapter';
  }

  /**
   * Load a specific adapter
   * @param {string} adapterName - Name of the adapter to load
   * @returns {Promise<void>}
   */
  async loadAdapter(adapterName) {
    if (this.loadedAdapters.has(adapterName)) {
      return; // Already loaded
    }

    // Check if adapter is already available in global scope
    if (window[adapterName]) {
      this.loadedAdapters.add(adapterName);
      return;
    }

    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(`content-scripts/platform-adapters/${adapterName}.js`);

      await new Promise((resolve, reject) => {
        script.onload = () => {
          if (window[adapterName]) {
            this.loadedAdapters.add(adapterName);
            resolve();
          } else {
            reject(new Error(`Adapter ${adapterName} not found after loading`));
          }
        };
        script.onerror = () => {
          reject(new Error(`Failed to load script for ${adapterName}`));
        };

        (document.head || document.documentElement).appendChild(script);
      });

      console.log(`IntelliPen: Loaded adapter ${adapterName}`);

    } catch (error) {
      console.error(`IntelliPen: Failed to load adapter ${adapterName}:`, error);
      throw error;
    }
  }

  /**
   * Check if an adapter is loaded
   * @param {string} adapterName - Name of the adapter to check
   * @returns {boolean}
   */
  isAdapterLoaded(adapterName) {
    return this.loadedAdapters.has(adapterName) && window[adapterName];
  }

  /**
   * Get list of loaded adapters
   * @returns {string[]}
   */
  getLoadedAdapters() {
    return Array.from(this.loadedAdapters);
  }

  /**
   * Preload adapters for better performance
   * @param {string[]} adapterNames - Array of adapter names to preload
   * @returns {Promise<{loaded: string[], failed: string[]}>}
   */
  async preloadAdapters(adapterNames) {
    const results = {
      loaded: [],
      failed: []
    };

    for (const adapterName of adapterNames) {
      try {
        await this.loadAdapter(adapterName);
        results.loaded.push(adapterName);
      } catch (error) {
        results.failed.push(adapterName);
      }
    }

    return results;
  }
}

// Make AdapterLoader available globally
window.AdapterLoader = AdapterLoader;

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdapterLoader };
}