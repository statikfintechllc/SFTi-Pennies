/**
 * Glowing Bubbles Navigation
 * Creates fixed navigation bubbles at the bottom-right of the viewport
 * for quick access to key pages: Add Trade, Books, Notes, and All Trades
 */

(function() {
  'use strict';
  
  /**
   * Initialize glowing bubbles navigation
   * Determines the correct path based on current page location
   */
  function initGlowingBubbles() {
    // Check if bubbles already exist to prevent duplicates
    if (document.querySelector('.glowing-bubbles-container')) {
      return;
    }
    
    // Determine base path based on current location
    const currentPath = window.location.pathname;
    let basePath = '';
    
    // Determine if we're in root, index.directory, or trades subdirectory
    if (currentPath.includes('/trades/')) {
      basePath = '../';
    } else if (currentPath.includes('/index.directory/')) {
      basePath = '';
    } else if (currentPath === '/' || currentPath.endsWith('index.html')) {
      basePath = 'index.directory/';
    }
    
    // Define bubble configurations
    const bubbles = [
      {
        href: `${basePath}add-trade.html`,
        class: 'bubble-add-trade',
        tooltip: 'Add Trade',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>`
      },
      {
        href: `${basePath}books.html`,
        class: 'bubble-books',
        tooltip: 'Books',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>`
      },
      {
        href: `${basePath}notes.html`,
        class: 'bubble-notes',
        tooltip: 'Notes',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>`
      },
      {
        href: `${basePath}all-trades.html`,
        class: 'bubble-all-trades',
        tooltip: 'All Trades',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>`
      }
    ];
    
    // Create container
    const container = document.createElement('div');
    container.className = 'glowing-bubbles-container';
    
    // Create bubble elements
    bubbles.forEach(bubble => {
      const link = document.createElement('a');
      link.href = bubble.href;
      link.className = `glowing-bubble ${bubble.class}`;
      link.setAttribute('data-tooltip', bubble.tooltip);
      link.setAttribute('aria-label', bubble.tooltip);
      link.innerHTML = bubble.icon;
      container.appendChild(link);
    });
    
    // Append to body
    document.body.appendChild(container);
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlowingBubbles);
  } else {
    initGlowingBubbles();
  }
})();
