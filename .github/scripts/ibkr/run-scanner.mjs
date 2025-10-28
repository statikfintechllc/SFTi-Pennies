#!/usr/bin/env node
/**
 * Run Stock Scanner using IBKR API
 * Scans stocks based on criteria
 */

import { writeFile } from 'fs/promises';
import axios from 'axios';

const IBKR_API_BASE = 'https://api.ibkr.com/v1/api';

async function runScanner() {
  const accessToken = process.env.IBKR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ No IBKR access token found');
    process.exit(1);
  }
  
  console.log('🔍 Running stock scanner...');
  
  try {
    // IBKR Scanner parameters
    const scannerParams = {
      instrument: 'STK',
      location: 'STK.US.MAJOR',
      scanCode: 'TOP_PERC_GAIN',
      filters: [
        { code: 'priceAbove', value: 1 },
        { code: 'priceBelow', value: 500 },
        { code: 'volumeAbove', value: 100000 }
      ]
    };
    
    const response = await axios.post(
      `${IBKR_API_BASE}/iserver/scanner/run`,
      scannerParams,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const results = response.data.Contracts || [];
    
    const scanData = {
      timestamp: new Date().toISOString(),
      criteria: scannerParams,
      results: results.map(item => ({
        symbol: item.symbol,
        conid: item.conid,
        price: item.lastPrice,
        change: item.changePercent,
        volume: item.volume,
        marketCap: item.marketCap
      }))
    };
    
    await writeFile(
      'index.directory/assets/data/scanner-results.json',
      JSON.stringify(scanData, null, 2)
    );
    
    console.log(`✅ Scanner complete: ${scanData.results.length} results`);
    
  } catch (error) {
    console.error('❌ Error running scanner:', error.message);
    
    // Create fallback data
    const demoData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      demo: true,
      results: []
    };
    
    await writeFile(
      'index.directory/assets/data/scanner-results.json',
      JSON.stringify(demoData, null, 2)
    );
  }
}

runScanner().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
