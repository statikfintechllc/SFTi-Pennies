# JavaScript Files

**📁 Location:** `/index.directory/assets/js`

## Overview

This directory contains JavaScript files that power the client-side functionality of the SFTi-Pennies trading journal. The codebase uses vanilla JavaScript (no frameworks) for maximum performance and simplicity.

## Files

### 1. `app.js`
**Main application logic and trade management**

**Size:** ~21KB  
**Lines:** ~528  

#### Purpose
Core application functionality including:
- Trade form handling and validation
- Automatic P&L calculations
- Risk:Reward ratio calculations
- Time-in-trade calculations
- Recent trades display
- Summary statistics rendering
- Chart.js integration for equity curves

#### Key Functions

**Form Management:**
```javascript
initializeForm()           // Set up form event listeners
validateForm(formData)     // Validate trade submission
calculatePnL()            // Calculate profit/loss
calculateTimeInTrade()    // Calculate duration
calculateRiskReward()     // Calculate R:R ratio
```

**Trade Display:**
```javascript
loadRecentTrades()        // Load 3 most recent trades
renderTradeCard(trade)    // Create trade card HTML
updateSummaryStats()      // Update homepage statistics
```

**Data Processing:**
```javascript
fetchTradeData()          // Load trades-index.json
processTradeData(data)    // Parse and validate data
sortTrades(trades)        // Sort by date/number
filterTrades(criteria)    // Filter trade list
```

**Charts:**
```javascript
renderEquityCurve(data)   // Create equity curve chart
updateChartData(trades)   // Update chart with new data
```

#### Dependencies
- Chart.js (via CDN)
- GitHub API (via auth.js)

### 2. `auth.js`
**Authentication and GitHub API integration**

**Size:** ~10KB  
**Lines:** ~278

#### Purpose
Handles user authentication and GitHub API operations:
- Personal Access Token (PAT) management
- localStorage token storage/retrieval
- GitHub API authentication
- File upload to repository
- Branch operations
- Commit creation

#### Key Functions

**Authentication:**
```javascript
login()                   // Initiate login flow
logout()                  // Clear authentication
checkAuth()              // Verify authentication status
getStoredToken()         // Retrieve PAT from localStorage
storeToken(token)        // Save PAT to localStorage
```

**GitHub API:**
```javascript
uploadToGitHub(content, path)  // Upload file
createBranch(branchName)       // Create new branch
commitFile(file)               // Commit single file
getRepoContents(path)          // Read repository contents
```

**Error Handling:**
```javascript
handleAuthError(error)    // Process auth errors
validateToken(token)      // Verify token format
retryRequest(request)     // Retry failed requests
```

#### Security Notes
- Tokens stored in browser localStorage
- Not encrypted (security warning shown to users)
- Only for personal use on trusted devices
- OAuth implementation planned for future

### 3. `background.js`
**Animated matrix-style background**

**Size:** ~2KB  
**Lines:** ~73

#### Purpose
Creates the animated terminal-style background effect:
- Canvas-based animation
- Matrix-style falling characters
- Performance-optimized
- Configurable parameters

#### Key Functions

```javascript
initBackground()          // Initialize canvas
drawMatrix()             // Draw matrix effect
animate()                // Animation loop
updateParticles()        // Update particle positions
```

#### Configuration
```javascript
const config = {
  fontSize: 14,
  speed: 1.5,
  density: 0.05,
  color: '#00ff88'
};
```

### 4. `bundle.min.js`
**Bundled dependencies for PDF and markdown rendering**

**Size:** ~1.5MB (minified)  
**Generated:** Via build.mjs

#### Purpose
Consolidated bundle of third-party libraries:
- PDF.js for PDF rendering
- Marked.js for markdown parsing
- Highlight.js for code syntax highlighting
- Related dependencies

#### Contents
```javascript
// PDF.js - PDF rendering
pdfjs.GlobalWorkerOptions.workerSrc = ...

// Marked - Markdown parsing
marked.setOptions({ ... })

// Highlight.js - Syntax highlighting
hljs.highlightAll()
```

#### Usage
```html
<script src="/index.directory/assets/js/bundle.min.js"></script>
```

### 5. `pdf.worker.min.mjs`
**PDF.js web worker for background PDF processing**

**Size:** ~1MB  
**Type:** ES Module

#### Purpose
Web worker for PDF.js that:
- Handles PDF parsing in background thread
- Prevents UI blocking during PDF operations
- Required for PDF.js functionality

#### Configuration
```javascript
pdfjs.GlobalWorkerOptions.workerSrc = 
  '/index.directory/assets/js/pdf.worker.min.mjs';
```

## Dependencies

### External Libraries (CDN)

**Chart.js**
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
Used for: Equity curves, performance charts

**Tailwind CSS**
```html
<script src="https://cdn.tailwindcss.com"></script>
```
Used for: Utility classes (optional)

### Bundled Libraries

- **PDF.js** v5.4.296 - PDF rendering
- **Marked** v16.4.0 - Markdown parsing
- **Highlight.js** v11.11.1 - Code highlighting
- **marked-gfm-heading-id** v4.1.2 - Heading IDs
- **marked-highlight** v2.2.2 - Code highlighting integration

## Usage

### Including Scripts

**In HTML pages:**
```html
<!-- Core functionality -->
<script src="/index.directory/assets/js/app.js"></script>
<script src="/index.directory/assets/js/auth.js"></script>
<script src="/index.directory/assets/js/background.js"></script>

<!-- For PDF/Markdown features -->
<script src="/index.directory/assets/js/bundle.min.js"></script>
```

**Load order matters:**
1. Auth.js (authentication first)
2. App.js (requires auth)
3. Background.js (visual only, can be last)
4. Bundle.js (for specific features)

### Initialization

```javascript
// On page load
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (checkAuth()) {
    // Load trades
    loadRecentTrades();
    
    // Initialize form if present
    if (document.getElementById('trade-form')) {
      initializeForm();
    }
    
    // Start background animation
    initBackground();
  }
});
```

## API Reference

### app.js Functions

**Trade Calculations:**
```javascript
// Calculate P&L for LONG position
function calculateLongPnL(entry, exit, shares) {
  const pnlUsd = (exit - entry) * shares;
  const pnlPercent = ((exit - entry) / entry) * 100;
  return { pnlUsd, pnlPercent };
}

// Calculate P&L for SHORT position
function calculateShortPnL(entry, exit, shares) {
  const pnlUsd = (entry - exit) * shares;
  const pnlPercent = ((entry - exit) / entry) * 100;
  return { pnlUsd, pnlPercent };
}

// Calculate Risk:Reward ratio
function calculateRR(entry, stop, target) {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  return reward / risk;
}
```

### auth.js Functions

**GitHub API Calls:**
```javascript
// Upload file to GitHub
async function uploadToGitHub(content, path, message) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: message,
      content: btoa(content)  // Base64 encode
    })
  });
  return response.json();
}
```

## Building

### Bundle Generation

The bundle.min.js is created using esbuild:

```bash
# Install dependencies
npm install

# Build bundle
npm run build

# Or directly
node .github/scripts/build.mjs
```

### Build Configuration

See `.github/scripts/build.mjs` for build settings:
```javascript
await esbuild.build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: 'index.directory/assets/js/bundle.min.js'
});
```

## Development

### Adding New Features

1. **Identify the right file:**
   - Trade logic → `app.js`
   - Auth/API → `auth.js`
   - Visual effects → `background.js`
   - New library → Add to bundle

2. **Write the code:**
   ```javascript
   // Add function to app.js
   function newFeature() {
     // Implementation
   }
   ```

3. **Test locally:**
   ```bash
   # Start local server
   python -m http.server 8000
   # Test in browser
   ```

4. **Document:**
   - Add JSDoc comments
   - Update this README
   - Add to API reference

### Code Style

**Naming Conventions:**
```javascript
// camelCase for functions and variables
function calculateTotal() { }
let tradeData = {};

// PascalCase for classes
class TradeManager { }

// UPPERCASE for constants
const API_BASE_URL = 'https://api.github.com';
```

**Comments:**
```javascript
/**
 * Calculate profit/loss for a trade
 * @param {number} entry - Entry price
 * @param {number} exit - Exit price
 * @param {number} shares - Position size
 * @returns {Object} P&L in USD and percentage
 */
function calculatePnL(entry, exit, shares) {
  // Implementation
}
```

## Performance

### Optimization Strategies

**Lazy Loading:**
```javascript
// Load trades only when needed
async function loadTrades() {
  if (!tradesCache) {
    tradesCache = await fetchTradeData();
  }
  return tradesCache;
}
```

**Debouncing:**
```javascript
// Debounce form calculations
const debouncedCalc = debounce(calculatePnL, 300);
input.addEventListener('input', debouncedCalc);
```

**Event Delegation:**
```javascript
// Use event delegation for dynamic content
container.addEventListener('click', (e) => {
  if (e.target.matches('.trade-card')) {
    handleTradeClick(e.target);
  }
});
```

### File Sizes
- `app.js`: ~21KB (raw), ~8KB (minified)
- `auth.js`: ~10KB (raw), ~4KB (minified)
- `background.js`: ~2KB (raw), ~1KB (minified)
- `bundle.min.js`: ~1.5MB (already minified)

## Browser Compatibility

### Required Features
- ES6+ syntax
- Fetch API
- LocalStorage
- Canvas API
- Async/await
- Modules (for bundle)

### Supported Browsers
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Chrome Mobile

### Polyfills
Not currently used, but could add:
- Fetch polyfill for older browsers
- Promise polyfill
- LocalStorage fallback

## Troubleshooting

### Common Issues

**Scripts not loading:**
1. Check file paths
2. Verify server is running
3. Check browser console for errors
4. Verify CORS settings

**Authentication failing:**
1. Check token format
2. Verify token has correct permissions
3. Check token hasn't expired
4. Review browser console

**Calculations incorrect:**
1. Verify input values
2. Check LONG vs SHORT logic
3. Test with known values
4. Review calculation functions

## Security

### Best Practices
- Never commit tokens or secrets
- Warn users about localStorage risks
- Validate all inputs
- Sanitize user data
- Use HTTPS for all API calls
- Implement rate limiting for API calls

### Known Limitations
- PAT stored in localStorage (not encrypted)
- No XSS protection (sanitization needed)
- No CSRF protection (client-side only app)
- OAuth not yet implemented

## Related Documentation

- [CSS Styles](../css/README.md)
- [Developer Guide](../../../.github/docs/README-DEV.md)
- [Build Scripts](../../../.github/scripts/README.md)

---

**Last Updated:** October 2025  
**File Count:** 5  
**Purpose:** Client-side application logic and interactivity
