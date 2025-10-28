export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  float: number;
  news: number;
  lastUpdate: Date;
}

export interface MarketHours {
  status: 'premarket' | 'regular' | 'afterhours' | 'closed';
  label: string;
  isOpen: boolean;
}

export interface ScannerFilters {
  priceMin: number;
  priceMax: number;
  marketCapMin: number;
  marketCapMax: number;
  floatMin: number;
  floatMax: number;
  volumeMin: number;
  changeMin: number;
  changeMax: number;
  newsOnly: boolean;
}

export interface Tab {
  id: string;
  type: 'scanner' | 'chart' | 'ai_picks' | 'sfti_top10';
  title: string;
  symbol?: string;
}

export interface ChartTimeframe {
  value: '1m' | '5m' | '15m' | '30m' | '1h' | '1d';
  label: string;
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  enabled: boolean;
  params?: Record<string, number>;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  type: 'price_above' | 'price_below' | 'volume_spike' | 'breakout' | 'pattern_recognition' | 'ai_signal';
  value: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: Date;
  message?: string;
  pattern?: PatternAnalysis;
  confidence?: number;
}

export interface IBKRConnection {
  host: string;
  port: number;
  clientId: number;
  connected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: string;
}

export interface IBKRMessage {
  type: 'market_data' | 'error' | 'connection_status';
  symbol?: string;
  data?: any;
  error?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  desktop: boolean;
  priceAlerts: boolean;
  volumeAlerts: boolean;
  newsAlerts: boolean;
}

export interface PatternAnalysis {
  pattern: string;
  confidence: number;
  description: string;
  timeframe: string;
  signals: string[];
}

export interface AISearchResult {
  symbol: string;
  relevanceScore: number;
  reasons: string[];
  patterns: PatternAnalysis[];
  priceTargets?: {
    support: number;
    resistance: number;
    target: number;
  };
}

export interface SearchMemory {
  query: string;
  results: AISearchResult[];
  timestamp: Date;
  filters: ScannerFilters;
  userFeedback?: 'helpful' | 'not_helpful';
}

export interface MarketPattern {
  id: string;
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  timeframe: string;
  indicators: string[];
  conditions: Record<string, any>;
  accuracy: number;
}

export interface AIRecommendation {
  id: string;
  symbol: string;
  type: 'buy' | 'sell' | 'watch' | 'strong_buy';
  confidence: number;
  reasoning: string[];
  patterns: PatternAnalysis[];
  priceTarget: number;
  stopLoss: number;
  timeframe: string;
  risk: 'low' | 'medium' | 'high';
  createdAt: Date;
  aiScore: number;
  technicalScore: number;
  fundamentalScore: number;
}

export interface AIMarketScan {
  id: string;
  timestamp: Date;
  scanType: 'momentum' | 'breakout' | 'value' | 'pattern' | 'full_spectrum';
  recommendations: AIRecommendation[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  volumeAnalysis: {
    unusualVolume: Stock[];
    volumeLeaders: Stock[];
  };
  patternMatches: {
    stock: Stock;
    patterns: PatternAnalysis[];
  }[];
}

export interface RealTimePattern {
  symbol: string;
  pattern: PatternAnalysis;
  timestamp: Date;
  price: number;
  volume: number;
  strength: number;
  actionable: boolean;
}