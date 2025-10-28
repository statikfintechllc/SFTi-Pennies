#!/usr/bin/env node
/**
 * Store IBKR OAuth Token
 * This script handles storing OAuth tokens received from IBKR callback
 * Tokens should be stored as GitHub Secrets via GitHub API
 */

import { writeFile } from 'fs/promises';
import { execSync } from 'child_process';

async function storeOAuthToken() {
  const token = process.env.IBKR_AUTH_TOKEN;
  const refreshToken = process.env.IBKR_REFRESH_TOKEN;
  
  if (!token) {
    console.error('No IBKR auth token provided');
    process.exit(1);
  }
  
  console.log('Storing IBKR OAuth token...');
  
  // Store token metadata (not the actual token, for security)
  const tokenMetadata = {
    timestamp: new Date().toISOString(),
    token_received: true,
    expires_in: 3600, // Typical OAuth token expiry
  };
  
  await writeFile(
    'index.directory/assets/data/ibkr-token-status.json',
    JSON.stringify(tokenMetadata, null, 2)
  );
  
  console.log('✅ Token metadata stored');
  console.log('⚠️  Note: Actual token should be stored as GitHub Secret IBKR_ACCESS_TOKEN');
  console.log('   Use GitHub Settings > Secrets and variables > Actions to add:');
  console.log(`   - IBKR_ACCESS_TOKEN: ${token.substring(0, 10)}...`);
  if (refreshToken) {
    console.log(`   - IBKR_REFRESH_TOKEN: ${refreshToken.substring(0, 10)}...`);
  }
}

storeOAuthToken().catch(error => {
  console.error('Error storing token:', error);
  process.exit(1);
});
