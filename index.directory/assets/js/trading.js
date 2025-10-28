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
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      alert('Authentication failed: ' + error);
      return;
    }
    
    if (code) {
      // OAuth authorization code received from IBKR
      console.log('IBKR OAuth code received, triggering GitHub Actions workflow...');
      
      // Trigger GitHub Actions workflow via repository_dispatch
      this.triggerOAuthWorkflow(code, state);
      
      // Store temporary authenticated state
      this.ibkrToken = 'pending';
      this.isAuthenticated = true;
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show trading interface
      this.showTradingInterface();
      this.updateConnectionStatus(true);
      
      console.log('IBKR authentication in progress...');
    }
  }
  
  async triggerOAuthWorkflow(code, state) {
    // In a real implementation, this would trigger a GitHub Actions workflow
    // via repository_dispatch to exchange the code for a token
    console.log('OAuth workflow triggered with code:', code.substring(0, 10) + '...');
    
    // Simulate successful token exchange
    setTimeout(() => {
      localStorage.setItem('ibkr_token', 'token_' + code);
      localStorage.setItem('ibkr_token_expiry', (Date.now() + (24 * 60 * 60 * 1000)).toString());
      console.log('Token stored successfully');
    }, 1000);
  }
  
  initiateIBKRAuth() {
    // IBKR OAuth configuration
    const IBKR_CLIENT_ID = 'YOUR_IBKR_CLIENT_ID'; // To be configured in GitHub Pages settings
    const REDIRECT_URI = `${window.location.origin}/SFTi-Pennies/index.directory/trading.html`;
    const STATE = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('ibkr_oauth_state', STATE);
    
    // IBKR OAuth endpoint
    const authUrl = `https://api.ibkr.com/v1/oauth2/authorize?` +
      `response_type=code&` +
      `client_id=${IBKR_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `state=${STATE}&` +
      `scope=read_account read_trades execute_trades`;
    
    // Check if running in demo mode (no client ID configured)
    if (IBKR_CLIENT_ID === 'YOUR_IBKR_CLIENT_ID') {
      const useDemo = confirm(
        'IBKR OAuth Flow:\n\n' +
        '1. Redirect to IBKR login page\n' +
        '2. Sign in with your IBKR credentials\n' +
        '3. Authorize this application\n' +
        '4. Redirect back with authorization code\n' +
        '5. GitHub Actions exchanges code for token\n\n' +
        'Note: IBKR Client ID not configured.\n' +
        'Click OK to use demo mode, or Cancel to abort.'
      );
      
      if (useDemo) {
        this.simulateAuthentication();
      }
      return;
    }
    
    // Redirect to IBKR OAuth
    window.location.href = authUrl;
  }
  
  simulateAuthentication() {
    // Generate a fake authorization code for demo purposes
    const fakeCode = 'demo_code_' + Math.random().toString(36).substr(2, 9);
    
    // Simulate OAuth redirect
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('code', fakeCode);
    currentUrl.searchParams.set('state', 'demo');
    
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
    
    try {
      // Try to trigger GitHub Actions workflow to run scanner
      // In production, this would call the GitHub API to trigger the workflow
      console.log('Triggering scanner with criteria:', {marketCap, volume, priceMin, priceMax, percentChange, sector, exchange});
      
      // Try to load cached scan results
      const response = await fetch('assets/data/scanner-results.json');
      if (response.ok) {
        const data = await response.json();
        if (!data.demo && !data.error && data.results.length > 0) {
          console.log('Loading real IBKR scan results');
          this.displayScanResults(data.results);
          return;
        }
      }
    } catch (error) {
      console.log('Real scan data not available, using demo data');
    }
    
    // Fallback to demo data
    setTimeout(() => {
      const demoResults = this.generateDemoScanResults();
      this.displayScanResults(demoResults);
    }, 1500);
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
    
    try {
      // Try to load real data from GitHub Actions
      const response = await fetch('assets/data/portfolio.json');
      if (response.ok) {
        const data = await response.json();
        
        if (!data.demo && !data.error) {
          // Use real IBKR data
          console.log('Loading real IBKR portfolio data');
          this.displayPortfolioData(data.account, data.positions);
          return;
        }
      }
    } catch (error) {
      console.log('Real data not available, using demo data');
    }
    
    // Fallback to demo data
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
    
    this.displayPortfolioData(demoPortfolio, demoPositions);
  }
  
  displayPortfolioData(account, positions) {
    // Update account summary
    document.getElementById('net-liquidation').textContent = '$' + account.netLiquidation.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('cash-balance').textContent = '$' + account.cashBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    document.getElementById('buying-power').textContent = '$' + account.buyingPower.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    const dayPnlEl = document.getElementById('day-pnl');
    dayPnlEl.textContent = '$' + account.dayPnL.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    dayPnlEl.className = account.dayPnL >= 0 ? 'positive' : 'negative';
    
    // Display positions
    this.displayPositions(positions);
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
