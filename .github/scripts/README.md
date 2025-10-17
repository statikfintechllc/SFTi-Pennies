# Automation Scripts

**📁 Location:** `/.github/scripts`

## Overview

This directory contains the automation scripts that power the SFTi-Pennies trading journal system. These Python and shell scripts process trade data, generate analytics, create visualizations, and optimize assets as part of the automated GitHub Actions pipeline.

## Scripts Inventory

### Core Processing Scripts

#### 1. `parse_trades.py`
**Purpose:** Extract and parse trade data from markdown files into JSON index

**What it does:**
- Scans `trades/` and `SFTi.Tradez/week.*/` directories for markdown files
- Extracts YAML frontmatter containing trade details
- Validates required fields (ticker, dates, prices, etc.)
- Calculates derived metrics (P&L, R:R ratio, time-in-trade)
- Generates `trades-index.json` with all trade data

**Input:** Markdown files with YAML frontmatter  
**Output:** `trades-index.json`  
**Dependencies:** `pyyaml`

**Example usage:**
```bash
python .github/scripts/parse_trades.py
```

#### 2. `generate_summaries.py`
**Purpose:** Create weekly, monthly, and yearly performance summaries

**What it does:**
- Reads trade data from `trades-index.json`
- Groups trades by time period (week/month/year)
- Calculates statistics for each period:
  - Total P&L and average P&L
  - Win rate and profit factor
  - Best and worst trades
  - Total trades and position sizes
- Generates markdown summary files in `summaries/` directory

**Input:** `trades-index.json`  
**Output:** `summaries/weekly-*.md`, `summaries/monthly-*.md`, `summaries/yearly-*.md`  
**Dependencies:** `pyyaml`

**Example usage:**
```bash
python .github/scripts/generate_summaries.py
```

#### 3. `generate_index.py`
**Purpose:** Create master trade index and all-trades.html page

**What it does:**
- Consolidates all trade data from JSON index
- Generates comprehensive HTML page with sortable trade table
- Creates navigation and filtering interface
- Ensures all trades are accessible via web interface

**Input:** `trades-index.json`  
**Output:** `all-trades.html`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_index.py
```

#### 4. `generate_charts.py`
**Purpose:** Create equity curves and performance visualizations

**What it does:**
- Reads trade data from `trades-index.json`
- Generates equity curve data for Chart.js (JSON format)
- Creates static chart images using matplotlib:
  - Cumulative P&L curve
  - Trade distribution chart
  - Win/loss visualization
- Saves charts to `assets/charts/` directory

**Input:** `trades-index.json`  
**Output:** 
- `assets/charts/equity-curve-data.json`
- `assets/charts/equity-curve.png`
- `assets/charts/trade-distribution.png`

**Dependencies:** `matplotlib`, `pyyaml`

**Example usage:**
```bash
python .github/scripts/generate_charts.py
```

#### 5. `update_homepage.py`
**Purpose:** Ensure homepage has access to latest trade data

**What it does:**
- Verifies `trades-index.json` exists and is accessible
- Updates any necessary data references
- Ensures homepage can load recent trades dynamically
- Validates data integrity

**Input:** `trades-index.json`  
**Output:** Updated `index.html` metadata (if needed)  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/update_homepage.py
```

### Content Indexing Scripts

#### 6. `generate_books_index.py`
**Purpose:** Create searchable index of trading education PDFs

**What it does:**
- Scans `index.directory/Informational.Bookz/` for PDF files
- Extracts metadata (file name, size, date modified)
- Generates JSON index with book information
- Creates `books-index.json` for the books viewer

**Input:** PDF files in `Informational.Bookz/`  
**Output:** `books-index.json`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_books_index.py
```

#### 7. `generate_notes_index.py`
**Purpose:** Create searchable index of trading notes and frameworks

**What it does:**
- Scans `index.directory/SFTi.Notez/` for markdown files
- Extracts titles, frontmatter, and excerpts
- Identifies related assets (images, diagrams)
- Generates JSON index with note metadata
- Creates `notes-index.json` for the notes viewer

**Input:** Markdown files in `SFTi.Notez/`  
**Output:** `notes-index.json`  
**Dependencies:** None

**Example usage:**
```bash
python .github/scripts/generate_notes_index.py
```

### Optimization Scripts

#### 8. `optimize_images.sh`
**Purpose:** Optimize uploaded images for web delivery

**What it does:**
- Finds images in `.github/assets/` and `assets/sfti.tradez.assets/`
- Optimizes PNG files using `optipng`
- Optimizes JPEG files using `jpegoptim`
- Moves optimized images to public `assets/images/` directory
- Reduces file sizes while maintaining quality

**Input:** Images in asset directories  
**Output:** Optimized images in `assets/images/`  
**Dependencies:** `optipng`, `jpegoptim` (system packages)

**Example usage:**
```bash
bash .github/scripts/optimize_images.sh
```

### Build Scripts

#### 9. `build.mjs`
**Purpose:** Bundle JavaScript dependencies for the web interface

**What it does:**
- Uses esbuild to bundle PDF.js and marked libraries
- Creates optimized JavaScript bundles
- Generates `bundle.min.js` for PDF and markdown rendering
- Manages dependencies for the frontend

**Input:** Node.js dependencies  
**Output:** `index.directory/assets/js/bundle.min.js`  
**Dependencies:** `esbuild`, `marked`, `pdfjs-dist`, `highlight.js`

**Example usage:**
```bash
node .github/scripts/build.mjs
# or
npm run build
```

### Testing Scripts

#### 10. `test_path_resolution.js`
**Purpose:** Test and debug path resolution in the application

**What it does:**
- Tests file path resolution logic
- Validates asset path construction
- Helps debug path-related issues
- Useful for development and troubleshooting

**Input:** Test paths  
**Output:** Console output with test results  
**Dependencies:** Node.js

**Example usage:**
```bash
node .github/scripts/test_path_resolution.js
```

## Dependencies

### Python Dependencies
All Python scripts use standard library plus:
- `pyyaml` - YAML parsing for frontmatter
- `matplotlib` - Chart generation
- `datetime` - Date/time handling
- `json` - JSON data processing
- `os` - File system operations

### System Dependencies
- `optipng` - PNG optimization
- `jpegoptim` - JPEG optimization
- Node.js - For build scripts

### Installation
```bash
# Python packages
pip install pyyaml matplotlib

# System packages (Ubuntu/Debian)
sudo apt-get install optipng jpegoptim

# Node.js packages
npm install
```

## Script Execution Order

In the GitHub Actions workflow, scripts execute in this order:

1. `parse_trades.py` - Create JSON index from markdown
2. `generate_books_index.py` - Index PDF library
3. `generate_notes_index.py` - Index trading notes
4. `generate_summaries.py` - Generate period summaries
5. `generate_index.py` - Create master index page
6. `generate_charts.py` - Generate visualizations
7. `update_homepage.py` - Ensure data accessibility
8. `optimize_images.sh` - Optimize and move images

This order ensures dependencies are met (e.g., JSON index exists before summaries are generated).

## Development

### Running Locally

Test individual scripts during development:

```bash
# From repository root
cd /path/to/SFTi-Pennies

# Run parse trades
python .github/scripts/parse_trades.py

# Run summaries
python .github/scripts/generate_summaries.py

# Run charts (requires trades-index.json)
python .github/scripts/generate_charts.py

# Build JS bundles
npm run build

# Optimize images
bash .github/scripts/optimize_images.sh
```

### Adding New Scripts

When adding new automation scripts:

1. **Create the script** in this directory
2. **Add executable permissions** (for .sh files): `chmod +x script.sh`
3. **Document the script** in this README
4. **Add to workflow** in `.github/workflows/trade_pipeline.yml`
5. **Test locally** before committing
6. **Update dependencies** if new packages are required

### Script Guidelines

- Use clear, descriptive names
- Add comprehensive docstrings/comments
- Handle errors gracefully
- Log progress and results
- Validate inputs before processing
- Use relative paths from repository root
- Follow existing code style
- Include usage examples in comments

## Troubleshooting

### Common Issues

**Script not found:**
```bash
# Ensure you're running from repo root
pwd  # Should be /path/to/SFTi-Pennies
```

**Python import errors:**
```bash
# Install missing dependencies
pip install pyyaml matplotlib
```

**Image optimization fails:**
```bash
# Install system packages
sudo apt-get install optipng jpegoptim
```

**Permission denied (shell scripts):**
```bash
# Add executable permission
chmod +x .github/scripts/optimize_images.sh
```

### Debugging

Enable verbose output:
```python
# Add to Python scripts
import logging
logging.basicConfig(level=logging.DEBUG)
```

Check script output:
```bash
# Run with output capture
python script.py > output.log 2>&1
cat output.log
```

## Performance

### Script Execution Times
- `parse_trades.py`: ~1-2 seconds (for 100 trades)
- `generate_summaries.py`: ~1-2 seconds
- `generate_charts.py`: ~5-10 seconds (matplotlib rendering)
- `generate_index.py`: ~1 second
- `optimize_images.sh`: ~1-2 seconds per image
- `build.mjs`: ~2-3 seconds

### Optimization Tips
- Scripts run in parallel where possible in GitHub Actions
- Large image optimization can be slow (consider pre-optimizing)
- Chart generation with matplotlib takes the longest
- JSON parsing is fast for reasonable dataset sizes (<1000 trades)

## Related Documentation

- [GitHub Actions Workflow](../workflows/README.md)
- [Trade Pipeline Documentation](../docs/TRADE_PIPELINE.md)
- [Developer Guide](../docs/README-DEV.md)
- [Templates](../templates/README.md)

---

**Last Updated:** October 2025  
**Script Count:** 10  
**Purpose:** Automated data processing and content generation
