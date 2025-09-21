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
		    this.extensionStatus = null;
		    this.apiAvailability = {};
		    this.isInitialized = false;
		  }

		  async initialize() {
		    if (this.isInitialized) return;

		    console.log('IntelliPen Popup: Initializing...');
		    
		    try {
		      // Set up event listeners
		      this.setupEventListeners();
		      
		      // Load initial data (both methods will complete even if one fails)
		      await Promise.allSettled([
		        this.loadExtensionStatus(),
		        this.loadAPIAvailability()
		      ]);
		      
		      // Update UI
		      this.updateUI();
		      
		      this.isInitialized = true;
		      console.log('IntelliPen Popup: Initialized successfully');
		      
		    } catch (error) {
		      console.error('IntelliPen Popup: Failed to initialize:', error);
		      this.showError('Failed to initialize popup');
		      
		      // Still try to update UI with default values
		      this.updateUI();
		      this.isInitialized = true;
		    }
		  }

		  setupEventListeners() {
		    // Toggle switches
		    document.getElementById('writingToggle').addEventListener('change', (e) => {
		      this.handleWritingToggle(e.target.checked);
		    });

		    document.getElementById('meetingToggle').addEventListener('change', (e) => {
		      this.handleMeetingToggle(e.target.checked);
		    });

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

		    // Auto-refresh status every 5 seconds
		    setInterval(() => {
		      this.refreshStatus();
		    }, 5000);
		  }

		  async loadExtensionStatus() {
		    try {
		      const response = await Promise.race([
		        new Promise((resolve, reject) => {
		          chrome.runtime.sendMessage({ 
		            type: 'GET_EXTENSION_STATUS' 
		          }, (response) => {
		            if (chrome.runtime.lastError) {
		              reject(new Error(chrome.runtime.lastError.message));
		            } else {
		              resolve(response);
		            }
		          });
		        }),
		        new Promise((_, reject) => 
		          setTimeout(() => reject(new Error('Timeout waiting for extension status')), 5000)
		        )
		      ]);

		      if (response?.success) {
		        this.extensionStatus = response.data;
		        console.log('Extension status loaded:', this.extensionStatus);
		      } else {
		        throw new Error('Failed to get extension status');
		      }
		    } catch (error) {
		      console.error('Failed to load extension status:', error);
		      this.extensionStatus = {
		        initialized: false,
		        apiAvailability: {},
		        activeSessions: 0,
		        meetingSessions: 0
		      };
		    }
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
		    this.updateStatusIndicator();
		    this.updateFeatureStats();
		    this.updatePrivacyStatus();
		    this.updateAPIList();
		  }

		  updateStatusIndicator() {
		    const statusDot = document.getElementById('statusDot');
		    const statusText = document.getElementById('statusText');

		    if (!this.extensionStatus) {
		      statusDot.className = 'status-dot error';
		      statusText.textContent = 'Error';
		      return;
		    }

		    if (this.extensionStatus.initialized) {
		      statusDot.className = 'status-dot';
		      statusText.textContent = 'Ready';
		    } else {
		      statusDot.className = 'status-dot loading';
		      statusText.textContent = 'Loading...';
		    }
		  }

		  updateFeatureStats() {
		    if (!this.extensionStatus) return;

		    // Update toggle states
		    const writingToggle = document.getElementById('writingToggle');
		    const meetingToggle = document.getElementById('meetingToggle');
		    
		    if (writingToggle) {
		      writingToggle.checked = this.extensionStatus.writingIntelligenceEnabled !== false;
		    }
		    
		    if (meetingToggle) {
		      meetingToggle.checked = this.extensionStatus.meetingIntelligenceEnabled !== false;
		    }

		    // Update writing intelligence stats
		    document.getElementById('activeFields').textContent = 
		      this.extensionStatus.activeSessions || 0;
		    
		    document.getElementById('suggestionCount').textContent = '0'; // Will be updated later

		    // Update meeting intelligence stats
		    document.getElementById('meetingSessions').textContent = 
		      this.extensionStatus.meetingSessions || 0;
		    
		    document.getElementById('recordingStatus').textContent = 
		      this.extensionStatus.meetingSessions > 0 ? 'Active' : 'Off';
		  }

		  updatePrivacyStatus() {
		    // Privacy indicators are static for now since all processing is local
		    document.getElementById('localProcessing').textContent = 'Active';
		    document.getElementById('localProcessing').className = 'privacy-status active';
		    
		    document.getElementById('dataEncryption').textContent = 'Enabled';
		    document.getElementById('dataEncryption').className = 'privacy-status active';
		    
		    document.getElementById('externalServers').textContent = 'None';
		    document.getElementById('externalServers').className = 'privacy-status inactive';
		  }

		  updateAPIList() {
		    const apiList = document.getElementById('apiList');
		    apiList.innerHTML = '';

		    const apis = [
		      { key: 'ai.languageModel', name: 'Prompt API' },
		      { key: 'ai.proofreader', name: 'Proofreader API' },
		      { key: 'ai.writer', name: 'Writer API' },
		      { key: 'ai.rewriter', name: 'Rewriter API' },
		      { key: 'ai.summarizer', name: 'Summarizer API' },
		      { key: 'ai.translator', name: 'Translator API' }
		    ];

		    // Add debug info
		    const debugItem = document.createElement('div');
		    debugItem.className = 'api-item debug';
		    debugItem.innerHTML = `
      <span class="api-name">Debug Info:</span>
      <span class="api-status">APIs: ${Object.keys(this.apiAvailability).length}, Status: ${this.extensionStatus?.initialized ? 'Ready' : 'Loading'}</span>
    `;
		    apiList.appendChild(debugItem);

		    apis.forEach(api => {
		      const item = document.createElement('div');
		      item.className = 'api-item';

		      const name = document.createElement('span');
		      name.className = 'api-name';
		      name.textContent = api.name;

		      const status = document.createElement('span');
		      const availability = this.apiAvailability[api.key] || 'unknown';
		      status.className = `api-status ${availability}`;
		      status.textContent = availability;

		      item.appendChild(name);
		      item.appendChild(status);
		      apiList.appendChild(item);
		    });
		  }

		  async handleWritingToggle(enabled) {
		    console.log('Writing intelligence toggled:', enabled);
		    
		    try {
		      // Send message to background script to enable/disable writing features
		      const response = await chrome.runtime.sendMessage({
		        type: 'TOGGLE_WRITING_INTELLIGENCE',
		        data: { enabled }
		      });

		      if (!response?.success) {
		        throw new Error('Failed to toggle writing intelligence');
		      }

		      // Update UI to reflect change
		      await this.refreshStatus();
		      
		    } catch (error) {
		      console.error('Failed to toggle writing intelligence:', error);
		      this.showError('Failed to toggle writing intelligence');
		      
		      // Revert toggle state
		      document.getElementById('writingToggle').checked = !enabled;
		    }
		  }

		  async handleMeetingToggle(enabled) {
		    console.log('Meeting intelligence toggled:', enabled);
		    
		    try {
		      // Send message to background script to enable/disable meeting features
		      const response = await chrome.runtime.sendMessage({
		        type: 'TOGGLE_MEETING_INTELLIGENCE',
		        data: { enabled }
		      });

		      if (!response?.success) {
		        throw new Error('Failed to toggle meeting intelligence');
		      }

		      // Update UI to reflect change
		      await this.refreshStatus();
		      
		    } catch (error) {
		      console.error('Failed to toggle meeting intelligence:', error);
		      this.showError('Failed to toggle meeting intelligence');
		      
		      // Revert toggle state
		      document.getElementById('meetingToggle').checked = !enabled;
		    }
		  }

		  async openSidePanel() {
		    try {
		      // Get current tab
		      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		      
		      if (tab?.id) {
		        // Open side panel for current tab
		        await chrome.sidePanel.open({ tabId: tab.id });
		        console.log('Side panel opened');
		      }
		    } catch (error) {
		      console.error('Failed to open side panel:', error);
		      this.showError('Failed to open meeting dashboard');
		    }
		  }

		  async openOptions() {
		    try {
		      // Open options page
		      await chrome.runtime.openOptionsPage();
		      console.log('Options page opened');
		    } catch (error) {
		      console.error('Failed to open options page:', error);
		      this.showError('Failed to open settings');
		    }
		  }

		  async refreshAPIStatus() {
		    const refreshBtn = document.getElementById('refreshApis');
		    const refreshIcon = refreshBtn.querySelector('.refresh-icon');
		    
		    // Show loading state
		    refreshIcon.style.animation = 'spin 1s linear infinite';
		    refreshBtn.disabled = true;
		    
		    try {
		      // First, try to trigger content script to check APIs
		      await this.triggerContentScriptAPICheck();
		      
		      // Then load the updated availability
		      await this.loadAPIAvailability();
		      this.updateAPIList();
		      console.log('API status refreshed');
		    } catch (error) {
		      console.error('Failed to refresh API status:', error);
		      this.showError('Failed to refresh API status');
		    } finally {
		      // Reset loading state
		      refreshIcon.style.animation = '';
		      refreshBtn.disabled = false;
		    }
		  }

		  async triggerContentScriptAPICheck() {
		    try {
		      // Send message to all tabs to trigger API check
		      const tabs = await chrome.tabs.query({});
		      for (const tab of tabs) {
		        if (tab.id && !tab.url?.startsWith('chrome://')) {
		          try {
		            await chrome.tabs.sendMessage(tab.id, { 
		              type: 'CHECK_CHROME_AI_APIS' 
		            });
		          } catch (error) {
		            // Ignore errors for tabs without content scripts
		            console.log(`No content script in tab ${tab.id}`);
		          }
		        }
		      }
		    } catch (error) {
		      console.warn('Failed to trigger content script API check:', error);
		    }
		  }

		  async refreshStatus() {
		    try {
		      await this.loadExtensionStatus();
		      this.updateUI();
		    } catch (error) {
		      console.warn('Failed to refresh status:', error);
		    }
		  }

		  showError(message) {
		    // Simple error display - could be enhanced with toast notifications
		    console.error('Popup Error:', message);
		    
		    // Update status to show error
		    const statusDot = document.getElementById('statusDot');
		    const statusText = document.getElementById('statusText');
		    
		    statusDot.className = 'status-dot error';
		    statusText.textContent = 'Error';
		    
		    // Reset after 3 seconds
		    setTimeout(() => {
		      this.updateStatusIndicator();
		    }, 3000);
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
