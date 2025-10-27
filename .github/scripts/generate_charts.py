#!/usr/bin/env python3
"""
Generate Charts Script
Generates equity curve data in Chart.js compatible JSON format
and creates a static chart image using matplotlib (if available)
"""

import json
import os
from datetime import datetime

# Try to import matplotlib, but don't fail if it's not available
try:
    import matplotlib

    matplotlib.use("Agg")  # Use non-interactive backend
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates

    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    print("Note: matplotlib not available, skipping static chart generation")


def load_trades_index():
    """Load the trades index JSON file"""
    try:
        with open("index.directory/trades-index.json", "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        print("index.directory/trades-index.json not found. Run parse_trades.py first.")
        return None


def generate_equity_curve_data(trades):
    """
    Generate equity curve data from trades

    Args:
        trades (list): List of trade dictionaries sorted by date

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [
                {
                    "label": "Equity Curve",
                    "data": [],
                    "borderColor": "#00ff88",
                    "backgroundColor": "rgba(0, 255, 136, 0.1)",
                    "tension": 0.4,
                }
            ],
        }

    # Sort trades by exit date
    sorted_trades = sorted(
        trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
    )

    # Calculate cumulative P&L
    labels = []
    cumulative_pnl = []
    running_total = 0

    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl

        # Use exit date for the equity point
        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str))
            labels.append(date_obj.strftime("%Y-%m-%d"))
        except (ValueError, TypeError):
            labels.append(date_str)

        cumulative_pnl.append(round(running_total, 2))

    # Chart.js format
    chartjs_data = {
        "labels": labels,
        "datasets": [
            {
                "label": "Equity Curve",
                "data": cumulative_pnl,
                "borderColor": "#00ff88",
                "backgroundColor": "rgba(0, 255, 136, 0.1)",
                "fill": True,
                "tension": 0.4,
                "pointRadius": 4,
                "pointHoverRadius": 6,
                "pointBackgroundColor": "#00ff88",
                "pointBorderColor": "#0a0e27",
                "pointBorderWidth": 2,
            }
        ],
    }

    return chartjs_data


def generate_static_chart(
    trades, output_path="index.directory/assets/charts/equity-curve.png"
):
    """
    Generate a static equity curve image using matplotlib

    Args:
        trades (list): List of trade dictionaries
        output_path (str): Output file path for the chart
    """
    if not MATPLOTLIB_AVAILABLE:
        print("Skipping static chart generation (matplotlib not available)")
        return

    if not trades:
        print("No trades to chart")
        return

    # Sort trades by exit date
    sorted_trades = sorted(
        trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
    )

    # Calculate cumulative P&L
    dates = []
    cumulative_pnl = []
    running_total = 0

    for trade in sorted_trades:
        pnl = trade.get("pnl_usd", 0)
        running_total += pnl

        date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(date_str))
            dates.append(date_obj)
            cumulative_pnl.append(running_total)
        except (ValueError, TypeError):
            print(f"Warning: Could not parse date {date_str}")
            continue

    if not dates:
        print("No valid dates found for charting")
        return

    # Create the plot with dark theme
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(12, 6))

    # Plot the equity curve
    ax.plot(
        dates, cumulative_pnl, color="#00ff88", linewidth=2, marker="o", markersize=4
    )
    ax.fill_between(dates, cumulative_pnl, alpha=0.2, color="#00ff88")

    # Add a zero line
    ax.axhline(y=0, color="#ff4757", linestyle="--", alpha=0.5, linewidth=1)

    # Formatting
    ax.set_title(
        "Equity Curve", fontsize=16, fontweight="bold", color="#00ff88", pad=20
    )
    ax.set_xlabel("Date", fontsize=12, color="#e4e4e7")
    ax.set_ylabel("Cumulative P&L ($)", fontsize=12, color="#e4e4e7")

    # Format x-axis dates
    ax.xaxis.set_major_formatter(mdates.DateFormatter("%m/%d"))
    ax.xaxis.set_major_locator(mdates.AutoDateLocator())
    plt.xticks(rotation=45, ha="right")

    # Grid
    ax.grid(True, alpha=0.2, color="#a1a1aa")

    # Style
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#a1a1aa")
    ax.spines["bottom"].set_color("#a1a1aa")
    ax.tick_params(colors="#e4e4e7")

    # Set background color
    fig.patch.set_facecolor("#0a0e27")
    ax.set_facecolor("#0f1429")

    # Tight layout
    plt.tight_layout()

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the chart
    plt.savefig(output_path, dpi=150, facecolor="#0a0e27", edgecolor="none")
    plt.close()

    print(f"Static chart saved to {output_path}")


def generate_trade_distribution_chart(
    trades, output_path="index.directory/assets/charts/trade-distribution.png"
):
    """
    Generate a bar chart showing P&L distribution

    Args:
        trades (list): List of trade dictionaries
        output_path (str): Output file path for the chart
    """
    if not MATPLOTLIB_AVAILABLE:
        print("Skipping trade distribution chart generation (matplotlib not available)")
        return

    if not trades:
        return

    # Get P&L values
    pnls = [t.get("pnl_usd", 0) for t in trades]
    trade_numbers = [f"#{t.get('trade_number', i)}" for i, t in enumerate(trades, 1)]

    # Create the plot
    plt.style.use("dark_background")
    fig, ax = plt.subplots(figsize=(14, 6))

    # Color bars based on positive/negative
    colors = ["#00ff88" if pnl >= 0 else "#ff4757" for pnl in pnls]

    # Plot bars
    bars = ax.bar(
        trade_numbers, pnls, color=colors, alpha=0.8, edgecolor="#0a0e27", linewidth=1
    )

    # Add a zero line
    ax.axhline(y=0, color="#ffffff", linestyle="-", alpha=0.5, linewidth=1)

    # Formatting
    ax.set_title(
        "Trade P&L Distribution",
        fontsize=16,
        fontweight="bold",
        color="#00ff88",
        pad=20,
    )
    ax.set_xlabel("Trade Number", fontsize=12, color="#e4e4e7")
    ax.set_ylabel("P&L ($)", fontsize=12, color="#e4e4e7")

    # Rotate x-axis labels if many trades
    if len(trade_numbers) > 10:
        plt.xticks(rotation=45, ha="right")

    # Grid
    ax.grid(True, alpha=0.2, axis="y", color="#a1a1aa")

    # Style
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#a1a1aa")
    ax.spines["bottom"].set_color("#a1a1aa")
    ax.tick_params(colors="#e4e4e7")

    # Set background color
    fig.patch.set_facecolor("#0a0e27")
    ax.set_facecolor("#0f1429")

    # Tight layout
    plt.tight_layout()

    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Save the chart
    plt.savefig(output_path, dpi=150, facecolor="#0a0e27", edgecolor="none")
    plt.close()

    print(f"Distribution chart saved to {output_path}")


def generate_trade_distribution_data(trades):
    """
    Generate trade distribution data (wins vs losses) in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "P&L", "data": [], "backgroundColor": []}],
        }

    # Sort trades by exit date
    sorted_trades = sorted(
        trades, key=lambda t: t.get("exit_date", t.get("entry_date", ""))
    )

    # Get trade numbers and P&L values
    labels = []
    pnls = []
    colors = []

    for i, trade in enumerate(sorted_trades, 1):
        pnl = trade.get("pnl_usd", 0)
        trade_num = trade.get("trade_number", i)

        labels.append(f"Trade #{trade_num}")
        pnls.append(round(pnl, 2))
        colors.append("#00ff88" if pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "P&L ($)",
                "data": pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def generate_performance_by_day_data(trades):
    """
    Generate performance by day of week data in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "Average P&L", "data": [], "backgroundColor": []}],
        }

    # Initialize day statistics
    days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]
    day_stats = {day: {"total_pnl": 0, "count": 0} for day in days}

    # Aggregate by day of week
    for trade in trades:
        exit_date_str = trade.get("exit_date", trade.get("entry_date", ""))
        try:
            date_obj = datetime.fromisoformat(str(exit_date_str))
            day_name = date_obj.strftime("%A")
            pnl = trade.get("pnl_usd", 0)

            day_stats[day_name]["total_pnl"] += pnl
            day_stats[day_name]["count"] += 1
        except (ValueError, TypeError):
            continue

    # Calculate averages
    labels = []
    avg_pnls = []
    colors = []

    for day in days:
        if day_stats[day]["count"] > 0:
            labels.append(day)
            avg_pnl = day_stats[day]["total_pnl"] / day_stats[day]["count"]
            avg_pnls.append(round(avg_pnl, 2))
            colors.append("#00ff88" if avg_pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Average P&L ($)",
                "data": avg_pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def generate_ticker_performance_data(trades):
    """
    Generate performance by ticker data in Chart.js format

    Args:
        trades (list): List of trade dictionaries

    Returns:
        dict: Chart.js compatible data structure
    """
    if not trades:
        return {
            "labels": [],
            "datasets": [{"label": "Total P&L", "data": [], "backgroundColor": []}],
        }

    # Aggregate by ticker
    ticker_stats = {}

    for trade in trades:
        ticker = trade.get("ticker", "UNKNOWN")
        pnl = trade.get("pnl_usd", 0)

        if ticker not in ticker_stats:
            ticker_stats[ticker] = {"total_pnl": 0, "count": 0}

        ticker_stats[ticker]["total_pnl"] += pnl
        ticker_stats[ticker]["count"] += 1

    # Sort by total P&L (descending)
    sorted_tickers = sorted(
        ticker_stats.items(), key=lambda x: x[1]["total_pnl"], reverse=True
    )

    # Prepare data
    labels = []
    total_pnls = []
    colors = []

    for ticker, stats in sorted_tickers[:20]:  # Top 20 tickers
        labels.append(ticker)
        total_pnl = stats["total_pnl"]
        total_pnls.append(round(total_pnl, 2))
        colors.append("#00ff88" if total_pnl >= 0 else "#ff4757")

    return {
        "labels": labels,
        "datasets": [
            {
                "label": "Total P&L ($)",
                "data": total_pnls,
                "backgroundColor": colors,
                "borderColor": colors,
                "borderWidth": 2,
            }
        ],
    }


def main():
    """Main execution function"""
    print("Generating charts...")

    # Load trades index
    index_data = load_trades_index()
    if not index_data:
        return

    trades = index_data.get("trades", [])
    if not trades:
        print("No trades found in index")
        return

    print(f"Processing {len(trades)} trades...")

    # Ensure output directory exists
    os.makedirs("index.directory/assets/charts", exist_ok=True)

    # Generate all Chart.js data files
    print("Generating Chart.js data files...")

    # 1. Equity Curve
    equity_data = generate_equity_curve_data(trades)
    with open(
        "index.directory/assets/charts/equity-curve-data.json", "w", encoding="utf-8"
    ) as f:
        json.dump(equity_data, f, indent=2)
    print("  ✓ Equity curve data saved")

    # 2. Trade Distribution
    distribution_data = generate_trade_distribution_data(trades)
    with open(
        "index.directory/assets/charts/trade-distribution-data.json",
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(distribution_data, f, indent=2)
    print("  ✓ Trade distribution data saved")

    # 3. Performance by Day
    day_data = generate_performance_by_day_data(trades)
    with open(
        "index.directory/assets/charts/performance-by-day-data.json",
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(day_data, f, indent=2)
    print("  ✓ Performance by day data saved")

    # 4. Ticker Performance
    ticker_data = generate_ticker_performance_data(trades)
    with open(
        "index.directory/assets/charts/ticker-performance-data.json",
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(ticker_data, f, indent=2)
    print("  ✓ Ticker performance data saved")

    # Generate static charts (PNG images)
    print("\nGenerating static chart images...")
    try:
        generate_static_chart(trades)
        generate_trade_distribution_chart(trades)
        print("Static charts generated successfully")
    except Exception as e:
        print(f"Error generating static charts: {e}")
        print("Continuing without static charts...")


if __name__ == "__main__":
    main()
