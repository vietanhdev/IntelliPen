/**
 * IntelliPen Sidepanel Interface
 * Dual-screen interface: Editor and Meeting Dashboard
 */

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

    // Translator settings
    this.translatorSettings = {
      doubleClickTranslate: false,
      shiftClickTranslate: false
    };

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

    // Real-time grammar checking
    this.realtimeGrammarEnabled = false;
    this.grammarCheckTimeout = null;
    this.currentCorrections = [];
    this.correctedText = '';
    this.errorHighlights = null;
    this.proofreadClickHandler = null;

    // Rich text proofreader
    this.richTextProofreader = null;

    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('IntelliPen Sidepanel: Initializing...');

    try {
      // Load theme first
      await this.loadTheme();

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

  async loadTheme() {
    try {
      const result = await chrome.storage.local.get(['theme']);
      const theme = result.theme || 'auto';
      this.applyTheme(theme);
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  }

  applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      // Auto mode - remove attribute to use system preference
      root.removeAttribute('data-theme');
    }
  }

  async toggleTheme() {
    try {
      const result = await chrome.storage.local.get(['theme']);
      const currentTheme = result.theme || 'auto';

      // Cycle through: auto -> light -> dark -> auto
      let newTheme;
      if (currentTheme === 'auto') {
        newTheme = 'light';
      } else if (currentTheme === 'light') {
        newTheme = 'dark';
      } else {
        newTheme = 'auto';
      }

      await chrome.storage.local.set({ theme: newTheme });
      this.applyTheme(newTheme);

      // Show toast notification
      const themeNames = { auto: 'Auto', light: 'Light', dark: 'Dark' };
      this.showInfo(`Theme: ${themeNames[newTheme]}`);

      console.log('Theme changed to:', newTheme);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
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

      // Log API availability status for debugging
      console.log('=== Chrome AI API Availability Status ===');
      const apis = ['languageModel', 'proofreader', 'writer', 'rewriter', 'summarizer', 'translator', 'languageDetector'];
      apis.forEach(api => {
        const status = this.aiManager.getAvailability(api);
        const available = this.aiManager.isAPIAvailable(api);
        console.log(`${api}: ${status} (${available ? '✓ Available' : '✗ Not Available'})`);
      });
      console.log('=========================================');

      // Initialize AI feature modules
      if (typeof EditorAIFeatures !== 'undefined') {
        this.editorAI = new EditorAIFeatures(this.aiManager);
        console.log('Editor AI features initialized');
      }

      // Initialize Rich Text Proofreader
      if (typeof RichTextProofreader !== 'undefined') {
        this.richTextProofreader = new RichTextProofreader();
        console.log('Rich Text Proofreader initialized');
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
    // Theme toggle
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const screen = e.currentTarget.dataset.screen;
        this.switchScreen(screen);
      });
    });

    // Meeting tabs
    document.querySelectorAll('.meeting-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = e.currentTarget.dataset.tab;
        this.switchMeetingTab(tabName);
      });
    });

    // Editor toolbar buttons
    document.getElementById('newDocBtn')?.addEventListener('click', () => this.newDocument());
    document.getElementById('openDocBtn')?.addEventListener('click', () => this.openDocument());
    document.getElementById('saveDocBtn')?.addEventListener('click', () => this.saveDocument());
    document.getElementById('undoBtn')?.addEventListener('click', () => this.undo());
    document.getElementById('redoBtn')?.addEventListener('click', () => this.redo());
    document.getElementById('grammarCheckbox')?.addEventListener('change', (e) => this.toggleGrammarCheck(e.target.checked));
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
      this.saveTranslationLanguages();
      this.autoTranslate();
    });

    document.getElementById('targetLanguage')?.addEventListener('change', (e) => {
      this.targetLanguage = e.target.value;
      this.saveTranslationLanguages();
      this.autoTranslate();
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

    // Translator settings
    document.getElementById('translatorSettingsBtn')?.addEventListener('click', () => {
      this.openTranslatorSettings();
    });

    document.getElementById('closeTranslatorSettings')?.addEventListener('click', () => {
      this.closeTranslatorSettings();
    });

    document.getElementById('doubleClickTranslate')?.addEventListener('change', (e) => {
      this.translatorSettings.doubleClickTranslate = e.target.checked;
      this.saveTranslatorSettings();
      this.updateTranslatorEventListeners();
    });

    document.getElementById('shiftClickTranslate')?.addEventListener('change', (e) => {
      this.translatorSettings.shiftClickTranslate = e.target.checked;
      this.saveTranslatorSettings();
      this.updateTranslatorEventListeners();
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

    // Reset to transcript tab when switching to meeting screen
    if (screenName === 'meeting') {
      this.switchMeetingTab('transcript');
    }
  }

  switchMeetingTab(tabName) {
    console.log(`Switching to ${tabName} tab`);

    // Update meeting tabs
    document.querySelectorAll('.meeting-tab').forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Show/hide tab content
    const transcriptTab = document.getElementById('transcriptTab');
    const analysisTab = document.getElementById('analysisTab');

    if (tabName === 'transcript') {
      transcriptTab.style.display = 'flex';
      analysisTab.style.display = 'none';
    } else if (tabName === 'analysis') {
      transcriptTab.style.display = 'none';
      analysisTab.style.display = 'flex';
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

    // Real-time grammar checking (debounced)
    if (this.realtimeGrammarEnabled) {
      this.scheduleRealtimeGrammarCheck();
    }
  }

  scheduleRealtimeGrammarCheck() {
    // Clear existing timeout
    if (this.grammarCheckTimeout) {
      clearTimeout(this.grammarCheckTimeout);
    }

    // Schedule new check after 2 seconds of inactivity
    this.grammarCheckTimeout = setTimeout(() => {
      this.performRealtimeGrammarCheck();
    }, 2000);
  }

  async performRealtimeGrammarCheck() {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea || !this.richTextProofreader) return;

    // Extract plain text using the rich text proofreader
    // This preserves the mapping between plain text and DOM nodes
    const text = this.richTextProofreader.getPlainText(editorArea);

    if (!text.trim() || text.length < 10) {
      // Don't check very short text
      this.clearErrorHighlights();
      this.hideGrammarStatus();
      return;
    }

    try {
      if (!this.editorAI) return;

      // Show loading indicator
      this.showGrammarStatus('checking', 'Checking grammar...');

      console.log('Performing real-time grammar check on rich text...');
      const result = await this.editorAI.checkGrammar(text);

      if (result.success && result.corrections && result.corrections.length > 0) {
        // Check if this is an info message about API limitations
        if (result.corrections[0].type === 'info') {
          // Show message about Chrome version requirement
          this.clearErrorHighlights();
          console.log('Grammar checking available but requires Chrome 141+ for highlighting');
        } else if (result.corrections.length === 1 &&
          result.corrections[0].explanation?.includes('full replacement')) {
          // API returned a full replacement correction (partial result)
          // Don't try to highlight, just show the corrected text option
          console.log('⚠️ API returned full replacement - showing corrected text without highlights');
          this.currentCorrections = result.corrections;
          this.correctedText = result.corrected;
          this.clearErrorHighlights();

          // Show suggestion panel with the corrected text
          this.displayProofreadingResults(result.corrected, 1);
        } else {
          // Store corrections
          this.currentCorrections = result.corrections;
          this.correctedText = result.corrected;

          // Apply highlights using rich text proofreader
          // This will map corrections to the actual DOM nodes
          this.applyErrorHighlightsRichText(editorArea, result.corrections);

          console.log(`Found ${result.corrections.length} grammar issues in rich text`);
          
          // Show success status
          this.showGrammarStatus('success', `Found ${result.corrections.length} issue${result.corrections.length !== 1 ? 's' : ''}`);
          setTimeout(() => this.hideGrammarStatus(), 2000);
        }
      } else {
        // No errors found, clear highlights
        this.clearErrorHighlights();
        this.showGrammarStatus('success', 'No issues found');
        setTimeout(() => this.hideGrammarStatus(), 2000);
      }
    } catch (error) {
      console.error('Real-time grammar check failed:', error);
      this.showGrammarStatus('error', 'Check failed');
      setTimeout(() => this.hideGrammarStatus(), 3000);
    }
  }

  showGrammarStatus(type, message) {
    const statusEl = document.getElementById('grammarStatus');
    const textEl = document.getElementById('grammarStatusText');
    
    if (!statusEl || !textEl) return;

    statusEl.style.display = 'flex';
    statusEl.className = 'stat-item grammar-status';
    
    if (type === 'success') {
      statusEl.classList.add('success');
    } else if (type === 'error') {
      statusEl.classList.add('error');
    }
    
    textEl.textContent = message;
  }

  hideGrammarStatus() {
    const statusEl = document.getElementById('grammarStatus');
    if (statusEl) {
      statusEl.style.display = 'none';
    }
  }

  toggleGrammarCheck(enabled) {
    this.realtimeGrammarEnabled = enabled;

    if (!enabled) {
      // Clear any pending checks
      if (this.grammarCheckTimeout) {
        clearTimeout(this.grammarCheckTimeout);
      }
      // Clear highlights
      this.clearErrorHighlights();
      const editorArea = document.getElementById('editorArea');
      if (editorArea) {
        editorArea.dataset.proofreading = 'false';
      }

      // Hide popover if open
      const popover = document.getElementById('proofreadPopover');
      if (popover) {
        popover.hidePopover();
      }
    } else {
      // Trigger immediate check
      this.scheduleRealtimeGrammarCheck();
    }
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

  // Grammar checking is now automatic via checkbox - no manual button needed

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

      console.log('Calling improveWriting with text:', text.substring(0, 100));
      const result = await this.editorAI.improveWriting(text);
      console.log('Writing improvement result:', result);

      if (result.success) {
        // Check if we have improved text
        if (!result.improved || result.improved.trim() === '') {
          console.error('No improved text returned');
          this.displaySuggestions([{
            type: 'Error',
            text: 'Writing improvement returned empty result. The AI may not be responding correctly.'
          }]);
          return;
        }

        // Ensure suggestions is an array
        const additionalSuggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

        const suggestions = [
          {
            type: 'Improved Version',
            text: result.improved
          },
          ...additionalSuggestions.map(s => ({
            type: s.type,
            text: s.text
          }))
        ];

        console.log('Displaying suggestions:', suggestions);
        this.displaySuggestions(suggestions);
      } else {
        // Show fallback suggestions
        const fallbackSuggestions = result.fallback || [{
          type: 'Info',
          text: result.error || 'Writing improvement is currently unavailable'
        }];
        console.log('Showing fallback suggestions:', fallbackSuggestions);
        this.displaySuggestions(fallbackSuggestions);
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

      console.log('Calling changeTone with tone:', tone);
      const result = await this.editorAI.changeTone(text, tone);
      console.log('Tone change result:', result);

      if (result.success) {
        const suggestions = [
          {
            type: `${tone.charAt(0).toUpperCase() + tone.slice(1)} Tone`,
            text: result.rewritten
          }
        ];
        console.log('Displaying tone suggestions:', suggestions);
        this.displaySuggestions(suggestions);
      } else {
        // Show fallback suggestions
        const fallbackSuggestions = result.fallback || [{
          type: 'Info',
          text: result.error || 'Tone adjustment is currently unavailable'
        }];
        console.log('Showing fallback suggestions:', fallbackSuggestions);
        this.displaySuggestions(fallbackSuggestions);
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
    return new Promise((resolve) => {
      const overlay = document.getElementById('toneModalOverlay');
      const closeBtn = document.getElementById('closeToneModal');
      const toneOptions = document.querySelectorAll('.tone-option');

      // Show modal
      overlay.classList.remove('hidden');

      // Handle tone selection
      const handleToneSelect = (e) => {
        const tone = e.currentTarget.dataset.tone;
        cleanup();
        resolve(tone);
      };

      // Handle close
      const handleClose = () => {
        cleanup();
        resolve(null);
      };

      // Handle overlay click
      const handleOverlayClick = (e) => {
        if (e.target === overlay) {
          handleClose();
        }
      };

      // Cleanup function
      const cleanup = () => {
        overlay.classList.add('hidden');
        toneOptions.forEach(btn => btn.removeEventListener('click', handleToneSelect));
        closeBtn.removeEventListener('click', handleClose);
        overlay.removeEventListener('click', handleOverlayClick);
      };

      // Add event listeners
      toneOptions.forEach(btn => btn.addEventListener('click', handleToneSelect));
      closeBtn.addEventListener('click', handleClose);
      overlay.addEventListener('click', handleOverlayClick);
    });
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
        <div class="suggestions-loading">
          <div class="suggestions-loading-spinner"></div>
          <p class="suggestions-loading-text">${message}</p>
        </div>
      `;
    }
  }

  displaySuggestions(suggestions) {
    const content = document.getElementById('suggestionsContent');
    if (!content) {
      console.error('suggestionsContent element not found');
      return;
    }

    console.log('displaySuggestions called with:', suggestions);

    if (!suggestions || suggestions.length === 0) {
      console.log('No suggestions to display');
      content.innerHTML = `
        <div class="placeholder">
          <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <p>No suggestions found</p>
        </div>
      `;
      return;
    }

    content.innerHTML = suggestions.map((suggestion, index) => {
      // Determine if this is an actionable suggestion
      const isActionable = suggestion.type === 'Improved Version' ||
        suggestion.type.includes('Tone') ||
        suggestion.type === 'Rewritten';

      return `
        <div class="suggestion-item" data-index="${index}" data-type="${this.escapeHtml(suggestion.type)}">
          <div class="suggestion-header">
            <div class="suggestion-type">${this.escapeHtml(suggestion.type)}</div>
          </div>
          <div class="suggestion-text">${this.escapeHtml(suggestion.text)}</div>
          <div class="suggestion-actions">
            ${isActionable ? `
              <button class="suggestion-btn apply" data-action="apply" data-index="${index}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Apply</span>
              </button>
            ` : ''}
            <button class="suggestion-btn copy" data-action="copy" data-index="${index}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Copy</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Add event listeners to buttons
    content.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.index);
        this.handleSuggestionAction(action, suggestions[index], index);
      });
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  initializeProofreaderHighlights() {
    // Initialize CSS Highlights API for error highlighting
    if (!CSS.highlights) {
      console.warn('CSS Highlights API not supported');
      return false;
    }

    this.errorHighlights = {
      spelling: new Highlight(),
      punctuation: new Highlight(),
      capitalization: new Highlight(),
      grammar: new Highlight(),
      preposition: new Highlight(),           // New type from official demo
      'missing-words': new Highlight(),       // New type from official demo
      deletion: new Highlight(),
      addition: new Highlight(),
      info: new Highlight(),
      other: new Highlight()
    };

    for (const type in this.errorHighlights) {
      CSS.highlights.set(type, this.errorHighlights[type]);
    }

    return true;
  }

  getCursorPosition(element) {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  setCursorPosition(element, offset) {
    const textNode = element.firstChild;
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

    const range = document.createRange();
    const selection = window.getSelection();

    try {
      const safeOffset = Math.min(offset, textNode.length);
      range.setStart(textNode, safeOffset);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } catch (error) {
      console.error('Error setting cursor position:', error);
    }
  }

  clearErrorHighlights() {
    if (!this.errorHighlights) return;

    for (const type in this.errorHighlights) {
      this.errorHighlights[type].clear();
    }
  }

  applyErrorHighlights(corrections, text) {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea) {
      console.error('Editor area not found');
      return;
    }

    console.log('=== Applying Error Highlights ===');
    console.log('Corrections:', corrections);
    console.log('Text length:', text.length);
    console.log('Editor content:', editorArea.textContent);

    // Initialize highlights if needed
    if (!this.errorHighlights) {
      console.log('Initializing highlights...');
      if (!this.initializeProofreaderHighlights()) {
        console.error('Cannot apply highlights - CSS Highlights API not available');
        return;
      }
      console.log('Highlights initialized:', Object.keys(this.errorHighlights));
    }

    // Clear previous highlights
    this.clearErrorHighlights();
    console.log('Previous highlights cleared');

    // For CSS Highlights API, we need to work with the existing text nodes
    // Don't recreate if we can avoid it to preserve formatting
    console.log('Getting text nodes for highlights');
    const currentText = editorArea.innerText || editorArea.textContent;

    // Check if we have a simple text node structure
    let textNode = null;
    if (editorArea.childNodes.length === 1 && editorArea.firstChild.nodeType === Node.TEXT_NODE) {
      // Simple case: single text node
      textNode = editorArea.firstChild;
      console.log('Using existing text node');
    } else {
      // Complex structure or no text node - need to normalize
      console.log('Normalizing editor content, childNodes:', editorArea.childNodes.length);
      // Save cursor position
      const selection = window.getSelection();
      const cursorOffset = selection.rangeCount > 0 ? this.getCursorPosition(editorArea) : 0;

      // Recreate preserving line breaks
      editorArea.innerHTML = '';
      textNode = document.createTextNode(currentText);
      editorArea.appendChild(textNode);

      // Restore cursor position
      if (cursorOffset > 0) {
        this.setCursorPosition(editorArea, cursorOffset);
      }
    }

    console.log('Text node created:', {
      nodeType: textNode.nodeType,
      length: textNode.length,
      content: textNode.textContent.substring(0, 100)
    });

    // Apply highlights for each correction
    let highlightsApplied = 0;
    for (const correction of corrections) {
      try {
        const range = new Range();
        range.setStart(textNode, correction.startIndex);
        range.setEnd(textNode, correction.endIndex);

        const type = correction.type || 'other';
        const highlightedText = currentText.substring(correction.startIndex, correction.endIndex);

        console.log(`Applying ${type} highlight:`, {
          start: correction.startIndex,
          end: correction.endIndex,
          text: highlightedText,
          suggestion: correction.suggestion
        });

        if (this.errorHighlights[type]) {
          this.errorHighlights[type].add(range);
          highlightsApplied++;
          console.log(`✓ Highlight added to ${type}`);
        } else {
          console.error('No highlight registry for type:', type);
        }
      } catch (error) {
        console.error('Error applying highlight:', error, correction);
      }
    }

    console.log(`=== Applied ${highlightsApplied}/${corrections.length} highlights ===`);

    // Verify highlights were added
    for (const type in this.errorHighlights) {
      const size = this.errorHighlights[type].size;
      if (size > 0) {
        console.log(`${type}: ${size} ranges`);
      }
    }

    // Mark editor as proofreading mode
    editorArea.dataset.proofreading = 'true';

    // Add click handler for showing popover
    this.setupProofreadingPopover(editorArea, corrections);
  }

  /**
   * Apply error highlights to rich text (contenteditable with HTML formatting)
   * This preserves the HTML structure while highlighting errors
   */
  applyErrorHighlightsRichText(editorArea, corrections) {
    if (!editorArea || !this.richTextProofreader) {
      console.error('Cannot apply rich text highlights - missing dependencies');
      return;
    }

    console.log('=== Applying Rich Text Error Highlights ===');
    console.log('Corrections:', corrections);

    // Initialize highlights if needed
    if (!this.errorHighlights) {
      console.log('Initializing highlights...');
      if (!this.initializeProofreaderHighlights()) {
        console.error('Cannot apply highlights - CSS Highlights API not available');
        return;
      }
    }

    // Clear previous highlights
    this.clearErrorHighlights();

    // Create highlight ranges using the rich text proofreader
    // This maps plain text positions to DOM nodes
    const highlightRanges = this.richTextProofreader.createHighlightRanges(editorArea, corrections);

    console.log(`Created ${highlightRanges.length} highlight ranges`);

    // Apply highlights for each range
    let highlightsApplied = 0;
    for (const { range, correction } of highlightRanges) {
      try {
        const type = correction.type || 'other';

        console.log(`Applying ${type} highlight:`, {
          start: correction.startIndex,
          end: correction.endIndex,
          original: correction.original,
          suggestion: correction.suggestion
        });

        if (this.errorHighlights[type]) {
          this.errorHighlights[type].add(range);
          highlightsApplied++;
        } else {
          console.warn(`Unknown highlight type: ${type}`);
        }
      } catch (error) {
        console.error('Failed to apply highlight:', error, correction);
      }
    }

    console.log(`Applied ${highlightsApplied}/${corrections.length} highlights to rich text`);

    // Mark editor as proofreading mode
    editorArea.dataset.proofreading = 'true';

    // Add click handler for showing popover
    this.setupProofreadingPopover(editorArea, corrections);
  }

  setupProofreadingPopover(editorArea, corrections) {
    const popover = document.getElementById('proofreadPopover');
    const popoverErrorType = document.getElementById('popoverErrorType');
    const popoverExplanation = document.getElementById('popoverExplanation');
    const popoverCorrectionBtn = document.getElementById('popoverCorrectionBtn');

    if (!popover || !popoverErrorType || !popoverCorrectionBtn) {
      console.warn('Popover elements not found');
      return;
    }

    // Remove old listeners
    if (this.proofreadClickHandler) {
      editorArea.removeEventListener('click', this.proofreadClickHandler);
    }

    // Add new click handler
    this.proofreadClickHandler = (e) => {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorArea);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      const caretPosition = preCaretRange.toString().length;

      // Find correction at caret position
      const correction = corrections.find(
        c => c.startIndex <= caretPosition && caretPosition <= c.endIndex
      );

      if (!correction) {
        popover.hidePopover();
        return;
      }

      // Update popover content
      const typeLabel = correction.type.charAt(0).toUpperCase() + correction.type.slice(1);
      popoverErrorType.textContent = typeLabel;

      // Show explanation if available
      if (popoverExplanation) {
        popoverExplanation.textContent = correction.explanation || '';
        popoverExplanation.style.display = correction.explanation ? 'block' : 'none';
      }

      popoverCorrectionBtn.textContent = correction.suggestion || '[Remove]';

      // Position popover near the error
      const rect = range.getBoundingClientRect();
      const editorRect = editorArea.getBoundingClientRect();
      popover.style.top = `${rect.bottom - editorRect.top + 5}px`;
      popover.style.left = `${rect.left - editorRect.left}px`;

      // Show popover
      popover.showPopover();

      // Set up correction button click handler
      popoverCorrectionBtn.onclick = () => {
        this.applyPopoverCorrection(correction);
        popover.hidePopover();
      };
    };

    editorArea.addEventListener('click', this.proofreadClickHandler);
    editorArea.addEventListener('keyup', this.proofreadClickHandler);
  }

  applyPopoverCorrection(correction) {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea) return;

    const currentText = editorArea.textContent;
    const before = currentText.substring(0, correction.startIndex);
    const after = currentText.substring(correction.endIndex);
    const newText = before + correction.suggestion + after;

    editorArea.textContent = newText;
    this.editorContent = editorArea.innerHTML;
    this.updateEditorStats();
    this.autoSaveContent();

    // Remove this correction and reapply highlights
    this.currentCorrections = this.currentCorrections.filter(c => c !== correction);

    if (this.currentCorrections.length === 0) {
      this.clearErrorHighlights();
      editorArea.dataset.proofreading = 'false';
      this.displaySuggestions([{
        type: 'Success',
        text: '✓ All corrections applied!'
      }]);
      setTimeout(() => this.hideSuggestionsPanel(), 1500);
    } else {
      this.applyErrorHighlights(this.currentCorrections, newText);
      this.displayProofreadingResults(this.correctedText, this.currentCorrections.length);
    }

    this.showSuccess('Correction applied!');
  }

  displayProofreadingResults(correctedText, errorCount) {
    const content = document.getElementById('suggestionsContent');
    if (!content) return;

    // Check if this is a full replacement correction
    const isFullReplacement = this.currentCorrections.length === 1 &&
      this.currentCorrections[0].explanation?.includes('full replacement');

    const instructionsHtml = isFullReplacement ? `
      <div class="proofreader-instructions">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        AI has suggested a corrected version of your text
      </div>
      <div class="corrected-text-preview">
        <div class="preview-label">Suggested correction:</div>
        <div class="preview-text">${this.escapeHtml(correctedText)}</div>
      </div>
    ` : `
      <div class="proofreader-instructions">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 16v-4M12 8v.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Click on underlined text to see and apply corrections
      </div>

      <div class="error-legend">
        <div class="legend-item">
          <div class="legend-color spelling"></div>
          <span>Spelling</span>
        </div>
        <div class="legend-item">
          <div class="legend-color grammar"></div>
          <span>Grammar</span>
        </div>
        <div class="legend-item">
          <div class="legend-color punctuation"></div>
          <span>Punctuation</span>
        </div>
        <div class="legend-item">
          <div class="legend-color capitalization"></div>
          <span>Capitalization</span>
        </div>
        <div class="legend-item">
          <div class="legend-color other"></div>
          <span>Other</span>
        </div>
      </div>`;

    const html = instructionsHtml + `
      <div class="corrected-text-display">
        <h4>${isFullReplacement ? 'Suggested Text' : `Corrected Text (${errorCount} issue${errorCount !== 1 ? 's' : ''} found)`}</h4>
        ${isFullReplacement ? '' : `<div class="corrected-text">${this.escapeHtml(correctedText)}</div>`}
      </div>

      <div class="apply-all-container">
        <button class="suggestion-btn apply-all" id="applyAllCorrectionsBtn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Apply All Corrections</span>
        </button>
      </div>
    `;

    content.innerHTML = html;

    // Add event listener for apply all button
    const applyAllBtn = document.getElementById('applyAllCorrectionsBtn');
    if (applyAllBtn) {
      applyAllBtn.addEventListener('click', () => this.applyAllCorrectionsFromProofreader());
    }
  }

  applyAllCorrectionsFromProofreader() {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea || !this.currentCorrections || this.currentCorrections.length === 0) return;

    console.log('Applying all corrections to rich text...');

    // Use rich text proofreader to apply corrections while preserving formatting
    if (this.richTextProofreader) {
      const appliedCount = this.richTextProofreader.applyAllCorrections(editorArea, this.currentCorrections);
      console.log(`Applied ${appliedCount} corrections to rich text`);
    } else {
      // Fallback: replace with plain corrected text (loses formatting)
      console.warn('Rich text proofreader not available, using fallback');
      editorArea.textContent = this.correctedText;
    }

    // Update state
    this.editorContent = editorArea.innerHTML;
    this.updateEditorStats();
    this.autoSaveContent();

    // Clear highlights and corrections
    this.clearErrorHighlights();
    this.currentCorrections = [];
    editorArea.dataset.proofreading = 'false';

    this.displaySuggestions([{
      type: 'Success',
      text: '✓ All corrections applied!'
    }]);

    this.showSuccess('All corrections applied!');
    setTimeout(() => this.hideSuggestionsPanel(), 1500);
  }

  displayCorrectionsWithActions(corrections, originalText) {
    const content = document.getElementById('suggestionsContent');
    if (!content) return;

    const correctionItems = corrections.map((correction, index) => {
      const typeLabel = correction.type === 'correction' ? 'Grammar' :
        correction.type === 'addition' ? 'Addition' :
          correction.type === 'deletion' ? 'Deletion' :
            correction.type.charAt(0).toUpperCase() + correction.type.slice(1);

      return `
        <div class="suggestion-item correction-item" data-index="${index}">
          <div class="suggestion-header">
            <div class="suggestion-type">${typeLabel}</div>
          </div>
          <div class="correction-content">
            ${correction.original ? `<div class="correction-original">"${this.escapeHtml(correction.original)}"</div>` : ''}
            ${correction.suggestion ? `<div class="correction-arrow">→</div>` : ''}
            ${correction.suggestion ? `<div class="correction-suggestion">"${this.escapeHtml(correction.suggestion)}"</div>` : ''}
            ${correction.explanation ? `<div class="correction-explanation">${this.escapeHtml(correction.explanation)}</div>` : ''}
          </div>
          <div class="suggestion-actions">
            <button class="suggestion-btn apply" data-action="apply-correction" data-index="${index}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Apply</span>
            </button>
            <button class="suggestion-btn ignore" data-action="ignore" data-index="${index}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <span>Ignore</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    const applyAllButton = corrections.length > 1 ? `
      <div class="apply-all-container">
        <button class="suggestion-btn apply-all" data-action="apply-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Apply All Corrections</span>
        </button>
      </div>
    ` : '';

    content.innerHTML = applyAllButton + correctionItems;

    // Add event listeners
    content.querySelectorAll('.suggestion-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const index = btn.dataset.index ? parseInt(btn.dataset.index) : null;

        if (action === 'apply-all') {
          this.applyAllCorrections();
        } else if (action === 'apply-correction' && index !== null) {
          this.applySingleCorrection(index);
        } else if (action === 'ignore' && index !== null) {
          this.ignoreCorrection(index);
        }
      });
    });
  }

  applySingleCorrection(index) {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea || !this.currentCorrections) return;

    const correction = this.currentCorrections[index];
    const currentText = editorArea.textContent;

    // Apply the single correction
    const before = currentText.substring(0, correction.startIndex);
    const after = currentText.substring(correction.endIndex);
    const newText = before + correction.suggestion + after;

    editorArea.textContent = newText;
    this.editorContent = editorArea.innerHTML;
    this.updateEditorStats();
    this.autoSaveContent();

    // Remove this correction from the list
    this.currentCorrections.splice(index, 1);

    // Update display
    if (this.currentCorrections.length === 0) {
      this.displaySuggestions([{
        type: 'Success',
        text: '✓ All corrections applied!'
      }]);
      setTimeout(() => this.hideSuggestionsPanel(), 1500);
    } else {
      this.displayCorrectionsWithActions(this.currentCorrections, newText);
    }

    this.showSuccess('Correction applied!');
  }

  applyAllCorrections() {
    const editorArea = document.getElementById('editorArea');
    if (!editorArea || !this.correctedText) return;

    editorArea.textContent = this.correctedText;
    this.editorContent = editorArea.innerHTML;
    this.updateEditorStats();
    this.autoSaveContent();

    this.displaySuggestions([{
      type: 'Success',
      text: '✓ All corrections applied!'
    }]);

    this.showSuccess('All corrections applied!');
    setTimeout(() => this.hideSuggestionsPanel(), 1500);
  }

  ignoreCorrection(index) {
    if (!this.currentCorrections) return;

    this.currentCorrections.splice(index, 1);

    if (this.currentCorrections.length === 0) {
      this.displaySuggestions([{
        type: 'Success',
        text: '✓ No more corrections!'
      }]);
      setTimeout(() => this.hideSuggestionsPanel(), 1500);
    } else {
      const editorArea = document.getElementById('editorArea');
      const currentText = editorArea ? editorArea.textContent : '';
      this.displayCorrectionsWithActions(this.currentCorrections, currentText);
    }
  }

  handleSuggestionAction(action, suggestion, index) {
    // Add index to suggestion for button feedback
    suggestion.index = index;

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

      // Show success state in suggestions panel
      this.showSuccessState();

      // Show toast notification
      this.showSuccess('Changes applied successfully!');

      // Close suggestions panel after a moment
      setTimeout(() => {
        this.hideSuggestionsPanel();
      }, 1500);
    } else {
      // For other suggestions, just copy to clipboard
      this.copySuggestion(suggestion);
    }
  }

  showSuccessState() {
    const content = document.getElementById('suggestionsContent');
    if (content) {
      content.innerHTML = `
        <div class="suggestions-success">
          <svg class="suggestions-success-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
            <path d="M8 12l3 3 5-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <p class="suggestions-success-text">Applied successfully!</p>
        </div>
      `;
    }
  }

  copySuggestion(suggestion) {
    navigator.clipboard.writeText(suggestion.text).then(() => {
      this.showSuccess('Copied to clipboard!');

      // Add visual feedback to the button that was clicked
      const buttons = document.querySelectorAll('.suggestion-btn.copy');
      buttons.forEach(btn => {
        if (btn.dataset.index === suggestion.index) {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Copied!</span>
          `;
          btn.style.background = 'var(--color-success-bg)';
          btn.style.color = 'var(--color-success)';
          btn.style.borderColor = 'var(--color-success)';

          setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
          }, 2000);
        }
      });
    }).catch(error => {
      console.error('Failed to copy:', error);
      this.showError('Failed to copy suggestion');
    });
  }

  showSuccessFeedback(message) {
    // Use the toast notification system
    this.showSuccess(message);
  }

  // ===== Translator Methods =====

  async initializeTranslator() {
    console.log('=== Initializing Translator ===');

    // Update character count
    this.updateSourceCharCount();

    // Load saved language preferences
    await this.loadTranslationLanguages();

    // Load translator settings
    await this.loadTranslatorSettings();

    // Set up event listeners for quick translate
    this.updateTranslatorEventListeners();

    console.log('=== Translator Initialized ===');
    console.log('Settings:', this.translatorSettings);
    console.log('Languages:', this.sourceLanguage, '→', this.targetLanguage);
  }

  async loadTranslatorSettings() {
    try {
      const settings = await chrome.storage.local.get(['translatorSettings']);

      if (settings.translatorSettings) {
        this.translatorSettings = {
          ...this.translatorSettings,
          ...settings.translatorSettings
        };
      }

      // Update UI checkboxes
      const doubleClickCheckbox = document.getElementById('doubleClickTranslate');
      const shiftClickCheckbox = document.getElementById('shiftClickTranslate');

      if (doubleClickCheckbox) {
        doubleClickCheckbox.checked = this.translatorSettings.doubleClickTranslate;
      }

      if (shiftClickCheckbox) {
        shiftClickCheckbox.checked = this.translatorSettings.shiftClickTranslate;
      }

      console.log('Loaded translator settings:', this.translatorSettings);
    } catch (error) {
      console.error('Failed to load translator settings:', error);
    }
  }

  async saveTranslatorSettings() {
    try {
      await chrome.storage.local.set({
        translatorSettings: this.translatorSettings
      });

      console.log('Saved translator settings:', this.translatorSettings);
    } catch (error) {
      console.error('Failed to save translator settings:', error);
    }
  }

  openTranslatorSettings() {
    const overlay = document.getElementById('translatorSettingsOverlay');
    if (overlay) {
      overlay.classList.remove('hidden');

      // Add click outside to close
      const handleOverlayClick = (e) => {
        if (e.target === overlay) {
          this.closeTranslatorSettings();
          overlay.removeEventListener('click', handleOverlayClick);
        }
      };
      overlay.addEventListener('click', handleOverlayClick);
    }
  }

  closeTranslatorSettings() {
    const overlay = document.getElementById('translatorSettingsOverlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  updateTranslatorEventListeners() {
    const sourceText = document.getElementById('sourceText');
    if (!sourceText) {
      console.warn('sourceText element not found for translator event listeners');
      return;
    }

    console.log('Updating translator event listeners:', this.translatorSettings);

    // Remove existing listeners
    if (this.translatorDoubleClickHandler) {
      sourceText.removeEventListener('dblclick', this.translatorDoubleClickHandler);
      this.translatorDoubleClickHandler = null;
    }
    if (this.translatorShiftClickHandler) {
      sourceText.removeEventListener('click', this.translatorShiftClickHandler);
      this.translatorShiftClickHandler = null;
    }

    // Add new listeners based on settings
    if (this.translatorSettings.doubleClickTranslate) {
      this.translatorDoubleClickHandler = (e) => this.handleQuickTranslate(e, 'doubleclick');
      sourceText.addEventListener('dblclick', this.translatorDoubleClickHandler);
      console.log('✓ Double-click translator enabled');
    }

    if (this.translatorSettings.shiftClickTranslate) {
      this.translatorShiftClickHandler = (e) => {
        if (e.shiftKey) {
          this.handleQuickTranslate(e, 'shiftclick');
        }
      };
      sourceText.addEventListener('click', this.translatorShiftClickHandler);
      console.log('✓ Shift+click translator enabled');
    }
  }

  async handleQuickTranslate(e, triggerType) {
    console.log(`Quick translate triggered: ${triggerType}`);

    const sourceText = document.getElementById('sourceText');
    if (!sourceText) {
      console.error('sourceText element not found');
      return;
    }

    // Get the word at cursor position
    const cursorPos = sourceText.selectionStart;
    const text = sourceText.value;

    if (!text || text.trim() === '') {
      this.showInfo('No text to translate');
      return;
    }

    // Find word boundaries
    let start = cursorPos;
    let end = cursorPos;

    // Move start back to beginning of word (including letters, numbers, and some punctuation)
    while (start > 0 && /[^\s]/.test(text[start - 1])) {
      start--;
    }

    // Move end forward to end of word
    while (end < text.length && /[^\s]/.test(text[end])) {
      end++;
    }

    const word = text.substring(start, end).trim();

    if (!word) {
      this.showInfo('No word selected');
      return;
    }

    console.log(`Translating word: "${word}"`);

    // Select the word for visual feedback
    sourceText.setSelectionRange(start, end);

    try {
      // Check if AI manager is available
      if (!this.aiManager) {
        this.showError('AI features not initialized');
        return;
      }

      // Detect language if auto
      let sourceLanguage = this.sourceLanguage;
      if (sourceLanguage === 'auto') {
        if (this.aiManager.isAPIAvailable('languageDetector')) {
          try {
            const detection = await this.aiManager.detectLanguage(word);
            if (detection && detection.language) {
              sourceLanguage = detection.language;
              console.log(`Detected language: ${sourceLanguage}`);
            } else {
              sourceLanguage = 'en';
            }
          } catch (detectionError) {
            console.warn('Language detection failed:', detectionError);
            sourceLanguage = 'en';
          }
        } else {
          console.warn('Language detector not available, defaulting to English');
          sourceLanguage = 'en';
        }
      }

      // Check if translator is available
      if (!this.aiManager.isAPIAvailable('translator')) {
        this.showError('Translator API not available');
        return;
      }

      // Translate the word
      console.log(`Translating from ${sourceLanguage} to ${this.targetLanguage}`);
      const translated = await this.aiManager.translate(word, sourceLanguage, this.targetLanguage);

      if (translated) {
        // Show translation in a tooltip-like notification
        this.showSuccess(`"${word}" → "${translated}"`);
        console.log(`Translation successful: "${word}" → "${translated}"`);
      } else {
        this.showError('Translation returned empty result');
      }

    } catch (error) {
      console.error('Quick translate failed:', error);
      this.showError(`Translation failed: ${error.message || 'Unknown error'}`);
    }
  }

  async loadTranslationLanguages() {
    try {
      const settings = await chrome.storage.local.get(['translationFromLang', 'translationToLang']);

      if (settings.translationFromLang) {
        this.sourceLanguage = settings.translationFromLang;
        const sourceSelect = document.getElementById('sourceLanguage');
        if (sourceSelect) {
          sourceSelect.value = this.sourceLanguage;
        }
      }

      if (settings.translationToLang) {
        this.targetLanguage = settings.translationToLang;
        const targetSelect = document.getElementById('targetLanguage');
        if (targetSelect) {
          targetSelect.value = this.targetLanguage;
        }
      }

      console.log('Loaded translation languages:', this.sourceLanguage, '→', this.targetLanguage);
    } catch (error) {
      console.error('Failed to load translation languages:', error);
    }
  }

  async saveTranslationLanguages() {
    try {
      await chrome.storage.local.set({
        translationFromLang: this.sourceLanguage,
        translationToLang: this.targetLanguage
      });

      console.log('Saved translation languages:', this.sourceLanguage, '→', this.targetLanguage);
    } catch (error) {
      console.error('Failed to save translation languages:', error);
    }
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
      const tempText = sourceText.value;
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
      // Update to stop icon (square)
      recordIcon.innerHTML = '<rect x="8" y="8" width="8" height="8" rx="1" fill="currentColor" />';
      recordText.textContent = 'Stop Recording';
    } else {
      recordBtn.className = 'record-btn';
      // Update to record icon (circle)
      recordIcon.innerHTML = '<circle cx="12" cy="12" r="4" fill="currentColor" />';
      recordText.textContent = 'Start Recording';
    }
  }

  updateRecordingStatus() {
    const recordingStatus = document.getElementById('recordingStatus');
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.querySelector('.status-text');

    if (this.isRecording) {
      recordingStatus?.classList.add('active');
      statusDot.className = 'status-dot recording';
      statusText.textContent = 'Recording in progress';
    } else {
      recordingStatus?.classList.remove('active');
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

      // Switch to analysis tab
      this.switchMeetingTab('analysis');

      if (!this.meetingAI) {
        throw new Error('Meeting AI features not initialized');
      }

      // Show loading state
      this.showAnalysisLoading();

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

  showAnalysisLoading() {
    // Hide empty state
    const emptyState = document.getElementById('analysisEmptyState');
    if (emptyState) emptyState.style.display = 'none';

    // Show analysis cards
    const analysisCards = document.getElementById('analysisCards');
    if (analysisCards) analysisCards.style.display = 'block';

    // Show loading states
    document.getElementById('executiveSummary').innerHTML = '<p class="md-loading-text">Generating summary...</p>';
    document.getElementById('actionItems').innerHTML = '<p class="md-loading-text">Extracting action items...</p>';
    document.getElementById('keyDecisions').innerHTML = '<p class="md-loading-text">Identifying key decisions...</p>';
    document.getElementById('emailDraft').innerHTML = '<p class="md-loading-text">Generating follow-up email...</p>';
  }

  displayAnalysis(analysis) {
    // Hide empty state and show cards
    const emptyState = document.getElementById('analysisEmptyState');
    if (emptyState) emptyState.style.display = 'none';

    const analysisCards = document.getElementById('analysisCards');
    if (analysisCards) analysisCards.style.display = 'block';

    // Display executive summary
    const summaryElement = document.getElementById('executiveSummary');
    summaryElement.innerHTML = `<p>${analysis.executiveSummary || 'No summary available'}</p>`;

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
    emailElement.innerHTML = `<pre>${analysis.followUpEmail || 'No email draft available'}</pre>`;
  }

  clearTranscript() {
    if (this.isRecording) {
      this.showError('Cannot clear transcript while recording');
      return;
    }

    if (confirm('Are you sure you want to clear the transcript?')) {
      this.transcript = [];
      this.updateTranscript();

      // Reset analysis view to empty state
      this.resetAnalysisView();

      // Switch back to transcript tab
      this.switchMeetingTab('transcript');

      console.log('Transcript cleared');
    }
  }

  resetAnalysisView() {
    // Show empty state
    const emptyState = document.getElementById('analysisEmptyState');
    if (emptyState) emptyState.style.display = 'flex';

    // Hide analysis cards
    const analysisCards = document.getElementById('analysisCards');
    if (analysisCards) analysisCards.style.display = 'none';
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
    const analysisTab = document.getElementById('analysisTab');
    if (analysisTab.style.display === 'none') {
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
      case 'themeChanged':
        // Sync theme change from other extension pages
        if (message.theme) {
          this.applyTheme(message.theme);
        }
        sendResponse({ success: true });
        break;

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
    // Use the Material Design toast system from ui-components
    if (typeof createToast !== 'undefined') {
      createToast({
        title: title,
        message: message,
        type: type,
        duration: type === 'error' ? 5000 : 4000
      });
    } else {
      // Fallback to console if createToast is not available
      console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
    }
  }
}

// Initialize sidepanel when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const sidepanel = new IntelliPenSidepanel();
  sidepanel.initialize();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntelliPenSidepanel };
}