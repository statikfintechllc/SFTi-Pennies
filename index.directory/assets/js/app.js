/**
 * SFTi-Pennies Trading Journal - Main Application
 * Handles trade form calculations, submission, and homepage interactions
 */

class TradingJournal {
  constructor() {
    this.auth = new GitHubAuth();
    this.uploadedImages = [];
    // Get base path from URL to make code portable
    this.basePath = this.getBasePath();
    this.initializeApp();
  }
  
  /**
   * Get base path for the application
   * Works with GitHub Pages and custom domains
   * @returns {string} - Base path (e.g., '/SFTi-Pennies' or '')
   */
  getBasePath() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    // For GitHub Pages URLs (username.github.io/repo-name)
    if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
      return '/' + pathSegments[0];
    }
    // For custom domains or root deployments
    return '';
  }
  
  /**
   * Calculate year and week number from date (ISO week)
   * @param {Date} date - Date object
   * @returns {string} - Year and week in format "YYYY.WW"
   */
  getYearWeekNumber(date) {
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
  
  /**
   * Get trade count for a specific date
   * @param {string} dateStr - Date in MM:DD:YYYY format
   * @returns {Promise<number>} - Next trade number for that date
   */
  async getTradeCountForDate(dateStr) {
    // For now, we'll extract from the trade_number field
    // In future, this could query existing trades for the date
    const tradeNumber = document.getElementById('trade_number')?.value || '1';
    return tradeNumber;
  }
  
  /**
   * Format date as MM:DD:YYYY
   * @param {string} dateStr - Date in YYYY-MM-DD format
   * @returns {string} - Date in MM:DD:YYYY format
   */
  formatDateForFilename(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${month}:${day}:${year}`;
  }
  
  /**
   * Initialize the application
   */
  initializeApp() {
    // Set up navigation
    this.setupNavigation();
    
    // Load trades on homepage
    if (document.getElementById('recent-trades')) {
      this.loadRecentTrades();
    }
    
    // Set up trade form if on add-trade page
    if (document.getElementById('trade-form')) {
      this.setupTradeForm();
    }
    
    // Set up auth UI
    this.setupAuthUI();
  }
  
  /**
   * Set up responsive navigation
   */
  setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
      navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
      
      // Handle submenu toggles on mobile
      document.querySelectorAll('.nav-item.has-submenu').forEach(item => {
        item.addEventListener('click', (e) => {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            item.classList.toggle('active');
          }
        });
      });
    }
  }
  
  /**
   * Set up authentication UI elements
   */
  setupAuthUI() {
    const authButton = document.getElementById('auth-button');
    if (authButton) {
      if (this.auth.isAuthenticated()) {
        authButton.textContent = 'Logout';
        authButton.addEventListener('click', () => {
          this.auth.clearAuth();
          window.location.reload();
        });
      } else {
        authButton.textContent = 'Login';
        authButton.addEventListener('click', () => {
          showAuthPrompt();
        });
      }
    }
  }
  
  /**
   * Load and display recent trades
   */
  async loadRecentTrades() {
    const container = document.getElementById('recent-trades');
    if (!container) return;
    
    try {
      // Try to fetch trades index using dynamic base path
      const response = await fetch(`${this.basePath}/index.directory/trades-index.json`);
      if (!response.ok) {
        throw new Error('Trades index not found');
      }
      
      const data = await response.json();
      const trades = data.trades || [];
      
      // Sort by date and get 3 most recent
      const recentTrades = trades
        .sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date))
        .slice(0, 3);
      
      // Display trades
      container.innerHTML = recentTrades.map((trade, index) => 
        this.createTradeCard(trade, index)
      ).join('');
      
      // Update stats
      this.updateStats(data.statistics || {});
      
    } catch (error) {
      console.warn('Could not load trades:', error);
      container.innerHTML = `
        <div class="alert alert-warning">
          <p>No trades found yet. <a href="index.directory/add-trade.html">Add your first trade!</a></p>
        </div>
      `;
    }
  }
  
  /**
   * Create HTML for a trade card
   * @param {Object} trade - Trade data
   * @param {number} index - Card index for animation delay
   * @returns {string} HTML string
   */
  createTradeCard(trade, index = 0) {
    const pnl = parseFloat(trade.pnl_usd || 0);
    const pnlPercent = parseFloat(trade.pnl_percent || 0);
    const pnlClass = pnl >= 0 ? 'profit' : 'loss';
    const pnlSign = pnl >= 0 ? '+' : '';
    
    return `
      <div class="trade-card" style="animation-delay: ${index * 0.1}s">
        <div class="trade-header">
          <div class="trade-ticker">${trade.ticker}</div>
          <div class="trade-number">#${trade.trade_number}</div>
        </div>
        
        <div class="trade-details">
          <div class="trade-detail">
            <div class="trade-detail-label">Direction</div>
            <div class="trade-detail-value">${trade.direction}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Position</div>
            <div class="trade-detail-value">${trade.position_size} shares</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Entry</div>
            <div class="trade-detail-value">$${parseFloat(trade.entry_price).toFixed(2)}</div>
          </div>
          <div class="trade-detail">
            <div class="trade-detail-label">Exit</div>
            <div class="trade-detail-value">$${parseFloat(trade.exit_price).toFixed(2)}</div>
          </div>
        </div>
        
        <div class="trade-pnl ${pnlClass}">
          ${pnlSign}$${Math.abs(pnl).toFixed(2)} (${pnlSign}${pnlPercent.toFixed(2)}%)
        </div>
        
        <div class="trade-footer">
          <div class="trade-date">${new Date(trade.entry_date).toLocaleDateString()}</div>
          <div class="trade-strategy">${trade.strategy || 'N/A'}</div>
        </div>
      </div>
    `;
  }
  
  /**
   * Update stats display
   * @param {Object} stats - Statistics object from trades index
   */
  updateStats(stats) {
    if (!stats || Object.keys(stats).length === 0) return;
    
    // Update DOM
    const statElements = {
      'stat-total-trades': stats.total_trades || 0,
      'stat-win-rate': `${stats.win_rate || 0}%`,
      'stat-total-pnl': `$${(stats.total_pnl || 0).toFixed(2)}`,
      'stat-avg-pnl': `$${(stats.avg_pnl || 0).toFixed(2)}`
    };
    
    Object.entries(statElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
        // Add positive/negative class for P&L
        if (id.includes('pnl')) {
          const totalPnL = stats.total_pnl || 0;
          element.classList.add(totalPnL >= 0 ? 'positive' : 'negative');
        }
      }
    });
  }
  
  /**
   * Set up trade form with auto-calculations
   */
  setupTradeForm() {
    const form = document.getElementById('trade-form');
    if (!form) return;
    
    // Auto-calculate fields
    const entryPrice = document.getElementById('entry_price');
    const exitPrice = document.getElementById('exit_price');
    const positionSize = document.getElementById('position_size');
    const direction = document.getElementById('direction');
    
    const calculateFields = [entryPrice, exitPrice, positionSize, direction];
    
    calculateFields.forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.calculateTradeMetrics());
      }
    });
    
    // Entry/Exit date and time for time-in-trade calculation
    const entryDate = document.getElementById('entry_date');
    const entryTime = document.getElementById('entry_time');
    const exitDate = document.getElementById('exit_date');
    const exitTime = document.getElementById('exit_time');
    
    const timeFields = [entryDate, entryTime, exitDate, exitTime];
    timeFields.forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.calculateTimeInTrade());
      }
    });
    
    // Stop loss and target for R:R calculation
    const stopLoss = document.getElementById('stop_loss');
    const targetPrice = document.getElementById('target_price');
    
    [stopLoss, targetPrice, entryPrice].forEach(field => {
      if (field) {
        field.addEventListener('input', () => this.calculateRiskReward());
      }
    });
    
    // File upload
    const fileInput = document.getElementById('screenshots');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }
    
    // Form submission
    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  }
  
  /**
   * Calculate trade P&L and percentage
   */
  calculateTradeMetrics() {
    const entryPrice = parseFloat(document.getElementById('entry_price')?.value) || 0;
    const exitPrice = parseFloat(document.getElementById('exit_price')?.value) || 0;
    const positionSize = parseInt(document.getElementById('position_size')?.value) || 0;
    const direction = document.getElementById('direction')?.value;
    
    if (!entryPrice || !exitPrice || !positionSize || !direction) return;
    
    let pnlUSD, pnlPercent;
    
    if (direction === 'LONG') {
      pnlUSD = (exitPrice - entryPrice) * positionSize;
      pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
    } else { // SHORT
      pnlUSD = (entryPrice - exitPrice) * positionSize;
      pnlPercent = ((entryPrice - exitPrice) / entryPrice) * 100;
    }
    
    // Display results
    const pnlUSDEl = document.getElementById('calc-pnl-usd');
    const pnlPercentEl = document.getElementById('calc-pnl-percent');
    
    if (pnlUSDEl) {
      pnlUSDEl.textContent = `$${pnlUSD.toFixed(2)}`;
      pnlUSDEl.className = pnlUSD >= 0 ? 'positive' : 'negative';
    }
    
    if (pnlPercentEl) {
      pnlPercentEl.textContent = `${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%`;
      pnlPercentEl.className = pnlPercent >= 0 ? 'positive' : 'negative';
    }
  }
  
  /**
   * Calculate time in trade
   */
  calculateTimeInTrade() {
    const entryDate = document.getElementById('entry_date')?.value;
    const entryTime = document.getElementById('entry_time')?.value;
    const exitDate = document.getElementById('exit_date')?.value;
    const exitTime = document.getElementById('exit_time')?.value;
    
    if (!entryDate || !entryTime || !exitDate || !exitTime) return;
    
    const entryDateTime = new Date(`${entryDate}T${entryTime}`);
    const exitDateTime = new Date(`${exitDate}T${exitTime}`);
    
    const diffMs = exitDateTime - entryDateTime;
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    const timeInTradeEl = document.getElementById('calc-time-in-trade');
    if (timeInTradeEl) {
      timeInTradeEl.textContent = `${hours}h ${minutes}m`;
    }
  }
  
  /**
   * Calculate risk-reward ratio
   */
  calculateRiskReward() {
    const entryPrice = parseFloat(document.getElementById('entry_price')?.value) || 0;
    const stopLoss = parseFloat(document.getElementById('stop_loss')?.value) || 0;
    const targetPrice = parseFloat(document.getElementById('target_price')?.value) || 0;
    
    if (!entryPrice || !stopLoss || !targetPrice) return;
    
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(targetPrice - entryPrice);
    const ratio = risk > 0 ? (reward / risk).toFixed(2) : 0;
    
    const rrEl = document.getElementById('calc-risk-reward');
    if (rrEl) {
      rrEl.textContent = `1:${ratio}`;
    }
  }
  
  /**
   * Handle file upload for screenshots
   */
  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    const preview = document.getElementById('file-preview');
    
    if (!preview) return;
    
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedImages.push({
          name: file.name,
          data: e.target.result,
          base64: e.target.result.split(',')[1]
        });
        
        // Add preview
        const previewItem = document.createElement('div');
        previewItem.className = 'file-preview-item';
        previewItem.innerHTML = `
          <img src="${e.target.result}" alt="${file.name}" class="file-preview-image">
          <button type="button" class="file-preview-remove" data-name="${file.name}">×</button>
        `;
        
        previewItem.querySelector('.file-preview-remove').addEventListener('click', () => {
          this.uploadedImages = this.uploadedImages.filter(img => img.name !== file.name);
          previewItem.remove();
        });
        
        preview.appendChild(previewItem);
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    // Check authentication
    if (!this.auth.isAuthenticated()) {
      showAuthPrompt();
      return;
    }
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Submitting...';
    
    try {
      // Gather form data
      const formData = this.getFormData();
      
      // Calculate year-week number and format date
      const entryDate = new Date(formData.entry_date);
      const yearWeek = this.getYearWeekNumber(entryDate);
      const dateFormatted = this.formatDateForFilename(formData.entry_date);
      const tradeNum = formData.trade_number;
      
      // Generate file paths using new structure: index.directory/SFTi.Tradez/week.YYYY.WW/{MM:DD:YYYY.N}.md
      const weekFolder = `week.${yearWeek}`;
      const filename = `${dateFormatted}.${tradeNum}.md`;
      const tradePath = `index.directory/SFTi.Tradez/${weekFolder}/${filename}`;
      
      // Generate markdown content
      const markdown = this.generateTradeMarkdown(formData);
      
      // Upload images first to: index.directory/assets/sfti.tradez.assets/week.YYYY.WW/{MM:DD:YYYY.N}/
      if (this.uploadedImages.length > 0) {
        await this.uploadImages(weekFolder, dateFormatted, tradeNum);
      }
      
      // Upload trade markdown
      await this.auth.uploadFile(
        tradePath,
        btoa(unescape(encodeURIComponent(markdown))),
        `auto: new trade added ${dateFormatted}/${formData.ticker}`
      );
      
      // Show success message
      alert(`Trade #${tradeNum} submitted successfully!\nFile: ${tradePath}`);
      
      // Reset form
      event.target.reset();
      this.uploadedImages = [];
      document.getElementById('file-preview').innerHTML = '';
      
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Failed to submit trade: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
  
  /**
   * Get form data as object
   * @returns {Object}
   */
  getFormData() {
    const form = document.getElementById('trade-form');
    const data = {};
    
    const fields = [
      'trade_number', 'ticker', 'entry_date', 'entry_time',
      'exit_date', 'exit_time', 'entry_price', 'exit_price',
      'position_size', 'direction', 'strategy', 'stop_loss',
      'target_price', 'broker', 'notes'
    ];
    
    fields.forEach(field => {
      const element = form.querySelector(`#${field}`);
      if (element) {
        data[field] = element.value;
      }
    });
    
    // Add calculated values
    const entryPrice = parseFloat(data.entry_price);
    const exitPrice = parseFloat(data.exit_price);
    const positionSize = parseInt(data.position_size);
    const direction = data.direction;
    
    if (direction === 'LONG') {
      data.pnl_usd = ((exitPrice - entryPrice) * positionSize).toFixed(2);
      data.pnl_percent = (((exitPrice - entryPrice) / entryPrice) * 100).toFixed(2);
    } else {
      data.pnl_usd = ((entryPrice - exitPrice) * positionSize).toFixed(2);
      data.pnl_percent = (((entryPrice - exitPrice) / entryPrice) * 100).toFixed(2);
    }
    
    // Risk-reward ratio
    const risk = Math.abs(entryPrice - parseFloat(data.stop_loss));
    const reward = Math.abs(parseFloat(data.target_price) - entryPrice);
    data.risk_reward_ratio = risk > 0 ? (reward / risk).toFixed(2) : '0';
    
    return data;
  }
  
  /**
   * Generate markdown content for trade
   * @param {Object} data - Form data
   * @returns {string}
   */
  generateTradeMarkdown(data) {
    // Calculate paths for images
    const entryDate = new Date(data.entry_date);
    const yearWeek = this.getYearWeekNumber(entryDate);
    const weekFolder = `week.${yearWeek}`;
    const dateFormatted = this.formatDateForFilename(data.entry_date);
    
    const screenshots = this.uploadedImages.map(img => 
      `  - ${this.basePath}/index.directory/assets/sfti.tradez.assets/${weekFolder}/${dateFormatted}.${data.trade_number}/${img.name}`
    ).join('\n');
    
    return `---
trade_number: ${data.trade_number}
ticker: ${data.ticker}
entry_date: ${data.entry_date}
entry_time: ${data.entry_time}
exit_date: ${data.exit_date}
exit_time: ${data.exit_time}
entry_price: ${data.entry_price}
exit_price: ${data.exit_price}
position_size: ${data.position_size}
direction: ${data.direction}
strategy: ${data.strategy}
stop_loss: ${data.stop_loss}
target_price: ${data.target_price}
risk_reward_ratio: ${data.risk_reward_ratio}
broker: ${data.broker}
pnl_usd: ${data.pnl_usd}
pnl_percent: ${data.pnl_percent}
screenshots:
${screenshots || '  - None'}
---

# Trade #${data.trade_number} - ${data.ticker}

## Trade Details

- **Ticker**: ${data.ticker}
- **Direction**: ${data.direction}
- **Entry**: $${data.entry_price} on ${data.entry_date} at ${data.entry_time}
- **Exit**: $${data.exit_price} on ${data.exit_date} at ${data.exit_time}
- **Position Size**: ${data.position_size} shares
- **Strategy**: ${data.strategy}
- **Broker**: ${data.broker}

## Risk Management

- **Stop Loss**: $${data.stop_loss}
- **Target Price**: $${data.target_price}
- **Risk:Reward Ratio**: 1:${data.risk_reward_ratio}

## Results

- **P&L (USD)**: $${data.pnl_usd}
- **P&L (%)**: ${data.pnl_percent}%

## Notes

${data.notes || 'No additional notes.'}

## Screenshots

${this.uploadedImages.length > 0 ? this.uploadedImages.map(img => 
  `![${img.name}](assets/sfti.tradez.assets/${weekFolder}/${dateFormatted}.${data.trade_number}/${img.name})`
).join('\n\n') : 'No screenshots uploaded.'}
`;
  }
  
  /**
   * Upload images to assets/sfti.tradez.assets/
   * @param {string} weekFolder - Week folder name (e.g., "week.2025.42")
   * @param {string} dateFormatted - Date in MM:DD:YYYY format
   * @param {string} tradeNum - Trade number
   */
  async uploadImages(weekFolder, dateFormatted, tradeNum) {
    const basePath = `index.directory/assets/sfti.tradez.assets/${weekFolder}/${dateFormatted}.${tradeNum}`;
    
    for (const image of this.uploadedImages) {
      const imagePath = `${basePath}/${image.name}`;
      await this.auth.uploadFile(
        imagePath,
        image.base64,
        `auto: add screenshot for ${dateFormatted}.${tradeNum}`
      );
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.tradingJournal = new TradingJournal();
});
