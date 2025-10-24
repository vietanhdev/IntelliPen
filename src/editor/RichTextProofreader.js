/**
 * Rich Text Proofreader
 * Handles proofreading of contenteditable elements while preserving HTML formatting
 */

class RichTextProofreader {
  constructor() {
    this.textNodeMap = [];
  }

  /**
   * Extract plain text from a contenteditable element and build a map
   * of text positions to DOM text nodes
   */
  extractTextWithMapping(element) {
    this.textNodeMap = [];
    let plainText = '';
    let currentOffset = 0;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      if (text) {
        this.textNodeMap.push({
          node: node,
          startOffset: currentOffset,
          endOffset: currentOffset + text.length,
          text: text
        });
        plainText += text;
        currentOffset += text.length;
      }
    }

    console.log('Extracted plain text:', plainText);
    console.log('Text node map:', this.textNodeMap);

    return plainText;
  }

  /**
   * Find the DOM text node and offset for a given plain text position
   */
  findNodeAtPosition(position) {
    for (const mapping of this.textNodeMap) {
      if (position >= mapping.startOffset && position < mapping.endOffset) {
        return {
          node: mapping.node,
          offset: position - mapping.startOffset
        };
      }
    }

    // If position is at or beyond the end, return the last node at its end
    if (this.textNodeMap.length > 0) {
      const lastMapping = this.textNodeMap[this.textNodeMap.length - 1];
      if (position >= lastMapping.endOffset) {
        return {
          node: lastMapping.node,
          offset: lastMapping.text.length
        };
      }
    }

    console.warn('Could not find node at position:', position, 'Text node map:', this.textNodeMap);
    return null;
  }

  /**
   * Apply a single correction to the DOM while preserving formatting
   */
  applyCorrection(correction) {
    const startPos = this.findNodeAtPosition(correction.startIndex);
    const endPos = this.findNodeAtPosition(correction.endIndex);

    if (!startPos || !endPos) {
      console.warn('Could not find DOM position for correction:', correction);
      return false;
    }

    console.log('Applying correction:', correction);
    console.log('Start position:', startPos);
    console.log('End position:', endPos);

    try {
      // Create a range for the text to be replaced
      const range = document.createRange();

      if (startPos.node === endPos.node) {
        // Simple case: correction is within a single text node
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        range.deleteContents();

        // Insert the corrected text
        const textNode = document.createTextNode(correction.suggestion);
        range.insertNode(textNode);
      } else {
        // Complex case: correction spans multiple text nodes
        // We need to delete from start to end and insert the correction

        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);

        // Delete the range
        range.deleteContents();

        // Insert the corrected text at the start position
        const textNode = document.createTextNode(correction.suggestion);
        range.insertNode(textNode);
      }

      return true;
    } catch (error) {
      console.error('Failed to apply correction:', error);
      return false;
    }
  }

  /**
   * Apply all corrections to the DOM while preserving formatting
   * Corrections must be applied in reverse order (from end to start)
   * to avoid position shifts
   */
  applyAllCorrections(element, corrections) {
    // Extract text and build mapping
    this.extractTextWithMapping(element);

    // Sort corrections by position (descending) to apply from end to start
    const sortedCorrections = [...corrections].sort((a, b) => b.startIndex - a.startIndex);

    console.log('Applying corrections in reverse order:', sortedCorrections);

    let successCount = 0;
    for (const correction of sortedCorrections) {
      if (this.applyCorrection(correction)) {
        successCount++;
      }
    }

    console.log(`Applied ${successCount}/${corrections.length} corrections`);

    return successCount;
  }

  /**
   * Get the plain text representation of a contenteditable element
   * This is what should be sent to the Proofreader API
   */
  getPlainText(element) {
    // Use innerText to preserve line breaks and spacing
    // but normalize to match what the API expects
    return element.innerText || element.textContent || '';
  }

  /**
   * Replace the entire content with corrected text while trying to preserve formatting
   * This is a fallback when individual corrections can't be applied
   */
  replaceWithCorrectedText(element, correctedText) {
    // This is tricky - we want to preserve formatting but replace text
    // For now, we'll use a simple approach: replace text nodes in order

    this.extractTextWithMapping(element);

    let remainingText = correctedText;
    let textIndex = 0;

    for (const mapping of this.textNodeMap) {
      if (textIndex >= correctedText.length) {
        // No more corrected text, clear this node
        mapping.node.textContent = '';
      } else {
        // Calculate how much text this node should get
        const originalLength = mapping.text.length;
        const newText = remainingText.substring(0, originalLength);
        mapping.node.textContent = newText;
        remainingText = remainingText.substring(originalLength);
        textIndex += newText.length;
      }
    }

    // If there's remaining text, append it to the last node
    if (remainingText && this.textNodeMap.length > 0) {
      const lastMapping = this.textNodeMap[this.textNodeMap.length - 1];
      lastMapping.node.textContent += remainingText;
    }
  }

  /**
   * Create Range objects for highlighting errors in the DOM
   * Returns an array of ranges that can be used with CSS Highlights API
   */
  createHighlightRanges(element, corrections) {
    this.extractTextWithMapping(element);

    const ranges = [];

    for (const correction of corrections) {
      const startPos = this.findNodeAtPosition(correction.startIndex);
      const endPos = this.findNodeAtPosition(correction.endIndex);

      if (startPos && endPos) {
        try {
          const range = document.createRange();
          range.setStart(startPos.node, startPos.offset);
          range.setEnd(endPos.node, endPos.offset);
          ranges.push({
            range: range,
            correction: correction
          });
        } catch (error) {
          console.warn('Could not create range for correction:', correction, error);
        }
      }
    }

    return ranges;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RichTextProofreader };
}

// Make available globally in extension context
if (typeof self !== 'undefined') {
  self.RichTextProofreader = RichTextProofreader;
}
