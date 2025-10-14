#!/usr/bin/env python3
"""
Generate Summaries Script
Generates weekly, monthly, and yearly summaries from parsed trade data
"""

import json
import os
from datetime import datetime, timedelta
from collections import defaultdict


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open('index.directory/trades-index.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("index.directory/trades-index.json not found. Run parse_trades.py first.")
        return None


def group_trades_by_period(trades, period='week'):
    """
    Group trades by time period (week, month, year)
    
    Args:
        trades (list): List of trade dictionaries
        period (str): 'week', 'month', or 'year'
        
    Returns:
        dict: Dictionary with period keys and trade lists as values
    """
    grouped = defaultdict(list)
    
    for trade in trades:
        try:
            entry_date = datetime.fromisoformat(str(trade.get('entry_date')))
            
            if period == 'week':
                # ISO week format: YYYY-Www
                key = f"{entry_date.year}-W{entry_date.isocalendar()[1]:02d}"
            elif period == 'month':
                # Format: YYYY-MM
                key = f"{entry_date.year}-{entry_date.month:02d}"
            elif period == 'year':
                # Format: YYYY
                key = str(entry_date.year)
            else:
                key = 'unknown'
            
            grouped[key].append(trade)
        except (ValueError, TypeError) as e:
            print(f"Warning: Could not parse date for trade {trade.get('trade_number')}: {e}")
            continue
    
    return dict(grouped)


def calculate_period_stats(trades):
    """
    Calculate statistics for a group of trades
    
    Args:
        trades (list): List of trade dictionaries
        
    Returns:
        dict: Period statistics
    """
    if not trades:
        return {}
    
    total_trades = len(trades)
    winners = [t for t in trades if t.get('pnl_usd', 0) > 0]
    losers = [t for t in trades if t.get('pnl_usd', 0) < 0]
    
    pnls = [t.get('pnl_usd', 0) for t in trades]
    total_pnl = sum(pnls)
    
    # Find best and worst trades
    best_trade = max(trades, key=lambda t: t.get('pnl_usd', 0))
    worst_trade = min(trades, key=lambda t: t.get('pnl_usd', 0))
    
    # Strategy breakdown
    strategies = defaultdict(lambda: {'count': 0, 'pnl': 0})
    for trade in trades:
        strategy = trade.get('strategy', 'Unknown')
        strategies[strategy]['count'] += 1
        strategies[strategy]['pnl'] += trade.get('pnl_usd', 0)
    
    return {
        'total_trades': total_trades,
        'winning_trades': len(winners),
        'losing_trades': len(losers),
        'win_rate': round(len(winners) / total_trades * 100, 2) if total_trades > 0 else 0,
        'total_pnl': round(total_pnl, 2),
        'avg_pnl': round(total_pnl / total_trades, 2) if total_trades > 0 else 0,
        'best_trade': {
            'ticker': best_trade.get('ticker'),
            'pnl': round(best_trade.get('pnl_usd', 0), 2),
            'trade_number': best_trade.get('trade_number')
        },
        'worst_trade': {
            'ticker': worst_trade.get('ticker'),
            'pnl': round(worst_trade.get('pnl_usd', 0), 2),
            'trade_number': worst_trade.get('trade_number')
        },
        'total_volume': sum(t.get('position_size', 0) for t in trades),
        'strategies': dict(strategies)
    }


def generate_summary_markdown(period_key, period_stats, period_type='week'):
    """
    Generate markdown summary for a period
    
    Args:
        period_key (str): Period identifier (e.g., '2025-W42')
        period_stats (dict): Statistics for the period
        period_type (str): 'week', 'month', or 'year'
        
    Returns:
        str: Markdown content
    """
    if period_type == 'week':
        title = f"Week {period_key.split('-W')[1]} Summary"
    elif period_type == 'month':
        year, month = period_key.split('-')
        month_name = datetime(int(year), int(month), 1).strftime('%B')
        title = f"{month_name} {year} Summary"
    else:
        title = f"{period_key} Summary"
    
    # Strategy breakdown
    strategy_lines = []
    for strategy, data in period_stats.get('strategies', {}).items():
        strategy_lines.append(
            f"- **{strategy}**: {data['count']} trades, ${data['pnl']:.2f} P&L"
        )
    strategy_breakdown = '\n'.join(strategy_lines) if strategy_lines else "- No strategies recorded"
    
    markdown = f"""# {title}

**Period**: {period_key}

## Statistics

- **Total Trades**: {period_stats['total_trades']}
- **Winning Trades**: {period_stats['winning_trades']}
- **Losing Trades**: {period_stats['losing_trades']}
- **Win Rate**: {period_stats['win_rate']}%
- **Total P&L**: ${period_stats['total_pnl']:.2f}
- **Average P&L per Trade**: ${period_stats['avg_pnl']:.2f}
- **Best Trade**: {period_stats['best_trade']['ticker']} (+${period_stats['best_trade']['pnl']:.2f})
- **Worst Trade**: {period_stats['worst_trade']['ticker']} (${period_stats['worst_trade']['pnl']:.2f})
- **Total Volume Traded**: {period_stats['total_volume']:,} shares

## Performance Analysis

### What Went Well

_To be filled in manually during review_

### What Needs Improvement

_To be filled in manually during review_

### Key Lessons Learned

_To be filled in manually during review_

## Strategy Breakdown

{strategy_breakdown}

## Next Period Goals

- _Goal 1_
- _Goal 2_
- _Goal 3_

---

**Generated**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
    return markdown


def main():
    """Main execution function"""
    print("Generating summaries...")
    
    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return
    
    trades = index_data.get('trades', [])
    if not trades:
        print("No trades found in index")
        return
    
    print(f"Processing {len(trades)} trades...")
    
    # Create summaries directory
    os.makedirs('summaries', exist_ok=True)
    
    # Generate weekly summaries
    print("Generating weekly summaries...")
    weekly_groups = group_trades_by_period(trades, 'week')
    for week_key, week_trades in weekly_groups.items():
        stats = calculate_period_stats(week_trades)
        markdown = generate_summary_markdown(week_key, stats, 'week')
        
        filename = f"summaries/weekly-{week_key}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"  Created {filename}")
    
    # Generate monthly summaries
    print("Generating monthly summaries...")
    monthly_groups = group_trades_by_period(trades, 'month')
    for month_key, month_trades in monthly_groups.items():
        stats = calculate_period_stats(month_trades)
        markdown = generate_summary_markdown(month_key, stats, 'month')
        
        filename = f"summaries/monthly-{month_key}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"  Created {filename}")
    
    # Generate yearly summaries
    print("Generating yearly summaries...")
    yearly_groups = group_trades_by_period(trades, 'year')
    for year_key, year_trades in yearly_groups.items():
        stats = calculate_period_stats(year_trades)
        markdown = generate_summary_markdown(year_key, stats, 'year')
        
        filename = f"summaries/yearly-{year_key}.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(markdown)
        print(f"  Created {filename}")
    
    print("Summary generation complete!")


if __name__ == '__main__':
    main()
