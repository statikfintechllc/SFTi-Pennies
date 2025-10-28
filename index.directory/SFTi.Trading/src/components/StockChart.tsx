import { IBKRChart } from './IBKRChart';

interface StockChartProps {
  symbol: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

export function StockChart({ symbol, currentPrice, change, changePercent }: StockChartProps) {
  return (
    <IBKRChart 
      symbol={symbol}
      currentPrice={currentPrice}
      change={change}
      changePercent={changePercent}
    />
  );
}