/**
 * Account Manager
 * Handles starting balance, deposits, and portfolio value calculations
 * Integrated with EventBus for reactive updates
 */

class AccountManager {
  constructor() {
    this.config = null;
    this.basePath = SFTiUtils.getBasePath();
    this.initialized = false;
    this.eventBus = window.SFTiEventBus;
  }

  /**
   * Initialize account manager
   */
  async init() {
    await this.loadConfig();
    this.updateDisplay();
    this.setupEventListeners();
    this.initialized = true;
    
    // Emit initial account loaded event
    if (this.eventBus) {
      this.eventBus.emit('account:config-loaded', this.config);
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (!this.eventBus) return;
    
    // Listen for trades updates to recalculate portfolio value
    this.eventBus.on('trades:updated', (trades) => {
      this.updateDisplay();
    });
    
    // Listen for state refresh requests
    this.eventBus.on('state:refreshed', () => {
      this.loadConfig();
      this.updateDisplay();
    });
  }

  /**
   * Load account configuration from JSON file
   */
  async loadConfig() {
    try {
      const response = await fetch(`${this.basePath}/index.directory/account-config.json`);
      if (response.ok) {
        this.config = await response.json();
      } else {
        // Create default config
        this.config = {
          starting_balance: 1000.00,
          deposits: [],
          notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
          version: "1.0",
          last_updated: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Could not load account config, using defaults:', error);
      this.config = {
        starting_balance: 1000.00,
        deposits: [],
        notes: "Starting balance is your initial capital. Add deposits separately to track internal investments.",
        version: "1.0",
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Save account configuration
   * Note: In a real implementation, this would need backend/GitHub API
   * For now, we'll use localStorage as a client-side solution
   */
  saveConfig() {
    try {
      this.config.last_updated = new Date().toISOString();
      localStorage.setItem('sfti-account-config', JSON.stringify(this.config));
      console.log('Account config saved to localStorage');
      
      // Show a notification to the user that they need to commit changes
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-yellow);
        color: #000;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 400px;
        font-weight: 500;
      `;
      notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 0.75rem;">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="flex-shrink: 0; margin-top: 2px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <div style="font-weight: 600; margin-bottom: 0.25rem;">Changes Saved Locally</div>
            <div style="font-size: 0.875rem;">Run <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">python .github/scripts/parse_trades.py</code> and commit to persist changes.</div>
          </div>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
      
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration. Changes may not persist.');
    }
  }

  /**
   * Load config from localStorage if available (for client-side persistence)
   */
  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('sfti-account-config');
      if (stored) {
        const localConfig = JSON.parse(stored);
        // Merge with server config, preferring localStorage values
        this.config = { ...this.config, ...localConfig };
        console.log('Loaded account config from localStorage');
      }
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
    }
  }

  /**
   * Update display elements
   */
  updateDisplay() {
    // Load from localStorage first (client-side changes)
    this.loadFromLocalStorage();
    
    const balanceDisplay = document.getElementById('balance-display');
    const totalDepositsEl = document.getElementById('total-deposits');
    
    if (balanceDisplay) {
      balanceDisplay.textContent = `$${this.formatCurrency(this.config.starting_balance)}`;
    }
    
    const totalDeposits = this.getTotalDeposits();
    if (totalDepositsEl) {
      totalDepositsEl.textContent = `$${this.formatCurrency(totalDeposits)}`;
    }
  }

  /**
   * Get total deposits
   */
  getTotalDeposits() {
    if (!this.config || !this.config.deposits) return 0;
    return this.config.deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);
  }

  /**
   * Calculate current portfolio value
   * Portfolio = Starting Balance + Deposits + Trade P&L
   */
  calculatePortfolioValue(tradePnL) {
    const starting = parseFloat(this.config.starting_balance || 0);
    const deposits = this.getTotalDeposits();
    const pnl = parseFloat(tradePnL || 0);
    return starting + deposits + pnl;
  }

  /**
   * Update starting balance
   */
  updateStartingBalance(newBalance) {
    this.config.starting_balance = parseFloat(newBalance);
    this.saveConfig();
    this.updateDisplay();
    
    // Emit balance updated event
    if (this.eventBus) {
      this.eventBus.emit('account:balance-updated', {
        starting_balance: this.config.starting_balance,
        total_deposits: this.getTotalDeposits()
      });
    }
  }

  /**
   * Add a deposit
   */
  addDeposit(amount, date, note = '') {
    if (!this.config.deposits) {
      this.config.deposits = [];
    }
    
    this.config.deposits.push({
      amount: parseFloat(amount),
      date: date,
      note: note,
      timestamp: new Date().toISOString()
    });
    
    // Sort deposits by date
    this.config.deposits.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    this.saveConfig();
    this.updateDisplay();
    
    // Emit deposit added event
    if (this.eventBus) {
      this.eventBus.emit('account:deposit-added', {
        amount: parseFloat(amount),
        date: date,
        total_deposits: this.getTotalDeposits()
      });
    }
  }

  /**
   * Format currency with commas
   */
  formatCurrency(value) {
    return parseFloat(value).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
}

// Initialize global account manager on window object
window.accountManager = null;

// Initialize when DOM is ready
SFTiUtils.onDOMReady(async () => {
  window.accountManager = new AccountManager();
  await window.accountManager.init();
});

/**
 * Edit balance inline
 */
function editBalance() {
  const display = document.getElementById('balance-display');
  const input = document.getElementById('balance-input');
  
  if (!display || !input || !accountManager) return;
  
  // Get current value without $ and commas
  const currentValue = accountManager.config.starting_balance;
  
  display.style.display = 'none';
  input.style.display = 'inline-block';
  input.value = currentValue;
  input.focus();
  input.select();
}

/**
 * Save balance
 */
function saveBalance() {
  const display = document.getElementById('balance-display');
  const input = document.getElementById('balance-input');
  
  if (!display || !input || !accountManager) return;
  
  const newValue = parseFloat(input.value);
  if (isNaN(newValue) || newValue < 0) {
    alert('Please enter a valid positive number');
    input.focus();
    return;
  }
  
  accountManager.updateStartingBalance(newValue);
  
  input.style.display = 'none';
  display.style.display = 'inline';
  
  // Refresh the page stats
  if (window.tradingJournal && window.tradingJournal.loadRecentTrades) {
    window.tradingJournal.loadRecentTrades();
  }
}

/**
 * Show deposit modal
 */
function showDepositModal() {
  const modal = document.getElementById('deposit-modal');
  if (!modal) return;
  
  // Set default date to today
  const dateInput = document.getElementById('deposit-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
  
  modal.style.display = 'flex';
}

/**
 * Close deposit modal
 */
function closeDepositModal() {
  const modal = document.getElementById('deposit-modal');
  if (!modal) return;
  
  modal.style.display = 'none';
  
  // Clear form
  const form = document.getElementById('deposit-form');
  if (form) {
    form.reset();
  }
}

/**
 * Add deposit
 */
function addDeposit(event) {
  event.preventDefault();
  
  const amount = document.getElementById('deposit-amount').value;
  const date = document.getElementById('deposit-date').value;
  const note = document.getElementById('deposit-note').value;
  
  if (!amount || !date || !accountManager) {
    alert('Please fill in all required fields');
    return;
  }
  
  accountManager.addDeposit(amount, date, note);
  
  closeDepositModal();
  
  // Refresh the page stats
  if (window.tradingJournal && window.tradingJournal.loadRecentTrades) {
    window.tradingJournal.loadRecentTrades();
  }
  
  // Show success message
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-green);
    color: #000;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    font-weight: 600;
  `;
  notification.textContent = `Deposit of $${parseFloat(amount).toFixed(2)} added successfully!`;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Close modal on background click
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('deposit-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeDepositModal();
      }
    });
  }
});
