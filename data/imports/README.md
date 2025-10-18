# CSV Import Data Directory

This directory is used for importing trades from broker CSV files.

## Usage

1. **Place CSV file here**: Copy your broker's CSV export file to this directory
2. **Commit and push**: The GitHub Actions workflow will automatically detect and process it
3. **Check results**: Processed trades will appear in `index.directory/SFTi.Tradez/`
4. **Archive**: Processed CSV files are moved to `archive/` subdirectory

## Supported Brokers

- **Robinhood** ✅ - Fully supported
- **Interactive Brokers** ⏳ - Coming soon
- **Charles Schwab** ⏳ - Coming soon
- **Webull** ⏳ - Coming soon

## CSV Format

See `import.html` for expected format for each broker.

### Robinhood Example

```csv
Symbol,Activity Date,Activity Type,Quantity,Price,Amount
AAPL,2025-01-15,Buy,10,150.00,-1500.00
AAPL,2025-01-16,Sell,10,155.00,1550.00
```

## Manual Import

You can also run the importer manually:

```bash
python .github/scripts/import_csv.py data/imports/your_file.csv robinhood
```

## Notes

- Files are automatically archived after processing
- Only CSV files (*.csv) are processed
- Duplicate trades are not automatically detected - be careful!
