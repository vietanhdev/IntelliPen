/**
 * AnimationManager - Handles smooth animations for suggestion appearance and application
 * Provides performance-optimized animations with accessibility considerations
 */
class AnimationManager {
  constructor() {
    this.animations = new Map(); // element -> animation data
    this.isReducedMotion = this.checkReducedMotionPreference();
    this.defaultDuration = 300; // ms
    this.defaultEasing = 'cubic-bezier(0.4, 0, 0.2, 1)'; // Material Design easing
    
    this.setupMotionPreferenceListener();
  }

  /**
   * Check user's reduced motion preference
   */
  checkReducedMotionPreference() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Setup listener for motion preference changes
   */
  setupMotionPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        this.cancelAllAnimations();
      }
    });
  }

  /**
   * Animate suggestion highlight appearance
   */
  animateSuggestionAppearance(element, options = {}) {
    if (this.isReducedMotion) {
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration,
      delay: options.delay || 0,
      easing: options.easing || this.defaultEasing,
      ...options
    };

    return new Promise((resolve) => {
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px) scale(0.95)';
      element.style.transition = 'none';

      // Force reflow
      element.offsetHeight;

      // Apply transition
      element.style.transition = `all ${config.duration}ms ${config.easing}`;
      
      // Animate to final state
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scale(1)';
        
        // Store animation data
        this.animations.set(element, {
          type: 'appearance',
          startTime: performance.now(),
          duration: config.duration,
          resolve
        });

        // Clean up after animation
        setTimeout(() => {
          element.style.transition = '';
          this.animations.delete(element);
          resolve();
        }, config.duration);
      }, config.delay);
    });
  }

  /**
   * Animate suggestion highlight removal
   */
  animateSuggestionRemoval(element, options = {}) {
    if (this.isReducedMotion) {
      element.remove();
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration * 0.8,
      easing: options.easing || 'cubic-bezier(0.4, 0, 1, 1)', // Faster out
      ...options
    };

    return new Promise((resolve) => {
      element.style.transition = `all ${config.duration}ms ${config.easing}`;
      element.style.opacity = '0';
      element.style.transform = 'translateY(-5px) scale(0.9)';

      // Store animation data
      this.animations.set(element, {
        type: 'removal',
        startTime: performance.now(),
        duration: config.duration,
        resolve
      });

      setTimeout(() => {
        element.remove();
        this.animations.delete(element);
        resolve();
      }, config.duration);
    });
  }

  /**
   * Animate suggestion application with success feedback
   */
  animateSuggestionApplication(element, options = {}) {
    if (this.isReducedMotion) {
      return this.animateSuggestionRemoval(element, options);
    }

    const config = {
      duration: options.duration || this.defaultDuration,
      successColor: options.successColor || '#28a745',
      ...options
    };

    return new Promise((resolve) => {
      // Phase 1: Success flash
      element.style.transition = `background-color 150ms ease-out`;
      element.style.backgroundColor = config.successColor;
      element.style.boxShadow = `0 0 0 3px ${config.successColor}33`;

      setTimeout(() => {
        // Phase 2: Fade out and scale down
        element.style.transition = `all ${config.duration * 0.7}ms cubic-bezier(0.4, 0, 1, 1)`;
        element.style.opacity = '0';
        element.style.transform = 'scale(0.8)';
        element.style.backgroundColor = '';
        element.style.boxShadow = '';

        // Store animation data
        this.animations.set(element, {
          type: 'application',
          startTime: performance.now(),
          duration: config.duration,
          resolve
        });

        setTimeout(() => {
          element.remove();
          this.animations.delete(element);
          resolve();
        }, config.duration * 0.7);
      }, 150);
    });
  }

  /**
   * Animate tooltip appearance
   */
  animateTooltipAppearance(element, options = {}) {
    if (this.isReducedMotion) {
      element.classList.add('show');
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration * 0.8,
      ...options
    };

    return new Promise((resolve) => {
      // Set initial state
      element.style.opacity = '0';
      element.style.transform = 'translateY(10px) scale(0.95)';
      element.style.transition = `all ${config.duration}ms ${this.defaultEasing}`;

      // Force reflow
      element.offsetHeight;

      // Animate to final state
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0) scale(1)';
        element.classList.add('show');

        setTimeout(() => {
          resolve();
        }, config.duration);
      });
    });
  }

  /**
   * Animate tooltip removal
   */
  animateTooltipRemoval(element, options = {}) {
    if (this.isReducedMotion) {
      element.remove();
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration * 0.6,
      ...options
    };

    return new Promise((resolve) => {
      element.style.transition = `all ${config.duration}ms cubic-bezier(0.4, 0, 1, 1)`;
      element.style.opacity = '0';
      element.style.transform = 'translateY(5px) scale(0.95)';
      element.classList.remove('show');

      setTimeout(() => {
        element.remove();
        resolve();
      }, config.duration);
    });
  }

  /**
   * Animate control panel slide-in
   */
  animateControlPanelAppearance(element, options = {}) {
    if (this.isReducedMotion) {
      element.classList.add('show');
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration,
      direction: options.direction || 'right', // 'right', 'left', 'top', 'bottom'
      ...options
    };

    return new Promise((resolve) => {
      // Set initial state based on direction
      const transforms = {
        right: 'translateX(20px)',
        left: 'translateX(-20px)',
        top: 'translateY(-20px)',
        bottom: 'translateY(20px)'
      };

      element.style.opacity = '0';
      element.style.transform = transforms[config.direction];
      element.style.transition = `all ${config.duration}ms ${this.defaultEasing}`;

      // Force reflow
      element.offsetHeight;

      // Animate to final state
      requestAnimationFrame(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateX(0) translateY(0)';
        element.classList.add('show');

        setTimeout(() => {
          resolve();
        }, config.duration);
      });
    });
  }

  /**
   * Animate control panel slide-out
   */
  animateControlPanelRemoval(element, options = {}) {
    if (this.isReducedMotion) {
      element.remove();
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || this.defaultDuration * 0.8,
      direction: options.direction || 'right',
      ...options
    };

    return new Promise((resolve) => {
      const transforms = {
        right: 'translateX(20px)',
        left: 'translateX(-20px)',
        top: 'translateY(-20px)',
        bottom: 'translateY(20px)'
      };

      element.style.transition = `all ${config.duration}ms cubic-bezier(0.4, 0, 1, 1)`;
      element.style.opacity = '0';
      element.style.transform = transforms[config.direction];
      element.classList.remove('show');

      setTimeout(() => {
        element.remove();
        resolve();
      }, config.duration);
    });
  }

  /**
   * Animate text replacement with typewriter effect
   */
  animateTextReplacement(element, oldText, newText, options = {}) {
    if (this.isReducedMotion) {
      element.textContent = newText;
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || Math.min(1000, Math.max(300, newText.length * 50)),
      highlightColor: options.highlightColor || '#ffc107',
      ...options
    };

    return new Promise((resolve) => {
      // Phase 1: Highlight the change
      const originalBackground = element.style.backgroundColor;
      element.style.transition = 'background-color 200ms ease-out';
      element.style.backgroundColor = config.highlightColor + '33';

      setTimeout(() => {
        // Phase 2: Typewriter effect
        if (config.typewriter && newText.length > oldText.length) {
          this.animateTypewriter(element, oldText, newText, config.duration * 0.8)
            .then(() => {
              // Phase 3: Remove highlight
              element.style.backgroundColor = originalBackground;
              setTimeout(resolve, 200);
            });
        } else {
          // Simple replacement
          element.textContent = newText;
          element.style.backgroundColor = originalBackground;
          setTimeout(resolve, 200);
        }
      }, 200);
    });
  }

  /**
   * Animate typewriter effect
   */
  animateTypewriter(element, startText, endText, duration) {
    return new Promise((resolve) => {
      const steps = Math.max(10, Math.min(50, endText.length));
      const stepDuration = duration / steps;
      let currentStep = 0;

      const animate = () => {
        if (currentStep >= steps) {
          element.textContent = endText;
          resolve();
          return;
        }

        const progress = currentStep / steps;
        const currentLength = Math.floor(startText.length + (endText.length - startText.length) * progress);
        element.textContent = endText.substring(0, currentLength);

        currentStep++;
        setTimeout(animate, stepDuration);
      };

      animate();
    });
  }

  /**
   * Animate focus ring for keyboard navigation
   */
  animateFocusRing(element, options = {}) {
    if (this.isReducedMotion) {
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || 600,
      color: options.color || '#007bff',
      ...options
    };

    return new Promise((resolve) => {
      // Create focus ring element
      const focusRing = document.createElement('div');
      focusRing.style.position = 'absolute';
      focusRing.style.pointerEvents = 'none';
      focusRing.style.border = `2px solid ${config.color}`;
      focusRing.style.borderRadius = '4px';
      focusRing.style.opacity = '0';
      focusRing.style.transform = 'scale(1.1)';
      focusRing.style.transition = `all ${config.duration}ms ${this.defaultEasing}`;

      // Position the focus ring
      const rect = element.getBoundingClientRect();
      focusRing.style.left = `${rect.left - 4}px`;
      focusRing.style.top = `${rect.top - 4}px`;
      focusRing.style.width = `${rect.width + 8}px`;
      focusRing.style.height = `${rect.height + 8}px`;

      document.body.appendChild(focusRing);

      // Animate in
      requestAnimationFrame(() => {
        focusRing.style.opacity = '1';
        focusRing.style.transform = 'scale(1)';

        // Animate out
        setTimeout(() => {
          focusRing.style.opacity = '0';
          focusRing.style.transform = 'scale(0.9)';

          setTimeout(() => {
            focusRing.remove();
            resolve();
          }, config.duration * 0.3);
        }, config.duration * 0.7);
      });
    });
  }

  /**
   * Animate progress indicator
   */
  animateProgress(element, progress, options = {}) {
    if (this.isReducedMotion) {
      element.style.width = `${progress * 100}%`;
      return Promise.resolve();
    }

    const config = {
      duration: options.duration || 500,
      easing: options.easing || 'cubic-bezier(0.4, 0, 0.2, 1)',
      ...options
    };

    return new Promise((resolve) => {
      element.style.transition = `width ${config.duration}ms ${config.easing}`;
      element.style.width = `${progress * 100}%`;

      setTimeout(resolve, config.duration);
    });
  }

  /**
   * Create staggered animation for multiple elements
   */
  animateStaggered(elements, animationFn, options = {}) {
    const config = {
      staggerDelay: options.staggerDelay || 100,
      ...options
    };

    const promises = elements.map((element, index) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          animationFn(element, { ...config, delay: 0 }).then(resolve);
        }, index * config.staggerDelay);
      });
    });

    return Promise.all(promises);
  }

  /**
   * Cancel all running animations
   */
  cancelAllAnimations() {
    this.animations.forEach((animationData, element) => {
      // Remove transitions
      element.style.transition = 'none';
      
      // Resolve pending promises
      if (animationData.resolve) {
        animationData.resolve();
      }
    });

    this.animations.clear();
  }

  /**
   * Cancel animation for specific element
   */
  cancelAnimation(element) {
    const animationData = this.animations.get(element);
    if (animationData) {
      element.style.transition = 'none';
      if (animationData.resolve) {
        animationData.resolve();
      }
      this.animations.delete(element);
    }
  }

  /**
   * Get running animations count
   */
  getRunningAnimationsCount() {
    return this.animations.size;
  }

  /**
   * Check if element is currently animating
   */
  isAnimating(element) {
    return this.animations.has(element);
  }

  /**
   * Set reduced motion preference (for testing)
   */
  setReducedMotion(reduced) {
    this.isReducedMotion = reduced;
    if (reduced) {
      this.cancelAllAnimations();
    }
  }

  /**
   * Destroy animation manager
   */
  destroy() {
    this.cancelAllAnimations();
    this.animations.clear();
    console.log('AnimationManager destroyed');
  }
}

export default AnimationManager;