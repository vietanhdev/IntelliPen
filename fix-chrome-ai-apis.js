/**
 * Chrome AI APIs Fix Script
 * Run this in Chrome DevTools console to diagnose and help fix API availability issues
 */

(async function fixChromeAIAPIs() {
  console.log('🔧 Chrome AI APIs Fix Script');
  console.log('================================');
  
  // Check Chrome version
  const userAgent = navigator.userAgent;
  const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
  const chromeVersion = chromeMatch ? parseInt(chromeMatch[1]) : 0;
  
  console.log(`Chrome Version: ${chromeVersion}`);
  
  if (chromeVersion < 138) {
    console.error('❌ Chrome version too old. Need Chrome 138+');
    console.log('Update Chrome: chrome://settings/help');
    return;
  } else {
    console.log('✅ Chrome version meets requirements');
  }
  
  // Check if running in extension context
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  console.log(`Context: ${isExtension ? 'Extension' : 'Web Page'}`);
  
  // API availability check
  const apis = [
    { name: 'Prompt API (LanguageModel)', path: 'ai.languageModel', flag: 'prompt-api-for-gemini-nano' },
    { name: 'Proofreader API', path: 'ai.proofreader', flag: 'proofreader-api-for-gemini-nano' },
    { name: 'Writer API', path: 'ai.writer', flag: 'writer-api-for-gemini-nano' },
    { name: 'Rewriter API', path: 'ai.rewriter', flag: 'rewriter-api-for-gemini-nano' },
    { name: 'Summarizer API', path: 'ai.summarizer', flag: 'summarizer-api-for-gemini-nano' },
    { name: 'Translator API', path: 'ai.translator', flag: 'translator-api-for-gemini-nano' }
  ];
  
  console.log('\n📊 API Availability Status:');
  console.log('============================');
  
  const results = {};
  
  for (const api of apis) {
    try {
      const apiObj = getNestedProperty(window, api.path);
      
      if (!apiObj) {
        console.log(`❌ ${api.name}: Not found`);
        console.log(`   Enable flag: chrome://flags/#${api.flag}`);
        results[api.name] = 'not-found';
        continue;
      }
      
      if (typeof apiObj.availability === 'function') {
        try {
          const availability = await apiObj.availability();
          const status = availability === 'available' ? '✅' : 
                        availability === 'downloadable' ? '⚠️' : '❌';
          console.log(`${status} ${api.name}: ${availability}`);
          results[api.name] = availability;
          
          if (availability === 'downloadable') {
            console.log(`   Model needs download. This may take 30+ minutes.`);
          }
        } catch (error) {
          console.log(`❌ ${api.name}: Error - ${error.message}`);
          results[api.name] = 'error';
        }
      } else if (typeof apiObj.create === 'function') {
        console.log(`✅ ${api.name}: Available (no availability method)`);
        results[api.name] = 'available';
      } else {
        console.log(`❌ ${api.name}: Incomplete API`);
        results[api.name] = 'incomplete';
      }
    } catch (error) {
      console.log(`❌ ${api.name}: Exception - ${error.message}`);
      results[api.name] = 'exception';
    }
  }
  
  // Check storage
  console.log('\n💾 Storage Check:');
  console.log('==================');
  
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const availableGB = Math.round((estimate.quota - estimate.usage) / (1024 * 1024 * 1024));
      
      if (availableGB >= 22) {
        console.log(`✅ Storage: ~${availableGB}GB available (sufficient)`);
      } else {
        console.log(`❌ Storage: ~${availableGB}GB available (need 22GB+)`);
      }
    } catch (error) {
      console.log('⚠️ Storage: Unable to check');
    }
  } else {
    console.log('⚠️ Storage: API not supported');
  }
  
  // Provide fix instructions
  console.log('\n🔧 Fix Instructions:');
  console.log('=====================');
  
  const unavailableAPIs = Object.entries(results).filter(([name, status]) => 
    status === 'not-found' || status === 'error' || status === 'incomplete'
  );
  
  if (unavailableAPIs.length > 0) {
    console.log('1. Enable Chrome flags for unavailable APIs:');
    unavailableAPIs.forEach(([name]) => {
      const api = apis.find(a => a.name === name);
      if (api) {
        console.log(`   chrome://flags/#${api.flag}`);
      }
    });
    console.log('   Set each flag to "Enabled" and restart Chrome');
  }
  
  const downloadableAPIs = Object.entries(results).filter(([name, status]) => 
    status === 'downloadable'
  );
  
  if (downloadableAPIs.length > 0) {
    console.log('\n2. Download models for available APIs:');
    console.log('   Visit: chrome://on-device-internals');
    console.log('   Or trigger download by creating sessions (see below)');
  }
  
  // Provide test functions
  console.log('\n🧪 Test Functions:');
  console.log('===================');
  
  // Test Prompt API
  if (results['Prompt API (LanguageModel)'] === 'available' || results['Prompt API (LanguageModel)'] === 'downloadable') {
    console.log('Test Prompt API:');
    console.log(`
async function testPromptAPI() {
  try {
    const session = await ai.languageModel.create({
      monitor: (m) => m.addEventListener('downloadprogress', (e) => 
        console.log(\`Download: \${Math.round(e.loaded * 100)}%\`))
    });
    const result = await session.prompt('Say hello in a friendly way');
    console.log('✅ Prompt API works:', result);
    session.destroy();
  } catch (error) {
    console.error('❌ Prompt API failed:', error);
  }
}
testPromptAPI();
    `);
  }
  
  // Test Summarizer API
  if (results['Summarizer API'] === 'available' || results['Summarizer API'] === 'downloadable') {
    console.log('Test Summarizer API:');
    console.log(`
async function testSummarizerAPI() {
  try {
    const session = await ai.summarizer.create({
      monitor: (m) => m.addEventListener('downloadprogress', (e) => 
        console.log(\`Download: \${Math.round(e.loaded * 100)}%\`))
    });
    const result = await session.summarize('This is a long text that needs to be summarized. It contains multiple ideas and should be condensed.');
    console.log('✅ Summarizer API works:', result);
    session.destroy();
  } catch (error) {
    console.error('❌ Summarizer API failed:', error);
  }
}
testSummarizerAPI();
    `);
  }
  
  console.log('\n📋 Summary:');
  console.log('============');
  
  const availableCount = Object.values(results).filter(status => 
    status === 'available' || status === 'downloadable'
  ).length;
  
  console.log(`Available APIs: ${availableCount}/${apis.length}`);
  
  if (availableCount === 0) {
    console.log('❌ No APIs available. Enable Chrome flags and restart Chrome.');
  } else if (availableCount < apis.length) {
    console.log('⚠️ Some APIs unavailable. Check flags and restart Chrome if needed.');
  } else {
    console.log('✅ All APIs available! You can now use Chrome AI features.');
  }
  
  console.log('\nFor detailed setup instructions, see: CHROME_AI_SETUP.md');
  console.log('For comprehensive diagnostics, open: chrome-ai-diagnostic.html');
  
  return results;
  
  // Helper function
  function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }
})();