# IBKR Trading Integration - Client Portal Cookie-Based Auth

This directory contains client-side integration with Interactive Brokers (IBKR) Client Portal using cookie-based session authentication.

## Overview

**Ultra-simple clone and publish workflow:**
- **No OAuth app registration** - Uses IBKR Client Portal login directly
- **Cookie-based session** - No tokens to manage
- **Popup login** - User signs in via popup window
- **Session validation** - Frontend checks for active IBKR session
- **Direct API Calls** - Browser makes API calls to IBKR Client Portal
- **Clone and Go** - Works immediately after cloning and publishing

## How It Works

```
1. User clicks "Connect IBKR"
   ↓
2. Popup opens to IBKR Client Portal login:
   https://cdcdyn.interactivebrokers.com/sso/Login
   ↓
3. User logs in with their IBKR credentials
   ↓
4. IBKR sets session cookies in browser
   ↓
5. Frontend detects successful login by checking session
   ↓
6. Popup closes automatically
   ↓
7. Direct API calls to IBKR Client Portal using cookies
```

## User Experience (Zero Setup!)

1. Clone the repository
2. Publish GitHub Pages
3. Open the trading interface
4. Click "Connect IBKR"
5. Sign in to IBKR in the popup window
6. Start trading immediately!

**No OAuth app registration. No Client IDs. No configuration.**

## IBKR Client Portal API

Base URL: `https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api`

All API calls use:
- **Method**: GET/POST as appropriate
- **Credentials**: `include` (sends cookies)
- **Headers**: `Content-Type: application/json`

### Session Validation

```javascript
POST /portal/sso/validate
```

Returns session info including user ID and authentication status.

### Key Endpoints

- **Accounts**: `GET /iserver/accounts`
- **Portfolio Summary**: `GET /portfolio/{accountId}/summary`
- **Positions**: `GET /portfolio/{accountId}/positions/0`
- **Market Data Scanner**: `POST /iserver/scanner/run`
- **Contract Search**: `GET /iserver/secdef/search?symbol={symbol}`
- **Market Data Snapshot**: `GET /iserver/marketdata/snapshot?conids={conids}&fields=...`
- **Logout**: `POST /logout`

## Security Model

- **Session Cookies**: Authentication via HTTP-only cookies set by IBKR
- **Same-Origin**: All API calls go directly to IBKR's domain
- **CORS**: IBKR Client Portal API supports cross-origin requests with credentials
- **Session Lifetime**: Typically 24 hours, user must re-login when expired
- **No Tokens**: No access tokens stored in browser storage

## Implementation Details

The implementation is in `index.directory/assets/js/trading.js`:

### Authentication Flow

```javascript
initiateIBKRAuth() {
  // Opens popup to IBKR login
  const popup = window.open(
    'https://cdcdyn.interactivebrokers.com/sso/Login?forwardTo=22&RL=1&ip2loc=on',
    'ibkr-auth',
    'width=800,height=600'
  );
  
  // Periodically checks if login completed
  setInterval(async () => {
    const valid = await checkIBKRSession();
    if (valid) {
      popup.close();
      // Ready to make API calls
    }
  }, 5000);
}
```

### Session Validation

```javascript
async checkIBKRSession() {
  const response = await fetch(
    'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api/portal/sso/validate',
    {
      method: 'POST',
      credentials: 'include'
    }
  );
  const data = await response.json();
  return data.USER_ID || data.AUTHENTICATED === true;
}
```

### API Calls

```javascript
async loadPortfolio() {
  const response = await fetch(
    'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api/iserver/accounts',
    {
      credentials: 'include',  // Send cookies
      headers: {'Content-Type': 'application/json'}
    }
  );
  const accounts = await response.json();
  // Process accounts...
}
```

## Advantages

✅ No backend server required  
✅ No GitHub Actions setup needed  
✅ No GitHub Secrets to configure  
✅ No OAuth app registration with IBKR  
✅ No Client IDs to manage  
✅ Clone, publish GitHub Pages, and use immediately  
✅ Each user authenticates with their own IBKR credentials  
✅ Sessions managed entirely by IBKR  
✅ Industry-standard cookie-based authentication  

## Troubleshooting

### Popup blocked
- Browser may block popups - allow popups for the site
- Click "Connect IBKR" again after allowing popups

### Session expired
- Click "Disconnect" then "Connect IBKR" again
- You'll be prompted to sign in to IBKR again

### CORS errors
- IBKR Client Portal API supports CORS with credentials
- Ensure you're accessing via HTTPS (GitHub Pages)
- Check browser console for specific error messages

### API errors
- Verify your IBKR account has Client Portal access enabled
- Check that IBKR Client Portal is online
- Try logging in directly at https://www.interactivebrokers.com/portal

### Authentication timeout
- Login process times out after 10 minutes
- Complete login within 10 minutes or restart process

## API Documentation

- [IBKR Client Portal API Documentation](https://www.interactivebrokers.com/api/doc.html)
- [IBKR Client Portal Web API](https://ndcdyn.interactivebrokers.com/api/doc.html)
- [Cookie-Based Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
