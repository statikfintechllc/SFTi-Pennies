<div align="center">
  <a href="https://statikfintechllc.github.io/Ascend-Institute/">
    <img src="https://img.shields.io/badge/SFTi's-darkred?style=for-the-badge&logo=dragon&logoColor=gold"/>
  <a href="https://statikfintechllc.github.io/Ascend-Institute/">
    <img src="https://img.shields.io/badge/Home%20Page-black?style=for-the-badge&logo=ghost&logoColor=gold"/>
  </a><br>
</div> 
<div align="center">
  <a href="https://github.com/sponsors/statikfintechllc">
    <img src="https://skillicons.dev/icons?i=python,bash,linux,anaconda,tailwind,css,react,nodejs,electron,go,typescript,javascript,html,astro,nix&theme=dark" alt="Skill icons">
  </a><br>
  <a href="https://github.com/sponsors/statikfintechllc">
    <img src="https://raw.githubusercontent.com/KDK-Grim/WorkFlowRepo-Mirror/master/docs/ticker-bot/ticker.gif" alt="Repo Ticker Stats" height="36">
  </a>
</div>
<div align="center">
  <img src="https://img.shields.io/github/stars/statikfintechllc/IB-G.Scanner?style=social" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/statikfintechllc/IB-G.Scanner?style=social" alt="Forks"/>
  <img src="https://img.shields.io/github/last-commit/statikfintechllc/IB-G.Scanner?style=social" alt="Last Commit"/>
</div>

# SFTi Stock Scanner

A professional, real-time penny stock scanner with Interactive Brokers (IBKR) integration, featuring AI-powered analysis, pattern recognition, and comprehensive market insights. **Now available as a Progressive Web App (PWA) for mobile deployment!**

## 🌟 Features

- **Real-time Market Data**: Live IBKR integration for accurate penny stock scanning
- **AI-Powered Analysis**: Smart stock recommendations and pattern recognition
- **Progressive Web App**: Install on iPhone/Android for native app experience
- **Browser-Only IBKR**: Direct connection to IBKR Client Portal - no backend required
- **Offline Capability**: Works without internet for cached data and core features
- **Advanced Filtering**: Price, volume, market cap, and float-based filtering
- **Interactive Charts**: Professional candlestick charts with technical indicators
- **Price Alerts**: Real-time notifications for breakout patterns
- **Market Hours Detection**: Dynamic themes based on trading sessions
- **Multi-Tab Interface**: Analyze multiple stocks simultaneously
- **Dark Professional Theme**: Bloomberg Terminal-inspired interface

## 📱 **NEW: Mobile PWA Deployment**

The SFTi Stock Scanner now runs entirely on your phone without needing your computer!

### **Quick Mobile Setup:**
1. **Deploy to HTTPS hosting** (Vercel/Netlify/GitHub Pages)
2. **Open in Safari** on iPhone (or Chrome on Android)
3. **Add to Home Screen** via Share button
4. **Login to IBKR** in app settings
5. **Trade at 3am** without turning on your computer! 🌙📱

**See [PWA-DEPLOYMENT.md](Documentation/PWA-DEPLOYMENT.md) for complete mobile setup guide.**

## 🏗️ Architecture

The SFTi Stock Scanner uses a **hybrid architecture** with multiple integration modes for maximum flexibility:

### **Mode 1: Browser-Direct (Primary)**

```txt
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

### **Mode 2: PWA/Mobile (Mobile-First)**

```txt
┌─────────────────┐    ┌─────────────────┐
│  PWA Frontend   │    │  IBKR Client    │
│  (Mobile)       │◄──►│  Portal Web API │
│  • Service Wrkr │    │  (HTTPS Remote) │
│  • Offline      │    │  • Mobile Auth  │
│  • Push Notifs  │    │  • REST APIs    │
└─────────────────┘    └─────────────────┘
```

### Components

**Primary Architecture:**
1. **React Frontend**: Modern TypeScript React app with tabbed interface, AI pattern recognition
2. **Express Server**: HTTP/WebSocket server providing API proxy, rate limiting, demo mode
3. **IBKR Client Portal Gateway**: Interactive Brokers' official web gateway (localhost:5000)
4. **AI Pattern Service**: Built-in pattern recognition and intelligent stock analysis

**Key Features:**
- **Direct IBKR Integration**: Browser connects directly to Client Portal Gateway
- **Fallback Server Mode**: Express server proxies IBKR APIs when needed  
- **Demo Mode**: Works without IBKR connection for development/testing
- **Real-time Updates**: WebSocket streaming for live market data
- **AI-Powered Analysis**: Pattern recognition and intelligent recommendations

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.19.4+ and npm 10.8.2+
- **Interactive Brokers Account** (paper or live trading)
- **IBKR Client Portal Gateway** (download from IBKR)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/statikfintechllc/IB-G.Scanner.git
   cd IB-G.Scanner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development mode**
   ```bash
   npm run dev
   ```

4. **Open browser**
   Navigate to `http://localhost:4174`

### IBKR Setup

1. **Download IBKR Client Portal Gateway**
   - [Official Download](https://download2.interactivebrokers.com/portal/clientportal.gw.zip)
   - Extract to a folder (e.g., `~/ibkr-gateway`)

2. **Start the Gateway**
   ```bash
   cd ~/ibkr-gateway
   bash bin/run.sh root/conf.yaml
   ```
   - Gateway runs on `https://localhost:5000`
   - Login with your IBKR credentials in the browser

3. **Connect the App**
   - Start the app with `npm run dev`
   - Click the IBKR Settings button
   - App will connect automatically to the authenticated gateway

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production services**
   ```bash
   npm run start:prod
   ```

3. **Access the application**
   - Web App: `http://localhost:4174`
   - API Server: `http://localhost:3000`

## 🔧 Service Management

### Available Scripts

```bash
# Development
npm run dev          # Start React frontend (port 4174)
npm run server       # Start Express server (port 3000)
npm run start:full   # Start both frontend and server

# Production
npm run build        # Build optimized frontend
npm run preview      # Preview production build (port 4174)
npm run start:prod   # Start server + preview

# Utilities
npm run lint         # Run ESLint
npm run kill         # Kill process on port 4174
```

### Service Ports

- **Frontend**: `http://localhost:4174` (development/production)
- **API Server**: `http://localhost:3000` (HTTP + WebSocket on 3001)
- **IBKR Gateway**: `https://localhost:5000` (manual start required)

### Service Dependencies

**Required:**
1. **React Frontend** - User interface and AI pattern analysis
2. **Express Server** - API proxy, WebSocket, rate limiting

**Optional:**
1. **IBKR Client Portal Gateway** - Real-time market data (runs in demo mode without)
2. **Service Worker** - PWA offline functionality

## 🔧 IBKR Setup

### Client Portal Gateway Setup

The application uses IBKR's **Client Portal Gateway** for web-based authentication and market data.

1. **Download Client Portal Gateway**
   - [Official Download Link](https://download2.interactivebrokers.com/portal/clientportal.gw.zip)
   - Requires Java 8+ installed on your system

2. **Extract and Configure**
   ```bash
   # Extract the gateway
   unzip clientportal.gw.zip -d ~/ibkr-gateway
   cd ~/ibkr-gateway
   ```

3. **Start the Gateway**
   ```bash
   # Start the gateway (will open browser for login)
   bash bin/run.sh root/conf.yaml
   ```

4. **Authenticate**
   - Gateway opens browser to `https://localhost:5000`
   - Login with your IBKR username and password
   - Accept the security certificate warning
   - Keep the gateway running while using the app

5. **Connect the App**
   - Start the scanner: `npm run dev`
   - Click the IBKR Settings button in the app
   - App automatically detects and connects to authenticated gateway

### Account Requirements

- **IBKR Pro Account** (API access required - not available on IBKR Lite)
- **Market Data Subscription** for real-time quotes
- **Paper Trading** or funded account for live trading

### Troubleshooting

**Gateway Won't Start:**
- Ensure Java 8+ is installed: `java -version`
- Check if port 5000 is available
- Disable firewall/antivirus temporarily

**Authentication Failed:**
- Only one session allowed - logout from TWS/Mobile if connected
- Clear browser cookies and try again
- Restart gateway: `Ctrl+C` then `bash bin/run.sh root/conf.yaml`

**No Market Data:**
- Verify market data subscriptions in IBKR account
- Check that paper trading mode has data access
- Ensure gateway session is still authenticated
   - Add `127.0.0.1` to trusted IPs
   - Enable "Download open orders on connection"

3. **Paper Trading Setup** (Recommended for testing)
   - Use paper trading account for safe testing
   - Login to TWS with paper trading credentials
   - Verify connection in the app's IBKR Settings

## 📱 Cross-Platform Deployment

### Desktop Application (PWA)

The scanner can be installed as a Progressive Web App:

1. **Chrome/Edge**: Click install icon in address bar
2. **Firefox**: Use "Install this site as an app" from menu
3. **Safari**: Add to Dock from Share menu

### Mobile Installation

1. **iOS**: 
   - Open in Safari
   - Tap Share → Add to Home Screen
   
2. **Android**:
   - Open in Chrome
   - Tap menu → Add to Home Screen

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Shadcn UI components
│   ├── AISearch.tsx    # AI-powered search
│   ├── AlertsManager.tsx # Alert system
│   ├── IBKRSettings.tsx # IBKR configuration
│   └── ...
├── lib/                # Core logic
│   ├── ibkr.ts        # IBKR API integration
│   ├── alerts.ts      # Alert system
│   └── market.ts      # Market hours detection
├── types/              # TypeScript definitions
└── assets/            # Static assets
```

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type checking
npm run build
```

### Environment Configuration

Create `.env.local` for custom configuration:

```env
# IBKR Configuration
VITE_IBKR_HOST=127.0.0.1
VITE_IBKR_PORT=7497
VITE_IBKR_CLIENT_ID=1

# API Keys (optional)
VITE_ALPHA_VANTAGE_KEY=your_key_here
VITE_POLYGON_API_KEY=your_key_here
```

## 🔧 Configuration

### Scanner Filters

Default filter settings can be modified in `src/App.tsx`:

```typescript
const DEFAULT_FILTERS: ScannerFilters = {
  priceMin: 0.01,      // Minimum price
  priceMax: 5.00,      // Maximum price (penny stock definition)
  marketCapMin: 1_000_000,     // $1M minimum
  marketCapMax: 2_000_000_000, // $2B maximum
  floatMin: 1_000_000,         // 1M shares minimum
  floatMax: 1_000_000_000,     // 1B shares maximum
  volumeMin: 100_000,          // Minimum daily volume
  changeMin: -100,             // Minimum % change
  changeMax: 100,              // Maximum % change
  newsOnly: false              // Filter by news availability
};
```

### Market Hours

The app automatically detects market sessions and applies appropriate themes:

- **Pre-market** (4:00-9:30 AM EST): Dark red theme
- **Regular** (9:30 AM-4:00 PM EST): Bright red theme  
- **After-hours** (4:00-8:00 PM EST): Deep gold theme
- **Closed**: Neutral gray theme

## 🚨 Troubleshooting

### Common Issues

**IBKR Connection Failed**
- Verify TWS/Gateway is running
- Check API settings are enabled
- Confirm port configuration (7497 for TWS, 4001 for Gateway)
- Add 127.0.0.1 to trusted IPs

**No Market Data**
- Ensure market data subscriptions are active in IBKR account
- Verify account permissions for penny stocks
- Check if market is open (data may be delayed when closed)

**Performance Issues**
- Limit number of open chart tabs (max 6)
- Clear browser cache
- Close unused tabs to free memory
- Check internet connection stability

### Error Messages

- **"IBKR connection failed - running in demo mode"**: Normal when TWS isn't running
- **"Maximum 6 tabs allowed"**: Close existing tabs before opening new ones
- **"No stocks match criteria"**: Adjust filter settings to broaden search

## 📊 Data Sources

- **Primary**: Interactive Brokers TWS API
- **Charts**: IBKR real-time data with TradingView-style rendering
- **News**: Integrated IBKR news feed
- **Float Data**: IBKR fundamental data when available

## 🔐 Security

- All API keys stored locally (never transmitted)
- IBKR connections use local socket connections
- No sensitive data stored on external servers
- User preferences encrypted in local storage

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:

1. Check troubleshooting section above
2. Verify IBKR setup is correct
3. Review browser console for errors
4. Ensure all prerequisites are installed

## 🔄 Updates

The app includes an automatic update system:
- Beta toggle in settings for daily updates
- Production updates via standard deployment
- No manual intervention required

---

**⚠️ Disclaimer**: This software is for educational and analysis purposes. Always verify data independently before making trading decisions. Past performance does not guarantee future results.

---

<div align="center">
  <a href="https://github.com/sponsors/statikfintechllc">
    <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/L.W.badge.svg" alt="Like my work?" />
  </a>
</div>
<div align="center">
<a href="https://github.com/sponsors/statikfintechllc">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/git.sponsor.svg">
</a><br>
<a href="https://ko-fi.com/statikfintech_llc">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/kofi.sponsor.svg">
</a><br>
<a href="https://patreon.com/StatikFinTech_LLC">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/patreon.sponsor.svg">
</a><br>
<a href="https://cash.app/$statikmoney8">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/cashapp.sponsor.svg">
</a><br>
<a href="https://paypal.me/statikmoney8">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/paypal.sponsor.svg">
</a><br>
<a href="https://www.blockchain.com/explorer/addresses/btc/bc1qarsr966ulmcs3mlcvae7p63v4j2y2vqrw74jl8">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/bitcoin.sponsor.svg">
</a><br>
<a href="https://etherscan.io/address/0xC2db50A0fc6c95f36Af7171D8C41F6998184103F">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/ethereum.sponsor.svg">
</a><br>
<a href="https://www.chime.com">
  <img src="https://raw.githubusercontent.com/statikfintechllc/statikfintechllc/master/badges/chime.sponsor.svg">
</a>
</div>
<div align="center">

  <br/> [© 2025 StatikFinTech, LLC](https://www.github.com/statikfintechllc/GremlinGPT/blob/master/LICENSE.md)

  <a href="https://github.com/statikfintechllc">
    <img src="https://img.shields.io/badge/-000000?logo=github&logoColor=white&style=flat-square" alt="GitHub">
  </a>
  <a href="https://www.linkedin.com/in/daniel-morris-780804368">
    <img src="https://img.shields.io/badge/In-e11d48?logo=linkedin&logoColor=white&style=flat-square" alt="LinkedIn">
  </a>
  <a href="mailto:ascend.gremlin@gmail.com">
    <img src="https://img.shields.io/badge/-D14836?logo=gmail&logoColor=white&style=flat-square" alt="Email">
  </a>
  <a href="https://www.youtube.com/@Gremlins_Forge">
    <img src="https://img.shields.io/badge/-FF0000?logo=youtube&logoColor=white&style=flat-square" alt="YouTube">
  </a>
  <a href="https://x.com/GremlinsForge">
    <img src="https://img.shields.io/badge/-000000?logo=x&logoColor=white&style=flat-square" alt="X">
  </a>
  <a href="https://medium.com/@ascend.gremlin">
    <img src="https://img.shields.io/badge/-000000?logo=medium&logoColor=white&style=flat-square" alt="Medium">
  </a>  
</div>

<!--
<div align="center">
  <img src="https://komarev.com/ghpvc/?username=statikfintechllc&color=8b0000&style=flat-square" alt="Profile Views">
</div>
-->
