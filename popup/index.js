/**
 * IntelliPen Popup Interface
 * Provides quick access controls and status indicators
 */

import { createIcon, icons } from '../src/icons/icon-library.js';

class IntelliPenPopup {
  constructor() {
    this.apiAvailability = {};
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('IntelliPen Popup: Initializing...');
    
    try {
      // Initialize icons
      this.initializeIcons();
      
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

  initializeIcons() {
    // Logo icon
    const logoIcon = document.getElementById('logoIcon');
    logoIcon.appendChild(createIcon('pen', { size: 24, className: 'intellipen-icon-gradient' }));

    // Refresh icon
    const refreshIcon = document.getElementById('refreshIcon');
    refreshIcon.appendChild(createIcon('download', { size: 16 }));

    // Side panel icon
    const sidePanelIcon = document.getElementById('sidePanelIcon');
    sidePanelIcon.appendChild(createIcon('pen', { size: 18 }));

    // Settings icon
    const settingsIcon = document.getElementById('settingsIcon');
    settingsIcon.appendChild(createIcon('settings', { size: 18 }));
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
      { key: 'ai.languageModel', name: 'Prompt API', icon: 'sparkle' },
      { key: 'ai.proofreader', name: 'Proofreader', icon: 'grammar' },
      { key: 'ai.writer', name: 'Writer', icon: 'pen' },
      { key: 'ai.rewriter', name: 'Rewriter', icon: 'rewrite' },
      { key: 'ai.summarizer', name: 'Summarizer', icon: 'summarize' }
    ];

    apis.forEach(api => {
      const item = document.createElement('div');
      item.className = 'api-item';

      const nameWrapper = document.createElement('div');
      nameWrapper.style.display = 'flex';
      nameWrapper.style.alignItems = 'center';
      nameWrapper.style.gap = '8px';

      const iconEl = createIcon(api.icon, { size: 16, className: 'intellipen-icon-muted' });
      nameWrapper.appendChild(iconEl);

      const name = document.createElement('span');
      name.className = 'api-name';
      name.textContent = api.name;
      nameWrapper.appendChild(name);

      const availability = this.apiAvailability[api.key] || 'checking';
      const statusWrapper = document.createElement('div');
      statusWrapper.style.display = 'flex';
      statusWrapper.style.alignItems = 'center';
      statusWrapper.style.gap = '6px';

      const statusIcon = createIcon(
        availability === 'available' ? 'check' : 
        availability === 'checking' ? 'download' : 'warning',
        { 
          size: 14, 
          className: availability === 'available' ? 'intellipen-icon-success' : 
                     availability === 'checking' ? 'intellipen-icon-muted intellipen-icon-pulse' : 
                     'intellipen-icon-warning'
        }
      );
      statusWrapper.appendChild(statusIcon);

      const status = document.createElement('span');
      status.className = `api-status ${availability}`;
      status.textContent = availability;
      statusWrapper.appendChild(status);

      item.appendChild(nameWrapper);
      item.appendChild(statusWrapper);
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
    const refreshIcon = refreshBtn.querySelector('.intellipen-icon');
    
    refreshIcon.classList.add('intellipen-icon-spin');
    refreshBtn.disabled = true;
    
    try {
      await this.loadAPIAvailability();
      this.updateAPIList();
      console.log('API status refreshed');
    } catch (error) {
      console.error('Failed to refresh API status:', error);
    } finally {
      refreshIcon.classList.remove('intellipen-icon-spin');
      refreshBtn.disabled = false;
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const popup = new IntelliPenPopup();
  popup.initialize();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntelliPenPopup };
}