# IBKR Client Integration for SFTi-Pennies

## Overview

This folder contains the `ibkr-client` library from https://github.com/art1c0/ibkr-client.git

**Important Note**: This is a Node.js server-side library that uses OAuth1.0a authentication with private keys. It **cannot** run directly in the browser due to:

1. Node.js-specific modules (`crypto`, `node-forge`, `ws`)  
2. OAuth1.0a requires private keys that cannot be exposed client-side
3. Designed for server-side trading applications with institutional OAuth access

## Current SFTi-Pennies Implementation

Our trading interface (`/index.directory/trading.html`) uses:
- **Browser-based authentication**: IBKR Client Portal popup with cookie-based sessions
- **No OAuth required**: Direct connection via IBKR's web portal
- **Client-side only**: No backend server needed
- **Works on GitHub Pages**: Static hosting compatible

## Integration Approach

### Option 1: Reference Implementation (Current)
Use this library as reference for understanding IBKR API structure, but keep browser-based popup authentication.

**Status**: ✅ Implemented in `/index.directory/assets/js/trading.js`

### Option 2: Add Optional OAuth Support (Future)
For institutional users with OAuth credentials:
1. Deploy serverless backend (Cloudflare Workers, Vercel, Netlify)
2. Use this library on the backend
3. Frontend calls backend API
4. Backend handles OAuth and IBKR API calls

**Status**: ⏸️ Deferred (requires backend infrastructure)

### Option 3: Hybrid Approach
- Default: Browser popup authentication (current implementation)
- Optional: OAuth via backend for institutional users
- Auto-detect and use best available method

## Files

- `ibkr-client/src/ibkr.client.ts` - Main IBKR client class
- `ibkr-client/src/ibkr.oauth1.ts` - OAuth1.0a implementation
- `ibkr-client/package.json` - Dependencies (Node.js modules)
- `ibkr-client/configure.js` - OAuth configuration script
- `ibkr-client/README.md` - Original library documentation

## Usage in SFTi-Pennies

Currently used as **reference only**. The actual browser implementation is in:
- `/index.directory/trading.html` - UI
- `/index.directory/assets/js/trading.js` - Browser-compatible IBKR integration
- `/index.directory/assets/css/trading-button.css` - Styling

## Notes

- This library requires Node.js and cannot run in browsers
- Our implementation uses IBKR's Client Portal popup authentication instead
- No OAuth credentials needed for end users
- Session cookies handled by IBKR's portal
- Real-time data via IBKR Client Portal API (`cdcdyn.interactivebrokers.com/portal.proxy/v1/api`)
