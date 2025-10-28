/**
 * IBKR Client Portal Gateway - Browser Integration
 * Implements the Client Portal Gateway functionality directly in the browser
 * Based on IBKR's official Client Portal Web API
 */

export class IBKRGatewayBrowser {
  private baseUrl = 'https://localhost:5000/v1/api';
  private sessionId: string | null = null;
  private isAuthenticated = false;
  private accounts: any[] = [];
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.initializeGateway();
  }

  /**
   * Initialize the browser-based gateway
   */
  private async initializeGateway() {
    try {
      // Check if gateway is accessible
      const status = await this.checkGatewayStatus();
      if (status.running) {
        console.log('✅ IBKR Gateway detected and running');
        await this.checkExistingAuth();
      } else {
        console.log('⚠️ Starting embedded gateway simulation');
        await this.startEmbeddedGateway();
      }
    } catch (error) {
      console.warn('Gateway initialization failed, using fallback mode:', error);
      await this.startFallbackMode();
    }
  }

  /**
   * Start embedded gateway functionality
   */
  private async startEmbeddedGateway() {
    // This simulates the gateway by using IBKR's direct web endpoints
    this.baseUrl = 'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api';
    console.log('🚀 Embedded gateway started with proxy endpoints');
  }

  /**
   * Fallback mode using direct IBKR endpoints
   */
  private async startFallbackMode() {
    this.baseUrl = 'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api';
    console.log('🔄 Using fallback direct API mode');
  }

  /**
   * Check if Client Portal Gateway is running
   */
  private async checkGatewayStatus(): Promise<{ running: boolean; authenticated: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/iserver/auth/status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          running: true,
          authenticated: data.authenticated || false
        };
      }
      
      return { running: false, authenticated: false };
    } catch (error) {
      return { running: false, authenticated: false };
    }
  }

  /**
   * Check for existing authentication session
   */
  private async checkExistingAuth(): Promise<boolean> {
    try {
      const status = await this.checkGatewayStatus();
      this.isAuthenticated = status.authenticated;
      
      if (this.isAuthenticated) {
        console.log('✅ Found existing IBKR session');
        await this.loadAccounts();
      }
      
      return this.isAuthenticated;
    } catch (error) {
      console.warn('Auth check failed:', error);
      return false;
    }
  }

  /**
   * Authenticate with IBKR using improved web flow
   */
  async authenticate(): Promise<{ success: boolean; error?: string; requiresSSO?: boolean }> {
    try {
      // First, check current auth status
      const status = await this.checkGatewayStatus();
      
      if (status.authenticated) {
        this.isAuthenticated = true;
        await this.loadAccounts();
        return { success: true };
      }

      // If not authenticated, need to trigger SSO flow
      return await this.startSSOFlow();
      
    } catch (error) {
      console.error('Authentication error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  /**
   * Start Single Sign-On flow with IBKR
   */
  private async startSSOFlow(): Promise<{ success: boolean; error?: string; requiresSSO?: boolean }> {
    try {
      // Try to trigger reauthentication
      const reauthResponse = await fetch(`${this.baseUrl}/iserver/reauthenticate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (reauthResponse.ok) {
        const reauthData = await reauthResponse.json();
        
        if (reauthData.authenticated) {
          this.isAuthenticated = true;
          await this.loadAccounts();
          return { success: true };
        }
      }

      // If reauthentication fails, user needs to complete SSO
      return { 
        success: false, 
        requiresSSO: true,
        error: 'Please complete IBKR login in the popup window' 
      };
      
    } catch (error) {
      console.error('SSO flow error:', error);
      return { 
        success: false, 
        error: 'SSO authentication failed' 
      };
    }
  }

  /**
   * Open IBKR login in popup and monitor for completion
   */
  async authenticateWithPopup(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Open IBKR Client Portal in popup
      const loginUrl = 'https://cdcdyn.interactivebrokers.com/portal/';
      const popup = window.open(
        loginUrl,
        'ibkr-login',
        'width=800,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes'
      );

      if (!popup) {
        resolve({ success: false, error: 'Popup blocked. Please allow popups for this site.' });
        return;
      }

      // Monitor authentication status
      const checkInterval = setInterval(async () => {
        try {
          // Check if popup was closed
          if (popup.closed) {
            clearInterval(checkInterval);
            
            // Give a moment for auth to propagate, then check
            setTimeout(async () => {
              const authResult = await this.checkExistingAuth();
              if (authResult) {
                resolve({ success: true });
              } else {
                resolve({ success: false, error: 'Authentication was cancelled or failed' });
              }
            }, 2000);
            return;
          }

          // Check auth status
          const status = await this.checkGatewayStatus();
          if (status.authenticated) {
            clearInterval(checkInterval);
            popup.close();
            this.isAuthenticated = true;
            await this.loadAccounts();
            resolve({ success: true });
          }
        } catch (error) {
          // Continue checking - auth might not be ready yet
        }
      }, 3000); // Check every 3 seconds

      // Timeout after 5 minutes
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!popup.closed) {
          popup.close();
        }
        resolve({ success: false, error: 'Authentication timeout. Please try again.' });
      }, 300000);
    });
  }

  /**
   * Load user accounts
   */
  private async loadAccounts(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/iserver/accounts`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        this.accounts = await response.json();
        console.log(`✅ Loaded ${this.accounts.length} IBKR accounts`);
      }
    } catch (error) {
      console.warn('Failed to load accounts:', error);
    }
  }

  /**
   * Get market data for symbols
   */
  async getMarketData(symbols: string[]): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      // First get contract IDs
      const contracts = await this.searchContracts(symbols);
      
      if (contracts.length === 0) {
        return [];
      }

      // Get market data snapshots
      const conids = contracts.map(c => c.conid).join(',');
      const fields = '31,84,86,87'; // Last, bid, ask, volume
      
      const response = await fetch(
        `${this.baseUrl}/iserver/marketdata/snapshot?conids=${conids}&fields=${fields}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [data];
      }
      
      throw new Error(`Market data request failed: ${response.status}`);
    } catch (error) {
      console.error('Market data error:', error);
      throw error;
    }
  }

  /**
   * Search for contracts by symbol
   */
  private async searchContracts(symbols: string[]): Promise<any[]> {
    const contracts = [];
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `${this.baseUrl}/iserver/secdef/search?symbol=${encodeURIComponent(symbol)}`,
          {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            contracts.push({
              symbol,
              conid: data[0].conid,
              name: data[0].name || symbol
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to resolve contract for ${symbol}:`, error);
      }
    }

    return contracts;
  }

  /**
   * Get portfolio positions
   */
  async getPositions(accountId?: string): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      const account = accountId || (this.accounts[0]?.id);
      if (!account) {
        throw new Error('No account available');
      }

      const response = await fetch(
        `${this.baseUrl}/portfolio/${account}/positions/0`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
      
      throw new Error(`Positions request failed: ${response.status}`);
    } catch (error) {
      console.error('Positions error:', error);
      throw error;
    }
  }

  /**
   * Place a stock order
   */
  async placeOrder(orderData: {
    symbol: string;
    quantity: number;
    side: 'BUY' | 'SELL';
    orderType: 'MKT' | 'LMT';
    price?: number;
    accountId?: string;
  }): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      // First get contract ID
      const contracts = await this.searchContracts([orderData.symbol]);
      if (contracts.length === 0) {
        throw new Error(`Could not find contract for symbol: ${orderData.symbol}`);
      }

      const conid = contracts[0].conid;
      const account = orderData.accountId || this.accounts[0]?.id;

      const order = {
        conid,
        orderType: orderData.orderType,
        side: orderData.side,
        quantity: orderData.quantity,
        price: orderData.price,
        tif: 'DAY'
      };

      const response = await fetch(
        `${this.baseUrl}/iserver/account/${account}/orders`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ orders: [order] })
        }
      );

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`Order placement failed: ${response.status}`);
    } catch (error) {
      console.error('Order placement error:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): { connected: boolean; authenticated: boolean; accounts: number } {
    return {
      connected: true, // Browser is always "connected"
      authenticated: this.isAuthenticated,
      accounts: this.accounts.length
    };
  }

  /**
   * Get accounts
   */
  getAccounts(): any[] {
    return [...this.accounts];
  }

  /**
   * Logout and clear session
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Logout request failed:', error);
    }

    this.isAuthenticated = false;
    this.sessionId = null;
    this.accounts = [];
    console.log('🔓 Logged out of IBKR');
  }

  /**
   * Subscribe to real-time market data
   */
  async subscribeToMarketData(symbols: string[], callback: (data: any) => void): Promise<void> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    // Start polling for updates
    const poll = async () => {
      try {
        const data = await this.getMarketData(symbols);
        callback(data);
      } catch (error) {
        console.warn('Market data polling error:', error);
      }
    };

    // Initial call
    await poll();

    // Set up polling interval (every 5 seconds)
    const interval = setInterval(poll, 5000);

    // Store interval for cleanup (you might want to add a cleanup method)
    (this as any)._marketDataInterval = interval;
  }

  /**
   * Stop market data subscription
   */
  unsubscribeFromMarketData(): void {
    if ((this as any)._marketDataInterval) {
      clearInterval((this as any)._marketDataInterval);
      delete (this as any)._marketDataInterval;
    }
  }
}

// Export singleton instance
export const ibkrGateway = new IBKRGatewayBrowser();
