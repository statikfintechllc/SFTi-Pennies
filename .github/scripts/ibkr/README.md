# IBKR Trading Integration - Client-Side Only

This directory contains client-side integration with Interactive Brokers (IBKR) Web API using OAuth 2.0 Implicit Flow.

## Overview

**No backend setup required!** The integration works entirely in the browser:
- **OAuth 2.0 Implicit Flow** - Token returned directly to browser
- **localStorage** - Token cached in browser for persistence
- **Direct API Calls** - Frontend makes API calls directly to IBKR
- **Clone and Publish** - Just publish GitHub Pages and connect

## User Setup Instructions (One-Time)

### 1. Register IBKR OAuth Application

1. Log in to your IBKR account
2. Navigate to Account Management > API Settings
3. Create a new OAuth application:
   - **Application Name**: SFTi-Pennies Trading
   - **Application Type**: Public Client / Single Page Application
   - **Redirect URI**: `https://[your-username].github.io/SFTi-Pennies/index.directory/trading.html`
   - **Grant Type**: Implicit
   - **Response Type**: token
4. Save your **Client ID** (you'll enter this in the app)

### 2. Connect to IBKR (First Time)

1. Open your published GitHub Pages site
2. Navigate to the Trading Interface
3. Click "Connect IBKR"
4. When prompted, enter your IBKR OAuth Client ID
5. You'll be redirected to IBKR login page
6. Sign in with your IBKR credentials
7. Authorize the application
8. You'll be redirected back with your access token automatically captured

### 3. Token Storage

- Token is stored in browser `localStorage`
- Token persists across browser sessions
- Token expires per IBKR settings (typically 24 hours)
- Re-authenticate when token expires

## How It Works

```
1. User clicks "Connect IBKR"
   ↓
2. Prompted for Client ID (first time only)
   ↓
3. Redirect to IBKR OAuth:
   https://api.ibkr.com/v1/api/oauth/authorize?response_type=token&client_id=...
   ↓
4. User logs in to IBKR
   ↓
5. IBKR redirects back with token in URL:
   https://[your-site]/trading.html#access_token=xyz&token_type=Bearer&expires_in=3600
   ↓
6. Frontend captures token from URL fragment
   ↓
7. Token stored in localStorage
   ↓
8. Direct API calls to IBKR using token
```

## API Endpoints Used

All API calls are made directly from the browser to IBKR:

- **Portfolio**: `GET /v1/api/portfolio/accounts` and `/v1/api/portfolio/{accountId}/summary`
- **Positions**: `GET /v1/api/portfolio/{accountId}/positions/0`
- **Scanner**: `POST /v1/api/iserver/scanner/run`
- **Market Data**: `GET /v1/api/md/snapshot?symbols={symbol}`

## Security Notes

- **Implicit Flow** is appropriate for Single Page Applications
- No client secret is used (public client)
- Token has limited lifetime (1-24 hours typically)
- Token is stored only in user's browser
- CORS handled by IBKR API
- User must re-authenticate when token expires

## Advantages

✅ No backend server required  
✅ No GitHub Actions setup needed  
✅ No GitHub Secrets to configure  
✅ Clone, publish, and use immediately  
✅ Each user authenticates with their own IBKR account  
✅ Tokens never leave the user's browser  

## Troubleshooting

### "Client ID required" prompt
- You need to create an OAuth app in IBKR first
- Copy your Client ID and paste it when prompted
- Client ID is saved in browser for future use

### Token expired
- Click "Disconnect" then "Connect IBKR" again
- You'll be redirected to IBKR to re-authenticate

### CORS errors
- Ensure your redirect URI exactly matches what's configured in IBKR
- Check that you're accessing via HTTPS (GitHub Pages)

### API errors
- Verify your IBKR account has API access enabled
- Check that your token hasn't expired
- Ensure IBKR services are running

## For Developers

The implementation is in `index.directory/assets/js/trading.js`:

- `initiateIBKRAuth()` - Starts OAuth flow
- `handleOAuthCallback()` - Captures token from URL
- `loadPortfolio()` - Fetches account data from IBKR API
- `runMarketScan()` - Runs stock scanner via IBKR API

## API Documentation

- [IBKR Web API Documentation](https://www.interactivebrokers.com/api/doc.html)
- [OAuth 2.0 Implicit Flow](https://oauth.net/2/grant-types/implicit/)

