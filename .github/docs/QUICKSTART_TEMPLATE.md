# 🚀 SFTi-Pennies Quick Start (Template Users)

Welcome! You're using the SFTi-Pennies trading journal template. This guide will get you up and running in **5 minutes**.

## 📋 What You Get

✅ **Automated Trading Journal** - Log trades via web form, everything else is automatic  
✅ **Beautiful GitHub Pages Site** - Live site with charts, analytics, and mobile support  
✅ **CSV Import Support** - Import trades from IBKR, Schwab, Robinhood, Webull  
✅ **Advanced Analytics** - Expectancy, profit factor, streaks, drawdowns, per-strategy stats  
✅ **Zero Maintenance** - GitHub Actions handles everything automatically  
✅ **100% Free** - Hosted on GitHub Pages, no servers, no costs  

## 🎯 Quick Start (Template Setup)

### Step 1: Use This Template

1. **Click "Use this template"** button at the top of the repository page
2. **Name your repository** (e.g., `my-trading-journal`)
3. **Make it Private** (if you want to keep trades confidential) or Public
4. **Click "Create repository from template"**

✅ Your journal is now created!

### Step 2: Enable GitHub Pages

1. Go to your new repository
2. Click **Settings** > **Pages**
3. Under "Source", select **GitHub Actions**
4. **Save**

✅ Your site will be live at: `https://yourusername.github.io/your-repo-name/`

### Step 3: Configure GitHub Actions

1. Go to **Settings** > **Actions** > **General**
2. Scroll to "Workflow permissions"
3. Select **"Read and write permissions"**
4. **Check** "Allow GitHub Actions to create and approve pull requests"
5. **Save**

✅ Automation is now enabled!

### Step 4: Get Your Personal Access Token (PAT)

The journal needs a GitHub PAT to submit trades from the web interface.

1. Go to **GitHub Settings** (your profile, not repo) > **Developer settings**
2. Click **Personal access tokens** > **Tokens (classic)**
3. Click **Generate new token (classic)**
4. **Name it:** "SFTi-Pennies Trading Journal"
5. **Expiration:** 90 days (or No expiration)
6. **Select scopes:**
   - ✅ `repo` (Full control of private repositories)
7. Click **Generate token**
8. **Copy the token** (you won't see it again!)

⚠️ **Security Note:** Never share your PAT. Store it securely. The token is only stored in your browser's localStorage.

### Step 5: Add Your First Trade

1. **Visit your live site:** `https://yourusername.github.io/your-repo-name/`
2. **Click "Login"** and paste your PAT
3. **Go to "Add Trade"**
4. **Fill out the form:**
   - Trade number: `1`
   - Ticker: `AAPL`
   - Entry/exit dates, prices, quantities
   - Strategy, broker, notes
5. **Upload screenshots** (optional)
6. **Click "Submit Trade"**

✅ Your first trade is submitted! GitHub Actions will process it in ~2-3 minutes.

### Step 6: Watch the Magic ✨

After submitting, GitHub Actions automatically:

1. ✅ Creates trade markdown file in `index.directory/SFTi.Tradez/`
2. ✅ Parses all trades into `trades-index.json`
3. ✅ Generates equity curve and distribution charts
4. ✅ Calculates statistics (win rate, P&L, drawdown)
5. ✅ Updates analytics with expectancy, streaks, per-strategy data
6. ✅ Deploys updated site to GitHub Pages

**Wait 2-3 minutes, then refresh your site** - your trade will appear!

## 📊 Importing Trades from Your Broker

### Quick Import via Web Interface

1. **Go to** `https://yourusername.github.io/your-repo-name/import.html`
2. **Upload** your broker's CSV export
3. **Select broker** (or let it auto-detect)
4. **Click "Validate"** to preview trades
5. **Click "Import"** to add them to your journal

### Supported Brokers

- ✅ Interactive Brokers (IBKR) - Flex Queries & Activity Statements
- ✅ Charles Schwab / TD Ameritrade - Transaction History
- ✅ Robinhood - Account Statements
- ✅ Webull - Transaction History

See [Importing Guide](.github/docs/importing.md) for detailed broker export instructions.

### Exporting Your Data

You can export your trades back to CSV:

1. Go to import.html
2. Click **"Export CSV"**
3. Download your complete trade history

## 📈 Viewing Analytics

Visit `https://yourusername.github.io/your-repo-name/analytics.html` to see:

- **Expectancy** - Average P&L per trade
- **Profit Factor** - Gross profit / gross loss ratio
- **Win/Loss Streaks** - Longest consecutive streaks
- **Max Drawdown** - Largest equity dip
- **Kelly Criterion** - Optimal position sizing hint
- **Performance by Strategy** - Which setups work best
- **Performance by Setup** - Tag-based breakdowns
- **Drawdown Chart** - Visualize equity curves

## 🎨 Customization

### Update Branding

Edit these files to customize your journal:

**Site Title & Branding:**
```html
<!-- index.directory/index.html -->
<a href="index.html" class="nav-brand">📈 Your Name's Journal</a>
```

**Colors & Theme:**
```css
/* index.directory/assets/css/main.css */
:root {
  --accent-green: #00ff88;  /* Change to your color */
  --accent-red: #ff4757;
  --accent-yellow: #ffd700;
}
```

**PWA Name:**
```json
// manifest.json
{
  "name": "Your Trading Journal",
  "short_name": "YourJournal"
}
```

### Add Custom Strategies

The journal supports any strategy names. Just type them in the "Strategy" field when adding trades. Common examples:

- Breakout Play
- Reversal
- VWAP Hold
- Morning Gap
- Afternoon Fade
- Dip Buy
- Short Squeeze

Analytics will automatically group performance by strategy.

## 🔒 Privacy & Security

### Keeping Your Journal Private

**Option 1: Private Repository**
- Make your repo private (Settings > General > Danger Zone > Change visibility)
- Only you can see trades and analytics
- Site is still accessible to you

**Option 2: Public Repository, Private Trades**
- Use `.gitignore` to exclude trade files from being published
- Only share charts and analytics publicly
- Keep detailed trade notes private

### PAT Security Best Practices

✅ **Do:**
- Use a PAT with minimal scopes (`repo` only)
- Set expiration dates (90 days)
- Regenerate periodically
- Store securely (password manager)

❌ **Don't:**
- Share your PAT with anyone
- Commit PAT to git
- Use PAT with excessive permissions
- Use the same PAT across multiple apps

### Future: OAuth Mode (TODO)

An OAuth flow is planned that eliminates PAT requirements. For now, PAT + localStorage is the auth mechanism.

## 🛠️ Advanced Features (TODO)

The following features are **scaffolded** but need full implementation:

### Trade Detail Pages
Individual pages for each trade with:
- Complete metadata
- Screenshot galleries (GLightbox)
- Related trades
- Performance metrics

**Status:** 🚧 Script exists (`generate_trade_pages.py`), needs full implementation

### Tagging System
Categorize trades by:
- Strategy tags (Breakout, Reversal, etc.)
- Setup tags (Morning Gap, Dip Buy, etc.)
- Session tags (Pre-market, Regular, After-hours)
- Market condition tags (Trending, Choppy, etc.)

**Status:** 🚧 UI scaffolded, schema extension needed

### Media Attachments
Upload and manage:
- Pre-trade chart screenshots
- Post-trade analysis
- Annotated images
- Video clips (future)

**Status:** 🚧 Storage structure defined, upload logic needed

## 🆘 Troubleshooting

### Site Not Updating After Trade Submission

**Check:**
1. Go to **Actions** tab in your repo
2. Look for "Trade Pipeline" workflow
3. Check if it's running or failed
4. Review logs for errors

**Common Fixes:**
- Ensure Actions has write permissions (Settings > Actions)
- Check trade markdown is valid (proper YAML frontmatter)
- Verify Python scripts have no errors

### PAT Not Working

**Check:**
1. Token hasn't expired
2. Token has `repo` scope
3. You're logged in to correct GitHub account
4. Browser localStorage is enabled

**Fix:**
- Generate a new token
- Clear browser cache and re-login

### Imports Not Working

**Check:**
1. CSV format matches broker export
2. Broker is detected correctly
3. Trades have valid entry/exit pairs

**Fix:**
- See [Importing Guide](.github/docs/importing.md)
- Try manual broker selection
- Validate CSV format

## 📚 Additional Resources

- **[Importing Guide](.github/docs/importing.md)** - Detailed CSV import instructions
- **[Implementation Docs](.github/docs/IMPLEMENTATION.md)** - Technical architecture
- **[Developer Docs](.github/docs/README-DEV.md)** - For code customization
- **[GitHub Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)** - Report bugs or request features

## 🌟 What's Next?

After you're comfortable with the basics:

1. **Import Historical Trades** - Load your past trades from broker CSVs
2. **Add Trading Notes** - Document your thought process, mistakes, wins
3. **Tag Your Trades** - Categorize by strategy, setup, market condition
4. **Review Analytics** - Identify what's working, what's not
5. **Iterate & Improve** - Use data to refine your edge
6. **Share Your Journey** - Make repo public to track progress transparently (optional)

## 🎯 Your Goal

The journal is a tool to help you:

- ✅ **Track every trade** systematically
- ✅ **Identify patterns** in wins and losses
- ✅ **Measure performance** objectively
- ✅ **Improve consistently** through data-driven insights
- ✅ **Stay accountable** to your trading plan

**Remember:** The best traders are also the best record-keepers. Let's build your edge together! 📈

---

**Questions? Stuck? Need Help?**

Open an issue: [GitHub Issues](https://github.com/statikfintechllc/SFTi-Pennies/issues)

**Happy Trading! 🚀**
