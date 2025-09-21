/**
 * Test suite for Writing Intelligence UI System
 */

import SuggestionOverlay from './SuggestionOverlay.js';
import KeyboardNavigationManager from './KeyboardNavigationManager.js';
import AnimationManager from './AnimationManager.js';

// Mock DOM environment for testing
function setupMockDOM() {
  // Create a basic DOM structure
  document.body.innerHTML = `
    <div id="test-container">
      <textarea id="test-textarea" placeholder="Test text area">this is a test sentence with errors.</textarea>
      <div id="test-contenteditable" contenteditable="true">this is editable content.</div>
    </div>
  `;

  // Mock getBoundingClientRect
  Element.prototype.getBoundingClientRect = function() {
    return {
      left: 10,
      top: 10,
      width: 200,
      height: 20,
      right: 210,
      bottom: 30
    };
  };

  // Mock window.getSelection
  window.getSelection = () => ({
    rangeCount: 0,
    getRangeAt: () => null,
    removeAllRanges: () => {},
    addRange: () => {}
  });

  // Mock document.createRange
  document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    getBoundingClientRect: () => ({
      left: 10,
      top: 10,
      width: 50,
      height: 20
    })
  });

  // Mock matchMedia for reduced motion
  window.matchMedia = (query) => ({
    matches: query.includes('reduce'),
    addEventListener: () => {},
    removeEventListener: () => {}
  });
}

/**
 * Create mock suggestions for testing
 */
function createMockSuggestions() {
  return [
    {
      id: 'suggestion-1',
      type: 'grammar',
      range: { start: 0, end: 4 },
      original: 'this',
      replacement: 'This',
      confidence: 0.9,
      explanation: 'Capitalize first word of sentence',
      severity: 'error',
      applied: false,
      markAsApplied: function() { this.applied = true; },
      applyToText: function(text) {
        return text.substring(0, this.range.start) + this.replacement + text.substring(this.range.end);
      }
    },
    {
      id: 'suggestion-2',
      type: 'style',
      range: { start: 17, end: 25 },
      original: 'sentence',
      replacement: 'sentence,',
      confidence: 0.7,
      explanation: 'Add comma for better flow',
      severity: 'suggestion',
      applied: false,
      markAsApplied: function() { this.applied = true; },
      applyToText: function(text) {
        return text.substring(0, this.range.start) + this.replacement + text.substring(this.range.end);
      }
    },
    {
      id: 'suggestion-3',
      type: 'enhancement',
      range: { start: 31, end: 37 },
      original: 'errors',
      replacement: 'mistakes',
      confidence: 0.6,
      explanation: 'Consider using "mistakes" for variety',
      severity: 'suggestion',
      applied: false,
      markAsApplied: function() { this.applied = true; },
      applyToText: function(text) {
        return text.substring(0, this.range.start) + this.replacement + text.substring(this.range.end);
      }
    }
  ];
}

/**
 * Test SuggestionOverlay
 */
async function testSuggestionOverlay() {
  console.log('Testing SuggestionOverlay...');
  
  const overlay = new SuggestionOverlay();
  const testElement = document.getElementById('test-textarea');
  const suggestions = createMockSuggestions();
  
  try {
    // Test initialization
    console.log('  Testing initialization...');
    overlay.initialize();
    console.assert(overlay.isInitialized === true, 'Overlay should be initialized');
    
    const styles = document.getElementById('intellipen-overlay-styles');
    console.assert(styles !== null, 'Styles should be injected');
    
    // Test overlay creation
    console.log('  Testing overlay creation...');
    const overlayContainer = overlay.createOverlay(testElement, suggestions);
    console.assert(overlayContainer !== null, 'Should create overlay container');
    console.assert(overlayContainer.classList.contains('intellipen-overlay-container'), 'Should have correct class');
    console.assert(overlay.overlays.has(testElement), 'Should store overlay data');
    
    // Test suggestion highlights
    console.log('  Testing suggestion highlights...');
    const highlights = overlayContainer.querySelectorAll('.intellipen-suggestion-highlight');
    console.assert(highlights.length === suggestions.length, 'Should create highlight for each suggestion');
    
    // Test color coding
    const grammarHighlight = overlayContainer.querySelector('.intellipen-grammar');
    const styleHighlight = overlayContainer.querySelector('.intellipen-style');
    const enhancementHighlight = overlayContainer.querySelector('.intellipen-enhancement');
    
    console.assert(grammarHighlight !== null, 'Should create grammar highlight');
    console.assert(styleHighlight !== null, 'Should create style highlight');
    console.assert(enhancementHighlight !== null, 'Should create enhancement highlight');
    
    // Test tooltip functionality
    console.log('  Testing tooltip functionality...');
    const suggestion = suggestions[0];
    const highlightElement = highlights[0];
    
    overlay.showTooltip(suggestion, highlightElement, testElement);
    const tooltip = document.querySelector('.intellipen-tooltip');
    console.assert(tooltip !== null, 'Should create tooltip');
    console.assert(tooltip.textContent.includes(suggestion.explanation), 'Should show explanation');
    
    // Test control panel
    console.log('  Testing control panel...');
    overlay.showControlPanel(suggestions);
    const panel = document.getElementById('intellipen-control-panel');
    console.assert(panel !== null, 'Should create control panel');
    console.assert(panel.textContent.includes('IntelliPen'), 'Should show branding');
    console.assert(panel.textContent.includes('3'), 'Should show suggestion count');
    
    // Test suggestion application
    console.log('  Testing suggestion application...');
    const originalValue = testElement.value;
    overlay.applySuggestion(suggestion, testElement);
    console.assert(testElement.value !== originalValue, 'Should modify text');
    console.assert(suggestion.applied === true, 'Should mark suggestion as applied');
    
    // Test cleanup
    console.log('  Testing cleanup...');
    overlay.removeOverlay(testElement);
    console.assert(!overlay.overlays.has(testElement), 'Should remove overlay data');
    
    overlay.destroy();
    console.assert(overlay.isInitialized === false, 'Should mark as not initialized');
    
    console.log('✓ SuggestionOverlay tests passed');
    
  } catch (error) {
    console.error('✗ SuggestionOverlay test failed:', error);
    throw error;
  }
}

/**
 * Test KeyboardNavigationManager
 */
async function testKeyboardNavigationManager() {
  console.log('Testing KeyboardNavigationManager...');
  
  const overlay = new SuggestionOverlay();
  overlay.initialize();
  
  const keyboardManager = new KeyboardNavigationManager(overlay);
  const testElement = document.getElementById('test-textarea');
  const suggestions = createMockSuggestions();
  
  try {
    // Test initialization
    console.log('  Testing keyboard manager initialization...');
    console.assert(keyboardManager.isEnabled === true, 'Should be enabled by default');
    console.assert(keyboardManager.shortcuts.size > 0, 'Should have shortcuts defined');
    
    // Create overlay for testing
    overlay.createOverlay(testElement, suggestions);
    
    // Test focusable elements detection
    console.log('  Testing focusable elements detection...');
    keyboardManager.updateFocusableElements();
    console.assert(keyboardManager.focusableElements.length > 0, 'Should find focusable elements');
    
    // Test navigation
    console.log('  Testing navigation...');
    const initialIndex = keyboardManager.currentFocusIndex;
    keyboardManager.navigateNext();
    console.assert(keyboardManager.currentFocusIndex !== initialIndex, 'Should change focus index');
    
    // Test shortcut key parsing
    console.log('  Testing shortcut key parsing...');
    const mockEvent = {
      key: 'Tab',
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
      metaKey: false
    };
    const shortcutKey = keyboardManager.getShortcutKey(mockEvent);
    console.assert(shortcutKey === 'Tab', 'Should parse shortcut key correctly');
    
    // Test context detection
    console.log('  Testing context detection...');
    const highlight = document.querySelector('.intellipen-suggestion-highlight');
    if (highlight) {
      const isInContext = keyboardManager.isInIntelliPenContext(highlight);
      console.assert(isInContext === true, 'Should detect IntelliPen context');
    }
    
    // Test announcement system
    console.log('  Testing announcement system...');
    keyboardManager.announceMessage('Test message');
    const liveRegion = document.getElementById('intellipen-live-region');
    console.assert(liveRegion !== null, 'Should create live region');
    
    // Test help panel
    console.log('  Testing help panel...');
    keyboardManager.showHelp();
    const helpPanel = document.getElementById('intellipen-help-panel');
    console.assert(helpPanel !== null, 'Should create help panel');
    console.assert(helpPanel.textContent.includes('Keyboard Shortcuts'), 'Should show shortcuts');
    
    keyboardManager.hideHelp();
    
    // Test status
    console.log('  Testing status...');
    const status = keyboardManager.getStatus();
    console.assert(typeof status.enabled === 'boolean', 'Should report enabled status');
    console.assert(typeof status.focusableElementsCount === 'number', 'Should report element count');
    
    // Test cleanup
    keyboardManager.destroy();
    overlay.destroy();
    
    console.log('✓ KeyboardNavigationManager tests passed');
    
  } catch (error) {
    console.error('✗ KeyboardNavigationManager test failed:', error);
    throw error;
  }
}

/**
 * Test AnimationManager
 */
async function testAnimationManager() {
  console.log('Testing AnimationManager...');
  
  const animationManager = new AnimationManager();
  
  try {
    // Test initialization
    console.log('  Testing animation manager initialization...');
    console.assert(typeof animationManager.isReducedMotion === 'boolean', 'Should detect motion preference');
    console.assert(animationManager.defaultDuration > 0, 'Should have default duration');
    
    // Create test element
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.width = '100px';
    testElement.style.height = '20px';
    document.body.appendChild(testElement);
    
    // Test suggestion appearance animation
    console.log('  Testing suggestion appearance animation...');
    const appearancePromise = animationManager.animateSuggestionAppearance(testElement, { duration: 100 });
    console.assert(appearancePromise instanceof Promise, 'Should return promise');
    
    await appearancePromise;
    console.assert(testElement.style.opacity === '1', 'Should set final opacity');
    
    // Test suggestion removal animation
    console.log('  Testing suggestion removal animation...');
    const removalElement = testElement.cloneNode(true);
    document.body.appendChild(removalElement);
    
    const removalPromise = animationManager.animateSuggestionRemoval(removalElement, { duration: 100 });
    await removalPromise;
    console.assert(!document.body.contains(removalElement), 'Should remove element');
    
    // Test tooltip animations
    console.log('  Testing tooltip animations...');
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'intellipen-tooltip';
    document.body.appendChild(tooltipElement);
    
    await animationManager.animateTooltipAppearance(tooltipElement, { duration: 100 });
    console.assert(tooltipElement.classList.contains('show'), 'Should add show class');
    
    await animationManager.animateTooltipRemoval(tooltipElement, { duration: 100 });
    console.assert(!document.body.contains(tooltipElement), 'Should remove tooltip');
    
    // Test control panel animations
    console.log('  Testing control panel animations...');
    const panelElement = document.createElement('div');
    panelElement.className = 'intellipen-control-panel';
    document.body.appendChild(panelElement);
    
    await animationManager.animateControlPanelAppearance(panelElement, { duration: 100 });
    console.assert(panelElement.classList.contains('show'), 'Should add show class');
    
    await animationManager.animateControlPanelRemoval(panelElement, { duration: 100 });
    console.assert(!document.body.contains(panelElement), 'Should remove panel');
    
    // Test text replacement animation
    console.log('  Testing text replacement animation...');
    const textElement = document.createElement('span');
    textElement.textContent = 'old text';
    document.body.appendChild(textElement);
    
    await animationManager.animateTextReplacement(textElement, 'old text', 'new text', { duration: 100 });
    console.assert(textElement.textContent === 'new text', 'Should update text');
    
    // Test reduced motion
    console.log('  Testing reduced motion...');
    animationManager.setReducedMotion(true);
    console.assert(animationManager.isReducedMotion === true, 'Should set reduced motion');
    
    const quickElement = document.createElement('div');
    document.body.appendChild(quickElement);
    
    const quickPromise = animationManager.animateSuggestionAppearance(quickElement);
    await quickPromise;
    // With reduced motion, animations should complete immediately
    
    // Test animation cancellation
    console.log('  Testing animation cancellation...');
    animationManager.setReducedMotion(false);
    
    const cancelElement = document.createElement('div');
    document.body.appendChild(cancelElement);
    
    const cancelPromise = animationManager.animateSuggestionAppearance(cancelElement, { duration: 1000 });
    animationManager.cancelAnimation(cancelElement);
    
    await cancelPromise; // Should resolve immediately after cancellation
    
    // Test staggered animations
    console.log('  Testing staggered animations...');
    const elements = [
      document.createElement('div'),
      document.createElement('div'),
      document.createElement('div')
    ];
    
    elements.forEach(el => document.body.appendChild(el));
    
    const staggerPromise = animationManager.animateStaggered(
      elements,
      (el) => animationManager.animateSuggestionAppearance(el, { duration: 50 }),
      { staggerDelay: 10 }
    );
    
    await staggerPromise;
    console.assert(elements.every(el => el.style.opacity === '1'), 'Should animate all elements');
    
    // Test cleanup
    animationManager.destroy();
    console.assert(animationManager.getRunningAnimationsCount() === 0, 'Should cancel all animations');
    
    // Clean up test elements
    document.querySelectorAll('div, span').forEach(el => {
      if (el.id !== 'test-container' && !el.id.startsWith('test-')) {
        el.remove();
      }
    });
    
    console.log('✓ AnimationManager tests passed');
    
  } catch (error) {
    console.error('✗ AnimationManager test failed:', error);
    throw error;
  }
}

/**
 * Test UI integration
 */
async function testUIIntegration() {
  console.log('Testing UI system integration...');
  
  try {
    // Test complete UI workflow
    console.log('  Testing complete UI workflow...');
    
    const overlay = new SuggestionOverlay();
    const animationManager = new AnimationManager();
    const keyboardManager = new KeyboardNavigationManager(overlay);
    
    overlay.initialize();
    
    const testElement = document.getElementById('test-contenteditable');
    const suggestions = createMockSuggestions();
    
    // Create overlay with animations
    const overlayContainer = overlay.createOverlay(testElement, suggestions);
    const highlights = overlayContainer.querySelectorAll('.intellipen-suggestion-highlight');
    
    // Animate highlights appearance
    for (const highlight of highlights) {
      await animationManager.animateSuggestionAppearance(highlight, { duration: 50 });
    }
    
    // Test keyboard navigation
    keyboardManager.updateFocusableElements();
    console.assert(keyboardManager.focusableElements.length > 0, 'Should find focusable elements');
    
    // Test tooltip with animation
    const firstSuggestion = suggestions[0];
    const firstHighlight = highlights[0];
    
    overlay.showTooltip(firstSuggestion, firstHighlight, testElement);
    const tooltip = document.querySelector('.intellipen-tooltip');
    
    if (tooltip) {
      await animationManager.animateTooltipAppearance(tooltip, { duration: 50 });
      console.assert(tooltip.classList.contains('show'), 'Should show tooltip');
      
      await animationManager.animateTooltipRemoval(tooltip, { duration: 50 });
    }
    
    // Test control panel with animation
    overlay.showControlPanel(suggestions);
    const panel = document.getElementById('intellipen-control-panel');
    
    if (panel) {
      await animationManager.animateControlPanelAppearance(panel, { duration: 50 });
      console.assert(panel.classList.contains('show'), 'Should show control panel');
      
      await animationManager.animateControlPanelRemoval(panel, { duration: 50 });
    }
    
    // Test suggestion application with animation
    await animationManager.animateSuggestionApplication(firstHighlight, { duration: 50 });
    
    // Cleanup
    overlay.destroy();
    animationManager.destroy();
    keyboardManager.destroy();
    
    console.log('✓ UI integration tests passed');
    
  } catch (error) {
    console.error('✗ UI integration test failed:', error);
    throw error;
  }
}

/**
 * Test accessibility features
 */
async function testAccessibility() {
  console.log('Testing accessibility features...');
  
  try {
    const overlay = new SuggestionOverlay();
    const keyboardManager = new KeyboardNavigationManager(overlay);
    
    overlay.initialize();
    
    const testElement = document.getElementById('test-textarea');
    const suggestions = createMockSuggestions();
    
    // Create overlay
    const overlayContainer = overlay.createOverlay(testElement, suggestions);
    const highlights = overlayContainer.querySelectorAll('.intellipen-suggestion-highlight');
    
    // Test ARIA attributes
    console.log('  Testing ARIA attributes...');
    highlights.forEach(highlight => {
      console.assert(highlight.hasAttribute('aria-label'), 'Should have aria-label');
      console.assert(highlight.getAttribute('role') === 'button', 'Should have button role');
      console.assert(highlight.hasAttribute('tabindex'), 'Should be focusable');
    });
    
    // Test keyboard navigation
    console.log('  Testing keyboard accessibility...');
    keyboardManager.updateFocusableElements();
    
    // Simulate Tab key
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    document.dispatchEvent(tabEvent);
    
    // Test live region for announcements
    console.log('  Testing screen reader announcements...');
    keyboardManager.announceMessage('Test announcement');
    const liveRegion = document.getElementById('intellipen-live-region');
    
    console.assert(liveRegion !== null, 'Should create live region');
    console.assert(liveRegion.getAttribute('aria-live') === 'polite', 'Should have aria-live');
    console.assert(liveRegion.textContent.includes('Test announcement'), 'Should announce message');
    
    // Test high contrast support
    console.log('  Testing high contrast support...');
    const styles = document.getElementById('intellipen-overlay-styles');
    console.assert(styles.textContent.includes('@media (prefers-contrast: high)'), 'Should include high contrast styles');
    
    // Test reduced motion support
    console.log('  Testing reduced motion support...');
    console.assert(styles.textContent.includes('@media (prefers-reduced-motion: reduce)'), 'Should include reduced motion styles');
    
    // Cleanup
    overlay.destroy();
    keyboardManager.destroy();
    
    console.log('✓ Accessibility tests passed');
    
  } catch (error) {
    console.error('✗ Accessibility test failed:', error);
    throw error;
  }
}

/**
 * Run all UI tests
 */
async function runAllUITests() {
  console.log('Running Writing Intelligence UI System Tests...\n');
  
  // Setup mock DOM
  setupMockDOM();
  
  try {
    await testSuggestionOverlay();
    await testKeyboardNavigationManager();
    await testAnimationManager();
    await testUIIntegration();
    await testAccessibility();
    
    console.log('\n✅ All UI system tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Some UI tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export {
  testSuggestionOverlay,
  testKeyboardNavigationManager,
  testAnimationManager,
  testUIIntegration,
  testAccessibility,
  runAllUITests
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment
  runAllUITests().then(success => {
    if (success) {
      console.log('All UI tests completed successfully!');
    } else {
      console.error('Some UI tests failed!');
    }
  });
} else if (typeof process !== 'undefined' && process.argv) {
  // Node.js environment
  runAllUITests().then(success => {
    process.exit(success ? 0 : 1);
  });
}