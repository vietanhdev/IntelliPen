var IntelliPenSidepanel = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var sidepanel = {exports: {}};

	/**
	 * IntelliPen Sidepanel Interface
	 * Dual-screen interface: Editor and Meeting Dashboard
	 */

	(function (module) {
		class IntelliPenSidepanel {
		  constructor() {
		    // Current screen
		    this.currentScreen = 'editor';

		    // Editor state
		    this.editorContent = '';
		    this.editorHistory = [];
		    this.editorHistoryIndex = -1;
		    this.wordCount = 0;
		    this.charCount = 0;

		    // Translator state
		    this.sourceLanguage = 'auto';
		    this.targetLanguage = 'es';
		    this.currentTranslation = '';
		    this.detectedLanguage = '';
		    this.isSpeaking = false;
		    this.speechSynthesis = window.speechSynthesis;

		    // Meeting state
		    this.isRecording = false;
		    this.currentSession = null;
		    this.transcript = [];
		    this.recordingStartTime = null;
		    this.durationInterval = null;
		    this.mediaStream = null;
		    this.mediaRecorder = null;
		    this.speechRecognition = null;
		    this.audioContext = null;
		    this.analyser = null;
		    this.micTestStream = null;
		    this.micTestInterval = null;
		    
		    // Selected devices
		    this.selectedMicrophone = null;
		    this.selectedSpeaker = null;
		    this.recognitionLanguage = 'en-US'; // Default language

		    // AI Features
		    this.aiManager = null;
		    this.editorAI = null;
		    this.meetingAI = null;

		    this.isInitialized = false;
		  }

		  async initialize() {
		    if (this.isInitialized) return;

		    console.log('IntelliPen Sidepanel: Initializing...');

		    try {
		      // Initialize AI Manager
		      await this.initializeAI();

		      // Set up event listeners
		      this.setupEventListeners();

		      // Load any existing session
		      await this.loadExistingSession();

		      // Initialize editor
		      this.initializeEditor();

		      // Update UI
		      this.updateUI();

		      this.isInitialized = true;
		      console.log('IntelliPen Sidepanel: Initialized successfully');

		    } catch (error) {
		      console.error('IntelliPen Sidepanel: Failed to initialize:', error);
		      this.showError('Failed to initialize IntelliPen');
		    }
		  }

		  async initializeAI() {
		    try {
		      // Check if AI modules are loaded
		      if (typeof aiAPIManager === 'undefined') {
		        console.warn('AI API Manager not loaded, AI features will be limited');
		        return;
		      }

		      this.aiManager = aiAPIManager;
		      await this.aiManager.initialize();

		      // Initialize AI feature modules
		      if (typeof EditorAIFeatures !== 'undefined') {
		        this.editorAI = new EditorAIFeatures(this.aiManager);
		        console.log('Editor AI features initialized');
		      }

		      if (typeof MeetingAIFeatures !== 'undefined') {
		        this.meetingAI = new MeetingAIFeatures(this.aiManager);
		        console.log('Meeting AI features initialized');
		      }

		      console.log('AI features initialized successfully');
		    } catch (error) {
		      console.error('Failed to initialize AI features:', error);
		      // Continue without AI features
		    }
		  }

		  setupEventListeners() {
		    // Navigation tabs
		    document.querySelectorAll('.nav-tab').forEach(tab => {
		      tab.addEventListener('click', (e) => {
		        const screen = e.currentTarget.dataset.screen;
		        this.switchScreen(screen);
		      });
		    });

		    // Editor toolbar buttons
		    document.getElementById('newDocBtn')?.addEventListener('click', () => this.newDocument());
		    document.getElementById('openDocBtn')?.addEventListener('click', () => this.openDocument());
		    document.getElementById('saveDocBtn')?.addEventListener('click', () => this.saveDocument());
		    document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
		    document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
		    document.getElementById('checkGrammarBtn')?.addEventListener('click', () => this.checkGrammar());
		    document.getElementById('improveWritingBtn')?.addEventListener('click', () => this.improveWriting());
		    document.getElementById('changeToneBtn')?.addEventListener('click', () => this.changeTone());

		    // Editor content
		    const editorArea = document.getElementById('editorArea');
		    if (editorArea) {
		      editorArea.addEventListener('input', () => this.handleEditorInput());
		      editorArea.addEventListener('paste', (e) => this.handlePaste(e));
		    }

		    // Suggestions panel
		    document.getElementById('closeSuggestionsBtn')?.addEventListener('click', () => {
		      this.hideSuggestionsPanel();
		    });

		    // Translator controls
		    document.getElementById('sourceLanguage')?.addEventListener('change', (e) => {
		      this.sourceLanguage = e.target.value;
		    });

		    document.getElementById('targetLanguage')?.addEventListener('change', (e) => {
		      this.targetLanguage = e.target.value;
		    });

		    document.getElementById('swapLanguages')?.addEventListener('click', () => {
		      this.swapLanguages();
		    });

		    document.getElementById('sourceText')?.addEventListener('input', (e) => {
		      this.updateSourceCharCount();
		      this.autoTranslate();
		    });

		    document.getElementById('translateBtn')?.addEventListener('click', () => {
		      this.translateText();
		    });

		    document.getElementById('clearSource')?.addEventListener('click', () => {
		      this.clearSourceText();
		    });

		    document.getElementById('speakSource')?.addEventListener('click', () => {
		      this.speakText('source');
		    });

		    document.getElementById('speakTarget')?.addEventListener('click', () => {
		      this.speakText('target');
		    });

		    document.getElementById('copyTranslation')?.addEventListener('click', () => {
		      this.copyTranslation();
		    });

		    document.getElementById('saveTranslation')?.addEventListener('click', () => {
		      this.saveTranslation();
		    });
		    // Meeting controls
		    document.getElementById('recordBtn')?.addEventListener('click', () => {
		      this.toggleRecording();
		    });

		    // Device selection
		    document.getElementById('microphoneSelect')?.addEventListener('change', (e) => {
		      this.selectedMicrophone = e.target.value;
		      console.log('Selected microphone:', this.selectedMicrophone);
		    });

		    document.getElementById('speakerSelect')?.addEventListener('change', (e) => {
		      this.selectedSpeaker = e.target.value;
		      console.log('Selected speaker:', this.selectedSpeaker);
		    });

		    document.getElementById('testMicBtn')?.addEventListener('click', () => {
		      this.testMicrophone();
		    });

		    document.getElementById('testSpeakerBtn')?.addEventListener('click', () => {
		      this.testSpeaker();
		    });

		    // Language selection
		    document.getElementById('recognitionLanguage')?.addEventListener('change', (e) => {
		      this.recognitionLanguage = e.target.value;
		      console.log('Selected recognition language:', this.recognitionLanguage);
		      
		      // If recording, restart with new language
		      if (this.isRecording && this.speechRecognition) {
		        this.showInfo(`Switching to ${this.getLanguageName(this.recognitionLanguage)}...`);
		        this.restartSpeechRecognition();
		      }
		    });

		    // Transcript controls
		    document.getElementById('clearTranscript')?.addEventListener('click', () => {
		      this.clearTranscript();
		    });

		    document.getElementById('exportTranscript')?.addEventListener('click', () => {
		      this.exportTranscript();
		    });

		    // Analysis controls
		    document.getElementById('regenerateAnalysis')?.addEventListener('click', () => {
		      this.regenerateAnalysis();
		    });

		    document.getElementById('exportAnalysis')?.addEventListener('click', () => {
		      this.exportAnalysis();
		    });

		    // Email actions
		    document.getElementById('copyEmail')?.addEventListener('click', () => {
		      this.copyEmailDraft();
		    });

		    document.getElementById('editEmail')?.addEventListener('click', () => {
		      this.editEmailDraft();
		    });

		    // Minimize button
		    document.getElementById('minimizeBtn')?.addEventListener('click', () => {
		      this.minimizePanel();
		    });

		    // Permission banner buttons
		    document.getElementById('requestPermissionBtn')?.addEventListener('click', () => {
		      this.requestMicrophonePermission();
		    });

		    document.getElementById('dismissBannerBtn')?.addEventListener('click', () => {
		      this.hidePermissionBanner();
		    });

		    // Listen for messages from background script
		    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		      this.handleMessage(message, sender, sendResponse);
		      return true;
		    });
		  }

		  switchScreen(screenName) {
		    console.log(`Switching to ${screenName} screen`);

		    // Update current screen
		    this.currentScreen = screenName;

		    // Update navigation tabs
		    document.querySelectorAll('.nav-tab').forEach(tab => {
		      if (tab.dataset.screen === screenName) {
		        tab.classList.add('active');
		      } else {
		        tab.classList.remove('active');
		      }
		    });

		    // Show/hide screens
		    document.getElementById('editorScreen').style.display =
		      screenName === 'editor' ? 'flex' : 'none';
		    document.getElementById('translatorScreen').style.display =
		      screenName === 'translator' ? 'flex' : 'none';
		    document.getElementById('meetingScreen').style.display =
		      screenName === 'meeting' ? 'flex' : 'none';

		    // Check microphone permissions and enumerate devices when switching to meeting screen
		    if (screenName === 'meeting') {
		      this.checkMicrophonePermissions();
		      this.enumerateAudioDevices();
		    }

		    // Initialize translator when switching to translator screen
		    if (screenName === 'translator') {
		      this.initializeTranslator();
		    }
		  }

		  async checkMicrophonePermissions() {
		    try {
		      // Check if microphone permission is available
		      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });

		      console.log('Microphone permission status:', permissionStatus.state);

		      // Listen for permission changes
		      permissionStatus.onchange = () => {
		        console.log('Microphone permission changed to:', permissionStatus.state);
		        this.updatePermissionBanner(permissionStatus.state);
		      };

		      // Update banner based on permission state
		      this.updatePermissionBanner(permissionStatus.state);

		    } catch (error) {
		      console.warn('Could not check microphone permissions:', error);
		    }
		  }

		  updatePermissionBanner(permissionState) {
		    const banner = document.getElementById('permissionBanner');
		    if (!banner) return;

		    const message = banner.querySelector('.permission-banner-message');
		    const title = banner.querySelector('.permission-banner-title');
		    const requestBtn = document.getElementById('requestPermissionBtn');

		    if (permissionState === 'denied') {
		      banner.classList.remove('hidden');
		      title.textContent = 'Microphone Access Blocked';
		      message.innerHTML = 'To enable microphone access:<br>1. Click the <strong>camera icon</strong> in your browser\'s address bar<br>2. Select "Allow" for microphone<br>3. Refresh this page';

		      // Hide the "Grant Access" button since permission is denied
		      if (requestBtn) requestBtn.style.display = 'none';
		    } else if (permissionState === 'prompt') {
		      banner.classList.remove('hidden');
		      title.textContent = 'Microphone Access Required';
		      message.textContent = 'IntelliPen needs microphone access to record meetings. All processing happens locally.';

		      // Show the "Grant Access" button
		      if (requestBtn) requestBtn.style.display = 'block';
		    } else if (permissionState === 'granted') {
		      banner.classList.add('hidden');
		    }
		  }

		  hidePermissionBanner() {
		    const banner = document.getElementById('permissionBanner');
		    if (banner) {
		      banner.classList.add('hidden');
		    }
		  }

		  async requestMicrophonePermission() {
		    try {
		      // Request microphone access
		      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

		      // Permission granted - stop the stream immediately
		      stream.getTracks().forEach(track => track.stop());

		      this.showSuccess('Microphone access granted! You can now start recording.');
		      this.hidePermissionBanner();

		      // Re-check permissions to update UI
		      await this.checkMicrophonePermissions();

		    } catch (error) {
		      console.error('Failed to request microphone permission:', error);

		      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
		        // User denied permission - update banner and show helpful message
		        this.showError('Permission denied. To enable microphone access, click the camera icon in your browser\'s address bar.');

		        // Re-check permissions to update banner to denied state
		        await this.checkMicrophonePermissions();
		      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
		        this.showError('No microphone found. Please connect a microphone and try again.');
		      } else {
		        this.showError('Failed to access microphone. Please try again.');
		      }
		    }
		  }

		  // ===== Editor Methods =====

		  initializeEditor() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    // Load saved content if any
		    chrome.storage.local.get(['editorContent'], (result) => {
		      if (result.editorContent) {
		        editorArea.innerHTML = result.editorContent;
		        this.editorContent = result.editorContent;
		        this.updateEditorStats();
		      }
		    });
		  }

		  handleEditorInput() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    // Remove placeholder if content exists
		    const placeholder = editorArea.querySelector('.editor-placeholder');
		    if (placeholder && editorArea.textContent.trim()) {
		      placeholder.remove();
		    }

		    // Update content
		    this.editorContent = editorArea.innerHTML;

		    // Update stats
		    this.updateEditorStats();

		    // Auto-save
		    this.autoSaveContent();
		  }

		  handlePaste(e) {
		    e.preventDefault();

		    // Get plain text from clipboard
		    const text = e.clipboardData.getData('text/plain');

		    // Insert text at cursor position
		    document.execCommand('insertText', false, text);
		  }

		  updateEditorStats() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    const text = editorArea.textContent || '';

		    // Count words
		    this.wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

		    // Count characters
		    this.charCount = text.length;

		    // Calculate reading time (average 200 words per minute)
		    const readingTime = Math.ceil(this.wordCount / 200);

		    // Update UI
		    document.getElementById('wordCount').textContent = this.wordCount;
		    document.getElementById('charCount').textContent = this.charCount;
		    document.getElementById('readingTime').textContent = `${readingTime} min`;
		  }

		  autoSaveContent() {
		    // Debounce auto-save
		    clearTimeout(this.autoSaveTimeout);
		    this.autoSaveTimeout = setTimeout(() => {
		      chrome.storage.local.set({ editorContent: this.editorContent });
		      console.log('Editor content auto-saved');
		    }, 1000);
		  }

		  newDocument() {
		    if (this.editorContent && !confirm('Create new document? Unsaved changes will be lost.')) {
		      return;
		    }

		    const editorArea = document.getElementById('editorArea');
		    if (editorArea) {
		      editorArea.innerHTML = '<p class="editor-placeholder">Start writing or paste your text here...</p>';
		      this.editorContent = '';
		      this.updateEditorStats();
		      chrome.storage.local.remove('editorContent');
		    }
		  }

		  openDocument() {
		    // Create file input
		    const input = document.createElement('input');
		    input.type = 'file';
		    input.accept = '.txt,.md';

		    input.onchange = (e) => {
		      const file = e.target.files[0];
		      if (!file) return;

		      const reader = new FileReader();
		      reader.onload = (event) => {
		        const editorArea = document.getElementById('editorArea');
		        if (editorArea) {
		          editorArea.textContent = event.target.result;
		          this.editorContent = editorArea.innerHTML;
		          this.updateEditorStats();
		        }
		      };
		      reader.readAsText(file);
		    };

		    input.click();
		  }

		  saveDocument() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    const text = editorArea.textContent || '';
		    const blob = new Blob([text], { type: 'text/plain' });
		    const url = URL.createObjectURL(blob);

		    const a = document.createElement('a');
		    a.href = url;
		    a.download = `document-${Date.now()}.txt`;
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
		    URL.revokeObjectURL(url);

		    console.log('Document saved');
		  }

		  undo() {
		    document.execCommand('undo');
		  }

		  redo() {
		    document.execCommand('redo');
		  }

		  async checkGrammar() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    const text = editorArea.textContent || '';
		    if (!text.trim()) {
		      this.showError('Please enter some text to check');
		      return;
		    }

		    this.showSuggestionsPanel();
		    this.showLoadingSuggestions('Checking grammar...');

		    try {
		      if (!this.editorAI) {
		        throw new Error('AI features not initialized');
		      }

		      const result = await this.editorAI.checkGrammar(text);

		      if (result.success) {
		        const suggestions = result.corrections.map(correction => ({
		          type: correction.type,
		          text: `"${correction.original}" → "${correction.suggestion}"${correction.explanation ? ': ' + correction.explanation : ''}`
		        }));

		        if (suggestions.length === 0) {
		          this.displaySuggestions([{
		            type: 'Success',
		            text: '✓ No grammar issues found!'
		          }]);
		        } else {
		          this.displaySuggestions(suggestions);
		        }
		      } else {
		        // Show fallback suggestions
		        this.displaySuggestions(result.fallback || [{
		          type: 'Info',
		          text: result.error || 'Grammar checking is currently unavailable'
		        }]);
		      }
		    } catch (error) {
		      console.error('Grammar check failed:', error);
		      this.displaySuggestions([{
		        type: 'Error',
		        text: 'Grammar checking failed: ' + error.message
		      }]);
		    }
		  }

		  async improveWriting() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    const text = editorArea.textContent || '';
		    if (!text.trim()) {
		      this.showError('Please enter some text to improve');
		      return;
		    }

		    this.showSuggestionsPanel();
		    this.showLoadingSuggestions('Improving writing...');

		    try {
		      if (!this.editorAI) {
		        throw new Error('AI features not initialized');
		      }

		      const result = await this.editorAI.improveWriting(text);

		      if (result.success) {
		        const suggestions = [
		          {
		            type: 'Improved Version',
		            text: result.improved
		          },
		          ...result.suggestions.map(s => ({
		            type: s.type,
		            text: s.text
		          }))
		        ];

		        this.displaySuggestions(suggestions);
		      } else {
		        // Show fallback suggestions
		        this.displaySuggestions(result.fallback || [{
		          type: 'Info',
		          text: result.error || 'Writing improvement is currently unavailable'
		        }]);
		      }
		    } catch (error) {
		      console.error('Writing improvement failed:', error);
		      this.displaySuggestions([{
		        type: 'Error',
		        text: 'Writing improvement failed: ' + error.message
		      }]);
		    }
		  }

		  async changeTone() {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    const text = editorArea.textContent || '';
		    if (!text.trim()) {
		      this.showError('Please enter some text to rewrite');
		      return;
		    }

		    // Show tone selection dialog
		    const tone = await this.selectTone();
		    if (!tone) return;

		    this.showSuggestionsPanel();
		    this.showLoadingSuggestions(`Changing tone to ${tone}...`);

		    try {
		      if (!this.editorAI) {
		        throw new Error('AI features not initialized');
		      }

		      const result = await this.editorAI.changeTone(text, tone);

		      if (result.success) {
		        this.displaySuggestions([
		          {
		            type: `${tone.charAt(0).toUpperCase() + tone.slice(1)} Tone`,
		            text: result.rewritten
		          }
		        ]);
		      } else {
		        // Show fallback suggestions
		        this.displaySuggestions(result.fallback || [{
		          type: 'Info',
		          text: result.error || 'Tone adjustment is currently unavailable'
		        }]);
		      }
		    } catch (error) {
		      console.error('Tone change failed:', error);
		      this.displaySuggestions([{
		        type: 'Error',
		        text: 'Tone adjustment failed: ' + error.message
		      }]);
		    }
		  }

		  async selectTone() {
		    // Simple tone selection using prompt
		    const tones = ['formal', 'casual', 'professional', 'friendly'];
		    const selection = prompt(`Select tone:\n1. Formal\n2. Casual\n3. Professional\n4. Friendly\n\nEnter number (1-4):`);

		    const toneIndex = parseInt(selection) - 1;
		    if (toneIndex >= 0 && toneIndex < tones.length) {
		      return tones[toneIndex];
		    }

		    return null;
		  }

		  showSuggestionsPanel() {
		    const panel = document.getElementById('suggestionsPanel');
		    if (panel) {
		      panel.classList.remove('hidden');
		    }
		  }

		  hideSuggestionsPanel() {
		    const panel = document.getElementById('suggestionsPanel');
		    if (panel) {
		      panel.classList.add('hidden');
		    }
		  }

		  showLoadingSuggestions(message) {
		    const content = document.getElementById('suggestionsContent');
		    if (content) {
		      content.innerHTML = `
        <div class="suggestions-placeholder">
          <span class="placeholder-icon">⏳</span>
          <p>${message}</p>
        </div>
      `;
		    }
		  }

		  displaySuggestions(suggestions) {
		    const content = document.getElementById('suggestionsContent');
		    if (!content) return;

		    if (suggestions.length === 0) {
		      content.innerHTML = `
        <div class="suggestions-placeholder">
          <span class="placeholder-icon">✓</span>
          <p>No suggestions found</p>
        </div>
      `;
		      return;
		    }

		    content.innerHTML = suggestions.map((suggestion, index) => `
      <div class="suggestion-item" data-index="${index}">
        <div class="suggestion-header">
          <div class="suggestion-type">${suggestion.type}</div>
        </div>
        <div class="suggestion-text">${suggestion.text}</div>
        <div class="suggestion-actions">
          <button class="suggestion-btn apply" data-action="apply" data-index="${index}">
            ✓ Apply
          </button>
          <button class="suggestion-btn copy" data-action="copy" data-index="${index}">
            📋 Copy
          </button>
        </div>
      </div>
    `).join('');

		    // Add event listeners to buttons
		    content.querySelectorAll('.suggestion-btn').forEach(btn => {
		      btn.addEventListener('click', (e) => {
		        e.stopPropagation();
		        const action = btn.dataset.action;
		        const index = parseInt(btn.dataset.index);
		        this.handleSuggestionAction(action, suggestions[index]);
		      });
		    });
		  }

		  handleSuggestionAction(action, suggestion) {
		    if (action === 'apply') {
		      this.applySuggestion(suggestion);
		    } else if (action === 'copy') {
		      this.copySuggestion(suggestion);
		    }
		  }

		  applySuggestion(suggestion) {
		    const editorArea = document.getElementById('editorArea');
		    if (!editorArea) return;

		    // For "Improved Version" or similar, replace entire content
		    if (suggestion.type === 'Improved Version' || 
		        suggestion.type.includes('Tone') || 
		        suggestion.type === 'Rewritten') {
		      editorArea.textContent = suggestion.text;
		      this.editorContent = editorArea.innerHTML;
		      this.updateEditorStats();
		      this.autoSaveContent();
		      
		      // Show success feedback
		      this.showSuccessFeedback('Applied successfully!');
		      
		      // Close suggestions panel after a moment
		      setTimeout(() => {
		        this.hideSuggestionsPanel();
		      }, 1000);
		    } else {
		      // For other suggestions, just copy to clipboard
		      this.copySuggestion(suggestion);
		    }
		  }

		  copySuggestion(suggestion) {
		    navigator.clipboard.writeText(suggestion.text).then(() => {
		      this.showSuccessFeedback('Copied to clipboard!');
		    }).catch(error => {
		      console.error('Failed to copy:', error);
		      this.showError('Failed to copy suggestion');
		    });
		  }

		  showSuccessFeedback(message) {
		    const content = document.getElementById('suggestionsContent');
		    if (!content) return;

		    // Create temporary success message
		    const feedback = document.createElement('div');
		    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    `;
		    feedback.textContent = message;
		    
		    content.appendChild(feedback);
		    
		    setTimeout(() => {
		      feedback.remove();
		    }, 2000);
		  }

		  // ===== Translator Methods =====

		  initializeTranslator() {
		    console.log('Initializing translator...');
		    this.updateSourceCharCount();
		  }

		  updateSourceCharCount() {
		    const sourceText = document.getElementById('sourceText');
		    const charCount = document.getElementById('sourceCharCount');
		    
		    if (sourceText && charCount) {
		      const count = sourceText.value.length;
		      charCount.textContent = count;
		      
		      // Warn if approaching limit
		      if (count > 4500) {
		        charCount.style.color = '#ef4444';
		      } else if (count > 4000) {
		        charCount.style.color = '#f59e0b';
		      } else {
		        charCount.style.color = '#64748b';
		      }
		    }
		  }

		  autoTranslate() {
		    // Debounce auto-translation
		    clearTimeout(this.translateTimeout);
		    this.translateTimeout = setTimeout(() => {
		      const sourceText = document.getElementById('sourceText');
		      if (sourceText && sourceText.value.trim()) {
		        this.translateText();
		      }
		    }, 1000);
		  }

		  async translateText() {
		    const sourceText = document.getElementById('sourceText');
		    const targetText = document.getElementById('targetText');
		    const translationStatus = document.getElementById('translationStatus');
		    
		    if (!sourceText || !targetText) return;

		    const text = sourceText.value.trim();
		    if (!text) {
		      targetText.innerHTML = `
        <div class="translation-placeholder">
          <span class="placeholder-icon">🌐</span>
          <p>Translation will appear here</p>
        </div>
      `;
		      return;
		    }

		    try {
		      // Show loading state
		      translationStatus.textContent = 'Translating...';
		      targetText.innerHTML = '<div style="padding: 20px; text-align: center; color: #94a3b8;">⏳ Translating...</div>';

		      // Check if Translator API is available
		      if (!this.aiManager) {
		        throw new Error('AI Manager not initialized');
		      }

		      // Check API availability
		      const availability = this.aiManager.getAvailability('translator');
		      if (availability === 'unavailable') {
		        throw new Error('TRANSLATOR_NOT_AVAILABLE');
		      }

		      // Detect language if auto
		      let sourceLanguage = this.sourceLanguage;
		      if (sourceLanguage === 'auto') {
		        if (this.aiManager.isAPIAvailable('languageDetector')) {
		          try {
		            const detection = await this.aiManager.detectLanguage(text);
		            if (detection) {
		              sourceLanguage = detection.language;
		              this.detectedLanguage = sourceLanguage;
		              document.getElementById('detectedLanguage').textContent = 
		                `Detected: ${this.getLanguageName(sourceLanguage)}`;
		            }
		          } catch (detectionError) {
		            console.warn('Language detection failed, using English:', detectionError);
		            sourceLanguage = 'en'; // Default to English
		          }
		        } else {
		          sourceLanguage = 'en'; // Default to English
		        }
		      } else {
		        document.getElementById('detectedLanguage').textContent = '';
		      }

		      // Translate using AI API
		      const translated = await this.aiManager.translate(text, sourceLanguage, this.targetLanguage);
		      this.currentTranslation = translated;
		      targetText.textContent = translated;
		      translationStatus.textContent = '✓ Translated';
		      
		      // Clear status after 2 seconds
		      setTimeout(() => {
		        translationStatus.textContent = '';
		      }, 2000);
		      
		    } catch (error) {
		      console.error('Translation failed:', error);
		      
		      // Show user-friendly error message
		      let errorMessage = error.message;
		      let helpText = '';
		      
		      if (error.message === 'TRANSLATOR_NOT_AVAILABLE' || error.message.includes('Translator API not available')) {
		        errorMessage = 'Translator API not available';
		        helpText = `
          <div style="margin-top: 12px; padding: 12px; background: #fef3c7; border-radius: 6px; text-align: left;">
            <p style="font-weight: 600; color: #92400e; margin-bottom: 8px;">📝 How to enable:</p>
            <ol style="font-size: 11px; color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
              <li>Open <code>chrome://flags/</code></li>
              <li>Search for "translator"</li>
              <li>Enable "Translator API"</li>
              <li>Restart Chrome</li>
              <li>Reload this extension</li>
            </ol>
          </div>
        `;
		      }
		      
		      targetText.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <p style="color: #ef4444; font-size: 16px; margin-bottom: 8px;">❌ Translation failed</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 4px;">${errorMessage}</p>
          ${helpText}
        </div>
      `;
		      translationStatus.textContent = '✗ Failed';
		    }
		  }

		  swapLanguages() {
		    // Can't swap if source is auto-detect
		    if (this.sourceLanguage === 'auto') {
		      // Use detected language if available
		      if (this.detectedLanguage) {
		        this.sourceLanguage = this.detectedLanguage;
		      } else {
		        this.showError('Cannot swap languages when using auto-detect');
		        return;
		      }
		    }

		    // Swap languages
		    const temp = this.sourceLanguage;
		    this.sourceLanguage = this.targetLanguage;
		    this.targetLanguage = temp;

		    // Update UI
		    document.getElementById('sourceLanguage').value = this.sourceLanguage;
		    document.getElementById('targetLanguage').value = this.targetLanguage;

		    // Swap text content
		    const sourceText = document.getElementById('sourceText');
		    const targetText = document.getElementById('targetText');
		    
		    if (sourceText && targetText) {
		      sourceText.value;
		      sourceText.value = this.currentTranslation;
		      
		      // Trigger translation
		      this.updateSourceCharCount();
		      this.translateText();
		    }
		  }

		  clearSourceText() {
		    const sourceText = document.getElementById('sourceText');
		    const targetText = document.getElementById('targetText');
		    const detectedLanguage = document.getElementById('detectedLanguage');
		    
		    if (sourceText) {
		      sourceText.value = '';
		      this.updateSourceCharCount();
		    }
		    
		    if (targetText) {
		      targetText.innerHTML = `
        <div class="translation-placeholder">
          <span class="placeholder-icon">🌐</span>
          <p>Translation will appear here</p>
        </div>
      `;
		    }
		    
		    if (detectedLanguage) {
		      detectedLanguage.textContent = '';
		    }
		    
		    this.currentTranslation = '';
		    this.detectedLanguage = '';
		  }

		  async speakText(type) {
		    try {
		      const button = document.getElementById(type === 'source' ? 'speakSource' : 'speakTarget');
		      
		      // Stop if already speaking
		      if (this.isSpeaking) {
		        this.speechSynthesis.cancel();
		        this.isSpeaking = false;
		        button?.classList.remove('speaking');
		        return;
		      }

		      // Get text to speak
		      let text = '';
		      let lang = '';
		      
		      if (type === 'source') {
		        const sourceText = document.getElementById('sourceText');
		        text = sourceText?.value || '';
		        lang = this.sourceLanguage === 'auto' ? (this.detectedLanguage || 'en') : this.sourceLanguage;
		      } else {
		        text = this.currentTranslation;
		        lang = this.targetLanguage;
		      }

		      if (!text.trim()) {
		        this.showError('No text to read');
		        return;
		      }

		      // Create speech utterance
		      const utterance = new SpeechSynthesisUtterance(text);
		      utterance.lang = this.getLanguageCode(lang);
		      utterance.rate = 0.9;
		      utterance.pitch = 1.0;

		      // Add speaking animation
		      button?.classList.add('speaking');
		      this.isSpeaking = true;

		      // Handle speech end
		      utterance.onend = () => {
		        button?.classList.remove('speaking');
		        this.isSpeaking = false;
		      };

		      utterance.onerror = (error) => {
		        console.error('Speech synthesis error:', error);
		        button?.classList.remove('speaking');
		        this.isSpeaking = false;
		        this.showError('Text-to-speech failed');
		      };

		      // Speak
		      this.speechSynthesis.speak(utterance);
		      
		    } catch (error) {
		      console.error('Text-to-speech failed:', error);
		      this.showError('Text-to-speech failed: ' + error.message);
		    }
		  }

		  copyTranslation() {
		    if (!this.currentTranslation) {
		      this.showError('No translation to copy');
		      return;
		    }

		    navigator.clipboard.writeText(this.currentTranslation).then(() => {
		      const button = document.getElementById('copyTranslation');
		      const originalHTML = button.innerHTML;
		      
		      // Show success feedback
		      button.innerHTML = '<span>✓</span>';
		      setTimeout(() => {
		        button.innerHTML = originalHTML;
		      }, 1000);
		      
		      console.log('Translation copied to clipboard');
		    }).catch(error => {
		      console.error('Failed to copy translation:', error);
		      this.showError('Failed to copy translation');
		    });
		  }

		  saveTranslation() {
		    const sourceText = document.getElementById('sourceText')?.value || '';
		    const translation = this.currentTranslation;
		    
		    if (!sourceText || !translation) {
		      this.showError('No translation to save');
		      return;
		    }

		    const content = `Source (${this.getLanguageName(this.sourceLanguage)}):\n${sourceText}\n\nTranslation (${this.getLanguageName(this.targetLanguage)}):\n${translation}`;
		    
		    const blob = new Blob([content], { type: 'text/plain' });
		    const url = URL.createObjectURL(blob);
		    const a = document.createElement('a');
		    a.href = url;
		    a.download = `translation-${Date.now()}.txt`;
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
		    URL.revokeObjectURL(url);
		    
		    console.log('Translation saved');
		  }

		  getLanguageName(code) {
		    const languages = {
		      'auto': 'Auto-detect',
		      'en': 'English',
		      'es': 'Spanish',
		      'fr': 'French',
		      'de': 'German',
		      'it': 'Italian',
		      'pt': 'Portuguese',
		      'ru': 'Russian',
		      'ja': 'Japanese',
		      'ko': 'Korean',
		      'zh': 'Chinese',
		      'ar': 'Arabic',
		      'hi': 'Hindi',
		      'vi': 'Vietnamese',
		      'th': 'Thai'
		    };
		    return languages[code] || code;
		  }

		  getLanguageCode(code) {
		    // Convert to BCP 47 language codes for speech synthesis
		    const codes = {
		      'en': 'en-US',
		      'es': 'es-ES',
		      'fr': 'fr-FR',
		      'de': 'de-DE',
		      'it': 'it-IT',
		      'pt': 'pt-PT',
		      'ru': 'ru-RU',
		      'ja': 'ja-JP',
		      'ko': 'ko-KR',
		      'zh': 'zh-CN',
		      'ar': 'ar-SA',
		      'hi': 'hi-IN',
		      'vi': 'vi-VN',
		      'th': 'th-TH'
		    };
		    return codes[code] || code;
		  }

		  // ===== Meeting Methods =====

		  async loadExistingSession() {
		    try {
		      // Check if there's an active meeting session
		      const response = await chrome.runtime.sendMessage({
		        type: 'GET_ACTIVE_MEETING_SESSION'
		      });

		      if (response?.success && response.data) {
		        this.currentSession = response.data;
		        this.transcript = response.data.transcript || [];

		        if (response.data.active && response.data.recording) {
		          this.isRecording = true;
		          this.recordingStartTime = response.data.startTime;
		          this.startDurationTimer();
		        }

		        console.log('Existing session loaded:', this.currentSession);
		      }
		    } catch (error) {
		      console.warn('No existing session found:', error);
		    }
		  }

		  updateUI() {
		    this.updateRecordingButton();
		    this.updateRecordingStatus();
		    this.updateSessionInfo();
		    this.updateTranscript();
		  }

		  updateRecordingButton() {
		    const recordBtn = document.getElementById('recordBtn');
		    const recordIcon = recordBtn.querySelector('.record-icon');
		    const recordText = recordBtn.querySelector('.record-text');

		    if (this.isRecording) {
		      recordBtn.className = 'record-btn recording';
		      recordIcon.textContent = '⏹️';
		      recordText.textContent = 'Stop Recording';
		    } else {
		      recordBtn.className = 'record-btn';
		      recordIcon.textContent = '🎙️';
		      recordText.textContent = 'Start Recording';
		    }
		  }

		  updateRecordingStatus() {
		    const statusDot = document.querySelector('.status-dot');
		    const statusText = document.querySelector('.status-text');

		    if (this.isRecording) {
		      statusDot.className = 'status-dot recording';
		      statusText.textContent = 'Recording in progress';
		    } else {
		      statusDot.className = 'status-dot';
		      statusText.textContent = this.transcript.length > 0 ? 'Recording stopped' : 'Ready to record';
		    }
		  }

		  updateSessionInfo() {
		    const sessionId = document.getElementById('sessionId');
		    const speakerCount = document.getElementById('speakerCount');
		    const detectedLanguage = document.getElementById('detectedLanguage');

		    sessionId.textContent = this.currentSession?.id?.substring(0, 8) || 'None';

		    const speakers = this.currentSession?.speakers?.size || 0;
		    speakerCount.textContent = speakers.toString();

		    detectedLanguage.textContent = this.currentSession?.language || 'Auto';
		  }

		  updateTranscript() {
		    const container = document.getElementById('transcriptContainer');

		    if (this.transcript.length === 0) {
		      container.innerHTML = `
        <div class="transcript-placeholder">
          <span class="placeholder-icon">🎤</span>
          <p>Start recording to see live transcript</p>
          <p class="placeholder-subtitle">All processing happens locally on your device</p>
        </div>
      `;
		      return;
		    }

		    container.innerHTML = '';

		    this.transcript.forEach((entry, index) => {
		      const entryElement = document.createElement('div');
		      entryElement.className = 'transcript-entry';
		      entryElement.innerHTML = `
        <div class="transcript-header">
          <span class="speaker-name">${entry.speaker || 'Speaker ' + (index + 1)}</span>
          <span class="timestamp">${this.formatTimestamp(entry.timestamp)}</span>
        </div>
        <div class="transcript-text">${entry.text}</div>
      `;

		      container.appendChild(entryElement);
		    });

		    // Auto-scroll to bottom
		    container.scrollTop = container.scrollHeight;
		  }

		  async toggleRecording() {
		    if (this.isRecording) {
		      await this.stopRecording();
		    } else {
		      await this.startRecording();
		    }
		  }

		  async startRecording() {
		    try {
		      console.log('Starting recording...');

		      // Initialize meeting session
		      const response = await chrome.runtime.sendMessage({
		        type: 'INITIALIZE_MEETING_SESSION',
		        data: {
		          tabId: await this.getCurrentTabId()
		        }
		      });

		      if (!response?.success) {
		        throw new Error('Failed to initialize meeting session');
		      }

		      this.currentSession = response.data;
		      this.isRecording = true;
		      this.recordingStartTime = Date.now();
		      this.transcript = [];

		      // Start duration timer
		      this.startDurationTimer();

		      // Start speech recognition (which will request microphone access)
		      this.initializeSpeechRecognition();

		      // Update UI
		      this.updateUI();

		      console.log('Recording started successfully');

		    } catch (error) {
		      console.error('Failed to start recording:', error);

		      // Clean up any resources
		      this.isRecording = false;
		      this.stopDurationTimer();

		      // Show user-friendly error message
		      this.showError(error.message || 'Failed to start recording. Please check microphone permissions.');
		    }
		  }

		  async stopRecording() {
		    try {
		      console.log('Stopping recording...');

		      this.isRecording = false;
		      this.stopDurationTimer();

		      // Stop audio processing (speech recognition)
		      this.stopAudioProcessing();

		      // Update status
		      this.updateRecognitionStatus('Ready');

		      // Generate meeting analysis
		      if (this.transcript.length > 0) {
		        await this.generateMeetingAnalysis();
		      } else {
		        this.showWarning('No transcript recorded. Please speak during the recording.');
		      }

		      // Update UI
		      this.updateUI();

		      console.log('Recording stopped successfully');

		    } catch (error) {
		      console.error('Failed to stop recording:', error);
		      this.showError('Failed to stop recording');
		    }
		  }

		  startDurationTimer() {
		    this.durationInterval = setInterval(() => {
		      this.updateDuration();
		    }, 1000);
		  }

		  stopDurationTimer() {
		    if (this.durationInterval) {
		      clearInterval(this.durationInterval);
		      this.durationInterval = null;
		    }
		  }

		  updateDuration() {
		    if (!this.recordingStartTime) return;

		    const duration = Date.now() - this.recordingStartTime;
		    const minutes = Math.floor(duration / 60000);
		    const seconds = Math.floor((duration % 60000) / 1000);

		    const durationElement = document.getElementById('recordingDuration');
		    durationElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		  }

		  startAudioProcessing(stream) {
		    console.log('Audio processing started');

		    // Store the stream for later cleanup
		    if (stream) {
		      console.log('Media stream active with', stream.getAudioTracks().length, 'audio track(s)');
		    }

		    // Initialize Web Speech API for transcription
		    this.initializeSpeechRecognition();
		  }

		  stopAudioProcessing() {
		    console.log('Audio processing stopped');

		    // Stop speech recognition
		    if (this.speechRecognition) {
		      this.speechRecognition.stop();
		      this.speechRecognition = null;
		    }
		  }

		  initializeSpeechRecognition() {
		    // Check if Web Speech API is available
		    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

		    if (!SpeechRecognition) {
		      console.error('Web Speech API not supported in this browser');
		      this.showError('Speech recognition not supported in this browser. Please use Chrome 138+.');
		      return;
		    }

		    try {
		      this.speechRecognition = new SpeechRecognition();

		      // Configure speech recognition
		      this.speechRecognition.continuous = true; // Keep listening
		      this.speechRecognition.interimResults = true; // Get partial results
		      this.speechRecognition.maxAlternatives = 1;
		      this.speechRecognition.lang = this.recognitionLanguage; // Use selected language
		      
		      console.log('Speech recognition language set to:', this.recognitionLanguage);

		      // Handle results
		      this.speechRecognition.onresult = (event) => {
		        this.handleSpeechResult(event);
		      };

		      // Handle errors
		      this.speechRecognition.onerror = (event) => {
		        console.error('Speech recognition error:', event.error);

		        if (event.error === 'no-speech') {
		          // Don't log repeatedly - this is normal when no one is speaking
		          // Just continue listening
		        } else if (event.error === 'audio-capture') {
		          this.showError('Cannot access microphone. Please check your microphone is connected and working.');
		          this.stopRecording();
		        } else if (event.error === 'not-allowed') {
		          this.showError('Microphone permission denied. Click the camera icon in the address bar to allow access.');
		          this.stopRecording();
		        } else if (event.error === 'aborted') {
		          // Recognition was aborted, this is normal when stopping
		          console.log('Speech recognition aborted');
		        } else {
		          console.warn('Speech recognition error:', event.error);
		          this.showWarning(`Speech recognition issue: ${event.error}. Trying to continue...`);
		        }
		      };

		      // Handle start event
		      this.speechRecognition.onstart = () => {
		        console.log('Speech recognition started successfully');
		        const langName = this.getLanguageName(this.recognitionLanguage);
		        this.showInfo(`Listening in ${langName}... Start speaking to see live transcript.`);
		        this.updateRecognitionStatus(`Listening (${langName})`);
		      };

		      // Handle end event (restart if still recording)
		      this.speechRecognition.onend = () => {
		        console.log('Speech recognition ended');

		        // Restart if still recording
		        if (this.isRecording && this.speechRecognition) {
		          console.log('Restarting speech recognition...');
		          try {
		            // Small delay before restarting to avoid rapid restart loops
		            setTimeout(() => {
		              if (this.isRecording && this.speechRecognition) {
		                this.speechRecognition.start();
		              }
		            }, 100);
		          } catch (error) {
		            console.error('Failed to restart speech recognition:', error);
		            this.showError('Speech recognition stopped unexpectedly. Please try recording again.');
		          }
		        }
		      };

		      // Start recognition
		      this.speechRecognition.start();
		      console.log('Speech recognition starting...');

		    } catch (error) {
		      console.error('Failed to initialize speech recognition:', error);
		      this.showError('Failed to start speech recognition: ' + error.message);
		    }
		  }

		  handleSpeechResult(event) {
		    // Get the latest result
		    const results = event.results;
		    const lastResultIndex = results.length - 1;
		    const lastResult = results[lastResultIndex];

		    // Check if this is a final result
		    const isFinal = lastResult.isFinal;
		    const transcript = lastResult[0].transcript;
		    const confidence = lastResult[0].confidence;

		    console.log(`Speech result (${isFinal ? 'final' : 'interim'}):`, transcript, `(confidence: ${confidence})`);

		    if (isFinal && transcript.trim()) {
		      // Add final transcript to the list
		      this.addTranscriptEntry({
		        speaker: this.identifySpeaker(),
		        text: transcript.trim(),
		        timestamp: Date.now(),
		        confidence: confidence || 0.9
		      });
		    }
		  }

		  identifySpeaker() {
		    // Simple speaker identification based on time gaps
		    // In a real implementation, this could use voice recognition or manual speaker assignment
		    const now = Date.now();
		    const lastEntry = this.transcript[this.transcript.length - 1];

		    if (!lastEntry) {
		      return 'Speaker 1';
		    }

		    // If more than 5 seconds since last entry, might be a different speaker
		    const timeSinceLastEntry = now - lastEntry.timestamp;
		    if (timeSinceLastEntry > 5000) {
		      // Alternate between speakers (simple heuristic)
		      const lastSpeakerNum = parseInt(lastEntry.speaker.match(/\d+/)?.[0] || '1');
		      const nextSpeakerNum = (lastSpeakerNum % 3) + 1; // Cycle through 3 speakers
		      return `Speaker ${nextSpeakerNum}`;
		    }

		    return lastEntry.speaker;
		  }

		  addTranscriptEntry(entry) {
		    this.transcript.push(entry);
		    this.updateTranscript();
		    this.updateSessionInfo();
		  }

		  async generateMeetingAnalysis() {
		    try {
		      console.log('Generating meeting analysis...');

		      // Show analysis section
		      const analysisSection = document.getElementById('analysisSection');
		      analysisSection.style.display = 'block';

		      if (!this.meetingAI) {
		        throw new Error('Meeting AI features not initialized');
		      }

		      // Show loading state
		      this.displayAnalysis({
		        executiveSummary: 'Generating executive summary...',
		        actionItems: [],
		        keyDecisions: [],
		        followUpEmail: 'Generating follow-up email...'
		      });

		      // Generate analysis
		      const analysis = await this.meetingAI.analyzeMeeting(this.transcript);

		      if (analysis.success) {
		        this.displayAnalysis(analysis);
		      } else {
		        // Show fallback analysis
		        this.displayAnalysis(analysis.fallback || {
		          executiveSummary: 'Analysis failed: ' + analysis.error,
		          actionItems: [],
		          keyDecisions: [],
		          followUpEmail: 'Unable to generate email'
		        });
		      }

		    } catch (error) {
		      console.error('Failed to generate meeting analysis:', error);
		      this.displayAnalysis({
		        executiveSummary: 'Analysis failed: ' + error.message,
		        actionItems: [],
		        keyDecisions: [],
		        followUpEmail: 'Unable to generate email'
		      });
		    }
		  }

		  displayAnalysis(analysis) {
		    // Display executive summary
		    const summaryElement = document.getElementById('executiveSummary');
		    summaryElement.innerHTML = `<p>${analysis.executiveSummary || 'Analysis not yet implemented'}</p>`;

		    // Display action items
		    const actionItemsElement = document.getElementById('actionItems');
		    if (analysis.actionItems && analysis.actionItems.length > 0) {
		      actionItemsElement.innerHTML = analysis.actionItems.map(item => `
        <div class="action-item">
          <input type="checkbox" class="action-checkbox">
          <div class="action-text">
            <div>${item.task}</div>
            <div class="action-owner">${item.owner}</div>
          </div>
        </div>
      `).join('');
		    } else {
		      actionItemsElement.innerHTML = '<p>No action items identified</p>';
		    }

		    // Display key decisions
		    const decisionsElement = document.getElementById('keyDecisions');
		    if (analysis.keyDecisions && analysis.keyDecisions.length > 0) {
		      decisionsElement.innerHTML = analysis.keyDecisions.map(decision => `
        <div class="decision-item">
          <div class="decision-text">${decision}</div>
        </div>
      `).join('');
		    } else {
		      decisionsElement.innerHTML = '<p>No key decisions identified</p>';
		    }

		    // Display follow-up email
		    const emailElement = document.getElementById('emailDraft');
		    emailElement.innerHTML = `<pre>${analysis.followUpEmail || 'Email draft not yet implemented'}</pre>`;
		  }

		  clearTranscript() {
		    if (this.isRecording) {
		      this.showError('Cannot clear transcript while recording');
		      return;
		    }

		    if (confirm('Are you sure you want to clear the transcript?')) {
		      this.transcript = [];
		      this.updateTranscript();

		      // Hide analysis section
		      document.getElementById('analysisSection').style.display = 'none';

		      console.log('Transcript cleared');
		    }
		  }

		  exportTranscript() {
		    if (this.transcript.length === 0) {
		      this.showError('No transcript to export');
		      return;
		    }

		    const transcriptText = this.transcript.map(entry =>
		      `[${this.formatTimestamp(entry.timestamp)}] ${entry.speaker}: ${entry.text}`
		    ).join('\n');

		    this.downloadFile('meeting-transcript.txt', transcriptText);
		    console.log('Transcript exported');
		  }

		  async regenerateAnalysis() {
		    if (this.transcript.length === 0) {
		      this.showError('No transcript available for analysis');
		      return;
		    }

		    await this.generateMeetingAnalysis();
		  }

		  exportAnalysis() {
		    const analysisSection = document.getElementById('analysisSection');
		    if (analysisSection.style.display === 'none') {
		      this.showError('No analysis available to export');
		      return;
		    }

		    // Create analysis export (simplified)
		    const analysisText = `Meeting Analysis\n\nExecutive Summary:\n${document.getElementById('executiveSummary').textContent}\n\nAction Items:\n${document.getElementById('actionItems').textContent}\n\nKey Decisions:\n${document.getElementById('keyDecisions').textContent}`;

		    this.downloadFile('meeting-analysis.txt', analysisText);
		    console.log('Analysis exported');
		  }

		  copyEmailDraft() {
		    const emailText = document.getElementById('emailDraft').textContent;
		    navigator.clipboard.writeText(emailText).then(() => {
		      console.log('Email draft copied to clipboard');
		      // Could show a temporary success message
		    }).catch(error => {
		      console.error('Failed to copy email draft:', error);
		      this.showError('Failed to copy email draft');
		    });
		  }

		  editEmailDraft() {
		    // This would open an email editor - placeholder for now
		    console.log('Email editing not yet implemented');
		    this.showError('Email editing feature coming soon');
		  }

		  minimizePanel() {
		    // This would minimize the panel - placeholder for now
		    console.log('Panel minimization not yet implemented');
		  }

		  downloadFile(filename, content) {
		    const blob = new Blob([content], { type: 'text/plain' });
		    const url = URL.createObjectURL(blob);
		    const a = document.createElement('a');
		    a.href = url;
		    a.download = filename;
		    document.body.appendChild(a);
		    a.click();
		    document.body.removeChild(a);
		    URL.revokeObjectURL(url);
		  }

		  formatTimestamp(timestamp) {
		    const date = new Date(timestamp);
		    return date.toLocaleTimeString('en-US', {
		      hour12: false,
		      hour: '2-digit',
		      minute: '2-digit',
		      second: '2-digit'
		    });
		  }

		  async getCurrentTabId() {
		    return new Promise((resolve) => {
		      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		        resolve(tabs[0]?.id || null);
		      });
		    });
		  }

		  // ===== Language Management =====

		  getLanguageName(langCode) {
		    const languageNames = {
		      'en-US': 'English (US)',
		      'en-GB': 'English (UK)',
		      'en-AU': 'English (Australia)',
		      'en-CA': 'English (Canada)',
		      'es-ES': 'Spanish (Spain)',
		      'es-MX': 'Spanish (Mexico)',
		      'es-AR': 'Spanish (Argentina)',
		      'fr-FR': 'French (France)',
		      'fr-CA': 'French (Canada)',
		      'de-DE': 'German',
		      'it-IT': 'Italian',
		      'pt-BR': 'Portuguese (Brazil)',
		      'pt-PT': 'Portuguese (Portugal)',
		      'ru-RU': 'Russian',
		      'ja-JP': 'Japanese',
		      'ko-KR': 'Korean',
		      'zh-CN': 'Chinese (Simplified)',
		      'zh-TW': 'Chinese (Traditional)',
		      'ar-SA': 'Arabic',
		      'hi-IN': 'Hindi',
		      'vi-VN': 'Vietnamese',
		      'th-TH': 'Thai',
		      'nl-NL': 'Dutch',
		      'pl-PL': 'Polish',
		      'tr-TR': 'Turkish',
		      'sv-SE': 'Swedish',
		      'da-DK': 'Danish',
		      'no-NO': 'Norwegian',
		      'fi-FI': 'Finnish',
		      'cs-CZ': 'Czech',
		      'hu-HU': 'Hungarian',
		      'ro-RO': 'Romanian',
		      'uk-UA': 'Ukrainian',
		      'id-ID': 'Indonesian',
		      'ms-MY': 'Malay'
		    };
		    return languageNames[langCode] || langCode;
		  }

		  restartSpeechRecognition() {
		    if (!this.speechRecognition || !this.isRecording) return;

		    try {
		      // Stop current recognition
		      this.speechRecognition.stop();
		      
		      // Wait a bit then restart with new language
		      setTimeout(() => {
		        if (this.isRecording) {
		          this.initializeSpeechRecognition();
		        }
		      }, 500);
		    } catch (error) {
		      console.error('Failed to restart speech recognition:', error);
		      this.showError('Failed to switch language. Please stop and start recording again.');
		    }
		  }

		  updateRecognitionStatus(status) {
		    const statusElement = document.getElementById('recognitionStatus');
		    if (statusElement) {
		      statusElement.textContent = status;
		    }
		  }

		  // ===== Audio Device Management =====

		  async enumerateAudioDevices() {
		    try {
		      // Request permission first to get device labels
		      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		      stream.getTracks().forEach(track => track.stop());

		      // Get all devices
		      const devices = await navigator.mediaDevices.enumerateDevices();
		      
		      const microphones = devices.filter(device => device.kind === 'audioinput');
		      const speakers = devices.filter(device => device.kind === 'audiooutput');

		      console.log('Found microphones:', microphones.length);
		      console.log('Found speakers:', speakers.length);

		      // Populate microphone select
		      const micSelect = document.getElementById('microphoneSelect');
		      if (micSelect) {
		        micSelect.innerHTML = '';
		        
		        if (microphones.length === 0) {
		          micSelect.innerHTML = '<option value="">No microphones found</option>';
		        } else {
		          microphones.forEach((device, index) => {
		            const option = document.createElement('option');
		            option.value = device.deviceId;
		            option.textContent = device.label || `Microphone ${index + 1}`;
		            micSelect.appendChild(option);
		          });
		          
		          // Select first microphone by default
		          this.selectedMicrophone = microphones[0].deviceId;
		        }
		      }

		      // Populate speaker select
		      const speakerSelect = document.getElementById('speakerSelect');
		      if (speakerSelect) {
		        speakerSelect.innerHTML = '';
		        
		        if (speakers.length === 0) {
		          speakerSelect.innerHTML = '<option value="">No speakers found</option>';
		        } else {
		          speakers.forEach((device, index) => {
		            const option = document.createElement('option');
		            option.value = device.deviceId;
		            option.textContent = device.label || `Speaker ${index + 1}`;
		            speakerSelect.appendChild(option);
		          });
		          
		          // Select first speaker by default
		          this.selectedSpeaker = speakers[0].deviceId;
		        }
		      }

		      // Devices loaded silently - no success message needed

		    } catch (error) {
		      console.error('Failed to enumerate audio devices:', error);
		      this.showError('Failed to load audio devices. Please check permissions.');
		      
		      // Show error in selects
		      const micSelect = document.getElementById('microphoneSelect');
		      const speakerSelect = document.getElementById('speakerSelect');
		      
		      if (micSelect) {
		        micSelect.innerHTML = '<option value="">Permission denied</option>';
		      }
		      if (speakerSelect) {
		        speakerSelect.innerHTML = '<option value="">Permission denied</option>';
		      }
		    }
		  }

		  async testMicrophone() {
		    try {
		      console.log('Testing microphone:', this.selectedMicrophone);
		      
		      // Stop any existing test
		      this.stopMicrophoneTest();

		      // Get microphone stream
		      const constraints = {
		        audio: this.selectedMicrophone ? 
		          { deviceId: { exact: this.selectedMicrophone } } : 
		          true
		      };

		      this.micTestStream = await navigator.mediaDevices.getUserMedia(constraints);
		      
		      // Create audio context and analyser
		      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
		      this.analyser = this.audioContext.createAnalyser();
		      const source = this.audioContext.createMediaStreamSource(this.micTestStream);
		      source.connect(this.analyser);
		      
		      this.analyser.fftSize = 256;
		      const bufferLength = this.analyser.frequencyBinCount;
		      const dataArray = new Uint8Array(bufferLength);

		      // Show mic level container
		      const micLevelContainer = document.getElementById('micLevelContainer');
		      if (micLevelContainer) {
		        micLevelContainer.classList.remove('hidden');
		      }

		      // Update mic level indicator
		      this.micTestInterval = setInterval(() => {
		        this.analyser.getByteFrequencyData(dataArray);
		        
		        // Calculate average volume
		        let sum = 0;
		        for (let i = 0; i < bufferLength; i++) {
		          sum += dataArray[i];
		        }
		        const average = sum / bufferLength;
		        const percentage = Math.min(100, (average / 128) * 100);

		        // Update UI
		        const micLevelFill = document.getElementById('micLevelFill');
		        const micLevelText = document.getElementById('micLevelText');
		        
		        if (micLevelFill) {
		          micLevelFill.style.width = `${percentage}%`;
		        }
		        if (micLevelText) {
		          micLevelText.textContent = `${Math.round(percentage)}%`;
		        }
		      }, 100);

		      this.showInfo('Microphone test started. Speak to see the level indicator.');

		      // Auto-stop after 10 seconds
		      setTimeout(() => {
		        this.stopMicrophoneTest();
		      }, 10000);

		    } catch (error) {
		      console.error('Microphone test failed:', error);
		      this.showError('Failed to test microphone: ' + error.message);
		      this.stopMicrophoneTest();
		    }
		  }

		  stopMicrophoneTest() {
		    // Stop test interval
		    if (this.micTestInterval) {
		      clearInterval(this.micTestInterval);
		      this.micTestInterval = null;
		    }

		    // Stop audio context
		    if (this.audioContext) {
		      this.audioContext.close();
		      this.audioContext = null;
		    }

		    // Stop media stream
		    if (this.micTestStream) {
		      this.micTestStream.getTracks().forEach(track => track.stop());
		      this.micTestStream = null;
		    }

		    // Hide mic level container
		    const micLevelContainer = document.getElementById('micLevelContainer');
		    if (micLevelContainer) {
		      micLevelContainer.classList.add('hidden');
		    }

		    // Reset level indicator
		    const micLevelFill = document.getElementById('micLevelFill');
		    const micLevelText = document.getElementById('micLevelText');
		    if (micLevelFill) {
		      micLevelFill.style.width = '0%';
		    }
		    if (micLevelText) {
		      micLevelText.textContent = '0%';
		    }
		  }

		  async testSpeaker() {
		    try {
		      console.log('Testing speaker:', this.selectedSpeaker);
		      
		      // Create a test tone
		      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
		      const oscillator = audioContext.createOscillator();
		      const gainNode = audioContext.createGain();

		      oscillator.connect(gainNode);
		      gainNode.connect(audioContext.destination);

		      // Set frequency to 440Hz (A note)
		      oscillator.frequency.value = 440;
		      oscillator.type = 'sine';

		      // Set volume
		      gainNode.gain.value = 0.3;

		      // Play for 1 second
		      oscillator.start();
		      oscillator.stop(audioContext.currentTime + 1);

		      this.showInfo('Playing test tone... You should hear a beep.');

		      // Clean up after playing
		      setTimeout(() => {
		        audioContext.close();
		      }, 1500);

		    } catch (error) {
		      console.error('Speaker test failed:', error);
		      this.showError('Failed to test speaker: ' + error.message);
		    }
		  }

		  handleMessage(message, sender, sendResponse) {
		    switch (message.type) {
		      case 'PING_SIDEPANEL':
		        // Respond that sidepanel is open
		        sendResponse({ sidePanelOpen: true });
		        break;

		      case 'CLOSE_SIDEPANEL':
		        // Close the sidepanel by closing the window
		        window.close();
		        sendResponse({ success: true });
		        break;

		      case 'SWITCH_SIDEPANEL_SCREEN':
		        if (message.data?.screen) {
		          this.switchScreen(message.data.screen);
		        }
		        sendResponse({ success: true });
		        break;

		      case 'LOAD_TEXT_IN_EDITOR':
		        this.loadTextInEditor(message.data?.text || '');
		        sendResponse({ success: true });
		        break;

		      case 'LOAD_TEXT_IN_TRANSLATOR':
		        this.loadTextInTranslator(message.data?.text || '');
		        sendResponse({ success: true });
		        break;

		      case 'TRANSCRIPT_UPDATE':
		        this.addTranscriptEntry(message.data);
		        sendResponse({ success: true });
		        break;

		      case 'MEETING_ANALYSIS_READY':
		        this.displayAnalysis(message.data);
		        sendResponse({ success: true });
		        break;

		      default:
		        sendResponse({ success: false, error: 'Unknown message type' });
		    }
		  }

		  loadTextInEditor(text) {
		    console.log('Loading text in editor:', text.substring(0, 50) + '...');

		    // Switch to editor screen
		    this.switchScreen('editor');

		    // Load text into editor
		    const editorArea = document.getElementById('editorArea');
		    if (editorArea) {
		      // Remove placeholder if exists
		      const placeholder = editorArea.querySelector('.editor-placeholder');
		      if (placeholder) {
		        placeholder.remove();
		      }

		      // Set the text
		      editorArea.textContent = text;
		      this.editorContent = editorArea.innerHTML;
		      this.updateEditorStats();
		      this.autoSaveContent();

		      // Focus the editor
		      editorArea.focus();

		      // Text loaded silently - no info message needed
		    }
		  }

		  loadTextInTranslator(text) {
		    console.log('Loading text in translator:', text.substring(0, 50) + '...');

		    // Switch to translator screen
		    this.switchScreen('translator');

		    // Load text into source textarea
		    const sourceText = document.getElementById('sourceText');
		    if (sourceText) {
		      sourceText.value = text;
		      this.updateSourceCharCount();

		      // Focus the textarea
		      sourceText.focus();

		      // Trigger translation
		      this.translateText();

		      // Text loaded silently - no info message needed
		    }
		  }

		  showError(message) {
		    console.error('Sidepanel Error:', message);
		    this.showToast('Error', message, 'error');
		  }

		  showSuccess(message) {
		    console.log('Sidepanel Success:', message);
		    this.showToast('Success', message, 'success');
		  }

		  showWarning(message) {
		    console.warn('Sidepanel Warning:', message);
		    this.showToast('Warning', message, 'warning');
		  }

		  showInfo(message) {
		    console.info('Sidepanel Info:', message);
		    this.showToast('Info', message, 'info');
		  }

		  showToast(title, message, type = 'info') {
		    const container = document.getElementById('toastContainer');
		    if (!container) return;

		    const toast = document.createElement('div');
		    toast.className = `toast ${type}`;

		    const icons = {
		      error: '❌',
		      success: '✅',
		      warning: '⚠️',
		      info: 'ℹ️'
		    };

		    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">×</button>
    `;

		    const closeBtn = toast.querySelector('.toast-close');
		    closeBtn.addEventListener('click', () => {
		      this.removeToast(toast);
		    });

		    container.appendChild(toast);

		    // Auto-remove after 5 seconds
		    setTimeout(() => {
		      this.removeToast(toast);
		    }, 5000);
		  }

		  removeToast(toast) {
		    if (!toast || !toast.parentElement) return;

		    toast.classList.add('removing');
		    setTimeout(() => {
		      if (toast.parentElement) {
		        toast.parentElement.removeChild(toast);
		      }
		    }, 300);
		  }
		}

		// Initialize sidepanel when DOM is ready
		document.addEventListener('DOMContentLoaded', () => {
		  const sidepanel = new IntelliPenSidepanel();
		  sidepanel.initialize();
		});

		// Export for testing
		if (module.exports) {
		  module.exports = { IntelliPenSidepanel };
		} 
	} (sidepanel));

	var sidepanelExports = sidepanel.exports;
	var index = /*@__PURE__*/getDefaultExportFromCjs(sidepanelExports);

	return index;

})();
