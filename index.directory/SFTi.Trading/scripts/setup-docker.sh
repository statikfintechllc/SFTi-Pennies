#!/bin/bash

# SFTi Stock Scanner - Docker Deployment Script
# Creates containerized deployment for easy distribution

set -e

# Configuration
DOCKER_COMPOSE_VERSION="3.8"
APP_NAME="sfti-scanner"
ROUTER_PORT="8080"
SERVER_PORT="3000"
WS_PORT="3001"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        print_warning "Please install Docker from https://docker.com/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        print_warning "Please install Docker Compose"
        exit 1
    fi
    
    print_status "Docker and Docker Compose are available"
}

# Create Dockerfile for router
create_router_dockerfile() {
    cat > Dockerfile.router << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install dependencies for node-ib
RUN apk add --no-cache python3 make g++

# Copy package files
COPY router/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY router/ ./
COPY scripts/router.js ./router.js

# Create logs directory
RUN mkdir -p /app/logs

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["node", "router.js"]
EOF
}

# Create Dockerfile for server
create_server_dockerfile() {
    cat > Dockerfile.server << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY server/ ./
COPY scripts/server.js ./server.js

# Copy web application
COPY dist/ ./public/

# Create logs directory
RUN mkdir -p /app/logs

# Set environment
ENV NODE_ENV=production

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF
}

# Create Docker Compose file
create_docker_compose() {
    cat > docker-compose.yml << EOF
version: '${DOCKER_COMPOSE_VERSION}'

services:
  router:
    build:
      context: .
      dockerfile: Dockerfile.router
    container_name: sfti-router
    restart: unless-stopped
    ports:
      - "${ROUTER_PORT}:8080"
    environment:
      - NODE_ENV=production
      - IBKR_HOST=host.docker.internal
      - IBKR_PORT=7497
      - IBKR_CLIENT_ID=1
      - ROUTER_PORT=8080
      - ROUTER_HOST=0.0.0.0
      - SERVER_HOST=server
      - SERVER_PORT=3000
      - LOG_LEVEL=info
      - UPDATE_INTERVAL=3000
      - MARKET_DATA_CACHE_TTL=5000
    volumes:
      - router_logs:/app/logs
      - router_data:/app/data
    networks:
      - sfti-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  server:
    build:
      context: .
      dockerfile: Dockerfile.server
    container_name: sfti-server
    restart: unless-stopped
    ports:
      - "${SERVER_PORT}:3000"
      - "${WS_PORT}:3001"
    environment:
      - NODE_ENV=production
      - SERVER_PORT=3000
      - WS_PORT=3001
      - SERVER_HOST=0.0.0.0
      - ROUTER_HOST=router
      - ROUTER_PORT=8080
      - REDIS_ENABLED=true
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=\${JWT_SECRET:-your-secure-jwt-secret-change-this}
      - CORS_ORIGIN=*
      - RATE_LIMIT_WINDOW=60000
      - RATE_LIMIT_MAX=1000
      - LOG_LEVEL=info
    volumes:
      - server_logs:/app/logs
    networks:
      - sfti-network
    depends_on:
      - router
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    container_name: sfti-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - sfti-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: sfti-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    networks:
      - sfti-network
    depends_on:
      - server
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  router_logs:
  router_data:
  server_logs:
  redis_data:
  nginx_logs:

networks:
  sfti-network:
    driver: bridge
EOF
}

# Create nginx configuration
create_nginx_config() {
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=websocket:10m rate=5r/s;
    
    upstream backend {
        server server:3000;
        keepalive 32;
    }
    
    upstream websocket {
        server server:3001;
    }
    
    server {
        listen 80;
        server_name _;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Referrer-Policy strict-origin-when-cross-origin;
        
        # API endpoints with rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # CORS headers
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Authorization, Content-Type";
            
            if ($request_method = 'OPTIONS') {
                return 204;
            }
        }
        
        # WebSocket endpoint
        location /ws {
            limit_req zone=websocket burst=10 nodelay;
            
            proxy_pass http://websocket;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket timeout settings
            proxy_read_timeout 86400;
            proxy_send_timeout 86400;
        }
        
        # Health check endpoint
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
        
        # Static files and SPA fallback
        location / {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache static assets
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
                proxy_pass http://backend;
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
    }
    
    # HTTPS server (requires SSL certificates)
    # server {
    #     listen 443 ssl http2;
    #     server_name your-domain.com;
    #     
    #     ssl_certificate /etc/nginx/ssl/cert.pem;
    #     ssl_certificate_key /etc/nginx/ssl/key.pem;
    #     ssl_protocols TLSv1.2 TLSv1.3;
    #     ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    #     ssl_prefer_server_ciphers off;
    #     
    #     # Include the same location blocks as HTTP server
    # }
}
EOF
}

# Create environment file template
create_env_template() {
    cat > .env.example << 'EOF'
# IBKR Configuration
IBKR_HOST=127.0.0.1
IBKR_PORT=7497
IBKR_CLIENT_ID=1

# Port Configuration
ROUTER_PORT=8080
SERVER_PORT=3000
WS_PORT=3001

# Security
JWT_SECRET=your-secure-jwt-secret-change-this-in-production

# Redis Configuration
REDIS_ENABLED=true
REDIS_URL=redis://redis:6379

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=1000

# CORS
CORS_ORIGIN=*
EOF
}

# Create management scripts
create_management_scripts() {
    # Start script
    cat > start-docker.sh << 'EOF'
#!/bin/bash

echo "Starting SFTi Stock Scanner (Docker)..."

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "Created .env file from template. Please review and update it."
    else
        echo "Warning: No .env file found"
    fi
fi

# Build and start services
docker-compose up -d --build

echo "Services started. Checking status..."
sleep 5

docker-compose ps

echo ""
echo "Web interface: http://localhost:3000"
echo "API health: http://localhost:3000/health"
echo "Router health: http://localhost:8080/health"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
EOF

    # Stop script
    cat > stop-docker.sh << 'EOF'
#!/bin/bash

echo "Stopping SFTi Stock Scanner (Docker)..."
docker-compose down

echo "Services stopped."
echo "To remove volumes: docker-compose down -v"
echo "To remove images: docker-compose down --rmi all"
EOF

    # Logs script
    cat > logs-docker.sh << 'EOF'
#!/bin/bash

SERVICE=${1:-}

if [ -z "$SERVICE" ]; then
    echo "Viewing logs for all services..."
    docker-compose logs -f
else
    echo "Viewing logs for $SERVICE..."
    docker-compose logs -f "$SERVICE"
fi
EOF

    # Update script
    cat > update-docker.sh << 'EOF'
#!/bin/bash

echo "Updating SFTi Stock Scanner (Docker)..."

# Pull latest images
docker-compose pull

# Rebuild and restart
docker-compose up -d --build

echo "Update complete."
EOF

    chmod +x start-docker.sh stop-docker.sh logs-docker.sh update-docker.sh
}

# Create backup script
create_backup_script() {
    cat > backup-docker.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating backup in $BACKUP_DIR..."

# Backup volumes
docker run --rm -v sfti-scanner_router_data:/data -v "$PWD/$BACKUP_DIR":/backup alpine tar czf /backup/router_data.tar.gz -C /data .
docker run --rm -v sfti-scanner_redis_data:/data -v "$PWD/$BACKUP_DIR":/backup alpine tar czf /backup/redis_data.tar.gz -C /data .

# Backup configuration
cp .env "$BACKUP_DIR/" 2>/dev/null || echo "No .env file to backup"
cp docker-compose.yml "$BACKUP_DIR/"
cp nginx.conf "$BACKUP_DIR/"

echo "Backup created: $BACKUP_DIR"
echo "To restore: ./restore-docker.sh $BACKUP_DIR"
EOF

    chmod +x backup-docker.sh
}

# Main Docker setup function
setup_docker_deployment() {
    print_header "Setting Up Docker Deployment"
    
    check_docker
    
    print_status "Creating Docker configuration files..."
    create_router_dockerfile
    create_server_dockerfile
    create_docker_compose
    create_nginx_config
    create_env_template
    create_management_scripts
    create_backup_script
    
    print_status "Docker deployment setup complete!"
    
    print_header "Docker Deployment Ready!"
    echo ""
    print_status "Files created:"
    echo "  - Dockerfile.router"
    echo "  - Dockerfile.server" 
    echo "  - docker-compose.yml"
    echo "  - nginx.conf"
    echo "  - .env.example"
    echo "  - Management scripts (start-docker.sh, stop-docker.sh, etc.)"
    echo ""
    print_status "To deploy:"
    echo "  1. Copy .env.example to .env and configure"
    echo "  2. Run: ./start-docker.sh"
    echo "  3. Access: http://localhost:3000"
    echo ""
    print_status "Management commands:"
    echo "  Start:  ./start-docker.sh"
    echo "  Stop:   ./stop-docker.sh"
    echo "  Logs:   ./logs-docker.sh [service]"
    echo "  Update: ./update-docker.sh"
    echo "  Backup: ./backup-docker.sh"
    echo ""
    print_warning "Remember to:"
    echo "  - Configure IBKR connection settings in .env"
    echo "  - Set secure JWT_SECRET in production"
    echo "  - Add SSL certificates for HTTPS"
    echo "  - Review nginx.conf for your domain"
}

# Run the setup
setup_docker_deployment