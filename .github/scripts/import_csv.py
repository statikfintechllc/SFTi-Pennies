#!/usr/bin/env python3
"""
CSV Import Script
MVP importer for broker CSV files (starting with Robinhood)
Parses CSV rows into trade markdown files and updates trades-index.json
"""

import csv
import json
import os
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional


class BrokerCSVImporter:
    """Base class for broker-specific CSV importers"""
    
    def __init__(self, csv_path: str, output_dir: str):
        self.csv_path = csv_path
        self.output_dir = Path(output_dir)
        self.trades = []
        
    def parse_csv(self) -> List[Dict[str, Any]]:
        """Parse CSV file into trade dictionaries"""
        raise NotImplementedError("Subclasses must implement parse_csv()")
    
    def match_trades(self, rows: List[Dict]) -> List[Dict]:
        """Match buy and sell orders into complete trades"""
        raise NotImplementedError("Subclasses must implement match_trades()")
    
    def create_markdown_file(self, trade: Dict, trade_number: int) -> str:
        """Create markdown file for a trade"""
        # Determine week number from entry date
        entry_date = datetime.fromisoformat(trade['entry_date'])
        week_num = entry_date.isocalendar()[1]
        week_dir = self.output_dir / f'week.{week_num:04d}'
        week_dir.mkdir(parents=True, exist_ok=True)
        
        # Create filename
        ticker = trade['ticker']
        direction = trade['direction'].lower()
        filename = f"{entry_date.strftime('%Y.%m.%d')}.{ticker}.{direction}.md"
        filepath = week_dir / filename
        
        # Calculate time in trade
        entry_dt = datetime.fromisoformat(trade['entry_date'])
        exit_dt = datetime.fromisoformat(trade['exit_date'])
        duration_hours = (exit_dt - entry_dt).total_seconds() / 3600
        
        # Create frontmatter
        frontmatter = f"""---
trade_number: {trade_number}
ticker: {trade['ticker']}
direction: {trade['direction']}
entry_date: {trade['entry_date']}
exit_date: {trade['exit_date']}
entry_price: {trade['entry_price']}
exit_price: {trade['exit_price']}
position_size: {trade['position_size']}
pnl_usd: {trade['pnl_usd']}
pnl_percent: {trade['pnl_percent']}
time_in_trade_hours: {duration_hours:.2f}
"""
        
        # Add optional fields if present
        if 'strategy' in trade and trade['strategy']:
            frontmatter += f"strategy: {trade['strategy']}\n"
        
        if 'tags' in trade and trade['tags']:
            if isinstance(trade['tags'], list):
                frontmatter += f"tags: [{', '.join(trade['tags'])}]\n"
            else:
                frontmatter += f"tags: {trade['tags']}\n"
        
        if 'r_multiple' in trade and trade['r_multiple'] is not None:
            frontmatter += f"r_multiple: {trade['r_multiple']}\n"
        
        frontmatter += "---\n\n"
        
        # Create body
        body = f"""## Trade Summary

**{trade['ticker']}** - {trade['direction']} position

### Entry
- **Date**: {trade['entry_date']}
- **Price**: ${trade['entry_price']}
- **Size**: {trade['position_size']} shares

### Exit
- **Date**: {trade['exit_date']}
- **Price**: ${trade['exit_price']}

### Results
- **P&L**: ${trade['pnl_usd']:.2f} ({trade['pnl_percent']:.2f}%)
- **Duration**: {duration_hours:.2f} hours

"""
        
        if 'notes' in trade and trade['notes']:
            body += f"""### Notes

{trade['notes']}
"""
        
        # Write file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(frontmatter + body)
        
        return str(filepath)
    
    def import_trades(self) -> List[Dict]:
        """Main import process"""
        print(f"Parsing CSV: {self.csv_path}")
        rows = self.parse_csv()
        
        print(f"Matching {len(rows)} transactions into trades...")
        self.trades = self.match_trades(rows)
        
        print(f"Found {len(self.trades)} complete trades")
        return self.trades


class RobinhoodCSVImporter(BrokerCSVImporter):
    """Importer for Robinhood CSV files"""
    
    def parse_csv(self) -> List[Dict[str, Any]]:
        """Parse Robinhood CSV format"""
        rows = []
        
        with open(self.csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Skip non-trade activities
                activity_type = row.get('Activity Type', '').strip()
                if activity_type not in ['Buy', 'Sell']:
                    continue
                
                rows.append({
                    'symbol': row.get('Symbol', '').strip(),
                    'date': row.get('Activity Date', '').strip(),
                    'type': activity_type,
                    'quantity': float(row.get('Quantity', 0)),
                    'price': float(row.get('Price', 0)),
                    'amount': float(row.get('Amount', 0))
                })
        
        return rows
    
    def match_trades(self, rows: List[Dict]) -> List[Dict]:
        """Match buy and sell orders into complete trades"""
        # Group by symbol
        by_symbol = {}
        for row in rows:
            symbol = row['symbol']
            if symbol not in by_symbol:
                by_symbol[symbol] = []
            by_symbol[symbol].append(row)
        
        # Match trades for each symbol
        trades = []
        
        for symbol, transactions in by_symbol.items():
            # Sort by date
            transactions.sort(key=lambda x: x['date'])
            
            # Simple FIFO matching
            position = 0
            entry_price = 0
            entry_date = None
            
            for txn in transactions:
                if txn['type'] == 'Buy':
                    if position == 0:
                        entry_price = txn['price']
                        entry_date = txn['date']
                    position += txn['quantity']
                
                elif txn['type'] == 'Sell' and position > 0:
                    # Create a trade
                    exit_price = txn['price']
                    exit_date = txn['date']
                    shares = min(position, txn['quantity'])
                    
                    pnl_usd = (exit_price - entry_price) * shares
                    pnl_percent = ((exit_price - entry_price) / entry_price) * 100 if entry_price > 0 else 0
                    
                    trade = {
                        'ticker': symbol,
                        'direction': 'Long',  # Robinhood doesn't support shorts
                        'entry_date': entry_date,
                        'exit_date': exit_date,
                        'entry_price': entry_price,
                        'exit_price': exit_price,
                        'position_size': int(shares),
                        'pnl_usd': round(pnl_usd, 2),
                        'pnl_percent': round(pnl_percent, 2)
                    }
                    
                    trades.append(trade)
                    
                    position -= shares
                    
                    # If still have position, keep current entry
                    if position <= 0:
                        position = 0
                        entry_price = 0
                        entry_date = None
        
        return trades


class IBKRCSVImporter(BrokerCSVImporter):
    """Importer for Interactive Brokers CSV files (stub for future)"""
    
    def parse_csv(self) -> List[Dict[str, Any]]:
        raise NotImplementedError("IBKR importer coming soon")
    
    def match_trades(self, rows: List[Dict]) -> List[Dict]:
        raise NotImplementedError("IBKR importer coming soon")


def update_trades_index(new_trades: List[Dict], index_path: str, start_number: int):
    """Update trades-index.json with new trades"""
    
    # Load existing index
    if os.path.exists(index_path):
        with open(index_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {
            'trades': [],
            'statistics': {},
            'version': '1.0'
        }
    
    # Add new trades
    existing_trades = data.get('trades', [])
    next_number = start_number
    
    for trade in new_trades:
        trade['trade_number'] = next_number
        existing_trades.append(trade)
        next_number += 1
    
    data['trades'] = existing_trades
    data['generated_at'] = datetime.now().isoformat()
    
    # Recalculate statistics
    total_pnl = sum(t.get('pnl_usd', 0) for t in existing_trades)
    winning = [t for t in existing_trades if t.get('pnl_usd', 0) > 0]
    losing = [t for t in existing_trades if t.get('pnl_usd', 0) < 0]
    
    data['statistics'] = {
        'total_trades': len(existing_trades),
        'winning_trades': len(winning),
        'losing_trades': len(losing),
        'win_rate': len(winning) / len(existing_trades) if existing_trades else 0,
        'total_pnl': total_pnl,
        'avg_pnl': total_pnl / len(existing_trades) if existing_trades else 0,
        'avg_winner': sum(t['pnl_usd'] for t in winning) / len(winning) if winning else 0,
        'avg_loser': sum(t['pnl_usd'] for t in losing) / len(losing) if losing else 0,
        'largest_win': max((t.get('pnl_usd', 0) for t in existing_trades), default=0),
        'largest_loss': min((t.get('pnl_usd', 0) for t in existing_trades), default=0)
    }
    
    # Save updated index
    with open(index_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"✅ Updated trades index with {len(new_trades)} new trades")


def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        print("Usage: python import_csv.py <csv_file> [broker]")
        print("Brokers: robinhood (default), ibkr, schwab, webull")
        sys.exit(1)
    
    csv_file = sys.argv[1]
    broker = sys.argv[2] if len(sys.argv) > 2 else 'robinhood'
    
    # Determine paths
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent
    
    trades_dir = repo_root / 'index.directory' / 'SFTi.Tradez'
    index_path = repo_root / 'index.directory' / 'trades-index.json'
    
    print("=" * 60)
    print("SFTi-Pennies CSV Importer")
    print("=" * 60)
    print(f"CSV File: {csv_file}")
    print(f"Broker: {broker}")
    print(f"Output Dir: {trades_dir}")
    print()
    
    # Select importer
    if broker.lower() == 'robinhood':
        importer = RobinhoodCSVImporter(csv_file, trades_dir)
    elif broker.lower() == 'ibkr':
        importer = IBKRCSVImporter(csv_file, trades_dir)
    else:
        print(f"❌ Unsupported broker: {broker}")
        print("   Supported: robinhood, ibkr (coming soon)")
        sys.exit(1)
    
    # Import trades
    try:
        trades = importer.import_trades()
        
        if not trades:
            print("⚠️  No trades found in CSV")
            sys.exit(0)
        
        # Get next trade number
        if os.path.exists(index_path):
            with open(index_path, 'r') as f:
                data = json.load(f)
                existing = data.get('trades', [])
                next_number = max((t.get('trade_number', 0) for t in existing), default=0) + 1
        else:
            next_number = 1
        
        # Create markdown files
        print(f"\nCreating markdown files...")
        for i, trade in enumerate(trades):
            trade_num = next_number + i
            filepath = importer.create_markdown_file(trade, trade_num)
            print(f"  ✓ Created: {filepath}")
        
        # Update index
        print("\nUpdating trades index...")
        update_trades_index(trades, str(index_path), next_number)
        
        print("\n✅ Import complete!")
        print(f"   Imported: {len(trades)} trades")
        print(f"   Trade numbers: {next_number} - {next_number + len(trades) - 1}")
        
    except Exception as e:
        print(f"❌ Error during import: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
