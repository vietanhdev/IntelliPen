var IntelliPenPopup = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var popup = {exports: {}};

	/**
	 * IntelliPen Popup Interface
	 * Provides quick access controls and status indicators
	 */

	(function (module) {
		class IntelliPenPopup {
		  constructor() {
		    this.apiAvailability = {};
		    this.isInitialized = false;
		  }

		  async initialize() {
		    if (this.isInitialized) return;

		    console.log('IntelliPen Popup: Initializing...');
		    
		    try {
		      // Set up event listeners
		      this.setupEventListeners();
		      
		      // Load API availability
		      await this.loadAPIAvailability();
		      
		      // Update UI
		      this.updateUI();
		      
		      this.isInitialized = true;
		      console.log('IntelliPen Popup: Initialized successfully');
		      
		    } catch (error) {
		      console.error('IntelliPen Popup: Failed to initialize:', error);
		      this.updateUI();
		      this.isInitialized = true;
		    }
		  }

		  setupEventListeners() {
		    // Action buttons
		    document.getElementById('openSidePanel').addEventListener('click', () => {
		      this.openSidePanel();
		    });

		    document.getElementById('openOptions').addEventListener('click', () => {
		      this.openOptions();
		    });

		    document.getElementById('refreshApis').addEventListener('click', () => {
		      this.refreshAPIStatus();
		    });
		  }



		  async loadAPIAvailability() {
		    try {
		      const response = await Promise.race([
		        new Promise((resolve, reject) => {
		          chrome.runtime.sendMessage({ 
		            type: 'GET_API_AVAILABILITY' 
		          }, (response) => {
		            if (chrome.runtime.lastError) {
		              reject(new Error(chrome.runtime.lastError.message));
		            } else {
		              resolve(response);
		            }
		          });
		        }),
		        new Promise((_, reject) => 
		          setTimeout(() => reject(new Error('Timeout waiting for API availability')), 5000)
		        )
		      ]);

		      if (response?.success) {
		        this.apiAvailability = response.data;
		        console.log('API availability loaded:', this.apiAvailability);
		      } else {
		        throw new Error('Failed to get API availability');
		      }
		    } catch (error) {
		      console.error('Failed to load API availability:', error);
		      this.apiAvailability = {};
		    }
		  }

		  updateUI() {
		    this.updateAPIList();
		  }

		  updateAPIList() {
		    const apiList = document.getElementById('apiList');
		    apiList.innerHTML = '';

		    const apis = [
		      { key: 'ai.languageModel', name: 'Prompt API' },
		      { key: 'ai.proofreader', name: 'Proofreader' },
		      { key: 'ai.writer', name: 'Writer' },
		      { key: 'ai.rewriter', name: 'Rewriter' },
		      { key: 'ai.summarizer', name: 'Summarizer' }
		    ];

		    apis.forEach(api => {
		      const item = document.createElement('div');
		      item.className = 'api-item';

		      const name = document.createElement('span');
		      name.className = 'api-name';
		      name.textContent = api.name;

		      const status = document.createElement('span');
		      const availability = this.apiAvailability[api.key] || 'checking';
		      status.className = `api-status ${availability}`;
		      status.textContent = availability;

		      item.appendChild(name);
		      item.appendChild(status);
		      apiList.appendChild(item);
		    });
		  }

		  async openSidePanel() {
		    try {
		      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		      
		      if (tab?.id) {
		        await chrome.sidePanel.open({ tabId: tab.id });
		        console.log('Side panel opened');
		      }
		    } catch (error) {
		      console.error('Failed to open side panel:', error);
		    }
		  }

		  async openOptions() {
		    try {
		      await chrome.runtime.openOptionsPage();
		      console.log('Options page opened');
		    } catch (error) {
		      console.error('Failed to open options page:', error);
		    }
		  }

		  async refreshAPIStatus() {
		    const refreshBtn = document.getElementById('refreshApis');
		    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
		    
		    refreshIcon.style.animation = 'spin 1s linear infinite';
		    refreshBtn.disabled = true;
		    
		    try {
		      await this.loadAPIAvailability();
		      this.updateAPIList();
		      console.log('API status refreshed');
		    } catch (error) {
		      console.error('Failed to refresh API status:', error);
		    } finally {
		      refreshIcon.style.animation = '';
		      refreshBtn.disabled = false;
		    }
		  }
		}

		// Add CSS animation for refresh button
		const style = document.createElement('style');
		style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
		document.head.appendChild(style);

		// Initialize popup when DOM is ready
		document.addEventListener('DOMContentLoaded', () => {
		  const popup = new IntelliPenPopup();
		  popup.initialize();
		});

		// Export for testing
		if (module.exports) {
		  module.exports = { IntelliPenPopup };
		} 
	} (popup));

	var popupExports = popup.exports;
	var index = /*@__PURE__*/getDefaultExportFromCjs(popupExports);

	return index;

})();
