/**
 * IntelliPen Background Service Worker
 * Handles extension lifecycle, API coordination, and cross-tab synchronization
 */

class IntelliPenExtension {
  constructor() {
    this.isInitialized = false;
    this.activeSessions = new Map();
    this.meetingSessions = new Map();
    this.apiAvailability = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('IntelliPen: Initializing extension...');

    try {
      // Check Chrome AI API availability
      await this.checkAPIAvailability();

      // Set up extension event listeners
      this.setupEventListeners();

      // Initialize privacy manager
      await this.initializePrivacyManager();

      this.isInitialized = true;
      console.log('IntelliPen: Extension initialized successfully');

      // Notify all tabs that extension is ready
      this.broadcastToTabs({ type: 'EXTENSION_READY' });

    } catch (error) {
      console.error('IntelliPen: Failed to initialize extension:', error);
      this.handleInitializationError(error);
    }
  }

  async checkAPIAvailability() {
    console.log('IntelliPen: Checking Chrome AI API availability...');

    // Note: Chrome AI APIs are accessed via window.ai in content scripts, not chrome.ai in background
    // We'll check availability when content scripts request it
    const apis = [
      'ai.languageModel',
      'ai.summarizer',
      'ai.writer',
      'ai.rewriter',
      'ai.proofreader',
      'ai.translator'
    ];

    // Initialize all as unknown - will be updated by content scripts
    for (const apiPath of apis) {
      this.apiAvailability.set(apiPath, 'unknown');
    }

    console.log('IntelliPen: API availability will be checked by content scripts');
  }

  getNestedProperty(obj, path) {
    return path.reduce((current, key) => current && current[key], obj);
  }

  setupEventListeners() {
    // Handle extension installation and updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle messages from content scripts and UI components
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });

    // Handle tab updates for content script injection
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    // Handle context menu clicks
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });

    // Handle extension icon click - open sidebar or new tab
    chrome.action.onClicked.addListener((tab) => {
      this.handleActionClick(tab);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      console.log('IntelliPen: Extension startup detected');
      this.initialize();
    });
  }

  async initializePrivacyManager() {
    // Initialize encryption keys and privacy settings
    const privacySettings = await chrome.storage.local.get(['privacyInitialized']);

    if (!privacySettings.privacyInitialized) {
      await chrome.storage.local.set({
        privacyInitialized: true,
        encryptionEnabled: true,
        localProcessingOnly: true,
        dataRetentionDays: 30,
        createdAt: Date.now()
      });
      console.log('IntelliPen: Privacy settings initialized');
    }
  }

  handleInstallation(details) {
    console.log('IntelliPen: Extension installed/updated:', details.reason);

    // Create context menus
    this.createContextMenus();

    if (details.reason === 'install') {
      // First-time installation
      this.showWelcomeMessage();
    } else if (details.reason === 'update') {
      // Extension update
      this.handleExtensionUpdate(details.previousVersion);
    }
  }

  createContextMenus() {
    // Remove existing menus first
    chrome.contextMenus.removeAll(() => {
      // Primary actions - Edit and Translate
      chrome.contextMenus.create({
        id: 'intellipen-edit',
        title: '✏️ Edit with IntelliPen',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'intellipen-translate',
        title: '🌐 Translate with IntelliPen',
        contexts: ['selection']
      });

      // Separator
      chrome.contextMenus.create({
        id: 'intellipen-separator1',
        type: 'separator',
        contexts: ['selection', 'editable']
      });

      // Quick actions submenu
      chrome.contextMenus.create({
        id: 'intellipen-check-grammar',
        title: '🖋️ Check Grammar & Style',
        contexts: ['selection', 'editable']
      });

      chrome.contextMenus.create({
        id: 'intellipen-improve-writing',
        title: '✨ Improve Writing',
        contexts: ['selection', 'editable']
      });

      chrome.contextMenus.create({
        id: 'intellipen-summarize',
        title: '📄 Summarize Text',
        contexts: ['selection']
      });

      // Separator
      chrome.contextMenus.create({
        id: 'intellipen-separator2',
        type: 'separator',
        contexts: ['selection', 'editable']
      });

      // Tone options
      chrome.contextMenus.create({
        id: 'intellipen-tone-formal',
        title: '📝 Make More Formal',
        contexts: ['selection', 'editable']
      });

      chrome.contextMenus.create({
        id: 'intellipen-tone-casual',
        title: '� Make Mrore Casual',
        contexts: ['selection', 'editable']
      });

      chrome.contextMenus.create({
        id: 'intellipen-tone-professional',
        title: '💼 Make Professional',
        contexts: ['selection', 'editable']
      });

      // Separator
      chrome.contextMenus.create({
        id: 'intellipen-separator3',
        type: 'separator',
        contexts: ['selection', 'editable']
      });

      // Settings
      chrome.contextMenus.create({
        id: 'intellipen-show-overlay',
        title: '👁️ Show Writing Overlay',
        contexts: ['editable']
      });

      console.log('IntelliPen: Context menus created');
    });
  }

  async handleContextMenuClick(info, tab) {
    console.log('IntelliPen: Context menu clicked:', info.menuItemId);

    try {
      switch (info.menuItemId) {
        case 'intellipen-edit':
          await this.handleEditWithIntelliPen(info, tab);
          break;

        case 'intellipen-translate':
          await this.handleTranslateWithIntelliPen(info, tab);
          break;

        case 'intellipen-check-grammar':
          await this.handleGrammarCheck(info, tab);
          break;

        case 'intellipen-improve-writing':
          await this.handleImproveWriting(info, tab);
          break;

        case 'intellipen-tone-formal':
          await this.handleRewriteTone(info, tab, 'formal');
          break;

        case 'intellipen-tone-casual':
          await this.handleRewriteTone(info, tab, 'casual');
          break;

        case 'intellipen-tone-professional':
          await this.handleRewriteTone(info, tab, 'professional');
          break;

        case 'intellipen-summarize':
          await this.handleSummarize(info, tab);
          break;

        case 'intellipen-show-overlay':
          await this.handleShowOverlay(info, tab);
          break;

        default:
          console.warn('IntelliPen: Unknown context menu item:', info.menuItemId);
      }
    } catch (error) {
      console.error('IntelliPen: Error handling context menu click:', error);
      this.showErrorNotification('Failed to process request');
    }
  }

  async handleGrammarCheck(info, tab) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to check');
      return;
    }

    // Send message to content script to show grammar suggestions
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_GRAMMAR_OVERLAY',
      data: {
        text: selectedText,
        action: 'grammar-check',
        position: { x: info.pageX || 100, y: info.pageY || 100 }
      }
    });
  }

  async handleImproveWriting(info, tab) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to improve');
      return;
    }

    // Send message to content script to show writing suggestions
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_WRITING_SUGGESTIONS',
      data: {
        text: selectedText,
        action: 'improve-writing',
        position: { x: info.pageX || 100, y: info.pageY || 100 }
      }
    });
  }

  async handleRewriteTone(info, tab, tone) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to rewrite');
      return;
    }

    // Send message to content script to rewrite with specific tone
    await chrome.tabs.sendMessage(tab.id, {
      type: 'REWRITE_WITH_TONE',
      data: {
        text: selectedText,
        tone: tone,
        position: { x: info.pageX || 100, y: info.pageY || 100 }
      }
    });
  }

  async handleSummarize(info, tab) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to summarize');
      return;
    }

    // Send message to content script to show summary
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_SUMMARY',
      data: {
        text: selectedText,
        position: { x: info.pageX || 100, y: info.pageY || 100 }
      }
    });
  }

  async handleEditWithIntelliPen(info, tab) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to edit');
      return;
    }

    try {
      // Open sidebar
      await chrome.sidePanel.open({ tabId: tab.id });

      // Wait a moment for sidebar to load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Send selected text to sidebar editor
      await chrome.runtime.sendMessage({
        type: 'LOAD_TEXT_IN_EDITOR',
        data: {
          text: selectedText,
          tabId: tab.id
        }
      });

      console.log('IntelliPen: Text loaded in editor');
    } catch (error) {
      console.error('IntelliPen: Failed to open editor:', error);
      this.showErrorNotification('Failed to open editor');
    }
  }

  async handleTranslateWithIntelliPen(info, tab) {
    const selectedText = info.selectionText || '';

    if (!selectedText.trim()) {
      this.showErrorNotification('Please select some text to translate');
      return;
    }

    try {
      // Open sidebar
      await chrome.sidePanel.open({ tabId: tab.id });

      // Wait a moment for sidebar to load
      await new Promise(resolve => setTimeout(resolve, 300));

      // Send selected text to sidebar translator
      await chrome.runtime.sendMessage({
        type: 'LOAD_TEXT_IN_TRANSLATOR',
        data: {
          text: selectedText,
          tabId: tab.id
        }
      });

      console.log('IntelliPen: Text loaded in translator');
    } catch (error) {
      console.error('IntelliPen: Failed to open translator:', error);
      this.showErrorNotification('Failed to open translator');
    }
  }

  async handleShowOverlay(_info, tab) {
    // Send message to content script to show overlay for current element
    await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_WRITING_OVERLAY',
      data: {
        action: 'show-overlay'
      }
    });
  }

  async handleActionClick(tab) {
    console.log('IntelliPen: Extension icon clicked');

    try {
      if (chrome.sidePanel && tab?.id) {
        // Check if sidebar is open by trying to send a message to it
        try {
          const response = await chrome.runtime.sendMessage({
            type: 'PING_SIDEPANEL',
            tabId: tab.id
          });

          if (response?.sidePanelOpen) {
            // Sidebar is open, tell it to close itself
            await chrome.runtime.sendMessage({
              type: 'CLOSE_SIDEPANEL',
              tabId: tab.id
            });
            console.log('IntelliPen: Sidebar close requested');
          } else {
            // Sidebar not responding, open it
            await chrome.sidePanel.open({ tabId: tab.id });
            console.log('IntelliPen: Sidebar opened');
          }
        } catch (error) {
          // No response means sidebar is closed, so open it
          await chrome.sidePanel.open({ tabId: tab.id });
          console.log('IntelliPen: Sidebar opened');
        }
      } else {
        // Fallback: open as new tab if sidebar not supported
        await chrome.tabs.create({
          url: chrome.runtime.getURL('sidepanel/index.html')
        });
        console.log('IntelliPen: Opened as new tab (sidebar not supported)');
      }
    } catch (error) {
      console.error('IntelliPen: Failed to handle sidebar, trying new tab:', error);

      // Fallback: open as new tab
      try {
        await chrome.tabs.create({
          url: chrome.runtime.getURL('sidepanel/index.html')
        });
        console.log('IntelliPen: Opened as new tab (fallback)');
      } catch (fallbackError) {
        console.error('IntelliPen: Failed to open as new tab:', fallbackError);
        this.showErrorNotification('Failed to open IntelliPen');
      }
    }
  }

  showErrorNotification(message) {
    // Create a simple notification (could be enhanced with chrome.notifications API)
    console.error('IntelliPen Error:', message);

    // For now, just log the error. In a full implementation, 
    // you might want to show a toast notification or badge
  }

  async handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'GET_API_AVAILABILITY':
          sendResponse({
            success: true,
            data: Object.fromEntries(this.apiAvailability)
          });
          break;

        case 'INITIALIZE_WRITING_SESSION':
          const writingSession = await this.initializeWritingSession(message.data);
          sendResponse({ success: true, data: writingSession });
          break;

        case 'INITIALIZE_MEETING_SESSION':
          const meetingSession = await this.initializeMeetingSession(message.data);
          sendResponse({ success: true, data: meetingSession });
          break;

        case 'PROCESS_AUDIO':
          const audioResult = await this.processAudio(message.data);
          sendResponse({ success: true, data: audioResult });
          break;

        case 'GENERATE_SUMMARY':
          const summary = await this.generateSummary(message.data);
          sendResponse({ success: true, data: summary });
          break;

        case 'GET_EXTENSION_STATUS':
          sendResponse({
            success: true,
            data: {
              initialized: this.isInitialized,
              apiAvailability: Object.fromEntries(this.apiAvailability),
              activeSessions: this.activeSessions.size,
              meetingSessions: this.meetingSessions.size,
              writingIntelligenceEnabled: await this.getWritingIntelligenceStatus(),
              meetingIntelligenceEnabled: await this.getMeetingIntelligenceStatus()
            }
          });
          break;

        case 'TOGGLE_WRITING_INTELLIGENCE':
          const writingResult = await this.toggleWritingIntelligence(message.data.enabled);
          sendResponse({ success: true, data: writingResult });
          break;

        case 'TOGGLE_MEETING_INTELLIGENCE':
          const meetingResult = await this.toggleMeetingIntelligence(message.data.enabled);
          sendResponse({ success: true, data: meetingResult });
          break;

        case 'UPDATE_API_AVAILABILITY':
          // Update API availability from content scripts
          if (message.data && typeof message.data === 'object') {
            for (const [apiPath, availability] of Object.entries(message.data)) {
              this.apiAvailability.set(apiPath, availability);
            }
            console.log('IntelliPen: API availability updated from content script');
          }
          sendResponse({ success: true });
          break;

        case 'GET_CURRENT_TAB_ID':
          // Return the current tab ID
          sendResponse({
            success: true,
            tabId: sender.tab ? sender.tab.id : null
          });
          break;

        case 'SWITCH_SIDEPANEL_SCREEN':
          // Forward message to sidepanel
          this.forwardToSidePanel(message);
          sendResponse({ success: true });
          break;

        default:
          console.warn('IntelliPen: Unknown message type:', message.type);
          sendResponse({ success: false, error: 'Unknown message type' });
      }
    } catch (error) {
      console.error('IntelliPen: Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  handleTabUpdate(tabId, changeInfo, tab) {
    // Inject content scripts when tab is ready
    if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
      this.injectContentScripts(tabId);
    }
  }

  async injectContentScripts(tabId) {
    try {
      // Check if content script is already injected
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => window.intelliPenInjected === true
      });

      if (!results[0]?.result) {
        // Inject content scripts
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content-scripts/universal-integration.js']
        });

        console.log(`IntelliPen: Content scripts injected into tab ${tabId}`);
      }
    } catch (error) {
      console.warn(`IntelliPen: Failed to inject content scripts into tab ${tabId}:`, error);
    }
  }

  async initializeWritingSession(data) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      type: 'writing',
      tabId: data.tabId,
      platform: data.platform,
      context: data.context,
      createdAt: Date.now(),
      active: true
    };

    this.activeSessions.set(sessionId, session);
    console.log(`IntelliPen: Writing session ${sessionId} initialized`);

    return session;
  }

  async initializeMeetingSession(data) {
    const sessionId = this.generateSessionId();
    const session = {
      id: sessionId,
      type: 'meeting',
      tabId: data.tabId,
      createdAt: Date.now(),
      transcript: [],
      speakers: new Map(),
      active: true
    };

    this.meetingSessions.set(sessionId, session);
    console.log(`IntelliPen: Meeting session ${sessionId} initialized`);

    return session;
  }

  async processAudio(data) {
    // Placeholder for audio processing logic
    // This will be implemented in later tasks
    console.log('IntelliPen: Audio processing requested');
    return { processed: true, transcript: 'Audio processing not yet implemented' };
  }

  async generateSummary(data) {
    // Placeholder for summary generation logic
    // This will be implemented in later tasks
    console.log('IntelliPen: Summary generation requested');
    return { summary: 'Summary generation not yet implemented' };
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getWritingIntelligenceStatus() {
    try {
      const settings = await chrome.storage.local.get(['writingIntelligenceEnabled']);
      return settings.writingIntelligenceEnabled !== false; // Default to true
    } catch (error) {
      console.warn('IntelliPen: Failed to get writing intelligence status:', error);
      return true; // Default to enabled
    }
  }

  async getMeetingIntelligenceStatus() {
    try {
      const settings = await chrome.storage.local.get(['meetingIntelligenceEnabled']);
      return settings.meetingIntelligenceEnabled !== false; // Default to true
    } catch (error) {
      console.warn('IntelliPen: Failed to get meeting intelligence status:', error);
      return true; // Default to enabled
    }
  }

  async toggleWritingIntelligence(enabled) {
    try {
      console.log(`IntelliPen: Toggling writing intelligence to ${enabled}`);

      // Save setting to storage
      await chrome.storage.local.set({ writingIntelligenceEnabled: enabled });

      // Broadcast to all content scripts
      await this.broadcastToTabs({
        type: 'WRITING_INTELLIGENCE_TOGGLED',
        data: { enabled }
      });

      // If disabling, clean up active writing sessions
      if (!enabled) {
        for (const [sessionId, session] of this.activeSessions) {
          if (session.type === 'writing') {
            session.active = false;
            console.log(`IntelliPen: Deactivated writing session ${sessionId}`);
          }
        }
      }

      return { enabled, message: `Writing intelligence ${enabled ? 'enabled' : 'disabled'}` };

    } catch (error) {
      console.error('IntelliPen: Failed to toggle writing intelligence:', error);
      throw new Error('Failed to toggle writing intelligence');
    }
  }

  async toggleMeetingIntelligence(enabled) {
    try {
      console.log(`IntelliPen: Toggling meeting intelligence to ${enabled}`);

      // Save setting to storage
      await chrome.storage.local.set({ meetingIntelligenceEnabled: enabled });

      // Broadcast to all content scripts
      await this.broadcastToTabs({
        type: 'MEETING_INTELLIGENCE_TOGGLED',
        data: { enabled }
      });

      // If disabling, clean up active meeting sessions
      if (!enabled) {
        for (const [sessionId, session] of this.meetingSessions) {
          session.active = false;
          console.log(`IntelliPen: Deactivated meeting session ${sessionId}`);
        }
      }

      return { enabled, message: `Meeting intelligence ${enabled ? 'enabled' : 'disabled'}` };

    } catch (error) {
      console.error('IntelliPen: Failed to toggle meeting intelligence:', error);
      throw new Error('Failed to toggle meeting intelligence');
    }
  }

  async broadcastToTabs(message) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id && !tab.url?.startsWith('chrome://')) {
          chrome.tabs.sendMessage(tab.id, message).catch(() => {
            // Ignore errors for tabs that don't have content scripts
          });
        }
      }
    } catch (error) {
      console.warn('IntelliPen: Failed to broadcast to tabs:', error);
    }
  }

  async forwardToSidePanel(message) {
    try {
      // Get all tabs and try to send message to sidepanel
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        if (tab.id) {
          try {
            await chrome.runtime.sendMessage(message);
            break; // Message sent successfully
          } catch (error) {
            // Continue to next tab
          }
        }
      }
    } catch (error) {
      console.warn('IntelliPen: Failed to forward to sidepanel:', error);
    }
  }

  showWelcomeMessage() {
    console.log('IntelliPen: Welcome! Extension installed successfully.');
    // Could show notification or open welcome page
  }

  handleExtensionUpdate(previousVersion) {
    console.log(`IntelliPen: Updated from version ${previousVersion}`);
    // Handle any migration logic if needed
  }

  handleInitializationError(error) {
    console.error('IntelliPen: Initialization failed:', error);
    // Set extension to degraded mode
    this.isInitialized = false;
  }
}

// Initialize the extension
const intelliPenExtension = new IntelliPenExtension();

// Start initialization when service worker loads
intelliPenExtension.initialize();

// Export for testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntelliPenExtension };
}