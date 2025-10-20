# 📚 Documentation Hub

**📁 Location:** `/.github/docs`

## Overview

This directory contains comprehensive documentation for the SFTi-Pennies trading journal system. The documentation covers everything from quick setup guides to detailed technical architecture, troubleshooting, and development guidelines.

## 📖 Documentation Categories

### 🎯 .github Directory Overview

**Parent Directory Guide:**
- [**README.git.md**](./README.git.md) - Complete `.github` directory documentation
  - GitHub-specific configuration and automation hub
  - Overview of all subdirectories (scripts, workflows, templates, docs)
  - Automation pipeline architecture
  - Community guidelines and contribution setup
  - Configuration files reference

**🎯 Start here for:** Understanding the `.github` infrastructure, automation system, and contribution workflows

---

### 🚀 Getting Started

**For New Users:**
- [**QUICKSTART.md**](./QUICKSTART.md) - Get up and running in 5 minutes
  - Enable GitHub Pages
  - Configure Actions
  - Generate PAT
  - Submit first trade

**For Developers:**
- [**README-DEV.md**](./README-DEV.md) - Complete developer documentation
  - System architecture
  - Setup instructions
  - Authentication options
  - Local development
  - Customization guide
  - Troubleshooting

### 🏗️ Architecture & Design

**System Documentation:**
- [**STRUCTURE.md**](./STRUCTURE.md) - Repository structure overview
  - Directory tree
  - File organization
  - Component relationships
  
- [**TRADE_PIPELINE.md**](./TRADE_PIPELINE.md) - Automated processing pipeline
  - Workflow triggers
  - Processing steps
  - Data transformations
  - Deployment process

**Implementation Details:**
- [**IMPLEMENTATION.md**](./IMPLEMENTATION.md) - Original system implementation
  - Features built
  - Technical stack
  - Statistics
  - Performance metrics

- [**BOOKS-NOTES-IMPLEMENTATION.md**](./BOOKS-NOTES-IMPLEMENTATION.md) - Books & Notes feature
  - PDF viewer implementation
  - Markdown renderer
  - JSON indices
  - GitHub Actions integration

### 📊 Import & Analytics

**CSV Import System:**
- [**importing.md**](./importing.md) - Complete CSV import guide
  - Supported brokers (IBKR, Schwab, Robinhood, Webull)
  - Export instructions
  - Import methods (Web, CLI, Workflow)
  - Field mapping
  - Troubleshooting

**Analytics Engine:**
- [**ANALYTICS.md**](./ANALYTICS.md) - Analytics system documentation
  - Core metrics (Expectancy, Profit Factor, Kelly Criterion)
  - Win/Loss streaks
  - Maximum drawdown
  - Tag aggregations
  - Visualization system

### 🔧 Troubleshooting & Debugging

**Debug Guides:**
- [**BUG_FIX_SUMMARY.md**](./BUG_FIX_SUMMARY.md) - Notes/Books 404 fixes
  - Jekyll configuration
  - Path resolution
  - Common issues

- [**MODAL_DEBUG_GUIDE.md**](./MODAL_DEBUG_GUIDE.md) - Modal debugging
  - Console logging features
  - Expected output examples
  - Troubleshooting steps

- [**MODAL_AND_MANIFEST_FIX_SUMMARY.md**](./MODAL_AND_MANIFEST_FIX_SUMMARY.md) - Modal visibility fixes
  - CSS structure
  - JavaScript behavior
  - Manifest consolidation

**Reference Materials:**
- [**CONSOLE_OUTPUT_EXAMPLES.md**](./CONSOLE_OUTPUT_EXAMPLES.md) - Real console outputs
  - Success cases
  - Failure cases
  - What to look for

- [**PATH_RESOLUTION_STRATEGY.md**](./PATH_RESOLUTION_STRATEGY.md) - Path handling
  - Resolution logic
  - Edge cases
  - Future considerations

- [**TESTING_CHECKLIST.md**](./TESTING_CHECKLIST.md) - Post-deployment testing
  - Verification steps
  - Success criteria
  - Troubleshooting tips

## 📋 Quick Reference

### Common Tasks

**I want to...**
- **Get started quickly** → [QUICKSTART.md](./QUICKSTART.md)
- **Understand the architecture** → [README-DEV.md](./README-DEV.md) + [STRUCTURE.md](./STRUCTURE.md)
- **Learn about the automation** → [TRADE_PIPELINE.md](./TRADE_PIPELINE.md)
- **Import trades from broker** → [importing.md](./importing.md)
- **Understand analytics metrics** → [ANALYTICS.md](./ANALYTICS.md)
- **Fix a modal issue** → [MODAL_DEBUG_GUIDE.md](./MODAL_DEBUG_GUIDE.md)
- **Debug path problems** → [PATH_RESOLUTION_STRATEGY.md](./PATH_RESOLUTION_STRATEGY.md)
- **Test after deployment** → [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

### For Different Roles

**End Users:**
1. Start: [QUICKSTART.md](./QUICKSTART.md)
2. Reference: [README-DEV.md](./README-DEV.md) (Usage sections)

**Developers:**
1. Start: [README-DEV.md](./README-DEV.md)
2. Architecture: [STRUCTURE.md](./STRUCTURE.md), [TRADE_PIPELINE.md](./TRADE_PIPELINE.md)
3. Reference: [IMPLEMENTATION.md](./IMPLEMENTATION.md), [BOOKS-NOTES-IMPLEMENTATION.md](./BOOKS-NOTES-IMPLEMENTATION.md)

**Troubleshooters:**
1. Modal issues: [MODAL_DEBUG_GUIDE.md](./MODAL_DEBUG_GUIDE.md), [MODAL_AND_MANIFEST_FIX_SUMMARY.md](./MODAL_AND_MANIFEST_FIX_SUMMARY.md)
2. Path issues: [PATH_RESOLUTION_STRATEGY.md](./PATH_RESOLUTION_STRATEGY.md), [BUG_FIX_SUMMARY.md](./BUG_FIX_SUMMARY.md)
3. Testing: [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md), [CONSOLE_OUTPUT_EXAMPLES.md](./CONSOLE_OUTPUT_EXAMPLES.md)

## 🗂️ Documentation Structure

```
.github/docs/
├── README.md                              # This file - Documentation index
│
├── 🚀 Getting Started
│   ├── QUICKSTART.md                      # 5-minute setup guide
│   └── README-DEV.md                      # Complete developer guide
│
├── 🏗️ Architecture
│   ├── STRUCTURE.md                       # Repository structure
│   ├── TRADE_PIPELINE.md                  # Automation pipeline
│   ├── IMPLEMENTATION.md                  # System implementation
│   └── BOOKS-NOTES-IMPLEMENTATION.md      # Books/Notes features
│
├── 📊 Import & Analytics
│   ├── importing.md                       # CSV import guide
│   └── ANALYTICS.md                       # Analytics documentation
│
└── 🔧 Troubleshooting
    ├── BUG_FIX_SUMMARY.md                 # 404 error fixes
    ├── MODAL_DEBUG_GUIDE.md               # Modal debugging
    ├── MODAL_AND_MANIFEST_FIX_SUMMARY.md  # Modal visibility
    ├── CONSOLE_OUTPUT_EXAMPLES.md         # Console output reference
    ├── PATH_RESOLUTION_STRATEGY.md        # Path handling
    └── TESTING_CHECKLIST.md               # Post-deployment tests
```

## 🎯 Key Features Documented

### Trade Management
- Web form submission
- Manual trade creation
- GitHub API integration
- Image upload and optimization
- Trade data structure (YAML frontmatter)

### Automation Pipeline
- GitHub Actions workflows
- Python processing scripts
- Data parsing and validation
- Summary generation
- Chart creation
- Image optimization
- Site deployment

### Content Systems
- PDF book viewer (PDF.js)
- Markdown note renderer (Marked.js)
- Syntax highlighting (Highlight.js)
- JSON indices generation
- Modal viewers

### Import & Analytics
- CSV import from 4 major brokers (IBKR, Schwab, Robinhood, Webull)
- Broker auto-detection
- Entry/exit transaction matching (FIFO)
- Trade validation and duplicate detection
- Advanced analytics engine (Expectancy, Profit Factor, Kelly Criterion)
- Win/Loss streak tracking
- Maximum drawdown calculation
- Strategy/setup/session aggregations
- Interactive Chart.js visualizations

### UI/UX
- Dark terminal theme
- Mobile-first responsive design
- PWA capabilities
- Chart visualizations
- Form calculations
- Authentication flow

## 📝 Contributing to Documentation

### Documentation Guidelines

**When adding new documentation:**

1. **Choose the right location:**
   - Getting Started → User-facing guides
   - Architecture → Technical/design docs
   - Troubleshooting → Debug/fix guides

2. **Follow naming conventions:**
   - Use UPPERCASE for main docs
   - Use descriptive names
   - Include `.md` extension

3. **Structure your document:**
   ```markdown
   # Title
   
   ## Overview
   Brief description
   
   ## Main Content
   Detailed information with examples
   
   ## Related Documentation
   Links to related docs
   ```

4. **Update this README:**
   - Add to appropriate category
   - Update quick reference
   - Update structure diagram

5. **Cross-reference:**
   - Link to related docs
   - Reference from other docs
   - Update navigation

### Best Practices

**Do's ✅**
- Use clear, concise language
- Provide examples and code snippets
- Include troubleshooting sections
- Add screenshots where helpful
- Keep docs up to date
- Test procedures before documenting
- Link to related documentation

**Don'ts ❌**
- Don't duplicate information (link instead)
- Don't use vague descriptions
- Don't forget to update the index (this file)
- Don't include sensitive information
- Don't use outdated screenshots
- Don't make assumptions about user knowledge

## 🔍 Search Tips

### Finding Information

**By Topic:**
- **Setup** → QUICKSTART.md, README-DEV.md
- **Architecture** → STRUCTURE.md, TRADE_PIPELINE.md
- **Features** → IMPLEMENTATION.md, BOOKS-NOTES-IMPLEMENTATION.md
- **Debugging** → MODAL_DEBUG_GUIDE.md, BUG_FIX_SUMMARY.md
- **Testing** → TESTING_CHECKLIST.md, CONSOLE_OUTPUT_EXAMPLES.md

**By File Type:**
- **Configuration** → README-DEV.md (setup section)
- **Scripts** → TRADE_PIPELINE.md, [scripts/README.md](../scripts/README.md)
- **Styles** → [assets/css/README.md](../../index.directory/assets/css/README.md)
- **JavaScript** → [assets/js/README.md](../../index.directory/assets/js/README.md)

**By Problem:**
- **404 errors** → BUG_FIX_SUMMARY.md, PATH_RESOLUTION_STRATEGY.md
- **Modal not showing** → MODAL_DEBUG_GUIDE.md, MODAL_AND_MANIFEST_FIX_SUMMARY.md
- **Paths not resolving** → PATH_RESOLUTION_STRATEGY.md
- **Workflow failing** → TRADE_PIPELINE.md, [workflows/README.md](../workflows/README.md)

## 🔗 Related Documentation

### In Repository
- [Root README](../../README.md) - Project overview
- [.github README](../README.md) - GitHub directory overview
- [Scripts Documentation](../scripts/README.md) - Automation scripts
- [Workflows Documentation](../workflows/README.md) - GitHub Actions
- [Templates Documentation](../templates/README.md) - Content templates

### In Application
- [Assets README](../../index.directory/assets/README.md) - Asset organization
- [CSS Documentation](../../index.directory/assets/css/README.md) - Styles
- [JavaScript Documentation](../../index.directory/assets/js/README.md) - Client-side code
- [Render Documentation](../../index.directory/render/README.md) - Content rendering

## 📊 Documentation Statistics

- **Total Documents:** 13
- **Getting Started:** 2 documents
- **Architecture:** 4 documents
- **Troubleshooting:** 6 documents
- **Reference:** 1 document (this file)

## 🔄 Maintenance

### Regular Updates
- Review docs after major changes
- Update screenshots if UI changes
- Verify all links still work
- Archive outdated debug docs
- Keep version info current

### Document Lifecycle
1. **Active** - Current, referenced documentation
2. **Archive** - Historical, rarely needed (consider moving to `/archive`)
3. **Deprecated** - Outdated, needs update or removal

### Version Control
- All docs tracked in git
- Major changes = new commit
- Use descriptive commit messages
- Document breaking changes

---

**Last Updated:** October 2025  
**Document Count:** 13  
**Purpose:** Comprehensive system documentation and guides
