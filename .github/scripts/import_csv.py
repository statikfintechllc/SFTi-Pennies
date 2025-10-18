#!/usr/bin/env python3
"""
Import CSV Script
Entry point for importing broker CSV files into the trading journal

This script:
1. Detects the broker from CSV content
2. Parses trades using the appropriate importer
3. Validates trade data
4. Creates/updates trade markdown files in index.directory/SFTi.Tradez/
5. Updates trades-index.json

TODO: Implement full import workflow
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import List, Dict


def detect_broker(csv_content: str) -> str:
    """
    Auto-detect broker from CSV content
    
    Args:
        csv_content (str): Raw CSV content
        
    Returns:
        str: Detected broker name or None
        
    TODO: Implement broker detection by trying each importer's detect_format()
    """
    # TODO: Import and try each importer
    # from .importers import list_brokers, get_importer
    # 
    # for broker_name in list_brokers():
    #     importer = get_importer(broker_name)
    #     if importer.detect_format(csv_content):
    #         return broker_name
    
    return None


def parse_csv_file(csv_path: str, broker: str = None) -> List[Dict]:
    """
    Parse a CSV file into trades
    
    Args:
        csv_path (str): Path to CSV file
        broker (str, optional): Broker name (auto-detect if None)
        
    Returns:
        List[Dict]: List of parsed trades
        
    TODO: Implement full CSV parsing with broker detection
    """
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            csv_content = f.read()
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return []
    
    # Detect broker if not specified
    if not broker:
        broker = detect_broker(csv_content)
        if not broker:
            print("Could not auto-detect broker. Please specify with --broker flag")
            return []
        print(f"Detected broker: {broker}")
    
    # TODO: Get importer and parse
    # from .importers import get_importer
    # importer = get_importer(broker)
    # if not importer:
    #     print(f"No importer found for broker: {broker}")
    #     return []
    # 
    # trades = importer.parse_csv(csv_content)
    # return trades
    
    print("TODO: Implement CSV parsing")
    return []


def validate_trades(trades: List[Dict], broker: str) -> tuple[List[Dict], List[Dict]]:
    """
    Validate parsed trades
    
    Args:
        trades (List[Dict]): List of parsed trades
        broker (str): Broker name
        
    Returns:
        tuple: (valid_trades, invalid_trades_with_errors)
        
    TODO: Implement validation
    """
    # TODO: Use importer.validate_trade() for each trade
    valid = []
    invalid = []
    
    # Placeholder
    return trades, []


def create_trade_markdown(trade: Dict, output_dir: str) -> str:
    """
    Create a markdown file for a trade
    
    Args:
        trade (Dict): Trade dictionary
        output_dir (str): Output directory (e.g., index.directory/SFTi.Tradez/week.XXX)
        
    Returns:
        str: Path to created file
        
    TODO: Implement markdown generation with YAML frontmatter
    """
    # Determine week folder
    entry_date = trade.get('entry_date', datetime.now().isoformat())
    try:
        date_obj = datetime.fromisoformat(entry_date.split('T')[0])
        year = date_obj.year
        week = date_obj.isocalendar()[1]
        week_folder = f"week.{year}.{week:02d}"
    except:
        week_folder = "week.000"
    
    # Create week directory if needed
    week_path = os.path.join(output_dir, week_folder)
    os.makedirs(week_path, exist_ok=True)
    
    # Generate filename
    trade_num = trade.get('trade_number', 0)
    ticker = trade.get('ticker', 'UNKNOWN')
    filename = f"trade-{trade_num:03d}-{ticker}.md"
    filepath = os.path.join(week_path, filename)
    
    # TODO: Generate markdown content with YAML frontmatter
    # Use existing trade template format
    
    print(f"TODO: Create markdown file at {filepath}")
    return filepath


def update_trades_index(new_trades: List[Dict]):
    """
    Update the trades-index.json with newly imported trades
    
    Args:
        new_trades (List[Dict]): List of new trades to add
        
    TODO: Implement index update with de-duplication
    """
    index_path = 'index.directory/trades-index.json'
    
    # Load existing index
    try:
        with open(index_path, 'r', encoding='utf-8') as f:
            index_data = json.load(f)
    except FileNotFoundError:
        index_data = {
            'trades': [],
            'statistics': {},
            'version': '1.0'
        }
    
    # TODO: Merge new trades (check for duplicates by trade_number or date+ticker)
    # TODO: Recalculate statistics
    # TODO: Save updated index
    
    print("TODO: Update trades index")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description='Import trades from broker CSV files'
    )
    parser.add_argument(
        'csv_file',
        help='Path to CSV file to import'
    )
    parser.add_argument(
        '--broker',
        choices=['ibkr', 'schwab', 'robinhood', 'webull'],
        help='Broker name (auto-detect if not specified)'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Validate only, do not create files'
    )
    parser.add_argument(
        '--output-dir',
        default='index.directory/SFTi.Tradez',
        help='Output directory for trade files'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SFTi-Pennies CSV Importer")
    print("=" * 60)
    print(f"CSV File: {args.csv_file}")
    print(f"Broker: {args.broker or 'auto-detect'}")
    print(f"Dry Run: {args.dry_run}")
    print(f"Output: {args.output_dir}")
    print("=" * 60)
    
    # Check if CSV file exists
    if not os.path.exists(args.csv_file):
        print(f"Error: CSV file not found: {args.csv_file}")
        sys.exit(1)
    
    # Parse CSV
    print("\n[Step 1/4] Parsing CSV file...")
    trades = parse_csv_file(args.csv_file, args.broker)
    
    if not trades:
        print("No trades found in CSV file")
        sys.exit(0)
    
    print(f"Found {len(trades)} potential trade(s)")
    
    # Validate trades
    print("\n[Step 2/4] Validating trades...")
    valid_trades, invalid_trades = validate_trades(trades, args.broker or 'unknown')
    
    print(f"Valid trades: {len(valid_trades)}")
    print(f"Invalid trades: {len(invalid_trades)}")
    
    if invalid_trades:
        print("\nInvalid trades:")
        for i, (trade, errors) in enumerate(invalid_trades, 1):
            print(f"  {i}. {trade.get('ticker', 'UNKNOWN')}: {', '.join(errors)}")
    
    if not valid_trades:
        print("No valid trades to import")
        sys.exit(0)
    
    if args.dry_run:
        print("\n[DRY RUN] Would import {len(valid_trades)} trade(s)")
        sys.exit(0)
    
    # Create trade files
    print("\n[Step 3/4] Creating trade markdown files...")
    created_files = []
    for trade in valid_trades:
        filepath = create_trade_markdown(trade, args.output_dir)
        created_files.append(filepath)
    
    print(f"Created {len(created_files)} trade file(s)")
    
    # Update index
    print("\n[Step 4/4] Updating trades index...")
    update_trades_index(valid_trades)
    
    print("\n" + "=" * 60)
    print("Import complete!")
    print("=" * 60)
    print(f"Imported {len(valid_trades)} trade(s)")
    print(f"Created {len(created_files)} file(s)")
    print("\nNext steps:")
    print("1. Run: python .github/scripts/parse_trades.py")
    print("2. Run: python .github/scripts/generate_charts.py")
    print("3. Commit and push changes to trigger full pipeline")


if __name__ == '__main__':
    main()
