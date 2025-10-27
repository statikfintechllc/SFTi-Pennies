#!/usr/bin/env python3
"""
Generate Trade Detail Pages Script
Creates individual HTML pages for each trade with full details, charts, and media

Features:
- Generates responsive HTML pages with trade metrics
- Displays P&L, risk management, and trade details
- Includes image galleries with GLightbox integration
- Shows strategy and setup tags
- Mobile-friendly design with dark theme

Output: index.directory/trades/{trade-id}.html
"""

import json
import os
from pathlib import Path
from datetime import datetime


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: index.directory/trades-index.json not found")
        return None


def generate_trade_html(trade):
    """
    Generate HTML for a single trade detail page with full details

    Args:
        trade (dict): Trade dictionary

    Returns:
        str: HTML content
    """
    # Extract trade data
    trade_number = trade.get("trade_number", 0)
    ticker = trade.get("ticker", "UNKNOWN")
    entry_date = trade.get("entry_date", "")
    entry_time = trade.get("entry_time", "")
    exit_date = trade.get("exit_date", "")
    exit_time = trade.get("exit_time", "")
    entry_price = trade.get("entry_price", 0)
    exit_price = trade.get("exit_price", 0)
    position_size = trade.get("position_size", 0)
    pnl_usd = trade.get("pnl_usd", 0)
    pnl_percent = trade.get("pnl_percent", 0)
    direction = trade.get("direction", "LONG")
    strategy = trade.get("strategy", "Unknown")
    stop_loss = trade.get("stop_loss", 0)
    target_price = trade.get("target_price", 0)
    risk_reward_ratio = trade.get("risk_reward_ratio", 0)
    broker = trade.get("broker", "Unknown")
    notes = trade.get("notes", "No notes recorded.")

    # Get tags (v1.1 schema)
    strategy_tags = trade.get("strategy_tags", [])
    setup_tags = trade.get("setup_tags", [])
    session_tags = trade.get("session_tags", [])
    market_condition_tags = trade.get("market_condition_tags", [])

    # Get images
    images = trade.get("images", [])
    screenshots = trade.get("screenshots", [])
    if not images and screenshots:
        images = screenshots if isinstance(screenshots, list) else []

    # Calculate additional metrics
    time_in_trade = ""
    if entry_date and exit_date and entry_time and exit_time:
        try:
            entry_dt = datetime.strptime(f"{entry_date} {entry_time}", "%Y-%m-%d %H:%M")
            exit_dt = datetime.strptime(f"{exit_date} {exit_time}", "%Y-%m-%d %H:%M")
            duration = exit_dt - entry_dt
            hours = duration.total_seconds() / 3600
            if hours < 1:
                time_in_trade = f"{int(duration.total_seconds() / 60)} minutes"
            else:
                time_in_trade = f"{hours:.1f} hours"
        except:
            time_in_trade = "Unknown"

    # Generate tag badges HTML
    def render_tags(tags, color):
        if not tags:
            return '<span style="color: var(--text-secondary); font-style: italic;">None</span>'
        badges = []
        for tag in tags:
            badges.append(
                f'<span style="display: inline-block; padding: 0.25rem 0.75rem; background: {color}; color: white; border-radius: 4px; font-size: 0.875rem; margin-right: 0.5rem; margin-bottom: 0.5rem;">{tag}</span>'
            )
        return "".join(badges)

    # Generate image gallery HTML
    gallery_html = ""
    if images and len(images) > 0:
        gallery_items = []
        for idx, img in enumerate(images):
            if img and img != "None" and img.strip():
                # Adjust path: images come as ../../assets/... from markdown files
                # From trades/ directory, we need ../assets/...
                img_path = img.replace("../../assets/", "../assets/")
                gallery_items.append(
                    f"""
                <a href="{img_path}" class="glightbox" data-gallery="trade-{trade_number}">
                    <img src="{img_path}" alt="Trade screenshot {idx+1}" style="width: 200px; height: 150px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 2px solid var(--border-color); transition: all 0.3s;">
                </a>
                """
                )

        if gallery_items:
            gallery_html = f"""
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                    {''.join(gallery_items)}
                </div>
            </div>
            """
        else:
            gallery_html = """
            <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h2 style="margin-bottom: 1rem;">📸 Screenshots</h2>
                <p style="color: var(--text-secondary); margin: 0;">No screenshots available for this trade.</p>
            </div>
            """

    # Generate full HTML template
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Trade #{trade_number} - {ticker} details and analysis">
  <meta name="theme-color" content="#00ff88">
  
  <title>Trade #{trade_number} - {ticker} - SFTi-Pennies</title>
  
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Tailwind CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- GLightbox CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
  
  <!-- Custom Styles -->
  <link rel="stylesheet" href="../assets/css/main.css">
  <link rel="stylesheet" href="../assets/css/glass-effects.css">
  
  <!-- PWA Manifest -->
  <link rel="manifest" href="../../manifest.json">
  
  <!-- Icons -->
  <link rel="icon" type="image/png" sizes="192x192" href="../assets/icons/icon-192.png">
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  
  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <a href="../all-weeks.html" class="nav-brand">
        <img src="../assets/img/chart-logo.svg" alt="Chart Logo" style="width: 28px; height: 28px; display: inline-block; vertical-align: middle; margin-right: 8px;">
        SFTi-Pennies
      </a>
      
      <button class="nav-toggle" aria-label="Toggle navigation">
        <div class="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      
      <ul class="nav-menu">
        <li class="nav-item">
          <a href="../../index.html" class="nav-link">Home</a>
        </li>
        
        <li class="nav-item">
          <a href="../books.html" class="nav-link">Books</a>
        </li>
        
        <li class="nav-item">
          <a href="../notes.html" class="nav-link">Notes</a>
        </li>
        
        <li class="nav-item has-submenu">
          <a href="#" class="nav-link">Trades</a>
          <ul class="nav-submenu">
            <li><a href="../all-trades.html" class="nav-link">All Trades</a></li>
            <li><a href="../all-weeks.html" class="nav-link">All Weeks</a></li>
            <li><a href="../analytics.html" class="nav-link">Analytics</a></li>
            <li><a href="../import.html" class="nav-link">Import CSV</a></li>
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
          <a href="../add-trade.html" class="nav-link btn btn-primary">+ Add Trade</a>
          <button id="auth-button" class="btn btn-secondary">Login</button>
        </li>
      </ul>
    </div>
  </nav>
  
  <!-- Main Content -->
  <main class="container">
    <section>
      <!-- Header -->
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; flex-wrap: wrap;">
          <h1 style="margin: 0;">Trade #{trade_number}: {ticker}</h1>
          <span style="padding: 0.375rem 1rem; background: {'rgba(0,255,136,0.2)' if pnl_usd >= 0 else 'rgba(255,71,87,0.2)'}; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'}; border-radius: 6px; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em;">
            {'🎯 WIN' if pnl_usd >= 0 else '❌ LOSS'}
          </span>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
          <p style="color: var(--text-secondary); margin: 0;">{strategy} | {direction}</p>
          <span style="color: var(--text-secondary);">•</span>
          <p style="color: var(--text-secondary); margin: 0;">{broker}</p>
        </div>
      </div>
      
      <!-- Key Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px; border: 2px solid {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'};">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (USD)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'};">
            ${pnl_usd:.2f}
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">P&L (%)</div>
          <div style="font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: {'var(--accent-green)' if pnl_percent >= 0 else 'var(--accent-red)'};">
            {'+' if pnl_percent >= 0 else ''}{pnl_percent:.2f}%
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Position Size</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            {position_size} shares
          </div>
        </div>
        <div style="background: var(--bg-secondary); padding: 1.25rem; border-radius: 8px;">
          <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Time in Trade</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 600;">
            {time_in_trade}
          </div>
        </div>
      </div>
      
      <!-- Trade Details -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">📊 Trade Details</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-green); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Entry</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${entry_price:.2f}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">{entry_date}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">{entry_time}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 style="font-size: 0.875rem; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem;">Exit</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Price:</span>
                <span style="font-family: var(--font-mono); font-weight: 600;">${exit_price:.2f}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Date:</span>
                <span style="font-family: var(--font-mono);">{exit_date}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: var(--text-secondary);">Time:</span>
                <span style="font-family: var(--font-mono);">{exit_time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Risk Management -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🎯 Risk Management</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Stop Loss</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-red);">
              ${stop_loss:.2f}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Target Price</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-green);">
              ${target_price:.2f}
            </div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Risk:Reward Ratio</div>
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600; color: var(--accent-yellow);">
              1:{risk_reward_ratio:.2f}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tags Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">🏷️ Tags & Classification</h2>
        <div style="display: grid; gap: 1rem;">
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Strategy Tags:</div>
            <div>{render_tags(strategy_tags, 'var(--accent-green)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Setup Tags:</div>
            <div>{render_tags(setup_tags, 'var(--accent-blue)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Session Tags:</div>
            <div>{render_tags(session_tags, 'var(--accent-yellow)')}</div>
          </div>
          <div>
            <div style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem;">Market Condition Tags:</div>
            <div>{render_tags(market_condition_tags, 'var(--accent-red)')}</div>
          </div>
        </div>
      </div>
      
      <!-- Screenshots Gallery -->
      {gallery_html}
      
      <!-- Notes Section -->
      <div style="background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1rem;">📝 Notes & Journal</h2>
        <div style="line-height: 1.8; color: var(--text-primary);">
          {notes.replace(chr(10), '<br>')}
        </div>
      </div>
      
    </section>
  </main>
  
  <footer class="footer">
    <p>&copy; 2025 SFTi-Pennies Trading Journal</p>
    <p>
      <a href="https://www.linkedin.com/in/statikfintech-llc-780804368" target="_blank" style="color: var(--accent-green, #00ff88);">LinkedIn</a> |
      <a href="https://github.com/statikfintechllc" target="_blank" style="color: var(--accent-green, #00ff88);">Builds</a> |
      <a href="https://github.com/statikfintechllc/SFTi-Pennies/blob/master/LICENSE.md" target="_blank" style="color: var(--accent-green, #00ff88);">License</a>
    </p>
  </footer>
  
  <!-- GLightbox JS -->
  <script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>
  <script>
    // Initialize GLightbox for image gallery
    const lightbox = GLightbox({{
      selector: '.glightbox',
      touchNavigation: true,
      loop: true,
      autoplayVideos: true
    }});
  </script>
  <script src="../assets/js/background.js"></script>
  <script src="../assets/js/auth.js"></script>
  <script src="../assets/js/app.js"></script>
</body>
</html>
"""

    return html


def main():
    """Main execution function"""
    print("Generating trade detail pages...")

    # Load trades
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    if not trades:
        print("No trades found")
        return

    print(f"Processing {len(trades)} trade(s)...")

    # Create output directory
    output_dir = Path("index.directory/trades")
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate pages
    for trade in trades:
        trade_number = trade.get("trade_number", 0)
        ticker = trade.get("ticker", "UNKNOWN")

        # Generate HTML
        html_content = generate_trade_html(trade)

        # Write file
        filename = f"trade-{trade_number:03d}-{ticker}.html"
        filepath = output_dir / filename

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)

        print(f"Generated: {filepath}")

    print(f"\n✓ Generated {len(trades)} trade detail page(s)")
    print(f"Output directory: {output_dir}")


if __name__ == "__main__":
    main()
