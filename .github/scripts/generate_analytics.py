#!/usr/bin/env python3
"""
Generate Analytics Script
Computes advanced analytics from trades data including expectancy, streaks,
per-tag aggregates, drawdown series, and profit factors.

Output: analytics-data.json
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Tuple


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("index.directory/trades-index.json not found. Run parse_trades.py first.")
        return None


def calculate_expectancy(trades: List[Dict]) -> float:
    """
    Calculate expectancy (average P&L per trade)

    Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Expectancy value
    """
    if not trades:
        return 0.0

    # Single pass to calculate wins and losses
    total = len(trades)
    win_count = 0
    loss_count = 0
    total_wins = 0.0
    total_losses = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            win_count += 1
            total_wins += pnl
        elif pnl < 0:
            loss_count += 1
            total_losses += pnl

    win_rate = win_count / total if total > 0 else 0
    loss_rate = loss_count / total if total > 0 else 0

    avg_win = total_wins / win_count if win_count > 0 else 0
    avg_loss = abs(total_losses / loss_count) if loss_count > 0 else 0

    expectancy = (win_rate * avg_win) - (loss_rate * avg_loss)
    return round(expectancy, 2)


def calculate_profit_factor(trades: List[Dict]) -> float:
    """
    Calculate profit factor (gross profit / gross loss)

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Profit factor
    """
    if not trades:
        return 0.0

    # Single pass calculation
    gross_profit = 0.0
    gross_loss = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            gross_profit += pnl
        elif pnl < 0:
            gross_loss += pnl

    gross_loss = abs(gross_loss)
    
    if gross_loss == 0:
        return 0.0 if gross_profit == 0 else float("inf")

    return round(gross_profit / gross_loss, 2)


def calculate_streaks(trades: List[Dict]) -> Tuple[int, int]:
    """
    Calculate max win and loss streaks

    Args:
        trades: List of trade dictionaries (sorted by date)

    Returns:
        Tuple: (max_win_streak, max_loss_streak)
    """
    if not trades:
        return 0, 0

    current_win_streak = 0
    current_loss_streak = 0
    max_win_streak = 0
    max_loss_streak = 0

    for trade in trades:
        pnl = trade.get("pnl_usd", 0)

        if pnl > 0:
            current_win_streak += 1
            current_loss_streak = 0
            max_win_streak = max(max_win_streak, current_win_streak)
        elif pnl < 0:
            current_loss_streak += 1
            current_win_streak = 0
            max_loss_streak = max(max_loss_streak, current_loss_streak)

    return max_win_streak, max_loss_streak


def calculate_drawdown_series(trades: List[Dict]) -> Dict:
    """
    Calculate drawdown series over time

    Args:
        trades: List of trade dictionaries (sorted by date)

    Returns:
        Dict: {'labels': [...], 'values': [...]}
    """
    if not trades:
        return {"labels": [], "values": []}

    labels = []
    drawdowns = []

    cumulative_pnl = []
    running_total = 0

    for trade in trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl
        cumulative_pnl.append(running_total)

        # Date label
        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str).split("T")[0])
            labels.append(date_obj.strftime("%m/%d"))
        except:
            labels.append(date_str)

    # Calculate drawdown from peak
    peak = cumulative_pnl[0] if cumulative_pnl else 0
    for value in cumulative_pnl:
        if value > peak:
            peak = value
        drawdown = value - peak
        drawdowns.append(round(drawdown, 2))

    return {"labels": labels, "values": drawdowns}


def calculate_kelly_criterion(trades: List[Dict]) -> float:
    """
    Calculate Kelly Criterion percentage

    Kelly % = W - [(1 - W) / R]
    where W = win rate, R = avg win / avg loss ratio

    Args:
        trades: List of trade dictionaries

    Returns:
        float: Kelly percentage
    """
    if not trades:
        return 0.0

    # Single pass to calculate stats
    win_count = 0
    total_wins = 0.0
    total_losses = 0.0
    
    for t in trades:
        pnl = t.get("pnl_usd", 0)
        if pnl > 0:
            win_count += 1
            total_wins += pnl
        elif pnl < 0:
            total_losses += pnl
    
    loss_count = len(trades) - win_count

    if win_count == 0 or loss_count == 0:
        return 0.0

    win_rate = win_count / len(trades)
    avg_win = total_wins / win_count
    avg_loss = abs(total_losses / loss_count)

    if avg_loss == 0:
        return 0.0

    r_ratio = avg_win / avg_loss
    kelly = win_rate - ((1 - win_rate) / r_ratio)

    return round(kelly * 100, 1)


def aggregate_by_tag(trades: List[Dict], tag_field: str) -> Dict:
    """
    Aggregate statistics by a tag field (strategy, setup, etc.)

    Args:
        trades: List of trade dictionaries
        tag_field: Field to group by (e.g., 'strategy', 'setup')

    Returns:
        Dict: {tag_value: {stats...}, ...}
    """
    aggregates = {}

    # Group trades by tag and calculate stats in single pass
    for trade in trades:
        tag_value = trade.get(tag_field)
        if not tag_value or tag_value == "":
            tag_value = "Unclassified"

        if tag_value not in aggregates:
            aggregates[tag_value] = {
                "trades": [],
                "total_trades": 0,
                "winning_trades": 0,
                "losing_trades": 0,
                "win_rate": 0,
                "total_pnl": 0.0,
                "avg_pnl": 0,
                "expectancy": 0,
            }

        aggregates[tag_value]["trades"].append(trade)

    # Calculate stats for each tag in optimized manner
    for tag_value, data in aggregates.items():
        tag_trades = data["trades"]
        data["total_trades"] = len(tag_trades)
        
        # Calculate all metrics in single pass
        win_count = 0
        loss_count = 0
        total_pnl = 0.0
        
        for t in tag_trades:
            pnl = t.get("pnl_usd", 0)
            total_pnl += pnl
            if pnl > 0:
                win_count += 1
            elif pnl < 0:
                loss_count += 1
        
        data["winning_trades"] = win_count
        data["losing_trades"] = loss_count
        data["win_rate"] = round(
            (win_count / data["total_trades"] * 100) if data["total_trades"] > 0 else 0,
            1,
        )
        data["total_pnl"] = round(total_pnl, 2)
        data["avg_pnl"] = round(
            total_pnl / data["total_trades"] if data["total_trades"] > 0 else 0,
            2,
        )
        data["expectancy"] = calculate_expectancy(tag_trades)

        # Remove trades list from output
        del data["trades"]

    return aggregates


def main():
    """Main execution function"""
    print("Generating analytics...")

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    if not trades:
        print("No trades found in index")
        # Create empty analytics
        analytics = {
            "expectancy": 0,
            "profit_factor": 0,
            "max_win_streak": 0,
            "max_loss_streak": 0,
            "max_drawdown": 0,
            "kelly_criterion": 0,
            "by_strategy": {},
            "by_setup": {},
            "by_session": {},
            "drawdown_series": {"labels": [], "values": []},
            "generated_at": datetime.now().isoformat(),
        }
    else:
        print(f"Processing {len(trades)} trades...")

        # Sort trades by date
        sorted_trades = sorted(
            trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
        )

        # Calculate overall metrics
        expectancy = calculate_expectancy(sorted_trades)
        profit_factor = calculate_profit_factor(sorted_trades)
        max_win_streak, max_loss_streak = calculate_streaks(sorted_trades)
        drawdown_series = calculate_drawdown_series(sorted_trades)
        max_drawdown = (
            min(drawdown_series["values"]) if drawdown_series["values"] else 0
        )
        kelly = calculate_kelly_criterion(sorted_trades)

        # Aggregate by tags
        by_strategy = aggregate_by_tag(sorted_trades, "strategy")
        by_setup = aggregate_by_tag(sorted_trades, "setup")
        by_session = aggregate_by_tag(sorted_trades, "session")

        analytics = {
            "expectancy": expectancy,
            "profit_factor": profit_factor,
            "max_win_streak": max_win_streak,
            "max_loss_streak": max_loss_streak,
            "max_drawdown": max_drawdown,
            "kelly_criterion": kelly,
            "by_strategy": by_strategy,
            "by_setup": by_setup,
            "by_session": by_session,
            "drawdown_series": drawdown_series,
            "generated_at": datetime.now().isoformat(),
        }

    # Save analytics data
    os.makedirs("index.directory/assets/charts", exist_ok=True)
    output_file = "index.directory/assets/charts/analytics-data.json"

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(analytics, f, indent=2)

    print(f"Analytics written to {output_file}")
    print(f"Expectancy: ${analytics['expectancy']}")
    print(f"Profit Factor: {analytics['profit_factor']}")
    print(f"Kelly Criterion: {analytics['kelly_criterion']}%")


if __name__ == "__main__":
    main()
