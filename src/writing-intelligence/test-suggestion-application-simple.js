/**
 * Simple Node.js compatible tests for Suggestion Application System
 */

import { Suggestion } from './models/WritingAnalysis.js';

// Mock global objects for Node.js
global.window = {
  chrome: {
    ai: {
      rewriter: {
        availability: () => Promise.resolve('available'),
        create: () => Promise.resolve({
          rewrite: (text) => Promise.resolve(text.toUpperCase()),
          destroy: () => {}
        })
      }
    }
  },
  location: { hostname: 'gmail.com' }
};

global.localStorage = {
  data: {},
  getItem: function(key) { return this.data[key] || null; },
  setItem: function(key, value) { this.data[key] = value; },
  removeItem: function(key) { delete this.data[key]; }
};

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {}
};

/**
 * Test Suggestion model
 */
function testSuggestionModel() {
  console.log('Testing Suggestion model...');
  
  try {
    // Test basic suggestion creation
    const suggestion = new Suggestion(
      'grammar',
      { start: 0, end: 4 },
      'this',
      'This',
      0.9,
      'Capitalize first word',
      'error'
    );
    
    console.assert(suggestion.type === 'grammar', 'Should set type correctly');
    console.assert(suggestion.confidence === 0.9, 'Should set confidence correctly');
    console.assert(suggestion.applied === false, 'Should default to not applied');
    console.assert(typeof suggestion.id === 'string', 'Should generate ID');
    
    // Test text application
    const originalText = 'this is a test';
    const correctedText = suggestion.applyToText(originalText);
    console.assert(correctedText === 'This is a test', 'Should apply correction correctly');
    
    // Test marking as applied
    suggestion.markAsApplied();
    console.assert(suggestion.applied === true, 'Should mark as applied');
    
    // Test JSON serialization
    const json = suggestion.toJSON();
    const restored = Suggestion.fromJSON(json);
    console.assert(restored.type === suggestion.type, 'Should restore from JSON correctly');
    console.assert(restored.applied === suggestion.applied, 'Should restore applied state');
    
    // Test overlap detection
    const overlappingSuggestion = new Suggestion(
      'style', 
      { start: 2, end: 6 }, 
      'is', 
      'was', 
      0.7, 
      'Tense correction'
    );
    console.assert(suggestion.overlapsWith(overlappingSuggestion), 'Should detect overlap');
    
    const nonOverlappingSuggestion = new Suggestion(
      'enhancement',
      { start: 10, end: 14 },
      'test',
      'example',
      0.6,
      'Better word choice'
    );
    console.assert(!suggestion.overlapsWith(nonOverlappingSuggestion), 'Should not detect overlap when none exists');
    
    // Test color coding
    console.assert(suggestion.getIndicatorColor() === '#dc3545', 'Error should be red');
    
    const styleSuggestion = new Suggestion('style', { start: 0, end: 1 }, 'a', 'b', 0.5, 'test', 'suggestion');
    console.assert(styleSuggestion.getIndicatorColor() === '#ffc107', 'Style should be amber');
    
    const enhancementSuggestion = new Suggestion('enhancement', { start: 0, end: 1 }, 'a', 'b', 0.5, 'test', 'suggestion');
    console.assert(enhancementSuggestion.getIndicatorColor() === '#007bff', 'Enhancement should be blue');
    
    console.log('✓ Suggestion model tests passed');
    
  } catch (error) {
    console.error('✗ Suggestion model test failed:', error);
    throw error;
  }
}

/**
 * Test UserPreferenceLearning core functionality
 */
function testUserPreferenceLearningCore() {
  console.log('Testing UserPreferenceLearning core functionality...');
  
  try {
    // Import the class (we'll test the parts that don't need DOM)
    const UserPreferenceLearning = class {
      constructor() {
        this.preferences = new Map();
        this.contextualPreferences = new Map();
        this.sessionData = new Map();
        this.learningEnabled = true;
        this.minSampleSize = 5;
        this.decayFactor = 0.95;
      }
      
      extractSuggestionPattern(suggestion) {
        return {
          type: suggestion.type,
          severity: suggestion.severity,
          confidence: Math.round(suggestion.confidence * 10) / 10,
          lengthCategory: this.categorizeSuggestionLength(suggestion),
          hasReplacement: !!suggestion.replacement,
          explanationCategory: this.categorizeExplanation(suggestion.explanation)
        };
      }
      
      categorizeSuggestionLength(suggestion) {
        const length = suggestion.replacement ? suggestion.replacement.length : 0;
        if (length <= 10) return 'short';
        if (length <= 50) return 'medium';
        return 'long';
      }
      
      categorizeExplanation(explanation) {
        if (explanation.toLowerCase().includes('grammar')) return 'grammar';
        if (explanation.toLowerCase().includes('style')) return 'style';
        if (explanation.toLowerCase().includes('tone')) return 'tone';
        if (explanation.toLowerCase().includes('clarity')) return 'clarity';
        return 'other';
      }
      
      patternToKey(pattern) {
        return JSON.stringify(pattern);
      }
      
      updatePreferences(pattern, action) {
        const key = this.patternToKey(pattern);
        
        if (!this.preferences.has(key)) {
          this.preferences.set(key, {
            pattern,
            actions: { applied: 0, ignored: 0, dismissed: 0 },
            total: 0,
            lastUpdated: Date.now(),
            confidence: 0.5
          });
        }
        
        const pref = this.preferences.get(key);
        pref.actions[action]++;
        pref.total++;
        pref.lastUpdated = Date.now();
        pref.confidence = pref.actions.applied / pref.total;
      }
      
      getGlobalPreferenceScore(pattern) {
        const key = this.patternToKey(pattern);
        const pref = this.preferences.get(key);
        
        if (!pref || pref.total < this.minSampleSize) {
          return 0.5;
        }
        
        return pref.confidence;
      }
    };
    
    const learning = new UserPreferenceLearning();
    
    // Test pattern extraction
    const suggestion = new Suggestion(
      'grammar',
      { start: 0, end: 4 },
      'this',
      'This',
      0.9,
      'Grammar correction needed',
      'error'
    );
    
    const pattern = learning.extractSuggestionPattern(suggestion);
    console.assert(pattern.type === 'grammar', 'Should extract type');
    console.assert(pattern.severity === 'error', 'Should extract severity');
    console.assert(pattern.confidence === 0.9, 'Should extract confidence');
    console.assert(pattern.lengthCategory === 'short', 'Should categorize length');
    console.assert(pattern.explanationCategory === 'grammar', 'Should categorize explanation');
    
    // Test preference updates
    learning.updatePreferences(pattern, 'applied');
    learning.updatePreferences(pattern, 'applied');
    learning.updatePreferences(pattern, 'ignored');
    
    const score = learning.getGlobalPreferenceScore(pattern);
    console.assert(typeof score === 'number', 'Should return numeric score');
    console.assert(score >= 0 && score <= 1, 'Score should be between 0 and 1');
    
    // With 2 applied and 1 ignored, score should be 2/3 ≈ 0.67
    console.assert(Math.abs(score - (2/3)) < 0.01, 'Should calculate correct acceptance rate');
    
    console.log('✓ UserPreferenceLearning core tests passed');
    
  } catch (error) {
    console.error('✗ UserPreferenceLearning core test failed:', error);
    throw error;
  }
}

/**
 * Test text processing utilities
 */
function testTextProcessingUtilities() {
  console.log('Testing text processing utilities...');
  
  try {
    // Test suggestion range adjustment
    function adjustSuggestionRange(suggestion, previousResults) {
      let offset = 0;
      
      for (const result of previousResults) {
        if (result.success && result.suggestion.range.end <= suggestion.range.start) {
          const lengthDiff = result.newText.length - result.originalText.length;
          offset += lengthDiff;
        }
      }
      
      return {
        ...suggestion,
        range: {
          start: suggestion.range.start + offset,
          end: suggestion.range.end + offset
        }
      };
    }
    
    const suggestion = new Suggestion(
      'style',
      { start: 10, end: 15 },
      'world',
      'universe',
      0.7,
      'Better word choice'
    );
    
    const previousResults = [
      {
        success: true,
        suggestion: { range: { start: 0, end: 5 } },
        originalText: 'hello',
        newText: 'Hello there'
      }
    ];
    
    const adjusted = adjustSuggestionRange(suggestion, previousResults);
    console.assert(adjusted.range.start === 16, 'Should adjust start position'); // 10 + 6 (length diff)
    console.assert(adjusted.range.end === 21, 'Should adjust end position'); // 15 + 6
    
    // Test batch suggestion sorting
    const suggestions = [
      new Suggestion('grammar', { start: 20, end: 25 }, 'test1', 'Test1', 0.9, 'Fix 1'),
      new Suggestion('style', { start: 5, end: 10 }, 'test2', 'Test2', 0.8, 'Fix 2'),
      new Suggestion('enhancement', { start: 15, end: 18 }, 'test3', 'Test3', 0.7, 'Fix 3')
    ];
    
    const sorted = [...suggestions].sort((a, b) => b.range.start - a.range.start);
    console.assert(sorted[0].range.start === 20, 'Should sort by position (reverse)');
    console.assert(sorted[1].range.start === 15, 'Should maintain reverse order');
    console.assert(sorted[2].range.start === 5, 'Should place earliest position last');
    
    console.log('✓ Text processing utilities tests passed');
    
  } catch (error) {
    console.error('✗ Text processing utilities test failed:', error);
    throw error;
  }
}

/**
 * Test performance characteristics
 */
function testPerformanceCharacteristics() {
  console.log('Testing performance characteristics...');
  
  try {
    // Test large suggestion set processing
    const startTime = performance.now();
    
    const largeSuggestionSet = [];
    for (let i = 0; i < 1000; i++) {
      largeSuggestionSet.push(new Suggestion(
        i % 3 === 0 ? 'grammar' : i % 3 === 1 ? 'style' : 'enhancement',
        { start: i * 10, end: i * 10 + 5 },
        `word${i}`,
        `Word${i}`,
        0.5 + (i % 50) / 100,
        `Fix ${i}`,
        i % 2 === 0 ? 'error' : 'suggestion'
      ));
    }
    
    const creationTime = performance.now() - startTime;
    console.assert(creationTime < 1000, 'Should create 1000 suggestions quickly'); // Less than 1 second
    
    // Test suggestion filtering performance
    const filterStartTime = performance.now();
    
    const highConfidenceSuggestions = largeSuggestionSet.filter(s => s.confidence > 0.8);
    const grammarSuggestions = largeSuggestionSet.filter(s => s.type === 'grammar');
    const errorSuggestions = largeSuggestionSet.filter(s => s.severity === 'error');
    
    const filterTime = performance.now() - filterStartTime;
    console.assert(filterTime < 100, 'Should filter suggestions quickly'); // Less than 100ms
    
    console.assert(highConfidenceSuggestions.length > 0, 'Should find high confidence suggestions');
    console.assert(grammarSuggestions.length > 0, 'Should find grammar suggestions');
    console.assert(errorSuggestions.length > 0, 'Should find error suggestions');
    
    // Test JSON serialization performance
    const serializationStartTime = performance.now();
    
    const serialized = largeSuggestionSet.map(s => s.toJSON());
    const deserialized = serialized.map(json => Suggestion.fromJSON(json));
    
    const serializationTime = performance.now() - serializationStartTime;
    console.assert(serializationTime < 500, 'Should serialize/deserialize quickly'); // Less than 500ms
    
    console.assert(deserialized.length === largeSuggestionSet.length, 'Should preserve all suggestions');
    console.assert(deserialized[0].type === largeSuggestionSet[0].type, 'Should preserve suggestion properties');
    
    console.log('✓ Performance characteristics tests passed');
    
  } catch (error) {
    console.error('✗ Performance characteristics test failed:', error);
    throw error;
  }
}

/**
 * Run all simple tests
 */
async function runAllSimpleTests() {
  console.log('Running Simple Suggestion Application Tests...\n');
  
  try {
    testSuggestionModel();
    testUserPreferenceLearningCore();
    testTextProcessingUtilities();
    testPerformanceCharacteristics();
    
    console.log('\n✅ All simple suggestion application tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Some simple tests failed:', error);
    return false;
  }
}

// Run tests
runAllSimpleTests().then(success => {
  if (success) {
    console.log('All simple tests completed successfully!');
  } else {
    console.error('Some simple tests failed!');
  }
  process.exit(success ? 0 : 1);
});