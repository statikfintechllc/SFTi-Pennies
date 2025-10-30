/**
 * Glowing Bubbles Navigation
 * Creates fixed navigation bubbles centered at the bottom of the viewport
 * with dropdown menus for quick access to key pages
 */

(function() {
  'use strict';
  
  /**
   * Initialize glowing bubbles navigation
   * Determines the correct path based on current page location
   */
  function initGlowingBubbles() {
    // Check if bubbles already exist to prevent duplicates
    const existingContainer = document.querySelector('.glowing-bubbles-container');
    if (existingContainer) {
      return;
    }
    
    // Determine base path robustly based on current location and directory depth
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    let basePath = '';
    let rootPath = '';

    // Find the index of 'index.directory' in the path
    const indexDirIdx = pathParts.indexOf('index.directory');
    
    if (indexDirIdx !== -1) {
      // We are inside index.directory
      // Count how many levels deep we are AFTER index.directory (excluding the HTML file)
      const afterIndexDir = pathParts.length - (indexDirIdx + 1) - 1;
      
      if (afterIndexDir <= 0) {
        // We are at the root of index.directory (e.g., /index.directory/books.html)
        basePath = '';
        rootPath = '../';
      } else {
        // We are in a subdirectory of index.directory (e.g., /index.directory/trades/trade.html)
        basePath = '../'.repeat(afterIndexDir);
        rootPath = basePath + '../';
      }
    } else {
      // Not in index.directory - we're at site root
      // Need to check if index.html is in the path parts
      const hasIndexHtml = pathParts.some(part => part.endsWith('.html'));
      
      if (hasIndexHtml) {
        // We have an HTML file, so we're at root level (e.g., /SFTi-Pennies/index.html or just /index.html)
        basePath = 'index.directory/';
        rootPath = '';
      } else {
        // Just a directory path, assume root
        basePath = 'index.directory/';
        rootPath = '';
      }
    }
    
    // Define bubble configurations with new structure
    const bubbles = [
      {
        type: 'button',
        class: 'bubble-login',
        tooltip: 'Login',
        id: 'bubble-auth-button',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>`
      },
      {
        type: 'link',
        href: `${basePath}add-trade.html`,
        class: 'bubble-add-trade',
        tooltip: 'Add Trade',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>`
      },
      {
        type: 'dropdown',
        class: 'bubble-books',
        tooltip: 'Books',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>`,
        dropdownItems: [
          { label: 'Study', href: `${basePath}books.html` },
          { label: 'Write', href: `${basePath}add-pdf.html` }
        ]
      },
      {
        type: 'dropdown',
        class: 'bubble-notes',
        tooltip: 'Notes',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>`,
        dropdownItems: [
          { label: 'Study', href: `${basePath}notes.html` },
          { label: 'Write', href: `${basePath}add-note.html` }
        ]
      },
      {
        type: 'dropdown',
        class: 'bubble-trades',
        tooltip: 'Trades',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
        </svg>`,
        dropdownItems: [
          { label: 'All Trades', href: `${basePath}all-trades.html` },
          { label: 'All Summaries', href: `${basePath}all-weeks.html` },
          { label: 'Analytics', href: `${basePath}analytics.html` },
          { label: 'Import CSV', href: `${basePath}import.html` },
          { label: 'Review Trades', href: `${basePath}review.html` }
        ]
      },
      {
        type: 'dropdown',
        class: 'bubble-mentors',
        tooltip: 'Mentors',
        icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
        </svg>`,
        dropdownItems: [
          { label: 'Timothy Sykes', href: 'https://www.timothysykes.com/', external: true },
          { label: 'Tim Bohen', href: 'https://www.stockstotrade.com/', external: true }
        ]
      }
    ];
    
    // Create container
    const container = document.createElement('div');
    container.className = 'glowing-bubbles-container';
    
    // Create bubble elements
    bubbles.forEach(bubble => {
      if (bubble.type === 'link') {
        // Simple link bubble
        const link = document.createElement('a');
        link.href = bubble.href;
        link.className = `glowing-bubble ${bubble.class}`;
        link.setAttribute('data-tooltip', bubble.tooltip);
        link.setAttribute('aria-label', bubble.tooltip);
        link.innerHTML = bubble.icon;
        container.appendChild(link);
      } else if (bubble.type === 'dropdown') {
        // Dropdown bubble
        const wrapper = document.createElement('div');
        wrapper.className = 'glowing-bubble-wrapper has-dropdown';
        
        const bubbleElement = document.createElement('div');
        bubbleElement.className = `glowing-bubble ${bubble.class}`;
        bubbleElement.setAttribute('data-tooltip', bubble.tooltip);
        bubbleElement.setAttribute('aria-label', bubble.tooltip);
        bubbleElement.innerHTML = bubble.icon;
        
        const dropdown = document.createElement('div');
        dropdown.className = 'bubble-dropdown';
        
        bubble.dropdownItems.forEach(item => {
          const link = document.createElement('a');
          link.href = item.href;
          link.textContent = item.label;
          if (item.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
          }
          dropdown.appendChild(link);
        });
        
        wrapper.appendChild(bubbleElement);
        wrapper.appendChild(dropdown);
        container.appendChild(wrapper);
        
        // Toggle dropdown on click/touch
        bubbleElement.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          const isActive = wrapper.classList.contains('active');
          
          // Close all other dropdowns
          document.querySelectorAll('.glowing-bubble-wrapper').forEach(w => {
            if (w !== wrapper) w.classList.remove('active');
          });
          
          // Toggle this dropdown
          wrapper.classList.toggle('active', !isActive);
        });
        
        // Prevent dropdown from closing when clicking inside it
        dropdown.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      } else if (bubble.type === 'button') {
        // Button bubble (for auth)
        const button = document.createElement('button');
        button.className = `glowing-bubble ${bubble.class}`;
        button.setAttribute('data-tooltip', bubble.tooltip);
        button.setAttribute('aria-label', bubble.tooltip);
        button.id = bubble.id;
        button.innerHTML = bubble.icon;
        container.appendChild(button);
      }
    });
    
    // Append to body
    document.body.appendChild(container);
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.glowing-bubble-wrapper')) {
        document.querySelectorAll('.glowing-bubble-wrapper').forEach(w => {
          w.classList.remove('active');
        });
      }
    });
    
    // Set up authentication button if it exists
    setupBubbleAuth();
  }
  
  /**
   * Set up authentication for bubble button
   */
  function setupBubbleAuth() {
    const authButton = document.getElementById('bubble-auth-button');
    if (!authButton) return;
    
    // Check if GitHubAuth is available
    if (typeof GitHubAuth !== 'undefined') {
      const auth = new GitHubAuth();
      
      if (auth.isAuthenticated()) {
        authButton.setAttribute('data-tooltip', 'Logout');
        authButton.addEventListener('click', () => {
          auth.clearAuth();
          window.location.reload();
        });
      } else {
        authButton.setAttribute('data-tooltip', 'Login');
        authButton.addEventListener('click', () => {
          if (typeof showAuthPrompt !== 'undefined') {
            showAuthPrompt();
          } else {
            alert('Authentication system not available. Please refresh the page.');
          }
        });
      }
    } else {
      // GitHubAuth not available, disable button
      authButton.setAttribute('data-tooltip', 'Auth Not Available');
      authButton.style.opacity = '0.5';
      authButton.style.cursor = 'not-allowed';
    }
  }
  
  /**
   * Initialize navbar home icon (mobile only)
   */
  function initNavbarHomeBubble() {
    const container = document.getElementById('navbar-mentors-bubble');
    if (!container) return;
    
    // Determine path to home
    const pathParts = window.location.pathname.split('/').filter(part => part !== '');
    const indexDirIdx = pathParts.indexOf('index.directory');
    let homePath = 'index.html';
    
    if (indexDirIdx !== -1) {
      // We are inside index.directory, need to go up
      const afterIndexDir = pathParts.length - (indexDirIdx + 1) - 1;
      if (afterIndexDir <= 0) {
        homePath = '../index.html';
      } else {
        homePath = '../'.repeat(afterIndexDir) + '../index.html';
      }
    }
    
    // Create a simple home icon link (no bubble)
    const link = document.createElement('a');
    link.href = homePath;
    link.className = 'navbar-home-icon';
    link.setAttribute('aria-label', 'Home');
    link.innerHTML = `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
    </svg>`;
    
    container.appendChild(link);
  }
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initGlowingBubbles();
      initNavbarHomeBubble();
    });
  } else {
    initGlowingBubbles();
    initNavbarHomeBubble();
  }
})();
