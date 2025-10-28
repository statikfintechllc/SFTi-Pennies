import { useState, useEffect } from 'react';
import { Stock, ScannerFilters, Tab } from '@/types';
import { getMarketHours } from '@/lib/market';
import { alertService } from '@/lib/alerts';
import { ibkrGateway } from '@/lib/ibkr-gateway-browser';
import { useKV } from '@github/spark/hooks';
import { ScannerTable } from '@/components/ScannerTable';
import { FilterPanel } from '@/components/FilterPanel';
import { MarketStatus } from '@/components/MarketStatus';
import { TabSystem } from '@/components/TabSystem';
import { StockChart } from '@/components/StockChart';
import { AlertsManager } from '@/components/AlertsManager';
import { IBKRSettings } from '@/components/IBKRSettingsBrowser';
import { AISearch } from '@/components/AISearch';
import { MarketInsights } from '@/components/MarketInsights';
import { SFTiTop10 } from '@/components/SFTiTop10';
import { Footer } from '@/components/Footer';
import { OfflineBanner } from '@/components/OfflineBanner';
import { Toaster, toast } from 'sonner';
import { cn } from '@/lib/utils';
import iconImg from '@/assets/images/icon.png';

const DEFAULT_FILTERS: ScannerFilters = {
  priceMin: 0.01,
  priceMax: 5.00,
  marketCapMin: 1_000_000,
  marketCapMax: 2_000_000_000,
  floatMin: 1_000_000,
  floatMax: 1_000_000_000,
  volumeMin: 100_000,
  changeMin: -100,
  changeMax: 100,
  newsOnly: false
};

function App() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [filters, setFilters] = useKV<ScannerFilters>('scanner-filters', DEFAULT_FILTERS);
  const [tabs, setTabs] = useKV<Tab[]>('scanner-tabs-v2', [
    { id: 'sfti_top10', type: 'sfti_top10', title: 'AI Picks' },
    { id: 'scanner', type: 'scanner', title: 'Scanner' }
  ]);
  const [activeTabId, setActiveTabId] = useKV<string>('active-tab-v2', 'sfti_top10');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure tabs are properly initialized
  useEffect(() => {
    const correctTabs = [
      { id: 'sfti_top10', type: 'sfti_top10', title: 'AI Picks' },
      { id: 'scanner', type: 'scanner', title: 'Scanner' }
    ];
    
    if (tabs.length !== 2 || !tabs.find(t => t.id === 'sfti_top10') || !tabs.find(t => t.id === 'scanner')) {
      console.log('Resetting tabs to correct order');
      setTabs(correctTabs);
    }
  }, []);

  // Initialize IBKR connection and data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check for existing IBKR session
        const status = await ibkrGateway.getConnectionStatus();
        if (status.authenticated) {
          console.log('IBKR already authenticated');
          setStocks([]);
        } else {
          console.log('IBKR authentication required');
          setError('IBKR authentication required - Click Settings to login');
          setStocks([]);
        }
      } catch (error) {
        console.warn('IBKR initialization error:', error);
        setError('IBKR connection failed - running in demo mode');
        setStocks([]);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  // Real-time updates from IBKR
  useEffect(() => {
    if (loading || stocks.length === 0) return;

    const marketHours = getMarketHours();
    const updateInterval = marketHours.isOpen ? 3000 : 30000;

    const interval = setInterval(async () => {
      try {
        const symbols = stocks.map(s => s.symbol);
        if (symbols.length > 0) {
          const updatedStocks = await ibkrService.getMarketData(symbols);
          setStocks(updatedStocks);
          alertService.checkAlerts(updatedStocks);
        }
      } catch (error) {
        console.warn('Failed to update market data:', error);
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [stocks.length, loading]);

  // Listen for chart open events from alerts
  useEffect(() => {
    const handleOpenChart = (event: CustomEvent) => {
      const { symbol } = event.detail;
      handleStockSelect(symbol);
    };

    window.addEventListener('openChart', handleOpenChart as EventListener);
    return () => window.removeEventListener('openChart', handleOpenChart as EventListener);
  }, []);

  // Apply filters
  useEffect(() => {
    const filtered = stocks.filter(stock => {
      if (stock.price < filters.priceMin || stock.price > filters.priceMax) return false;
      if (stock.marketCap < filters.marketCapMin || stock.marketCap > filters.marketCapMax) return false;
      if (stock.float < filters.floatMin || stock.float > filters.floatMax) return false;
      if (stock.volume < filters.volumeMin) return false;
      if (stock.changePercent < filters.changeMin || stock.changePercent > filters.changeMax) return false;
      if (filters.newsOnly && stock.news === 0) return false;
      return true;
    });
    
    setFilteredStocks(filtered);
  }, [stocks, filters]);

  // Market hours theme
  const marketHours = getMarketHours();
  const getMarketThemeClass = () => {
    switch (marketHours.status) {
      case 'premarket':
        return 'market-premarket';
      case 'regular':
        return 'market-regular';
      case 'afterhours':
        return 'market-afterhours';
      case 'closed':
        return 'market-closed';
      default:
        return 'market-closed';
    }
  };

  const handleStockSelect = (symbol: string) => {
    const existingTab = tabs.find(tab => tab.symbol === symbol);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    if (tabs.length >= 6) {
      toast.error('Maximum 6 tabs allowed. Close a tab to open a new one.');
      return;
    }

    const newTab: Tab = {
      id: `chart-${symbol}-${Date.now()}`,
      type: 'chart',
      title: symbol,
      symbol
    };

    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleTabClose = (tabId: string) => {
    if (tabId === 'scanner' || tabId === 'sfti_top10') return;

    setTabs(prevTabs => {
      const newTabs = prevTabs.filter(tab => tab.id !== tabId);
      
      if (activeTabId === tabId) {
        setActiveTabId('sfti_top10');
      }
      
      return newTabs;
    });
  };

  const handleAddTab = (symbol: string) => {
    handleStockSelect(symbol);
  };

  const handleAddEmptyTab = () => {
    if (tabs.length >= 6) {
      toast.error('Maximum 6 tabs allowed. Close a tab to open a new one.');
      return;
    }

    const newTab: Tab = {
      id: `chart-empty-${Date.now()}`,
      type: 'chart',
      title: 'Empty Chart',
      // No symbol property - creates an empty chart tab
    };

    setTabs(prevTabs => [...prevTabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const currentStock = activeTab?.symbol ? stocks.find(s => s.symbol === activeTab.symbol) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Initializing IBKR connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "h-screen bg-background text-foreground transition-colors duration-300 flex flex-col",
      getMarketThemeClass()
    )}>
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur flex-shrink-0">
        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between px-6 py-3">
          {/* Left Section: Logo, Title, Market Status */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={iconImg} alt="SFTi" className="w-8 h-8 flex-shrink-0" />
              <h1 className="text-xl font-bold font-mono whitespace-nowrap -ml-1">SFTi Stock Scanner</h1>
            </div>
            <div className="-ml-2">
              <MarketStatus />
            </div>
            {error && (
              <div className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded whitespace-nowrap">
                {error}
              </div>
            )}
          </div>
          
          {/* Center Section: Stock Count */}
          <div className="flex-1 flex justify-center">
            <div className="text-sm text-muted-foreground whitespace-nowrap -ml-1">
              {filteredStocks.length} stocks • Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-3">
            <AISearch stocks={filteredStocks} onStockSelect={handleStockSelect} />
            <MarketInsights stocks={filteredStocks} />
            <AlertsManager />
            <IBKRSettings />
          </div>
        </div>

        {/* Mobile Layout - Stacked */}
        <div className="sm:hidden px-4 py-2">
          {/* Top Row: Logo + Title + Market Status */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src={iconImg} alt="SFTi" className="w-6 h-6" />
              <h1 className="text-lg font-bold font-mono">SFTi Stock Scanner</h1>
            </div>
            <MarketStatus />
          </div>
          
          {/* Middle Row: Stock Count + Update Time (Combined) */}
          <div className="flex justify-center mb-2">
            <div className="text-xs text-muted-foreground text-center">
              {filteredStocks.length} stocks • Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Bottom Row: Action Buttons (Smaller) */}
          <div className="flex items-center justify-center gap-1 scale-75">
            <AISearch stocks={filteredStocks} onStockSelect={handleStockSelect} />
            <MarketInsights stocks={filteredStocks} />
            <AlertsManager />
            <IBKRSettings />
          </div>
          
          {error && (
            <div className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded mt-2">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Tabs */}
      <TabSystem
        tabs={tabs}
        activeTabId={activeTabId}
        onTabChange={setActiveTabId}
        onTabClose={handleTabClose}
        onAddTab={handleAddTab}
        onAddEmptyTab={handleAddEmptyTab}
        stocks={filteredStocks}
        maxTabs={6}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {activeTab?.type === 'sfti_top10' ? (
            <SFTiTop10 stocks={filteredStocks} onStockSelect={handleStockSelect} />
          ) : activeTab?.type === 'scanner' ? (
            <div className="h-full flex flex-col">
              <div className="p-3 pb-1 flex-shrink-0">
                <FilterPanel 
                  filters={filters} 
                  onFiltersChange={setFilters}
                />
              </div>
              <div className="flex-1 min-h-0 px-3 pb-3">
                <div className="h-full border border-border rounded-lg overflow-hidden">
                  <div className="h-full overflow-auto">
                    <ScannerTable 
                      stocks={filteredStocks}
                      onStockSelect={handleStockSelect}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="flex-1">
                {activeTab?.symbol ? (
                  <StockChart 
                    symbol={activeTab.symbol}
                    currentPrice={currentStock?.price}
                    change={currentStock?.change}
                    changePercent={currentStock?.changePercent}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-card/50">
                    <div className="text-center text-muted-foreground">
                      <div className="text-4xl mb-4">📈</div>
                      <h3 className="text-lg font-medium mb-2">Empty Chart Tab</h3>
                      <p className="text-sm">Select a stock from the Scanner or AI Picks to view its chart</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <Footer />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        theme="dark"
        richColors
        expand={true}
        duration={4000}
      />
    </div>
  );
}

export default App;