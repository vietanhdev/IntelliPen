/**
 * Writing Intelligence Module
 * Exports all writing intelligence components
 */

import WritingIntelligenceEngine from './WritingIntelligenceEngine.js';
import TextAnalysisPipeline from './TextAnalysisPipeline.js';
import ContextAnalyzer from './ContextAnalyzer.js';
import SuggestionApplicationManager from './SuggestionApplicationManager.js';
import UserPreferenceLearning from './UserPreferenceLearning.js';
import { WritingAnalysis, Suggestion } from './models/WritingAnalysis.js';

// UI Components
import { SuggestionOverlay, KeyboardNavigationManager, AnimationManager } from './ui/index.js';

export {
  WritingIntelligenceEngine,
  TextAnalysisPipeline,
  ContextAnalyzer,
  SuggestionApplicationManager,
  UserPreferenceLearning,
  WritingAnalysis,
  Suggestion,
  SuggestionOverlay,
  KeyboardNavigationManager,
  AnimationManager
};

export default WritingIntelligenceEngine;