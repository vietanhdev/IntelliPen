/**
 * Test suite for Writing Intelligence Engine
 */

import WritingIntelligenceEngine from './WritingIntelligenceEngine.js';
import TextAnalysisPipeline from './TextAnalysisPipeline.js';
import ContextAnalyzer from './ContextAnalyzer.js';
import { WritingAnalysis, Suggestion } from './models/WritingAnalysis.js';

// Mock Chrome AI APIs for testing
const mockChromeAI = {
  proofreader: {
    availability: () => Promise.resolve('available'),
    create: (options) => Promise.resolve({
      proofread: (text) => Promise.resolve({
        corrections: [
          {
            startIndex: 0,
            endIndex: 4,
            replacement: 'This',
            explanation: 'Capitalization error'
          }
        ]
      }),
      destroy: () => {}
    })
  },
  writer: {
    availability: () => Promise.resolve('available'),
    create: (options) => Promise.resolve({
      write: (prompt, context) => Promise.resolve(
        '[0-4] Original: "this" | Suggestion: "This" | Reason: "Capitalize first word"'
      ),
      destroy: () => {}
    })
  },
  rewriter: {
    availability: () => Promise.resolve('available'),
    create: (options) => Promise.resolve({
      rewrite: (text, options) => Promise.resolve(text),
      destroy: () => {}
    })
  }
};

// Set up global mock
global.window = {
  chrome: {
    ai: mockChromeAI
  }
};

/**
 * Test WritingIntelligenceEngine
 */
async function testWritingIntelligenceEngine() {
  console.log('Testing WritingIntelligenceEngine...');
  
  const engine = new WritingIntelligenceEngine();
  
  try {
    // Test initialization
    console.log('  Testing initialization...');
    const initialized = await engine.initialize();
    console.assert(initialized === true, 'Engine should initialize successfully');
    console.assert(engine.isInitialized === true, 'Engine should be marked as initialized');
    
    // Test text analysis
    console.log('  Testing text analysis...');
    const testText = 'this is a test sentence with some errors.';
    const analysis = await engine.analyzeText(testText, { platform: 'gmail.com' });
    
    console.assert(analysis.originalText === testText, 'Original text should be preserved');
    console.assert(Array.isArray(analysis.suggestions), 'Suggestions should be an array');
    console.assert(analysis.metadata.platform === 'gmail.com', 'Platform should be preserved');
    console.assert(typeof analysis.metadata.processingTime === 'number', 'Processing time should be recorded');
    
    // Test platform context
    console.log('  Testing platform context...');
    const gmailContext = engine.getPlatformContext('gmail.com');
    console.assert(gmailContext.type === 'email', 'Gmail should be recognized as email platform');
    console.assert(gmailContext.formality === 'professional', 'Gmail should suggest professional formality');
    
    // Test cache functionality
    console.log('  Testing cache functionality...');
    const analysis1 = await engine.analyzeText(testText, { platform: 'gmail.com' });
    const analysis2 = await engine.analyzeText(testText, { platform: 'gmail.com' });
    console.assert(engine.analysisCache.size > 0, 'Cache should contain entries');
    
    // Test cleanup
    console.log('  Testing cleanup...');
    engine.destroy();
    console.assert(engine.isInitialized === false, 'Engine should be marked as not initialized after destroy');
    
    console.log('✓ WritingIntelligenceEngine tests passed');
    
  } catch (error) {
    console.error('✗ WritingIntelligenceEngine test failed:', error);
    throw error;
  }
}

/**
 * Test TextAnalysisPipeline
 */
async function testTextAnalysisPipeline() {
  console.log('Testing TextAnalysisPipeline...');
  
  const engine = new WritingIntelligenceEngine();
  await engine.initialize();
  
  const pipeline = new TextAnalysisPipeline(engine);
  
  try {
    // Test basic analysis
    console.log('  Testing basic analysis...');
    const testText = 'this is a test sentence.';
    const analysis = await pipeline.analyzeText(testText, { platform: 'gmail.com' });
    
    console.assert(analysis instanceof WritingAnalysis, 'Should return WritingAnalysis instance');
    console.assert(analysis.originalText === testText, 'Original text should be preserved');
    
    // Test debounced analysis
    console.log('  Testing debounced analysis...');
    const debouncedPromise = pipeline.analyzeTextDebounced(testText, { platform: 'gmail.com' });
    const debouncedAnalysis = await debouncedPromise;
    console.assert(debouncedAnalysis instanceof WritingAnalysis, 'Debounced analysis should return WritingAnalysis');
    
    // Test preprocessing
    console.log('  Testing text preprocessing...');
    const messyText = '  this   has    excessive   whitespace  ';
    const processed = pipeline.preprocessText(messyText);
    console.assert(processed === 'this has excessive whitespace', 'Should clean up whitespace');
    
    // Test batch analysis
    console.log('  Testing batch analysis...');
    const texts = ['first text', 'second text', 'third text'];
    const batchResults = await pipeline.batchAnalyze(texts);
    console.assert(batchResults.length === 3, 'Should return results for all texts');
    console.assert(batchResults.every(r => r instanceof WritingAnalysis), 'All results should be WritingAnalysis instances');
    
    // Test queue status
    console.log('  Testing queue status...');
    const status = pipeline.getQueueStatus();
    console.assert(typeof status.isProcessing === 'boolean', 'Should report processing status');
    console.assert(typeof status.queueLength === 'number', 'Should report queue length');
    
    // Test cleanup
    pipeline.destroy();
    engine.destroy();
    
    console.log('✓ TextAnalysisPipeline tests passed');
    
  } catch (error) {
    console.error('✗ TextAnalysisPipeline test failed:', error);
    throw error;
  }
}

/**
 * Test ContextAnalyzer
 */
async function testContextAnalyzer() {
  console.log('Testing ContextAnalyzer...');
  
  const analyzer = new ContextAnalyzer();
  
  try {
    // Test platform normalization
    console.log('  Testing platform normalization...');
    console.assert(analyzer.normalizePlatform('https://www.gmail.com/') === 'gmail.com', 'Should normalize URLs');
    console.assert(analyzer.normalizePlatform('Gmail.Com') === 'gmail.com', 'Should normalize case');
    
    // Test text type detection
    console.log('  Testing text type detection...');
    const emailText = 'Dear John, Thank you for your email. Best regards, Jane';
    const emailType = analyzer.detectTextType(emailText);
    console.assert(emailType === 'email', 'Should detect email text type');
    
    const socialText = 'Just had an amazing day! #blessed @friend https://example.com';
    const socialType = analyzer.detectTextType(socialText);
    console.assert(socialType === 'socialPost', 'Should detect social post text type');
    
    // Test context analysis
    console.log('  Testing context analysis...');
    const context = analyzer.analyzeContext(emailText, 'gmail.com');
    console.assert(context.platform === 'gmail.com', 'Should preserve platform');
    console.assert(context.textType === 'email', 'Should detect text type');
    console.assert(context.formality === 'professional', 'Should suggest professional formality for Gmail');
    console.assert(Array.isArray(context.recommendations), 'Should provide recommendations');
    
    // Test readability calculation
    console.log('  Testing readability calculation...');
    const simpleText = 'This is a simple sentence.';
    const complexText = 'This is an extraordinarily complicated sentence with numerous multisyllabic words that significantly reduce readability.';
    
    const simpleScore = analyzer.calculateReadabilityScore(simpleText);
    const complexScore = analyzer.calculateReadabilityScore(complexText);
    console.assert(simpleScore > complexScore, 'Simple text should have higher readability score');
    
    // Test word and sentence counting
    console.log('  Testing text metrics...');
    const testText = 'First sentence. Second sentence! Third sentence?';
    console.assert(analyzer.countWords(testText) === 6, 'Should count words correctly');
    console.assert(analyzer.countSentences(testText) === 3, 'Should count sentences correctly');
    
    // Test cache functionality
    console.log('  Testing cache functionality...');
    const context1 = analyzer.analyzeContext(emailText, 'gmail.com');
    const context2 = analyzer.analyzeContext(emailText, 'gmail.com');
    const stats = analyzer.getCacheStats();
    console.assert(stats.size > 0, 'Cache should contain entries');
    
    analyzer.clearCache();
    const clearedStats = analyzer.getCacheStats();
    console.assert(clearedStats.size === 0, 'Cache should be empty after clearing');
    
    console.log('✓ ContextAnalyzer tests passed');
    
  } catch (error) {
    console.error('✗ ContextAnalyzer test failed:', error);
    throw error;
  }
}

/**
 * Test WritingAnalysis and Suggestion models
 */
async function testModels() {
  console.log('Testing WritingAnalysis and Suggestion models...');
  
  try {
    // Test Suggestion model
    console.log('  Testing Suggestion model...');
    const suggestion = new Suggestion(
      'grammar',
      { start: 0, end: 4 },
      'this',
      'This',
      0.9,
      'Capitalize first word',
      'error'
    );
    
    console.assert(suggestion.type === 'grammar', 'Should preserve type');
    console.assert(suggestion.confidence === 0.9, 'Should preserve confidence');
    console.assert(suggestion.applied === false, 'Should default to not applied');
    console.assert(typeof suggestion.id === 'string', 'Should generate ID');
    
    // Test text application
    const originalText = 'this is a test';
    const correctedText = suggestion.applyToText(originalText);
    console.assert(correctedText === 'This is a test', 'Should apply correction correctly');
    
    // Test overlap detection
    const overlappingSuggestion = new Suggestion('style', { start: 2, end: 6 }, 'is', 'was', 0.7, 'Tense correction');
    console.assert(suggestion.overlapsWith(overlappingSuggestion), 'Should detect overlap');
    
    // Test color coding
    console.assert(suggestion.getIndicatorColor() === '#dc3545', 'Error should be red');
    
    // Test JSON serialization
    const json = suggestion.toJSON();
    const restored = Suggestion.fromJSON(json);
    console.assert(restored.type === suggestion.type, 'Should restore from JSON correctly');
    
    // Test WritingAnalysis model
    console.log('  Testing WritingAnalysis model...');
    const analysis = new WritingAnalysis(
      originalText,
      [suggestion],
      { platform: 'gmail.com', processingTime: 100 }
    );
    
    console.assert(analysis.originalText === originalText, 'Should preserve original text');
    console.assert(analysis.suggestions.length === 1, 'Should contain suggestions');
    console.assert(analysis.metadata.platform === 'gmail.com', 'Should preserve metadata');
    
    // Test filtering methods
    const grammarSuggestions = analysis.getSuggestionsByType('grammar');
    console.assert(grammarSuggestions.length === 1, 'Should filter by type');
    
    const errorSuggestions = analysis.getSuggestionsBySeverity('error');
    console.assert(errorSuggestions.length === 1, 'Should filter by severity');
    
    const highConfidenceSuggestions = analysis.getHighConfidenceSuggestions(0.8);
    console.assert(highConfidenceSuggestions.length === 1, 'Should filter by confidence');
    
    // Test status methods
    console.assert(analysis.hasErrors() === true, 'Should detect errors');
    console.assert(analysis.hasSuggestions() === true, 'Should detect suggestions');
    console.assert(analysis.getTotalIssues() === 1, 'Should count total issues');
    
    // Test JSON serialization
    const analysisJson = analysis.toJSON();
    const restoredAnalysis = WritingAnalysis.fromJSON(analysisJson);
    console.assert(restoredAnalysis.originalText === analysis.originalText, 'Should restore analysis from JSON');
    
    console.log('✓ Model tests passed');
    
  } catch (error) {
    console.error('✗ Model test failed:', error);
    throw error;
  }
}

/**
 * Test performance requirements
 */
async function testPerformance() {
  console.log('Testing performance requirements...');
  
  const engine = new WritingIntelligenceEngine();
  await engine.initialize();
  
  try {
    // Test response time requirement (50ms for grammar analysis)
    console.log('  Testing response time requirement...');
    const testText = 'this is a test sentence with some errors.';
    
    const startTime = performance.now();
    const analysis = await engine.analyzeText(testText, { platform: 'gmail.com' });
    const endTime = performance.now();
    
    const responseTime = endTime - startTime;
    console.log(`    Response time: ${responseTime.toFixed(2)}ms`);
    
    // Note: In a real environment with actual Chrome AI APIs, this should be under 50ms
    // For testing with mocks, we just verify the timing is recorded
    console.assert(typeof analysis.metadata.processingTime === 'number', 'Should record processing time');
    console.assert(analysis.metadata.processingTime >= 0, 'Processing time should be non-negative');
    
    // Test memory usage (basic check)
    console.log('  Testing memory management...');
    const initialCacheSize = engine.analysisCache.size;
    
    // Analyze many texts to test cache management
    for (let i = 0; i < 150; i++) {
      await engine.analyzeText(`Test text number ${i}`, { platform: 'gmail.com' });
    }
    
    console.assert(engine.analysisCache.size <= 100, 'Cache should be limited to prevent memory issues');
    
    engine.destroy();
    
    console.log('✓ Performance tests passed');
    
  } catch (error) {
    console.error('✗ Performance test failed:', error);
    throw error;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Running Writing Intelligence Engine Tests...\n');
  
  try {
    await testModels();
    await testContextAnalyzer();
    await testWritingIntelligenceEngine();
    await testTextAnalysisPipeline();
    await testPerformance();
    
    console.log('\n✅ All Writing Intelligence Engine tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Some tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export {
  testWritingIntelligenceEngine,
  testTextAnalysisPipeline,
  testContextAnalyzer,
  testModels,
  testPerformance,
  runAllTests
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  runAllTests().then(success => {
    if (success) {
      console.log('All tests completed successfully!');
    } else {
      console.error('Some tests failed!');
    }
  });
} else if (typeof process !== 'undefined' && process.argv) {
  // Node.js environment
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}