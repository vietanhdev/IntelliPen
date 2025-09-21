/**
 * PrivacyIndicatorUI - UI components for showing privacy status
 * Provides visual indicators for local processing status
 */
class PrivacyIndicatorUI {
  constructor(privacyManager) {
    this.privacyManager = privacyManager;
    this.indicators = new Map();
    this.globalIndicator = null;
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for privacy indicator updates
   */
  setupEventListeners() {
    if (typeof window !== 'undefined') {
      // Listen for AI processing events
      window.addEventListener('intellipen-ai-processing-start', (event) => {
        this.showProcessingIndicator(event.detail.element, event.detail.apiName);
      });

      window.addEventListener('intellipen-ai-processing-complete', (event) => {
        this.showSecureIndicator(event.detail.element);
      });

      window.addEventListener('intellipen-ai-processing-error', (event) => {
        this.showErrorIndicator(event.detail.element, event.detail.error);
      });

      // Listen for fallback mode changes
      window.addEventListener('intellipen-fallback-mode', (event) => {
        this.updateGlobalPrivacyStatus(event.detail.active ? 'fallback' : 'secure');
      });
    }
  }

  /**
   * Show processing indicator for an element
   * @param {HTMLElement} element - Target element
   * @param {string} apiName - Name of the API being used
   */
  showProcessingIndicator(element, apiName) {
    const message = `Processing with ${apiName} (Local AI)`;
    this.privacyManager.showPrivacyIndicator(element, 'processing', {
      message,
      duration: 0 // Don't auto-hide while processing
    });
  }

  /**
   * Show secure indicator for an element
   * @param {HTMLElement} element - Target element
   */
  showSecureIndicator(element) {
    this.privacyManager.showPrivacyIndicator(element, 'secure', {
      message: 'Processed Locally',
      duration: 2000
    });
  }

  /**
   * Show error indicator for an element
   * @param {HTMLElement} element - Target element
   * @param {string} error - Error message
   */
  showErrorIndicator(element, error) {
    this.privacyManager.showPrivacyIndicator(element, 'error', {
      message: 'Processing Failed',
      duration: 3000
    });
  }

  /**
   * Create global privacy status indicator
   * @returns {HTMLElement}
   */
  createGlobalPrivacyIndicator() {
    if (this.globalIndicator) {
      return this.globalIndicator;
    }

    const indicator = document.createElement('div');
    indicator.id = 'intellipen-global-privacy-indicator';
    indicator.className = 'intellipen-global-privacy-indicator';
    
    indicator.innerHTML = `
      <div class="privacy-icon">🔒</div>
      <div class="privacy-text">
        <div class="privacy-title">IntelliPen Privacy</div>
        <div class="privacy-status">All processing happens locally</div>
      </div>
      <div class="privacy-details">
        <div class="detail-item">
          <span class="detail-icon">🖥️</span>
          <span class="detail-text">Local AI Processing</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">🔐</span>
          <span class="detail-text">AES-256 Encryption</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">🚫</span>
          <span class="detail-text">No Data Sent to Servers</span>
        </div>
      </div>
    `;

    this.injectGlobalIndicatorStyles();
    this.globalIndicator = indicator;
    return indicator;
  }

  /**
   * Inject CSS styles for global privacy indicator
   */
  injectGlobalIndicatorStyles() {
    if (document.getElementById('intellipen-global-privacy-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'intellipen-global-privacy-styles';
    style.textContent = `
      .intellipen-global-privacy-indicator {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        max-width: 300px;
        position: relative;
        overflow: hidden;
      }

      .intellipen-global-privacy-indicator::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #10b981, #059669);
      }

      .intellipen-global-privacy-indicator .privacy-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }

      .intellipen-global-privacy-indicator .privacy-title {
        font-weight: 600;
        font-size: 16px;
        color: #065f46;
        margin-bottom: 4px;
      }

      .intellipen-global-privacy-indicator .privacy-status {
        font-size: 14px;
        color: #059669;
        margin-bottom: 12px;
      }

      .intellipen-global-privacy-indicator .privacy-details {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .intellipen-global-privacy-indicator .detail-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #047857;
      }

      .intellipen-global-privacy-indicator .detail-icon {
        font-size: 14px;
        width: 16px;
        text-align: center;
      }

      .intellipen-global-privacy-indicator.processing {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border-color: #93c5fd;
      }

      .intellipen-global-privacy-indicator.processing::before {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }

      .intellipen-global-privacy-indicator.processing .privacy-title {
        color: #1e40af;
      }

      .intellipen-global-privacy-indicator.processing .privacy-status {
        color: #2563eb;
      }

      .intellipen-global-privacy-indicator.processing .detail-item {
        color: #1d4ed8;
      }

      .intellipen-global-privacy-indicator.fallback {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border-color: #fbbf24;
      }

      .intellipen-global-privacy-indicator.fallback::before {
        background: linear-gradient(90deg, #f59e0b, #d97706);
      }

      .intellipen-global-privacy-indicator.fallback .privacy-title {
        color: #92400e;
      }

      .intellipen-global-privacy-indicator.fallback .privacy-status {
        color: #d97706;
      }

      .intellipen-global-privacy-indicator.fallback .detail-item {
        color: #b45309;
      }

      .intellipen-global-privacy-indicator.error {
        background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
        border-color: #fca5a5;
      }

      .intellipen-global-privacy-indicator.error::before {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .intellipen-global-privacy-indicator.error .privacy-title {
        color: #991b1b;
      }

      .intellipen-global-privacy-indicator.error .privacy-status {
        color: #dc2626;
      }

      .intellipen-global-privacy-indicator.error .detail-item {
        color: #b91c1c;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Update global privacy status
   * @param {string} status - Status: 'secure', 'processing', 'fallback', 'error'
   */
  updateGlobalPrivacyStatus(status) {
    if (!this.globalIndicator) {
      return;
    }

    // Remove existing status classes
    this.globalIndicator.classList.remove('secure', 'processing', 'fallback', 'error');
    this.globalIndicator.classList.add(status);

    // Update content based on status
    const statusText = this.globalIndicator.querySelector('.privacy-status');
    const icon = this.globalIndicator.querySelector('.privacy-icon');

    switch (status) {
      case 'secure':
        statusText.textContent = 'All processing happens locally';
        icon.textContent = '🔒';
        break;
      case 'processing':
        statusText.textContent = 'AI processing in progress...';
        icon.textContent = '⚡';
        break;
      case 'fallback':
        statusText.textContent = 'Limited functionality (fallback mode)';
        icon.textContent = '⚠️';
        break;
      case 'error':
        statusText.textContent = 'Some features temporarily unavailable';
        icon.textContent = '❌';
        break;
    }
  }

  /**
   * Show global privacy indicator in a specific container
   * @param {HTMLElement} container - Container element
   */
  showGlobalIndicator(container) {
    const indicator = this.createGlobalPrivacyIndicator();
    
    if (container && !container.contains(indicator)) {
      container.appendChild(indicator);
    }
  }

  /**
   * Hide global privacy indicator
   */
  hideGlobalIndicator() {
    if (this.globalIndicator && this.globalIndicator.parentNode) {
      this.globalIndicator.remove();
    }
  }

  /**
   * Create privacy badge for text inputs
   * @param {HTMLElement} inputElement - Input element to attach badge to
   * @returns {HTMLElement}
   */
  createPrivacyBadge(inputElement) {
    const badge = document.createElement('div');
    badge.className = 'intellipen-privacy-badge';
    badge.innerHTML = `
      <span class="badge-icon">🔒</span>
      <span class="badge-text">Private</span>
    `;

    // Position badge relative to input
    this.positionPrivacyBadge(badge, inputElement);

    // Add styles if not already added
    this.injectPrivacyBadgeStyles();

    return badge;
  }

  /**
   * Position privacy badge relative to input element
   * @param {HTMLElement} badge - Badge element
   * @param {HTMLElement} input - Input element
   */
  positionPrivacyBadge(badge, input) {
    const rect = input.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    badge.style.position = 'absolute';
    badge.style.left = `${rect.right + scrollX - 60}px`;
    badge.style.top = `${rect.top + scrollY - 25}px`;
    badge.style.zIndex = '10001';
  }

  /**
   * Inject CSS styles for privacy badges
   */
  injectPrivacyBadgeStyles() {
    if (document.getElementById('intellipen-privacy-badge-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'intellipen-privacy-badge-styles';
    style.textContent = `
      .intellipen-privacy-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: rgba(34, 197, 94, 0.9);
        color: white;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        pointer-events: none;
        animation: slideInBadge 0.3s ease-out;
      }

      .intellipen-privacy-badge .badge-icon {
        font-size: 10px;
      }

      @keyframes slideInBadge {
        from { 
          opacity: 0; 
          transform: translateY(-10px) scale(0.8); 
        }
        to { 
          opacity: 1; 
          transform: translateY(0) scale(1); 
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Show privacy tooltip on hover
   * @param {HTMLElement} element - Element to show tooltip for
   * @param {string} message - Tooltip message
   */
  showPrivacyTooltip(element, message) {
    const tooltip = document.createElement('div');
    tooltip.className = 'intellipen-privacy-tooltip';
    tooltip.textContent = message;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    tooltip.style.position = 'absolute';
    tooltip.style.left = `${rect.left + scrollX}px`;
    tooltip.style.top = `${rect.bottom + scrollY + 5}px`;
    tooltip.style.zIndex = '10002';

    // Add styles
    this.injectTooltipStyles();

    document.body.appendChild(tooltip);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.remove();
      }
    }, 3000);
  }

  /**
   * Inject CSS styles for privacy tooltips
   */
  injectTooltipStyles() {
    if (document.getElementById('intellipen-tooltip-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'intellipen-tooltip-styles';
    style.textContent = `
      .intellipen-privacy-tooltip {
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 200px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: fadeInTooltip 0.2s ease-out;
        pointer-events: none;
      }

      @keyframes fadeInTooltip {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Get privacy indicator statistics
   * @returns {Object}
   */
  getIndicatorStats() {
    return {
      activeIndicators: this.indicators.size,
      globalIndicatorVisible: !!this.globalIndicator?.parentNode,
      globalIndicatorStatus: this.globalIndicator?.classList.contains('processing') ? 'processing' :
                            this.globalIndicator?.classList.contains('fallback') ? 'fallback' :
                            this.globalIndicator?.classList.contains('error') ? 'error' : 'secure'
    };
  }

  /**
   * Cleanup all indicators
   */
  cleanup() {
    // Remove all individual indicators
    for (const indicator of this.indicators.values()) {
      if (indicator.parentNode) {
        indicator.remove();
      }
    }
    this.indicators.clear();

    // Remove global indicator
    this.hideGlobalIndicator();

    console.log('✓ Privacy indicator UI cleaned up');
  }
}

export default PrivacyIndicatorUI;