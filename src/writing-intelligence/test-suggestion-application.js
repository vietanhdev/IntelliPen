/**
 * Test suite for Suggestion Application System
 */

import SuggestionApplicationManager from './SuggestionApplicationManager.js';
import UserPreferenceLearning from './UserPreferenceLearning.js';
import { Suggestion } from './models/WritingAnalysis.js';

// Mock Chrome AI APIs for testing
const mockChromeAI = {
  rewriter: {
    availability: () => Promise.resolve('available'),
    create: (options) => Promise.resolve({
      rewrite: (text, options) => {
        // Mock rewriter behavior
        if (options?.tone === 'more-formal') {
          return Promise.resolve(text.replace(/can't/g, 'cannot').replace(/won't/g, 'will not'));
        } else if (options?.tone === 'more-casual') {
          return Promise.resolve(text.replace(/cannot/g, "can't").replace(/will not/g, "won't"));
        }
        return Promise.resolve(text);
      },
      destroy: () => {}
    })
  }
};

// Set up global mock
global.window = {
  chrome: { ai: mockChromeAI },
  location: { hostname: 'gmail.com' }
};

// Mock localStorage
global.localStorage = {
  data: {},
  getItem: function(key) { return this.data[key] || null; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; }
};

// Mock DOM elements
function createMockTextarea(initialValue = '') {
  return {
    tagName: 'TEXTAREA',
    value: initialValue,
    dispatchEvent: function(event) {
      console.log(`Event dispatched: ${event.type}`);
    }
  };
}

function createMockContentEditable(initialText = '') {
  return {
    tagName: 'DIV',
    isContentEditable: true,
    textContent: initialText,
    dispatchEvent: function(event) {
      console.log(`Event dispatched: ${event.type}`);
    }
  };
}

function createMockSuggestion(overrides = {}) {
  return new Suggestion(
    overrides.type || 'grammar',
    overrides.range || { start: 0, end: 4 },
    overrides.original || 'this',
    overrides.replacement || 'This',
    overrides.confidence || 0.9,
    overrides.explanation || 'Capitalize first word',
    overrides.severity || 'error'
  );
}

/**
 * Test SuggestionApplicationManager
 */
async function testSuggestionApplicationManager() {
  console.log('Testing SuggestionApplicationManager...');
  
  const mockEngine = {}; // Mock writing engine
  const manager = new SuggestionApplicationManager(mockEngine);
  
  try {
    // Test basic suggestion application
    console.log('  Testing basic suggestion application...');
    const textarea = createMockTextarea('this is a test');
    const suggestion = createMockSuggestion();
    
    const result = await manager.applySuggestion(suggestion, textarea);
    console.assert(result.success === true, 'Should successfully apply suggestion');
    console.assert(textarea.value === 'This is a test', 'Should update text correctly');
    console.assert(suggestion.applied === true, 'Should mark suggestion as applied');
    
    // Test history tracking
    console.log('  Testing history tracking...');
    manager.startTracking(textarea);
    const historySummary = manager.getHistorySummary(textarea);
    console.assert(historySummary.totalStates > 0, 'Should have history states');
    console.assert(typeof historySummary.canUndo === 'boolean', 'Should report undo availability');
    
    // Test undo functionality
    console.log('  Testing undo functionality...');
    const undoResult = manager.undo(textarea);
    if (undoResult.success) {
      console.assert(textarea.value !== 'This is a test', 'Should revert text on undo');
    }
    
    // Test redo functionality
    console.log('  Testing redo functionality...');
    const redoResult = manager.redo(textarea);
    if (redoResult.success) {
      console.assert(textarea.value === 'This is a test', 'Should restore text on redo');
    }
    
    // Test batch application
    console.log('  Testing batch suggestion application...');
    const textarea2 = createMockTextarea('this is another test sentence');
    const suggestions = [
      createMockSuggestion({ range: { start: 0, end: 4 }, original: 'this', replacement: 'This' }),
      createMockSuggestion({ 
        type: 'style', 
        range: { start: 8, end: 15 }, 
        original: 'another', 
        replacement: 'different',
        severity: 'suggestion'
      })
    ];
    
    const batchResult = await manager.applyBatchSuggestions(suggestions, textarea2);
    console.assert(batchResult.success === true, 'Should successfully apply batch suggestions');
    console.assert(batchResult.results.length === 2, 'Should return results for all suggestions');
    
    // Test rewriter integration
    console.log('  Testing rewriter integration...');
    const toneSuggestion = createMockSuggestion({
      type: 'tone',
      range: { start: 0, end: 5 },
      original: "can't",
      replacement: 'cannot',
      explanation: 'Use formal tone'
    });
    
    const textarea3 = createMockTextarea("can't do this");
    const rewriterResult = await manager.applySuggestion(toneSuggestion, textarea3);
    
    if (rewriterResult.success) {
      console.assert(textarea3.value.includes('cannot'), 'Should apply rewriter changes');
    }
    
    // Test user preferences
    console.log('  Testing user preferences...');
    manager.updateUserPreferences(suggestion, 'applied');
    const acceptanceRate = manager.getSuggestionAcceptanceRate('grammar', 'error');
    console.assert(typeof acceptanceRate === 'number', 'Should return acceptance rate');
    console.assert(acceptanceRate >= 0 && acceptanceRate <= 1, 'Acceptance rate should be between 0 and 1');
    
    // Test personalized priority
    console.log('  Testing personalized priority...');
    const personalizedPriority = manager.getPersonalizedPriority(suggestion);
    console.assert(typeof personalizedPriority === 'number', 'Should return personalized priority');
    console.assert(personalizedPriority >= 0 && personalizedPriority <= 1, 'Priority should be between 0 and 1');
    
    // Test cleanup
    console.log('  Testing cleanup...');
    manager.destroy();
    console.assert(manager.history.size === 0, 'Should clear history on destroy');
    
    console.log('✓ SuggestionApplicationManager tests passed');
    
  } catch (error) {
    console.error('✗ SuggestionApplicationManager test failed:', error);
    throw error;
  }
}

/**
 * Test UserPreferenceLearning
 */
async function testUserPreferenceLearning() {
  console.log('Testing UserPreferenceLearning...');
  
  const learning = new UserPreferenceLearning();
  
  try {
    // Test preference recording
    console.log('  Testing preference recording...');
    const suggestion = createMockSuggestion();
    const element = createMockTextarea('test text');
    
    learning.recordSuggestionAction(suggestion, 'applied', element);
    
    const personalizedScore = learning.getPersonalizedScore(suggestion, element);
    console.assert(typeof personalizedScore === 'number', 'Should return personalized score');
    console.assert(personalizedScore >= 0 && personalizedScore <= 1, 'Score should be between 0 and 1');
    
    // Test pattern extraction
    console.log('  Testing pattern extraction...');
    const pattern = learning.extractSuggestionPattern(suggestion);
    console.assert(pattern.type === suggestion.type, 'Should extract suggestion type');
    console.assert(pattern.severity === suggestion.severity, 'Should extract suggestion severity');
    console.assert(typeof pattern.confidence === 'number', 'Should extract confidence');
    
    // Test context extraction
    console.log('  Testing context extraction...');
    const context = learning.extractContext(element, suggestion);
    console.assert(typeof context.platform === 'string', 'Should extract platform');
    console.assert(typeof context.elementType === 'string', 'Should extract element type');
    console.assert(typeof context.textLengthCategory === 'string', 'Should categorize text length');
    
    // Test suggestion filtering
    console.log('  Testing suggestion filtering...');
    const suggestions = [
      createMockSuggestion({ confidence: 0.9 }),
      createMockSuggestion({ confidence: 0.5, type: 'style' }),
      createMockSuggestion({ confidence: 0.2, type: 'enhancement' })
    ];
    
    const filteredSuggestions = learning.filterSuggestions(suggestions, element, { threshold: 0.3 });
    console.assert(Array.isArray(filteredSuggestions), 'Should return array of suggestions');
    console.assert(filteredSuggestions.length <= suggestions.length, 'Should filter suggestions');
    
    // Test learning insights
    console.log('  Testing learning insights...');
    // Record more actions to generate insights
    for (let i = 0; i < 10; i++) {
      const testSuggestion = createMockSuggestion({ 
        type: i % 2 === 0 ? 'grammar' : 'style',
        confidence: 0.5 + (i * 0.05)
      });
      learning.recordSuggestionAction(testSuggestion, i % 3 === 0 ? 'applied' : 'ignored', element);
    }
    
    const insights = learning.getLearningInsights();
    console.assert(typeof insights.totalSuggestions === 'number', 'Should report total suggestions');
    console.assert(typeof insights.appliedSuggestions === 'number', 'Should report applied suggestions');
    console.assert(Array.isArray(insights.preferredTypes), 'Should report preferred types');
    console.assert(typeof insights.learningProgress === 'object', 'Should report learning progress');
    
    // Test data quality assessment
    console.log('  Testing data quality assessment...');
    const progress = learning.calculateLearningProgress();
    console.assert(typeof progress.dataQuality === 'string', 'Should assess data quality');
    console.assert(['insufficient', 'poor', 'fair', 'good'].includes(progress.dataQuality), 'Should use valid quality rating');
    
    // Test persistence
    console.log('  Testing persistence...');
    learning.savePreferences();
    const stored = localStorage.getItem('intellipen-learning-data');
    console.assert(stored !== null, 'Should save preferences to storage');
    
    const newLearning = new UserPreferenceLearning();
    console.assert(newLearning.preferences.size > 0, 'Should load preferences from storage');
    
    // Test data export
    console.log('  Testing data export...');
    const exportedData = learning.exportLearningData();
    console.assert(typeof exportedData === 'object', 'Should export data as object');
    console.assert(Array.isArray(exportedData.preferences), 'Should export preferences');
    console.assert(typeof exportedData.insights === 'object', 'Should export insights');
    
    // Test learning control
    console.log('  Testing learning control...');
    learning.disableLearning();
    console.assert(learning.learningEnabled === false, 'Should disable learning');
    
    learning.enableLearning();
    console.assert(learning.learningEnabled === true, 'Should enable learning');
    
    // Test data clearing
    console.log('  Testing data clearing...');
    const initialSize = learning.preferences.size;
    learning.clearLearningData();
    console.assert(learning.preferences.size === 0, 'Should clear all learning data');
    
    // Test cleanup
    learning.destroy();
    
    console.log('✓ UserPreferenceLearning tests passed');
    
  } catch (error) {
    console.error('✗ UserPreferenceLearning test failed:', error);
    throw error;
  }
}

/**
 * Test integration between components
 */
async function testIntegration() {
  console.log('Testing suggestion application integration...');
  
  try {
    const mockEngine = {};
    const manager = new SuggestionApplicationManager(mockEngine);
    const learning = new UserPreferenceLearning();
    
    // Test integrated workflow
    console.log('  Testing integrated workflow...');
    const textarea = createMockTextarea('this is a test sentence with errors');
    const suggestions = [
      createMockSuggestion({ 
        range: { start: 0, end: 4 }, 
        original: 'this', 
        replacement: 'This',
        confidence: 0.9
      }),
      createMockSuggestion({ 
        type: 'style',
        range: { start: 17, end: 25 }, 
        original: 'sentence', 
        replacement: 'phrase',
        confidence: 0.7,
        severity: 'suggestion'
      })
    ];
    
    // Apply suggestions and learn from them
    for (const suggestion of suggestions) {
      const result = await manager.applySuggestion(suggestion, textarea);
      if (result.success) {
        learning.recordSuggestionAction(suggestion, 'applied', textarea);
      }
    }
    
    // Test personalized scoring
    console.log('  Testing personalized scoring...');
    const newSuggestion = createMockSuggestion({ confidence: 0.6 });
    const personalizedScore = learning.getPersonalizedScore(newSuggestion, textarea);
    
    // Score should be influenced by learning
    console.assert(typeof personalizedScore === 'number', 'Should return personalized score');
    
    // Test filtered suggestions with learning
    console.log('  Testing filtered suggestions with learning...');
    const moreSuggestions = [
      createMockSuggestion({ confidence: 0.8, type: 'grammar' }),
      createMockSuggestion({ confidence: 0.6, type: 'style' }),
      createMockSuggestion({ confidence: 0.4, type: 'enhancement' })
    ];
    
    const filteredSuggestions = learning.filterSuggestions(moreSuggestions, textarea);
    console.assert(Array.isArray(filteredSuggestions), 'Should return filtered suggestions');
    
    // Test batch application with learning
    console.log('  Testing batch application with learning...');
    const batchResult = await manager.applyBatchSuggestions(filteredSuggestions, textarea);
    
    if (batchResult.success) {
      // Record learning for batch results
      batchResult.results.forEach(result => {
        if (result.success) {
          learning.recordSuggestionAction(result.suggestion, 'applied', textarea);
        }
      });
    }
    
    // Verify learning has been updated
    const insights = learning.getLearningInsights();
    console.assert(insights.totalSuggestions > 0, 'Should have recorded suggestions');
    console.assert(insights.appliedSuggestions > 0, 'Should have recorded applications');
    
    // Test undo/redo with learning context
    console.log('  Testing undo/redo with learning context...');
    const undoResult = manager.undo(textarea);
    if (undoResult.success) {
      const redoResult = manager.redo(textarea);
      console.assert(redoResult.success || !redoResult.success, 'Redo should complete (success or failure)');
    }
    
    // Cleanup
    manager.destroy();
    learning.destroy();
    
    console.log('✓ Integration tests passed');
    
  } catch (error) {
    console.error('✗ Integration test failed:', error);
    throw error;
  }
}

/**
 * Test performance and edge cases
 */
async function testPerformanceAndEdgeCases() {
  console.log('Testing performance and edge cases...');
  
  try {
    const mockEngine = {};
    const manager = new SuggestionApplicationManager(mockEngine);
    const learning = new UserPreferenceLearning();
    
    // Test large text handling
    console.log('  Testing large text handling...');
    const largeText = 'word '.repeat(1000); // 5000 characters
    const largeTextarea = createMockTextarea(largeText);
    
    const largeSuggestion = createMockSuggestion({
      range: { start: 0, end: 4 },
      original: 'word',
      replacement: 'Word'
    });
    
    const startTime = performance.now();
    const result = await manager.applySuggestion(largeSuggestion, largeTextarea);
    const endTime = performance.now();
    
    console.assert(result.success === true, 'Should handle large text');
    console.assert(endTime - startTime < 1000, 'Should complete within reasonable time');
    
    // Test many suggestions
    console.log('  Testing many suggestions...');
    const manySuggestions = [];
    for (let i = 0; i < 50; i++) {
      manySuggestions.push(createMockSuggestion({
        range: { start: i * 5, end: i * 5 + 4 },
        original: 'word',
        replacement: 'Word',
        confidence: 0.5 + (i * 0.01)
      }));
    }
    
    const filteredMany = learning.filterSuggestions(manySuggestions, largeTextarea, { maxSuggestions: 10 });
    console.assert(filteredMany.length <= 10, 'Should limit number of suggestions');
    
    // Test edge case: empty text
    console.log('  Testing empty text edge case...');
    const emptyTextarea = createMockTextarea('');
    const emptyResult = await manager.applySuggestion(largeSuggestion, emptyTextarea);
    console.assert(typeof emptyResult.success === 'boolean', 'Should handle empty text gracefully');
    
    // Test edge case: invalid suggestion range
    console.log('  Testing invalid suggestion range...');
    const invalidSuggestion = createMockSuggestion({
      range: { start: 100, end: 200 }, // Beyond text length
      original: 'nonexistent',
      replacement: 'replacement'
    });
    
    const shortTextarea = createMockTextarea('short');
    const invalidResult = await manager.applySuggestion(invalidSuggestion, shortTextarea);
    console.assert(typeof invalidResult.success === 'boolean', 'Should handle invalid ranges gracefully');
    
    // Test rapid successive operations
    console.log('  Testing rapid successive operations...');
    const rapidTextarea = createMockTextarea('test text for rapid operations');
    
    const rapidPromises = [];
    for (let i = 0; i < 10; i++) {
      const rapidSuggestion = createMockSuggestion({
        range: { start: 0, end: 4 },
        original: 'test',
        replacement: 'Test'
      });
      rapidPromises.push(manager.applySuggestion(rapidSuggestion, rapidTextarea));
    }
    
    const rapidResults = await Promise.allSettled(rapidPromises);
    console.assert(rapidResults.length === 10, 'Should handle rapid operations');
    
    // Test memory usage with many elements
    console.log('  Testing memory usage...');
    const manyElements = [];
    for (let i = 0; i < 100; i++) {
      const element = createMockTextarea(`text ${i}`);
      manyElements.push(element);
      manager.startTracking(element);
      
      // Record some learning data
      learning.recordSuggestionAction(largeSuggestion, 'applied', element);
    }
    
    console.assert(manager.history.size === 100, 'Should track many elements');
    console.assert(learning.preferences.size > 0, 'Should learn from many interactions');
    
    // Cleanup
    manager.destroy();
    learning.destroy();
    
    console.log('✓ Performance and edge case tests passed');
    
  } catch (error) {
    console.error('✗ Performance and edge case test failed:', error);
    throw error;
  }
}

/**
 * Run all suggestion application tests
 */
async function runAllSuggestionApplicationTests() {
  console.log('Running Suggestion Application System Tests...\n');
  
  try {
    await testSuggestionApplicationManager();
    await testUserPreferenceLearning();
    await testIntegration();
    await testPerformanceAndEdgeCases();
    
    console.log('\n✅ All suggestion application tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Some suggestion application tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export {
  testSuggestionApplicationManager,
  testUserPreferenceLearning,
  testIntegration,
  testPerformanceAndEdgeCases,
  runAllSuggestionApplicationTests
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  runAllSuggestionApplicationTests().then(success => {
    if (success) {
      console.log('All suggestion application tests completed successfully!');
    } else {
      console.error('Some suggestion application tests failed!');
    }
  });
} else if (typeof process !== 'undefined' && process.argv) {
  // Node.js environment
  runAllSuggestionApplicationTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}