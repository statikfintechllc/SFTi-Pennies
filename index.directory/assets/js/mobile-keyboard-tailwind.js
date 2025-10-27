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
  static SCREENSHOT_THRESHOLD = 50; // Maximum viewport height change to consider as screenshot/system event (in pixels)
  
  constructor(rootElementId = 'chat-root') {
    this.root = document.getElementById(rootElementId);
    this.messages = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input'); // Updated: now references .copilot-input-bar
    this.inputField = document.getElementById('chat-input-field'); // Updated: now references .copilot-input
    
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
    this.lastViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
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
   * Check if viewport change should preserve input bar position
   * Small viewport changes (< SCREENSHOT_THRESHOLD) with keyboard open are likely
   * screenshots or system events, not keyboard-related changes
   */
  shouldPreserveInputPosition(heightDiff) {
    return heightDiff < MobileChatKeyboard.SCREENSHOT_THRESHOLD && 
           this.input.hasAttribute('data-keyboard-open');
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
  }
  
  /**
   * Setup VisualViewport API handling (preferred method)
   */
  setupVisualViewport() {
    const viewport = window.visualViewport;
    
    const handleViewportChange = () => {
      const currentHeight = viewport.height;
      const heightDiff = Math.abs(currentHeight - this.lastViewportHeight);
      
      // Preserve input bar position for small viewport changes (screenshots, system events)
      // when keyboard is open
      if (this.shouldPreserveInputPosition(heightDiff)) {
        this.lastViewportHeight = currentHeight; // Update tracking even when preserving position
        return; // Keep current position - don't reset
      }
      
      // Update last height and process keyboard change
      this.lastViewportHeight = currentHeight;
      
      // Immediate response - no debounce to ensure input bar moves with keyboard
      const keyboardHeight = this.initialHeight - currentHeight;
      this.handleKeyboardChange(keyboardHeight);
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
    // Prevent scroll on touchmove while typing
    this.inputField.addEventListener('touchmove', (e) => {
      e.stopPropagation();
    }, { passive: true });
    
    // When input is focused, mark keyboard as open
    this.inputField.addEventListener('focus', (e) => {
      this.isKeyboardOpen = true;
    });
    
    // When input loses focus, mark keyboard as closed
    this.inputField.addEventListener('blur', () => {
      this.isKeyboardOpen = false;
    });
  }
  
  /**
   * Handle keyboard height change
   * Updates inline styles on chat components
   * Uses bottom positioning instead of transform for better stacking context
   */
  handleKeyboardChange(keyboardHeight) {
    this.keyboardHeight = keyboardHeight;
    
    if (keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
      // Keyboard is open
      // Move input up by keyboard height using bottom property (not transform)
      // This maintains proper z-index stacking
      this.input.style.bottom = `${keyboardHeight}px`;
      
      // Adjust messages container bottom padding to account for input + keyboard
      const inputHeight = this.input.offsetHeight;
      const totalBottomSpace = keyboardHeight + inputHeight + MobileChatKeyboard.BOTTOM_SPACING_BUFFER;
      
      this.messages.style.paddingBottom = `${totalBottomSpace}px`;
      
      // Mark as keyboard open to preserve position during viewport changes
      this.input.setAttribute('data-keyboard-open', 'true');
    } else {
      // Keyboard is closed - reset to defaults
      this.input.style.bottom = '';
      this.messages.style.paddingBottom = '';
      this.input.removeAttribute('data-keyboard-open');
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
        
        // Trigger keyboard change handler
        if (this.keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
          this.handleKeyboardChange(this.keyboardHeight);
        }
      }
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
