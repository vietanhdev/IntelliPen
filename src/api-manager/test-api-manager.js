/**
 * Test script for API Manager functionality
 * This can be run in a Chrome extension context to test the API integration
 */

import { 
  initializeAPIManager, 
  getSession, 
  isAPIAvailable, 
  getAvailableAPIs, 
  getAPIStats 
} from './index.js';

/**
 * Test the API Manager functionality
 */
async function testAPIManager() {
  console.log('🧪 Testing IntelliPen API Manager...');
  
  try {
    // Initialize the API manager
    console.log('1. Initializing API Manager...');
    await initializeAPIManager();
    console.log('✓ API Manager initialized');
    
    // Check available APIs
    console.log('2. Checking available APIs...');
    const availableAPIs = getAvailableAPIs();
    console.log('Available APIs:', availableAPIs);
    
    // Test individual API availability
    console.log('3. Testing individual API availability...');
    const apisToTest = ['proofreader', 'writer', 'rewriter', 'summarizer', 'prompt'];
    
    for (const apiName of apisToTest) {
      const available = isAPIAvailable(apiName);
      console.log(`${apiName}: ${available ? '✓ Available' : '✗ Not available'}`);
    }
    
    // Test session creation for available APIs
    console.log('4. Testing session creation...');
    const sessions = {};
    
    for (const apiName of availableAPIs) {
      try {
        console.log(`Creating ${apiName} session...`);
        const session = await getSession(apiName);
        sessions[apiName] = session;
        console.log(`✓ ${apiName} session created`);
      } catch (error) {
        console.warn(`✗ Failed to create ${apiName} session:`, error.message);
      }
    }
    
    // Test basic functionality if sessions are available
    console.log('5. Testing basic functionality...');
    
    // Test proofreader if available
    if (sessions.proofreader) {
      try {
        console.log('Testing proofreader...');
        const result = await sessions.proofreader.proofread('This is a test sentance with an error.');
        console.log('✓ Proofreader test successful:', result);
      } catch (error) {
        console.warn('✗ Proofreader test failed:', error.message);
      }
    }
    
    // Test prompt API if available
    if (sessions.prompt) {
      try {
        console.log('Testing prompt API...');
        const result = await sessions.prompt.prompt('Say hello in a friendly way.');
        console.log('✓ Prompt API test successful:', result);
      } catch (error) {
        console.warn('✗ Prompt API test failed:', error.message);
      }
    }
    
    // Test summarizer if available
    if (sessions.summarizer) {
      try {
        console.log('Testing summarizer...');
        const longText = 'This is a long piece of text that needs to be summarized. It contains multiple sentences and ideas that should be condensed into a shorter form. The summarizer should extract the key points and present them in a concise manner.';
        const result = await sessions.summarizer.summarize(longText);
        console.log('✓ Summarizer test successful:', result);
      } catch (error) {
        console.warn('✗ Summarizer test failed:', error.message);
      }
    }
    
    // Get final statistics
    console.log('6. Getting API statistics...');
    const stats = getAPIStats();
    console.log('API Statistics:', stats);
    
    console.log('🎉 API Manager testing completed!');
    
  } catch (error) {
    console.error('❌ API Manager test failed:', error);
  }
}

// Export test function
export { testAPIManager };

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined' && window.location.search.includes('test-api-manager')) {
  testAPIManager();
}