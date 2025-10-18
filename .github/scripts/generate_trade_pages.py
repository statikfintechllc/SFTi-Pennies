#!/usr/bin/env python3
"""
Generate Trade Detail Pages Script
Creates individual HTML pages for each trade with full details, charts, and media

Output: index.directory/trades/{trade-id}.html

TODO: Implement full trade page generation
"""

import json
import os
from pathlib import Path
from datetime import datetime


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open('index.directory/trades-index.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: index.directory/trades-index.json not found")
        return None


def generate_trade_html(trade):
    """
    Generate HTML for a single trade detail page
    
    Args:
        trade (dict): Trade dictionary
        
    Returns:
        str: HTML content
        
    TODO: Implement full HTML template with:
    - Trade metadata and details
    - P&L visualization
    - Screenshot gallery (GLightbox)
    - Notes section
    - Related trades
    """
    trade_number = trade.get('trade_number', 0)
    ticker = trade.get('ticker', 'UNKNOWN')
    entry_date = trade.get('entry_date', '')
    exit_date = trade.get('exit_date', '')
    pnl_usd = trade.get('pnl_usd', 0)
    pnl_percent = trade.get('pnl_percent', 0)
    direction = trade.get('direction', 'LONG')
    strategy = trade.get('strategy', 'Unknown')
    
    # TODO: Generate full HTML template
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
  <link rel="stylesheet" href="assets/css/main.css">
</head>
<body>
  <canvas id="bg-canvas"></canvas>
  
  <!-- Navigation -->
  <nav class="navbar">
    <div class="nav-container">
      <a href="index.html" class="nav-brand">📈 SFTi-Pennies</a>
      <ul class="nav-menu">
        <li class="nav-item"><a href="../index.html" class="nav-link">Home</a></li>
        <li class="nav-item"><a href="all-trades.html" class="nav-link">All Trades</a></li>
      </ul>
    </div>
  </nav>
  
  <!-- Main Content -->
  <main class="container">
    <section>
      <div style="margin-bottom: 2rem;">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
          <h1 style="margin: 0;">Trade #{trade_number}: {ticker}</h1>
          <span style="padding: 0.25rem 0.75rem; background: {'rgba(0,255,136,0.2)' if pnl_usd >= 0 else 'rgba(255,71,87,0.2)'}; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'}; border-radius: 4px; font-weight: 600; font-size: 0.875rem;">
            {'WIN' if pnl_usd >= 0 else 'LOSS'}
          </span>
        </div>
        <p style="color: var(--text-secondary);">{strategy} | {direction}</p>
      </div>
      
      <!-- Trade Metrics -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; background: var(--bg-secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">P&L (USD)</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: {'var(--accent-green)' if pnl_usd >= 0 else 'var(--accent-red)'};">
            ${pnl_usd:.2f}
          </div>
        </div>
        <div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">P&L (%)</div>
          <div style="font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: {'var(--accent-green)' if pnl_percent >= 0 else 'var(--accent-red)'};">
            {pnl_percent:.2f}%
          </div>
        </div>
        <div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">Entry</div>
          <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600;">{entry_date}</div>
        </div>
        <div>
          <div style="font-size: 0.875rem; color: var(--text-secondary);">Exit</div>
          <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 600;">{exit_date}</div>
        </div>
      </div>
      
      <!-- TODO: Add screenshot gallery, notes, full trade details -->
      <div style="background: var(--bg-tertiary); border: 2px dashed var(--accent-yellow); border-radius: 8px; padding: 1.5rem;">
        <h3 style="color: var(--accent-yellow); margin-bottom: 1rem;">TODO: Full Implementation</h3>
        <p style="color: var(--text-secondary); margin: 0;">
          This is a placeholder trade detail page. Full implementation should include:
          screenshot gallery with GLightbox, complete trade metadata, notes/journal entries,
          related trades, and performance metrics specific to this trade.
        </p>
      </div>
    </section>
  </main>
  
  <footer class="footer">
    <p>&copy; 2025 SFTi-Pennies Trading Journal</p>
  </footer>
  
  <!-- GLightbox JS -->
  <script src="https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js"></script>
  <script src="assets/js/background.js"></script>
  <script src="assets/js/app.js"></script>
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
    
    trades = index_data.get('trades', [])
    if not trades:
        print("No trades found")
        return
    
    print(f"Processing {len(trades)} trade(s)...")
    
    # Create output directory
    output_dir = Path('index.directory/trades')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate pages
    for trade in trades:
        trade_number = trade.get('trade_number', 0)
        ticker = trade.get('ticker', 'UNKNOWN')
        
        # Generate HTML
        html_content = generate_trade_html(trade)
        
        # Write file
        filename = f"trade-{trade_number:03d}-{ticker}.html"
        filepath = output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        print(f"Generated: {filepath}")
    
    print(f"\n✓ Generated {len(trades)} trade detail page(s)")
    print(f"Output directory: {output_dir}")


if __name__ == '__main__':
    main()
