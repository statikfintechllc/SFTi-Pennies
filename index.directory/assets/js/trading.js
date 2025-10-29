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
    // Check URL for OAuth callback - IBKR returns token in hash fragment or query params
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hash);
    
    // Check for token in hash (implicit flow) or query params
    const accessToken = hashParams.get('access_token') || urlParams.get('access_token');
    const tokenType = hashParams.get('token_type') || urlParams.get('token_type');
    const expiresIn = hashParams.get('expires_in') || urlParams.get('expires_in');
    const error = hashParams.get('error') || urlParams.get('error');
    
    if (error) {
      alert('Authentication failed: ' + error);
      return;
    }
    
    if (accessToken) {
      // IBKR token received directly - store it
      console.log('IBKR access token received, storing in browser...');
      
      this.ibkrToken = accessToken;
      this.isAuthenticated = true;
      
      // Store in localStorage with expiry
      const expiry = Date.now() + (parseInt(expiresIn || '3600') * 1000);
      localStorage.setItem('ibkr_token', accessToken);
      localStorage.setItem('ibkr_token_type', tokenType || 'Bearer');
      localStorage.setItem('ibkr_token_expiry', expiry.toString());
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Show trading interface
      this.showTradingInterface();
      this.updateConnectionStatus(true);
      
      console.log('IBKR authentication successful - token cached in browser');
      
      // Immediately start fetching real data
      this.loadPortfolio();
      this.runMarketScan();
    }
  }
  
  initiateIBKRAuth() {
    // IBKR Web Authorization - Implicit Flow (token returned directly)
    // Users configure their own IBKR OAuth app and use their Client ID
    
    // Try to get Client ID from localStorage (user can set this once)
    let IBKR_CLIENT_ID = localStorage.getItem('ibkr_client_id');
    
    if (!IBKR_CLIENT_ID) {
      // Prompt user for their IBKR Client ID on first use
      IBKR_CLIENT_ID = prompt(
        'Enter your IBKR OAuth Client ID:\n\n' +
        'To get your Client ID:\n' +
        '1. Log in to IBKR Account Management\n' +
        '2. Go to Settings > API > Create OAuth App\n' +
        '3. Set Redirect URI to: ' + window.location.origin + '/SFTi-Pennies/index.directory/trading.html\n' +
        '4. Copy your Client ID and paste it here\n\n' +
        'This will be saved in your browser for future use.'
      );
      
      if (!IBKR_CLIENT_ID) {
        alert('Client ID required to connect to IBKR');
        return;
      }
      
      // Save for future use
      localStorage.setItem('ibkr_client_id', IBKR_CLIENT_ID.trim());
    }
    
    const REDIRECT_URI = `${window.location.origin}/SFTi-Pennies/index.directory/trading.html`;
    const STATE = Math.random().toString(36).substring(7);
    
    // Store state for verification
    sessionStorage.setItem('ibkr_oauth_state', STATE);
    
    // IBKR OAuth endpoint - using implicit flow (response_type=token)
    // This returns the access token directly in the URL fragment
    const authUrl = `https://api.ibkr.com/v1/api/oauth/authorize?` +
      `response_type=token&` +
      `client_id=${encodeURIComponent(IBKR_CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `state=${STATE}`;
    
    console.log('Redirecting to IBKR OAuth...');
    
    // Redirect to IBKR OAuth
    window.location.href = authUrl;
  }
  
  disconnect() {
    if (confirm('Are you sure you want to disconnect from IBKR?')) {
      this.isAuthenticated = false;
      this.ibkrToken = null;
      
      localStorage.removeItem('ibkr_token');
      localStorage.removeItem('ibkr_token_type');
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
    
    const token = localStorage.getItem('ibkr_token');
    const tokenType = localStorage.getItem('ibkr_token_type') || 'Bearer';
    
    if (!token) {
      console.log('No IBKR token, using demo data');
      setTimeout(() => {
        const demoResults = this.generateDemoScanResults();
        this.displayScanResults(demoResults);
      }, 1500);
      return;
    }
    
    try {
      // Make direct API call to IBKR scanner
      console.log('Running IBKR scanner with criteria:', {marketCap, volume, priceMin, priceMax, percentChange, sector, exchange});
      
      const scannerParams = {
        instrument: 'STK',
        location: exchange || 'STK.US.MAJOR',
        scanCode: 'TOP_PERC_GAIN',
        filters: []
      };
      
      // Add filters based on user input
      if (priceMin) scannerParams.filters.push({code: 'priceAbove', value: parseFloat(priceMin)});
      if (priceMax) scannerParams.filters.push({code: 'priceBelow', value: parseFloat(priceMax)});
      if (volume) {
        const volMap = {'100k': 100000, '500k': 500000, '1m': 1000000, '5m': 5000000};
        scannerParams.filters.push({code: 'volumeAbove', value: volMap[volume] || 100000});
      }
      
      const response = await fetch('https://api.ibkr.com/v1/api/iserver/scanner/run', {
        method: 'POST',
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scannerParams)
      });
      
      if (!response.ok) {
        throw new Error(`Scanner API error: ${response.status}`);
      }
      
      const data = await response.json();
      const results = (data.Contracts || []).map(item => ({
        symbol: item.symbol,
        price: item.lastPrice?.toFixed(2) || '0.00',
        change: item.changePercent?.toFixed(2) || '0.00',
        volume: item.volume?.toFixed(0) || '0',
        marketCap: item.marketCap ? (item.marketCap / 1000000000).toFixed(2) + 'B' : 'N/A'
      }));
      
      this.displayScanResults(results);
      console.log('✓ Real IBKR scan results loaded:', results.length, 'stocks');
      
    } catch (error) {
      console.error('Error running IBKR scanner:', error);
      console.log('Falling back to demo data');
      
      // Fallback to demo data
      setTimeout(() => {
        const demoResults = this.generateDemoScanResults();
        this.displayScanResults(demoResults);
      }, 500);
    }
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
    
    const token = localStorage.getItem('ibkr_token');
    const tokenType = localStorage.getItem('ibkr_token_type') || 'Bearer';
    
    if (!token) {
      console.log('No IBKR token, using demo data');
      this.loadDemoPortfolio();
      return;
    }
    
    try {
      // Make direct API call to IBKR
      console.log('Fetching portfolio from IBKR API...');
      
      // Get account list
      const accountsResponse = await fetch('https://api.ibkr.com/v1/api/portfolio/accounts', {
        headers: {
          'Authorization': `${tokenType} ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!accountsResponse.ok) {
        throw new Error(`API error: ${accountsResponse.status}`);
      }
      
      const accounts = await accountsResponse.json();
      const accountId = accounts[0]?.accountId;
      
      if (!accountId) {
        throw new Error('No account found');
      }
      
      // Fetch account summary and positions in parallel
      const [summaryResponse, positionsResponse] = await Promise.all([
        fetch(`https://api.ibkr.com/v1/api/portfolio/${accountId}/summary`, {
          headers: {
            'Authorization': `${tokenType} ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`https://api.ibkr.com/v1/api/portfolio/${accountId}/positions/0`, {
          headers: {
            'Authorization': `${tokenType} ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);
      
      const summary = await summaryResponse.json();
      const positions = await positionsResponse.json();
      
      // Format data
      const accountData = {
        netLiquidation: summary.netliquidationvalue || 0,
        cashBalance: summary.availablefunds || 0,
        buyingPower: summary.buyingpower || 0,
        dayPnL: summary.unrealizedpnl || 0
      };
      
      const positionsData = positions.map(pos => ({
        symbol: pos.contractDesc || pos.ticker,
        quantity: pos.position,
        avgCost: pos.avgCost,
        currentPrice: pos.mktPrice,
        pnl: pos.unrealizedPnL
      }));
      
      this.displayPortfolioData(accountData, positionsData);
      console.log('✓ Real IBKR portfolio data loaded');
      
    } catch (error) {
      console.error('Error fetching IBKR portfolio:', error);
      console.log('Falling back to demo data');
      this.loadDemoPortfolio();
    }
  }
  
  loadDemoPortfolio() {
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
