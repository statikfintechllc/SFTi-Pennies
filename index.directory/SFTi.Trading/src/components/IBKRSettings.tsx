import { useState, useEffect } from 'react';
import { IBKRConnection } from '@/types';
import { ibkrBrowserService } from '@/lib/ibkr-browser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Custom SVG Icons
const CheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const XCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Globe = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12H22M12 2C14.5 4.5 16 8.2 16 12C16 15.8 14.5 19.5 12 22C9.5 19.5 8 15.8 8 12C8 8.2 9.5 4.5 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Settings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.22 2H11.78C11.24 2 10.8 2.44 10.8 2.98V4.18C10.8 4.72 10.36 5.16 9.82 5.16C9.41 5.16 9.04 4.91 8.86 4.53L8.14 3.07C7.86 2.47 7.14 2.22 6.54 2.5L6.32 2.61C5.72 2.89 5.47 3.61 5.75 4.21L6.47 5.67C6.75 6.27 6.5 7 5.9 7.28C5.73 7.37 5.54 7.42 5.34 7.42H3.98C3.44 7.42 3 7.86 3 8.4V8.6C3 9.14 3.44 9.58 3.98 9.58H5.34C5.88 9.58 6.32 10.02 6.32 10.56C6.32 10.97 6.07 11.34 5.69 11.52L4.23 12.24C3.63 12.52 3.38 13.24 3.66 13.84L3.77 14.06C4.05 14.66 4.77 14.91 5.37 14.63L6.83 13.91C7.43 13.63 8.16 13.88 8.44 14.48C8.53 14.65 8.58 14.84 8.58 15.04V16.4C8.58 16.94 9.02 17.38 9.56 17.38H9.76C10.3 17.38 10.74 16.94 10.74 16.4V15.04C10.74 14.5 11.18 14.06 11.72 14.06C12.13 14.06 12.5 14.31 12.68 14.69L13.4 16.15C13.68 16.75 14.4 17 15 16.72L15.22 16.61C15.82 16.33 16.07 15.61 15.79 15.01L15.07 13.55C14.79 12.95 15.04 12.22 15.64 11.94C15.81 11.85 16 11.8 16.2 11.8H17.56C18.1 11.8 18.54 11.36 18.54 10.82V10.62C18.54 10.08 18.1 9.64 17.56 9.64H16.2C15.66 9.64 15.22 9.2 15.22 8.66C15.22 8.25 15.47 7.88 15.85 7.7L17.31 6.98C17.91 6.7 18.16 5.98 17.88 5.38L17.77 5.16C17.49 4.56 16.77 4.31 16.17 4.59L14.71 5.31C14.11 5.59 13.38 5.34 13.1 4.74C13.01 4.57 12.96 4.38 12.96 4.18V2.82C12.96 2.28 12.52 1.84 11.98 1.84Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const RefreshCw = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12A9 9 0 0 0 21 12A9 9 0 0 0 3 12ZM21 12A9 9 0 0 1 3 12M21 12V17M21 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignOut = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H9M16 17L21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Warning = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Info = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export function IBKRSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [connection, setConnection] = useState<IBKRConnection>({
    host: 'localhost',
    port: 5000,
    clientId: 1,
    connected: false,
    status: 'disconnected'
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Update connection status
  useEffect(() => {
    const interval = setInterval(() => {
      const currentConnection = ibkrService.getConnection();
      setConnection(currentConnection);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    try {
      toast.info('Connecting to IBKR Client Portal Gateway...');
      const result = await ibkrService.connect();
      
      if (result.connected) {
        toast.success('Successfully connected to IBKR Gateway!');
      } else if (result.status === 'authentication_required') {
        toast.warning('Manual authentication required - please check the instructions');
        setShowInstructions(true);
      } else {
        toast.error('IBKR Gateway connection failed - ensure Gateway is running on port 5000');
        setShowInstructions(true);
      }
      
      setConnection(result);
    } catch (error) {
      console.error('IBKR connection error:', error);
      toast.error('Failed to connect to IBKR Gateway');
      setShowInstructions(true);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    ibkrService.disconnect();
    toast.success('Disconnected from IBKR Gateway');
  };

  const openGatewayAuth = () => {
    window.open('https://localhost:5000', '_blank');
    toast.info('Gateway authentication page opened - please log in and return');
  };

  const getStatusIcon = () => {
    switch (connection.status) {
      case 'connected':
        return <CheckCircle size={16} className="text-success" />;
      case 'connecting':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      case 'authentication_required':
        return <Warning size={16} className="text-warning" />;
      case 'error':
        return <XCircle size={16} className="text-destructive" />;
      default:
        return <Globe size={16} className="text-muted-foreground" />;
    }
  };

  const getStatusColor = () => {
    switch (connection.status) {
      case 'connected':
        return 'bg-success text-success-foreground';
      case 'connecting':
        return 'bg-blue-500 text-white';
      case 'authentication_required':
        return 'bg-warning text-warning-foreground';
      case 'error':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (connection.status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'authentication_required':
        return 'Auth Required';
      case 'error':
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Button */}
      <DialogTrigger asChild className="lg:hidden">
        <Button variant="outline" size="md" className="relative flex-1 max-w-[75px]">
          <span className="text-sm">IBKR</span>
          <Badge 
            className={cn("absolute -top-1 -right-1 h-4 px-1 text-xs", getStatusColor())}
          >
            {connection.status === 'connected' ? '●' : '○'}
          </Badge>
        </Button>
      </DialogTrigger>
      
      {/* Web Button */}
            {/* Web Button */}
      <DialogTrigger asChild className="hidden lg:inline-flex">
        <Button variant="outline" size="lg" className="gap-3 px-6 py-3 relative">
          <Globe size={24} />
          <span className="text-lg font-medium">IBKR</span>
          <Badge 
            variant={connection.connected ? "secondary" : "destructive"} 
            className="absolute -top-2 -right-2 px-2 py-1 text-xs"
          >
            {connection.connected ? "ON" : "OFF"}
          </Badge>
        </Button>
      </DialogTrigger>      <DialogContent className="max-w-[90vw] w-[90vw] h-[80vh] overflow-hidden flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-3">
          <DialogTitle className="text-base flex items-center gap-2">
            <Settings size={16} />
            IBKR Client Portal Gateway
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          <div className="space-y-4 max-w-4xl">
            {/* Connection Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Globe size={16} />
                  Gateway Connection Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status:</span>
                  <Badge className={cn("text-xs px-2 py-1", getStatusColor())}>
                    {getStatusIcon()}
                    <span className="ml-1">{getStatusLabel()}</span>
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Gateway URL:</span>
                  <span className="font-mono text-xs">https://localhost:5000</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Trading Mode:</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Paper Trading</span>
                </div>
                
                {connection.connected && (
                  <div className="p-2 rounded-lg bg-success/10 border border-success/50">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle size={14} />
                      <span className="font-semibold text-xs">Connected to Gateway</span>
                    </div>
                    <p className="text-xs mt-1">{ibkrService.getConnectionStatus()}</p>
                  </div>
                )}

                {connection.status === 'authentication_required' && (
                  <div className="p-2 rounded-lg bg-warning/10 border border-warning/50">
                    <div className="flex items-center gap-2 text-warning">
                      <Warning size={14} />
                      <span className="font-semibold text-xs">Authentication Required</span>
                    </div>
                    <p className="text-xs mt-1">Please authenticate with IBKR through the browser</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 text-xs" 
                      onClick={openGatewayAuth}
                    >
                      Open Gateway Login
                    </Button>
                  </div>
                )}
                
                {connection.status === 'error' && (
                  <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/50">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle size={14} />
                      <span className="font-semibold text-xs">Gateway Not Running</span>
                    </div>
                    <p className="text-xs mt-1">Client Portal Gateway is not running on port 5000</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gateway Setup Instructions */}
            {(showInstructions || connection.status === 'error') && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info size={16} />
                    Setup Instructions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        � Client Portal Gateway Setup
                      </h4>
                      <div className="text-xs text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>1.</strong> Download Client Portal Gateway from IBKR website</p>
                        <p><strong>2.</strong> Extract and run: <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">bin/run.sh</code> or <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">bin/run.bat</code></p>
                        <p><strong>3.</strong> Gateway will start on <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">https://localhost:5000</code></p>
                        <p><strong>4.</strong> Open browser to <code className="bg-blue-200 dark:bg-blue-800 px-1 rounded">https://localhost:5000</code> and log in</p>
                        <p><strong>5.</strong> Return here and click "Connect to IBKR"</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                      <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">
                        📱 iPhone 16 Pro Deployment
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        For mobile deployment, run the Gateway on a local network server or cloud instance 
                        accessible from your iPhone. Update the gateway URL in the configuration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Technical Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">Gateway Host:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">localhost:5000</code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">Protocol:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">HTTPS + WebSocket</code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">Authentication:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">Browser-based SSO</code>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded border">
                    <span className="text-sm">Real-time Data:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">WebSocket Streaming</code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs px-4"
              >
                Close
              </Button>
              
              <div className="flex gap-2">
                {connection.status === 'authentication_required' && (
                  <Button 
                    onClick={openGatewayAuth}
                    variant="outline"
                    size="sm"
                    className="text-xs px-4"
                  >
                    <Globe size={14} className="mr-2" />
                    Open Gateway
                  </Button>
                )}
                
                {!connection.connected ? (
                  <Button 
                    onClick={handleConnect}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-xs px-6"
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw size={14} className="mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Globe size={14} className="mr-2" />
                        Connect to IBKR
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleDisconnect}
                    variant="outline"
                    size="sm"
                    className="text-xs px-4"
                  >
                    <SignOut size={14} className="mr-2" />
                    Disconnect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}