#!/usr/bin/env python3
"""
Navbar Template Module
Provides a consistent navbar HTML template for all pages
"""


def get_navbar_html(level="root"):
    """
    Generate navbar HTML with appropriate relative paths
    
    Args:
        level (str): The directory level - "root", "directory", or "subdirectory"
                    - "root": for index.html (at repository root)
                    - "directory": for files in index.directory/
                    - "subdirectory": for files in index.directory/trades/ etc.
    
    Returns:
        str: Complete navbar HTML
    """
    
    # Define paths based on directory level
    if level == "root":
        logo_path = "index.directory/assets/img/chart-logo.svg"
        home_icon_path = "index.directory/assets/img/home-icon.svg"
        home_path = "index.html"
        books_path = "index.directory/books.html"
        notes_path = "index.directory/notes.html"
        all_trades_path = "index.directory/all-trades.html"
        all_weeks_path = "index.directory/all-weeks.html"
        analytics_path = "index.directory/analytics.html"
        import_path = "index.directory/import.html"
        review_path = "index.directory/review.html"
        add_trade_path = "index.directory/add-trade.html"
    elif level == "directory":
        logo_path = "assets/img/chart-logo.svg"
        home_icon_path = "assets/img/home-icon.svg"
        home_path = "../index.html"
        books_path = "books.html"
        notes_path = "notes.html"
        all_trades_path = "all-trades.html"
        all_weeks_path = "all-weeks.html"
        analytics_path = "analytics.html"
        import_path = "import.html"
        review_path = "review.html"
        add_trade_path = "add-trade.html"
    elif level == "subdirectory":
        logo_path = "../assets/img/chart-logo.svg"
        home_icon_path = "../assets/img/home-icon.svg"
        home_path = "../../index.html"
        books_path = "../books.html"
        notes_path = "../notes.html"
        all_trades_path = "../all-trades.html"
        all_weeks_path = "../all-weeks.html"
        analytics_path = "../analytics.html"
        import_path = "../import.html"
        review_path = "../review.html"
        add_trade_path = "../add-trade.html"
    else:
        raise ValueError(f"Invalid level: {level}. Must be 'root', 'directory', or 'subdirectory'")
    
    return f"""  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <a href="{home_path}" class="nav-logo">
        <img src="{logo_path}" alt="Chart Logo" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle;">
      </a>
      <span class="nav-title">SFTi-Pennies Trading Journal</span>
      
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="{home_path}" class="nav-link">Home</a>
        </li>
        
        <li class="nav-item">
          <a href="{books_path}" class="nav-link">Books</a>
        </li>
        
        <li class="nav-item">
          <a href="{notes_path}" class="nav-link">Notes</a>
        </li>
        
        <li class="nav-item has-submenu">
          <a href="#" class="nav-link">Trades</a>
          <ul class="nav-submenu">
            <li><a href="{all_trades_path}" class="nav-link">All Trades</a></li>
            <li><a href="{all_weeks_path}" class="nav-link">All Summaries</a></li>
            <li><a href="{analytics_path}" class="nav-link">Analytics</a></li>
            <li><a href="{import_path}" class="nav-link">Import CSV</a></li>
            <li><a href="{review_path}" class="nav-link">Review Trades</a></li>
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
          <a href="{add_trade_path}" class="nav-link btn btn-primary">+ Add Trade</a>
          <button id="auth-button" class="btn btn-secondary">Login</button>
        </li>
        
        <!-- SVG Home Icon in Navbar -->
        <li class="nav-item nav-home-icon" style="margin-left: auto;">
          <a href="{home_path}" aria-label="Home" title="Home">
            <img src="{home_icon_path}" alt="Home" style="width: 32px; height: 32px; display: inline-block; vertical-align: middle;">
          </a>
        </li>
      </ul>
    </div>
  </nav>"""
