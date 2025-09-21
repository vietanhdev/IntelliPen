/**
 * SuggestionOverlay - Visual suggestion overlay system with IntelliPen branding
 * Provides color-coded indicators and smooth animations for writing suggestions
 */
class SuggestionOverlay {
    constructor() {
        this.overlays = new Map(); // element -> overlay data
        this.activeElement = null;
        this.suggestionElements = new Map(); // suggestion ID -> DOM element
        this.animationDuration = 300; // ms
        this.isInitialized = false;

        // Color scheme for different suggestion types
        this.colors = {
            grammar: '#dc3545',    // Red for grammar errors
            style: '#ffc107',      // Amber for style suggestions  
            enhancement: '#007bff', // Blue for enhancements
            tone: '#6f42c1',       // Purple for tone adjustments
            clarity: '#20c997'     // Teal for clarity improvements
        };

        this.severityColors = {
            error: '#dc3545',
            warning: '#fd7e14',
            suggestion: '#6c757d'
        };
    }

    /**
     * Initialize the overlay system
     */
    initialize() {
        if (this.isInitialized) return;

        this.injectStyles();
        this.setupEventListeners();
        this.isInitialized = true;

        console.log('SuggestionOverlay initialized');
    }

    /**
     * Inject CSS styles for the overlay system
     */
    injectStyles() {
        if (document.getElementById('intellipen-overlay-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'intellipen-overlay-styles';
        styles.textContent = `
      /* IntelliPen Overlay Base Styles */
      .intellipen-overlay-container {
        position: absolute;
        pointer-events: none;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .intellipen-suggestion-highlight {
        position: absolute;
        border-radius: 2px;
        pointer-events: auto;
        cursor: pointer;
        transition: all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        animation: intellipen-fade-in ${this.animationDuration}ms ease-out;
      }
      
      .intellipen-suggestion-highlight:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }
      
      /* Suggestion type styles */
      .intellipen-grammar {
        background-color: rgba(220, 53, 69, 0.15);
        border-bottom: 2px wavy ${this.colors.grammar};
      }
      
      .intellipen-style {
        background-color: rgba(255, 193, 7, 0.15);
        border-bottom: 2px solid ${this.colors.style};
      }
      
      .intellipen-enhancement {
        background-color: rgba(0, 123, 255, 0.15);
        border-bottom: 2px dotted ${this.colors.enhancement};
      }
      
      .intellipen-tone {
        background-color: rgba(111, 66, 193, 0.15);
        border-bottom: 2px dashed ${this.colors.tone};
      }
      
      .intellipen-clarity {
        background-color: rgba(32, 201, 151, 0.15);
        border-bottom: 2px solid ${this.colors.clarity};
      }
      
      /* Suggestion tooltip */
      .intellipen-tooltip {
        position: absolute;
        background: #2c3e50;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        line-height: 1.4;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        z-index: 1000000;
        opacity: 0;
        transform: translateY(10px);
        transition: all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
      }
      
      .intellipen-tooltip.show {
        opacity: 1;
        transform: translateY(0);
      }
      
      .intellipen-tooltip::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-bottom: 6px solid #2c3e50;
      }
      
      .intellipen-tooltip-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .intellipen-tooltip-icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: white;
      }
      
      .intellipen-tooltip-content {
        margin-bottom: 8px;
      }
      
      .intellipen-tooltip-suggestion {
        background: rgba(255, 255, 255, 0.1);
        padding: 6px 8px;
        border-radius: 4px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
        margin: 4px 0;
      }
      
      .intellipen-tooltip-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      
      .intellipen-tooltip-button {
        background: #3498db;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
        pointer-events: auto;
      }
      
      .intellipen-tooltip-button:hover {
        background: #2980b9;
      }
      
      .intellipen-tooltip-button.secondary {
        background: #95a5a6;
      }
      
      .intellipen-tooltip-button.secondary:hover {
        background: #7f8c8d;
      }
      
      /* Floating control panel */
      .intellipen-control-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        padding: 16px;
        z-index: 1000001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        min-width: 200px;
        opacity: 0;
        transform: translateX(20px);
        transition: all ${this.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .intellipen-control-panel.show {
        opacity: 1;
        transform: translateX(0);
      }
      
      .intellipen-panel-header {
        display: flex;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e9ecef;
      }
      
      .intellipen-logo {
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      }
      
      .intellipen-panel-title {
        font-weight: 600;
        color: #2c3e50;
        font-size: 14px;
      }
      
      .intellipen-stats {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .intellipen-stat-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
      }
      
      .intellipen-stat-label {
        color: #6c757d;
      }
      
      .intellipen-stat-value {
        font-weight: 600;
        color: #2c3e50;
      }
      
      .intellipen-stat-badge {
        background: #e9ecef;
        color: #495057;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
      }
      
      .intellipen-stat-badge.error {
        background: #f8d7da;
        color: #721c24;
      }
      
      .intellipen-stat-badge.warning {
        background: #fff3cd;
        color: #856404;
      }
      
      .intellipen-stat-badge.suggestion {
        background: #d1ecf1;
        color: #0c5460;
      }
      
      /* Animations */
      @keyframes intellipen-fade-in {
        from {
          opacity: 0;
          transform: translateY(5px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes intellipen-pulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.05);
        }
      }
      
      .intellipen-pulse {
        animation: intellipen-pulse 2s infinite;
      }
      
      /* Accessibility */
      .intellipen-suggestion-highlight:focus {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .intellipen-suggestion-highlight,
        .intellipen-tooltip,
        .intellipen-control-panel {
          transition: none;
          animation: none;
        }
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .intellipen-grammar {
          border-bottom-width: 3px;
        }
        .intellipen-style {
          border-bottom-width: 3px;
        }
        .intellipen-enhancement {
          border-bottom-width: 3px;
        }
      }
    `;

        document.head.appendChild(styles);
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Handle clicks outside tooltips to close them
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.intellipen-tooltip') &&
                !e.target.closest('.intellipen-suggestion-highlight')) {
                this.hideAllTooltips();
            }
        });

        // Handle escape key to close tooltips
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllTooltips();
            }
        });

        // Handle window resize to reposition overlays
        window.addEventListener('resize', () => {
            this.repositionAllOverlays();
        });

        // Handle scroll to reposition overlays
        document.addEventListener('scroll', () => {
            this.repositionAllOverlays();
        }, { passive: true });
    }

    /**
     * Create overlay for a text element with suggestions
     */
    createOverlay(element, suggestions) {
        if (!this.isInitialized) {
            this.initialize();
        }

        // Remove existing overlay if present
        this.removeOverlay(element);

        const overlayContainer = document.createElement('div');
        overlayContainer.className = 'intellipen-overlay-container';

        // Position the overlay container
        this.positionOverlayContainer(overlayContainer, element);

        // Create suggestion highlights
        const suggestionElements = [];
        suggestions.forEach((suggestion, index) => {
            const highlightElement = this.createSuggestionHighlight(suggestion, element, index);
            if (highlightElement) {
                overlayContainer.appendChild(highlightElement);
                suggestionElements.push(highlightElement);
                this.suggestionElements.set(suggestion.id, highlightElement);
            }
        });

        // Store overlay data
        this.overlays.set(element, {
            container: overlayContainer,
            suggestions,
            elements: suggestionElements
        });

        // Add to DOM
        document.body.appendChild(overlayContainer);

        // Show control panel if this is the active element
        if (this.activeElement === element) {
            this.showControlPanel(suggestions);
        }

        return overlayContainer;
    }

    /**
     * Create a suggestion highlight element
     */
    createSuggestionHighlight(suggestion, textElement, index) {
        const highlight = document.createElement('div');
        highlight.className = `intellipen-suggestion-highlight intellipen-${suggestion.type}`;
        highlight.setAttribute('data-suggestion-id', suggestion.id);
        highlight.setAttribute('tabindex', '0');
        highlight.setAttribute('role', 'button');
        highlight.setAttribute('aria-label', `${suggestion.type} suggestion: ${suggestion.explanation}`);

        // Position the highlight based on text range
        const position = this.calculateHighlightPosition(suggestion.range, textElement);
        if (!position) return null;

        highlight.style.left = `${position.left}px`;
        highlight.style.top = `${position.top}px`;
        highlight.style.width = `${position.width}px`;
        highlight.style.height = `${position.height}px`;

        // Add event listeners
        highlight.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showTooltip(suggestion, highlight, textElement);
        });

        highlight.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showTooltip(suggestion, highlight, textElement);
            }
        });

        highlight.addEventListener('mouseenter', () => {
            this.showTooltip(suggestion, highlight, textElement);
        });

        highlight.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!document.querySelector('.intellipen-tooltip:hover')) {
                    this.hideTooltip();
                }
            }, 100);
        });

        return highlight;
    }

    /**
     * Calculate position for suggestion highlight
     */
    calculateHighlightPosition(range, textElement) {
        try {
            // For contenteditable elements
            if (textElement.isContentEditable) {
                return this.calculateContentEditablePosition(range, textElement);
            }

            // For input/textarea elements
            if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
                return this.calculateInputPosition(range, textElement);
            }

            return null;
        } catch (error) {
            console.warn('Failed to calculate highlight position:', error);
            return null;
        }
    }

    /**
     * Calculate position for contenteditable elements
     */
    calculateContentEditablePosition(range, element) {
        const textContent = element.textContent || element.innerText || '';
        if (range.start >= textContent.length) return null;

        // Create a temporary range to measure text
        const selection = window.getSelection();
        const originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;

        try {
            const tempRange = document.createRange();
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            let currentPos = 0;
            let startNode = null;
            let endNode = null;
            let startOffset = 0;
            let endOffset = 0;

            // Find start and end positions
            while (walker.nextNode()) {
                const node = walker.currentNode;
                const nodeLength = node.textContent.length;

                if (currentPos + nodeLength > range.start && !startNode) {
                    startNode = node;
                    startOffset = range.start - currentPos;
                }

                if (currentPos + nodeLength >= range.end) {
                    endNode = node;
                    endOffset = range.end - currentPos;
                    break;
                }

                currentPos += nodeLength;
            }

            if (!startNode || !endNode) return null;

            tempRange.setStart(startNode, startOffset);
            tempRange.setEnd(endNode, endOffset);

            const rect = tempRange.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            return {
                left: rect.left - elementRect.left,
                top: rect.top - elementRect.top,
                width: Math.max(rect.width, 20), // Minimum width
                height: rect.height
            };
        } finally {
            // Restore original selection
            if (originalRange) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
            }
        }
    }

    /**
     * Calculate position for input/textarea elements
     */
    calculateInputPosition(range, element) {
        // Create a mirror element to measure text
        const mirror = this.createTextMirror(element);
        const text = element.value;

        // Measure text before the range
        const beforeText = text.substring(0, range.start);
        const rangeText = text.substring(range.start, range.end);

        mirror.textContent = beforeText;
        const beforeWidth = mirror.offsetWidth;

        mirror.textContent = beforeText + rangeText;
        const totalWidth = mirror.offsetWidth;

        // Clean up
        mirror.remove();

        // Calculate position (simplified - assumes single line)
        const computedStyle = window.getComputedStyle(element);
        const paddingLeft = parseInt(computedStyle.paddingLeft);
        const paddingTop = parseInt(computedStyle.paddingTop);
        const lineHeight = parseInt(computedStyle.lineHeight) || 20;

        return {
            left: paddingLeft + beforeWidth,
            top: paddingTop,
            width: Math.max(totalWidth - beforeWidth, 20),
            height: lineHeight
        };
    }

    /**
     * Create a mirror element for text measurement
     */
    createTextMirror(element) {
        const mirror = document.createElement('div');
        const computedStyle = window.getComputedStyle(element);

        // Copy relevant styles
        const stylesToCopy = [
            'font-family', 'font-size', 'font-weight', 'font-style',
            'letter-spacing', 'word-spacing', 'line-height',
            'padding-left', 'padding-right', 'border-left-width', 'border-right-width'
        ];

        stylesToCopy.forEach(style => {
            mirror.style[style] = computedStyle[style];
        });

        mirror.style.position = 'absolute';
        mirror.style.visibility = 'hidden';
        mirror.style.whiteSpace = 'pre';
        mirror.style.top = '-9999px';
        mirror.style.left = '-9999px';

        document.body.appendChild(mirror);
        return mirror;
    }

    /**
     * Position overlay container relative to text element
     */
    positionOverlayContainer(container, element) {
        const rect = element.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        container.style.left = `${rect.left + scrollLeft}px`;
        container.style.top = `${rect.top + scrollTop}px`;
        container.style.width = `${rect.width}px`;
        container.style.height = `${rect.height}px`;
    }

    /**
     * Show tooltip for a suggestion
     */
    showTooltip(suggestion, highlightElement, textElement) {
        this.hideTooltip(); // Hide any existing tooltip

        const tooltip = document.createElement('div');
        tooltip.className = 'intellipen-tooltip';
        tooltip.setAttribute('role', 'tooltip');

        // Create tooltip content
        tooltip.innerHTML = `
      <div class="intellipen-tooltip-header">
        <div class="intellipen-tooltip-icon" style="background-color: ${this.colors[suggestion.type] || this.severityColors[suggestion.severity]}">
          ${this.getTypeIcon(suggestion.type)}
        </div>
        <span>${this.capitalizeFirst(suggestion.type)} ${this.capitalizeFirst(suggestion.severity)}</span>
      </div>
      <div class="intellipen-tooltip-content">
        ${suggestion.explanation}
      </div>
      ${suggestion.replacement ? `
        <div class="intellipen-tooltip-suggestion">
          "${suggestion.replacement}"
        </div>
      ` : ''}
      <div class="intellipen-tooltip-actions">
        <button class="intellipen-tooltip-button" data-action="apply">
          Apply
        </button>
        <button class="intellipen-tooltip-button secondary" data-action="ignore">
          Ignore
        </button>
      </div>
    `;

        // Position tooltip
        this.positionTooltip(tooltip, highlightElement);

        // Add event listeners
        tooltip.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.getAttribute('data-action');
            if (action) {
                this.handleTooltipAction(action, suggestion, textElement);
            }
        });

        // Add to DOM and show
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;

        // Trigger animation
        requestAnimationFrame(() => {
            tooltip.classList.add('show');
        });
    }

    /**
     * Position tooltip relative to highlight element
     */
    positionTooltip(tooltip, highlightElement) {
        const highlightRect = highlightElement.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Position below the highlight by default
        let left = highlightRect.left + scrollLeft + (highlightRect.width / 2);
        let top = highlightRect.bottom + scrollTop + 8;

        // Add to DOM temporarily to measure
        tooltip.style.position = 'absolute';
        tooltip.style.visibility = 'hidden';
        document.body.appendChild(tooltip);

        const tooltipRect = tooltip.getBoundingClientRect();

        // Adjust horizontal position if tooltip would go off-screen
        if (left + tooltipRect.width / 2 > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
        } else if (left - tooltipRect.width / 2 < 0) {
            left = tooltipRect.width / 2 + 10;
        }

        // Adjust vertical position if tooltip would go off-screen
        if (top + tooltipRect.height > window.innerHeight + scrollTop) {
            top = highlightRect.top + scrollTop - tooltipRect.height - 8;
        }

        tooltip.style.left = `${left - tooltipRect.width / 2}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.visibility = 'visible';
    }

    /**
     * Hide current tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.classList.remove('show');
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, this.animationDuration);
        }
    }

    /**
     * Hide all tooltips
     */
    hideAllTooltips() {
        this.hideTooltip();
    }

    /**
     * Handle tooltip action (apply/ignore)
     */
    handleTooltipAction(action, suggestion, textElement) {
        this.hideTooltip();

        if (action === 'apply') {
            this.applySuggestion(suggestion, textElement);
        } else if (action === 'ignore') {
            this.ignoreSuggestion(suggestion);
        }
    }

    /**
     * Apply a suggestion to the text element
     */
    applySuggestion(suggestion, textElement) {
        try {
            if (textElement.isContentEditable) {
                this.applySuggestionToContentEditable(suggestion, textElement);
            } else if (textElement.tagName === 'INPUT' || textElement.tagName === 'TEXTAREA') {
                this.applySuggestionToInput(suggestion, textElement);
            }

            // Mark suggestion as applied
            suggestion.markAsApplied();

            // Remove the highlight
            const highlightElement = this.suggestionElements.get(suggestion.id);
            if (highlightElement) {
                highlightElement.style.animation = 'intellipen-fade-in reverse';
                setTimeout(() => {
                    if (highlightElement.parentNode) {
                        highlightElement.parentNode.removeChild(highlightElement);
                    }
                }, this.animationDuration);
                this.suggestionElements.delete(suggestion.id);
            }

            // Dispatch custom event
            textElement.dispatchEvent(new CustomEvent('intellipen:suggestion-applied', {
                detail: { suggestion }
            }));

        } catch (error) {
            console.error('Failed to apply suggestion:', error);
        }
    }

    /**
     * Apply suggestion to contenteditable element
     */
    applySuggestionToContentEditable(suggestion, element) {
        const newText = suggestion.applyToText(element.textContent || element.innerText || '');

        // Simple replacement - in a real implementation, this would preserve formatting
        element.textContent = newText;

        // Trigger input event
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * Apply suggestion to input/textarea element
     */
    applySuggestionToInput(suggestion, element) {
        const newText = suggestion.applyToText(element.value);
        element.value = newText;

        // Trigger input event
        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /**
     * Ignore a suggestion
     */
    ignoreSuggestion(suggestion) {
        // Remove the highlight with animation
        const highlightElement = this.suggestionElements.get(suggestion.id);
        if (highlightElement) {
            highlightElement.style.opacity = '0';
            highlightElement.style.transform = 'scale(0.8)';
            setTimeout(() => {
                if (highlightElement.parentNode) {
                    highlightElement.parentNode.removeChild(highlightElement);
                }
            }, this.animationDuration);
            this.suggestionElements.delete(suggestion.id);
        }
    }

    /**
     * Show control panel with suggestion statistics
     */
    showControlPanel(suggestions) {
        this.hideControlPanel();

        const panel = document.createElement('div');
        panel.className = 'intellipen-control-panel';
        panel.id = 'intellipen-control-panel';

        // Calculate statistics
        const stats = this.calculateSuggestionStats(suggestions);

        panel.innerHTML = `
      <div class="intellipen-panel-header">
        <div class="intellipen-logo">IP</div>
        <div class="intellipen-panel-title">IntelliPen</div>
      </div>
      <div class="intellipen-stats">
        <div class="intellipen-stat-item">
          <span class="intellipen-stat-label">Total Issues:</span>
          <span class="intellipen-stat-value">${suggestions.length}</span>
        </div>
        ${stats.errors > 0 ? `
          <div class="intellipen-stat-item">
            <span class="intellipen-stat-label">Errors:</span>
            <span class="intellipen-stat-badge error">${stats.errors}</span>
          </div>
        ` : ''}
        ${stats.warnings > 0 ? `
          <div class="intellipen-stat-item">
            <span class="intellipen-stat-label">Warnings:</span>
            <span class="intellipen-stat-badge warning">${stats.warnings}</span>
          </div>
        ` : ''}
        ${stats.suggestions > 0 ? `
          <div class="intellipen-stat-item">
            <span class="intellipen-stat-label">Suggestions:</span>
            <span class="intellipen-stat-badge suggestion">${stats.suggestions}</span>
          </div>
        ` : ''}
      </div>
    `;

        document.body.appendChild(panel);
        this.currentPanel = panel;

        // Show with animation
        requestAnimationFrame(() => {
            panel.classList.add('show');
        });

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideControlPanel();
        }, 5000);
    }

    /**
     * Hide control panel
     */
    hideControlPanel() {
        if (this.currentPanel) {
            this.currentPanel.classList.remove('show');
            setTimeout(() => {
                if (this.currentPanel && this.currentPanel.parentNode) {
                    this.currentPanel.parentNode.removeChild(this.currentPanel);
                }
                this.currentPanel = null;
            }, this.animationDuration);
        }
    }

    /**
     * Calculate suggestion statistics
     */
    calculateSuggestionStats(suggestions) {
        return suggestions.reduce((stats, suggestion) => {
            switch (suggestion.severity) {
                case 'error':
                    stats.errors++;
                    break;
                case 'warning':
                    stats.warnings++;
                    break;
                default:
                    stats.suggestions++;
            }
            return stats;
        }, { errors: 0, warnings: 0, suggestions: 0 });
    }

    /**
     * Remove overlay for an element
     */
    removeOverlay(element) {
        const overlayData = this.overlays.get(element);
        if (overlayData) {
            // Remove suggestion elements from map
            overlayData.suggestions.forEach(suggestion => {
                this.suggestionElements.delete(suggestion.id);
            });

            // Remove container from DOM
            if (overlayData.container.parentNode) {
                overlayData.container.parentNode.removeChild(overlayData.container);
            }

            this.overlays.delete(element);
        }
    }

    /**
     * Reposition all overlays (called on scroll/resize)
     */
    repositionAllOverlays() {
        this.overlays.forEach((overlayData, element) => {
            this.positionOverlayContainer(overlayData.container, element);
        });
    }

    /**
     * Set active element (shows control panel)
     */
    setActiveElement(element) {
        this.activeElement = element;
        const overlayData = this.overlays.get(element);
        if (overlayData) {
            this.showControlPanel(overlayData.suggestions);
        }
    }

    /**
     * Get icon for suggestion type
     */
    getTypeIcon(type) {
        const icons = {
            grammar: '!',
            style: 'S',
            enhancement: '+',
            tone: 'T',
            clarity: 'C'
        };
        return icons[type] || '?';
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Destroy overlay system
     */
    destroy() {
        // Remove all overlays
        this.overlays.forEach((overlayData, element) => {
            this.removeOverlay(element);
        });

        // Hide tooltips and panels
        this.hideAllTooltips();
        this.hideControlPanel();

        // Remove styles
        const styles = document.getElementById('intellipen-overlay-styles');
        if (styles) {
            styles.remove();
        }

        // Clear maps
        this.overlays.clear();
        this.suggestionElements.clear();

        this.isInitialized = false;
        console.log('SuggestionOverlay destroyed');
    }
}

export default SuggestionOverlay;