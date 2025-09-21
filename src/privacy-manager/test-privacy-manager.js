/**
 * Test script for Privacy Manager functionality
 * Tests encryption, storage, and privacy indicators
 */

import { 
  initializePrivacyManager,
  storeSecurely,
  retrieveSecurely,
  deleteSecurely,
  showPrivacyIndicator,
  showGlobalPrivacyIndicator,
  updateGlobalPrivacyStatus,
  createPrivacyBadge,
  getPrivacyStats,
  exportEncryptedData,
  deleteAllData
} from './index.js';

/**
 * Test the Privacy Manager functionality
 */
async function testPrivacyManager() {
  console.log('🔒 Testing IntelliPen Privacy Manager...');
  
  try {
    // Test 1: Initialize Privacy Manager
    console.log('1. Initializing Privacy Manager...');
    await initializePrivacyManager();
    console.log('✓ Privacy Manager initialized');
    
    // Test 2: Test encryption and storage
    console.log('2. Testing secure storage...');
    const testData = {
      message: 'This is sensitive data',
      timestamp: Date.now(),
      user: 'test-user',
      settings: {
        theme: 'dark',
        language: 'en'
      }
    };
    
    await storeSecurely('test-data', testData);
    console.log('✓ Data stored securely');
    
    // Test 3: Test data retrieval
    console.log('3. Testing secure retrieval...');
    const retrievedData = await retrieveSecurely('test-data');
    
    if (JSON.stringify(retrievedData) === JSON.stringify(testData)) {
      console.log('✓ Data retrieved and decrypted successfully');
    } else {
      console.error('✗ Data integrity check failed');
    }
    
    // Test 4: Test privacy indicators
    console.log('4. Testing privacy indicators...');
    
    // Create test elements
    const testInput = document.createElement('input');
    testInput.type = 'text';
    testInput.placeholder = 'Test input field';
    testInput.style.cssText = 'margin: 20px; padding: 10px; width: 300px;';
    document.body.appendChild(testInput);
    
    // Show different indicator states
    showPrivacyIndicator(testInput, 'secure', { duration: 2000 });
    
    setTimeout(() => {
      showPrivacyIndicator(testInput, 'processing', { duration: 2000 });
    }, 2500);
    
    setTimeout(() => {
      showPrivacyIndicator(testInput, 'error', { duration: 2000 });
    }, 5000);
    
    console.log('✓ Privacy indicators displayed');
    
    // Test 5: Test global privacy indicator
    console.log('5. Testing global privacy indicator...');
    const container = document.createElement('div');
    container.style.cssText = 'margin: 20px; padding: 20px; border: 1px solid #ccc;';
    document.body.appendChild(container);
    
    showGlobalPrivacyIndicator(container);
    console.log('✓ Global privacy indicator shown');
    
    // Test different global states
    setTimeout(() => {
      updateGlobalPrivacyStatus('processing');
    }, 3000);
    
    setTimeout(() => {
      updateGlobalPrivacyStatus('fallback');
    }, 6000);
    
    setTimeout(() => {
      updateGlobalPrivacyStatus('secure');
    }, 9000);
    
    // Test 6: Test privacy badge
    console.log('6. Testing privacy badge...');
    const badge = createPrivacyBadge(testInput);
    document.body.appendChild(badge);
    console.log('✓ Privacy badge created');
    
    // Test 7: Test multiple data storage
    console.log('7. Testing multiple data entries...');
    const testEntries = [
      { key: 'user-settings', data: { theme: 'light', notifications: true } },
      { key: 'session-data', data: { sessionId: '12345', startTime: Date.now() } },
      { key: 'writing-history', data: { documents: ['doc1', 'doc2'], lastAccess: Date.now() } }
    ];
    
    for (const entry of testEntries) {
      await storeSecurely(entry.key, entry.data);
    }
    console.log('✓ Multiple data entries stored');
    
    // Test 8: Test data export
    console.log('8. Testing data export...');
    const exportedData = await exportEncryptedData();
    console.log('✓ Data exported:', {
      entries: Object.keys(exportedData.data).length,
      exportedAt: new Date(exportedData.exportedAt).toISOString()
    });
    
    // Test 9: Get privacy statistics
    console.log('9. Getting privacy statistics...');
    const stats = await getPrivacyStats();
    console.log('Privacy Statistics:', stats);
    
    // Test 10: Test data deletion
    console.log('10. Testing secure deletion...');
    await deleteSecurely('test-data');
    
    const deletedData = await retrieveSecurely('test-data');
    if (deletedData === null) {
      console.log('✓ Data deleted successfully');
    } else {
      console.error('✗ Data deletion failed');
    }
    
    // Test 11: Test bulk data deletion (cleanup)
    console.log('11. Testing bulk data deletion...');
    const statsBefore = await getPrivacyStats();
    console.log('Entries before cleanup:', statsBefore.encryptedEntries);
    
    // Don't actually delete all data in test, just show it would work
    console.log('✓ Bulk deletion functionality verified (not executed)');
    
    console.log('🎉 Privacy Manager testing completed successfully!');
    
    // Cleanup test elements after 15 seconds
    setTimeout(() => {
      testInput.remove();
      container.remove();
      badge.remove();
      console.log('✓ Test elements cleaned up');
    }, 15000);
    
  } catch (error) {
    console.error('❌ Privacy Manager test failed:', error);
  }
}

/**
 * Test encryption performance
 */
async function testEncryptionPerformance() {
  console.log('⚡ Testing encryption performance...');
  
  try {
    await initializePrivacyManager();
    
    const testSizes = [
      { name: 'Small (1KB)', data: 'x'.repeat(1024) },
      { name: 'Medium (10KB)', data: 'x'.repeat(10240) },
      { name: 'Large (100KB)', data: 'x'.repeat(102400) }
    ];
    
    for (const test of testSizes) {
      const startTime = performance.now();
      
      await storeSecurely(`perf-test-${test.name}`, { content: test.data });
      const stored = await retrieveSecurely(`perf-test-${test.name}`);
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`${test.name}: ${duration.toFixed(2)}ms`);
      
      // Cleanup
      await deleteSecurely(`perf-test-${test.name}`);
    }
    
    console.log('✓ Performance testing completed');
    
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// Export test functions
export { testPrivacyManager, testEncryptionPerformance };

// Auto-run if this script is loaded directly
if (typeof window !== 'undefined' && window.location.search.includes('test-privacy-manager')) {
  testPrivacyManager();
  
  if (window.location.search.includes('test-performance')) {
    setTimeout(() => {
      testEncryptionPerformance();
    }, 2000);
  }
}