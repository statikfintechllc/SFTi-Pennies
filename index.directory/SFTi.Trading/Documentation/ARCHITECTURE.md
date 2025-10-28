# SFTi Stock Scanner - Correct Architecture Documentation

## Overview

The SFTi Stock Scanner is a **hybrid Progressive Web Application** designed for real-time penny stock scanning with Interactive Brokers (IBKR) integration. The application supports **multiple deployment modes** for maximum flexibility.

## Architecture Modes

### Mode 1: Browser-Direct (Primary Architecture)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Express Server │    │  IBKR Client    │
│  (Port 4174)    │◄──►│  (Port 3000)    │    │  Portal Gateway │
│  • UI/UX        │    │  • WebSocket    │    │  (Port 5000)    │
│  • AI Patterns  │    │  • API Proxy    │◄──►│  • Auth         │
│  • Direct IBKR  │    │  • Demo Mode    │    │  • Market Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                              ▲
        └──────────────────────────────────────────────┘
                    Direct Browser Connection
```

**Data Flow:**
1. React app loads and checks for IBKR Client Portal Gateway
2. Direct authentication with IBKR Gateway (localhost:5000)
3. Real-time market data via WebSocket or polling
4. Express server provides fallback and additional services

### Mode 2: Server-Proxied (Fallback Architecture)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Express Server │    │  IBKR Services  │
│  (Port 4174)    │◄──►│  (Port 3000)    │◄──►│  (Remote APIs)  │
│  • UI/UX        │    │  • IBKR Proxy   │    │  • Market Data  │
│  • Chart/Tables │    │  • WebSocket    │    │  • Auth APIs    │
│  • Pattern AI   │    │  • Rate Limit   │    │  • Orders       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Data Flow:**
1. React app connects to Express server
2. Express server handles IBKR authentication and API calls
3. WebSocket provides real-time updates
4. Server-side rate limiting and error handling

### Mode 3: PWA/Mobile (Mobile-First)

```
┌─────────────────┐    ┌─────────────────┐
│  PWA Frontend   │    │  IBKR Client    │
│  (Mobile)       │◄──►│  Portal Web API │
│  • Service Wrkr │    │  (HTTPS Remote) │
│  • Offline      │    │  • Mobile Auth  │
│  • Push Notifs  │    │  • REST APIs    │
└─────────────────┘    └─────────────────┘
```

## Core Components

### Frontend Components

#### **Main Application (`App.tsx`)**
- **Primary Interface**: Tabbed system with Scanner, AI Picks, and Chart tabs
- **Market Hours Detection**: Dynamic themes based on trading sessions
- **Real-time Updates**: Live price updates and notifications
- **State Management**: Uses GitHub Spark hooks for persistence

#### **IBKR Integration Layer**

**1. Browser Gateway Client (`ibkr-gateway-browser.ts`)**
```typescript
class IBKRGatewayBrowser {
  private baseUrl = 'https://localhost:5000/v1/api';
  // Direct browser connection to Client Portal Gateway
  // Handles authentication and market data
}
```

**2. Service Layer (`ibkr.ts`)**
```typescript
class IBKRService {
  private gatewayUrl = 'https://localhost:5000';
  // WebSocket connection for real-time data
  // Fallback HTTP polling mode
}
```

#### **AI Pattern Recognition (`aiPatterns.ts`)**
```typescript
class AIPatternService {
  // Bull Flag, Cup & Handle, Ascending Triangle
  // Volume breakout detection
  // Real-time pattern alerts
}
```

#### **AI Search (`aiSearch.ts`)**
```typescript
class AISearchService {
  // Intelligent stock search
  // Pattern-based recommendations
  // Market sentiment analysis
}
```

### Backend Services

#### **Express Server (`scripts/server.js`)**

**Primary Functions:**
- **IBKR API Proxy**: `/api/ibkr/*` endpoints
- **WebSocket Server**: Real-time data streaming (port 3001)
- **Market Data**: `/api/market-data` with caching
- **Authentication**: IBKR session management
- **Rate Limiting**: Protect against API abuse

**Key Endpoints:**
```javascript
POST /api/ibkr/auth/status     // Check IBKR authentication
POST /api/ibkr/auth/init       // Initialize IBKR login
GET  /api/market-data          // Get market data
POST /api/scan                 // Run stock scanner
GET  /api/portfolio            // Portfolio data
POST /api/orders               // Place orders
```

**WebSocket Messages:**
```javascript
{
  type: 'market_data',
  symbol: 'AAPL',
  price: 150.25,
  change: 2.15
}
```

## IBKR Authentication Flow

### Client Portal Gateway Authentication

1. **Gateway Check**: App checks if IBKR Gateway is running on localhost:5000
2. **Session Status**: Verify existing authentication via `/iserver/auth/status`
3. **Manual Login**: If not authenticated, user opens browser to localhost:5000
4. **Session Validation**: App confirms authenticated session
5. **WebSocket Setup**: Establish real-time data connection

### Alternative Server Authentication

1. **Server Proxy**: Express server handles IBKR API calls
2. **Session Management**: Server maintains IBKR session state
3. **Token Refresh**: Automatic session renewal
4. **Error Handling**: Graceful fallback to demo mode

## Data Sources and APIs

### Market Data Sources

**Primary**: IBKR Client Portal Gateway
- Real-time quotes
- Historical data
- Account information
- Order management

**Secondary**: Express Server Cache
- Cached market data
- Demo/mock data
- Offline capability

**Tertiary**: AI Pattern Engine
- Technical analysis
- Pattern recognition
- Trading signals

### Real-time Data Flow

```
IBKR Gateway → WebSocket → React State → UI Updates
     ↓
Express Server → Cache → WebSocket Clients
     ↓
AI Pattern Service → Alerts → Notifications
```

## Security Architecture

### Browser Security
- **HTTPS Required**: All IBKR connections use SSL
- **CORS Policies**: Configured for localhost development
- **CSP Headers**: Content Security Policy for XSS protection

### Server Security
- **Rate Limiting**: Prevent API abuse
- **Helmet.js**: Security headers
- **Input Validation**: All API parameters validated
- **Session Management**: Secure IBKR session handling

## Development vs Production

### Development Mode
```bash
npm run dev          # Frontend on port 4174
npm run server       # Backend on port 3000
# IBKR Gateway on port 5000 (manual start)
```

### Production Mode
```bash
npm run build        # Build optimized frontend
npm run start:prod   # Start all services
# Deploy to hosting platform
```

### PWA Deployment
```bash
npm run build        # Generate PWA build
# Deploy to Vercel/Netlify/GitHub Pages
# Mobile users add to home screen
```

## Service Dependencies

### Required Services
1. **IBKR Client Portal Gateway** (Port 5000) - Primary data source
2. **Express Server** (Port 3000) - API and WebSocket
3. **React Frontend** (Port 4174) - User interface

### Optional Services
1. **PWA Service Worker** - Offline functionality
2. **Push Notification Service** - Mobile alerts
3. **Analytics Service** - Usage tracking

## Configuration

### Environment Variables
```bash
# IBKR Configuration
IBKR_GATEWAY_URL=https://localhost:5000
IBKR_BASE_URL=https://localhost:5000/v1/api
IBKR_TIMEOUT=30000

# Server Configuration  
SERVER_PORT=3000
WS_PORT=3001
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=1000
```

### Package.json Scripts
```json
{
  "dev": "vite --port 4174",
  "server": "node scripts/server.js", 
  "start:full": "concurrently \"npm run server\" \"npm run dev\"",
  "build": "tsc -b --noCheck && vite build"
}
```

## Performance Characteristics

### Frontend Performance
- **Bundle Size**: ~646KB JavaScript, ~248KB CSS
- **Lighthouse Score**: 90+ for PWA features
- **Render Time**: <100ms for data updates

### Backend Performance
- **API Response**: <200ms average
- **WebSocket Latency**: <50ms
- **Concurrent Users**: 100+ supported

### IBKR Integration
- **Market Data**: Real-time updates every 3 seconds
- **Authentication**: 24-hour session timeout
- **Rate Limits**: As per IBKR API limits

## Error Handling and Resilience

### Graceful Degradation
1. **IBKR Unavailable**: Fall back to demo mode
2. **Network Issues**: Use cached data
3. **Authentication Failure**: Prompt for re-login
4. **WebSocket Failure**: Fall back to HTTP polling

### Error Recovery
- **Automatic Retry**: Failed requests retried up to 3 times
- **Session Recovery**: Automatic IBKR session renewal
- **State Persistence**: UI state saved in localStorage
- **Offline Mode**: Core features work without network

This architecture provides maximum flexibility while maintaining a professional trading application experience.