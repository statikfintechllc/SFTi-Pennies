import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { ChartData, TechnicalIndicator, ChartTimeframe } from '@/types';
import { ibkrService } from '@/lib/ibkr';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Custom SVG Icons
const TrendingUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TrendingDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 7L7 17M7 17H17M7 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Volume2 = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.07 4.93A10 10 0 0 1 23 12A10 10 0 0 1 19.07 19.07M15.54 8.46A5 5 0 0 1 17 12A5 5 0 0 1 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Target = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

interface TradingViewChartProps {
  symbol: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

const TIMEFRAMES: ChartTimeframe[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1h' },
  { value: '1d', label: '1d' }
];

const INDICATORS: TechnicalIndicator[] = [
  { id: 'ema9', name: 'EMA 9', enabled: false },
  { id: 'ema20', name: 'EMA 20', enabled: false },
  { id: 'ema50', name: 'EMA 50', enabled: false },
  { id: 'rsi', name: 'RSI (14)', enabled: false },
  { id: 'macd', name: 'MACD', enabled: false },
  { id: 'volume', name: 'Volume', enabled: true }
];

export function TradingViewChart({ symbol, currentPrice, change, changePercent }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRef = useRef<Map<string, ISeriesApi<any>>>(new Map());
  
  const [timeframe, setTimeframe] = useState<ChartTimeframe['value']>('5m');
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>(INDICATORS);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#F0F6FC',
          fontSize: 12,
          fontFamily: 'Inter, sans-serif'
        },
        grid: {
          vertLines: { color: '#374151', style: 0, visible: true },
          horzLines: { color: '#374151', style: 0, visible: true }
        },
        crosshair: {
          mode: 1,
          vertLine: {
            width: 1,
            color: '#3B82F6',
            style: 2
          },
          horzLine: {
            width: 1,
            color: '#3B82F6',
            style: 2
          }
        },
        rightPriceScale: {
          borderColor: '#374151',
          textColor: '#8B949E'
        },
        timeScale: {
          borderColor: '#374151',
          textColor: '#8B949E',
          timeVisible: true,
          secondsVisible: false
        },
        height: 400,
        width: chartContainerRef.current.clientWidth
      });

      // Create candlestick series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#059669',
        downColor: '#DC2626',
        borderUpColor: '#059669',
        borderDownColor: '#DC2626',
        wickUpColor: '#059669',
        wickDownColor: '#DC2626'
      });

      // Create volume series
      const volumeSeries = chart.addHistogramSeries({
        color: '#374151',
        priceFormat: {
          type: 'volume'
        },
        priceScaleId: 'volume'
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0
        }
      });

      chartRef.current = chart;
      candlestickSeriesRef.current = candlestickSeries;
      volumeSeriesRef.current = volumeSeries;

      // Handle resize
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({ width: chartContainerRef.current.clientWidth });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chart) {
          chart.remove();
        }
      };
    } catch (error) {
      console.error('Failed to initialize chart:', error);
      setIsLoading(false);
    }
  }, []);

  // Load historical data
  useEffect(() => {
    if (!symbol) return;

    setIsLoading(true);
    
    try {
      // Request historical data from IBKR
      ibkrService.requestHistoricalData(
        symbol,
        '', // Current time
        '1 D', // 1 day of data
        timeframe === '1d' ? '1 day' : `${timeframe.replace('m', ' mins').replace('h', ' hour')}`,
        (data: ChartData[]) => {
          if (data && data.length > 0) {
            setChartData(data);
            updateChart(data);
          } else {
            console.warn('No chart data received for', symbol);
          }
          setIsLoading(false);
        }
      );
    } catch (error) {
      console.error('Failed to load historical data:', error);
      setIsLoading(false);
    }
  }, [symbol, timeframe]);

  // Update chart with data
  const updateChart = (data: ChartData[]) => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current || !data.length) return;

    try {
      // Convert data for TradingView format
      const candlestickData: CandlestickData[] = data.map(bar => ({
        time: bar.time as Time,
        open: bar.open,
        high: bar.high,
        low: bar.low,
        close: bar.close
      }));

      const volumeData = data.map(bar => ({
        time: bar.time as Time,
        value: bar.volume,
        color: bar.close >= bar.open ? '#059669' : '#DC2626'
      }));

      candlestickSeriesRef.current.setData(candlestickData);
      volumeSeriesRef.current.setData(volumeData);

      // Add technical indicators
      updateIndicators(data);
    } catch (error) {
      console.error('Failed to update chart data:', error);
    }
  };

  // Update technical indicators
  const updateIndicators = (data: ChartData[]) => {
    if (!chartRef.current || !data.length) return;

    try {
      // Clear existing indicators
      indicatorSeriesRef.current.forEach(series => {
        try {
          chartRef.current!.removeSeries(series);
        } catch (error) {
          console.warn('Failed to remove indicator series:', error);
        }
      });
      indicatorSeriesRef.current.clear();

      indicators.filter(ind => ind.enabled).forEach(indicator => {
        try {
          switch (indicator.id) {
            case 'ema9':
              addEMA(data, 9, '#F59E0B');
              break;
            case 'ema20':
              addEMA(data, 20, '#3B82F6');
              break;
            case 'ema50':
              addEMA(data, 50, '#8B5CF6');
              break;
            case 'rsi':
              addRSI(data);
              break;
            case 'macd':
              addMACD(data);
              break;
          }
        } catch (error) {
          console.warn(`Failed to add ${indicator.id} indicator:`, error);
        }
      });
    } catch (error) {
      console.error('Failed to update indicators:', error);
    }
  };

  // Add EMA indicator
  const addEMA = (data: ChartData[], period: number, color: string) => {
    if (!chartRef.current || data.length < period) return;

    try {
      const emaData = calculateEMA(data, period);
      const emaSeries = chartRef.current.addLineSeries({
        color,
        lineWidth: 1,
        title: `EMA ${period}`
      });

      emaSeries.setData(emaData);
      indicatorSeriesRef.current.set(`ema${period}`, emaSeries);
    } catch (error) {
      console.error(`Failed to add EMA ${period}:`, error);
    }
  };

  // Add RSI indicator
  const addRSI = (data: ChartData[]) => {
    if (!chartRef.current || data.length < 15) return;

    try {
      const rsiData = calculateRSI(data, 14);
      if (!rsiData.length) return;

      const rsiSeries = chartRef.current.addLineSeries({
        color: '#F59E0B',
        lineWidth: 1,
        priceScaleId: 'rsi'
      });

      chartRef.current.priceScale('rsi').applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.8
        }
      });

      rsiSeries.setData(rsiData);
      indicatorSeriesRef.current.set('rsi', rsiSeries);
    } catch (error) {
      console.error('Failed to add RSI indicator:', error);
    }
  };

  // Add MACD indicator
  const addMACD = (data: ChartData[]) => {
    if (!chartRef.current || data.length < 26) return;

    try {
      const macdData = calculateMACD(data);
      if (!macdData.macd.length || !macdData.signal.length) return;

      const macdSeries = chartRef.current.addLineSeries({
        color: '#3B82F6',
        lineWidth: 1,
        priceScaleId: 'macd'
      });

      const signalSeries = chartRef.current.addLineSeries({
        color: '#DC2626',
        lineWidth: 1,
        priceScaleId: 'macd'
      });

      chartRef.current.priceScale('macd').applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.8
        }
      });

      macdSeries.setData(macdData.macd);
      signalSeries.setData(macdData.signal);
      indicatorSeriesRef.current.set('macd', macdSeries);
      indicatorSeriesRef.current.set('signal', signalSeries);
    } catch (error) {
      console.error('Failed to add MACD indicator:', error);
    }
  };

  // Toggle indicator
  const toggleIndicator = (indicatorId: string) => {
    setIndicators(prev => prev.map(ind => 
      ind.id === indicatorId ? { ...ind, enabled: !ind.enabled } : ind
    ));
  };

  // Calculate EMA
  const calculateEMA = (data: ChartData[], period: number) => {
    if (data.length < period) return [];
    
    const ema = [];
    const multiplier = 2 / (period + 1);
    let emaValue = data[0].close;

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        emaValue = data[i].close;
      } else {
        emaValue = (data[i].close * multiplier) + (emaValue * (1 - multiplier));
      }
      
      ema.push({
        time: data[i].time as Time,
        value: Number(emaValue.toFixed(4))
      });
    }

    return ema;
  };

  // Calculate RSI
  const calculateRSI = (data: ChartData[], period: number) => {
    if (data.length < period + 1) return [];
    
    const rsi = [];
    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);

      if (i >= period) {
        const avgGain = gains.slice(-period).reduce((sum, gain) => sum + gain, 0) / period;
        const avgLoss = losses.slice(-period).reduce((sum, loss) => sum + loss, 0) / period;
        const rs = avgGain / (avgLoss || 0.0001); // Avoid division by zero
        const rsiValue = 100 - (100 / (1 + rs));

        rsi.push({
          time: data[i].time as Time,
          value: Number(rsiValue.toFixed(2))
        });
      }
    }

    return rsi;
  };

  // Calculate MACD
  const calculateMACD = (data: ChartData[]) => {
    if (data.length < 26) return { macd: [], signal: [] };
    
    const ema12 = calculateEMA(data, 12);
    const ema26 = calculateEMA(data, 26);
    const macd = [];
    
    const minLength = Math.min(ema12.length, ema26.length);
    for (let i = 0; i < minLength; i++) {
      macd.push({
        time: ema12[i].time,
        value: Number((ema12[i].value - ema26[i].value).toFixed(4))
      });
    }

    // For signal line calculation
    const macdData: ChartData[] = macd.map((m, i) => ({ 
      time: m.time as number,
      open: m.value,
      high: m.value,
      low: m.value,
      close: m.value,
      volume: 0
    }));
    
    const signal = calculateEMA(macdData, 9);

    return { macd, signal };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chart Header */}
      <Card className="m-6 mb-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl font-mono">{symbol}</CardTitle>
              {currentPrice && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">${currentPrice.toFixed(4)}</span>
                  {change !== undefined && changePercent !== undefined && (
                    <Badge 
                      variant={change >= 0 ? "default" : "destructive"}
                      className={cn(
                        "flex items-center gap-1",
                        change >= 0 ? "bg-success text-success-foreground" : ""
                      )}
                    >
                      {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {change >= 0 ? '+' : ''}{change.toFixed(4)} ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={timeframe} onValueChange={setTimeframe as any}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEFRAMES.map(tf => (
                    <SelectItem key={tf.value} value={tf.value}>
                      {tf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {indicators.map(indicator => (
              <Button
                key={indicator.id}
                variant={indicator.enabled ? "default" : "outline"}
                size="sm"
                onClick={() => toggleIndicator(indicator.id)}
                className="text-xs"
              >
                {indicator.id === 'volume' && <Volume2 size={14} className="mr-1" />}
                {indicator.id === 'rsi' && <Target size={14} className="mr-1" />}
                {indicator.name}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Chart Container */}
      <CardContent className="flex-1 m-6 mt-0 p-6 pt-0">
        <div className="relative h-full">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading chart data...</p>
              </div>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      </CardContent>
    </div>
  );
}