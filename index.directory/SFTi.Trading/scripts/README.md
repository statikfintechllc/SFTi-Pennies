# SFTi Stock Scanner — Scripts & Service Guide

This file documents the repository npm scripts, how to run the application locally, configuration examples, and quick troubleshooting steps.

## npm scripts (from package.json)

1. `npm run dev` — start Vite dev server (frontend) on port 4174
1. `npm run server` — run the Node server (`scripts/server.js`)
1. `npm run router` — run the optional router service (`scripts/router.js`)
1. `npm run build` — TypeScript build and Vite production build
1. `npm run preview` — serve the `dist/` build with Vite preview on port 4174
1. `npm run start:full` — run `server` and `dev` concurrently (development)
1. `npm run start:prod` — run `server` and `preview` concurrently (production preview)
1. `npm run lint` — run ESLint across the repository

Default ports used by the project (configurable via env):

1. Frontend (Vite dev / preview): 4174
1. API Server: 3000
1. WebSocket Server: 3001
1. Router (optional): 8080

## Run locally

Install dependencies once:

```bash
npm install
```

Recommended development (starts server and frontend with HMR):

```bash
npm run start:full
```

Production preview (build then preview):

```bash
npm run build
npm run start:prod
```

Run the server only (if you want to connect a custom frontend):

```bash
npm run server
```

Run the optional router service (when using a local IBKR gateway):

```bash
npm run router
```

Open the frontend at: `http://localhost:4174`

## Configuration examples

Server and router support configuration via environment variables. Example `.env` snippets:

Router example (`~/.sfti-scanner/config/router/.env`):

```env
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
ROUTER_PORT=8080
ROUTER_HOST=0.0.0.0
```

Server example (`~/.sfti-scanner/config/server/.env`):

```env
SERVER_PORT=3000
WS_PORT=3001
SERVER_HOST=0.0.0.0
CORS_ORIGIN=*
```

## Useful troubleshooting

- Frontend shows "Failed to load module script" (server responded with text/html): confirm `dist/` has the built assets and the preview server is serving them. If using the local server as a proxy, make sure it isn't returning `index.html` for asset paths.
- Manifest icon or image 404s: validate `public/manifest.json` icon paths and confirm build copies images into `dist/assets`.
- IBKR Gateway (local) connectivity: ensure Client Portal Gateway is running at `https://localhost:5000` and accept the self-signed certificate in your browser / trust store for automation.

## Where to look in the repo

- Frontend source: `src/` (React + TypeScript)
- Server: `scripts/server.js`
- Router: `scripts/router.js` (optional, not always present in every setup)
- PWA assets and manifest: `public/`

## Production notes (short)

- Use a process manager (PM2) or systemd for server processes.
- Use a reverse proxy (nginx) for TLS termination and static hosting.
- Use Redis for optional caching/session storage in production.

If you'd like, I can add `scripts/install.sh` usage examples, systemd unit templates, or a small `scripts/healthcheck.sh` helper next. Which would you prefer?
# SFTi Stock Scanner - Installation and Server Architecture

This document describes the complete installation system and distributed server architecture for the SFTi Stock Scanner application.

## Architecture Overview

The system consists of three main components:

1. **Router Service** - Connects to IBKR TWS/Gateway and manages market data
2. **Server Service** - Public-facing API server that serves the web application
3. **Web Application** - React-based frontend that connects to the server

# SFTi Stock Scanner - Installation and Server Architecture

This document describes the installation system and service architecture for the SFTi Stock Scanner application. It also documents useful repository scripts so maintainers can run the app locally.
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        ▲
                                                        │
                                               ┌─────────────────┐
                                               │  Web Clients    │
                                               │  (Browser/PWA)  │
                                               └─────────────────┘
```

## Installation

### Automatic Installation

The system includes cross-platform installation scripts that handle everything automatically.

#### Linux/macOS:
```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/sfti-scanner/main/scripts/install.sh | bash
```

Or download and run manually:
```bash
chmod +x install.sh
./install.sh
```
# SFTi Stock Scanner - Installation and Server Architecture

This document describes the installation system and service architecture for the SFTi Stock Scanner application. It also documents useful repository scripts so maintainers can run the app locally.

## Architecture Overview

The system consists of three main components:

1. **Router Service** - Connects to IBKR TWS/Gateway and manages market data
2. **Server Service** - Public-facing API server that serves the web application
3. **Web Application** - React-based frontend that connects to the server

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   IBKR TWS/     │    │  Router Service │    │  Server Service │
│   Gateway       │◄──►│  (Port 8080)    │◄──►│  (Port 3000)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        ▲
                                                        │
                                               ┌─────────────────┐
                                               │  Web Clients    │
                                               │  (Browser/PWA)  │
                                               └─────────────────┘
```

## Project scripts (what's in `package.json`)

The repository defines several npm scripts you should use to run and build the project. These are kept in `package.json`.

1. `npm run dev` — start Vite dev server (front-end) on port 4174
1. `npm run server` — run the local Node server (`scripts/server.js`)
1. `npm run router` — run the optional router service (`scripts/router.js`) when needed
1. `npm run build` — run TypeScript build and Vite production build
1. `npm run preview` — serve the `dist/` build with Vite preview on port 4174
1. `npm run start:full` — run `server` and `dev` concurrently (development)
1. `npm run start:prod` — run `server` and `preview` concurrently (production preview)
1. `npm run lint` — run ESLint on the repository

Ports used by the repository (defaults):

1. Frontend (Vite dev / preview): 4174
1. Server (API proxy/express): 3000
1. WebSocket (server): 3001
1. Router (optional IBKR router): 8080

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Development (recommended): start the server and the dev frontend together:

```bash
npm run start:full
```

Open the browser at `http://localhost:4174`.

3. Production preview (build and preview):

```bash
npm run build
npm run start:prod
```

This will build the frontend into `dist/`, start the local Node server and a Vite preview server for the static assets. Preview will be available at `http://localhost:4174` and the API server at `http://localhost:3000`.

4. Run server only (useful for attaching a custom frontend):

```bash
npm run server
```

5. Run router (if you run a local IBKR gateway and want the router service):

```bash
npm run router
```

## Installation

### Automatic Installation

The system includes cross-platform installation scripts that can handle setup and service installation. Example:

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/sfti-scanner/main/scripts/install.sh | bash
```

Or run the local installer:

```bash
chmod +x install.sh
./install.sh
```

### Manual Installation

If you prefer manual installation:

1. Install Dependencies: Node.js 18+, Git
1. Clone and Setup:

```bash
git clone <repository-url>
cd IB-G.Scanner
npm install
```

1. Configure Services: copy templates from `scripts/` and set env vars as appropriate.

## Configuration

### Router Service Configuration (example)

File: `~/.sfti-scanner/config/router/.env`

```env
# IBKR Connection Settings
IBKR_HOST=127.0.0.1
IBKR_PORT=7497

# Router Settings
ROUTER_PORT=8080
ROUTER_HOST=0.0.0.0
```

### Server Service Configuration (example)

File: `~/.sfti-scanner/config/server/.env`

```env
SERVER_PORT=3000
WS_PORT=3001
SERVER_HOST=0.0.0.0
CORS_ORIGIN=*
```

## Service Management

Instructions for systemd/launchd/Windows service management and universal start/stop scripts are included below. Use these only if you installed the application as a system service.

### Linux (systemd)

```bash
# Start services
sudo systemctl start sfti-router
sudo systemctl start sfti-server

# Enable auto-start
sudo systemctl enable sfti-router
sudo systemctl enable sfti-server

# Check status
sudo systemctl status sfti-router
sudo systemctl status sfti-server

# View logs
sudo journalctl -f -u sfti-router
sudo journalctl -f -u sfti-server
```

### macOS (launchd)

```bash
# Load services
launchctl load ~/Library/LaunchAgents/com.sfti.router.plist
launchctl load ~/Library/LaunchAgents/com.sfti.server.plist
```

### Windows

Manual start/stop scripts are provided under `%USERPROFILE%\.sfti-scanner\` if the installer was used.

## API Endpoints

Common endpoints the frontend calls (proxied by the server):

- `GET /api/market-data`
- `POST /api/scan`
- `GET /api/watchlist`
- `POST /api/watchlist`
- `GET /api/chart/:symbol`

See source in `scripts/server.js` for concrete routes and proxy behavior.

## WebSocket Events

The local WebSocket server is available at `ws://localhost:3001` for real-time updates. Example client usage is provided in the original README.

## Troubleshooting

Common issues and quick checks:

- If the frontend fails to load, confirm `npm run server` and `npm run preview` or `npm run dev` are running and reachable.
- Check browser console for module/script MIME errors (missing assets). This often indicates the build output isn't available or a proxy is returning HTML for asset paths.
- For IBKR gateway connections, verify the Gateway / Client Portal is running at `https://localhost:5000` and the Java gateway process is healthy.

## Production Deployment

Recommendations for production: process manager (PM2), reverse proxy (nginx), TLS termination, and monitoring. Example nginx config remains at the bottom of this file.

The rest of the original troubleshooting, firewall, and nginx examples remain valid.

