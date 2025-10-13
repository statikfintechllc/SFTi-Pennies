#!/usr/bin/env python3
"""
Parse Trades Script
Parses markdown files from the trades/ directory and generates a JSON index
with all trade data extracted from YAML frontmatter
"""

import os
import json
import yaml
import glob
from pathlib import Path
from datetime import datetime


def parse_frontmatter(content):
    """
    Extract YAML frontmatter from markdown content
    
    Args:
        content (str): Markdown file content
        
    Returns:
        tuple: (frontmatter_dict, markdown_body)
    """
    if not content.startswith('---'):
        return {}, content
    
    try:
        # Split content by --- markers
        parts = content.split('---', 2)
        if len(parts) < 3:
            return {}, content
        
        # Parse YAML frontmatter
        frontmatter = yaml.safe_load(parts[1])
        body = parts[2].strip()
        
        return frontmatter, body
    except Exception as e:
        print(f"Error parsing frontmatter: {e}")
        return {}, content


def parse_trade_file(filepath):
    """
    Parse a single trade markdown file
    
    Args:
        filepath (str): Path to trade markdown file
        
    Returns:
        dict: Parsed trade data or None if parsing fails
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        frontmatter, body = parse_frontmatter(content)
        
        if not frontmatter:
            print(f"Warning: No frontmatter found in {filepath}")
            return None
        
        # Validate required fields
        required_fields = [
            'trade_number', 'ticker', 'entry_date', 'entry_price',
            'exit_price', 'position_size', 'direction'
        ]
        
        missing_fields = [f for f in required_fields if f not in frontmatter]
        if missing_fields:
            print(f"Warning: Missing required fields in {filepath}: {missing_fields}")
            return None
        
        # Add computed fields
        trade_data = {
            'file_path': filepath,
            'body': body[:200] + '...' if len(body) > 200 else body,  # Preview
            **frontmatter
        }
        
        # Ensure numeric fields are properly typed
        numeric_fields = [
            'trade_number', 'entry_price', 'exit_price', 'position_size',
            'stop_loss', 'target_price', 'pnl_usd', 'pnl_percent', 'risk_reward_ratio'
        ]
        
        for field in numeric_fields:
            if field in trade_data and trade_data[field] is not None:
                try:
                    trade_data[field] = float(trade_data[field])
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert {field} to number in {filepath}")
        
        # Convert trade_number to int specifically
        if 'trade_number' in trade_data:
            trade_data['trade_number'] = int(trade_data['trade_number'])
        
        return trade_data
        
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
        return None


def calculate_statistics(trades):
    """
    Calculate aggregate statistics from all trades
    
    Args:
        trades (list): List of trade dictionaries
        
    Returns:
        dict: Statistics dictionary
    """
    if not trades:
        return {
            'total_trades': 0,
            'winning_trades': 0,
            'losing_trades': 0,
            'win_rate': 0,
            'total_pnl': 0,
            'avg_pnl': 0,
            'avg_winner': 0,
            'avg_loser': 0,
            'largest_win': 0,
            'largest_loss': 0,
            'total_volume': 0
        }
    
    # Calculate basic stats
    total_trades = len(trades)
    winners = [t for t in trades if t.get('pnl_usd', 0) > 0]
    losers = [t for t in trades if t.get('pnl_usd', 0) < 0]
    
    winning_trades = len(winners)
    losing_trades = len(losers)
    win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0
    
    # P&L calculations
    pnls = [t.get('pnl_usd', 0) for t in trades]
    total_pnl = sum(pnls)
    avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
    
    winner_pnls = [t.get('pnl_usd', 0) for t in winners]
    loser_pnls = [t.get('pnl_usd', 0) for t in losers]
    
    avg_winner = sum(winner_pnls) / len(winners) if winners else 0
    avg_loser = sum(loser_pnls) / len(losers) if losers else 0
    
    largest_win = max(pnls) if pnls else 0
    largest_loss = min(pnls) if pnls else 0
    
    # Volume
    total_volume = sum(t.get('position_size', 0) for t in trades)
    
    # Calculate max drawdown (simple version based on cumulative P&L)
    cumulative_pnl = []
    running_total = 0
    for pnl in pnls:
        running_total += pnl
        cumulative_pnl.append(running_total)
    
    max_drawdown = 0
    if cumulative_pnl:
        peak = cumulative_pnl[0]
        for value in cumulative_pnl:
            if value > peak:
                peak = value
            drawdown = peak - value
            if drawdown > max_drawdown:
                max_drawdown = drawdown
    
    return {
        'total_trades': total_trades,
        'winning_trades': winning_trades,
        'losing_trades': losing_trades,
        'win_rate': round(win_rate, 2),
        'total_pnl': round(total_pnl, 2),
        'avg_pnl': round(avg_pnl, 2),
        'avg_winner': round(avg_winner, 2),
        'avg_loser': round(avg_loser, 2),
        'largest_win': round(largest_win, 2),
        'largest_loss': round(largest_loss, 2),
        'total_volume': int(total_volume),
        'max_drawdown': round(max_drawdown, 2),
        'profit_factor': round(abs(avg_winner / avg_loser), 2) if avg_loser != 0 else 0
    }


def main():
    """Main execution function"""
    print("Starting trade parsing...")
    
    # Find all trade markdown files
    trade_files = glob.glob('trades/*.md') + glob.glob('trades/**/*.md', recursive=True)
    
    if not trade_files:
        print("No trade files found in trades/ directory")
        # Create empty index
        output = {
            'trades': [],
            'statistics': calculate_statistics([]),
            'generated_at': datetime.now().isoformat(),
            'version': '1.0'
        }
    else:
        print(f"Found {len(trade_files)} trade file(s)")
        
        # Parse all trade files
        trades = []
        for filepath in trade_files:
            print(f"Parsing {filepath}...")
            trade_data = parse_trade_file(filepath)
            if trade_data:
                trades.append(trade_data)
        
        print(f"Successfully parsed {len(trades)} trade(s)")
        
        # Sort trades by trade number
        trades.sort(key=lambda x: x.get('trade_number', 0))
        
        # Calculate statistics
        stats = calculate_statistics(trades)
        
        # Generate output
        output = {
            'trades': trades,
            'statistics': stats,
            'generated_at': datetime.now().isoformat(),
            'version': '1.0'
        }
    
    # Write JSON index
    output_file = 'trades-index.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"Trade index written to {output_file}")
    print(f"Total trades: {output['statistics']['total_trades']}")
    print(f"Win rate: {output['statistics']['win_rate']}%")
    print(f"Total P&L: ${output['statistics']['total_pnl']}")


if __name__ == '__main__':
    main()
