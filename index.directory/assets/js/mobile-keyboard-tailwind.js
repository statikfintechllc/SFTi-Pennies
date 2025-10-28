/**
 * Mobile Keyboard Handler for Tailwind Chat Component
 * 
 * Handles mobile keyboard behavior to ensure:
 * - Chat input moves up with keyboard
 * - Header stays fixed at top
 * - Messages container remains independently scrollable
 * - iOS body doesn't jump when keyboard opens
 * 
 * Uses:
 * - VisualViewport API (modern browsers)
 * - Window resize fallback (older browsers)
 * - iOS-specific fixes (position:fixed body lock)
 */

class MobileChatKeyboard {
  // Constants
  static KEYBOARD_THRESHOLD = 150; // Minimum keyboard height to detect keyboard open (in pixels)
  static KEYBOARD_ANIMATION_DELAY = 300; // Approximate keyboard animation duration (in ms)
  static TEXTAREA_MAX_HEIGHT = 150; // Maximum textarea height (in pixels, matches CSS max-height)
  static BOTTOM_SPACING_BUFFER = 20; // Extra padding buffer for message content above input bar (in pixels)
  
  constructor(rootElementId = 'chat-root') {
    this.root = document.getElementById(rootElementId);
    this.messages = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input'); // Updated: now references .copilot-input-bar
    this.inputField = document.getElementById('chat-input-field'); // Updated: now references .copilot-input
    this.header = document.getElementById('chat-header'); // Navigation header
    
    if (!this.root || !this.messages || !this.input || !this.inputField) {
      console.warn('MobileChatKeyboard: Required elements not found');
      return;
    }
    
    // Feature detection for iOS instead of user agent sniffing
    this.isIOS = this.detectIOS();
    this.initialHeight = window.innerHeight;
    this.bodyScrollY = 0;
    this.keyboardHeight = 0;
    this.isKeyboardOpen = false;
    
    // Initialize CSS custom properties for dynamic positioning
    this.updateCSSVariables();
    
    this.init();
  }
  
  /**
   * Detect iOS using feature detection instead of user agent sniffing
   * More reliable than checking navigator.userAgent
   */
  detectIOS() {
    // Check for iOS-specific features
    return [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform)
    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  }
  
  /**
   * Update CSS custom properties for dynamic positioning
   * This ensures html, body, and chat-root always know their dimensions
   */
  updateCSSVariables() {
    const headerHeight = this.header ? this.header.offsetHeight : 70;
    const inputHeight = this.input ? this.input.offsetHeight : 0;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    // Calculate positions
    const inputBarTop = viewportHeight - inputHeight - this.keyboardHeight;
    const chatRootBottom = inputHeight + this.keyboardHeight;
    
    // Set CSS custom properties on document root
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--input-bar-height', `${inputHeight}px`);
    document.documentElement.style.setProperty('--input-bar-top', `${inputBarTop}px`);
    document.documentElement.style.setProperty('--chat-root-bottom', `${chatRootBottom}px`);
    document.documentElement.style.setProperty('--keyboard-height', `${this.keyboardHeight}px`);
    document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
    
    // Update html element positioning
    document.documentElement.style.height = '100%';
    document.documentElement.style.position = 'fixed';
    document.documentElement.style.width = '100%';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.top = '0';
    document.documentElement.style.left = '0';
    
    // Update body positioning to always know where input bar is
    document.body.style.height = '100%';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.body.style.top = '0';
    document.body.style.left = '0';
    
    // Update chat-root positioning
    if (this.root) {
      this.root.style.bottom = `${chatRootBottom}px`;
    }
  }
  
  /**
   * Aggressively scroll to top to keep viewport pinned at header
   * iOS requires multiple scroll attempts due to async keyboard behavior
   * This method schedules scroll attempts at strategic intervals during keyboard animation
   */
  forceScrollToTop() {
    // Immediate scroll
    window.scrollTo(0, 0);
    requestAnimationFrame(() => window.scrollTo(0, 0));
    
    // Early keyboard animation (10ms)
    setTimeout(() => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }, 10);
    
    // Mid keyboard animation (50ms)
    setTimeout(() => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    }, 50);
    
    // Late keyboard animation (100ms)
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  }
  
  init() {
    // Use VisualViewport API if available (modern browsers)
    if (window.visualViewport) {
      this.setupVisualViewport();
    } else {
      // Fallback to resize events
      this.setupResizeFallback();
    }
    
    // iOS-specific handling
    if (this.isIOS) {
      this.setupIOSFixes();
    }
    
    // Auto-resize textarea
    this.setupTextareaAutoResize();
    
    // Scroll messages to bottom on focus
    this.setupScrollOnFocus();
    
    // Update CSS variables on window resize
    window.addEventListener('resize', () => {
      this.updateCSSVariables();
    });
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.updateCSSVariables();
      }, 100);
    });
    
    // Initial update
    this.updateCSSVariables();
  }
  
  /**
   * Setup VisualViewport API handling (preferred method)
   */
  setupVisualViewport() {
    const viewport = window.visualViewport;
    let debounceTimer = null;
    
    const handleViewportChange = () => {
      // Debounce to prevent glitchy animations during keyboard open
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      debounceTimer = setTimeout(() => {
        const keyboardHeight = this.initialHeight - viewport.height;
        this.handleKeyboardChange(keyboardHeight);
      }, 50); // 50ms debounce
    };
    
    viewport.addEventListener('resize', handleViewportChange);
    viewport.addEventListener('scroll', handleViewportChange);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      viewport.removeEventListener('resize', handleViewportChange);
      viewport.removeEventListener('scroll', handleViewportChange);
    });
  }
  
  /**
   * Fallback resize handling for older browsers
   */
  setupResizeFallback() {
    let resizeTimeout;
    
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDiff = this.initialHeight - currentHeight;
        
        if (heightDiff > 150) { // Keyboard is likely open
          this.handleKeyboardChange(heightDiff);
        } else {
          this.handleKeyboardChange(0);
        }
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      window.removeEventListener('resize', handleResize);
    });
  }
  
  /**
   * iOS-specific fixes to prevent body scroll jump
   */
  setupIOSFixes() {
    // Prevent iOS from scrolling when input is tapped
    // Lock body BEFORE focus event fires - keep viewport at top
    this.inputField.addEventListener('touchstart', (e) => {
      // Store scroll position but always reset to 0
      const currentScroll = window.scrollY;
      if (currentScroll > 0) {
        window.scrollTo(0, 0);
      }
      
      // Always lock to top (0) to keep header visible
      this.bodyScrollY = 0;
      
      // Update CSS variables for locked state
      this.updateCSSVariables();
    }, { passive: true });
    
    // Prevent scroll on touchmove while typing
    this.inputField.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
    
    // When input is focused, ensure lock is in place and viewport at top
    this.inputField.addEventListener('focus', (e) => {
      // Prevent default scroll behavior
      if (e.preventDefault) {
        try {
          e.preventDefault();
        } catch (err) {
          // Some browsers don't allow preventDefault on focus
        }
      }
      
      if (!this.isKeyboardOpen) {
        // Keep viewport at top
        this.bodyScrollY = 0;
      }
      
      this.isKeyboardOpen = true;
      
      // Update CSS variables
      this.updateCSSVariables();
      
      // Force scroll to top to keep header visible
      // Multiple attempts needed due to iOS async keyboard behavior
      this.forceScrollToTop();
    });
    
    // When input loses focus, restore body position
    this.inputField.addEventListener('blur', () => {
      if (this.isKeyboardOpen) {
        window.scrollTo(0, 0);
        this.isKeyboardOpen = false;
        
        // Update CSS variables for unlocked state
        this.updateCSSVariables();
      }
    });
  }
  
  /**
   * Handle keyboard height change
   * Updates inline styles on chat components
   * Uses bottom positioning and CSS variables for dynamic layout
   */
  handleKeyboardChange(keyboardHeight) {
    this.keyboardHeight = keyboardHeight;
    
    // Always update CSS variables to ensure everything stays in sync
    this.updateCSSVariables();
    
    if (keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
      // Keyboard is open
      // Move input up by keyboard height using bottom property (not transform)
      // This maintains proper z-index stacking
      this.input.style.bottom = `${keyboardHeight}px`;
      
      // Adjust messages container bottom padding to account for input + keyboard
      const inputHeight = this.input.offsetHeight;
      const totalBottomSpace = keyboardHeight + inputHeight + MobileChatKeyboard.BOTTOM_SPACING_BUFFER;
      
      this.messages.style.paddingBottom = `${totalBottomSpace}px`;
    } else {
      // Keyboard is closed - reset to defaults
      this.input.style.bottom = '';
      this.messages.style.paddingBottom = '';
    }
  }
  
  /**
   * Setup auto-resize for textarea
   */
  setupTextareaAutoResize() {
    this.inputField.addEventListener('input', () => {
      // Reset height to auto to get the correct scrollHeight
      this.inputField.style.height = 'auto';
      
      // Set height to scrollHeight, with max constraint
      // Use constant that matches Tailwind class max-h-[150px]
      const maxHeight = MobileChatKeyboard.TEXTAREA_MAX_HEIGHT;
      const newHeight = Math.min(this.inputField.scrollHeight, maxHeight);
      this.inputField.style.height = `${newHeight}px`;
      
      // Update CSS variables when textarea size changes
      this.updateCSSVariables();
      
      // Trigger keyboard change handler to adjust layout
      if (this.keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
        this.handleKeyboardChange(this.keyboardHeight);
      }
    });
    
    // Also handle on Enter key (for better UX)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        // Submit message (implement your send logic here)
        e.preventDefault();
        this.inputField.style.height = 'auto';
        
        // Update CSS variables when textarea resets
        this.updateCSSVariables();
        
        // Trigger keyboard change handler
        if (this.keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
          this.handleKeyboardChange(this.keyboardHeight);
        }
      }
    });
  }
  
  /**
   * Scroll messages to bottom when input is focused
   */
  setupScrollOnFocus() {
    this.inputField.addEventListener('focus', () => {
      // Wait for keyboard animation to complete before scrolling
      setTimeout(() => {
        if (this.messages) {
          this.messages.scrollTop = this.messages.scrollHeight;
        }
      }, MobileChatKeyboard.KEYBOARD_ANIMATION_DELAY);
    });
  }
  
  /**
   * Utility: Scroll messages to bottom
   */
  scrollToBottom() {
    if (this.messages) {
      this.messages.scrollTop = this.messages.scrollHeight;
    }
  }
  
  /**
   * Static initializer
   */
  static init(rootElementId = 'chat-root') {
    return new MobileChatKeyboard(rootElementId);
  }
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    MobileChatKeyboard.init();
  });
} else {
  MobileChatKeyboard.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileChatKeyboard;
}
