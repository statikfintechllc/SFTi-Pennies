#!/usr/bin/env python3
"""
Export CSV Script
Exports trades from trades-index.json to CSV format

TODO: Implement full CSV export with configurable fields
"""

import json
import csv
import argparse
from datetime import datetime


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open('index.directory/trades-index.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("Error: index.directory/trades-index.json not found")
        return None


def export_to_csv(trades, output_file='trades-export.csv'):
    """
    Export trades to CSV file
    
    Args:
        trades (list): List of trade dictionaries
        output_file (str): Output CSV file path
        
    TODO: Implement full export with all fields
    """
    if not trades:
        print("No trades to export")
        return
    
    # Define CSV fields
    # TODO: Make this configurable
    fields = [
        'trade_number',
        'ticker',
        'entry_date',
        'entry_time',
        'entry_price',
        'exit_date',
        'exit_time',
        'exit_price',
        'position_size',
        'direction',
        'broker',
        'strategy',
        'pnl_usd',
        'pnl_percent',
        'risk_reward_ratio',
        'time_in_trade',
        'notes'
    ]
    
    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=fields, extrasaction='ignore')
            
            # Write header
            writer.writeheader()
            
            # Write trades
            for trade in trades:
                # Flatten nested fields if needed
                row = {field: trade.get(field, '') for field in fields}
                writer.writerow(row)
        
        print(f"Exported {len(trades)} trade(s) to {output_file}")
        
    except Exception as e:
        print(f"Error exporting to CSV: {e}")


def main():
    """Main execution function"""
    parser = argparse.ArgumentParser(
        description='Export trades to CSV format'
    )
    parser.add_argument(
        '--output',
        '-o',
        default='trades-export.csv',
        help='Output CSV file path (default: trades-export.csv)'
    )
    parser.add_argument(
        '--filter-strategy',
        help='Filter by strategy name'
    )
    parser.add_argument(
        '--filter-date-from',
        help='Filter trades from date (YYYY-MM-DD)'
    )
    parser.add_argument(
        '--filter-date-to',
        help='Filter trades to date (YYYY-MM-DD)'
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("SFTi-Pennies CSV Exporter")
    print("=" * 60)
    
    # Load trades
    index_data = load_trades_index()
    if not index_data:
        return
    
    trades = index_data.get('trades', [])
    print(f"Loaded {len(trades)} trade(s) from index")
    
    # TODO: Apply filters
    if args.filter_strategy:
        trades = [t for t in trades if t.get('strategy', '').lower() == args.filter_strategy.lower()]
        print(f"Filtered to {len(trades)} trade(s) with strategy '{args.filter_strategy}'")
    
    if args.filter_date_from:
        # TODO: Implement date filtering
        print(f"TODO: Filter from date {args.filter_date_from}")
    
    if args.filter_date_to:
        # TODO: Implement date filtering
        print(f"TODO: Filter to date {args.filter_date_to}")
    
    # Export
    if trades:
        export_to_csv(trades, args.output)
    else:
        print("No trades match filters")
    
    print("=" * 60)


if __name__ == '__main__':
    main()
