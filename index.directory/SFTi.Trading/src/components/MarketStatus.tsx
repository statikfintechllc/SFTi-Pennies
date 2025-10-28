import { useEffect, useState } from 'react';
import { MarketHours } from '@/types';
import { getMarketHours } from '@/lib/market';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function MarketStatus() {
  const [marketHours, setMarketHours] = useState<MarketHours>(getMarketHours());

  useEffect(() => {
    const updateMarketStatus = () => {
      setMarketHours(getMarketHours());
    };

    // Update every minute
    const interval = setInterval(updateMarketStatus, 60_000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (marketHours.status) {
      case 'premarket':
        return 'bg-red-900/50 text-red-300 border-red-700';
      case 'regular':
        return 'bg-red-600/50 text-red-100 border-red-500';
      case 'afterhours':
        return 'bg-yellow-600/50 text-yellow-100 border-yellow-500';
      case 'closed':
        return 'bg-gray-600/50 text-gray-300 border-gray-500';
      default:
        return 'bg-gray-600/50 text-gray-300 border-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-2 w-2 rounded-full transition-colors",
        marketHours.isOpen ? "bg-green-400 animate-pulse" : "bg-gray-500"
      )} />
      <Badge 
        variant="outline" 
        className={cn(
          "text-xs font-medium transition-colors",
          getStatusColor()
        )}
      >
        {marketHours.label}
      </Badge>
    </div>
  );
}