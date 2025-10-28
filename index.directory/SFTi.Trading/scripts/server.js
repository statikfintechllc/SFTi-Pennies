import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import axios from 'axios';
import https from 'https';
import dotenv from 'dotenv';
dotenv.config();

class SFTiServer {
    constructor() {
        this.app = express();
        this.server = null;
        this.wss = null;
        this.clients = new Set();
        this.marketData = new Map();
        this.lastUpdate = new Date();
        this.ibkrAuthenticated = false;
        
        // IBKR Client Portal Gateway configuration
        this.ibkrConfig = {
            gatewayUrl: process.env.IBKR_GATEWAY_URL || 'https://localhost:5000',
            baseUrl: process.env.IBKR_BASE_URL || 'https://localhost:5000/v1/api',
            timeout: parseInt(process.env.IBKR_TIMEOUT) || 30000,
            retryInterval: parseInt(process.env.IBKR_RETRY_INTERVAL) || 60000
        };
        
        // Server configuration
        this.config = {
            port: process.env.SERVER_PORT || 3000,
            wsPort: process.env.WS_PORT || 3001,
            host: process.env.SERVER_HOST || '0.0.0.0',
            corsOrigin: process.env.CORS_ORIGIN || '*',
            rateLimit: {
                window: parseInt(process.env.RATE_LIMIT_WINDOW) || 60000,
                max: parseInt(process.env.RATE_LIMIT_MAX) || 1000
            }
        };
        
        // Axios instance for IBKR API calls
        this.ibkrClient = axios.create({
            baseURL: this.ibkrConfig.baseUrl,
            timeout: this.ibkrConfig.timeout,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // For localhost SSL
            }),
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SFTi-Scanner/1.0'
            }
        });
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.startIBKRHealthCheck();
    }
    
    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    scriptSrc: ["'self'", "'unsafe-eval'"],
                    connectSrc: ["'self'", `ws://localhost:${this.config.wsPort}`, `wss://localhost:${this.config.wsPort}`],
                    imgSrc: ["'self'", "data:", "https:"]
                }
            }
        }));
        
        // CORS
        this.app.use(cors({
            origin: this.config.corsOrigin,
            credentials: true
        }));
        
        // Compression
        this.app.use(compression());
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        
        // Rate limiting
        const rateLimiter = new RateLimiterMemory({
            keyGenerator: (req) => req.ip,
            points: this.config.rateLimit.max,
            duration: this.config.rateLimit.window / 1000
        });
        
        this.app.use(async (req, res, next) => {
            try {
                await rateLimiter.consume(req.ip);
                next();
            } catch (rejRes) {
                const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
                res.set('Retry-After', String(secs));
                res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: secs
                });
            }
        });
        
        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }
    
    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                ibkrConnected: this.ibkrAuthenticated,
                activeClients: this.clients.size,
                marketDataAge: Date.now() - this.lastUpdate.getTime()
            });
        });
        
        // IBKR Authentication endpoints
        this.app.post('/api/ibkr/auth/status', async (req, res) => {
            try {
                const response = await this.ibkrRequest('POST', '/iserver/auth/status', {});
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ error: 'IBKR auth status check failed', details: error.message });
            }
        });
        
        this.app.post('/api/ibkr/auth/init', async (req, res) => {
            try {
                const response = await this.ibkrRequest('POST', '/iserver/auth/ssodh/init', {});
                this.ibkrAuthenticated = response.data.authenticated || false;
                res.json(response.data);
            } catch (error) {
                res.status(500).json({ error: 'IBKR authentication failed', details: error.message });
            }
        });
        
        // Market data endpoints
        this.app.get('/api/market-data', async (req, res) => {
            try {
                const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
                
                if (symbols.length === 0) {
                    return res.json(Array.from(this.marketData.values()));
                }
                
                // Get real-time data from IBKR
                const marketData = await this.getMarketDataFromIBKR(symbols);
                res.json(marketData);
            } catch (error) {
                console.error('Market data request failed:', error);
                res.status(500).json({ error: 'Market data request failed' });
            }
        });
        
        this.app.get('/api/market-data/:symbol', async (req, res) => {
            try {
                const { symbol } = req.params;
                const marketData = await this.getMarketDataFromIBKR([symbol]);
                
                if (!marketData || marketData.length === 0) {
                    return res.status(404).json({ error: 'Symbol not found' });
                }
                
                res.json(marketData[0]);
            } catch (error) {
                console.error('Market data request failed:', error);
                res.status(500).json({ error: 'Market data request failed' });
            }
        });
        
        // Scanner endpoints
        this.app.post('/api/scan', async (req, res) => {
            try {
                const filters = req.body;
                const scannerData = await this.runIBKRScanner(filters);
                res.json(scannerData);
            } catch (error) {
                console.error('Scanner request failed:', error);
                res.status(500).json({ error: 'Scanner request failed' });
            }
        });
        
        // Portfolio endpoints
        this.app.get('/api/portfolio', async (req, res) => {
            try {
                const response = await this.ibkrRequest('GET', '/portfolio/accounts');
                res.json(response.data);
            } catch (error) {
                console.error('Portfolio request failed:', error);
                res.status(500).json({ error: 'Portfolio request failed' });
            }
        });
        
        // Orders endpoints
        this.app.get('/api/orders', async (req, res) => {
            try {
                const response = await this.ibkrRequest('GET', '/iserver/orders');
                res.json(response.data);
            } catch (error) {
                console.error('Orders request failed:', error);
                res.status(500).json({ error: 'Orders request failed' });
            }
        });
        
        this.app.post('/api/orders', async (req, res) => {
            try {
                const orderData = req.body;
                const response = await this.ibkrRequest('POST', '/iserver/orders', orderData);
                res.json(response.data);
            } catch (error) {
                console.error('Order placement failed:', error);
                res.status(500).json({ error: 'Order placement failed' });
            }
        });
        
        // AI endpoints (mock for now)
        this.app.post('/api/ai/search', async (req, res) => {
            try {
                const { query } = req.body;
                // Mock AI search - replace with actual AI service
                const response = {
                    suggestions: [`AI analysis for: ${query}`],
                    insights: [`Market insight: ${query} trending analysis`],
                    symbols: ['AAPL', 'MSFT', 'GOOGL'] // Mock symbols
                };
                res.json(response);
            } catch (error) {
                console.error('AI search failed:', error);
                res.status(500).json({ error: 'AI search failed' });
            }
        });
        
        this.app.get('/api/ai/insights', async (req, res) => {
            try {
                // Mock market insights - replace with actual AI service
                const response = {
                    marketSentiment: 'Bullish',
                    topGainers: ['NVDA', 'AMD', 'TSLA'],
                    topLosers: ['META', 'NFLX', 'SPOT'],
                    lastUpdate: new Date().toISOString()
                };
                res.json(response);
            } catch (error) {
                console.error('AI insights failed:', error);
                res.status(500).json({ error: 'AI insights failed' });
            }
        });
        
        // Serve static files (the web app)
        this.app.use(express.static('dist'));
        
        // Fallback for SPA
        this.app.use((req, res) => {
            res.sendFile('index.html', { root: 'dist' });
        });
        
        // Error handling
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
            });
        });
    }
    
    setupWebSocket() {
        this.wss = new WebSocketServer({ 
            port: this.config.wsPort,
            host: this.config.host
        });
        
        this.wss.on('connection', (ws, req) => {
            console.log(`WebSocket client connected from ${req.connection.remoteAddress}`);
            this.clients.add(ws);
            
            // Send current market data to new client
            ws.send(JSON.stringify({
                type: 'connection',
                status: 'connected',
                ibkrStatus: this.ibkrAuthenticated ? 'authenticated' : 'not authenticated',
                timestamp: new Date().toISOString()
            }));
            
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    
                    switch (data.type) {
                        case 'subscribe':
                            await this.handleSubscription(ws, data.symbols);
                            break;
                            
                        case 'unsubscribe':
                            await this.handleUnsubscription(ws, data.symbols);
                            break;
                            
                        case 'ping':
                            ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                            break;
                            
                        default:
                            console.log('Unknown WebSocket message type:', data.type);
                    }
                } catch (error) {
                    console.error('WebSocket message error:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Invalid message format',
                        timestamp: Date.now()
                    }));
                }
            });
            
            ws.on('close', () => {
                console.log('WebSocket client disconnected');
                this.clients.delete(ws);
            });
            
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
        
        console.log(`WebSocket server listening on ${this.config.host}:${this.config.wsPort}`);
    }
    
    async handleSubscription(ws, symbols) {
        try {
            // Subscribe to real-time market data via IBKR WebSocket
            const response = await this.subscribeToMarketData(symbols);
            ws.send(JSON.stringify({
                type: 'subscribed',
                symbols,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Subscription failed:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Subscription failed',
                timestamp: Date.now()
            }));
        }
    }
    
    async handleUnsubscription(ws, symbols) {
        try {
            // Unsubscribe from market data
            await this.unsubscribeFromMarketData(symbols);
            ws.send(JSON.stringify({
                type: 'unsubscribed',
                symbols,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Unsubscription failed:', error);
        }
    }
    
    // IBKR API helper methods
    async ibkrRequest(method, endpoint, data = {}) {
        try {
            const config = {
                method,
                url: endpoint,
                ...(method === 'POST' || method === 'PUT' ? { data } : {})
            };
            
            const response = await this.ibkrClient.request(config);
            return response;
        } catch (error) {
            console.error(`IBKR API Error (${method} ${endpoint}):`, error.message);
            throw error;
        }
    }
    
    async getMarketDataFromIBKR(symbols) {
        try {
            // Get contract IDs for symbols first
            const contracts = await this.getContractDetails(symbols);
            
            // Get market data snapshots
            const marketDataPromises = contracts.map(async (contract) => {
                try {
                    const response = await this.ibkrRequest('GET', `/iserver/marketdata/snapshot?conids=${contract.conid}&fields=31,84,85,86`);
                    return {
                        symbol: contract.symbol,
                        conid: contract.conid,
                        price: response.data[0]?.['31'] || 0,
                        bid: response.data[0]?.['84'] || 0,
                        ask: response.data[0]?.['85'] || 0,
                        volume: response.data[0]?.['86'] || 0,
                        timestamp: new Date().toISOString()
                    };
                } catch (error) {
                    console.error(`Failed to get market data for ${contract.symbol}:`, error.message);
                    return null;
                }
            });
            
            const results = await Promise.all(marketDataPromises);
            return results.filter(Boolean);
        } catch (error) {
            console.error('Failed to get market data from IBKR:', error);
            return [];
        }
    }
    
    async getContractDetails(symbols) {
        try {
            const searchPromises = symbols.map(async (symbol) => {
                try {
                    const response = await this.ibkrRequest('POST', '/iserver/secdef/search', {
                        symbol: symbol.toUpperCase(),
                        name: false,
                        secType: 'STK'
                    });
                    
                    if (response.data && response.data.length > 0) {
                        return {
                            symbol: symbol.toUpperCase(),
                            conid: response.data[0].conid,
                            exchange: response.data[0].exchange
                        };
                    }
                    return null;
                } catch (error) {
                    console.error(`Failed to search contract for ${symbol}:`, error.message);
                    return null;
                }
            });
            
            const results = await Promise.all(searchPromises);
            return results.filter(Boolean);
        } catch (error) {
            console.error('Failed to get contract details:', error);
            return [];
        }
    }
    
    async runIBKRScanner(filters) {
        try {
            // Get scanner parameters first
            const paramsResponse = await this.ibkrRequest('GET', '/iserver/scanner/params');
            
            // Build scanner subscription
            const scannerData = {
                instrument: 'STK',
                locations: 'STK.US.MAJOR',
                scanCode: 'TOP_PERC_GAIN',
                secType: 'STK',
                numberOfRows: 50,
                ...filters
            };
            
            const response = await this.ibkrRequest('POST', '/iserver/scanner/run', scannerData);
            return response.data;
        } catch (error) {
            console.error('IBKR scanner failed:', error);
            // Return mock data for demo
            return {
                contracts: [
                    { symbol: 'AAPL', price: 150.00, change: 2.5, volume: 1000000 },
                    { symbol: 'MSFT', price: 300.00, change: 1.8, volume: 800000 },
                    { symbol: 'GOOGL', price: 2500.00, change: 15.0, volume: 500000 }
                ]
            };
        }
    }
    
    async subscribeToMarketData(symbols) {
        // Implementation for WebSocket subscription to IBKR market data
        console.log('Subscribing to market data for:', symbols);
        return { subscribed: symbols };
    }
    
    async unsubscribeFromMarketData(symbols) {
        // Implementation for WebSocket unsubscription
        console.log('Unsubscribing from market data for:', symbols);
        return { unsubscribed: symbols };
    }
    
    startIBKRHealthCheck() {
        // Check IBKR authentication status every minute
        setInterval(async () => {
            try {
                const response = await this.ibkrRequest('POST', '/iserver/auth/status', {});
                this.ibkrAuthenticated = response.data.authenticated || false;
                
                if (!this.ibkrAuthenticated) {
                    console.log('IBKR not authenticated. Please authenticate via Client Portal Gateway.');
                }
            } catch (error) {
                this.ibkrAuthenticated = false;
                console.log('IBKR health check failed:', error.message);
            }
        }, this.ibkrConfig.retryInterval);
    }
    
    broadcast(message) {
        const messageStr = JSON.stringify(message);
        
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(messageStr);
                } catch (error) {
                    console.error('Failed to send message to client:', error);
                    this.clients.delete(client);
                }
            }
        });
    }
    
    start() {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
            console.log(`SFTi Server listening on http://${this.config.host}:${this.config.port}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`CORS Origin: ${this.config.corsOrigin}`);
            console.log(`IBKR Gateway URL: ${this.ibkrConfig.gatewayUrl}`);
            console.log('');
            console.log('To use IBKR features:');
            console.log('1. Download and run IBKR Client Portal Gateway');
            console.log('2. Access: https://localhost:5000');
            console.log('3. Login with your IBKR credentials');
            console.log('4. The server will automatically detect authentication');
        });
        
        // Graceful shutdown
        process.on('SIGTERM', this.shutdown.bind(this));
        process.on('SIGINT', this.shutdown.bind(this));
    }
    
    shutdown() {
        console.log('Shutting down server...');
        
        if (this.wss) {
            this.wss.close();
        }
        
        if (this.server) {
            this.server.close(() => {
                console.log('Server shut down complete');
                process.exit(0);
            });
        }
    }
}

// Start the server
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new SFTiServer();
    server.start();
}

export default SFTiServer;
