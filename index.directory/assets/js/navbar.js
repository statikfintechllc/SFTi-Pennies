/**
 * Navbar Component
 * Dynamically generates and inserts the navigation bar into pages
 */

class Navbar {
  constructor(options = {}) {
    this.basePath = options.basePath || '';
    this.currentPath = options.currentPath || '';
    this.render();
  }

  /**
   * Generate the navbar HTML
   * @returns {string} HTML string for navbar
   */
  getNavbarHTML() {
    const { logoPath, homePath, booksPath, notesPath, allTradesPath, 
            allWeeksPath, analyticsPath, importPath, reviewPath, 
            addTradePath, homeIconPath } = this.getPaths();

    return `
<nav class="navbar navbar-floating">
  <div class="nav-container">
    <a href="${homePath}" class="nav-logo" style="color: var(--accent-green, #00ff88);">
      <img src="${logoPath}" alt="Chart Logo" class="green-svg" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle;">
    </a>
    <span class="nav-title" style="color: var(--accent-green, #00ff88);">SFTi-Pennies Trading Journal</span>
    
    <ul class="nav-menu">
      <li class="nav-item">
        <a href="${booksPath}" class="nav-link">Books</a>
      </li>
      
      <li class="nav-item">
        <a href="${notesPath}" class="nav-link">Notes</a>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link">Trades</a>
        <ul class="nav-submenu">
          <li><a href="${allTradesPath}" class="nav-link">All Trades</a></li>
          <li><a href="${allWeeksPath}" class="nav-link">All Summaries</a></li>
          <li><a href="${analyticsPath}" class="nav-link">Analytics</a></li>
          <li><a href="${importPath}" class="nav-link">Import CSV</a></li>
          <li><a href="${reviewPath}" class="nav-link">Review Trades</a></li>
        </ul>
      </li>
      
      <li class="nav-item has-submenu">
        <a href="#" class="nav-link">Mentors</a>
        <ul class="nav-submenu">
          <li><a href="https://www.timothysykes.com/" target="_blank" rel="noopener noreferrer" class="nav-link">Timothy Sykes</a></li>
          <li><a href="https://www.stockstotrade.com/" target="_blank" rel="noopener noreferrer" class="nav-link">Tim Bohen</a></li>
        </ul>
      </li>
      
      <li class="nav-item nav-buttons-group">
        <a href="${addTradePath}" class="nav-link btn btn-primary">+ Add Trade</a>
        <button id="auth-button" class="btn btn-secondary">Login</button>
      </li>
      
      <!-- Home Icon in Navbar -->
      <li class="nav-item nav-home-icon" style="margin-left: auto;">
        <a href="${homePath}" aria-label="Home" title="Home" style="color: var(--accent-green, #00ff88);">
          <img src="${homeIconPath}" alt="Home" class="green-svg" style="width: 32px; height: 32px; display: inline-block; vertical-align: middle;">
        </a>
      </li>
    </ul>
  </div>
</nav>`;
  }

  /**
   * Calculate relative paths based on current page location
   * @returns {object} Object containing all navigation paths
   */
  getPaths() {
    const path = window.location.pathname;
    let prefix = '';
    
    // Determine depth level
    if (path.includes('/index.directory/trades/')) {
      // In trades subdirectory (2 levels deep)
      prefix = '../';
      return {
        logoPath: `${prefix}assets/img/chart-logo.svg`,
        homeIconPath: `${prefix}assets/img/home-icon.svg`,
        homePath: '../../index.html',
        booksPath: `${prefix}books.html`,
        notesPath: `${prefix}notes.html`,
        allTradesPath: `${prefix}all-trades.html`,
        allWeeksPath: `${prefix}all-weeks.html`,
        analyticsPath: `${prefix}analytics.html`,
        importPath: `${prefix}import.html`,
        reviewPath: `${prefix}review.html`,
        addTradePath: `${prefix}add-trade.html`
      };
    } else if (path.includes('/index.directory/')) {
      // In index.directory (1 level deep)
      prefix = '';
      return {
        logoPath: 'assets/img/chart-logo.svg',
        homeIconPath: 'assets/img/home-icon.svg',
        homePath: '../index.html',
        booksPath: 'books.html',
        notesPath: 'notes.html',
        allTradesPath: 'all-trades.html',
        allWeeksPath: 'all-weeks.html',
        analyticsPath: 'analytics.html',
        importPath: 'import.html',
        reviewPath: 'review.html',
        addTradePath: 'add-trade.html'
      };
    } else {
      // At root level
      return {
        logoPath: 'index.directory/assets/img/chart-logo.svg',
        homeIconPath: 'index.directory/assets/img/home-icon.svg',
        homePath: 'index.html',
        booksPath: 'index.directory/books.html',
        notesPath: 'index.directory/notes.html',
        allTradesPath: 'index.directory/all-trades.html',
        allWeeksPath: 'index.directory/all-weeks.html',
        analyticsPath: 'index.directory/analytics.html',
        importPath: 'index.directory/import.html',
        reviewPath: 'index.directory/review.html',
        addTradePath: 'index.directory/add-trade.html'
      };
    }
  }

  /**
   * Render navbar into the page
   */
  render() {
    // Check if navbar already exists in HTML
    const existingNavbar = document.querySelector('nav.navbar');
    if (existingNavbar) {
      // Replace existing navbar
      existingNavbar.outerHTML = this.getNavbarHTML();
    } else {
      // Insert at the beginning of body
      const navbar = document.createElement('div');
      navbar.innerHTML = this.getNavbarHTML();
      document.body.insertBefore(navbar.firstElementChild, document.body.firstChild);
    }
    
    // Set up dropdown functionality after rendering
    this.setupDropdowns();
  }
  
  /**
   * Setup dropdown menu functionality
   */
  setupDropdowns() {
    const dropdownItems = document.querySelectorAll('.nav-item.has-submenu');
    
    dropdownItems.forEach(item => {
      // Toggle on click for mobile
      item.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('active');
        }
      });
      
      // Show on hover for desktop
      item.addEventListener('mouseenter', () => {
        if (window.innerWidth > 768) {
          item.classList.add('active');
        }
      });
      
      item.addEventListener('mouseleave', () => {
        if (window.innerWidth > 768) {
          item.classList.remove('active');
        }
      });
    });
  }
}

// Auto-initialize navbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
  });
} else {
  new Navbar();
}
