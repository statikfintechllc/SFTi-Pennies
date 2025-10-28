#!/usr/bin/env node
/**
 * Fetch Portfolio Data from IBKR API
 * Retrieves account summary and positions
 */

import { writeFile } from 'fs/promises';
import axios from 'axios';

const IBKR_API_BASE = 'https://api.ibkr.com/v1/api';

async function fetchPortfolio() {
  const accessToken = process.env.IBKR_ACCESS_TOKEN;
  
  if (!accessToken) {
    console.error('❌ No IBKR access token found');
    console.error('   Please set IBKR_ACCESS_TOKEN as a GitHub Secret');
    process.exit(1);
  }
  
  console.log('📊 Fetching portfolio data from IBKR...');
  
  try {
    // Fetch account summary
    const accountResponse = await axios.get(`${IBKR_API_BASE}/portfolio/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const accountId = accountResponse.data[0]?.accountId;
    
    if (!accountId) {
      throw new Error('No account ID found');
    }
    
    // Fetch account summary details
    const summaryResponse = await axios.get(
      `${IBKR_API_BASE}/portfolio/${accountId}/summary`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Fetch positions
    const positionsResponse = await axios.get(
      `${IBKR_API_BASE}/portfolio/${accountId}/positions`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const portfolioData = {
      timestamp: new Date().toISOString(),
      account: {
        netLiquidation: summaryResponse.data.netLiquidation || 0,
        cashBalance: summaryResponse.data.availableFunds || 0,
        buyingPower: summaryResponse.data.buyingPower || 0,
        dayPnL: summaryResponse.data.unrealizedPnL || 0
      },
      positions: positionsResponse.data.map(pos => ({
        symbol: pos.contractDesc || pos.ticker,
        quantity: pos.position,
        avgCost: pos.avgCost,
        currentPrice: pos.mktPrice,
        pnl: pos.unrealizedPnL,
        pnlPercent: ((pos.mktPrice - pos.avgCost) / pos.avgCost * 100).toFixed(2)
      }))
    };
    
    // Save to data file
    await writeFile(
      'index.directory/assets/data/portfolio.json',
      JSON.stringify(portfolioData, null, 2)
    );
    
    console.log('✅ Portfolio data saved');
    console.log(`   Net Liquidation: $${portfolioData.account.netLiquidation.toLocaleString()}`);
    console.log(`   Positions: ${portfolioData.positions.length}`);
    
  } catch (error) {
    console.error('❌ Error fetching portfolio:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    
    // Create fallback demo data
    const demoData = {
      timestamp: new Date().toISOString(),
      error: error.message,
      demo: true,
      account: {
        netLiquidation: 0,
        cashBalance: 0,
        buyingPower: 0,
        dayPnL: 0
      },
      positions: []
    };
    
    await writeFile(
      'index.directory/assets/data/portfolio.json',
      JSON.stringify(demoData, null, 2)
    );
    
    console.log('⚠️  Demo data created due to API error');
  }
}

fetchPortfolio().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
