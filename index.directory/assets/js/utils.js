/**
 * Shared Utilities Module
 * Common functions used across multiple files
 * Exposed globally via window.SFTiUtils
 */

(function() {
  'use strict';

  /**
   * Get base path for the application
   * Works with GitHub Pages and custom domains
   * @returns {string} - Base path (e.g., '/SFTi-Pennies' or '')
   */
  function getBasePath() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    // For GitHub Pages URLs (username.github.io/repo-name)
    if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
      return '/' + pathSegments[0];
    }
    // For custom domains or root deployments
    return '';
  }

  /**
   * Format file size in human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Get broker display name from broker code
   * @param {string} broker - Broker code (e.g., 'ibkr', 'schwab')
   * @returns {string} Full broker name
   */
  function getBrokerName(broker) {
    const names = {
      'ibkr': 'Interactive Brokers (IBKR)',
      'schwab': 'Charles Schwab / TD Ameritrade',
      'robinhood': 'Robinhood',
      'webull': 'Webull'
    };
    return names[broker] || broker;
  }

  /**
   * Get color for P&L value (green for positive, red for negative)
   * @param {number} value - P&L value
   * @returns {object} Object with bg and border colors
   */
  function getPnLColors(value) {
    return {
      bg: value >= 0 ? 'rgba(0, 255, 136, 0.8)' : 'rgba(255, 71, 87, 0.8)',
      border: value >= 0 ? '#00ff88' : '#ff4757',
      text: value >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
    };
  }

  /**
   * Initialize function when DOM is ready
   * @param {Function} callback - Function to call when DOM is ready
   */
  function onDOMReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  /**
   * Format date as MM:DD:YYYY
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @returns {string} - Date in MM:DD:YYYY format
   */
  function formatDateForFilename(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${month}:${day}:${year}`;
  }

  /**
   * Calculate year and week number from date (ISO week)
   * @param {Date} date - Date object
   * @returns {string} - Year and week in format "YYYY.WW"
   */
  function getYearWeekNumber(date) {
    const target = new Date(date.valueOf());
    const dayNumber = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNumber + 3);
    const thursdayOfTargetWeek = new Date(target.valueOf());
    const year = thursdayOfTargetWeek.getFullYear();
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
      target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target) / 604800000);
    return `${year}.${String(weekNumber).padStart(2, '0')}`;
  }

  // Expose utilities globally
  window.SFTiUtils = {
    getBasePath,
    formatFileSize,
    getBrokerName,
    getPnLColors,
    onDOMReady,
    formatDateForFilename,
    getYearWeekNumber
  };
})();

