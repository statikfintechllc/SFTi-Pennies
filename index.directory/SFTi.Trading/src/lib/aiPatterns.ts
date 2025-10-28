import { Stock, PatternAnalysis, RealTimePattern, AIRecommendation, AIMarketScan } from '@/types';
import { ChartData } from '@/types';

export class AIPatternService {
  private patternHistory: Map<string, PatternAnalysis[]> = new Map();
  private activePatterns: Map<string, RealTimePattern[]> = new Map();

  // Pattern recognition algorithms
  private detectBullishPatterns(chartData: ChartData[], stock: Stock): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    
    if (chartData.length < 20) return patterns;

    // Bull Flag Pattern
    if (this.detectBullFlag(chartData)) {
      patterns.push({
        pattern: 'Bull Flag',
        confidence: 0.78,
        description: 'Strong uptrend followed by consolidation, indicating potential continuation',
        timeframe: '15m',
        signals: ['Volume confirmation', 'Price above key moving averages', 'RSI bullish divergence']
      });
    }

    // Ascending Triangle
    if (this.detectAscendingTriangle(chartData)) {
      patterns.push({
        pattern: 'Ascending Triangle',
        confidence: 0.72,
        description: 'Higher lows with resistance at same level, bullish breakout expected',
        timeframe: '30m',
        signals: ['Higher lows trend', 'Resistance test', 'Volume building']
      });
    }

    // Cup and Handle
    if (this.detectCupAndHandle(chartData)) {
      patterns.push({
        pattern: 'Cup and Handle',
        confidence: 0.85,
        description: 'Classic bullish continuation pattern with high success rate',
        timeframe: '1h',
        signals: ['U-shaped recovery', 'Handle formation', 'Volume spike on breakout']
      });
    }

    // Volume Spike with Price Momentum
    if (this.detectVolumeMomentum(chartData, stock)) {
      patterns.push({
        pattern: 'Volume Breakout',
        confidence: 0.68,
        description: 'Unusual volume spike with price momentum indicating institutional interest',
        timeframe: '5m',
        signals: ['3x average volume', 'Price above VWAP', 'Level 2 buying pressure']
      });
    }

    return patterns;
  }

  private detectBearishPatterns(chartData: ChartData[], stock: Stock): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];
    
    if (chartData.length < 20) return patterns;

    // Head and Shoulders
    if (this.detectHeadAndShoulders(chartData)) {
      patterns.push({
        pattern: 'Head and Shoulders',
        confidence: 0.82,
        description: 'Classic reversal pattern indicating potential downtrend',
        timeframe: '30m',
        signals: ['Three peaks formation', 'Neckline break', 'Volume confirmation']
      });
    }

    // Descending Triangle
    if (this.detectDescendingTriangle(chartData)) {
      patterns.push({
        pattern: 'Descending Triangle',
        confidence: 0.75,
        description: 'Lower highs with support at same level, bearish breakdown likely',
        timeframe: '15m',
        signals: ['Lower highs trend', 'Support test', 'Decreasing volume']
      });
    }

    return patterns;
  }

  // Individual pattern detection methods
  private detectBullFlag(chartData: ChartData[]): boolean {
    if (chartData.length < 15) return false;
    
    const recent = chartData.slice(-15);
    const trend = chartData.slice(-30, -15);
    
    // Check for strong uptrend before flag
    const trendUp = trend.every((candle, i) => i === 0 || candle.close > trend[i-1].close * 0.98);
    
    // Check for sideways/slight down movement (flag)
    const flagRange = recent.reduce((acc, candle) => {
      acc.high = Math.max(acc.high, candle.high);
      acc.low = Math.min(acc.low, candle.low);
      return acc;
    }, { high: 0, low: Infinity });
    
    const flagConsolidation = (flagRange.high - flagRange.low) / flagRange.low < 0.05;
    
    return trendUp && flagConsolidation;
  }

  private detectAscendingTriangle(chartData: ChartData[]): boolean {
    if (chartData.length < 20) return false;
    
    const recent = chartData.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    // Check for consistent resistance level
    const resistanceLevel = Math.max(...highs);
    const resistanceTests = highs.filter(h => Math.abs(h - resistanceLevel) / resistanceLevel < 0.02).length;
    
    // Check for higher lows
    const recentLows = lows.slice(-10);
    const higherLows = recentLows.slice(1).every((low, i) => low >= recentLows[i] * 0.98);
    
    return resistanceTests >= 3 && higherLows;
  }

  private detectCupAndHandle(chartData: ChartData[]): boolean {
    if (chartData.length < 50) return false;
    
    const data = chartData.slice(-50);
    const prices = data.map(c => c.close);
    
    // Simplified cup detection - U-shaped recovery
    const midPoint = Math.floor(prices.length / 2);
    const leftSide = prices.slice(0, midPoint);
    const rightSide = prices.slice(midPoint);
    
    const leftHigh = Math.max(...leftSide);
    const bottom = Math.min(...prices);
    const rightHigh = Math.max(...rightSide);
    
    const cupDepth = (leftHigh - bottom) / leftHigh;
    const cupSymmetry = Math.abs(leftHigh - rightHigh) / leftHigh;
    
    return cupDepth > 0.12 && cupDepth < 0.35 && cupSymmetry < 0.05;
  }

  private detectHeadAndShoulders(chartData: ChartData[]): boolean {
    if (chartData.length < 30) return false;
    
    const data = chartData.slice(-30);
    const highs = data.map(c => c.high);
    
    // Find three peaks
    const peaks = this.findPeaks(highs);
    if (peaks.length < 3) return false;
    
    const [leftShoulder, head, rightShoulder] = peaks.slice(-3);
    
    // Head should be higher than shoulders
    const headHigher = highs[head] > highs[leftShoulder] && highs[head] > highs[rightShoulder];
    
    // Shoulders should be approximately equal
    const shouldersEqual = Math.abs(highs[leftShoulder] - highs[rightShoulder]) / highs[leftShoulder] < 0.05;
    
    return headHigher && shouldersEqual;
  }

  private detectDescendingTriangle(chartData: ChartData[]): boolean {
    if (chartData.length < 20) return false;
    
    const recent = chartData.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    // Check for consistent support level
    const supportLevel = Math.min(...lows);
    const supportTests = lows.filter(l => Math.abs(l - supportLevel) / supportLevel < 0.02).length;
    
    // Check for lower highs
    const recentHighs = highs.slice(-10);
    const lowerHighs = recentHighs.slice(1).every((high, i) => high <= recentHighs[i] * 1.02);
    
    return supportTests >= 3 && lowerHighs;
  }

  private detectVolumeMomentum(chartData: ChartData[], stock: Stock): boolean {
    if (chartData.length < 10) return false;
    
    const recent = chartData.slice(-10);
    const avgVolume = recent.slice(0, -1).reduce((sum, c) => sum + c.volume, 0) / (recent.length - 1);
    const currentVolume = recent[recent.length - 1].volume;
    
    const volumeSpike = currentVolume > avgVolume * 2;
    const priceUp = stock.changePercent > 2;
    
    return volumeSpike && priceUp;
  }

  private findPeaks(data: number[]): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push(i);
      }
    }
    
    return peaks;
  }

  // Real-time pattern analysis
  public analyzeRealTimePatterns(stocks: Stock[]): RealTimePattern[] {
    const patterns: RealTimePattern[] = [];
    
    stocks.forEach(stock => {
      // Generate mock chart data for pattern analysis
      const chartData = this.generateMockChartData(stock);
      
      const bullishPatterns = this.detectBullishPatterns(chartData, stock);
      const bearishPatterns = this.detectBearishPatterns(chartData, stock);
      
      [...bullishPatterns, ...bearishPatterns].forEach(pattern => {
        const realTimePattern: RealTimePattern = {
          symbol: stock.symbol,
          pattern,
          timestamp: new Date(),
          price: stock.price,
          volume: stock.volume,
          strength: pattern.confidence,
          actionable: pattern.confidence > 0.7
        };
        
        patterns.push(realTimePattern);
      });
    });
    
    return patterns.sort((a, b) => b.strength - a.strength);
  }

  // AI-powered market recommendations
  public async generateAIRecommendations(stocks: Stock[]): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = [];
    
    // Get real-time patterns
    const patterns = this.analyzeRealTimePatterns(stocks);
    
    // Group patterns by symbol
    const patternsBySymbol = patterns.reduce((acc, pattern) => {
      if (!acc[pattern.symbol]) {
        acc[pattern.symbol] = [];
      }
      acc[pattern.symbol].push(pattern);
      return acc;
    }, {} as Record<string, RealTimePattern[]>);
    
    // Generate recommendations based on patterns
    Object.entries(patternsBySymbol).forEach(([symbol, stockPatterns]) => {
      const stock = stocks.find(s => s.symbol === symbol);
      if (!stock) return;
      
      const bullishPatterns = stockPatterns.filter(p => p.pattern.type === 'bullish');
      const bearishPatterns = stockPatterns.filter(p => p.pattern.type === 'bearish');
      
      if (bullishPatterns.length > bearishPatterns.length) {
        const avgConfidence = bullishPatterns.reduce((sum, p) => sum + p.strength, 0) / bullishPatterns.length;
        
        if (avgConfidence > 0.65) {
          recommendations.push({
            id: `ai-${symbol}-${Date.now()}`,
            symbol,
            type: avgConfidence > 0.8 ? 'strong_buy' : 'buy',
            confidence: avgConfidence,
            reasoning: [
              `Multiple bullish patterns detected (${bullishPatterns.length})`,
              `Volume spike: ${stock.volume > 1000000 ? 'High' : 'Moderate'}`,
              `Price momentum: ${stock.changePercent.toFixed(2)}%`,
              `Pattern strength: ${(avgConfidence * 100).toFixed(1)}%`
            ],
            patterns: bullishPatterns.map(p => p.pattern),
            priceTarget: stock.price * (1 + (avgConfidence * 0.15)),
            stopLoss: stock.price * 0.92,
            timeframe: '1-3 days',
            risk: avgConfidence > 0.8 ? 'medium' : 'high',
            createdAt: new Date(),
            aiScore: avgConfidence * 100,
            technicalScore: Math.min(95, bullishPatterns.length * 25),
            fundamentalScore: 70 + (stock.changePercent * 2)
          });
        }
      }
    });
    
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 20);
  }

  // Generate full market scan
  public async performAIMarketScan(stocks: Stock[]): Promise<AIMarketScan> {
    const recommendations = await this.generateAIRecommendations(stocks);
    const patterns = this.analyzeRealTimePatterns(stocks);
    
    // Analyze unusual volume
    const avgVolumes = stocks.map(s => s.volume);
    const volumeThreshold = avgVolumes.reduce((sum, v) => sum + v, 0) / avgVolumes.length * 2;
    const unusualVolume = stocks.filter(s => s.volume > volumeThreshold);
    
    // Get volume leaders
    const volumeLeaders = [...stocks]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
    
    // Group patterns by stock
    const patternMatches = patterns.reduce((acc, pattern) => {
      const existing = acc.find(item => item.stock.symbol === pattern.symbol);
      if (existing) {
        existing.patterns.push(pattern.pattern);
      } else {
        const stock = stocks.find(s => s.symbol === pattern.symbol);
        if (stock) {
          acc.push({
            stock,
            patterns: [pattern.pattern]
          });
        }
      }
      return acc;
    }, [] as { stock: Stock; patterns: PatternAnalysis[] }[]);
    
    // Determine market sentiment
    const bullishCount = recommendations.filter(r => r.type === 'buy' || r.type === 'strong_buy').length;
    const totalCount = recommendations.length;
    const bullishRatio = totalCount > 0 ? bullishCount / totalCount : 0.5;
    
    let marketSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (bullishRatio > 0.6) marketSentiment = 'bullish';
    else if (bullishRatio < 0.4) marketSentiment = 'bearish';
    
    return {
      id: `scan-${Date.now()}`,
      timestamp: new Date(),
      scanType: 'full_spectrum',
      recommendations,
      marketSentiment,
      volumeAnalysis: {
        unusualVolume,
        volumeLeaders
      },
      patternMatches: patternMatches.slice(0, 15)
    };
  }

  private generateMockChartData(stock: Stock): ChartData[] {
    const data: ChartData[] = [];
    const basePrice = stock.price / (1 + stock.changePercent / 100);
    
    for (let i = 0; i < 50; i++) {
      const time = Date.now() - (50 - i) * 60 * 1000; // 1 minute intervals
      const volatility = 0.02;
      const trend = stock.changePercent > 0 ? 0.001 : -0.001;
      
      const open = i === 0 ? basePrice : data[i - 1].close;
      const change = (Math.random() - 0.5) * volatility + trend;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = stock.volume * (0.8 + Math.random() * 0.4) / 50;
      
      data.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(volume)
      });
    }
    
    return data;
  }
}

export const aiPatternService = new AIPatternService();