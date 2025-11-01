/**
 * Shared Chart Configuration Module
 * Common Chart.js configuration options used across multiple charts
 * Exposed globally via window.SFTiChartConfig
 */

(function() {
  'use strict';

  /**
   * Get common chart options for consistent styling
   * @returns {object} Chart.js options object
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
        tooltip: getCommonTooltipConfig()
      },
      scales: getCommonScaleConfig()
    };
  }

  /**
   * Get common tooltip configuration
   * @returns {object} Tooltip configuration
   */
  function getCommonTooltipConfig() {
    return {
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
    };
  }

  /**
   * Get common scale configuration
   * @returns {object} Scale configuration for x and y axes
   */
  function getCommonScaleConfig() {
    return {
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
    };
  }

  /**
   * Get bar chart options with custom tooltip color
   * @param {string} tooltipBorderColor - Border color for tooltip
   * @param {boolean} hideXGrid - Whether to hide X axis grid (default: true)
   * @returns {object} Chart.js options for bar charts
   */
  function getBarChartOptions(tooltipBorderColor, hideXGrid) {
    tooltipBorderColor = tooltipBorderColor || '#00ff88';
    hideXGrid = hideXGrid !== undefined ? hideXGrid : true;
    
    const options = getCommonChartOptions();
    
    // Update tooltip border color
    options.plugins.tooltip.borderColor = tooltipBorderColor;
    
    // Hide legend for bar charts
    options.plugins.legend.display = false;
    
    // Optionally hide X grid
    if (hideXGrid) {
      options.scales.x.grid.display = false;
    }
    
    return options;
  }

  /**
   * Get line chart options
   * @param {string} tooltipBorderColor - Border color for tooltip
   * @returns {object} Chart.js options for line charts
   */
  function getLineChartOptions(tooltipBorderColor) {
    tooltipBorderColor = tooltipBorderColor || '#00ff88';
    const options = getCommonChartOptions();
    options.plugins.tooltip.borderColor = tooltipBorderColor;
    return options;
  }

  /**
   * Render an empty chart with a message
   * @param {HTMLCanvasElement} ctx - Canvas context
   * @param {string} message - Message to display
   * @returns {Chart} Chart.js instance
   */
  function renderEmptyChart(ctx, message) {
    const commonOptions = getCommonChartOptions();
    return new Chart(ctx, {
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
        responsive: commonOptions.responsive,
        maintainAspectRatio: commonOptions.maintainAspectRatio,
        plugins: {
          legend: commonOptions.plugins.legend,
          tooltip: commonOptions.plugins.tooltip,
          title: {
            display: true,
            text: message,
            color: '#a1a1aa',
            font: {
              family: 'Inter',
              size: 14
            }
          }
        },
        scales: commonOptions.scales
      }
    });
  }

  // Expose chart config globally
  window.SFTiChartConfig = {
    getCommonChartOptions,
    getCommonTooltipConfig,
    getCommonScaleConfig,
    getBarChartOptions,
    getLineChartOptions,
    renderEmptyChart
  };
})();

