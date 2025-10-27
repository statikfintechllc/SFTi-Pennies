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
  constructor(rootElementId = 'chat-root') {
    this.root = document.getElementById(rootElementId);
    this.messages = document.getElementById('chat-messages');
    this.input = document.getElementById('chat-input');
    this.inputField = document.getElementById('chat-input-field');
    
    if (!this.root || !this.messages || !this.input || !this.inputField) {
      console.warn('MobileChatKeyboard: Required elements not found');
      return;
    }
    
    this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    this.initialHeight = window.innerHeight;
    this.bodyScrollY = 0;
    this.keyboardHeight = 0;
    this.isKeyboardOpen = false;
    
    this.init();
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
    // Lock body BEFORE focus event fires
    this.inputField.addEventListener('touchstart', () => {
      this.bodyScrollY = window.scrollY;
      
      // Lock immediately on touch
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.bodyScrollY}px`;
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
    }, { passive: true });
    
    // When input is focused, ensure lock is in place
    this.inputField.addEventListener('focus', () => {
      if (!this.isKeyboardOpen) {
        this.bodyScrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.bodyScrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100vh';
        document.body.style.left = '0';
        document.body.style.right = '0';
        
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100vh';
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
      }
      
      this.isKeyboardOpen = true;
      
      // Scroll to top of fixed element to ensure input is visible
      window.scrollTo(0, 0);
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
        
        window.scrollTo(0, this.bodyScrollY);
        this.isKeyboardOpen = false;
      }
    });
  }
  
  /**
   * Handle keyboard height change
   * Updates inline styles on chat components
   */
  handleKeyboardChange(keyboardHeight) {
    this.keyboardHeight = keyboardHeight;
    
    if (keyboardHeight > 150) {
      // Keyboard is open
      // Move input up by keyboard height
      this.input.style.transform = `translateY(-${keyboardHeight}px)`;
      
      // Adjust messages container height to account for keyboard
      const headerHeight = document.getElementById('chat-header')?.offsetHeight || 70;
      const inputHeight = this.input.offsetHeight;
      const availableHeight = window.innerHeight - headerHeight - inputHeight - keyboardHeight;
      
      this.messages.style.height = `${availableHeight}px`;
      
      // Add padding to messages to prevent content from being hidden
      this.messages.style.paddingBottom = '20px';
    } else {
      // Keyboard is closed - reset to defaults
      this.input.style.transform = '';
      this.messages.style.height = '';
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
      const maxHeight = 150; // max-h-[150px] in Tailwind
      const newHeight = Math.min(this.inputField.scrollHeight, maxHeight);
      this.inputField.style.height = `${newHeight}px`;
      
      // Trigger keyboard change handler to adjust layout
      if (this.keyboardHeight > 150) {
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
        if (this.keyboardHeight > 150) {
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
      setTimeout(() => {
        if (this.messages) {
          this.messages.scrollTop = this.messages.scrollHeight;
        }
      }, 300); // Delay to allow keyboard animation
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
