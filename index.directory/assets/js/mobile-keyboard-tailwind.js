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
  }
  
  /**
   * Setup VisualViewport API handling (preferred method)
   */
  setupVisualViewport() {
    const viewport = window.visualViewport;
    
    const handleViewportChange = () => {
      const keyboardHeight = this.initialHeight - viewport.height;
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
      
      // Lock immediately on touch - viewport stays at top
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.left = '0';
      document.body.style.right = '0';
      
      // Also lock html element
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height = '100vh';
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.width = '100%';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
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
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.left = '0';
        document.body.style.right = '0';
        
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.documentElement.style.top = '0';
        document.documentElement.style.left = '0';
      }
      
      this.isKeyboardOpen = true;
      
      // Force scroll to top to keep header visible
      // Multiple attempts needed due to iOS async keyboard behavior
      this.forceScrollToTop();
    });
    
    // When input loses focus, restore body position
    this.inputField.addEventListener('blur', () => {
      if (this.isKeyboardOpen) {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.height = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        document.documentElement.style.overflow = '';
        document.documentElement.style.height = '';
        document.documentElement.style.position = '';
        document.documentElement.style.width = '';
        document.documentElement.style.top = '';
        document.documentElement.style.left = '';
        
        window.scrollTo(0, 0);
        this.isKeyboardOpen = false;
      }
    });
  }
  
  /**
   * Handle keyboard height change
   * Updates inline styles on chat components
   * SIMPLIFIED: Only adjust message padding, let CSS handle input bar position
   */
  handleKeyboardChange(keyboardHeight) {
    this.keyboardHeight = keyboardHeight;
    
    if (keyboardHeight > MobileChatKeyboard.KEYBOARD_THRESHOLD) {
      // Keyboard is open
      // DO NOT move input bar - let CSS and browser handle it naturally
      // Only adjust messages container bottom padding to prevent content hiding
      const inputHeight = this.input.offsetHeight;
      const totalBottomSpace = inputHeight + MobileChatKeyboard.BOTTOM_SPACING_BUFFER;
      
      this.messages.style.paddingBottom = `${totalBottomSpace}px`;
    } else {
      // Keyboard is closed - reset to defaults
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
