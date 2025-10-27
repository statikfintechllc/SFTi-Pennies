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
  
  const inputArea = document.querySelector('.copilot-chat-input-area');
  const messagesContainer = document.getElementById('chat-messages');
  
  if (!inputArea || !messagesContainer) {
    return;
  }
  
  // Check for Visual Viewport API support
  if ('visualViewport' in window) {
    const viewport = window.visualViewport;
    let lastHeight = viewport.height;
    
    function updateInputPosition() {
      const currentHeight = viewport.height;
      const keyboardHeight = window.innerHeight - currentHeight;
      
      if (keyboardHeight > 150) {
        // Keyboard is open - position input above keyboard
        inputArea.style.transform = `translateY(-${keyboardHeight}px)`;
        messagesContainer.style.paddingBottom = `${120 + keyboardHeight}px`;
      } else {
        // Keyboard is closed - reset to bottom
        inputArea.style.transform = '';
        messagesContainer.style.paddingBottom = '120px';
      }
      
      lastHeight = currentHeight;
    }
    
    // Listen for viewport changes
    viewport.addEventListener('resize', updateInputPosition);
    viewport.addEventListener('scroll', updateInputPosition);
    
    // Initial check
    updateInputPosition();
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
