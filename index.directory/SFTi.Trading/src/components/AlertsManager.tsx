import { useState, useEffect } from 'react';
import { PriceAlert, NotificationSettings } from '@/types';
import { alertService } from '@/lib/alerts';
import { useKV } from '@github/spark/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Custom SVG Icons
const Bell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.73 21A2 2 0 0 1 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Plus = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Trash2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21M8 6V4A2 2 0 0 1 10 2H14A2 2 0 0 1 16 4V6M19 6V20A2 2 0 0 1 17 22H7A2 2 0 0 1 5 20V6H19ZM10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Target = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const TrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Volume2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.07 4.93A10 10 0 0 1 23 12A10 10 0 0 1 19.07 19.07M15.54 8.46A5 5 0 0 1 17 12A5 5 0 0 1 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const AlertTriangle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Brain = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5C13.66 5 15 3.66 15 2C15 3.66 16.34 5 18 5C16.34 5 15 6.34 15 8C15 6.34 13.66 5 12 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22C10.34 22 9 20.66 9 19C9 20.66 7.66 22 6 22C7.66 22 9 20.66 9 19C9 17.34 10.34 16 12 16C13.66 16 15 17.34 15 19C15 20.66 13.66 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 16V5M15 8V19M9 8V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Lightbulb = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M12 3C8.686 3 6 5.686 6 9C6 11.209 7.209 13.109 9 14.17V16C9 16.552 9.448 17 10 17H14C14.552 17 15 16.552 15 16V14.17C16.791 13.109 18 11.209 18 9C18 5.686 15.314 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AlertsManagerProps {
  symbol?: string; // If provided, opens with alert for this symbol
}

export function AlertsManager({ symbol }: AlertsManagerProps) {
  const [alerts, setAlerts] = useKV<PriceAlert[]>('price-alerts', []);
  const [settings, setSettings] = useKV<NotificationSettings>('notification-settings', {
    enabled: true,
    sound: true,
    desktop: true,
    priceAlerts: true,
    volumeAlerts: true,
    newsAlerts: true
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: symbol || '',
    type: 'price_above' as PriceAlert['type'],
    value: 0
  });

  // Sync alerts with service
  useEffect(() => {
    // Load alerts into service
    alerts.forEach(alert => {
      if (!alertService.getAlerts().find(a => a.id === alert.id)) {
        alertService.addAlert(alert);
      }
    });

    // Update settings
    alertService.updateSettings(settings);
  }, [alerts, settings]);

  // Update alerts from service (when triggered) - Fixed to prevent loops
  useEffect(() => {
    const handleAlertUpdate = () => {
      const serviceAlerts = alertService.getAlerts();
      setAlerts(current => {
        const updatedAlerts = current.map(alert => {
          const serviceAlert = serviceAlerts.find(a => a.id === alert.id);
          return serviceAlert || alert;
        });
        
        // Only update if there are actual changes to prevent infinite loops
        const hasChanges = updatedAlerts.some((alert, index) => {
          const currentAlert = current[index];
          return !currentAlert || 
                 alert.triggered !== currentAlert.triggered ||
                 alert.message !== currentAlert.message;
        });
        
        return hasChanges ? updatedAlerts : current;
      });
    };

    // Listen for alert events instead of polling
    window.addEventListener('alertTriggered', handleAlertUpdate);
    return () => window.removeEventListener('alertTriggered', handleAlertUpdate);
  }, [setAlerts]);

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.value) {
      toast.error('Please fill in all fields');
      return;
    }

    const alert: Omit<PriceAlert, 'id' | 'createdAt' | 'triggered'> = {
      symbol: newAlert.symbol.toUpperCase(),
      type: newAlert.type,
      value: newAlert.value,
      enabled: true
    };

    const id = alertService.addAlert(alert);
    const fullAlert: PriceAlert = {
      ...alert,
      id,
      createdAt: new Date(),
      triggered: false
    };

    setAlerts(current => [...current, fullAlert]);
    setNewAlert({ symbol: symbol || '', type: 'price_above', value: 0 });
    toast.success('Alert created successfully');
  };

  const handleRemoveAlert = (alertId: string) => {
    alertService.removeAlert(alertId);
    setAlerts(current => current.filter(alert => alert.id !== alertId));
    toast.success('Alert removed');
  };

  const handleToggleAlert = (alertId: string, enabled: boolean) => {
    setAlerts(current => current.map(alert => 
      alert.id === alertId ? { ...alert, enabled } : alert
    ));
  };

  const handleResetAlert = (alertId: string) => {
    alertService.resetAlert(alertId);
    setAlerts(current => current.map(alert => 
      alert.id === alertId ? { ...alert, triggered: false, message: undefined } : alert
    ));
  };

  const handleClearTriggered = () => {
    alertService.clearTriggeredAlerts();
    setAlerts(current => current.filter(alert => !alert.triggered));
    toast.success('Triggered alerts cleared');
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    alertService.updateSettings(newSettings);
  };

  const getAlertIcon = (type: PriceAlert['type']) => {
    switch (type) {
      case 'price_above': return <TrendingUp size={16} />;
      case 'price_below': return <TrendingUp size={16} className="rotate-180" />;
      case 'volume_spike': return <Volume2 size={16} />;
      case 'breakout': return <Target size={16} />;
      case 'pattern_recognition': return <Brain size={16} />;
      case 'ai_signal': return <Lightbulb size={16} />;
    }
  };

  const getAlertTypeLabel = (type: PriceAlert['type']) => {
    switch (type) {
      case 'price_above': return 'Price Above';
      case 'price_below': return 'Price Below';
      case 'volume_spike': return 'Volume Spike';
      case 'breakout': return 'Breakout Pattern';
      case 'pattern_recognition': return 'Pattern Recognition';
      case 'ai_signal': return 'AI Signal';
    }
  };

  const formatAlertValue = (type: PriceAlert['type'], value: number) => {
    switch (type) {
      case 'price_above':
      case 'price_below':
        return `$${value.toFixed(4)}`;
      case 'volume_spike':
        return `${(value / 1000000).toFixed(1)}M avg`;
      case 'breakout':
        return 'Pattern';
      case 'pattern_recognition':
        return `${value}% confidence`;
      case 'ai_signal':
        return `Score: ${value}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Mobile Button */}
      <DialogTrigger asChild className="lg:hidden">
        <Button variant="outline" size="md" className="relative flex-1 max-w-[80px]">
          <span className="text-sm">Alerts</span>
          {alerts.filter(a => a.triggered).length > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs"
            >
              {alerts.filter(a => a.triggered).length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      {/* Web Button */}
      <DialogTrigger asChild className="hidden lg:inline-flex">
        <Button variant="outline" size="lg" className="gap-3 px-6 py-3 relative">
          <Bell size={24} />
          <span className="text-lg font-medium">Alerts</span>
          {alerts.length > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 px-2 py-1 text-xs">
              {alerts.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>      <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-[85vw] lg:max-w-[70vw] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg h-[80vh] flex flex-col">
        <DialogHeader className="pb-2 flex-shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            <Bell size={16} />
            Price Alerts & Notifications
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <Tabs defaultValue="alerts" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 mb-3 flex-shrink-0 h-9">
              <TabsTrigger value="alerts" className="text-sm">Alerts</TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 overflow-hidden">
              <TabsContent value="alerts" className="h-full mt-0 overflow-hidden">
                <div className="h-full flex flex-col gap-2">
                  {/* New Alert Label */}
                  <div className="flex-shrink-0">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                      <Plus size={12} />
                      New Alert
                    </div>
                  </div>

                  {/* Create New Alert - Compressed */}
                  <Card className="flex-shrink-0">
                    <CardContent className="p-2">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 items-center">
                        <div>
                          <Input
                            placeholder="AAPL"
                            value={newAlert.symbol}
                            onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                            className="font-mono text-xs h-8 px-2"
                          />
                        </div>
                        
                        <div>
                          <Select value={newAlert.type} onValueChange={(value: PriceAlert['type']) => setNewAlert(prev => ({ ...prev, type: value }))}>
                            <SelectTrigger className="text-xs h-8 px-2">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="price_above">Price Above</SelectItem>
                              <SelectItem value="price_below">Price Below</SelectItem>
                              <SelectItem value="volume_spike">Volume Spike</SelectItem>
                              <SelectItem value="breakout">Breakout Pattern</SelectItem>
                              <SelectItem value="pattern_recognition">Pattern Recognition</SelectItem>
                              <SelectItem value="ai_signal">AI Signal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                  
                        <div>
                          <Input
                            type="number"
                            step={newAlert.type.includes('price') ? '0.0001' : '1000'}
                            placeholder={newAlert.type === 'volume_spike' ? '1000000' : newAlert.type === 'breakout' ? '1' : '1.0000'}
                            value={newAlert.value || ''}
                            onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                            className="text-xs h-8 px-2"
                          />
                        </div>
                  
                        <Button onClick={handleAddAlert} className="text-xs h-8 px-3 w-full">
                          <Plus size={12} className="mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Alerts - Dynamically Expanding */}
                  <div className="flex-1 min-h-0 flex flex-col mt-1">
                    <div className="flex items-center justify-between mb-2 flex-shrink-0">
                      <h3 className="text-sm font-semibold">Active Alerts ({alerts.length})</h3>
                      {alerts.some(a => a.triggered) && (
                        <Button variant="outline" size="sm" onClick={handleClearTriggered} className="text-xs h-7 px-3">
                          Clear Triggered
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex-1 min-h-0 border border-border rounded-lg bg-card/30 overflow-hidden">
                      <div className="h-full overflow-y-auto custom-scrollbar p-2">
                        {alerts.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground h-full flex flex-col items-center justify-center">
                            <AlertTriangle size={40} className="mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">No alerts configured</p>
                            <p className="text-xs opacity-75 mt-1">Create your first alert above</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {alerts.map(alert => (
                              <div 
                                key={alert.id}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-md border text-sm transition-colors",
                                  alert.triggered ? "bg-destructive/10 border-destructive/30" : "bg-card/80 hover:bg-card"
                                )}
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={cn(
                                    "p-2 rounded-full flex-shrink-0",
                                    alert.triggered ? "bg-destructive/20 text-destructive" : "bg-muted text-muted-foreground"
                                  )}>
                                    {getAlertIcon(alert.type)}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono font-bold text-sm">{alert.symbol}</span>
                                      <Badge variant="outline" className="text-xs h-5 px-2 py-0">
                                        {getAlertTypeLabel(alert.type)}
                                      </Badge>
                                      <span className="text-muted-foreground text-sm">
                                        {formatAlertValue(alert.type, alert.value)}
                                      </span>
                                    </div>
                                    
                                    {alert.triggered && alert.message && (
                                      <p className="text-destructive mt-1 text-xs truncate">{alert.message}</p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Switch
                                    checked={alert.enabled}
                                    onCheckedChange={(enabled) => handleToggleAlert(alert.id, enabled)}
                                    className="scale-90"
                                  />
                                  
                                  {alert.triggered && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => handleResetAlert(alert.id)}
                                      className="text-xs h-7 px-2"
                                    >
                                      Reset
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleRemoveAlert(alert.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Trash2 size={12} />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="h-full mt-0 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm mb-2">General Settings</h4>
                      
                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="enabled" className="text-sm font-medium">Enable Notifications</Label>
                          <p className="text-xs text-muted-foreground">Master switch for all notifications</p>
                        </div>
                        <Switch
                          id="enabled"
                          checked={settings.enabled}
                          onCheckedChange={(checked) => handleSettingsChange('enabled', checked)}
                          className="scale-100"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="sound" className="text-sm font-medium">Sound Notifications</Label>
                          <p className="text-xs text-muted-foreground">Play sound when alerts trigger</p>
                        </div>
                        <Switch
                          id="sound"
                          checked={settings.sound}
                          onCheckedChange={(checked) => handleSettingsChange('sound', checked)}
                          disabled={!settings.enabled}
                          className="scale-100"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="desktop" className="text-sm font-medium">Desktop Notifications</Label>
                          <p className="text-xs text-muted-foreground">Show browser notifications</p>
                        </div>
                        <Switch
                          id="desktop"
                          checked={settings.desktop}
                          onCheckedChange={(checked) => handleSettingsChange('desktop', checked)}
                          disabled={!settings.enabled}
                          className="scale-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm mb-2">Alert Types</h4>
                      
                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="priceAlerts" className="text-sm font-medium">Price Alerts</Label>
                          <p className="text-xs text-muted-foreground">Enable price-based alerts</p>
                        </div>
                        <Switch
                          id="priceAlerts"
                          checked={settings.priceAlerts}
                          onCheckedChange={(checked) => handleSettingsChange('priceAlerts', checked)}
                          disabled={!settings.enabled}
                          className="scale-100"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="volumeAlerts" className="text-sm font-medium">Volume Alerts</Label>
                          <p className="text-xs text-muted-foreground">Enable volume spike alerts</p>
                        </div>
                        <Switch
                          id="volumeAlerts"
                          checked={settings.volumeAlerts}
                          onCheckedChange={(checked) => handleSettingsChange('volumeAlerts', checked)}
                          disabled={!settings.enabled}
                          className="scale-100"
                        />
                      </div>

                      <div className="flex items-center justify-between py-3 px-3 rounded border bg-card/50">
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="newsAlerts" className="text-sm font-medium">News Alerts</Label>
                          <p className="text-xs text-muted-foreground">Enable news-based alerts</p>
                        </div>
                        <Switch
                          id="newsAlerts"
                          checked={settings.newsAlerts}
                          onCheckedChange={(checked) => handleSettingsChange('newsAlerts', checked)}
                          disabled={!settings.enabled}
                          className="scale-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}