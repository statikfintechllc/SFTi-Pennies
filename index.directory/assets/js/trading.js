/**
 * Trading Interface JavaScript for SFTi-Pennies
 * Handles IBKR authentication, market scanning, charting, and portfolio display
 */

class TradingInterface {
  constructor() {
    this.isAuthenticated = false;
    this.ibkrToken = null;
    this.apiBaseUrl = 'https://localhost:5000/v1/api'; // IBKR Client Portal Gateway
    this.currentSymbol = 'AAPL';
    this.tradingViewWidget = null;
    
    this.init();
  }
  
  init() {
    console.log('Trading Interface initialized');
    
    // Check for existing session
    this.checkExistingSession();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check for OAuth callback
    this.handleOAuthCallback();
  }
  
  setupEventListeners() {
    // Authentication
    const connectBtn = document.getElementById('connect-ibkr-btn');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    
    if (connectBtn) {
      connectBtn.addEventListener('click', () => this.initiateIBKRAuth());
    }
    
    if (authToggleBtn) {
      authToggleBtn.addEventListener('click', () => {
        if (this.isAuthenticated) {
          this.disconnect();
        } else {
          this.initiateIBKRAuth();
        }
      });
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.trading-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabName = tab.dataset.tab;
        this.switchTab(tabName);
      });
    });
    
    // Scanning
    const runScanBtn = document.getElementById('run-scan-btn');
    if (runScanBtn) {
      runScanBtn.addEventListener('click', () => this.runMarketScan());
    }
    
    // Charting
    const loadChartBtn = document.getElementById('load-chart-btn');
    const chartSymbolInput = document.getElementById('chart-symbol');
    
    if (loadChartBtn) {
      loadChartBtn.addEventListener('click', () => {
        const symbol = chartSymbolInput.value.trim().toUpperCase();
        if (symbol) {
          this.currentSymbol = symbol;
          this.loadChart(symbol);
        }
      });
    }
    
    if (chartSymbolInput) {
      chartSymbolInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const symbol = chartSymbolInput.value.trim().toUpperCase();
          if (symbol) {
            this.currentSymbol = symbol;
            this.loadChart(symbol);
          }
        }
      });
    }
    
    // Criteria toggle for collapsible scanner
    const criteriaToggle = document.getElementById('criteria-toggle');
    const criteriaSection = document.getElementById('screening-criteria');
    const criteriaIcon = document.getElementById('criteria-icon');
    
    if (criteriaToggle && criteriaSection) {
      criteriaToggle.addEventListener('click', () => {
        criteriaSection.classList.toggle('open');
        if (criteriaIcon) {
          criteriaIcon.style.transform = criteriaSection.classList.contains('open') 
            ? 'rotate(0deg)' 
            : 'rotate(-90deg)';
        }
      });
    }
  }
  
  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.trading-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load data for the tab if authenticated
    if (this.isAuthenticated) {
      if (tabName === 'charting') {
        this.loadChart(this.currentSymbol);
      } else if (tabName === 'portfolio') {
        this.loadPortfolio();
      }
    }
  }
  
  checkExistingSession() {
    // Check if there's a stored session token
    const storedToken = localStorage.getItem('ibkr_token');
    const tokenExpiry = localStorage.getItem('ibkr_token_expiry');
    
    if (storedToken && tokenExpiry) {
      const now = Date.now();
      if (now < parseInt(tokenExpiry)) {
        this.ibkrToken = storedToken;
        this.isAuthenticated = true;
        this.showTradingInterface();
        this.updateConnectionStatus(true);
        console.log('Restored existing IBKR session');
      } else {
        // Token expired, clear it
        localStorage.removeItem('ibkr_token');
        localStorage.removeItem('ibkr_token_expiry');
      }
    }
  }
  
  handleOAuthCallback() {
    // Check URL parameters for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');
    
    if (error) {
      alert('Authentication failed: ' + error);
      return;
    }
    
    if (token) {
      // Store the token
      this.ibkrToken = token;
      this.isAuthenticated = true;
      
      // Store in localStorage with expiry (24 hours)
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('ibkr_token', token);
      localStorage.setItem('ibkr_token_expiry', expiry.toString());
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show trading interface
      this.showTradingInterface();
      this.updateConnectionStatus(true);
      
      console.log('IBKR authentication successful');
    }
  }
  
  initiateIBKRAuth() {
    // In a production environment, this would redirect to IBKR OAuth
    // For now, we'll simulate the authentication process
    
    alert('IBKR Authentication Flow:\n\n' +
          '1. This would normally redirect to IBKR login\n' +
          '2. After successful login, IBKR redirects back with a token\n' +
          '3. The token is stored and used for API calls\n\n' +
          'For demonstration, click OK to simulate successful authentication.');
    
    // Simulate successful authentication
    this.simulateAuthentication();
  }
  
  simulateAuthentication() {
    // Generate a fake token for demo purposes
    const fakeToken = 'demo_token_' + Math.random().toString(36).substr(2, 9);
    
    // Simulate OAuth redirect
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('token', fakeToken);
    
    // Update browser history and trigger callback handler
    window.history.pushState({}, '', currentUrl.toString());
    this.handleOAuthCallback();
  }
  
  disconnect() {
    if (confirm('Are you sure you want to disconnect from IBKR?')) {
      this.isAuthenticated = false;
      this.ibkrToken = null;
      
      localStorage.removeItem('ibkr_token');
      localStorage.removeItem('ibkr_token_expiry');
      
      this.showAuthSection();
      this.updateConnectionStatus(false);
      
      console.log('Disconnected from IBKR');
    }
  }
  
  showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('trading-interface').style.display = 'none';
  }
  
  showTradingInterface() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('trading-interface').style.display = 'block';
    
    // Load initial data
    this.loadChart(this.currentSymbol);
  }
  
  updateConnectionStatus(connected) {
    const statusBadge = document.getElementById('connection-status');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    
    if (connected) {
      statusBadge.className = 'status-badge connected';
      statusBadge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: currentColor;"></span> Connected';
      if (authToggleBtn) {
        authToggleBtn.textContent = 'Disconnect';
      }
    } else {
      statusBadge.className = 'status-badge disconnected';
      statusBadge.innerHTML = '<span style="width: 8px; height: 8px; border-radius: 50%; background: currentColor;"></span> Disconnected';
      if (authToggleBtn) {
        authToggleBtn.textContent = 'Connect IBKR';
      }
    }
  }
  
  async runMarketScan() {
    if (!this.isAuthenticated) {
      alert('Please connect to IBKR first');
      return;
    }
    
    const resultsDiv = document.getElementById('scan-results');
    resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner"></div><p style="margin-top: 1rem;">Running scan...</p></div>';
    
    // Get filter values
    const marketCap = document.getElementById('market-cap').value;
    const volume = document.getElementById('volume').value;
    const priceMin = document.getElementById('price-min').value;
    const priceMax = document.getElementById('price-max').value;
    const percentChange = document.getElementById('percent-change').value;
    const sector = document.getElementById('sector').value;
    const exchange = document.getElementById('exchange').value;
    
    // Simulate API call for demo
    setTimeout(() => {
      const demoResults = this.generateDemoScanResults();
      this.displayScanResults(demoResults);
    }, 1500);
    
    // In production, this would call the IBKR API:
    // const results = await this.fetchMarketScan({marketCap, volume, priceMin, priceMax, percentChange, sector, exchange});
  }
  
  generateDemoScanResults() {
    // Generate demo data for display
    const symbols = ['TSLA', 'AAPL', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    return symbols.map(symbol => ({
      symbol,
      price: (Math.random() * 500 + 50).toFixed(2),
      change: ((Math.random() - 0.5) * 10).toFixed(2),
      volume: (Math.random() * 10000000).toFixed(0),
      marketCap: (Math.random() * 1000).toFixed(2) + 'B'
    }));
  }
  
  displayScanResults(results) {
    const resultsDiv = document.getElementById('scan-results');
    
    if (results.length === 0) {
      resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No results found</div>';
      return;
    }
    
    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="background: rgba(15, 20, 41, 0.5); text-align: left;">';
    html += '<th style="padding: 1rem;">Symbol</th>';
    html += '<th style="padding: 1rem;">Price</th>';
    html += '<th style="padding: 1rem;">Change %</th>';
    html += '<th style="padding: 1rem;">Volume</th>';
    html += '<th style="padding: 1rem;">Market Cap</th>';
    html += '</tr></thead><tbody>';
    
    results.forEach(result => {
      const changeClass = parseFloat(result.change) >= 0 ? 'positive' : 'negative';
      html += '<tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.1);">';
      html += `<td style="padding: 1rem; font-weight: 600;">${result.symbol}</td>`;
      html += `<td style="padding: 1rem;">$${result.price}</td>`;
      html += `<td style="padding: 1rem;" class="${changeClass}">${result.change}%</td>`;
      html += `<td style="padding: 1rem;">${parseInt(result.volume).toLocaleString()}</td>`;
      html += `<td style="padding: 1rem;">$${result.marketCap}</td>`;
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    resultsDiv.innerHTML = html;
  }
  
  loadChart(symbol) {
    const chartContainer = document.getElementById('tradingview-chart');
    
    if (!chartContainer) return;
    
    // Clear existing chart
    chartContainer.innerHTML = '';
    
    // Check if TradingView library is loaded
    if (typeof TradingView === 'undefined') {
      chartContainer.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255, 255, 255, 0.6);">TradingView library not loaded</div>';
      return;
    }
    
    // Create TradingView widget
    this.tradingViewWidget = new TradingView.widget({
      autosize: true,
      symbol: symbol,
      interval: 'D',
      timezone: 'America/New_York',
      theme: 'dark',
      style: '1',
      locale: 'en',
      toolbar_bg: '#0f1429',
      enable_publishing: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: true,
      container_id: 'tradingview-chart',
      studies: [
        'MASimple@tv-basicstudies',
        'RSI@tv-basicstudies',
        'MACD@tv-basicstudies'
      ]
    });
    
    console.log('Loaded chart for', symbol);
  }
  
  async loadPortfolio() {
    if (!this.isAuthenticated) {
      return;
    }
    
    // Simulate loading portfolio data
    const demoPortfolio = {
      netLiquidation: 125430.50,
      cashBalance: 45230.25,
      buyingPower: 90461.00,
      dayPnL: 1234.50
    };
    
    const demoPositions = [
      { symbol: 'AAPL', quantity: 100, avgCost: 150.25, currentPrice: 175.50, pnl: 2525.00 },
      { symbol: 'TSLA', quantity: 50, avgCost: 220.00, currentPrice: 245.75, pnl: 1287.50 },
      { symbol: 'NVDA', quantity: 75, avgCost: 400.00, currentPrice: 485.25, pnl: 6393.75 }
    ];
    
    // Update account summary
    document.getElementById('net-liquidation').textContent = '$' + demoPortfolio.netLiquidation.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('cash-balance').textContent = '$' + demoPortfolio.cashBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('buying-power').textContent = '$' + demoPortfolio.buyingPower.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    const dayPnlEl = document.getElementById('day-pnl');
    dayPnlEl.textContent = '$' + demoPortfolio.dayPnL.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    dayPnlEl.className = demoPortfolio.dayPnL >= 0 ? 'positive' : 'negative';
    
    // Display positions
    this.displayPositions(demoPositions);
  }
  
  displayPositions(positions) {
    const positionsDiv = document.getElementById('positions-list');
    
    if (positions.length === 0) {
      positionsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);">No open positions</div>';
      return;
    }
    
    let html = '';
    positions.forEach(position => {
      const pnlClass = position.pnl >= 0 ? 'positive' : 'negative';
      const pnlPercent = ((position.currentPrice - position.avgCost) / position.avgCost * 100).toFixed(2);
      
      html += '<div class="portfolio-item">';
      html += '<div>';
      html += `<div style="font-weight: 700; font-size: 1.125rem; margin-bottom: 0.25rem;">${position.symbol}</div>`;
      html += `<div style="color: rgba(255, 255, 255, 0.6); font-size: 0.875rem;">${position.quantity} shares @ $${position.avgCost.toFixed(2)}</div>`;
      html += '</div>';
      html += '<div style="text-align: right;">';
      html += `<div style="font-weight: 700; font-size: 1.125rem;">$${position.currentPrice.toFixed(2)}</div>`;
      html += `<div class="${pnlClass}" style="font-size: 0.875rem;">$${position.pnl.toFixed(2)} (${pnlPercent}%)</div>`;
      html += '</div>';
      html += '</div>';
    });
    
    positionsDiv.innerHTML = html;
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.tradingInterface = new TradingInterface();
  });
} else {
  window.tradingInterface = new TradingInterface();
}
