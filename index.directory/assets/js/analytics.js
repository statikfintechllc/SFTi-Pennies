/**
 * Analytics Page JavaScript
 * Loads analytics data from analytics-data.json and renders advanced charts and metrics
 * Falls back to mock data if analytics-data.json is not available
 */

// State
let analyticsData = null;

// DOM elements
const metricExpectancy = document.getElementById('metric-expectancy');
const metricProfitFactor = document.getElementById('metric-profit-factor');
const metricWinStreak = document.getElementById('metric-win-streak');
const metricLossStreak = document.getElementById('metric-loss-streak');
const metricMaxDrawdown = document.getElementById('metric-max-drawdown');
const metricKelly = document.getElementById('metric-kelly');
const strategyTableBody = document.getElementById('strategy-table-body');

// Charts
let strategyChart = null;
let setupChart = null;
let winrateChart = null;
let drawdownChart = null;

/**
 * Initialize analytics page
 */
async function initAnalytics() {
  try {
    // Load analytics-data.json
    try {
      const response = await fetch('assets/charts/analytics-data.json');
      if (response.ok) {
        analyticsData = await response.json();
        console.log('Loaded analytics data from file');
      } else {
        console.warn('Analytics data not found, using mock data');
        analyticsData = getMockAnalyticsData();
      }
    } catch (fetchError) {
      console.warn('Error fetching analytics data, using mock data:', fetchError);
      analyticsData = getMockAnalyticsData();
    }
    
    // Update metrics
    updateMetrics(analyticsData);
    
    // Render charts
    renderStrategyChart(analyticsData);
    renderSetupChart(analyticsData);
    renderWinRateChart(analyticsData);
    renderDrawdownChart(analyticsData);
    
    // Render table
    renderStrategyTable(analyticsData);
    
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

/**
 * Update metrics display
 */
function updateMetrics(data) {
  if (!data) return;
  
  metricExpectancy.textContent = `$${data.expectancy?.toFixed(2) || '0.00'}`;
  metricProfitFactor.textContent = data.profit_factor?.toFixed(2) || '0.00';
  metricWinStreak.textContent = data.max_win_streak || '0';
  metricLossStreak.textContent = data.max_loss_streak || '0';
  metricMaxDrawdown.textContent = `$${Math.abs(data.max_drawdown || 0).toFixed(2)}`;
  metricKelly.textContent = `${(data.kelly_criterion || 0).toFixed(1)}%`;
}

/**
 * Render performance by strategy chart
 */
function renderStrategyChart(data) {
  const ctx = document.getElementById('strategy-chart');
  if (!ctx || !data.by_strategy) return;
  
  const strategies = Object.keys(data.by_strategy);
  const pnls = strategies.map(s => data.by_strategy[s].total_pnl);
  
  if (strategyChart) strategyChart.destroy();
  
  strategyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: strategies,
      datasets: [{
        label: 'Total P&L ($)',
        data: pnls,
        backgroundColor: pnls.map(p => p >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)'),
        borderColor: pnls.map(p => p >= 0 ? '#00ff88' : '#ff4757'),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0e27',
          titleColor: '#e4e4e7',
          bodyColor: '#e4e4e7',
          borderColor: '#00ff88',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(161, 161, 170, 0.2)' },
          ticks: { color: '#e4e4e7' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e4e4e7' }
        }
      }
    }
  });
}

/**
 * Render performance by setup chart
 */
function renderSetupChart(data) {
  const ctx = document.getElementById('setup-chart');
  if (!ctx || !data.by_setup) return;
  
  const setups = Object.keys(data.by_setup);
  const pnls = setups.map(s => data.by_setup[s].total_pnl);
  
  if (setupChart) setupChart.destroy();
  
  setupChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: setups,
      datasets: [{
        label: 'Total P&L ($)',
        data: pnls,
        backgroundColor: pnls.map(p => p >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)'),
        borderColor: pnls.map(p => p >= 0 ? '#00ff88' : '#ff4757'),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0e27',
          titleColor: '#e4e4e7',
          bodyColor: '#e4e4e7',
          borderColor: '#00ff88',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(161, 161, 170, 0.2)' },
          ticks: { color: '#e4e4e7' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e4e4e7' }
        }
      }
    }
  });
}

/**
 * Render win rate chart
 */
function renderWinRateChart(data) {
  const ctx = document.getElementById('winrate-chart');
  if (!ctx || !data.by_strategy) return;
  
  const strategies = Object.keys(data.by_strategy);
  const winRates = strategies.map(s => data.by_strategy[s].win_rate);
  
  if (winrateChart) winrateChart.destroy();
  
  winrateChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: strategies,
      datasets: [{
        label: 'Win Rate (%)',
        data: winRates,
        backgroundColor: 'rgba(255, 215, 0, 0.8)',
        borderColor: '#ffd700',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0e27',
          titleColor: '#e4e4e7',
          bodyColor: '#e4e4e7',
          borderColor: '#ffd700',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(161, 161, 170, 0.2)' },
          ticks: { 
            color: '#e4e4e7',
            callback: value => value + '%'
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e4e4e7' }
        }
      }
    }
  });
}

/**
 * Render drawdown chart
 */
function renderDrawdownChart(data) {
  const ctx = document.getElementById('drawdown-chart');
  if (!ctx || !data.drawdown_series) return;
  
  if (drawdownChart) drawdownChart.destroy();
  
  drawdownChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.drawdown_series.labels,
      datasets: [{
        label: 'Drawdown ($)',
        data: data.drawdown_series.values,
        borderColor: '#ff4757',
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#ff4757'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0e27',
          titleColor: '#e4e4e7',
          bodyColor: '#e4e4e7',
          borderColor: '#ff4757',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(161, 161, 170, 0.2)' },
          ticks: { 
            color: '#e4e4e7',
            callback: value => '$' + value.toFixed(0)
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#e4e4e7' }
        }
      }
    }
  });
}

/**
 * Render strategy breakdown table
 */
function renderStrategyTable(data) {
  if (!data.by_strategy) return;
  
  const rows = Object.keys(data.by_strategy).map(strategy => {
    const stats = data.by_strategy[strategy];
    return `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem;"><strong>${strategy}</strong></td>
        <td style="padding: 0.75rem; text-align: right;">${stats.total_trades}</td>
        <td style="padding: 0.75rem; text-align: right;">${stats.win_rate.toFixed(1)}%</td>
        <td style="padding: 0.75rem; text-align: right; color: ${stats.avg_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          $${stats.avg_pnl.toFixed(2)}
        </td>
        <td style="padding: 0.75rem; text-align: right; color: ${stats.total_pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'};">
          $${stats.total_pnl.toFixed(2)}
        </td>
        <td style="padding: 0.75rem; text-align: right; color: var(--accent-yellow);">
          $${stats.expectancy.toFixed(2)}
        </td>
      </tr>
    `;
  }).join('');
  
  strategyTableBody.innerHTML = rows;
}

/**
 * Get mock analytics data (fallback when analytics-data.json is not available)
 */
function getMockAnalyticsData() {
  return {
    expectancy: 25.50,
    profit_factor: 1.85,
    max_win_streak: 5,
    max_loss_streak: 3,
    max_drawdown: -425.00,
    kelly_criterion: 12.5,
    by_strategy: {
      'Breakout': {
        total_trades: 15,
        win_rate: 66.7,
        avg_pnl: 45.50,
        total_pnl: 682.50,
        expectancy: 45.50
      },
      'Reversal': {
        total_trades: 8,
        win_rate: 50.0,
        avg_pnl: 15.25,
        total_pnl: 122.00,
        expectancy: 15.25
      },
      'VWAP Hold': {
        total_trades: 12,
        win_rate: 75.0,
        avg_pnl: 32.10,
        total_pnl: 385.20,
        expectancy: 32.10
      }
    },
    by_setup: {
      'Morning Gap': {
        total_trades: 10,
        win_rate: 70.0,
        avg_pnl: 38.75,
        total_pnl: 387.50,
        expectancy: 38.75
      },
      'Afternoon Fade': {
        total_trades: 8,
        win_rate: 62.5,
        avg_pnl: 28.50,
        total_pnl: 228.00,
        expectancy: 28.50
      }
    },
    drawdown_series: {
      labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
      values: [0, -50, -120, -200, -150, -75, 0]
    }
  };
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  initAnalytics();
}
