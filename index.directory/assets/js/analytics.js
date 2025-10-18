/**
 * Analytics Dashboard JavaScript
 * Loads and displays advanced trading analytics
 */

class AnalyticsDashboard {
  constructor() {
    this.analyticsData = null;
    this.charts = {};
    this.init();
  }

  async init() {
    try {
      await this.loadAnalyticsData();
      this.renderMetrics();
      this.renderCharts();
      this.renderTables();
    } catch (error) {
      console.error('Error initializing analytics:', error);
      this.showError('Failed to load analytics data. Please ensure trades have been imported.');
    }
  }

  async loadAnalyticsData() {
    try {
      // Try to load from generated JSON files
      const [metricsResponse, strategyResponse, tagResponse] = await Promise.all([
        fetch('assets/analytics/metrics.json').catch(() => null),
        fetch('assets/analytics/strategy-breakdown.json').catch(() => null),
        fetch('assets/analytics/tag-breakdown.json').catch(() => null)
      ]);

      this.analyticsData = {
        metrics: metricsResponse ? await metricsResponse.json() : this.getDefaultMetrics(),
        strategies: strategyResponse ? await strategyResponse.json() : [],
        tags: tagResponse ? await tagResponse.json() : []
      };
    } catch (error) {
      console.error('Error loading analytics data:', error);
      this.analyticsData = {
        metrics: this.getDefaultMetrics(),
        strategies: [],
        tags: []
      };
    }
  }

  getDefaultMetrics() {
    return {
      expectancy: 0,
      profit_factor: 0,
      max_drawdown: 0,
      max_drawdown_percent: 0,
      best_win_streak: 0,
      best_loss_streak: 0,
      pnl_distribution: [],
      r_multiple_distribution: []
    };
  }

  renderMetrics() {
    const { metrics } = this.analyticsData;

    // Expectancy
    const expectancyEl = document.getElementById('expectancy-value');
    if (expectancyEl) {
      expectancyEl.textContent = this.formatCurrency(metrics.expectancy);
      expectancyEl.style.color = metrics.expectancy >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    // Profit Factor
    const profitFactorEl = document.getElementById('profit-factor-value');
    if (profitFactorEl) {
      profitFactorEl.textContent = metrics.profit_factor.toFixed(2);
      profitFactorEl.style.color = metrics.profit_factor >= 1 ? 'var(--accent-green)' : 'var(--accent-red)';
    }

    // Max Drawdown
    const maxDrawdownEl = document.getElementById('max-drawdown-value');
    if (maxDrawdownEl) {
      maxDrawdownEl.textContent = `${metrics.max_drawdown_percent.toFixed(2)}%`;
    }

    // Win Streak
    const winStreakEl = document.getElementById('win-streak-value');
    if (winStreakEl) {
      winStreakEl.textContent = metrics.best_win_streak;
    }
  }

  renderCharts() {
    const { metrics } = this.analyticsData;

    // P&L Distribution Chart
    this.renderPnLDistribution(metrics.pnl_distribution || []);

    // R-Multiple Chart
    this.renderRMultipleChart(metrics.r_multiple_distribution || []);
  }

  renderPnLDistribution(data) {
    const ctx = document.getElementById('pnl-distribution-chart');
    if (!ctx) return;

    if (this.charts.pnlDistribution) {
      this.charts.pnlDistribution.destroy();
    }

    // Create histogram bins if we have data
    const bins = data.length > 0 ? this.createHistogramBins(data, 10) : [];

    this.charts.pnlDistribution = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins.map(b => b.label),
        datasets: [{
          label: 'Number of Trades',
          data: bins.map(b => b.count),
          backgroundColor: bins.map(b => 
            b.value >= 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 71, 87, 0.6)'
          ),
          borderColor: bins.map(b => 
            b.value >= 0 ? 'rgba(0, 255, 136, 1)' : 'rgba(255, 71, 87, 1)'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: data.length === 0,
            text: 'No data available',
            color: '#a1a1aa'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(39, 39, 42, 0.5)'
            }
          },
          x: {
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(39, 39, 42, 0.5)'
            }
          }
        }
      }
    });
  }

  renderRMultipleChart(data) {
    const ctx = document.getElementById('r-multiple-chart');
    if (!ctx) return;

    if (this.charts.rMultiple) {
      this.charts.rMultiple.destroy();
    }

    const bins = data.length > 0 ? this.createHistogramBins(data, 10) : [];

    this.charts.rMultiple = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins.map(b => b.label),
        datasets: [{
          label: 'Number of Trades',
          data: bins.map(b => b.count),
          backgroundColor: bins.map(b => 
            b.value >= 0 ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 71, 87, 0.6)'
          ),
          borderColor: bins.map(b => 
            b.value >= 0 ? 'rgba(0, 255, 136, 1)' : 'rgba(255, 71, 87, 1)'
          ),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: data.length === 0,
            text: 'No data available',
            color: '#a1a1aa'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(39, 39, 42, 0.5)'
            }
          },
          x: {
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(39, 39, 42, 0.5)'
            }
          }
        }
      }
    });
  }

  renderTables() {
    this.renderStrategyTable();
    this.renderTagTable();
  }

  renderStrategyTable() {
    const tbody = document.getElementById('strategy-table-body');
    if (!tbody) return;

    const { strategies } = this.analyticsData;

    if (!strategies || strategies.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-dim);">
            No data available yet. Import trades or add them manually to see analytics.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = strategies.map(s => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;">${s.strategy || 'Unspecified'}</td>
        <td style="padding: 0.75rem;">${s.trade_count}</td>
        <td style="padding: 0.75rem;">${(s.win_rate * 100).toFixed(1)}%</td>
        <td style="padding: 0.75rem; color: ${s.avg_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          ${this.formatCurrency(s.avg_pnl)}
        </td>
        <td style="padding: 0.75rem; color: ${s.total_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 600;">
          ${this.formatCurrency(s.total_pnl)}
        </td>
      </tr>
    `).join('');
  }

  renderTagTable() {
    const tbody = document.getElementById('tag-table-body');
    if (!tbody) return;

    const { tags } = this.analyticsData;

    if (!tags || tags.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-dim);">
            No data available yet. Import trades or add them manually to see analytics.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = tags.map(t => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;">
          <span class="badge" style="padding: 0.25rem 0.5rem; background-color: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 4px;">
            ${t.tag}
          </span>
        </td>
        <td style="padding: 0.75rem;">${t.trade_count}</td>
        <td style="padding: 0.75rem;">${(t.win_rate * 100).toFixed(1)}%</td>
        <td style="padding: 0.75rem; color: ${t.avg_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          ${this.formatCurrency(t.avg_pnl)}
        </td>
        <td style="padding: 0.75rem; color: ${t.total_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}; font-weight: 600;">
          ${this.formatCurrency(t.total_pnl)}
        </td>
      </tr>
    `).join('');
  }

  createHistogramBins(data, numBins) {
    if (data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;

    const bins = Array(numBins).fill(0).map((_, i) => ({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
      value: min + i * binWidth + binWidth / 2
    }));

    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex].count++;
      }
    });

    bins.forEach(bin => {
      bin.label = `${bin.min.toFixed(2)} - ${bin.max.toFixed(2)}`;
    });

    return bins;
  }

  formatCurrency(value) {
    const sign = value >= 0 ? '+' : '';
    return `${sign}$${Math.abs(value).toFixed(2)}`;
  }

  showError(message) {
    console.error(message);
    // Could add a visible error message on the page
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AnalyticsDashboard();
});
