import { MarketHours } from '@/types';

export function getMarketHours(): MarketHours {
  const now = new Date();
  const timeEST = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const hours = timeEST.getHours();
  const minutes = timeEST.getMinutes();
  const currentTime = hours * 60 + minutes;
  const day = timeEST.getDay();
  
  // Weekend
  if (day === 0 || day === 6) {
    return {
      status: 'closed',
      label: 'Market Closed - Weekend',
      isOpen: false
    };
  }
  
  // Pre-market: 4:00 AM - 9:30 AM EST
  if (currentTime >= 240 && currentTime < 570) {
    return {
      status: 'premarket',
      label: 'Early Eyes',
      isOpen: true
    };
  }
  
  // Regular hours: 9:30 AM - 4:00 PM EST  
  if (currentTime >= 570 && currentTime < 960) {
    return {
      status: 'regular',
      label: 'Intraday Trades',
      isOpen: true
    };
  }
  
  // After hours: 4:00 PM - 8:00 PM EST
  if (currentTime >= 960 && currentTime < 1200) {
    return {
      status: 'afterhours', 
      label: 'After-Hours Activity',
      isOpen: true
    };
  }
  
  // Closed
  return {
    status: 'closed',
    label: 'Market Closed',
    isOpen: false
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  }).format(price);
}

export function formatPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(1)}B`;
  }
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(1)}M`;
  }
  return `$${(marketCap / 1_000).toFixed(1)}K`;
}