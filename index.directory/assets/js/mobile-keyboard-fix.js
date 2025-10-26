/**
 * Mobile Keyboard Fix - Virtual Keyboard Handler
 * Detects virtual keyboard appearance and adjusts layout accordingly
 * Works with Visual Viewport API (modern browsers) with fallbacks
 * 
 * Features:
 * - Detects keyboard height using Visual Viewport API
 * - Fallback to window.resize and focus events for older browsers
 * - Sets CSS custom property for dynamic layout adjustment
 * - Auto-scrolls messages to keep last message visible
 * - Cleans up on keyboard dismiss
 */

class MobileKeyboardFix {
  constructor() {
    this.isKeyboardVisible = false;
    this.lastViewportHeight = window.innerHeight;
    this.keyboardHeight = 0;
    this.inputElement = null;
    this.messagesContainer = null;
    this.inputArea = null;
    
    // Check for Visual Viewport API support
    this.hasVisualViewport = 'visualViewport' in window;
    
    // Configuration
    this.config = {
      keyboardThreshold: 150, // Minimum height change to consider keyboard visible
      scrollDelay: 100, // Delay before auto-scrolling (ms)
      animationDuration: 200, // CSS transition duration (ms)
    };
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Get DOM elements
    this.inputElement = document.getElementById('chat-input');
    this.messagesContainer = document.getElementById('chat-messages');
    this.inputArea = document.querySelector('.copilot-chat-input-area');
    
    if (!this.inputElement || !this.messagesContainer) {
      console.warn('MobileKeyboardFix: Required elements not found');
      return;
    }
    
    // Bind methods to maintain context
    this.handleViewportResize = this.handleViewportResize.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.handleInputBlur = this.handleInputBlur.bind(this);
    this.handleVisualViewportScroll = this.handleVisualViewportScroll.bind(this);
    
    // Set up event listeners based on API availability
    if (this.hasVisualViewport) {
      this.setupVisualViewportAPI();
    } else {
      this.setupFallbackAPI();
    }
    
    // Common event listeners
    this.inputElement.addEventListener('focus', this.handleInputFocus);
    this.inputElement.addEventListener('blur', this.handleInputBlur);
    
    console.log('MobileKeyboardFix: Initialized', {
      hasVisualViewport: this.hasVisualViewport,
      initialHeight: this.lastViewportHeight
    });
  }
  
  /**
   * Modern approach using Visual Viewport API
   * Better support for iOS Safari and Chrome
   */
  setupVisualViewportAPI() {
    window.visualViewport.addEventListener('resize', this.handleViewportResize);
    window.visualViewport.addEventListener('scroll', this.handleVisualViewportScroll);
    
    // Store initial viewport height
    this.lastViewportHeight = window.visualViewport.height;
  }
  
  /**
   * Fallback for browsers without Visual Viewport API
   * Uses window resize and focus/blur events
   */
  setupFallbackAPI() {
    window.addEventListener('resize', this.handleWindowResize);
    this.lastViewportHeight = window.innerHeight;
  }
  
  /**
   * Handle Visual Viewport resize (keyboard appearance/dismissal)
   */
  handleViewportResize() {
    if (!this.hasVisualViewport) return;
    
    const viewport = window.visualViewport;
    const currentHeight = viewport.height;
    const heightDiff = this.lastViewportHeight - currentHeight;
    
    // Determine if keyboard is visible based on height change
    if (heightDiff > this.config.keyboardThreshold) {
      // Keyboard appeared
      this.keyboardHeight = heightDiff;
      this.showKeyboard();
    } else if (heightDiff < -this.config.keyboardThreshold) {
      // Keyboard dismissed
      this.hideKeyboard();
    } else if (Math.abs(heightDiff) <= this.config.keyboardThreshold && this.isKeyboardVisible) {
      // Small change, update keyboard height
      this.keyboardHeight = Math.max(0, this.lastViewportHeight - currentHeight);
      this.updateKeyboardOffset();
    }
    
    this.lastViewportHeight = currentHeight;
  }
  
  /**
   * Handle Visual Viewport scroll
   * Prevents issues with iOS Safari's dynamic UI
   */
  handleVisualViewportScroll() {
    if (!this.hasVisualViewport || !this.isKeyboardVisible) return;
    
    // Re-calculate keyboard height on scroll
    const viewport = window.visualViewport;
    const heightDiff = window.innerHeight - viewport.height;
    
    if (heightDiff > this.config.keyboardThreshold) {
      this.keyboardHeight = heightDiff;
      this.updateKeyboardOffset();
    }
  }
  
  /**
   * Fallback window resize handler
   */
  handleWindowResize() {
    const currentHeight = window.innerHeight;
    const heightDiff = this.lastViewportHeight - currentHeight;
    
    // Only trigger if input has focus (keyboard likely visible)
    if (document.activeElement === this.inputElement) {
      if (heightDiff > this.config.keyboardThreshold) {
        this.keyboardHeight = heightDiff;
        this.showKeyboard();
      }
    } else if (heightDiff < -this.config.keyboardThreshold) {
      this.hideKeyboard();
    }
    
    this.lastViewportHeight = currentHeight;
  }
  
  /**
   * Handle input focus - keyboard is about to appear
   */
  handleInputFocus() {
    // On mobile, wait a bit for keyboard to appear
    setTimeout(() => {
      if (this.hasVisualViewport) {
        const viewport = window.visualViewport;
        const heightDiff = window.innerHeight - viewport.height;
        
        if (heightDiff > this.config.keyboardThreshold) {
          this.keyboardHeight = heightDiff;
          this.showKeyboard();
        }
      }
      
      // Scroll to bottom of messages
      this.scrollToBottom();
    }, this.config.scrollDelay);
  }
  
  /**
   * Handle input blur - keyboard might dismiss
   */
  handleInputBlur() {
    // Delay to allow keyboard animation to complete
    setTimeout(() => {
      // Only hide if viewport has returned to normal size
      if (this.hasVisualViewport) {
        const viewport = window.visualViewport;
        const heightDiff = window.innerHeight - viewport.height;
        
        if (heightDiff < this.config.keyboardThreshold) {
          this.hideKeyboard();
        }
      } else {
        const heightDiff = this.lastViewportHeight - window.innerHeight;
        if (Math.abs(heightDiff) < this.config.keyboardThreshold) {
          this.hideKeyboard();
        }
      }
    }, 100);
  }
  
  /**
   * Show keyboard - update UI
   */
  showKeyboard() {
    if (this.isKeyboardVisible) {
      this.updateKeyboardOffset();
      return;
    }
    
    this.isKeyboardVisible = true;
    document.body.classList.add('keyboard-visible');
    this.updateKeyboardOffset();
    
    // Scroll to bottom after keyboard appears
    setTimeout(() => {
      this.scrollToBottom();
    }, this.config.animationDuration);
    
    console.log('MobileKeyboardFix: Keyboard shown', {
      height: this.keyboardHeight
    });
  }
  
  /**
   * Hide keyboard - restore UI
   */
  hideKeyboard() {
    if (!this.isKeyboardVisible) return;
    
    this.isKeyboardVisible = false;
    this.keyboardHeight = 0;
    document.body.classList.remove('keyboard-visible');
    this.updateKeyboardOffset();
    
    console.log('MobileKeyboardFix: Keyboard hidden');
  }
  
  /**
   * Update CSS custom property for keyboard offset
   */
  updateKeyboardOffset() {
    const offset = this.isKeyboardVisible ? this.keyboardHeight : 0;
    document.documentElement.style.setProperty('--keyboard-offset', `${offset}px`);
  }
  
  /**
   * Scroll messages container to bottom
   * Ensures last message is visible above keyboard
   */
  scrollToBottom() {
    if (!this.messagesContainer) return;
    
    requestAnimationFrame(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    });
  }
  
  /**
   * Manually trigger keyboard detection (useful for testing)
   */
  forceUpdate() {
    if (this.hasVisualViewport) {
      this.handleViewportResize();
    } else {
      this.handleWindowResize();
    }
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.hasVisualViewport) {
      window.visualViewport.removeEventListener('resize', this.handleViewportResize);
      window.visualViewport.removeEventListener('scroll', this.handleVisualViewportScroll);
    } else {
      window.removeEventListener('resize', this.handleWindowResize);
    }
    
    if (this.inputElement) {
      this.inputElement.removeEventListener('focus', this.handleInputFocus);
      this.inputElement.removeEventListener('blur', this.handleInputBlur);
    }
    
    this.hideKeyboard();
  }
}

// Auto-initialize on supported pages
if (typeof window !== 'undefined') {
  // Only initialize on copilot.html page
  const isCopilotPage = window.location.pathname.includes('copilot.html');
  
  if (isCopilotPage) {
    // Initialize after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.mobileKeyboardFix = new MobileKeyboardFix();
      });
    } else {
      window.mobileKeyboardFix = new MobileKeyboardFix();
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MobileKeyboardFix;
}
