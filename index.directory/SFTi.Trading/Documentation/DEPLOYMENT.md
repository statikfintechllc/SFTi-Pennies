# SFTi Stock Scanner - Deployment Guide

## 🚀 Deployment Options Overview

The SFTi Stock Scanner supports **hybrid deployment architectures** with multiple IBKR integration modes:

### **Option A: PWA Deployment (Recommended for Mobile)**
- **Best for**: Mobile users, 3AM trading, independent operation
- **Requirements**: HTTPS hosting only
- **IBKR Connection**: Direct browser to IBKR Client Portal Web API
- **Infrastructure**: Zero server requirements
- **Architecture**: Frontend + Service Worker + IBKR Web API

### **Option B: Full Stack Deployment (Recommended for Desktop)**
- **Best for**: Desktop users, multi-user environments, enterprise
- **Requirements**: Server + IBKR Client Portal Gateway
- **IBKR Connection**: Express server proxy + Direct browser connection
- **Infrastructure**: React frontend + Express server + IBKR Gateway
- **Architecture**: Frontend + Backend + Gateway

### **Option C: Development/Local Setup**
- **Best for**: Development, testing, local use
- **Requirements**: Node.js + IBKR Client Portal Gateway
- **Architecture**: Local dev server + Local gateway

---

## 📱 **PWA Mobile Deployment**

### Quick Setup

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Deploy to HTTPS hosting**
   - Vercel: `vercel --prod`
   - Netlify: Drag `dist/` folder to netlify.com
   - GitHub Pages: Push to `gh-pages` branch

3. **Install on mobile**
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Add to Home screen

4. **Setup IBKR**
   - Open PWA → Settings → IBKR Settings
   - Login to IBKR Client Portal in popup
   - App connects automatically

**Detailed guide**: [PWA-DEPLOYMENT.md](PWA-DEPLOYMENT.md)

---

## 🖥️ **Full Stack Deployment**

This is the recommended production deployment with both frontend and backend services.

### Prerequisites

- Server with Node.js 20.19.4+
- IBKR Client Portal Gateway installed
- SSL certificate (Let's Encrypt recommended)
- Domain name or static IP

### Step 1: Server Setup

# 3. Create systemd services (Linux)
sudo tee /etc/systemd/system/sfti-server.service > /dev/null <<EOF
[Unit]
Description=SFTi Stock Scanner Server
After=network.target

[Service]
Type=simple
User=sfti
WorkingDirectory=/home/sfti/sfti-stock-scanner
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=WS_PORT=3002

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/sfti-router.service > /dev/null <<EOF
[Unit]
Description=SFTi IBKR Router
After=network.target

[Service]
Type=simple
User=sfti
WorkingDirectory=/home/sfti/sfti-stock-scanner
ExecStart=/usr/bin/node router.js
Restart=always
Environment=NODE_ENV=production
Environment=IBKR_HOST=127.0.0.1
Environment=IBKR_PORT=7497

[Install]
WantedBy=multi-user.target
EOF

# 4. Enable and start services
sudo systemctl daemon-reload
sudo systemctl enable sfti-server sfti-router
sudo systemctl start sfti-server sfti-router
```

### Option 2: Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose ports
EXPOSE 3001 3002 4173

# Start services
CMD ["npm", "run", "start:prod"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  sfti-app:
    build: .
    ports:
      - "3001:3001"   # API Server
      - "3002:3002"   # WebSocket
      - "4173:4173"   # Web App
    environment:
      - NODE_ENV=production
      - IBKR_HOST=host.docker.internal
      - IBKR_PORT=7497
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - sfti-app
    restart: unless-stopped
```

### Option 3: Cloud Deployment (AWS/GCP/Azure)

#### AWS Deployment

```bash
# 1. Create EC2 instance (t3.medium recommended)
# 2. Install Docker and Docker Compose
# 3. Clone and deploy

# Auto-scaling with Load Balancer
aws elbv2 create-load-balancer \
  --name sfti-scanner-lb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx

# RDS for data persistence (optional)
aws rds create-db-instance \
  --db-instance-identifier sfti-scanner-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password yourpassword
```

## 🔒 Security Configuration

### SSL/TLS Setup

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=3001
WS_PORT=3002
HOST=0.0.0.0

# IBKR Configuration
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1

# CORS Origins (comma-separated)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/sfti-scanner.log
```

## 📊 Monitoring & Logging

### Health Checks

```bash
# Check service health
curl http://localhost:3001/health

# Response
{
  "status": "healthy",
  "timestamp": 1640995200000,
  "router_connected": true,
  "active_clients": 5,
  "market_data_symbols": 150
}
```

### Log Monitoring

```bash
# View logs
sudo journalctl -u sfti-server -f
sudo journalctl -u sfti-router -f

# Log rotation
sudo tee /etc/logrotate.d/sfti-scanner > /dev/null <<EOF
/var/log/sfti-scanner.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 sfti sfti
}
EOF
```

### Performance Monitoring

```javascript
// Add to server.js for metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
    name: 'websocket_connections_active',
    help: 'Number of active WebSocket connections'
});
```

## 🔄 Backup & Recovery

### Data Backup

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups/sfti-scanner"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup configuration
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /home/sfti/sfti-stock-scanner/.env* \
    /home/sfti/sfti-stock-scanner/data/

# Backup database (if using)
pg_dump sfti_scanner > $BACKUP_DIR/database_$DATE.sql

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Disaster Recovery

```bash
#!/bin/bash
# restore.sh
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop services
sudo systemctl stop sfti-server sfti-router

# Restore configuration
tar -xzf $BACKUP_FILE -C /

# Restart services
sudo systemctl start sfti-server sfti-router

echo "Restore completed"
```

## 🚀 Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'

services:
  sfti-app:
    build: .
    deploy:
      replicas: 3
    environment:
      - NODE_ENV=production
    networks:
      - sfti-network

  redis:
    image: redis:alpine
    networks:
      - sfti-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    depends_on:
      - sfti-app
    networks:
      - sfti-network

networks:
  sfti-network:
    driver: bridge
```

### Load Balancing

```nginx
# nginx-lb.conf
upstream sfti_backend {
    least_conn;
    server sfti-app:3001 max_fails=3 fail_timeout=30s;
    server sfti-app:3001 max_fails=3 fail_timeout=30s;
    server sfti-app:3001 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    
    location /api/ {
        proxy_pass http://sfti_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 🛠️ Maintenance

### Regular Tasks

```bash
# Daily maintenance script
#!/bin/bash
# maintenance.sh

# Update market data
systemctl restart sfti-router

# Clear old logs
journalctl --vacuum-time=30d

# Update dependencies (weekly)
if [ $(date +%u) -eq 1 ]; then
    cd /home/sfti/sfti-stock-scanner
    npm audit fix
    npm update
    npm run build
    systemctl restart sfti-server
fi

# Health check
curl -f http://localhost:3001/health || systemctl restart sfti-server
```

### Crontab Setup

```bash
# Add to crontab
0 2 * * * /opt/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1
0 0 * * 0 /opt/scripts/backup.sh >> /var/log/backup.log 2>&1
```

This deployment guide provides comprehensive instructions for production deployment across various platforms and scaling scenarios.