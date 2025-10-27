/**
 * Lightweight Mobile Keyboard Handler
 * Adjusts input bar position when virtual keyboard appears
 */

(function() {
  'use strict';
  
  // Only run on copilot page
  if (!window.location.pathname.includes('copilot.html')) {
    return;
  }
  
  const inputArea = document.getElementById('chat-input-area');
  const messagesContainer = document.getElementById('chat-messages');
  
  if (!inputArea || !messagesContainer) {
    return;
  }
  
  // Store the initial window height (full page height before keyboard)
  const initialWindowHeight = window.innerHeight;
  
  // Check for Visual Viewport API support
  if ('visualViewport' in window) {
    const viewport = window.visualViewport;
    
    function updateInputPosition() {
      const visualViewportHeight = viewport.height;
      const visualViewportOffset = viewport.offsetTop || 0;
      
      // Calculate where the input should be positioned
      // When keyboard is closed: at the bottom of the window
      // When keyboard is open: just above the keyboard (at bottom of visual viewport)
      const keyboardHeight = initialWindowHeight - visualViewportHeight;
      
      if (keyboardHeight > 150) {
        // Keyboard is open
        // Position input at the bottom of the visual viewport (above keyboard)
        const inputBottom = visualViewportOffset;
        inputArea.style.bottom = `${inputBottom}px`;
        messagesContainer.style.paddingBottom = `${120 + keyboardHeight}px`;
      } else {
        // Keyboard is closed
        // Position input at the bottom of the page
        inputArea.style.bottom = '0px';
        messagesContainer.style.paddingBottom = '120px';
      }
    }
    
    // Listen for viewport changes
    viewport.addEventListener('resize', updateInputPosition);
    viewport.addEventListener('scroll', updateInputPosition);
    
    // Initial positioning
    inputArea.style.bottom = '0px';
    updateInputPosition();
  } else {
    // Fallback: position at bottom if Visual Viewport API not available
    inputArea.style.bottom = '0px';
  }
  
  // Auto-scroll to bottom when input is focused
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('focus', function() {
      setTimeout(function() {
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 300);
    });
  }
})();
