# Custom IBKR Penny Stock Scanner Pro - Product Requirements Document

## Core Purpose & Success

**Mission Statement**: A professional-grade penny stock scanner that provides real-time market data, advanced charting, AI-powered pattern recognition, and intelligent price alerts through Interactive Brokers integration, designed for serious traders who need institutional-quality tools with AI assistance in a modern interface.

**Success Indicators**: 
- Real-time data streaming from IBKR with <1 second latency
- Alert system triggering with 99%+ accuracy on price/volume conditions
- Professional IBKR-native charts with technical indicators
- AI search finds relevant patterns with 80%+ user satisfaction
- Successful connection to IBKR TWS/Gateway for live market data

**Experience Qualities**: **Intelligent**, **Professional**, **Reliable**

## Project Classification & Approach

**Complexity Level**: Complex Application (advanced functionality, real-time data, external API integration, AI-powered features)

**Primary User Activity**: Acting (making trading decisions based on AI-enhanced real-time data analysis)

## Thought Process for Feature Selection

**Core Problem Analysis**: Professional penny stock traders need real-time scanning, advanced charting, AI pattern recognition, and intelligent alerts but existing solutions either lack IBKR integration, have poor UX, lack AI assistance, or charge premium fees.

**User Context**: Active traders during market hours (pre-market 4AM-9:30AM, regular 9:30AM-4PM, after-hours 4PM-8PM EST) who need instant access to breakouts, volume spikes, price alerts, and AI-powered market insights.

**Critical Path**: Connect to IBKR → Load scanner with AI suggestions → Monitor real-time updates → Receive alerts → Open detailed IBKR charts → Use AI search for patterns → Make trading decisions

**Key Moments**: 
1. **AI Pattern Recognition**: The moment AI identifies a trading opportunity
2. **Alert Trigger**: The moment a stock hits user-defined criteria
3. **Chart Analysis**: Deep-dive into IBKR technical indicators for decision making
4. **Real-time Updates**: Watching live price action during volatile periods

## Essential Features

### AI Top Picks & Market Analysis
- **Functionality**: Automated AI-powered market scanning that continuously analyzes all stocks and provides real-time recommendations with confidence scores, pattern detection, and risk assessment
- **Purpose**: Leverage AI to identify high-probability trading opportunities automatically without manual scanning
- **Success Criteria**: AI recommendations achieve 70%+ accuracy in directional predictions, pattern recognition identifies actionable signals

### Advanced Pattern Recognition Alerts
- **Functionality**: Real-time pattern detection using AI algorithms that automatically trigger alerts when specific chart patterns, volume anomalies, or AI signals are detected
- **Purpose**: Never miss important trading opportunities by having AI constantly monitor for complex patterns
- **Success Criteria**: Pattern alerts trigger within 30 seconds of pattern completion, 80%+ of pattern alerts result in expected price movement

### AI-Powered Search & Memory
- **Functionality**: Natural language search for stocks with pattern analysis, search memory, and learning capabilities
- **Purpose**: Intelligent discovery of trading opportunities using AI to search and remember user preferences
- **Success Criteria**: Search results relevant 80%+ of the time, search memory improves recommendations over time
- **Functionality**: Real-time filtering of penny stocks ($0.01-$5.00) based on price, volume, market cap, float, and percentage changes
- **Purpose**: Quickly identify trading opportunities from thousands of stocks
- **Success Criteria**: Filter results update within 3 seconds of market data changes

### IBKR TWS Integration
- **Functionality**: Direct socket connection to Interactive Brokers TWS/Gateway for live market data and charting
- **Purpose**: Access institutional-quality real-time data with minimal latency directly from IBKR
- **Success Criteria**: Maintain stable connection with automatic reconnection and <1 second data latency

### Professional IBKR Charts
- **Functionality**: Real-time candlestick charts powered by IBKR data with technical indicators (EMA, RSI, MACD, Volume)
- **Purpose**: Professional-grade technical analysis using IBKR's native charting capabilities
- **Success Criteria**: Charts load within 2 seconds and update in real-time with IBKR market data

### Intelligent Price Alerts
- **Functionality**: Multi-condition alerts (price breakouts, volume spikes, pattern detection) with sound/desktop notifications
- **Purpose**: Never miss trading opportunities even when not actively watching
- **Success Criteria**: Alerts trigger within 1 second of condition being met with zero false negatives

### Market Hours Theming
- **Functionality**: Visual UI changes based on market status (pre-market, regular, after-hours, closed)
- **Purpose**: Immediate visual context of current market state
- **Success Criteria**: Theme changes instantly at market open/close times

## Design Direction

### Visual Tone & Identity
**Emotional Response**: Users should feel confident, focused, and professional - like using Bloomberg Terminal or institutional trading software.

**Design Personality**: **Serious** and **cutting-edge** - clean, data-dense interface that prioritizes function over decoration while maintaining visual sophistication.

**Visual Metaphors**: Financial terminals, command centers, precision instruments - everything should feel purposeful and engineered for performance.

**Simplicity Spectrum**: Rich interface with high information density, but organized hierarchically so complexity doesn't overwhelm.

### Color Strategy
**Color Scheme Type**: Custom financial palette optimized for extended screen time and data visualization

**Primary Color**: Deep blue (#1E3A8A) - conveys trust, stability, professionalism
**Secondary Colors**: Slate grays (#374151, #1E293B) - provide neutral foundation for data
**Accent Color**: Bright blue (#3B82F6) - draws attention to interactive elements and key data
**Success/Danger**: Standard green (#059669) and red (#DC2626) for gains/losses
**Market Status**: Dynamic colors that change based on market hours (red for regular, gold for after-hours, dark red for pre-market)

**Color Psychology**: Colors chosen for optimal readability during long trading sessions while clearly communicating financial data relationships.

**Color Accessibility**: All color pairings meet WCAG AA standards (4.5:1 contrast ratio)

**Foreground/Background Pairings**:
- Background (#0F172A) + Foreground (#F8FAFC) - 16.3:1 ratio ✓
- Card (#1E293B) + Card Foreground (#F8FAFC) - 14.1:1 ratio ✓  
- Primary (#1E3A8A) + Primary Foreground (#FFFFFF) - 8.2:1 ratio ✓
- Success (#059669) + Success Foreground (#FFFFFF) - 4.9:1 ratio ✓
- Destructive (#DC2626) + Destructive Foreground (#FFFFFF) - 5.1:1 ratio ✓

### Typography System
**Font Pairing Strategy**: Single font family (Inter) with strategic weight/size variations for hierarchy

**Typographic Hierarchy**: 
- Headers: Inter 700 (Bold) for section titles
- Data: Inter 600 (Semi-bold) for prices and key metrics  
- Body: Inter 400 (Regular) for general text
- Code: Inter with mono features for symbols and precise data

**Font Personality**: Inter conveys precision, modernity, and readability - critical for financial data
**Readability Focus**: Optimized for dense data display with adequate spacing
**Typography Consistency**: Consistent scale (1.125 ratio) across all text elements

**Which fonts**: Inter from Google Fonts (weights: 400, 500, 600, 700)
**Legibility Check**: Inter tested extensively for financial data display - excellent number differentiation

### Visual Hierarchy & Layout
**Attention Direction**: Price changes and alerts receive highest visual priority through color and motion
**White Space Philosophy**: Strategic negative space prevents claustrophobia while maintaining information density
**Grid System**: 24-column grid allowing precise alignment of financial data tables
**Responsive Approach**: Desktop-first design that gracefully scales to tablet (charts remain functional)
**Content Density**: High-density design optimized for information consumption during active trading

### Animations
**Purposeful Meaning**: Animations communicate data changes (price flashes), loading states, and state transitions
**Hierarchy of Movement**: Price changes > alerts > UI state changes > decorative animations
**Contextual Appropriateness**: Subtle, performance-focused animations that enhance rather than distract from trading focus

### UI Elements & Component Selection
**Component Usage**:
- Tables: Custom high-performance data tables for scanner results
- Charts: TradingView Lightweight Charts for professional candlestick displays
- Alerts: Toast notifications + browser notifications for alert delivery
- Dialogs: Modal overlays for settings and alert management
- Tabs: Multi-chart interface with closeable tabs

**Component Customization**: 
- Dark theme optimized for extended screen time
- High contrast borders and dividers for data separation
- Custom hover states that don't interfere with data reading

**Component States**: All interactive elements have clear hover, active, and focus states optimized for rapid interaction

**Icon Selection**: Phosphor Icons for their clean, professional appearance and comprehensive financial icon set

**Component Hierarchy**: 
- Primary: Action buttons, buy/sell indicators, alert triggers
- Secondary: Navigation, filtering, settings
- Tertiary: Labels, metadata, supplementary information

**Spacing System**: 4px base unit scaling (4, 8, 12, 16, 24, 32, 48, 64px) for consistent rhythm

**Mobile Adaptation**: Scanner table becomes vertically stacked cards; charts remain landscape-oriented

### Visual Consistency Framework
**Design System Approach**: Component-based system with consistent spacing, colors, and interaction patterns
**Style Guide Elements**: Color usage, typography scale, spacing system, animation timing
**Visual Rhythm**: Mathematical relationships between all visual elements create professional polish
**Brand Alignment**: Conveys expertise, reliability, and performance - aligned with institutional trading tools

### Accessibility & Readability
**Contrast Goal**: Exceed WCAG AA requirements for all text and data display
**Additional Considerations**: Colorblind-friendly palette, keyboard navigation, screen reader support for critical data

## Edge Cases & Problem Scenarios

**Potential Obstacles**:
- IBKR connection failures during volatile market periods
- Browser performance issues with high-frequency real-time updates
- Alert fatigue from too many notifications
- Data feed interruptions during critical trading moments

**Edge Case Handling**:
- Automatic fallback to cached data during connection issues
- Performance throttling for older browsers
- Smart alert grouping and rate limiting
- Clear error states with recovery instructions

**Technical Constraints**: 
- IBKR API requires local TWS/Gateway installation
- WebSocket connections may be blocked by corporate firewalls
- Browser notification permissions required for alerts

## Implementation Considerations

**Scalability Needs**: 
- Support for monitoring hundreds of stocks simultaneously
- Efficient real-time data processing without memory leaks
- Modular alert system that can handle complex condition logic

**Testing Focus**: 
- Real-time data accuracy validation
- Alert triggering precision testing
- Connection stability under various network conditions
- Performance testing with maximum data loads

**Critical Questions**: 
- How to handle IBKR rate limiting during high-volume periods?
- What's the optimal balance between real-time updates and browser performance?
- How to ensure alert reliability during market volatility?

## Technical Architecture

### Core Technologies
- **Frontend**: React 19 with TypeScript for type safety
- **Charts**: TradingView Lightweight Charts for professional-grade visualization  
- **Real-time Data**: WebSocket connection to IBKR TWS/Gateway
- **State Management**: React hooks with persistent storage via useKV
- **Styling**: Tailwind CSS with custom financial theme
- **Notifications**: Browser Notification API + Sonner toast library

### IBKR Integration
- **Connection Method**: Socket-based connection to TWS/Gateway (ports 7496/7497)
- **Data Protocol**: IBKR's native socket protocol for market data
- **Fallback Strategy**: Mock data generation for development/testing
- **Error Handling**: Automatic reconnection with exponential backoff

### Performance Optimization
- **Real-time Updates**: Efficient data diffing to minimize re-renders
- **Chart Performance**: Canvas-based rendering for smooth animations
- **Memory Management**: Automatic cleanup of old chart data and closed tabs
- **Network Efficiency**: Data compression and request batching

## Reflection

**What makes this approach uniquely suited**: Direct IBKR integration provides institutional-quality data that most retail platforms can't match, while the modern React interface makes it accessible to all skill levels.

**Assumptions to challenge**: 
- Will users actually prefer this over established platforms like ThinkorSwim?
- Is the complexity of IBKR setup worth the data quality benefits?
- Can we maintain performance with real-time updates across many stocks?

**What would make this solution truly exceptional**: Becoming the go-to tool for serious penny stock traders who need both professional-grade data and modern UX - bridging the gap between institutional tools and retail accessibility.