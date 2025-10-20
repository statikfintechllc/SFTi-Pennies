# 🔌 Plug-and-Play Setup Guide

## Overview

This guide ensures that **SFTi-Pennies Trading Journal** works out-of-the-box when you fork it and deploy to GitHub Pages. Follow these steps to have a fully functional trading journal in under 10 minutes.

## ⚡ Quick Setup (3 Steps)

### Step 1: Fork the Repository

1. Click the **Fork** button at the top right of this repository
2. Select your GitHub account as the destination
3. Wait for the fork to complete (30 seconds)

### Step 2: Enable GitHub Pages

1. Go to your forked repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**:
   - **Branch:** `main`
   - **Folder:** `/ (root)`
4. Click **Save**
5. Wait 2-3 minutes for deployment
6. Your site will be at: `https://YOUR-USERNAME.github.io/SFTi-Pennies/`

### Step 3: Configure GitHub Actions

1. Go to **Settings** → **Actions** → **General**
2. Under **Workflow permissions**:
   - ✅ Select **Read and write permissions**
   - ✅ Check **Allow GitHub Actions to create and approve pull requests**
3. Click **Save**

✨ **That's it!** Your trading journal is now live and ready to use.

## 🎯 First Trade Setup

### Generate a GitHub Personal Access Token (PAT)

You need a PAT to submit trades from the UI:

1. Go to https://github.com/settings/tokens
2. Click **Generate new token (classic)**
3. **Name:** `Trading Journal Access`
4. **Expiration:** Choose your preference (90 days recommended)
5. **Scopes:** Select `repo` (full control of private repositories)
6. Click **Generate token**
7. **⚠️ Copy the token immediately** (you won't see it again!)

### Login and Add Your First Trade

1. Visit your deployed site: `https://YOUR-USERNAME.github.io/SFTi-Pennies/`
2. Click **Login** button (top right navigation)
3. Paste your PAT when prompted
4. Click **Authenticate**
5. Click **+ Add Trade** button
6. Fill in the trade form:
   - **Trade Number:** 1 (increment for each new trade)
   - **Ticker Symbol:** e.g., TSLA, AAPL, etc.
   - **Direction:** LONG or SHORT
   - **Entry Date/Time:** When you entered the trade
   - **Exit Date/Time:** When you exited the trade
   - **Entry Price:** Price you bought/sold at
   - **Exit Price:** Price you closed at
   - **Shares:** Number of shares traded
   - **Stop Loss:** Your risk management price
   - **Target:** Your profit target price
   - **Strategy:** Your trading strategy name
   - **Notes:** Detailed notes about the trade
   - **Screenshots:** Upload chart images (optional)
7. Click **Submit Trade**

### What Happens Next (Automatic)

1. **Trade File Created:** Your trade is saved as a markdown file in `trades/` directory
2. **GitHub Actions Triggered:** Automation pipeline starts (watch in **Actions** tab)
3. **Processing Pipeline Runs:**
   - ✅ Parses trades into JSON index
   - ✅ Generates chart data (equity curve, performance metrics)
   - ✅ Creates analytics data
   - ✅ Updates homepage with recent trades
   - ✅ Optimizes uploaded images
   - ✅ Rebuilds and redeploys site
4. **Site Updates:** After 3-5 minutes, refresh homepage to see your trade

## 📊 Analytics Setup

The analytics system is **fully automated** and works out-of-the-box:

### Available Analytics

1. **Homepage Charts:**
   - Equity Curve (cumulative P&L over time)
   - Trade Distribution (individual trade P&L)
   - Performance by Day (which days you trade best)
   - Ticker Performance (P&L by stock symbol)

2. **Analytics Page** (`/analytics.html`):
   - Performance by Strategy
   - Performance by Setup
   - Win Rate Analysis
   - Drawdown Over Time
   - Advanced metrics (expectancy, profit factor, Kelly criterion)

### How Analytics Work

All analytics are **automatically generated** when you add trades:

1. **Trade Submission:** You add a trade via UI
2. **Pipeline Processes:** GitHub Actions runs `generate_charts.py` and `generate_analytics.py`
3. **JSON Data Created:** Chart data files generated in `index.directory/assets/charts/`
4. **Frontend Displays:** JavaScript loads JSON and renders charts
5. **Real-Time Updates:** Charts update automatically with each new trade

**No manual configuration needed!**

## 🔄 Trade Import System

### CSV Import Feature

The system supports importing trades from broker CSV files:

#### Supported Brokers

- Interactive Brokers (IBKR)
- Charles Schwab / TD Ameritrade
- Robinhood
- Webull

#### Import Process

1. Go to **Trades** → **Import CSV** in navigation
2. Select your broker from dropdown
3. Upload your broker's trade export CSV
4. Click **Import Trades**
5. System automatically:
   - Parses CSV based on broker format
   - Creates individual trade files
   - Triggers pipeline to process trades
   - Updates charts and analytics

#### Export Feature

Export your trades to CSV:

1. Go to **Trades** → **Import CSV**
2. Click **Export CSV** button
3. Download your trades in standard format
4. Use for backup, analysis, or tax reporting

## 🎨 Customization (Optional)

### Change Repository Name

If you renamed your repository, update the owner in `auth.js`:

```javascript
// File: index.directory/assets/js/auth.js
// Line 20
this.owner = 'YOUR-GITHUB-USERNAME';
```

The repository name is auto-detected from URL, but owner needs to be set.

### Customize Colors

Edit `index.directory/assets/css/main.css`:

```css
:root {
  --bg-primary: #0a0e27;        /* Main background */
  --accent-green: #00ff88;       /* Primary accent */
  --accent-red: #ff4757;         /* Loss/negative */
  --accent-yellow: #ffd93d;      /* Warning/neutral */
}
```

### Modify Chart Heights

If you want different chart heights, edit the wrapper divs:

**index.html** and **analytics.html:**
```html
<!-- Change height: 400px to your desired height -->
<div style="position: relative; height: 500px; width: 100%;">
  <canvas id="chart-id"></canvas>
</div>
```

## 🐛 Troubleshooting

### Charts Not Appearing

**Symptom:** Blank chart containers or "No data available" messages

**Solutions:**
1. **No trades yet:** Add at least one trade first
2. **Pipeline still running:** Wait 3-5 minutes after trade submission
3. **Check Actions tab:** Ensure workflow completed successfully
4. **Clear cache:** Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)

### Trade Submission Fails

**Symptom:** Error when clicking "Submit Trade"

**Solutions:**
1. **Not authenticated:** Click Login and enter your PAT
2. **Invalid PAT:** Generate a new token with `repo` scope
3. **PAT expired:** Generate a new token
4. **Network issue:** Check internet connection and try again

### GitHub Actions Not Running

**Symptom:** No workflow run after trade submission

**Solutions:**
1. **Permissions not set:** Go to Settings → Actions → General
2. **Enable read/write permissions**
3. **Enable PR creation permission**
4. **Re-submit trade after fixing permissions**

### Analytics Page Shows Mock Data

**Symptom:** Analytics page shows example/dummy data

**Expected:** This is normal when no trades exist yet

**Solution:** Add real trades, and analytics will automatically update

## 📱 Mobile App Installation (PWA)

Your journal can be installed as a mobile app:

### iPhone (iOS)

1. Open site in Safari
2. Tap **Share** button (square with arrow)
3. Scroll and tap **Add to Home Screen**
4. Tap **Add**
5. App icon appears on home screen

### Android

1. Open site in Chrome
2. Tap **menu** (three dots)
3. Tap **Add to Home Screen**
4. Tap **Add**
5. App icon appears on home screen

### Features When Installed

- ✅ Launches like native app
- ✅ Full screen (no browser UI)
- ✅ Fast loading
- ✅ Home screen icon

## 🔐 Security Best Practices

### Personal Access Token (PAT)

- ⚠️ **Never commit PAT to repository**
- ⚠️ **Never share PAT publicly**
- ✅ **Store only in browser localStorage**
- ✅ **Use on trusted devices only**
- ✅ **Set expiration (90 days recommended)**
- ✅ **Regenerate if compromised**

### Token Scope

- ✅ **Minimum required:** `repo` scope
- ❌ **Avoid:** `admin:org`, `delete_repo`, etc.
- ✅ **Review permissions** before generating

## 📖 Next Steps

After setup, explore these features:

1. **📚 Books Section:** Trading education library
2. **📝 Notes Section:** Trading frameworks and strategies
3. **📊 All Trades:** View complete trade history
4. **📅 Weekly Summaries:** Performance by week
5. **📈 Analytics:** Advanced performance metrics

## 🎓 Learning Resources

Included in your journal:

- **7-Step Penny Stocking Framework:** `index.directory/SFTi.Notez/7.Step.Frame.md`
- **GSTRWT Daily Workflow:** `index.directory/SFTi.Notez/GSTRWT.md`
- **Top 5 Penny Indicators:** `index.directory/SFTi.Notez/Penny.Indicators.md`
- **Trading Education PDFs:** `index.directory/Informational.Bookz/`

## ✅ Verification Checklist

Confirm everything is working:

- [ ] Repository forked successfully
- [ ] GitHub Pages enabled and site loads
- [ ] GitHub Actions has read/write permissions
- [ ] PAT generated and stored securely
- [ ] Able to login to site
- [ ] Trade submission form accessible
- [ ] Can add and submit a test trade
- [ ] GitHub Actions workflow runs successfully
- [ ] Homepage updates with new trade (after 3-5 min)
- [ ] Charts display correctly (no infinite growth)
- [ ] Analytics page loads without errors
- [ ] Mobile responsive (test on phone)
- [ ] PWA installable (optional)

## 🆘 Getting Help

If you encounter issues:

1. **Check Documentation:** `.github/docs/` folder
2. **Review Actions Logs:** Go to Actions tab, check failed workflows
3. **Clear Browser Cache:** Hard refresh (Ctrl+Shift+R)
4. **Verify Permissions:** Settings → Actions → Workflow permissions
5. **Check Issues:** Search GitHub issues for similar problems

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ Site loads at your GitHub Pages URL
- ✅ Can login with PAT
- ✅ Can submit trades via UI
- ✅ Trades appear on homepage within 5 minutes
- ✅ Charts display with correct height (400px)
- ✅ Analytics page shows metrics
- ✅ Mobile version is responsive

---

**Congratulations!** 🎊 Your SFTi-Pennies Trading Journal is now fully operational and ready to track your trading journey to freedom! 🚀
