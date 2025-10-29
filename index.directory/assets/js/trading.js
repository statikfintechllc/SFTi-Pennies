/**
 * Trading Interface JavaScript for SFTi-Pennies
 * Handles IBKR authentication, market scanning, charting, and portfolio display
 */

class TradingInterface {
  constructor() {
    this.isAuthenticated = false;
    this.ibkrToken = null;
    // IBeam Gateway URL - connects to local IBeam instance
    this.apiBaseUrl = 'https://localhost:5000/v1/api';
    this.currentSymbol = 'AAPL';
    this.tradingViewWidget = null;
    this.authCheckInterval = null;
    
    this.init();
  }
  
  init() {
    console.log('Trading Interface initialized');
    
    // Check if returning from auth callback
    this.handleAuthReturn();
    
    // Check for existing session
    this.checkExistingSession();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check for OAuth callback (legacy support)
    this.handleOAuthCallback();
  }
  
  handleAuthReturn() {
    // Check for existing IBKR session on page load
    this.checkIBKRSession().then(valid => {
      if (valid) {
        console.log('✅ Existing IBKR session detected');
        this.isAuthenticated = true;
        this.showTradingInterface();
        this.updateConnectionStatus(true);
        this.loadPortfolio();
        this.runMarketScan();
      } else {
        console.log('ℹ️ No active IBKR session');
      }
    });
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
  
  async initiateIBKRAuth() {
    // IBeam Gateway Connection
    // IBeam must be running locally (via Docker) and already authenticated
    // IBeam handles IBKR authentication automatically using Selenium
    
    console.log('🚀 Connecting to IBeam Gateway at localhost:5000...');
    
    const connectBtn = document.getElementById('connect-ibkr-btn');
    const authBtn = document.getElementById('auth-toggle-btn');
    
    if (connectBtn) {
      connectBtn.textContent = 'Connecting...';
      connectBtn.disabled = true;
    }
    if (authBtn) {
      authBtn.textContent = 'Connecting...';
      authBtn.disabled = true;
    }
    
    try {
      // Try to reach IBeam Gateway at localhost:5000
      const authStatus = await this.checkIBeamAuth();
      
      if (authStatus.authenticated) {
        console.log('✅ Connected to IBeam Gateway - authentication successful');
        this.isAuthenticated = true;
        this.ibeamConnected = true;
        
        // Store connection info
        localStorage.setItem('ibeam_connected', 'true');
        localStorage.setItem('ibeam_connected_time', Date.now().toString());
        
        this.showTradingInterface();
        this.updateConnectionStatus(true);
        
        // Start loading real data
        this.loadPortfolio();
        this.runMarketScan();
        
        // Start health check interval
        this.startHealthCheck();
      } else {
        // IBeam not authenticated
        this.showIBeamSetupGuide();
        
        if (connectBtn) {
          connectBtn.textContent = 'Connect IBKR';
          connectBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error('❌ Error connecting to IBeam:', error);
      alert('Failed to connect to IBeam Gateway. Please ensure IBeam is running locally.');
      
      if (connectBtn) {
        connectBtn.textContent = 'Connect IBKR';
        connectBtn.disabled = false;
      }
    }
  }
  
  async checkIBeamAuth() {
    // Check if IBeam Gateway is running and authenticated at localhost:5000
    try {
      const response = await fetch('http://localhost:5000/v1/api/iserver/auth/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies
      });

      if (response.ok) {
        const data = await response.json();
        return {
          authenticated: data.authenticated === true,
          connected: data.connected === true,
          message: data.message || ''
        };
      }
      
      return { authenticated: false, connected: false };
    } catch (error) {
      console.error('❌ IBeam connection error:', error);
      return { authenticated: false, connected: false, error: error.message };
    }
  }
  
  showIBeamSetupGuide() {
    const message = `❌ IBeam Gateway Not Running

To use the trading interface, you need to run IBeam locally:

**Quick Setup:**

1. Install Docker: https://docker.com/products/docker-desktop

2. Navigate to the IBeam directory:
   cd index.directory/SFTi.Trading/ibeam/

3. Create a .env file with your IBKR credentials:
   IBEAM_ACCOUNT=your_username
   IBEAM_PASSWORD=your_password

4. Start IBeam:
   docker-compose up -d

5. Wait 30-60 seconds for authentication

6. Refresh this page and click "Connect IBKR"

**Documentation:**
See index.directory/SFTi.Trading/IBEAM-INTEGRATION.md for complete setup instructions.`;
    
    alert(message);
  }
  
  startHealthCheck() {
    // Clear any existing interval
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    
    // Check IBeam status every 60 seconds
    this.authCheckInterval = setInterval(async () => {
      const status = await this.checkIBeamAuth();
      
      if (!status.authenticated) {
        console.warn('⚠️ IBeam session lost - disconnecting');
        this.disconnect();
      }
    }, 60000); // 60 seconds
  }
  
  disconnect() {
    if (confirm('Are you sure you want to disconnect from IBKR?')) {
      this.isAuthenticated = false;
      this.ibeamConnected = false;
      
      // Clear health check interval
      if (this.authCheckInterval) {
        clearInterval(this.authCheckInterval);
        this.authCheckInterval = null;
      }
      
      localStorage.removeItem('ibeam_connected');
      localStorage.removeItem('ibeam_connected_time');
      
      // Try to call logout endpoint
      fetch(`${this.apiBaseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      }).catch(err => console.error('Logout error:', err));
      
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
    
    // IBeam Gateway URL (local)
    const baseUrl = 'http://localhost:5000/v1/api';
    
    try {
      // Call IBKR scanner API via IBeam Gateway
      console.log('📡 Running IBKR scanner via IBeam Gateway...');
      
      const scannerParams = {
        instrument: 'STK',
        type: 'TOP_PERC_GAIN',
        filter: [
          ...(marketCap !== 'All' ? [{code: 'marketCapFilter', value: marketCap}] : []),
          ...(volume !== 'All' ? [{code: 'volumeFilter', value: volume}] : []),
          ...(priceMin ? [{code: 'priceAbove', value: parseFloat(priceMin)}] : []),
          ...(priceMax ? [{code: 'priceBelow', value: parseFloat(priceMax)}] : []),
          ...(sector !== 'All Sectors' ? [{code: 'sectorFilter', value: sector}] : []),
          ...(exchange !== 'All' ? [{code: 'exchangeFilter', value: exchange}] : [])
        ],
        location: 'STK.US.MAJOR',
        size: 50
      };
      
      const scanResponse = await fetch(`${baseUrl}/iserver/scanner/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scannerParams)
      });
      
      if (!scanResponse.ok) {
        throw new Error(`Scanner API error: ${scanResponse.status}`);
      }
      
      const scanData = await scanResponse.json();
      console.log('✅ Scanner results received:', scanData);
      
      // Process and display results
      if (scanData.contracts && scanData.contracts.length > 0) {
        this.displayScanResults(scanData.contracts);
      } else {
        resultsDiv.innerHTML = '<div style="text-align: center; padding: 2rem; color: #888;">No results found matching your criteria</div>';
      }
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
      
      const response = await fetch(`${baseUrl}/iserver/scanner/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scannerParams)
      });
      
      if (!response.ok) {
        throw new Error(`Scanner API error: ${response.status}`);
      }
      
      const data = await response.json();
      const results = (data.Contracts || data.contracts || []).map(item => ({
        symbol: item.symbol || item.Symbol,
        price: (item.lastPrice || item.last_price ||0).toFixed(2),
        change: (item.changePercent || item.change_percent || 0).toFixed(2),
        volume: (item.volume || item.Volume || 0).toFixed(0),
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
    
    const baseUrl = 'http://localhost:5000/v1/api';
    
    try {
      // Get accounts from IBeam Gateway (which proxies to IBKR)
      console.log('📊 Fetching accounts from IBeam Gateway...');
      
      const accountsResponse = await fetch(`${baseUrl}/iserver/accounts`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!accountsResponse.ok) {
        throw new Error(`API error: ${accountsResponse.status}`);
      }
      
      const accounts = await accountsResponse.json();
      const accountId = Array.isArray(accounts) ? accounts[0] : accounts.accountId || accounts.id;
      
      if (!accountId) {
        throw new Error('No account found');
      }
      
      // Fetch account summary and positions from IBeam
      const [summaryResponse, positionsResponse] = await Promise.all([
        fetch(`${baseUrl}/portfolio/${accountId}/summary`, {
          headers: {
            'Content-Type': 'application/json',
          }
        }),
        fetch(`${baseUrl}/portfolio/${accountId}/positions/0`, {
          headers: {
            'Content-Type': 'application/json',
          }
        })
      ]);
      
      if (!summaryResponse.ok || !positionsResponse.ok) {
        throw new Error('Failed to fetch portfolio data');
      }
      
      const summary = await summaryResponse.json();
      const positions = await positionsResponse.json();
      
      // Format data
      const accountData = {
        netLiquidation: summary.netliquidationvalue || 0,
        cashBalance: summary.availablefunds || 0,
        buyingPower: summary.buyingpower || 0,
        dayPnL: summary.unrealizedpnl || 0
      };
      
      const positionsData = (Array.isArray(positions) ? positions : [positions]).map(pos => ({
        symbol: pos.contractDesc || pos.ticker || 'N/A',
        quantity: pos.position || 0,
        avgCost: pos.avgCost || 0,
        currentPrice: pos.mktPrice || 0,
        pnl: pos.unrealizedPnL || 0
      }));
      
      this.displayPortfolioData(accountData, positionsData);
      console.log('✅ Real IBKR portfolio data loaded from IBeam Gateway');
      
    } catch (error) {
      console.error('❌ Error fetching IBKR portfolio from IBeam:', error);
      console.log('⚠️ Make sure IBeam is running: docker-compose up -d');
      console.log('📋 Falling back to demo data');
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
