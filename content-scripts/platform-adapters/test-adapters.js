/**
 * Test suite for platform adapters
 * Run this in browser console to test adapter functionality
 */

async function testPlatformAdapters() {
  console.log('IntelliPen: Testing platform adapters...');
  
  const results = {
    universal: false,
    gmail: false,
    linkedin: false,
    notion: false,
    googleDocs: false,
    loader: false
  };

  try {
    // Test AdapterLoader
    if (window.AdapterLoader) {
      const loader = new window.AdapterLoader();
      console.log('✓ AdapterLoader available');
      results.loader = true;
      
      // Test loading adapters
      const loadResult = await loader.loadAdaptersForCurrentSite();
      console.log('✓ Adapter loading test:', loadResult);
    } else {
      console.log('✗ AdapterLoader not available');
    }

    // Test UniversalAdapter
    if (window.UniversalAdapter) {
      const adapter = new window.UniversalAdapter();
      const fields = adapter.getTextFields();
      console.log('✓ UniversalAdapter working, found', fields.length, 'fields');
      results.universal = true;
    } else {
      console.log('✗ UniversalAdapter not available');
    }

    // Test GmailAdapter (if on Gmail)
    if (window.location.hostname.includes('gmail.com')) {
      if (window.GmailAdapter) {
        const adapter = new window.GmailAdapter();
        const fields = adapter.getTextFields();
        console.log('✓ GmailAdapter working, found', fields.length, 'fields');
        results.gmail = true;
      } else {
        console.log('✗ GmailAdapter not available on Gmail');
      }
    }

    // Test LinkedInAdapter (if on LinkedIn)
    if (window.location.hostname.includes('linkedin.com')) {
      if (window.LinkedInAdapter) {
        const adapter = new window.LinkedInAdapter();
        const fields = adapter.getTextFields();
        console.log('✓ LinkedInAdapter working, found', fields.length, 'fields');
        results.linkedin = true;
      } else {
        console.log('✗ LinkedInAdapter not available on LinkedIn');
      }
    }

    // Test NotionAdapter (if on Notion)
    if (window.location.hostname.includes('notion.so') || window.location.hostname.includes('notion.site')) {
      if (window.NotionAdapter) {
        const adapter = new window.NotionAdapter();
        const fields = adapter.getTextFields();
        console.log('✓ NotionAdapter working, found', fields.length, 'fields');
        results.notion = true;
      } else {
        console.log('✗ NotionAdapter not available on Notion');
      }
    }

    // Test GoogleDocsAdapter (if on Google Docs)
    if (window.location.hostname.includes('docs.google.com')) {
      if (window.GoogleDocsAdapter) {
        const adapter = new window.GoogleDocsAdapter();
        const fields = adapter.getTextFields();
        console.log('✓ GoogleDocsAdapter working, found', fields.length, 'fields');
        results.googleDocs = true;
      } else {
        console.log('✗ GoogleDocsAdapter not available on Google Docs');
      }
    }

    console.log('IntelliPen: Adapter test results:', results);
    return results;

  } catch (error) {
    console.error('IntelliPen: Adapter test failed:', error);
    return results;
  }
}

// Test field context detection
function testFieldContextDetection() {
  console.log('IntelliPen: Testing field context detection...');
  
  const textFields = document.querySelectorAll('textarea, input[type="text"], [contenteditable="true"]');
  console.log(`Found ${textFields.length} text fields to analyze`);
  
  textFields.forEach((field, index) => {
    if (index < 5) { // Test first 5 fields only
      const adapter = new (window.UniversalAdapter || class {
        getFieldContext() { return { type: 'test', purpose: 'test' }; }
      })();
      
      const context = adapter.getFieldContext(field);
      console.log(`Field ${index + 1}:`, {
        element: field.tagName.toLowerCase(),
        placeholder: field.placeholder,
        context: context
      });
    }
  });
}

// Export test functions
if (typeof window !== 'undefined') {
  window.testPlatformAdapters = testPlatformAdapters;
  window.testFieldContextDetection = testFieldContextDetection;
}

console.log('IntelliPen: Test functions loaded. Run testPlatformAdapters() or testFieldContextDetection() to test.');