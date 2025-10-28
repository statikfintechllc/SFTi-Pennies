import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Stock } from '@/types';
import { cn } from '@/lib/utils';

interface TabSelectorProps {
  stocks: Stock[];
  onStockSelect: (symbol: string) => void;
  onCreateEmptyTab?: () => void;
  openTabSymbols: string[];
}

export function TabSelector({ stocks, onStockSelect, onCreateEmptyTab, openTabSymbols }: TabSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter stocks that aren't already open and match search
  const availableStocks = stocks.filter(stock => 
    !openTabSymbols.includes(stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStockSelect = (symbol: string) => {
    onStockSelect(symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateEmptyTab = () => {
    if (onCreateEmptyTab) {
      onCreateEmptyTab();
      setIsOpen(false);
    }
  };

  const handleSearch = () => {
    // Focus search behavior - could add additional search functionality here if needed
    // For now, the search is already reactive through the input onChange
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="px-3 py-2 border-l border-border rounded-none hover:bg-muted/50 flex-shrink-0"
          title="Add new chart tab"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-[90vw] w-[90vw] h-[75vh] lg:max-w-2xl lg:w-[700px] lg:h-auto flex flex-col p-4">
        <DialogHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-center">
            <DialogTitle className="text-sm lg:text-base">Add Chart Tab</DialogTitle>
            {onCreateEmptyTab && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCreateEmptyTab}
                className="flex items-center gap-1.5 px-2 py-1 h-7 text-xs ml-4"
                title="Create empty chart tab"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14m-7-7h14" />
                </svg>
                <span className="hidden sm:inline">Empty Tab</span>
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-3 flex-1 min-h-0">
          {/* Search */}
          <div className="relative flex gap-2 flex-shrink-0">
            <div className="relative flex-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <Input
                placeholder="Search stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSearch}
              className="flex items-center gap-1.5 px-3 py-2 h-10 flex-shrink-0"
              title="Search stocks"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span className="hidden sm:inline text-sm">Search</span>
            </Button>
          </div>

          {/* Stock List */}
          <ScrollArea className="h-48 lg:h-64 flex-1">
            <div className="space-y-1 pr-2">
              {availableStocks.length > 0 ? (
                availableStocks.slice(0, 50).map((stock) => (
                  <div
                    key={stock.symbol}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors",
                      "hover:bg-muted/50 border border-transparent hover:border-border"
                    )}
                    onClick={() => handleStockSelect(stock.symbol)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{stock.symbol}</span>
                        <Badge 
                          variant={stock.changePercent >= 0 ? "default" : "destructive"}
                          className={cn(
                            "text-xs",
                            stock.changePercent >= 0 ? "bg-success text-success-foreground" : ""
                          )}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {stock.name}
                      </div>
                    </div>
                    
                    <div className="text-right text-sm">
                      <div className="font-medium">${stock.price.toFixed(4)}</div>
                      <div className="text-xs text-muted-foreground">
                        {(stock.volume / 1000000).toFixed(1)}M vol
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {searchQuery ? 'No stocks found matching your search' : 'All stocks already have open tabs'}
                </div>
              )}
            </div>
          </ScrollArea>

          {availableStocks.length > 50 && (
            <div className="text-xs text-muted-foreground text-center">
              Showing first 50 results. Use search to narrow down.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}