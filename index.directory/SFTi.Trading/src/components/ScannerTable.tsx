import { useState, useEffect } from 'react';
import { Stock } from '@/types';
import { formatPrice, formatPercent, formatVolume, formatMarketCap } from '@/lib/market';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Custom SVG Icons
const TrendingUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const News = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 22H20A2 2 0 0 0 22 20V4A2 2 0 0 0 20 2H8A2 2 0 0 0 6 4V16A2 2 0 0 1 4 18Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 18H4A2 2 0 0 1 2 16V7A1 1 0 0 1 3 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 14H10M15 18H10M10 6H18V10H10V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface ScannerTableProps {
  stocks: Stock[];
  onStockSelect: (symbol: string) => void;
}

type SortField = 'symbol' | 'changePercent' | 'price' | 'volume' | 'float' | 'marketCap';
type SortDirection = 'asc' | 'desc';

export function ScannerTable({ stocks, onStockSelect }: ScannerTableProps) {
  const [sortField, setSortField] = useState<SortField>('changePercent');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [flashingCells, setFlashingCells] = useState<Record<string, 'up' | 'down'>>({});

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortField) {
      case 'symbol':
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case 'changePercent':
        aVal = a.changePercent;
        bVal = b.changePercent;
        break;
      case 'price':
        aVal = a.price;
        bVal = b.price;
        break;
      case 'volume':
        aVal = a.volume;
        bVal = b.volume;
        break;
      case 'float':
        aVal = a.float;
        bVal = b.float;
        break;
      case 'marketCap':
        aVal = a.marketCap;
        bVal = b.marketCap;
        break;
      default:
        aVal = a.symbol;
        bVal = b.symbol;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === 'asc' 
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  // Track price changes for flash effect
  useEffect(() => {
    const newFlashing: Record<string, 'up' | 'down'> = {};
    
    stocks.forEach(stock => {
      if (stock.change > 0) {
        newFlashing[stock.symbol] = 'up';
      } else if (stock.change < 0) {
        newFlashing[stock.symbol] = 'down';
      }
    });

    setFlashingCells(newFlashing);
    
    // Clear flash effect after animation
    const timer = setTimeout(() => {
      setFlashingCells({});
    }, 500);

    return () => clearTimeout(timer);
  }, [stocks]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <TrendingUp size={12} /> : <TrendingDown size={12} />
        )}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto overflow-y-visible scrollbar-hide touch-scroll">
      <table className="w-full min-w-[800px]">
        <thead className="border-b border-border sticky top-0 bg-background">
          <tr>
            <SortableHeader field="symbol">Ticker</SortableHeader>
            <SortableHeader field="changePercent">Chg%</SortableHeader>
            <SortableHeader field="price">Last Price</SortableHeader>
            <SortableHeader field="volume">Volume</SortableHeader>
            <SortableHeader field="float">Float</SortableHeader>
            <SortableHeader field="marketCap">Market Cap</SortableHeader>
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              News
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sortedStocks.map((stock) => (
            <tr 
              key={stock.symbol}
              className="hover:bg-muted/50 transition-colors cursor-pointer"
              onClick={() => onStockSelect(stock.symbol)}
            >
              <td className="px-3 py-3">
                <div>
                  <div className="font-mono font-semibold text-foreground">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {stock.name}
                  </div>
                </div>
              </td>
              <td className={cn(
                "px-3 py-3 font-mono font-semibold transition-colors duration-200",
                stock.changePercent >= 0 ? "text-success" : "text-destructive",
                flashingCells[stock.symbol] === 'up' && "price-flash-up",
                flashingCells[stock.symbol] === 'down' && "price-flash-down"
              )}>
                {formatPercent(stock.changePercent)}
              </td>
              <td className={cn(
                "px-3 py-3 font-mono transition-colors duration-200",
                flashingCells[stock.symbol] === 'up' && "price-flash-up",
                flashingCells[stock.symbol] === 'down' && "price-flash-down"
              )}>
                {formatPrice(stock.price)}
              </td>
              <td className="px-3 py-3 font-mono text-muted-foreground">
                {formatVolume(stock.volume)}
              </td>
              <td className="px-3 py-3 font-mono text-muted-foreground">
                {formatVolume(stock.float)}
              </td>
              <td className="px-3 py-3 font-mono text-muted-foreground">
                {formatMarketCap(stock.marketCap)}
              </td>
              <td className="px-3 py-3">
                {stock.news > 0 ? (
                  <div className="flex items-center gap-1">
                    <News size={16} className="text-accent" />
                    <span className="text-xs font-medium text-accent">
                      {stock.news}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}