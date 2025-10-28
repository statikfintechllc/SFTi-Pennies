# Penny Stock Scanner Demo - Product Requirements Document

A professional penny stock scanner interface demo that showcases real-time market data visualization in a clean, custom interface using simulated data.

**Experience Qualities**:
1. **Professional** - Clean, Bloomberg/TradingView-inspired interface that feels like institutional trading software
2. **Responsive** - Fast real-time updates with smooth animations and immediate feedback
3. **Intuitive** - Financial professionals can navigate without training, with familiar patterns and layouts

**Complexity Level**: Light Application (multiple features with basic state)
- Multiple data views (scanner table, charts, filters)
- Real-time simulated data updates
- Tab-based navigation for stock analysis
- Persistent user preferences and watchlists

## Essential Features

**Stock Scanner Table**
- Functionality: Display live-updating list of penny stocks with key metrics
- Purpose: Quick identification of trading opportunities based on price movements and volume
- Trigger: Default view on app load, auto-refreshes every 3 seconds
- Progression: Load → Apply filters → Sort/paginate → Select stock → Open chart tab
- Success criteria: Table updates smoothly, sorting works, data is accurate and timely

**Real-time Price Charts** 
- Functionality: TradingView-style candlestick charts with technical indicators
- Purpose: Technical analysis for selected stocks
- Trigger: Click stock ticker in table or add new tab
- Progression: Select stock → Chart loads → Apply timeframe/indicators → Analyze patterns
- Success criteria: Charts render quickly, indicators calculate correctly, data streams smoothly

**Advanced Filtering System**
- Functionality: Price range, market cap, volume, float, and change percentage filters
- Purpose: Narrow down universe to stocks meeting specific criteria
- Trigger: Open filter panel, adjust sliders/inputs
- Progression: Open filters → Set criteria → Apply → View filtered results → Save as preset
- Success criteria: Filters apply instantly, presets save/load correctly, UI stays responsive

**Market Hours Detection**
- Functionality: Visual themes and status indicators based on trading session
- Purpose: Immediate awareness of market state affecting data reliability
- Trigger: Automatic based on current time
- Progression: Check time → Apply theme → Display status → Update data frequency
- Success criteria: Correct theme loads, status updates automatically, smooth transitions

**Tab Management**
- Functionality: Multiple stock charts + scanner tab with close controls
- Purpose: Multi-stock analysis workflow
- Trigger: Click stock ticker or + button
- Progression: Click ticker → New tab opens → Switch between tabs → Close unneeded tabs
- Success criteria: Max 6 tabs enforced, tabs close cleanly, state persists between switches

## Edge Case Handling

- **No Data Available**: Show skeleton loaders and "No data" messages with refresh options
- **Network Issues**: Display cached data with timestamp and connection status indicator  
- **Invalid Symbols**: Handle unknown tickers gracefully with error messages
- **Empty Filter Results**: Show "No stocks match criteria" with suggestion to adjust filters
- **Rapid Tab Opening**: Prevent memory issues by enforcing tab limits and cleanup

## Design Direction

The design should feel like professional trading software - serious, data-dense, and highly functional. Think Bloomberg Terminal meets modern web design with clean typography and purposeful use of red/green for financial indicators. Minimal decorative elements with focus on information hierarchy and rapid data consumption.

## Color Selection

Triadic color scheme using financial industry standards with red/green indicators and professional dark theme.

- **Primary Color**: Deep Blue (#1E3A8A) - Professional, trustworthy base for headers and primary actions  
- **Secondary Colors**: Dark Gray (#374151) for panels, Light Gray (#6B7280) for muted text and borders
- **Accent Color**: Bright Blue (#3B82F6) - Call-to-action buttons and active states
- **Foreground/Background Pairings**: 
  - Background (Dark #0F172A): Light text (#F8FAFC) - Ratio 12.6:1 ✓
  - Card (Darker #1E293B): Light text (#F8FAFC) - Ratio 10.8:1 ✓  
  - Primary (Deep Blue #1E3A8A): White text (#FFFFFF) - Ratio 8.2:1 ✓
  - Success (Green #059669): White text (#FFFFFF) - Ratio 4.8:1 ✓
  - Danger (Red #DC2626): White text (#FFFFFF) - Ratio 5.9:1 ✓

## Font Selection

Typography should convey precision and clarity essential for financial data consumption. Use Inter for its excellent readability at small sizes and comprehensive number formatting.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/24px/tight letter spacing  
  - H2 (Tab Labels): Inter Semibold/16px/normal spacing
  - H3 (Table Headers): Inter Medium/14px/wide letter spacing, uppercase
  - Body (Data): Inter Regular/14px/tabular numbers for alignment
  - Small (Timestamps): Inter Regular/12px/muted color

## Animations

Subtle, performance-focused animations that enhance data comprehension without distracting from analysis. Financial applications require immediate responsiveness over decorative flourishes.

- **Purposeful Meaning**: Price change flashes (green up, red down), smooth chart updates, gentle tab transitions
- **Hierarchy of Movement**: Critical price updates get immediate animation, secondary data fades in, tab switches slide horizontally

## Component Selection

- **Components**: Table (custom financial data table), Tabs (chart management), Card (filter panels), Button (actions), Input (filter controls), Select (timeframes/indicators), Badge (market status), Skeleton (loading states)
- **Customizations**: Financial data table with sortable columns, real-time update indicators, price change animations, market hours theme system
- **States**: Price cells flash on change, buttons show loading states, connection status indicators, disabled states for market closed
- **Icon Selection**: TrendingUp/Down for changes, BarChart for analytics, Settings for configuration, X for tab close, Filter for criteria
- **Spacing**: Tight spacing (space-1, space-2) for data density, medium (space-4) for panel separation, generous (space-8) for major sections  
- **Mobile**: Responsive table with horizontal scroll, collapsible filter panel, simplified tab interface, touch-friendly controls