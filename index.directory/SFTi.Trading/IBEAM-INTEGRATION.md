# IBeam Integration Guide for SFTi-Pennies Trading System

## Overview

IBeam automates Interactive Brokers Client Portal Web API Gateway authentication using headless Chrome/Selenium. This provides a "clone and run" solution where users only need to provide their IBKR credentials - no OAuth setup required.

## What is IBeam?

IBeam is a tool that:
- **Automates IBKR Gateway authentication** using Selenium to inject credentials
- **Handles 2FA** including mobile authentication
- **Maintains sessions** automatically with health checks
- **Runs headlessly** via Docker with no display required
- **Zero OAuth configuration** - just username and password

## Architecture

```
User Browser (SFTi-Pennies)
    ↓
IBeam Container (Local/Server)
    ↓ (authenticates and maintains session)
IBKR Client Portal Gateway
    ↓
IBKR API
```

## Quick Start with Docker

### 1. Install Docker

```bash
# Mac/Windows: Download Docker Desktop
# Linux:
sudo apt-get update
sudo apt-get install docker.io docker-compose
```

### 2. Set Environment Variables

Create `.env` file in `SFTi.Trading/ibeam/`:

```bash
IBEAM_ACCOUNT=YOUR_IBKR_USERNAME
IBEAM_PASSWORD=YOUR_IBKR_PASSWORD
IBEAM_GATEWAY_BASE_URL=https://localhost:5000
```

### 3. Run IBeam Container

```bash
cd index.directory/SFTi.Trading/ibeam
docker-compose up -d
```

IBeam will:
1. Start IBKR Client Portal Gateway
2. Automatically inject your credentials
3. Handle 2FA (if enabled)
4. Maintain authenticated session
5. Expose Gateway API on `https://localhost:5000`

### 4. Configure Frontend

Update `index.directory/assets/js/trading.js`:

```javascript
// Change this line:
const API_BASE = 'https://cdcdyn.interactivebrokers.com/portal.proxy/v1/api';

// To this:
const API_BASE = 'https://localhost:5000/v1/api';
```

### 5. Access Trading Interface

Open `https://[your-username].github.io/SFTi-Pennies/index.directory/trading.html`

The interface will automatically use your IBeam-authenticated session!

## Configuration Options

### Basic Configuration

Edit `docker-compose.yml`:

```yaml
services:
  ibeam:
    image: voyz/ibeam
    environment:
      - IBEAM_ACCOUNT=${IBEAM_ACCOUNT}
      - IBEAM_PASSWORD=${IBEAM_PASSWORD}
      - IBEAM_GATEWAY_BASE_URL=https://localhost:5000
    ports:
      - "5000:5000"
    volumes:
      - ./data:/srv/ibeam
```

### Two-Factor Authentication

IBeam supports multiple 2FA methods:

#### Option 1: Google Messages (Default)
```yaml
environment:
  - IBEAM_TWO_FA_HANDLER=GOOGLE_MSG
```

#### Option 2: External Request
```yaml
environment:
  - IBEAM_TWO_FA_HANDLER=REQUEST
  - IBEAM_TWO_FA_NOTIFICATION_URL=https://your-server.com/notify
```

When 2FA is required, IBeam will:
1. Detect 2FA prompt
2. Wait for code entry
3. You approve on mobile
4. IBeam continues automatically

### Paper Trading Account

For testing with paper trading:

```yaml
environment:
  - IBEAM_ACCOUNT=YOUR_PAPER_ACCOUNT
  - IBEAM_GATEWAY_BASE_URL=https://localhost:5000
  - IBEAM_GATEWAY_STARTUP=--paper
```

## Advanced Setup

### Remote Server Deployment

Deploy IBeam on a VPS/cloud server:

```bash
# On your server
git clone https://github.com/Voyz/ibeam.git
cd ibeam
nano .env  # Add your credentials
docker-compose up -d
```

Then update frontend to use your server URL:
```javascript
const API_BASE = 'https://your-server.com:5000/v1/api';
```

### GitHub Actions Backend (Optional)

Create `.github/workflows/ibeam-gateway.yml`:

```yaml
name: IBeam Gateway

on:
  schedule:
    - cron: '30 13 * * 1-5'  # 9:30 AM ET weekdays
  workflow_dispatch:

jobs:
  start-gateway:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Start IBeam
        env:
          IBEAM_ACCOUNT: ${{ secrets.IBKR_USERNAME }}
          IBEAM_PASSWORD: ${{ secrets.IBKR_PASSWORD }}
        run: |
          cd index.directory/SFTi.Trading/ibeam
          docker-compose up -d
          sleep 60  # Wait for authentication
          
      - name: Health Check
        run: |
          curl -k https://localhost:5000/v1/api/iserver/auth/status
```

## Troubleshooting

### IBeam won't start
```bash
docker-compose logs ibeam
```

Common issues:
- Incorrect credentials → Check `.env` file
- 2FA timeout → Increase `IBEAM_TWO_FA_TIMEOUT_SECONDS`
- Gateway startup failed → Check IBKR maintenance schedule

### Authentication fails
```bash
# Check IBeam logs
docker logs ibeam

# Restart container
docker-compose restart ibeam
```

### Cannot connect from browser
- Ensure IBeam is running: `docker ps`
- Check port 5000 is exposed
- Verify CORS settings in Gateway
- Update `trading.js` to use correct URL

## Security Considerations

### Credentials Storage

**NEVER commit credentials to Git!**

Use environment variables:
```bash
# .env file (add to .gitignore)
IBEAM_ACCOUNT=your_username
IBEAM_PASSWORD=your_password
```

For GitHub Actions:
```bash
# Add as repository secrets
gh secret set IBKR_USERNAME
gh secret set IBKR_PASSWORD
```

### TLS Certificates

IBeam generates self-signed certificates. For production:

1. Get real TLS certificate (Let's Encrypt)
2. Mount certificate in container:
```yaml
volumes:
  - ./certs:/srv/ibeam/certs
environment:
  - IBEAM_GATEWAY_CACERT=/srv/ibeam/certs/cert.pem
```

### Network Security

- Run IBeam on private network
- Use VPN for remote access
- Enable firewall rules
- Don't expose port 5000 publicly

## Comparison: IBeam vs Browser Popup

| Feature | IBeam | Browser Popup |
|---------|-------|---------------|
| Setup | Docker + credentials | Zero setup |
| Authentication | Automated | Manual login |
| 2FA Support | Automated | Manual |
| Session Maintenance | Automatic | Browser-dependent |
| Headless Operation | Yes | No |
| Best For | Automated trading | Quick testing |

## Resources

- [IBeam GitHub](https://github.com/Voyz/ibeam)
- [IBeam Documentation](https://github.com/Voyz/ibeam/wiki)
- [IBKR Gateway API Docs](https://interactivebrokers.github.io/cpwebapi/)
- [Docker Documentation](https://docs.docker.com/)

## Support

For IBeam issues:
- [GitHub Issues](https://github.com/Voyz/ibeam/issues)
- [Discord Community](https://discord.gg/ibkr)

For SFTi-Pennies integration:
- Open issue in this repository
- Check `trading.js` for API configuration

## Quick Reference

### Start IBeam
```bash
docker-compose up -d
```

### Stop IBeam
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f ibeam
```

### Restart IBeam
```bash
docker-compose restart ibeam
```

### Check Status
```bash
curl -k https://localhost:5000/v1/api/iserver/auth/status
```
