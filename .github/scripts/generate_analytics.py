#!/usr/bin/env python3
"""
Generate Analytics Script
Consumes trades-index.json and calculates advanced analytics metrics:
- Expectancy, Profit Factor, Max Drawdown, Win/Loss Streaks
- Per-tag and per-strategy summaries
- P&L and R-multiple distributions
Outputs JSON to index.directory/assets/analytics/*.json
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any


def load_trades_index(filepath: str) -> Dict[str, Any]:
    """Load trades from trades-index.json"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading trades index: {e}")
        return {"trades": [], "statistics": {}}


def calculate_expectancy(trades: List[Dict]) -> float:
    """Calculate expectancy (average P&L per trade)"""
    if not trades:
        return 0.0
    
    total_pnl = sum(t.get('pnl_usd', 0) for t in trades)
    return total_pnl / len(trades)


def calculate_profit_factor(trades: List[Dict]) -> float:
    """Calculate profit factor (gross profit / gross loss)"""
    gross_profit = sum(t.get('pnl_usd', 0) for t in trades if t.get('pnl_usd', 0) > 0)
    gross_loss = abs(sum(t.get('pnl_usd', 0) for t in trades if t.get('pnl_usd', 0) < 0))
    
    if gross_loss == 0:
        return float('inf') if gross_profit > 0 else 0.0
    
    return gross_profit / gross_loss


def calculate_max_drawdown(trades: List[Dict]) -> tuple:
    """Calculate maximum drawdown (absolute and percentage)"""
    if not trades:
        return 0.0, 0.0
    
    # Sort trades by date
    sorted_trades = sorted(trades, key=lambda t: t.get('entry_date', ''))
    
    # Calculate running equity curve
    equity = []
    cumulative_pnl = 0
    
    for trade in sorted_trades:
        cumulative_pnl += trade.get('pnl_usd', 0)
        equity.append(cumulative_pnl)
    
    if not equity:
        return 0.0, 0.0
    
    # Calculate drawdown
    max_drawdown = 0
    peak = equity[0]
    
    for value in equity:
        if value > peak:
            peak = value
        drawdown = peak - value
        if drawdown > max_drawdown:
            max_drawdown = drawdown
    
    # Calculate percentage drawdown
    max_drawdown_percent = (max_drawdown / peak * 100) if peak > 0 else 0
    
    return max_drawdown, max_drawdown_percent


def calculate_streaks(trades: List[Dict]) -> tuple:
    """Calculate best win and loss streaks"""
    if not trades:
        return 0, 0
    
    # Sort trades by date
    sorted_trades = sorted(trades, key=lambda t: t.get('entry_date', ''))
    
    current_win_streak = 0
    current_loss_streak = 0
    best_win_streak = 0
    best_loss_streak = 0
    
    for trade in sorted_trades:
        pnl = trade.get('pnl_usd', 0)
        
        if pnl > 0:
            current_win_streak += 1
            current_loss_streak = 0
            best_win_streak = max(best_win_streak, current_win_streak)
        elif pnl < 0:
            current_loss_streak += 1
            current_win_streak = 0
            best_loss_streak = max(best_loss_streak, current_loss_streak)
    
    return best_win_streak, best_loss_streak


def get_pnl_distribution(trades: List[Dict]) -> List[float]:
    """Get P&L values for distribution analysis"""
    return [t.get('pnl_usd', 0) for t in trades if 'pnl_usd' in t]


def get_r_multiple_distribution(trades: List[Dict]) -> List[float]:
    """Get R-multiple values for distribution analysis"""
    r_multiples = []
    
    for trade in trades:
        if 'r_multiple' in trade and trade['r_multiple'] is not None:
            r_multiples.append(float(trade['r_multiple']))
    
    return r_multiples


def calculate_strategy_breakdown(trades: List[Dict]) -> List[Dict]:
    """Calculate performance breakdown by strategy"""
    strategy_stats = {}
    
    for trade in trades:
        strategy = trade.get('strategy', 'Unspecified')
        
        if strategy not in strategy_stats:
            strategy_stats[strategy] = {
                'trades': [],
                'wins': 0,
                'losses': 0,
                'total_pnl': 0
            }
        
        pnl = trade.get('pnl_usd', 0)
        strategy_stats[strategy]['trades'].append(trade)
        strategy_stats[strategy]['total_pnl'] += pnl
        
        if pnl > 0:
            strategy_stats[strategy]['wins'] += 1
        elif pnl < 0:
            strategy_stats[strategy]['losses'] += 1
    
    # Calculate summary metrics
    breakdown = []
    for strategy, stats in strategy_stats.items():
        trade_count = len(stats['trades'])
        win_rate = stats['wins'] / trade_count if trade_count > 0 else 0
        avg_pnl = stats['total_pnl'] / trade_count if trade_count > 0 else 0
        
        breakdown.append({
            'strategy': strategy,
            'trade_count': trade_count,
            'win_rate': win_rate,
            'avg_pnl': avg_pnl,
            'total_pnl': stats['total_pnl']
        })
    
    # Sort by total P&L descending
    breakdown.sort(key=lambda x: x['total_pnl'], reverse=True)
    
    return breakdown


def calculate_tag_breakdown(trades: List[Dict]) -> List[Dict]:
    """Calculate performance breakdown by tags"""
    tag_stats = {}
    
    for trade in trades:
        tags = trade.get('tags', [])
        
        # Handle both list and string formats
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(',') if t.strip()]
        elif not isinstance(tags, list):
            tags = []
        
        for tag in tags:
            if tag not in tag_stats:
                tag_stats[tag] = {
                    'trades': [],
                    'wins': 0,
                    'losses': 0,
                    'total_pnl': 0
                }
            
            pnl = trade.get('pnl_usd', 0)
            tag_stats[tag]['trades'].append(trade)
            tag_stats[tag]['total_pnl'] += pnl
            
            if pnl > 0:
                tag_stats[tag]['wins'] += 1
            elif pnl < 0:
                tag_stats[tag]['losses'] += 1
    
    # Calculate summary metrics
    breakdown = []
    for tag, stats in tag_stats.items():
        trade_count = len(stats['trades'])
        win_rate = stats['wins'] / trade_count if trade_count > 0 else 0
        avg_pnl = stats['total_pnl'] / trade_count if trade_count > 0 else 0
        
        breakdown.append({
            'tag': tag,
            'trade_count': trade_count,
            'win_rate': win_rate,
            'avg_pnl': avg_pnl,
            'total_pnl': stats['total_pnl']
        })
    
    # Sort by total P&L descending
    breakdown.sort(key=lambda x: x['total_pnl'], reverse=True)
    
    return breakdown


def generate_analytics(trades_index_path: str, output_dir: str):
    """Generate all analytics and save to JSON files"""
    
    print("Loading trades index...")
    data = load_trades_index(trades_index_path)
    trades = data.get('trades', [])
    
    print(f"Loaded {len(trades)} trades")
    
    if not trades:
        print("No trades found. Creating empty analytics files.")
    
    # Calculate metrics
    print("Calculating metrics...")
    expectancy = calculate_expectancy(trades)
    profit_factor = calculate_profit_factor(trades)
    max_drawdown, max_drawdown_percent = calculate_max_drawdown(trades)
    best_win_streak, best_loss_streak = calculate_streaks(trades)
    
    # Get distributions
    pnl_distribution = get_pnl_distribution(trades)
    r_multiple_distribution = get_r_multiple_distribution(trades)
    
    # Calculate breakdowns
    print("Calculating strategy breakdown...")
    strategy_breakdown = calculate_strategy_breakdown(trades)
    
    print("Calculating tag breakdown...")
    tag_breakdown = calculate_tag_breakdown(trades)
    
    # Create metrics summary
    metrics = {
        'expectancy': round(expectancy, 2),
        'profit_factor': round(profit_factor, 2) if profit_factor != float('inf') else 999.99,
        'max_drawdown': round(max_drawdown, 2),
        'max_drawdown_percent': round(max_drawdown_percent, 2),
        'best_win_streak': best_win_streak,
        'best_loss_streak': best_loss_streak,
        'total_trades': len(trades),
        'winning_trades': sum(1 for t in trades if t.get('pnl_usd', 0) > 0),
        'losing_trades': sum(1 for t in trades if t.get('pnl_usd', 0) < 0),
        'pnl_distribution': pnl_distribution,
        'r_multiple_distribution': r_multiple_distribution,
        'generated_at': datetime.now().isoformat()
    }
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Save metrics
    print(f"Saving metrics to {output_dir}/metrics.json...")
    with open(os.path.join(output_dir, 'metrics.json'), 'w', encoding='utf-8') as f:
        json.dump(metrics, f, indent=2)
    
    # Save strategy breakdown
    print(f"Saving strategy breakdown to {output_dir}/strategy-breakdown.json...")
    with open(os.path.join(output_dir, 'strategy-breakdown.json'), 'w', encoding='utf-8') as f:
        json.dump(strategy_breakdown, f, indent=2)
    
    # Save tag breakdown
    print(f"Saving tag breakdown to {output_dir}/tag-breakdown.json...")
    with open(os.path.join(output_dir, 'tag-breakdown.json'), 'w', encoding='utf-8') as f:
        json.dump(tag_breakdown, f, indent=2)
    
    print("\n✅ Analytics generation complete!")
    print(f"   Expectancy: ${expectancy:.2f}")
    print(f"   Profit Factor: {profit_factor:.2f}")
    print(f"   Max Drawdown: {max_drawdown_percent:.2f}%")
    print(f"   Best Win Streak: {best_win_streak}")
    print(f"   Strategies: {len(strategy_breakdown)}")
    print(f"   Tags: {len(tag_breakdown)}")


def main():
    """Main entry point"""
    # Determine paths relative to script location
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent.parent
    
    trades_index_path = repo_root / 'index.directory' / 'trades-index.json'
    output_dir = repo_root / 'index.directory' / 'assets' / 'analytics'
    
    print("=" * 60)
    print("SFTi-Pennies Analytics Generator")
    print("=" * 60)
    print(f"Trades Index: {trades_index_path}")
    print(f"Output Dir: {output_dir}")
    print()
    
    generate_analytics(str(trades_index_path), str(output_dir))


if __name__ == '__main__':
    main()
