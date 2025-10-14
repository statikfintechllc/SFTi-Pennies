#!/bin/bash
# Verification script to check if all paths are correctly updated

echo "=== Verifying Project Structure ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

# Function to check if directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

echo "Checking root files..."
check_file "index.html"
check_file "manifest.json"
check_file "LICENSE"
check_file "README.md"
echo ""

echo "Checking index.directory structure..."
check_dir "index.directory"
check_dir "index.directory/assets"
check_dir "index.directory/assets/css"
check_dir "index.directory/assets/js"
check_dir "index.directory/assets/icons"
check_dir "index.directory/assets/charts"
check_dir "index.directory/assets/sfti.notez.assets"
check_dir "index.directory/assets/sfti.tradez.assets"
echo ""

echo "Checking HTML files..."
check_file "index.directory/books.html"
check_file "index.directory/notes.html"
check_file "index.directory/add-trade.html"
check_file "index.directory/all-trades.html"
echo ""

echo "Checking data directories..."
check_dir "index.directory/Informational.Bookz"
check_dir "index.directory/SFTi.Notez"
check_dir "index.directory/SFTi.Tradez"
echo ""

echo "Checking JSON index files..."
check_file "index.directory/books-index.json"
check_file "index.directory/notes-index.json"
check_file "index.directory/trades-index.json"
echo ""

echo "Checking Python scripts..."
check_file ".github/scripts/generate_books_index.py"
check_file ".github/scripts/generate_notes_index.py"
check_file ".github/scripts/parse_trades.py"
check_file ".github/scripts/generate_charts.py"
check_file ".github/scripts/generate_index.py"
check_file ".github/scripts/update_homepage.py"
check_file ".github/scripts/generate_summaries.py"
echo ""

echo "Checking workflows..."
check_file ".github/workflows/trade_pipeline.yml"
echo ""

echo "=== Verification Complete ==="
