# Fixes Summary: Trade Data Directory Structure and Chart Issues

## Issue Overview
The repository had inconsistent directory paths for trade data, summaries were being generated in the wrong location, and there was confusion about which directories contained source data vs. generated files.

## Root Cause
The system was in transition between an old structure and a new structure. Key issues:
1. Summaries were being generated at root `summaries/` instead of `index.directory/summaries/`
2. Workflow referenced non-existent `trades/**` path at root
3. Directory structure was not clearly documented

## Changes Made

### 1. Fixed Summaries Directory Path
**File**: `.github/scripts/generate_summaries.py`
- Changed output path from `summaries/` to `index.directory/summaries/`
- Removed old `summaries/` directory from root
- Updated documentation in `.github/scripts/README.md`

### 2. Updated Workflow Configuration
**File**: `.github/workflows/trade_pipeline.yml`
- Removed trigger for non-existent `trades/**` path at root
- Added `index.directory/summaries/` to artifact uploads
- Cleaned up path references

### 3. Created Comprehensive Documentation
**File**: `DIRECTORY_STRUCTURE.md`
- Documented complete directory architecture
- Explained data flow from source to display
- Added troubleshooting guide
- Clarified naming conventions

### 4. Verified All Generation Scripts
All scripts tested and working correctly:
- ✅ `parse_trades.py` - Parses markdown to JSON
- ✅ `generate_summaries.py` - Creates period summaries
- ✅ `generate_charts.py` - Generates chart data
- ✅ `generate_analytics.py` - Creates analytics data
- ✅ `generate_index.py` - Builds all-trades.html
- ✅ `generate_trade_pages.py` - Creates individual trade HTML pages

## Current Architecture (Correct)

### Source Data (Not Deployed)
```
index.directory/SFTi.Tradez/
└── week.YYYY.WW/
    └── MM:DD:YYYY.N.md    # Source markdown files
```

### Generated Files (Deployed)
```
index.directory/
├── trades-index.json           # Master index
├── summaries/                  # Period summaries
│   ├── weekly-*.md
│   ├── monthly-*.md
│   └── yearly-*.md
├── trades/                     # Individual trade HTML pages
│   └── trade-NNN-TICKER.html
├── assets/charts/              # Chart data
│   ├── equity-curve-data.json
│   ├── analytics-data.json
│   └── *.json
└── *.html                      # Main HTML pages
```

## Why Charts Appear "Broken" Locally

The charts and data appear broken when viewing the HTML files directly (`file://` protocol) due to:
1. **CORS restrictions** - Browsers block fetch requests from local files
2. **Missing web server** - JavaScript modules and JSON loading require HTTP/HTTPS

### Solution
View the site through:
- GitHub Pages (deployed site)
- Local web server: `python -m http.server 8000`
- VS Code Live Server extension

The charts and data load correctly when served via HTTP/HTTPS.

## Testing Completed

### Scripts Tested
```bash
python .github/scripts/parse_trades.py           # ✅ Passed
python .github/scripts/generate_summaries.py     # ✅ Passed
python .github/scripts/generate_charts.py        # ✅ Passed
python .github/scripts/generate_analytics.py     # ✅ Passed
python .github/scripts/generate_index.py         # ✅ Passed
python .github/scripts/generate_trade_pages.py   # ✅ Passed
```

### Files Generated
- ✅ `index.directory/trades-index.json` - Contains 1 trade
- ✅ `index.directory/summaries/weekly-2025-W43.md`
- ✅ `index.directory/summaries/monthly-2025-10.md`
- ✅ `index.directory/summaries/yearly-2025.md`
- ✅ `index.directory/assets/charts/*.json` - All 5 chart data files
- ✅ `index.directory/all-trades.html` - Trade list page
- ✅ `index.directory/trades/trade-001-SGBX.html` - Trade detail page

## Validation

### Data Flow Verified
1. ✅ Markdown files in `SFTi.Tradez/` are parsed correctly
2. ✅ JSON index is generated with complete trade data
3. ✅ Chart data is generated from JSON index
4. ✅ HTML pages are generated with trade data
5. ✅ Summaries are generated in correct location

### Path References Verified
1. ✅ `app.js` uploads trades to `index.directory/SFTi.Tradez/`
2. ✅ `charts.js` loads data from `index.directory/assets/charts/`
3. ✅ `analytics.js` loads data from `index.directory/assets/charts/`
4. ✅ All scripts use correct directory paths

## Next Steps for Deployment

1. **Merge this PR** to apply all fixes
2. **Trigger the workflow** to generate all data files
3. **Deploy to GitHub Pages** to verify charts display correctly
4. **Add a new trade** via add-trade.html to test the complete flow

## Summary

All directory paths are now aligned and consistent:
- **Source**: `index.directory/SFTi.Tradez/week.*/`
- **Summaries**: `index.directory/summaries/`
- **Generated HTML**: `index.directory/trades/`
- **Chart Data**: `index.directory/assets/charts/`
- **Workflows**: Updated and aligned

The system is ready for deployment and should work correctly when served via GitHub Pages.
