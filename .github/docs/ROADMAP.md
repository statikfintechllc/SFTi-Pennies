# SFTi-Pennies Development Roadmap

This document outlines the development roadmap for evolving SFTi-Pennies into a world-class open-source trading journal.

## Vision

Transform SFTi-Pennies into the leading open-source trading journal platform that rivals commercial solutions, with focus on:
- Advanced analytics and performance tracking
- Multi-broker support
- AI-powered insights
- Community-driven development
- Self-hosted and privacy-first

## Inspiration & References

Projects and features we're learning from:

- **[modernage12/trading-journal](https://github.com/modernage12/trading-journal)** - React/FastAPI/Postgres stack, clean UI
- **[hugodemenez/deltalytix](https://github.com/hugodemenez/deltalytix)** - Next.js + AI agents for analysis
- **[Simple-Rich-Trading-Journal](https://github.com/AUGMXNT/Simple-Rich-Trading-Journal)** - Plotly dashboards, rich visualizations
- **[Bilovodskyi/ai-trading-journal](https://github.com/Bilovodskyi/ai-trading-journal)** - AI-generated trade reports
- **[mransbro/tradingjournal](https://github.com/mransbro/tradingjournal)** - Flask minimal web interface
- **[chr-ber/TradingJournal](https://github.com/chr-ber/TradingJournal)** - C#, ByBit integration
- **[gitricko/tradenote-selfhost](https://github.com/gitricko/tradenote-selfhost)** - Self-hosted TradeNote

## Current Status (Phase 1: Scaffolding) ✅

### Completed Features

- [x] Dark terminal-style theme with Matrix background
- [x] Mobile-first PWA support
- [x] Trade markdown files with YAML frontmatter
- [x] Automated GitHub Actions pipeline
- [x] Basic analytics (win rate, P&L, equity curve)
- [x] Books and notes sections
- [x] Manual trade entry form
- [x] Authentication scaffolding (OAuth + PAT)

### In Progress (This PR)

- [x] Analytics dashboard page (analytics.html)
- [x] CSV import page (import.html)
- [x] Trade detail page (trade.html)
- [x] Advanced analytics calculation (expectancy, profit factor, drawdown)
- [x] Strategy and tag breakdowns
- [x] CSV import workflow (Robinhood MVP)
- [x] Nightly analytics regeneration
- [x] Media storage specification
- [ ] Documentation updates

## Phase 2: Enhanced Analytics (Q1 2025)

### Goals
Provide professional-grade analytics comparable to institutional trading platforms.

### Features

- [ ] **Advanced Metrics**
  - [ ] MAE (Maximum Adverse Excursion)
  - [ ] MFE (Maximum Favorable Excursion)
  - [ ] Sharpe Ratio
  - [ ] Sortino Ratio
  - [ ] Calmar Ratio
  - [ ] Risk-adjusted returns

- [ ] **Enhanced Charts**
  - [ ] Cumulative P&L with drawdown overlay
  - [ ] Monthly/weekly performance heatmaps
  - [ ] Win/loss distribution histograms
  - [ ] Time-of-day performance analysis
  - [ ] Day-of-week performance analysis
  - [ ] R-multiple distribution

- [ ] **Strategy Analysis**
  - [ ] Per-strategy performance dashboard
  - [ ] Strategy comparison charts
  - [ ] Strategy correlation matrix
  - [ ] Optimal position sizing recommendations

- [ ] **Tag Analytics**
  - [ ] Tag cloud with performance color-coding
  - [ ] Tag combination analysis
  - [ ] Tag profitability ranking

### Technical Tasks

- [ ] Enhance `generate_analytics.py` with new metrics
- [ ] Add Chart.js advanced chart types
- [ ] Create reusable chart components
- [ ] Add data export (CSV, JSON, PDF)

## Phase 3: Multi-Broker Import (Q1-Q2 2025)

### Goals
Support importing trades from major brokers automatically.

### Broker Support

- [x] **Robinhood** (MVP complete)
  - [x] CSV import
  - [ ] API integration (if available)

- [ ] **Interactive Brokers (IBKR)**
  - [ ] Flex query CSV import
  - [ ] TWS API integration
  - [ ] Activity statement parsing

- [ ] **Charles Schwab**
  - [ ] CSV export format
  - [ ] Transaction history parsing

- [ ] **TD Ameritrade**
  - [ ] ThinkorSwim export
  - [ ] API integration

- [ ] **Webull**
  - [ ] CSV export format
  - [ ] History parsing

- [ ] **E*TRADE**
  - [ ] CSV import
  - [ ] API integration

- [ ] **Fidelity**
  - [ ] Transaction export parsing

- [ ] **TradeStation**
  - [ ] CSV format support

### Technical Tasks

- [ ] Create broker adapter interface
- [ ] Implement broker-specific parsers
- [ ] Add broker detection logic
- [ ] Handle different date/time formats
- [ ] Support multiple account types (stocks, options, futures)

## Phase 4: Media & Attachments (Q2 2025)

### Goals
Rich media support for trade documentation.

### Features

- [ ] **Screenshot Management**
  - [ ] Drag-and-drop upload
  - [ ] Image optimization pipeline
  - [ ] Lightbox gallery viewer
  - [ ] Annotation tools
  - [ ] Mobile camera upload

- [ ] **Chart Integration**
  - [ ] TradingView embed support
  - [ ] StockCharts.com integration
  - [ ] Finviz screenshot automation
  - [ ] Custom chart drawing tools

- [ ] **Video Support**
  - [ ] MP4 upload and optimization
  - [ ] Trade replay videos
  - [ ] Screen recording integration
  - [ ] Video trimming/editing

- [ ] **File Attachments**
  - [ ] PDF reports
  - [ ] Trade plans
  - [ ] Broker confirmations
  - [ ] News articles/links

### Technical Tasks

- [ ] Implement media upload endpoint
- [ ] Add cloud storage support (S3, Cloudinary)
- [ ] Build image optimization pipeline
- [ ] Create media gallery component
- [ ] Mobile upload flow

## Phase 5: Enhanced UI/UX (Q2-Q3 2025)

### Goals
Modern, intuitive interface with advanced filtering and search.

### Features

- [ ] **Trade List Improvements**
  - [ ] Virtual scrolling for large datasets
  - [ ] Advanced filtering (date range, P&L, strategy, tags)
  - [ ] Sorting by any column
  - [ ] Search by ticker or notes
  - [ ] Bulk operations (tag, delete, export)

- [ ] **Trade Detail Page**
  - [ ] Rich trade view with all metrics
  - [ ] Edit in-place functionality
  - [ ] Related trades suggestions
  - [ ] Performance context (strategy average, etc.)
  - [ ] Trade notes with markdown support

- [ ] **Dashboard Customization**
  - [ ] Widget-based layout
  - [ ] Drag-and-drop dashboard builder
  - [ ] Saved dashboard presets
  - [ ] Custom metric cards

- [ ] **Dark/Light Theme**
  - [ ] Theme switcher
  - [ ] Auto-detect system preference
  - [ ] Custom color schemes

### Technical Tasks

- [ ] Implement virtual scrolling library
- [ ] Add state management (consider Redux or Zustand)
- [ ] Build reusable UI components
- [ ] Create dashboard builder
- [ ] Theme system with CSS variables

## Phase 6: Authentication & Security (Q3 2025)

### Goals
Secure, production-ready authentication and authorization.

### Features

- [ ] **OAuth Integration**
  - [ ] GitHub OAuth flow
  - [ ] Google OAuth
  - [ ] Twitter/X OAuth
  - [ ] Support for social login

- [ ] **User Management**
  - [ ] User profiles
  - [ ] Settings and preferences
  - [ ] Multi-account support
  - [ ] Team/shared journals (optional)

- [ ] **Security**
  - [ ] JWT token management
  - [ ] Refresh token rotation
  - [ ] Session management
  - [ ] CORS configuration
  - [ ] Rate limiting

- [ ] **Privacy**
  - [ ] Private journals option
  - [ ] Selective sharing
  - [ ] Export all data
  - [ ] Delete account

### Technical Tasks

- [ ] Implement OAuth server/client
- [ ] Add user database schema
- [ ] Build authentication middleware
- [ ] Create login/signup flows
- [ ] Add session management
- [ ] Implement RBAC (Role-Based Access Control)

## Phase 7: AI-Powered Features (Q4 2025)

### Goals
Leverage AI to provide insights, analysis, and automation.

### Features

- [ ] **Trade Analysis**
  - [ ] AI-generated trade summaries
  - [ ] Pattern recognition in trades
  - [ ] Success/failure factor analysis
  - [ ] Personalized recommendations

- [ ] **Chatbot Assistant**
  - [ ] Ask questions about your performance
  - [ ] Natural language queries
  - [ ] Strategy suggestions
  - [ ] Trade plan generation

- [ ] **Sentiment Analysis**
  - [ ] Analyze trade notes sentiment
  - [ ] Emotional state tracking
  - [ ] Correlation with performance

- [ ] **Predictive Analytics**
  - [ ] Win probability prediction
  - [ ] Optimal entry/exit suggestions
  - [ ] Risk assessment

### Technical Tasks

- [ ] Integrate OpenAI API or similar
- [ ] Build RAG (Retrieval Augmented Generation) system
- [ ] Create prompt templates
- [ ] Add AI configuration options
- [ ] Implement usage limits/quotas

## Phase 8: Community & Collaboration (2026)

### Goals
Build a community around trading improvement.

### Features

- [ ] **Public Profiles**
  - [ ] Optional public journal
  - [ ] Performance badges
  - [ ] Leaderboards (opt-in)

- [ ] **Social Features**
  - [ ] Follow other traders
  - [ ] Comment on trades
  - [ ] Share insights
  - [ ] Mentorship pairing

- [ ] **Learning Resources**
  - [ ] Built-in trading education
  - [ ] Strategy templates
  - [ ] Best practices guides
  - [ ] Video tutorials

- [ ] **Marketplace** (optional)
  - [ ] Strategy sharing
  - [ ] Indicator templates
  - [ ] Custom themes
  - [ ] Premium features

## Technical Debt & Maintenance

### Ongoing Tasks

- [ ] Migrate to TypeScript
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Add E2E tests with Playwright
- [ ] Performance optimization
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Internationalization (i18n)
- [ ] Mobile app (React Native or Flutter)

### Infrastructure

- [ ] Add backend API (consider FastAPI, Express, or Rails)
- [ ] Database migration (PostgreSQL or MongoDB)
- [ ] Caching layer (Redis)
- [ ] CDN for assets
- [ ] Monitoring and logging
- [ ] Automated backups

## Success Metrics

We'll measure success by:

- **User Growth**: GitHub stars, forks, active users
- **Feature Completeness**: % of roadmap completed
- **Performance**: Page load times, analytics generation speed
- **Quality**: Test coverage, bug reports, uptime
- **Community**: Contributors, issues resolved, discussions

## How to Contribute

We welcome contributions! Here's how you can help:

1. **Code**: Pick an item from the roadmap and open a PR
2. **Documentation**: Improve guides, add examples
3. **Testing**: Report bugs, test new features
4. **Design**: Suggest UI/UX improvements
5. **Ideas**: Propose new features in Issues

See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## License

This project is MIT licensed. See [LICENSE.md](../../LICENSE.md).

---

**Last Updated**: 2025-01-18

**Current Phase**: Phase 1 - Scaffolding ✅ → Phase 2 - Enhanced Analytics
