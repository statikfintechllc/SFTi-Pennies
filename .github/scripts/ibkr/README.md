# IBKR Trading Integration Setup

This directory contains GitHub Actions workflows and scripts for integrating with Interactive Brokers (IBKR) Web API.

## Overview

The integration uses:
- **GitHub Actions** as the serverless backend
- **OAuth 2.0** flow for authentication
- **GitHub Secrets** for secure credential storage
- **JSON data files** to serve real-time data to the frontend

## Setup Instructions

### 1. Register IBKR OAuth Application

1. Log in to your IBKR account
2. Navigate to Account Management > API Settings
3. Create a new OAuth application:
   - **Application Name**: SFTi-Pennies Trading
   - **Redirect URI**: `https://[your-username].github.io/SFTi-Pennies/index.directory/trading.html`
   - **Scopes**: `read_account`, `read_trades`, `execute_trades`
4. Save your **Client ID** and **Client Secret**

### 2. Configure GitHub Secrets

Go to your repository Settings > Secrets and variables > Actions, and add:

- `IBKR_CLIENT_ID`: Your IBKR OAuth Client ID
- `IBKR_CLIENT_SECRET`: Your IBKR OAuth Client Secret
- `IBKR_ACCESS_TOKEN`: (Will be populated by OAuth flow)
- `IBKR_REFRESH_TOKEN`: (Will be populated by OAuth flow)

### 3. Update Trading Interface

Edit `index.directory/assets/js/trading.js` and replace:

```javascript
const IBKR_CLIENT_ID = 'YOUR_IBKR_CLIENT_ID';
```

With your actual Client ID, or configure it to read from a config file.

### 4. OAuth Authentication Flow

1. User clicks "Connect IBKR" button
2. Redirects to IBKR OAuth authorization page
3. User logs in and authorizes the application
4. IBKR redirects back with authorization code
5. Frontend triggers GitHub Actions workflow via `repository_dispatch`
6. Workflow exchanges code for access token
7. Token is stored as GitHub Secret

### 5. Data Refresh

The workflow runs:
- **On-demand**: Manual trigger via GitHub Actions UI
- **Scheduled**: Every 5 minutes during market hours (9:30 AM - 4:00 PM ET)
- **On OAuth callback**: When new token is received

### 6. API Endpoints

The scripts fetch data from IBKR API:

- **Portfolio**: `/portfolio/{accountId}/summary` and `/portfolio/{accountId}/positions`
- **Market Data**: `/md/snapshot?symbols={symbol}`
- **Scanner**: `/iserver/scanner/run`

### 7. Data Files

Fetched data is stored in `index.directory/assets/data/`:

- `portfolio.json`: Account summary and positions
- `market-data.json`: Real-time quotes
- `scanner-results.json`: Stock scanner results
- `ibkr-token-status.json`: OAuth token metadata

## File Structure

```
.github/
├── workflows/
│   └── ibkr_integration.yml    # Main workflow
└── scripts/
    └── ibkr/
        ├── store-oauth-token.mjs
        ├── fetch-portfolio.mjs
        ├── fetch-market-data.mjs
        └── run-scanner.mjs

index.directory/
└── assets/
    ├── data/                   # Generated data files
    └── js/
        └── trading.js          # Frontend integration
```

## Security Notes

- Never commit tokens or secrets to the repository
- All sensitive credentials must be stored as GitHub Secrets
- The frontend never directly accesses IBKR API (all calls through GitHub Actions)
- OAuth tokens expire and must be refreshed

## Troubleshooting

### Token Issues
- Check GitHub Actions logs for OAuth exchange errors
- Verify redirect URI matches exactly in IBKR settings
- Ensure tokens are not expired (refresh if needed)

### Data Not Updating
- Check workflow runs in GitHub Actions tab
- Verify IBKR API credentials are valid
- Check rate limiting (IBKR has API call limits)

### Demo Mode
If IBKR integration is not configured, the interface falls back to demo data for development/testing.

## Development

To test locally:
1. Run `npm install` to install dependencies
2. Set environment variables: `IBKR_ACCESS_TOKEN=your_token`
3. Run scripts: `node .github/scripts/ibkr/fetch-portfolio.mjs`

## API Documentation

- [IBKR Web API Documentation](https://www.interactivebrokers.com/api/doc.html)
- [OAuth 2.0 Specification](https://oauth.net/2/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
