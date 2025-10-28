/**
 * Browser-based IBKR Client Portal integration for PWA functionality
 * This replaces the server-based IBKR integration to enable offline operation
 */

class EventEmitter {
  private events: Map<string, ((...args: any[]) => void)[]> = new Map();

  emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event) || [];
    handlers.forEach(handler => handler(...args));
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  off(event: string, handler: (...args: any[]) => void) {
    const handlers = this.events.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }
}

export class IBKRBrowserService extends EventEmitter {
  private baseUrl = 'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api';
  private isAuthenticated = false;
  private subscribers = new Map<string, (data: any) => void>();

  constructor() {
    super();
    this.checkExistingSession();
  }

  async checkExistingSession(): Promise<boolean> {
    try {
      console.log('🔍 Checking existing IBKR session...');
      
      const response = await fetch(
        'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api/portal/sso/validate',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Session check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Session check response data:', data);
        
        // Check for various indicators of valid session
        const isValid = data.USER_ID || 
                       data.USER_NAME || 
                       data.AUTHENTICATED === true || 
                       data.authenticated === true ||
                       (data.features && Object.keys(data.features).length > 0);
        
        if (isValid) {
          console.log('✅ Valid session found!');
          this.isAuthenticated = true;
          this.emit('authenticated');
          return true;
        }
      }
      
      console.log('❌ No valid session found');
      return false;
    } catch (error) {
      console.error('❌ Session check failed:', error);
      return false;
    }
  }

  async authenticateWithPopup(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('🚀 Starting IBKR popup authentication...');
      
      const popup = window.open(
        'https://cdcdyn.interactivebrokers.com/sso/Login?forwardTo=22&RL=1&ip2loc=on',
        'ibkr-auth',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        console.error('❌ Failed to open popup - popup blocked?');
        resolve(false);
        return;
      }

      let checkCount = 0;
      const maxChecks = 120; // 10 minutes (5 second intervals)
      
      const checkAuth = async () => {
        checkCount++;
        console.log(`🔄 Auth check ${checkCount}/${maxChecks}...`);
        
        try {
          // Check if popup was closed by user
          if (popup.closed) {
            console.log('❌ Popup was closed by user');
            resolve(false);
            return;
          }
          
          // Try to detect if user is back at main IBKR portal
          try {
            const currentUrl = popup.location.href;
            console.log('🔍 Popup URL:', currentUrl);
            
            // Check if we're at a success page or main portal
            if (currentUrl.includes('portal.interactivebrokers.com') && 
                !currentUrl.includes('sso/Login')) {
              console.log('✅ Detected successful login redirect!');
              popup.close();
              
              // Wait a moment for cookies to be set, then check session
              setTimeout(async () => {
                const sessionValid = await this.checkExistingSession();
                resolve(sessionValid);
              }, 2000);
              return;
            }
          } catch {
            // Can't access popup.location due to cross-origin, this is expected
            // Continue with session checks
          }
          
          // Check our session periodically
          if (checkCount % 6 === 0) { // Every 30 seconds
            const sessionValid = await this.checkExistingSession();
            if (sessionValid) {
              console.log('✅ Session validation successful!');
              popup.close();
              resolve(true);
              return;
            }
          }
          
          // Continue checking if we haven't exceeded max attempts
          if (checkCount < maxChecks) {
            setTimeout(checkAuth, 5000); // Check every 5 seconds
          } else {
            console.log('❌ Authentication timeout after 10 minutes');
            popup.close();
            resolve(false);
          }
          
        } catch (error) {
          console.error('❌ Error during auth check:', error);
          if (checkCount < maxChecks) {
            setTimeout(checkAuth, 5000);
          } else {
            popup.close();
            resolve(false);
          }
        }
      };

      // Start checking after a short delay
      setTimeout(checkAuth, 3000);
    });
  }

  async getAccounts(): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      const response = await fetch(`${this.baseUrl}/iserver/accounts`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const accounts = await response.json();
      return Array.isArray(accounts) ? accounts : [accounts];
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async getMarketData(symbols: string[]): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      // First search for contracts
      const contracts = await this.searchContracts(symbols);
      
      if (contracts.length === 0) {
        return [];
      }

      // Get market data for found contracts
      const conids = contracts.map(c => c.conid).join(',');
      const response = await fetch(
        `${this.baseUrl}/iserver/marketdata/snapshot?conids=${conids}&fields=55,31,86,87`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch market data: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [data];
    } catch (error) {
      console.error('Failed to get market data:', error);
      return [];
    }
  }

  private async searchContracts(symbols: string[]): Promise<any[]> {
    const contracts = [];
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `${this.baseUrl}/iserver/secdef/search?symbol=${symbol}`,
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
            // Get the first equity match
            const equity = data.find(item => item.instrument_type === 'STK');
            if (equity) {
              contracts.push(equity);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to search for ${symbol}:`, error);
      }
    }
    
    return contracts;
  }

  async getPositions(accountId: string): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Not authenticated with IBKR');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/portfolio/${accountId}/positions/0`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch positions: ${response.status}`);
      }

      const positions = await response.json();
      return Array.isArray(positions) ? positions : [positions];
    } catch (error) {
      console.error('Failed to get positions:', error);
      return [];
    }
  }

  async subscribeToMarketData(symbols: string[], callback: (data: any) => void): Promise<void> {
    // Store subscription for later cleanup
    const subscriptionId = symbols.join(',');
    this.subscribers.set(subscriptionId, callback);

    // Start polling for market data updates
    const poll = async () => {
      try {
        const data = await this.getMarketData(symbols);
        if (data.length > 0) {
          callback(data);
        }
      } catch (error) {
        console.error('Market data polling error:', error);
      }
    };

    // Poll every second
    setTimeout(poll, 1000);
  }

  unsubscribeFromMarketData(symbols: string[]): void {
    const subscriptionId = symbols.join(',');
    this.subscribers.delete(subscriptionId);
  }

  async getConnectionStatus(): Promise<{ connected: boolean; authenticated: boolean }> {
    const authenticated = await this.checkExistingSession();
    return {
      connected: true, // Browser is always "connected"
      authenticated
    };
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      this.isAuthenticated = false;
      this.emit('disconnected');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}

// Create and export singleton instance
export const ibkrBrowserService = new IBKRBrowserService();