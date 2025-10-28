#!/usr/bin/env node
/**
 * Fetch Market Data from IBKR API
 * Retrieves real-time quotes for specified symbols
 */

import { writeFile } from 'fs/promises';
import axios from 'axios';

const IBKR_API_BASE = 'https://api.ibkr.com/v1/api';

async function fetchMarketData() {
  const accessToken = process.env.IBKR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ No IBKR access token found');
    process.exit(1);
  }
  
  // Default symbols to track
  const symbols = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  
  console.log('📈 Fetching market data from IBKR...');
  
  try {
    const marketData = {};
    
    // Fetch quotes for each symbol
    for (const symbol of symbols) {
      try {
        const response = await axios.get(
          `${IBKR_API_BASE}/md/snapshot`,
          {
            params: { symbols: symbol },
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const quote = response.data[0];
        marketData[symbol] = {
          symbol,
          price: quote.lastPrice || 0,
          change: quote.change || 0,
          changePercent: quote.changePercent || 0,
          volume: quote.volume || 0,
          high: quote.high || 0,
          low: quote.low || 0,
          timestamp: new Date().toISOString()
        };
        
        console.log(`  ✓ ${symbol}: $${marketData[symbol].price}`);
        
      } catch (err) {
        console.error(`  ✗ ${symbol}: ${err.message}`);
      }
    }
    
    const result = {
      timestamp: new Date().toISOString(),
      data: marketData
    };
    
    await writeFile(
      'index.directory/assets/data/market-data.json',
      JSON.stringify(result, null, 2)
    );
    
    console.log('✅ Market data saved');
    
  } catch (error) {
    console.error('❌ Error fetching market data:', error.message);
    
    // Create fallback data
    const demoData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      demo: true,
      data: {}
    };
    
    await writeFile(
      'index.directory/assets/data/market-data.json',
      JSON.stringify(demoData, null, 2)
    );
  }
}

fetchMarketData().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
