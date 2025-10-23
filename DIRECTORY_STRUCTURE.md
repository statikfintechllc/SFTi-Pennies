# SFTi-Pennies Directory Structure

This document explains the directory structure and data flow for the SFTi-Pennies trading journal.

## Overview

The trading journal uses a two-tier structure:
1. **Source Data** (excluded from web deployment)
2. **Generated Assets** (included in web deployment)

## Directory Structure

```
SFTi-Pennies/
├── index.html                          # Main homepage
├── manifest.json                       # PWA manifest
│
├── index.directory/                    # Main content directory
│   ├── _config.yml                     # Jekyll configuration
│   │
│   ├── SFTi.Tradez/                    # ✅ SOURCE: Trade markdown files (excluded from build)
│   │   ├── week.YYYY.WW/               # Week folders (e.g., week.2025.43)
│   │   │   ├── MM:DD:YYYY.N.md         # Individual trade files (e.g., 10:23:2025.1.md)
│   │   │   └── master.trade.md         # Weekly summary
│   │   └── template/                   # Template files
│   │
│   ├── trades/                         # ✅ GENERATED: HTML trade detail pages (included in build)
│   │   └── trade-NNN-TICKER.html       # Individual trade HTML pages (e.g., trade-001-SGBX.html)
│   │
│   ├── summaries/                      # ✅ GENERATED: Period summaries (markdown)
│   │   ├── weekly-YYYY-WWW.md          # Weekly summaries (e.g., weekly-2025-W43.md)
│   │   ├── monthly-YYYY-MM.md          # Monthly summaries (e.g., monthly-2025-10.md)
│   │   └── yearly-YYYY.md              # Yearly summaries (e.g., yearly-2025.md)
│   │
│   ├── trades-index.json               # ✅ GENERATED: Master trade index (JSON)
│   │
│   ├── assets/                         # Static assets
│   │   ├── charts/                     # ✅ GENERATED: Chart data and images
│   │   │   ├── equity-curve-data.json  # Chart.js data
│   │   │   ├── trade-distribution-data.json
│   │   │   ├── performance-by-day-data.json
│   │   │   ├── ticker-performance-data.json
│   │   │   ├── analytics-data.json
│   │   │   ├── equity-curve.png        # Static chart images
│   │   │   └── trade-distribution.png
│   │   │
│   │   ├── sfti.tradez.assets/         # ✅ UPLOADED: Trade screenshots and images
│   │   │   └── week.YYYY.WW/           # Organized by week
│   │   │       └── MM:DD:YYYY.N/       # Organized by trade
│   │   │
│   │   ├── css/                        # Stylesheets
│   │   ├── js/                         # JavaScript files
│   │   │   ├── app.js                  # Main application logic
│   │   │   ├── charts.js               # Chart rendering
│   │   │   ├── analytics.js            # Analytics page logic
│   │   │   └── auth.js                 # GitHub authentication
│   │   └── icons/                      # PWA icons
│   │
│   ├── *.html                          # HTML pages
│   │   ├── add-trade.html              # Trade submission form
│   │   ├── all-trades.html             # ✅ GENERATED: List of all trades
│   │   ├── all-weeks.html              # Weekly view
│   │   ├── analytics.html              # Advanced analytics
│   │   └── import.html                 # CSV import interface
│   │
│   ├── Informational.Bookz/            # Trading education materials (excluded from build)
│   └── SFTi.Notez/                     # Trading notes (excluded from build)
│
└── .github/
    ├── scripts/                        # Automation scripts
    │   ├── parse_trades.py             # Parse markdown → JSON
    │   ├── generate_summaries.py       # Generate summaries
    │   ├── generate_charts.py          # Generate chart data
    │   ├── generate_analytics.py       # Generate analytics data
    │   ├── generate_index.py           # Generate master index
    │   ├── generate_trade_pages.py     # Generate HTML trade pages
    │   ├── import_csv.py               # Import from CSV
    │   └── ...                         # Other scripts
    │
    └── workflows/                      # GitHub Actions workflows
        ├── trade_pipeline.yml          # Main processing pipeline
        ├── import.yml                  # CSV import workflow
        └── site-submit.yml             # PR-based submission
```

## Data Flow

### 1. Trade Submission (via add-trade.html)

```
User fills form → 
  → Creates markdown file in index.directory/SFTi.Tradez/week.YYYY.WW/MM:DD:YYYY.N.md
  → Uploads images to index.directory/assets/sfti.tradez.assets/week.YYYY.WW/MM:DD:YYYY.N/
  → Triggers GitHub Actions workflow
```

### 2. CSV Import (via import.html or workflow)

```
User uploads CSV →
  → Script detects broker format
  → Parses trades
  → Creates markdown files in index.directory/SFTi.Tradez/week.*/
  → Triggers GitHub Actions workflow
```

### 3. Automated Processing (trade_pipeline.yml)

```
1. parse_trades.py:
   - Scans index.directory/SFTi.Tradez/week.*/*.md
   - Extracts YAML frontmatter
   - Generates index.directory/trades-index.json

2. generate_summaries.py:
   - Reads trades-index.json
   - Groups by week/month/year
   - Generates index.directory/summaries/*.md

3. generate_charts.py:
   - Reads trades-index.json
   - Generates index.directory/assets/charts/*.json (Chart.js data)
   - Generates index.directory/assets/charts/*.png (static images)

4. generate_analytics.py:
   - Reads trades-index.json
   - Calculates advanced metrics
   - Generates index.directory/assets/charts/analytics-data.json

5. generate_index.py:
   - Reads trades-index.json
   - Generates index.directory/all-trades.html

6. generate_trade_pages.py:
   - Reads trades-index.json
   - Generates index.directory/trades/trade-NNN-TICKER.html (one per trade)

7. Jekyll builds and deploys the site
```

### 4. Web Display

```
index.html →
  - Loads index.directory/trades-index.json
  - Displays recent trades
  - Loads chart data from index.directory/assets/charts/*.json
  - Renders charts using Chart.js

analytics.html →
  - Loads index.directory/assets/charts/analytics-data.json
  - Displays advanced metrics and charts

all-trades.html →
  - Pre-generated HTML table of all trades
  - Links to individual trade detail pages

trades/trade-NNN-TICKER.html →
  - Individual trade detail page
  - Displays screenshots from assets/sfti.tradez.assets/
```

## Key Points

### ✅ DO Use These Directories:
- **index.directory/SFTi.Tradez/** - Store all source trade markdown files here
- **index.directory/summaries/** - Automated summaries are generated here
- **index.directory/assets/sfti.tradez.assets/** - Upload all trade screenshots here
- **index.directory/assets/charts/** - All chart data is generated here

### ❌ DO NOT Use These Directories:
- **summaries/** (root) - Old location, no longer used
- **trades/** (root) - Never existed, don't create

### 🔄 Auto-Generated (Don't Edit Manually):
- **index.directory/trades/** - HTML files generated by generate_trade_pages.py
- **index.directory/trades-index.json** - Generated by parse_trades.py
- **index.directory/all-trades.html** - Generated by generate_index.py
- **index.directory/summaries/** - Generated by generate_summaries.py
- **index.directory/assets/charts/** - Generated by generate_charts.py and generate_analytics.py

## File Naming Conventions

### Trade Markdown Files
- Format: `MM:DD:YYYY.N.md` where N is the trade sequence number for that day
- Example: `10:23:2025.1.md` (first trade on October 23, 2025)
- Location: `index.directory/SFTi.Tradez/week.2025.43/10:23:2025.1.md`

### Week Folders
- Format: `week.YYYY.WW` using ISO week numbers
- Example: `week.2025.43` (week 43 of 2025)

### Trade HTML Pages
- Format: `trade-NNN-TICKER.html` where NNN is zero-padded trade number
- Example: `trade-001-SGBX.html`
- Location: `index.directory/trades/trade-001-SGBX.html`

### Summary Files
- Weekly: `weekly-YYYY-WWW.md` (e.g., `weekly-2025-W43.md`)
- Monthly: `monthly-YYYY-MM.md` (e.g., `monthly-2025-10.md`)
- Yearly: `yearly-YYYY.md` (e.g., `yearly-2025.md`)

## Troubleshooting

### Charts Not Showing
1. Check if `index.directory/assets/charts/*.json` files exist
2. Run `python .github/scripts/generate_charts.py` to regenerate
3. Check browser console for CORS errors (local file:// protocol won't work)
4. View via GitHub Pages or local web server

### Trades Not Appearing
1. Check if `index.directory/trades-index.json` exists
2. Run `python .github/scripts/parse_trades.py` to regenerate
3. Verify trade markdown files have valid YAML frontmatter
4. Check trade files are in `index.directory/SFTi.Tradez/week.*/`

### HTML Pages Blank
1. Check if data files (JSON) are accessible
2. Verify scripts are loaded correctly
3. Check browser console for JavaScript errors
4. Ensure viewing via HTTP/HTTPS (not file://)

## Maintenance

### Adding a New Trade
1. Use add-trade.html web form (recommended)
2. Or manually create markdown file in `index.directory/SFTi.Tradez/week.YYYY.WW/`
3. Push to GitHub - automation will generate all other files

### Regenerating All Data
```bash
# From repository root
python .github/scripts/parse_trades.py
python .github/scripts/generate_summaries.py
python .github/scripts/generate_charts.py
python .github/scripts/generate_analytics.py
python .github/scripts/generate_index.py
python .github/scripts/generate_trade_pages.py
```

### Cleaning Up
- Don't delete generated files manually
- Re-run scripts to regenerate
- Generated files are committed to Git for GitHub Pages deployment
