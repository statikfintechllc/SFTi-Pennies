/**
 * Charts JavaScript - Main Homepage Charts
 * Handles all chart types: equity curve, trade distribution, performance by day, ticker performance
 */

// Use utilities from global SFTiUtils and SFTiChartConfig
const basePath = SFTiUtils.getBasePath();

// Chart instances
let equityCurveChart = null;
let tradeDistributionChart = null;
let performanceByDayChart = null;
let tickerPerformanceChart = null;

// Chart selector
const chartSelector = document.getElementById('chart-selector');

// Chart options are now imported from chartConfig.js

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
      options: SFTiChartConfig.getCommonChartOptions()
    });
  } catch (error) {
    console.log('Equity curve data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No equity curve data available yet. Add trades to see your equity curve.');
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
    SFTiChartConfig.renderEmptyChart(ctx, 'No trade distribution data available yet. Add trades to see your distribution.');
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
      options: SFTiChartConfig.getBarChartOptions()
    });
  } catch (error) {
    console.log('Performance by day data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No performance by day data available yet. Add trades to see daily performance.');
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
        ...SFTiChartConfig.getBarChartOptions(),
        indexAxis: 'y'  // Horizontal bar chart for better ticker label display
      }
    });
  } catch (error) {
    console.log('Ticker performance data not yet available:', error);
    SFTiChartConfig.renderEmptyChart(ctx, 'No ticker performance data available yet. Add trades to see performance by ticker.');
  }
}

// renderEmptyChart is now imported from chartConfig.js

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
SFTiUtils.onDOMReady(initCharts);
