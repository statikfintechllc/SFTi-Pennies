# .github Directory

**📁 Location:** `/.github`

## Overview

This directory contains all GitHub-specific configuration, automation, templates, and documentation for the SFTi-Pennies trading journal repository. This is the command center for the automated trading journal system, containing everything needed to process trades, generate analytics, and deploy the live site.

## 🗂️ Directory Structure

```
.github/
├── agents/              # Custom Copilot agent configurations (internal)
├── assets/              # Trade screenshots and framework charts (not served publicly)
├── docs/                # Comprehensive system documentation
├── scripts/             # Automation Python and shell scripts
├── templates/           # Content templates (trades, summaries)
├── workflows/           # GitHub Actions CI/CD pipelines
├── ISSUE_TEMPLATE/      # Issue templates for bug reports and features
├── CODE_OF_CONDUCT.md   # Community guidelines
├── CONTRIBUTING.md      # Contribution guidelines
├── FUNDING.yml          # Sponsorship configuration
├── PULL_REQUEST_TEMPLATE.md  # PR template
├── SECURITY.md          # Security policy
├── copilot-instructions.md   # GitHub Copilot configuration
└── dependabot.yml       # Automated dependency updates
```

## 📚 Main Subdirectories

### [📖 docs/](./docs/README.md)
**Comprehensive Documentation Hub**

Complete guides covering every aspect of the system:
- [Quick Start Guide](./docs/QUICKSTART.md) - Get running in 5 minutes
- [Developer Documentation](./docs/README-DEV.md) - Complete technical guide
- [System Architecture](./docs/STRUCTURE.md) - Repository structure
- [Trade Pipeline](./docs/TRADE_PIPELINE.md) - Automation workflow
- [Implementation Details](./docs/IMPLEMENTATION.md) - System features
- [Troubleshooting Guides](./docs/) - Debug and fix common issues

**🎯 Start here for:** Understanding the system, development setup, troubleshooting

---

### [🤖 scripts/](./scripts/README.md)
**Automation Scripts**

Python and shell scripts that power the automated trading journal:

**Core Processing:**
- `parse_trades.py` - Extract trade data from markdown to JSON
- `generate_summaries.py` - Create weekly/monthly performance reports
- `generate_charts.py` - Generate equity curves and analytics
- `generate_index.py` - Build master trade index
- `update_homepage.py` - Ensure data accessibility

**Content Indexing:**
- `generate_books_index.py` - Index PDF trading books
- `generate_notes_index.py` - Index markdown trading notes

**Optimization:**
- `optimize_images.sh` - Compress and optimize images
- `build.mjs` - Bundle JavaScript dependencies

**🎯 Start here for:** Understanding automation, modifying scripts, troubleshooting pipeline

---

### [⚡ workflows/](./workflows/README.md)
**GitHub Actions CI/CD Pipeline**

Automated workflows that process trades and deploy the site:

**Main Pipeline:** `trade_pipeline.yml`
- Triggered on: Push to trades, assets, scripts, or manual trigger
- Steps: Parse → Index → Summarize → Chart → Optimize → Deploy
- Result: Updated site deployed to GitHub Pages automatically

**Workflow Capabilities:**
- ✅ Automatic trade processing
- ✅ Chart generation
- ✅ Image optimization
- ✅ JSON index creation
- ✅ GitHub Pages deployment
- ✅ Zero-touch operation

**🎯 Start here for:** Understanding automation flow, debugging workflow failures

---

### [📋 templates/](./templates/README.md)
**Content Templates**

Standardized templates for consistent data structure:

**Available Templates:**
- `trade.md.template` - Individual trade entry format
- `weekly-summary.md.template` - Weekly performance summary

**Template Features:**
- YAML frontmatter for structured data
- Markdown body for human-readable content
- Used by web form and automation scripts
- Ensures data consistency

**🎯 Start here for:** Creating new trades, understanding data structure

---

### [📋 ISSUE_TEMPLATE/](./ISSUE_TEMPLATE/README.md)
**Issue Templates**

Structured templates for bug reports and feature requests:
- `bug-report.md` - Bug reporting template
- `feature-request.md` - Feature request template
- `ibkr-integration.md` - IBKR integration proposals

**🎯 Start here for:** Reporting issues, requesting features

---

### [🎨 assets/](./assets/)
**Internal Asset Storage**

Raw, unoptimized assets before processing:
- Trade screenshots organized by week/day
- Framework chart examples
- Strategy diagrams
- Processed and optimized versions served from `/index.directory/assets/`

**Note:** These are NOT served directly on GitHub Pages. Optimized versions are copied to public assets directory during workflow.

---

## 📄 Configuration Files

### Community & Contribution

**[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)**
- Community guidelines and standards
- Expected behavior
- Enforcement policies

**[CONTRIBUTING.md](./CONTRIBUTING.md)**
- How to contribute to the project
- Development setup
- Pull request guidelines
- Code style standards

**[SECURITY.md](./SECURITY.md)**
- Security policy
- Vulnerability reporting
- Supported versions

**[PULL_REQUEST_TEMPLATE.md](./PULL_REQUEST_TEMPLATE.md)**
- Standard PR template
- Checklist for submissions
- Review requirements

### Development Configuration

**[copilot-instructions.md](./copilot-instructions.md)**
- GitHub Copilot configuration
- Data structure definitions
- Calculation formulas
- System architecture guidance
- Custom instructions for AI assistance

**[dependabot.yml](./dependabot.yml)**
- Automated dependency updates
- Update frequency configuration
- Package ecosystems monitored

**[FUNDING.yml](./FUNDING.yml)**
- Sponsorship configuration
- Support options

## 🚀 Quick Access

### For New Users
1. Read [Quick Start Guide](./docs/QUICKSTART.md)
2. Review [Developer Docs](./docs/README-DEV.md)
3. Explore [Trade Pipeline](./docs/TRADE_PIPELINE.md)

### For Developers
1. Check [System Architecture](./docs/STRUCTURE.md)
2. Review [Scripts Documentation](./scripts/README.md)
3. Understand [Workflow Configuration](./workflows/README.md)
4. Read [Copilot Instructions](./copilot-instructions.md)

### For Contributors
1. Read [Contributing Guidelines](./CONTRIBUTING.md)
2. Follow [Code of Conduct](./CODE_OF_CONDUCT.md)
3. Use [Issue Templates](./ISSUE_TEMPLATE/README.md)
4. Review [Security Policy](./SECURITY.md)

## 🔗 Related Documentation

### Main Repository
- [Root README](../../README.md) - Project overview
- [Trading Journal](../../index.directory/SFTi.Tradez/README.md) - Live trades
- [Trading Frameworks](../../index.directory/SFTi.Notez/README.md) - Strategies
- [Education Materials](../../index.directory/Informational.Bookz/README.md) - PDF library

### External Resources
- **[Live Site](https://statikfintechllc.github.io/SFTi-Pennies/)** - Deployed trading journal
- **[SFTi AI](https://www.sfti-ai.org)** - Main platform
- **[Ascend Institute](https://www.sfti-ai.org/ascend-institute)** - Education

## 💡 Key Concepts

### Automation Pipeline
The `.github` directory powers a fully automated system:
1. **Trade Submission** → Web form or manual markdown file
2. **Workflow Trigger** → GitHub Actions detects changes
3. **Processing** → Scripts parse, analyze, and generate content
4. **Deployment** → Updated site pushed to GitHub Pages
5. **Result** → Live site updated automatically

### Data Flow
```
Trades (Markdown) 
    ↓
Parse (Python) 
    ↓
JSON Index 
    ↓
Charts (Matplotlib)
    ↓
Summaries (Python)
    ↓
Deploy (GitHub Pages)
    ↓
Live Site
```

### Template System
All content follows standardized templates to ensure:
- ✅ Consistent data structure
- ✅ Easy parsing and processing
- ✅ Automated validation
- ✅ Clean presentation

## 🛠️ Maintenance

### Regular Tasks
- Review workflow runs for failures
- Update dependencies via Dependabot PRs
- Archive old documentation
- Optimize script performance
- Monitor GitHub Actions usage

### When to Update
- **Scripts** - When adding new features or fixing bugs
- **Workflows** - When changing automation flow
- **Templates** - When data structure changes
- **Documentation** - When features are added/changed

## 📊 Statistics

- **📁 Subdirectories:** 7 main sections
- **🤖 Scripts:** 10+ automation scripts
- **⚡ Workflows:** 1 main pipeline
- **📋 Templates:** 2 content templates
- **📖 Docs:** 13 documentation files
- **🔧 Config Files:** 6 configuration files

---

**Last Updated:** October 2025  
**Purpose:** GitHub configuration, automation, and documentation hub  
**Maintained By:** StatikFintech LLC
