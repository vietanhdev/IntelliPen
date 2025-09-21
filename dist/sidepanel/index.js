var IntelliPenSidepanel = (function () {
	'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var sidepanel = {exports: {}};

	/**
	 * IntelliPen Sidepanel Interface
	 * Meeting dashboard with transcript display and analysis
	 */

	(function (module) {
		class IntelliPenSidepanel {
		  constructor() {
		    this.isRecording = false;
		    this.currentSession = null;
		    this.transcript = [];
		    this.recordingStartTime = null;
		    this.durationInterval = null;
		    this.isInitialized = false;
		  }

		  async initialize() {
		    if (this.isInitialized) return;

		    console.log('IntelliPen Sidepanel: Initializing...');
		    
		    try {
		      // Set up event listeners
		      this.setupEventListeners();
		      
		      // Load any existing session
		      await this.loadExistingSession();
		      
		      // Update UI
		      this.updateUI();
		      
		      this.isInitialized = true;
		      console.log('IntelliPen Sidepanel: Initialized successfully');
		      
		    } catch (error) {
		      console.error('IntelliPen Sidepanel: Failed to initialize:', error);
		      this.showError('Failed to initialize meeting dashboard');
		    }
		  }

		  setupEventListeners() {
		    // Recording controls
		    document.getElementById('recordBtn').addEventListener('click', () => {
		      this.toggleRecording();
		    });

		    // Transcript controls
		    document.getElementById('clearTranscript').addEventListener('click', () => {
		      this.clearTranscript();
		    });

		    document.getElementById('exportTranscript').addEventListener('click', () => {
		      this.exportTranscript();
		    });

		    // Analysis controls
		    document.getElementById('regenerateAnalysis').addEventListener('click', () => {
		      this.regenerateAnalysis();
		    });

		    document.getElementById('exportAnalysis').addEventListener('click', () => {
		      this.exportAnalysis();
		    });

		    // Email actions
		    document.getElementById('copyEmail').addEventListener('click', () => {
		      this.copyEmailDraft();
		    });

		    document.getElementById('editEmail').addEventListener('click', () => {
		      this.editEmailDraft();
		    });

		    // Minimize button
		    document.getElementById('minimizeBtn').addEventListener('click', () => {
		      this.minimizePanel();
		    });

		    // Listen for messages from background script
		    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		      this.handleMessage(message, sender, sendResponse);
		      return true;
		    });
		  }

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
		      
		      // Request microphone permission
		      const stream = await navigator.mediaDevices.getUserMedia({ 
		        audio: {
		          echoCancellation: true,
		          noiseSuppression: true,
		          sampleRate: 16000
		        }
		      });

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

		      // Start audio processing (placeholder for now)
		      this.startAudioProcessing(stream);

		      // Update UI
		      this.updateUI();
		      
		      console.log('Recording started successfully');
		      
		    } catch (error) {
		      console.error('Failed to start recording:', error);
		      this.showError('Failed to start recording. Please check microphone permissions.');
		    }
		  }

		  async stopRecording() {
		    try {
		      console.log('Stopping recording...');
		      
		      this.isRecording = false;
		      this.stopDurationTimer();

		      // Stop audio processing
		      this.stopAudioProcessing();

		      // Generate meeting analysis
		      if (this.transcript.length > 0) {
		        await this.generateMeetingAnalysis();
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
		    // Placeholder for audio processing
		    // This will be implemented in later tasks with actual Chrome AI API integration
		    console.log('Audio processing started (placeholder)');
		    
		    // Simulate transcript updates for demo purposes
		    this.simulateTranscriptUpdates();
		  }

		  stopAudioProcessing() {
		    // Placeholder for stopping audio processing
		    console.log('Audio processing stopped (placeholder)');
		  }

		  simulateTranscriptUpdates() {
		    // This is just for demo purposes - will be replaced with real transcription
		    if (!this.isRecording) return;

		    const sampleTexts = [
		      "Welcome everyone to today's meeting.",
		      "Let's start by reviewing the agenda.",
		      "The first item is the project status update.",
		      "We need to discuss the timeline for the next phase.",
		      "Are there any questions about the requirements?"
		    ];

		    let textIndex = 0;
		    const interval = setInterval(() => {
		      if (!this.isRecording || textIndex >= sampleTexts.length) {
		        clearInterval(interval);
		        return;
		      }

		      this.addTranscriptEntry({
		        speaker: `Speaker ${Math.floor(Math.random() * 3) + 1}`,
		        text: sampleTexts[textIndex],
		        timestamp: Date.now(),
		        confidence: 0.95
		      });

		      textIndex++;
		    }, 3000);
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

		      // Generate analysis using background script
		      const response = await chrome.runtime.sendMessage({
		        type: 'GENERATE_MEETING_ANALYSIS',
		        data: {
		          sessionId: this.currentSession.id,
		          transcript: this.transcript
		        }
		      });

		      if (response?.success) {
		        this.displayAnalysis(response.data);
		      } else {
		        throw new Error('Failed to generate analysis');
		      }
		      
		    } catch (error) {
		      console.error('Failed to generate meeting analysis:', error);
		      this.showError('Failed to generate meeting analysis');
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

		  handleMessage(message, sender, sendResponse) {
		    switch (message.type) {
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

		  showError(message) {
		    console.error('Sidepanel Error:', message);
		    // Could implement toast notifications or error display
		    alert(message); // Temporary error display
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
