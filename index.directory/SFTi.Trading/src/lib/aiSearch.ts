import { Stock, AISearchResult, PatternAnalysis, SearchMemory, MarketPattern } from '@/types';

/**
 * AI-Powered Stock Search and Pattern Recognition Service
 * Uses LLM to analyze market data and provide intelligent search results
 */
export class AISearchService {
  private searchMemory: SearchMemory[] = [];
  private patterns: MarketPattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize known market patterns for recognition
   */
  private initializePatterns(): void {
    this.patterns = [
      {
        id: 'cup_and_handle',
        name: 'Cup and Handle',
        type: 'bullish',
        timeframe: '1d',
        indicators: ['volume', 'price_action'],
        conditions: { volume_increase: 1.5, price_consolidation: 0.1 },
        accuracy: 0.75
      },
      {
        id: 'breakout',
        name: 'Breakout Pattern',
        type: 'bullish',
        timeframe: '5m',
        indicators: ['volume', 'resistance'],
        conditions: { volume_spike: 2.0, resistance_break: true },
        accuracy: 0.68
      },
      {
        id: 'oversold_bounce',
        name: 'Oversold Bounce',
        type: 'bullish',
        timeframe: '1h',
        indicators: ['rsi', 'price_action'],
        conditions: { rsi_below: 30, price_decline: 0.15 },
        accuracy: 0.60
      },
      {
        id: 'volume_spike',
        name: 'Volume Spike',
        type: 'neutral',
        timeframe: '1m',
        indicators: ['volume'],
        conditions: { volume_multiple: 3.0 },
        accuracy: 0.55
      }
    ];
  }

  /**
   * Perform AI-powered search with pattern recognition
   */
  async performSearch(query: string, stocks: Stock[]): Promise<AISearchResult[]> {
    try {
      // Create comprehensive search prompt
      const searchPrompt = spark.llmPrompt`
        Analyze the following penny stocks and query to find the most relevant matches.
        
        Query: "${query}"
        
        Stock Data:
        ${JSON.stringify(stocks.map(s => ({
          symbol: s.symbol,
          name: s.name,
          price: s.price,
          changePercent: s.changePercent,
          volume: s.volume,
          marketCap: s.marketCap,
          float: s.float,
          news: s.news
        })), null, 2)}
        
        Please analyze and return the top 10 most relevant stocks based on:
        1. Direct symbol/name matches
        2. Technical patterns (breakouts, volume spikes, oversold conditions)
        3. Market sentiment indicators
        4. Risk/reward ratios for penny stocks
        
        For each stock, provide:
        - Relevance score (0-100)
        - Specific reasons for inclusion
        - Identified patterns
        - Risk assessment
        
        Focus on actionable insights for penny stock trading.
      `;

      const searchResults = await spark.llm(searchPrompt, 'gpt-4o', true);
      const parsedResults = JSON.parse(searchResults);

      // Process AI results and add pattern analysis
      const enhancedResults = await this.enhanceWithPatterns(parsedResults.stocks || parsedResults, stocks);

      // Store search in memory
      this.addToMemory(query, enhancedResults);

      return enhancedResults;
    } catch (error) {
      console.error('AI search failed:', error);
      
      // Fallback to basic search
      return this.fallbackSearch(query, stocks);
    }
  }

  /**
   * Enhance search results with technical pattern analysis
   */
  private async enhanceWithPatterns(aiResults: any[], stocks: Stock[]): Promise<AISearchResult[]> {
    const enhanced: AISearchResult[] = [];

    for (const result of aiResults) {
      const stock = stocks.find(s => s.symbol === result.symbol);
      if (!stock) continue;

      // Analyze patterns for this stock
      const patterns = await this.analyzePatterns(stock);

      enhanced.push({
        symbol: result.symbol,
        relevanceScore: result.relevanceScore || result.score || 50,
        reasons: result.reasons || [result.reason || 'AI-identified relevance'],
        patterns,
        priceTargets: result.priceTargets
      });
    }

    return enhanced.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Analyze technical patterns for a specific stock
   */
  private async analyzePatterns(stock: Stock): Promise<PatternAnalysis[]> {
    try {
      const patternPrompt = spark.llmPrompt`
        Analyze the following penny stock for technical patterns:
        
        Stock: ${stock.symbol} (${stock.name})
        Current Price: $${stock.price}
        Change: ${stock.changePercent.toFixed(2)}%
        Volume: ${stock.volume.toLocaleString()}
        Market Cap: $${(stock.marketCap / 1000000).toFixed(1)}M
        Float: ${(stock.float / 1000000).toFixed(1)}M shares
        Recent News: ${stock.news} articles
        
        Identify potential technical patterns such as:
        - Breakout patterns
        - Volume anomalies
        - Support/resistance levels
        - Momentum indicators
        - Risk factors specific to penny stocks
        
        For each pattern found, provide:
        - Pattern name
        - Confidence level (0-100)
        - Description
        - Timeframe relevance
        - Trading signals
        
        Focus on actionable patterns for short-term penny stock trading.
      `;

      const patternResults = await spark.llm(patternPrompt, 'gpt-4o-mini', true);
      const patterns = JSON.parse(patternResults);

      return (patterns.patterns || []).map((p: any) => ({
        pattern: p.name || p.pattern,
        confidence: p.confidence || 50,
        description: p.description || 'Pattern detected',
        timeframe: p.timeframe || '5m',
        signals: p.signals || p.tradingSignals || []
      }));
    } catch (error) {
      console.error('Pattern analysis failed for', stock.symbol, error);
      return [];
    }
  }

  /**
   * Fallback search using basic text matching
   */
  private fallbackSearch(query: string, stocks: Stock[]): AISearchResult[] {
    const searchTerms = query.toLowerCase().split(' ');
    
    return stocks
      .map(stock => {
        let score = 0;
        const reasons: string[] = [];

        // Symbol match
        if (stock.symbol.toLowerCase().includes(query.toLowerCase())) {
          score += 50;
          reasons.push('Symbol match');
        }

        // Name match
        if (stock.name.toLowerCase().includes(query.toLowerCase())) {
          score += 30;
          reasons.push('Company name match');
        }

        // Pattern-based scoring
        if (stock.changePercent > 10) {
          score += 20;
          reasons.push('Strong upward movement');
        }

        if (stock.volume > 1000000) {
          score += 15;
          reasons.push('High volume activity');
        }

        if (stock.news > 0) {
          score += 10;
          reasons.push('Recent news coverage');
        }

        return {
          symbol: stock.symbol,
          relevanceScore: score,
          reasons,
          patterns: []
        };
      })
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);
  }

  /**
   * Get search suggestions based on current market conditions
   */
  async getSearchSuggestions(stocks: Stock[]): Promise<string[]> {
    try {
      const suggestionPrompt = spark.llmPrompt`
        Based on current penny stock market data, suggest 5 relevant search queries:
        
        Market Overview:
        - Top gainers: ${stocks.filter(s => s.changePercent > 5).length} stocks
        - High volume: ${stocks.filter(s => s.volume > 1000000).length} stocks
        - With news: ${stocks.filter(s => s.news > 0).length} stocks
        
        Suggest searches like:
        - "breakout stocks"
        - "high volume penny stocks"
        - "oversold bounce candidates"
        
        Return 5 specific, actionable search queries for penny stock traders.
      `;

      const suggestions = await spark.llm(suggestionPrompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(suggestions);
      
      return parsed.suggestions || parsed.queries || [
        'breakout stocks',
        'high volume gainers',
        'oversold bounce',
        'news catalyst stocks',
        'low float runners'
      ];
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      return [
        'breakout stocks',
        'high volume gainers', 
        'oversold bounce',
        'news catalyst stocks',
        'low float runners'
      ];
    }
  }

  /**
   * Add search to memory for learning
   */
  private addToMemory(query: string, results: AISearchResult[]): void {
    this.searchMemory.unshift({
      query,
      results,
      timestamp: new Date(),
      filters: {} as any // Would include current filter state
    });

    // Keep only last 100 searches
    if (this.searchMemory.length > 100) {
      this.searchMemory = this.searchMemory.slice(0, 100);
    }
  }

  /**
   * Get search history for learning patterns
   */
  getSearchMemory(): SearchMemory[] {
    return [...this.searchMemory];
  }

  /**
   * Learn from user feedback on search results
   */
  provideFeedback(searchIndex: number, feedback: 'helpful' | 'not_helpful'): void {
    if (this.searchMemory[searchIndex]) {
      this.searchMemory[searchIndex].userFeedback = feedback;
    }
  }

  /**
   * Get pattern recognition insights
   */
  async getMarketInsights(stocks: Stock[]): Promise<string[]> {
    try {
      const insightPrompt = spark.llmPrompt`
        Analyze current penny stock market conditions and provide 3-5 key insights:
        
        Market Data Summary:
        - Total stocks: ${stocks.length}
        - Average change: ${(stocks.reduce((sum, s) => sum + s.changePercent, 0) / stocks.length).toFixed(2)}%
        - High volume stocks: ${stocks.filter(s => s.volume > 1000000).length}
        - Stocks with news: ${stocks.filter(s => s.news > 0).length}
        - Stocks up >10%: ${stocks.filter(s => s.changePercent > 10).length}
        - Stocks down >10%: ${stocks.filter(s => s.changePercent < -10).length}
        
        Provide actionable insights about:
        - Market sentiment
        - Volume patterns
        - Sector trends
        - Risk factors
        - Opportunities
        
        Keep insights concise and actionable for penny stock traders.
      `;

      const insights = await spark.llm(insightPrompt, 'gpt-4o-mini', true);
      const parsed = JSON.parse(insights);
      
      return parsed.insights || [
        'Market showing mixed signals',
        'Volume activity above average',
        'News-driven opportunities present',
        'Risk management essential',
        'Focus on breakout patterns'
      ];
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return [
        'Market analysis unavailable',
        'Monitor volume patterns',
        'Check recent news',
        'Use proper risk management'
      ];
    }
  }
}

// Singleton instance
export const aiSearchService = new AISearchService();