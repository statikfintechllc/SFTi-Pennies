/**
 * Charts JavaScript - Main Homepage Charts
 * Handles all chart types: equity curve, trade distribution, performance by day, ticker performance
 */

// Get base path dynamically to support different deployments
const getBasePath = () => {
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
    return '/' + pathSegments[0];
  }
  return '';
};

const basePath = getBasePath();

// Chart instances
let equityCurveChart = null;
let tradeDistributionChart = null;
let performanceByDayChart = null;
let tickerPerformanceChart = null;

// Chart selector
const chartSelector = document.getElementById('chart-selector');

/**
 * Common chart options for consistent styling
 */
function getCommonChartOptions() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: '#0a0e27',
        titleColor: '#e4e4e7',
        bodyColor: '#e4e4e7',
        borderColor: '#00ff88',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(161, 161, 170, 0.2)'
        },
        ticks: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono'
          },
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      },
      x: {
        grid: {
          color: 'rgba(161, 161, 170, 0.2)'
        },
        ticks: {
          color: '#e4e4e7',
          font: {
            family: 'JetBrains Mono'
          }
        }
      }
    }
  };
}

/**
 * Load and render equity curve chart
 */
async function loadEquityCurveChart() {
  const ctx = document.getElementById('equity-curve-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/equity-curve-data.json`);
    const data = await response.json();
    
    if (equityCurveChart) {
      equityCurveChart.destroy();
    }

    equityCurveChart = new Chart(ctx, {
      type: 'line',
      data: data,
      options: getCommonChartOptions()
    });
  } catch (error) {
    console.log('Equity curve data not yet available:', error);
    renderEmptyChart(ctx, 'No equity curve data available yet. Add trades to see your equity curve.');
  }
}

/**
 * Load and render trade distribution chart
 */
async function loadTradeDistributionChart() {
  const ctx = document.getElementById('trade-distribution-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/trade-distribution-data.json`);
    const data = await response.json();
    
    if (tradeDistributionChart) {
      tradeDistributionChart.destroy();
    }

    tradeDistributionChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...getCommonChartOptions(),
        plugins: {
          ...getCommonChartOptions().plugins,
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.log('Trade distribution data not yet available:', error);
    renderEmptyChart(ctx, 'No trade distribution data available yet. Add trades to see your distribution.');
  }
}

/**
 * Load and render performance by day chart
 */
async function loadPerformanceByDayChart() {
  const ctx = document.getElementById('performance-by-day-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/performance-by-day-data.json`);
    const data = await response.json();
    
    if (performanceByDayChart) {
      performanceByDayChart.destroy();
    }

    performanceByDayChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...getCommonChartOptions(),
        plugins: {
          ...getCommonChartOptions().plugins,
          legend: {
            display: false
          }
        }
      }
    });
  } catch (error) {
    console.log('Performance by day data not yet available:', error);
    renderEmptyChart(ctx, 'No performance by day data available yet. Add trades to see daily performance.');
  }
}

/**
 * Load and render ticker performance chart
 */
async function loadTickerPerformanceChart() {
  const ctx = document.getElementById('ticker-performance-chart');
  if (!ctx) return;

  try {
    const response = await fetch(`${basePath}/index.directory/assets/charts/ticker-performance-data.json`);
    const data = await response.json();
    
    if (tickerPerformanceChart) {
      tickerPerformanceChart.destroy();
    }

    tickerPerformanceChart = new Chart(ctx, {
      type: 'bar',
      data: data,
      options: {
        ...getCommonChartOptions(),
        plugins: {
          ...getCommonChartOptions().plugins,
          legend: {
            display: false
          }
        },
        indexAxis: 'y'  // Horizontal bar chart for better ticker label display
      }
    });
  } catch (error) {
    console.log('Ticker performance data not yet available:', error);
    renderEmptyChart(ctx, 'No ticker performance data available yet. Add trades to see performance by ticker.');
  }
}

/**
 * Render an empty chart with a message
 */
function renderEmptyChart(ctx, message) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [{
        label: 'No Data',
        data: [],
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)'
      }]
    },
    options: {
      ...getCommonChartOptions(),
      plugins: {
        ...getCommonChartOptions().plugins,
        title: {
          display: true,
          text: message,
          color: '#a1a1aa',
          font: {
            family: 'Inter',
            size: 14
          }
        }
      }
    }
  });
}

/**
 * Switch between chart views
 */
function switchChart(chartType) {
  // Hide all chart containers
  document.querySelectorAll('.chart-container').forEach(container => {
    container.style.display = 'none';
  });

  // Show selected chart container
  const selectedContainer = document.getElementById(`${chartType}-container`);
  if (selectedContainer) {
    selectedContainer.style.display = 'block';
  }

  // Load the selected chart if not already loaded
  switch(chartType) {
    case 'equity-curve':
      if (!equityCurveChart) loadEquityCurveChart();
      break;
    case 'trade-distribution':
      if (!tradeDistributionChart) loadTradeDistributionChart();
      break;
    case 'performance-by-day':
      if (!performanceByDayChart) loadPerformanceByDayChart();
      break;
    case 'ticker-performance':
      if (!tickerPerformanceChart) loadTickerPerformanceChart();
      break;
  }
}

/**
 * Initialize charts on page load
 */
function initCharts() {
  // Load equity curve by default
  loadEquityCurveChart();

  // Set up chart selector event listener
  if (chartSelector) {
    chartSelector.addEventListener('change', (e) => {
      switchChart(e.target.value);
    });
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCharts);
} else {
  initCharts();
}
