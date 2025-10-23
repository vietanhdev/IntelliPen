/**
 * Meeting AI Features
 * Implements AI-powered meeting transcription and analysis
 */

class MeetingAIFeatures {
  constructor(aiAPIManager) {
    this.aiManager = aiAPIManager;
    this.activeLanguageModel = null;
    this.activeSummarizer = null;
  }

  // Helper to clean JSON responses from markdown code blocks
  cleanJSONResponse(response) {
    if (typeof response !== 'string') {
      return response;
    }

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?```\s*$/, '');
    cleaned = cleaned.trim();

    return cleaned;
  }

  // ===== Meeting Analysis =====

  async analyzeMeeting(transcript) {
    try {
      console.log('Analyzing meeting with', transcript.length, 'entries');

      // Combine transcript into full text
      const fullTranscript = transcript.map(entry =>
        `${entry.speaker}: ${entry.text}`
      ).join('\n');

      // Generate all analysis components in parallel
      const [summary, actionItems, keyDecisions, followUpEmail] = await Promise.all([
        this.generateExecutiveSummary(fullTranscript),
        this.extractActionItems(fullTranscript),
        this.identifyKeyDecisions(fullTranscript),
        this.generateFollowUpEmail(fullTranscript)
      ]);

      return {
        success: true,
        executiveSummary: summary,
        actionItems: actionItems,
        keyDecisions: keyDecisions,
        followUpEmail: followUpEmail
      };
    } catch (error) {
      console.error('Meeting analysis failed:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.getFallbackAnalysis(transcript)
      };
    }
  }

  async generateExecutiveSummary(transcript) {
    try {
      // Check if Summarizer API is available
      if (!this.aiManager.isAPIAvailable('summarizer')) {
        throw new Error('Summarizer API not available');
      }

      const summary = await this.aiManager.summarize(transcript, {
        type: 'tldr',
        format: 'plain-text',
        length: 'medium',
        context: 'This is a meeting transcript. Provide a concise executive summary of the key points discussed.'
      });

      return summary;
    } catch (error) {
      console.error('Executive summary generation failed:', error);

      // Fallback to basic summary
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 20);
      return sentences.slice(0, 3).join('. ') + '.';
    }
  }

  async extractActionItems(transcript) {
    try {
      // Check if LanguageModel API is available
      if (!this.aiManager.isAPIAvailable('languageModel')) {
        throw new Error('LanguageModel API not available');
      }

      const prompt = `Analyze the following meeting transcript and extract action items. For each action item, identify the task and the person responsible (if mentioned).

Transcript:
${transcript}

Return the action items in this JSON format:
[
  {"task": "description", "owner": "person name or 'Unassigned'"},
  ...
]`;

      const response = await this.aiManager.prompt(prompt, {
        responseConstraint: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              task: { type: 'string' },
              owner: { type: 'string' }
            },
            required: ['task', 'owner']
          }
        }
      });

      const cleanedResponse = this.cleanJSONResponse(response);
      const actionItems = JSON.parse(cleanedResponse);
      return actionItems;
    } catch (error) {
      console.error('Action item extraction failed:', error);

      // Fallback: Look for action-oriented keywords
      return this.extractActionItemsFallback(transcript);
    }
  }

  extractActionItemsFallback(transcript) {
    const actionItems = [];
    const actionKeywords = ['will', 'should', 'need to', 'must', 'have to', 'going to', 'action item'];

    const sentences = transcript.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (actionKeywords.some(keyword => lowerSentence.includes(keyword))) {
        actionItems.push({
          task: sentence.trim(),
          owner: 'Unassigned'
        });
      }
    });

    return actionItems.slice(0, 5); // Limit to 5 items
  }

  async identifyKeyDecisions(transcript) {
    try {
      // Check if LanguageModel API is available
      if (!this.aiManager.isAPIAvailable('languageModel')) {
        throw new Error('LanguageModel API not available');
      }

      const prompt = `Analyze the following meeting transcript and identify key decisions that were made.

Transcript:
${transcript}

Return the key decisions as a JSON array of strings:
["decision 1", "decision 2", ...]`;

      const response = await this.aiManager.prompt(prompt, {
        responseConstraint: {
          type: 'array',
          items: { type: 'string' }
        }
      });

      const cleanedResponse = this.cleanJSONResponse(response);
      const decisions = JSON.parse(cleanedResponse);
      return decisions;
    } catch (error) {
      console.error('Key decision identification failed:', error);

      // Fallback: Look for decision-oriented keywords
      return this.identifyKeyDecisionsFallback(transcript);
    }
  }

  identifyKeyDecisionsFallback(transcript) {
    const decisions = [];
    const decisionKeywords = ['decided', 'agreed', 'approved', 'resolved', 'concluded', 'determined'];

    const sentences = transcript.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (decisionKeywords.some(keyword => lowerSentence.includes(keyword))) {
        decisions.push(sentence.trim());
      }
    });

    return decisions.slice(0, 5); // Limit to 5 decisions
  }

  async generateFollowUpEmail(transcript) {
    try {
      // Check if Writer API is available
      if (!this.aiManager.isAPIAvailable('writer')) {
        throw new Error('Writer API not available');
      }

      const prompt = `Based on the following meeting transcript, write a professional follow-up email summarizing the meeting.

Transcript:
${transcript}

The email should include:
- Brief summary of what was discussed
- Key decisions made
- Action items and next steps
- Professional closing`;

      const email = await this.aiManager.write(prompt, {
        tone: 'formal',
        format: 'plain-text',
        length: 'medium',
        context: 'This is a professional follow-up email after a business meeting.'
      });

      return email;
    } catch (error) {
      console.error('Follow-up email generation failed:', error);

      // Fallback: Basic email template
      return this.generateFollowUpEmailFallback(transcript);
    }
  }

  generateFollowUpEmailFallback(transcript) {
    const firstSentences = transcript.split(/[.!?]+/).slice(0, 3).join('. ');

    return `Subject: Meeting Follow-up

Dear Team,

Thank you for attending today's meeting. Here's a brief summary of what we discussed:

${firstSentences}.

Please review the attached meeting notes for full details. If you have any questions or concerns, please don't hesitate to reach out.

Best regards`;
  }

  getFallbackAnalysis(transcript) {
    const fullTranscript = transcript.map(entry =>
      `${entry.speaker}: ${entry.text}`
    ).join('\n');

    return {
      executiveSummary: 'Meeting analysis requires Chrome AI APIs. Please ensure APIs are enabled.',
      actionItems: this.extractActionItemsFallback(fullTranscript),
      keyDecisions: this.identifyKeyDecisionsFallback(fullTranscript),
      followUpEmail: this.generateFollowUpEmailFallback(fullTranscript)
    };
  }

  // ===== Speaker Identification =====

  async identifySpeakers(transcript) {
    try {
      // Use language model to identify and label speakers
      if (!this.aiManager.isAPIAvailable('languageModel')) {
        throw new Error('LanguageModel API not available');
      }

      const fullTranscript = transcript.map((entry, index) =>
        `[${index}] ${entry.text}`
      ).join('\n');

      const prompt = `Analyze this transcript and identify distinct speakers based on speaking patterns, topics, and context. Assign each segment to a speaker (e.g., "Speaker A", "Speaker B", etc.).

Transcript:
${fullTranscript}

Return a JSON array mapping segment indices to speaker labels:
[{"index": 0, "speaker": "Speaker A"}, ...]`;

      const response = await this.aiManager.prompt(prompt);
      const cleanedResponse = this.cleanJSONResponse(response);
      const speakerMap = JSON.parse(cleanedResponse);

      // Update transcript with identified speakers
      speakerMap.forEach(({ index, speaker }) => {
        if (transcript[index]) {
          transcript[index].speaker = speaker;
        }
      });

      return {
        success: true,
        transcript: transcript,
        speakerCount: new Set(speakerMap.map(s => s.speaker)).size
      };
    } catch (error) {
      console.error('Speaker identification failed:', error);
      return {
        success: false,
        error: error.message,
        transcript: transcript
      };
    }
  }

  // ===== Language Detection =====

  async detectMeetingLanguage(transcript) {
    try {
      // Get sample text from transcript
      const sampleText = transcript.slice(0, 3).map(entry => entry.text).join(' ');

      if (!this.aiManager.isAPIAvailable('languageDetector')) {
        throw new Error('LanguageDetector API not available');
      }

      const detection = await this.aiManager.detectLanguage(sampleText);

      return {
        success: true,
        language: detection.language,
        confidence: detection.confidence
      };
    } catch (error) {
      console.error('Language detection failed:', error);
      return {
        success: false,
        error: error.message,
        language: 'en' // Default to English
      };
    }
  }

  // ===== Meeting Summarization by Type =====

  async generateMeetingSummary(transcript, summaryType = 'tldr') {
    try {
      const fullTranscript = transcript.map(entry =>
        `${entry.speaker}: ${entry.text}`
      ).join('\n');

      if (!this.aiManager.isAPIAvailable('summarizer')) {
        throw new Error('Summarizer API not available');
      }

      const summary = await this.aiManager.summarize(fullTranscript, {
        type: summaryType, // 'tldr', 'key-points', 'teaser', 'headline'
        format: 'markdown',
        length: 'medium',
        context: 'This is a meeting transcript.'
      });

      return {
        success: true,
        summary: summary,
        type: summaryType
      };
    } catch (error) {
      console.error('Meeting summary generation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ===== Translation Support =====

  async translateTranscript(transcript, targetLanguage) {
    try {
      if (!this.aiManager.isAPIAvailable('translator')) {
        throw new Error('Translator API not available');
      }

      // Detect source language
      const sampleText = transcript[0]?.text || '';
      const detection = await this.aiManager.detectLanguage(sampleText);
      const sourceLanguage = detection?.language || 'en';

      // Translate each entry
      const translatedTranscript = [];
      for (const entry of transcript) {
        const translated = await this.aiManager.translate(
          entry.text,
          sourceLanguage,
          targetLanguage
        );

        translatedTranscript.push({
          ...entry,
          originalText: entry.text,
          text: translated
        });
      }

      return {
        success: true,
        transcript: translatedTranscript,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage
      };
    } catch (error) {
      console.error('Transcript translation failed:', error);
      return {
        success: false,
        error: error.message,
        transcript: transcript
      };
    }
  }

  // ===== Streaming Analysis =====

  async analyzeMeetingStreaming(transcript, onUpdate) {
    try {
      const fullTranscript = transcript.map(entry =>
        `${entry.speaker}: ${entry.text}`
      ).join('\n');

      // Stream executive summary
      onUpdate({ type: 'summary', status: 'generating' });
      const summary = await this.aiManager.summarizeStreaming(
        fullTranscript,
        {
          type: 'tldr',
          format: 'plain-text',
          length: 'medium'
        },
        (chunk) => onUpdate({ type: 'summary', content: chunk })
      );

      // Generate other components
      onUpdate({ type: 'actionItems', status: 'generating' });
      const actionItems = await this.extractActionItems(fullTranscript);
      onUpdate({ type: 'actionItems', content: actionItems });

      onUpdate({ type: 'decisions', status: 'generating' });
      const decisions = await this.identifyKeyDecisions(fullTranscript);
      onUpdate({ type: 'decisions', content: decisions });

      onUpdate({ type: 'email', status: 'generating' });
      const email = await this.generateFollowUpEmail(fullTranscript);
      onUpdate({ type: 'email', content: email });

      return {
        success: true,
        executiveSummary: summary,
        actionItems: actionItems,
        keyDecisions: decisions,
        followUpEmail: email
      };
    } catch (error) {
      console.error('Streaming meeting analysis failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MeetingAIFeatures };
}

// Make available globally
if (typeof self !== 'undefined') {
  self.MeetingAIFeatures = MeetingAIFeatures;
}
