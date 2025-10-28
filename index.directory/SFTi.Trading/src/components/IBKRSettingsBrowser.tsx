import { useState, useEffect } from 'react';
import { ibkrGateway } from '@/lib/ibkr-gateway-browser';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Custom SVG Icons
const Settings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function IBKRSettings() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const status = await ibkrGateway.getConnectionStatus();
      setIsAuthenticated(status.authenticated);
      
      if (status.authenticated) {
        // Try to fetch accounts
        try {
          const accountData = await ibkrGateway.getAccounts();
          setAccounts(accountData);
        } catch (error) {
          console.warn('Could not fetch accounts:', error);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      toast.info('Starting IBKR gateway and authentication...', {
        description: 'Please wait while we connect to IBKR services'
      });
      
      // Start the embedded gateway first
      await ibkrGateway.startEmbeddedGateway();
      
      toast.info('Opening IBKR login window...', {
        description: 'Please complete authentication and close the popup when done'
      });
      
      const result = await ibkrGateway.authenticateWithPopup();
      
      if (result) {
        // Start monitoring after successful authentication
        await ibkrGateway.startMonitoring();
        
        toast.success('Successfully authenticated with IBKR!', {
          description: 'You can now access market data and trading features'
        });
        await checkAuthStatus();
      } else {
        toast.error('Authentication failed', {
          description: 'Please try again or check your IBKR credentials'
        });
      }
    } catch (error) {
      toast.error('Login failed', {
        description: 'Please check your internet connection and try again'
      });
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await ibkrGateway.logout();
      setIsAuthenticated(false);
      setAccounts([]);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
      console.error('Logout error:', error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            IBKR Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Authentication Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Connection Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge className={isAuthenticated ? 'bg-green-500' : 'bg-gray-500'}>
                  {isAuthenticated ? (
                    <>
                      <CheckCircle className="mr-1" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1" />
                      Disconnected
                    </>
                  )}
                </Badge>
              </div>

              {accounts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium">Accounts:</span>
                  {accounts.map((account, index) => (
                    <div key={index} className="text-xs bg-muted p-2 rounded">
                      {account.id} - {account.alias || 'Trading Account'}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            {!isAuthenticated ? (
              <>
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Connecting...' : 'Login to IBKR'}
                </Button>
                <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                  <strong>Login Instructions:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Click "Login to IBKR" above</li>
                    <li>Complete authentication in the popup</li>
                    <li>The popup will close automatically</li>
                    <li>If not, close it manually and click "Check Status"</li>
                  </ol>
                </div>
              </>
            ) : (
              <>
                <Button 
                  onClick={checkAuthStatus}
                  variant="outline"
                  className="w-full"
                >
                  Refresh Status
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Logout
                </Button>
              </>
            )}
            
            {/* Manual Status Check Button (always visible) */}
            <Button 
              onClick={checkAuthStatus}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Check Status
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>For PWA Installation:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open this app in Safari on your iPhone</li>
              <li>Tap the Share button</li>
              <li>Select "Add to Home Screen"</li>
              <li>The app will work offline once installed</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
